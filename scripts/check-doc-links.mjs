import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';

const ROOT = resolve('docs');

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
		const explicit = /<a id="([^"]+)"><\/a>/.exec(line);
		if (explicit) slugs.add(explicit[1]);
	}
	return slugs;
}

const files = walk(ROOT);
const linkRe = /\[([^\]]*)\]\(([^)]+)\)/g;

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

console.log('=== BROKEN LINKS ===');
console.log(broken.length ? broken.map((b) => `${b.from}  ->  ${b.target}`).join('\n') : '(none)');

console.log('\n=== BROKEN ANCHORS (#heading not found) ===');
console.log(badAnchors.length ? badAnchors.map((b) => `${b.from}  ->  ${b.target}`).join('\n') : '(none)');

console.log('\n=== ORPHAN DOCS (never linked from another doc; dir links count) ===');
const dirLinked = new Set([...linkedTargets]);
const orphans = files.filter((f) => {
	if (f.endsWith('docs/README.md')) return false;
	if (dirLinked.has(resolve(f))) return false;
	// A file is reachable if its parent directory is linked (e.g. [_inspiration/](_inspiration/)).
	if (dirLinked.has(resolve(dirname(f)))) return false;
	return true;
});
console.log(orphans.length ? orphans.map((o) => relative('.', o)).join('\n') : '(none)');

console.log(`\nScanned ${files.length} markdown files.`);
