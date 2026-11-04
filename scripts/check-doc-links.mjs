import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';

/*
 * The docs check. Two kinds of result:
 * - errors fail the run (exit 1): broken links and anchors, orphans, a wiki page that
 *   breaks the page rules, a setting the toggle page does not name;
 * - warnings only print: page length, big diagrams.
 *
 * Wiki pages are every page under docs/ except features/, initiatives/ and _inspiration/
 * — stories, work notes and design files have their own forms (docs/standards/project.md).
 */

const ROOT = resolve('docs');
const NOT_WIKI = ['features/', 'initiatives/', '_inspiration/'];
const ALTITUDES = new Set(['overview', 'part', 'mechanism', 'exact']);
const BANNED_HEADINGS = new Set(['overview', 'details', 'notes', 'related']);
// `Built-in` is a glossary word, not a status.
const STATUS_RE =
	/\b(Built(?!-in)|Planned|Not built|In progress|Shipped|Deferred|TBD)\b|\bv\d+\.\d+(\.\d+)?\b/;

function walk(dir) {
	const out = [];
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		if (statSync(p).isDirectory()) out.push(...walk(p));
		else if (name.endsWith('.md')) out.push(p);
	}
	return out;
}

/** Strip fenced code blocks so example links inside ``` ``` aren't treated as real links. */
function stripCodeBlocks(text) {
	return text.replace(/```[\s\S]*?```/g, '');
}

function slugify(heading) {
	return heading
		.trim()
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s/g, '-');
}

function headingSlugs(text) {
	const slugs = new Set();
	for (const line of stripCodeBlocks(text).split('\n')) {
		const m = /^#{1,6}\s+(.*)$/.exec(line);
		if (m) slugs.add(slugify(m[1]));
		// Explicit fragment targets (prefer <span id>; legacy <a id> still accepted)
		for (const explicit of line.matchAll(/<(?:a|span) id="([^"]+)"><\/(?:a|span)>/g)) {
			slugs.add(explicit[1]);
		}
	}
	return slugs;
}

/** Split `---` frontmatter from the body. Returns null fields when there is none. */
function splitFrontmatter(text) {
	const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
	if (!m) return { meta: null, body: text };
	const meta = {};
	for (const line of m[1].split('\n')) {
		const kv = /^(\w+):\s*(.*)$/.exec(line);
		if (kv) meta[kv[1]] = kv[2].replace(/^"(.*)"$/, '$1');
	}
	return { meta, body: text.slice(m[0].length) };
}

const linkRe = /\[([^\]]*)\]\(([^)]+)\)/g;

/** Relative .md / directory targets of the links in a chunk of markdown, resolved to absolute paths. */
function linkTargets(chunk, file) {
	const out = [];
	for (const m of stripCodeBlocks(chunk).matchAll(linkRe)) {
		const target = m[2].trim();
		if (/^(https?:|mailto:|#)/.test(target)) continue;
		out.push(resolve(dirname(file), target.split('#')[0]));
	}
	return out;
}

const files = walk(ROOT);
const isWiki = (f) => !NOT_WIKI.some((prefix) => relative(ROOT, f).startsWith(prefix));

const broken = [];
const badAnchors = [];
const linkedTargets = new Set();
const slugCache = new Map();

for (const file of files) {
	const text = stripCodeBlocks(readFileSync(file, 'utf8'));
	let m;
	while ((m = linkRe.exec(text))) {
		const target = m[2].trim();
		if (/^(https?:|mailto:)/.test(target)) continue;
		const [pathPart, anchor] = target.split('#');
		if (!pathPart) continue; // pure in-page anchor handled below via same-file check
		const abs = resolve(dirname(file), pathPart);
		if (!existsSync(abs)) {
			broken.push({ from: relative('.', file), target });
			continue;
		}
		linkedTargets.add(resolve(abs));
		if (anchor && abs.endsWith('.md')) {
			if (!slugCache.has(abs)) slugCache.set(abs, headingSlugs(readFileSync(abs, 'utf8')));
			if (!slugCache.get(abs).has(anchor)) {
				badAnchors.push({ from: relative('.', file), target });
			}
		}
	}
}

// --- Page rules, for wiki pages only ------------------------------------------

const pageErrors = [];
const warnings = [];
const err = (file, rule, msg) => pageErrors.push(`${relative('.', file)}  [${rule}]  ${msg}`);
const warn = (file, rule, msg) => warnings.push(`${relative('.', file)}  [${rule}]  ${msg}`);

for (const file of files.filter(isWiki)) {
	const raw = readFileSync(file, 'utf8');
	const { meta, body } = splitFrontmatter(raw);
	const isHome = file === join(ROOT, 'README.md');

	// five-parts: metadata
	if (!meta) {
		err(file, 'five-parts', 'no metadata block');
		continue;
	}
	for (const field of ['name', 'description', 'altitude']) {
		if (!meta[field]) err(file, 'five-parts', `metadata has no "${field}"`);
	}
	if (meta.altitude && !ALTITUDES.has(meta.altitude)) {
		err(
			file,
			'one-altitude',
			`altitude "${meta.altitude}" is not overview, part, mechanism, or exact`,
		);
	}
	if (!isHome && !meta.parent) err(file, 'five-parts', 'metadata has no "parent"');
	if (meta.parent && !existsSync(resolve(dirname(file), meta.parent))) {
		err(file, 'five-parts', `parent "${meta.parent}" does not exist`);
	}

	const lines = body.split('\n');
	const crumb = lines.find((l) => l.trim() !== '') ?? '';
	const crumbParts = crumb.split(' / ');
	const last = crumbParts[crumbParts.length - 1];

	// five-parts: breadcrumb
	if (/\]\(/.test(last)) err(file, 'five-parts', 'the last part of the breadcrumb is a link');
	if (crumbParts.slice(0, -1).some((p) => !/^\[[^\]]+\]\([^)]+\)$/.test(p.trim()))) {
		err(file, 'five-parts', 'breadcrumb parts must be links separated by " / "');
	}
	if (!isHome && last.trim() !== meta.name) {
		err(file, 'five-parts', `breadcrumb ends with "${last.trim()}", not the name "${meta.name}"`);
	}
	if (!isHome && meta.parent) {
		const parentLink = crumbParts.length >= 2 ? crumbParts[crumbParts.length - 2] : '';
		const href = /\]\(([^)]+)\)/.exec(parentLink)?.[1];
		if (!href || resolve(dirname(file), href) !== resolve(dirname(file), meta.parent)) {
			err(file, 'five-parts', 'the breadcrumb does not end at the parent page');
		}
	}

	// five-parts: one title, the same as name
	const noCode = stripCodeBlocks(body);
	const h1s = [...noCode.matchAll(/^# (.*)$/gm)].map((h) => h[1].trim());
	if (h1s.length !== 1) err(file, 'five-parts', `${h1s.length} level-1 headings; want 1`);
	else if (h1s[0] !== meta.name)
		err(file, 'five-parts', `title "${h1s[0]}" is not the name "${meta.name}"`);

	// language: headings that say nothing
	for (const h of noCode.matchAll(/^#{2,6} (.*)$/gm)) {
		if (BANNED_HEADINGS.has(h[1].trim().toLowerCase())) {
			err(file, 'language', `heading "${h[1].trim()}" does not tell what the section says`);
		}
	}

	// further-reading: last section, 1 to 3 links, none already in the text
	const frIndex = noCode.search(/^## Further reading\s*$/m);
	if (frIndex < 0) {
		err(file, 'further-reading', 'no "## Further reading" section');
	} else {
		const further = noCode.slice(frIndex);
		if (/^## /m.test(further.replace(/^## Further reading\s*$/m, ''))) {
			err(file, 'further-reading', '"Further reading" is not the last section');
		}
		const frLinks = linkTargets(further, file);
		if (frLinks.length < 1 || frLinks.length > 3) {
			err(file, 'further-reading', `${frLinks.length} links; want 1 to 3`);
		}
		const text = noCode.slice(noCode.indexOf(crumb) + crumb.length, frIndex);
		const inText = new Set(linkTargets(text, file));
		for (const t of frLinks) {
			if (inText.has(t))
				err(file, 'further-reading', `${relative(ROOT, t)} is already linked in the text`);
		}

		// link-once: the text links each page one time only
		const counts = new Map();
		for (const t of linkTargets(text, file)) counts.set(t, (counts.get(t) ?? 0) + 1);
		for (const [t, n] of counts) {
			if (n > 1) err(file, 'link-once', `links ${relative(ROOT, t)} ${n} times`);
		}

		// no-status: what is planned or done belongs in features/, not in a wiki page
		const prose = text
			.split('\n')
			.filter((l) => !l.trimStart().startsWith('|'))
			.join('\n');
		const status = STATUS_RE.exec(prose);
		if (status) err(file, 'no-status', `tells status or a version: "${status[0]}"`);

		// page-length: about 270 to 350 words, with no count for tables and code
		const words = prose
			.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
			.split('\n')
			.filter((l) => !/^#/.test(l))
			.join(' ')
			.match(/[\p{L}\p{N}'’-]+/gu);
		const n = words?.length ?? 0;
		// An exact page is short on purpose: its tables and contract blocks carry the content.
		const tooShort = n < 240 && meta.altitude !== 'exact';
		if (tooShort || n > 400) warn(file, 'page-length', `${n} words; aim for 270 to 400`);
	}

	// diagram: no colours or styles; 10 nodes at most
	for (const block of raw.matchAll(/```mermaid\n([\s\S]*?)```/g)) {
		if (/^\s*(classDef|class |style |linkStyle)/m.test(block[1])) {
			err(file, 'diagram', 'a diagram sets colours or styles');
		}
		const nodes = new Set(
			[
				...block[1].matchAll(/(?:^|-->|--|<-->|-\.->)\s*(?:\|[^|]*\|\s*)?([A-Za-z_]\w*)\s*[[({]/gm),
			].map((x) => x[1]),
		);
		if (nodes.size > 10) warn(file, 'diagram', `a diagram has ${nodes.size} nodes; 10 at most`);
	}
}

// --- Settings coverage ----------------------------------------------------------

/**
 * Every preference in prefsStore's DEFAULTS must be named (as `key`) on the settings object page,
 * so a new setting can't ship without the docs hearing about it.
 */
const TOGGLE_PAGE = join(ROOT, 'architecture', 'settings-object.md');
const prefsSource = readFileSync('src/lib/stores/prefs.svelte.ts', 'utf8');
const defaultsBlock = /const DEFAULTS: UserPrefs = \{([\s\S]*?)\n\};/.exec(prefsSource);
const togglePage = readFileSync(TOGGLE_PAGE, 'utf8');
const missingPrefs = defaultsBlock
	? [...defaultsBlock[1].matchAll(/^\s*(\w+):/gm)]
			.map((k) => k[1])
			.filter((key) => !togglePage.includes(`\`${key}\``))
	: ['(could not find DEFAULTS in src/lib/stores/prefs.svelte.ts — update this check)'];

// --- Report -----------------------------------------------------------------------

const orphans = files.filter((f) => {
	if (f.endsWith('docs/README.md')) return false;
	if (linkedTargets.has(resolve(f))) return false;
	// A file is reachable if its parent directory is linked (e.g. [_inspiration/](_inspiration/)).
	if (linkedTargets.has(resolve(dirname(f)))) return false;
	return true;
});

const sections = [
	['BROKEN LINKS', broken.map((b) => `${b.from}  ->  ${b.target}`)],
	['BROKEN ANCHORS (#heading not found)', badAnchors.map((b) => `${b.from}  ->  ${b.target}`)],
	[
		'ORPHAN DOCS (never linked from another doc; dir links count)',
		orphans.map((o) => relative('.', o)),
	],
	['PAGE RULES (wiki pages)', pageErrors],
	[`PREFS MISSING FROM ${relative('.', TOGGLE_PAGE)}`, missingPrefs],
	['WARNINGS (do not fail the check)', warnings],
];
for (const [title, items] of sections) {
	console.log(`=== ${title} ===`);
	console.log(items.length ? items.join('\n') : '(none)');
	console.log('');
}

const errorCount =
	broken.length + badAnchors.length + orphans.length + pageErrors.length + missingPrefs.length;
console.log(
	`Scanned ${files.length} markdown files (${files.filter(isWiki).length} wiki pages). Errors: ${errorCount}.`,
);
if (errorCount > 0) process.exitCode = 1;
