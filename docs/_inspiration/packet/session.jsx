// session.jsx — Active Session: ordered exercises, tappable set tiles,
// log bottom sheet (steppers / number-pad / instant), punchy completion.

const { useState, useEffect, useRef, useMemo } = React;

// Parse a target-reps string like "10 ea" / "30 s" / "8" into { n, suffix }.
function parseReps(r) {
	const m = String(r).match(/^(\d+)\s*(.*)$/);
	return { n: m ? parseInt(m[1], 10) : 8, suffix: m ? m[2] : '' };
}
const BANDS = ['Light', 'Med', 'Heavy'];
function vibe(ms) {
	try {
		navigator.vibrate && navigator.vibrate(ms);
	} catch (e) {}
}

function SessionView({ workout: w, loggingMode, completionLevel, showEmoji, accent, onClose, onFinish }) {
	// sets[exIdx] = array of null | { weight, reps } ; weight may be number | band string | null
	const [sets, setSets] = useState(() => w.exercises.map((ex) => Array(ex.sets).fill(null)));
	const [lastUsed, setLastUsed] = useState(() => w.exercises.map((ex) => ex.last));
	const [sheet, setSheet] = useState(null); // { exIdx, setIdx }
	const [celebrate, setCelebrate] = useState(null); // exIdx mid-celebration
	const [flash, setFlash] = useState(null); // "exIdx-setIdx"
	const [elapsed, setElapsed] = useState(0);
	const listRef = useRef(null);

	useEffect(() => {
		const id = setInterval(() => setElapsed((e) => e + 1), 1000);
		return () => clearInterval(id);
	}, []);

	const totalSets = useMemo(() => w.exercises.reduce((a, ex) => a + ex.sets, 0), [w]);
	const doneSets = sets.reduce((a, arr) => a + arr.filter(Boolean).length, 0);
	const exDone = sets.map((arr) => arr.every(Boolean));
	const allDone = doneSets === totalSets;

	const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;

	function commitSet(exIdx, setIdx, value) {
		setSets((prev) => {
			const next = prev.map((a) => a.slice());
			next[exIdx][setIdx] = value;
			// celebration if this completes the exercise
			if (next[exIdx].every(Boolean) && !prev[exIdx].every(Boolean)) {
				if (completionLevel !== 'subtle') {
					setCelebrate(exIdx);
					vibe([12, 40, 18]);
					setTimeout(() => setCelebrate((c) => (c === exIdx ? null : c)), 650);
				}
			} else {
				vibe(10);
			}
			return next;
		});
		setLastUsed((prev) => {
			const n = prev.slice();
			n[exIdx] = value.weight;
			return n;
		});
	}

	function tileTap(exIdx, setIdx) {
		const ex = w.exercises[exIdx];
		const already = sets[exIdx][setIdx];
		// Instant mode: first tap logs the pre-filled value, no sheet.
		if (loggingMode === 'instant' && !already) {
			const { n } = parseReps(ex.reps);
			commitSet(exIdx, setIdx, { weight: lastUsed[exIdx], reps: n });
			const key = `${exIdx}-${setIdx}`;
			setFlash(key);
			setTimeout(() => setFlash((f) => (f === key ? null : f)), 280);
			return;
		}
		setSheet({ exIdx, setIdx });
	}

	function tileLabel(ex, val) {
		if (ex.unit === 'band') return val.weight;
		if (ex.unit === 'bw') return val.reps;
		return val.weight;
	}
	function tileUnit(ex, val) {
		const { suffix } = parseReps(ex.reps);
		if (ex.unit === 'bw') return suffix || 'reps';
		return `×${val.reps}`;
	}

	return (
		<div className="session enter">
			{/* Header */}
			<div className="ses-top">
				<div className="ses-bar">
					<button className="icon-btn" onClick={onClose} aria-label="Back">
						<Icon name="chevL" />
					</button>
					<div className="ses-titles">
						<div className="t">
							Workout {w.workout} · {w.title}
						</div>
						<div className="s">
							Packet {w.packet} · Week {w.week}
						</div>
					</div>
					<div className="ses-timer">
						<span className="lbl">Elapsed</span>
						<span className="mono">{mmss}</span>
					</div>
				</div>
				<div className="ses-progress">
					<i style={{ width: `${(doneSets / totalSets) * 100}%` }} />
				</div>
			</div>

			{/* Exercise list */}
			<div className="scroll" ref={listRef}>
				<div className="ses-list">
					{w.exercises.map((ex, ei) => {
						const arr = sets[ei];
						const nDone = arr.filter(Boolean).length;
						const complete = exDone[ei];
						return (
							<div
								key={ex.id}
								className={`ex-card${complete ? ' complete' : ''}${celebrate === ei ? ' ex-celebrate' : ''}`}
							>
								<div className="ex-head">
									{showEmoji ? (
										<div className="ex-emoji">{ex.icon}</div>
									) : (
										<div className={`ex-ring${complete ? ' complete' : ''}`}>
											<ProgressRing done={nDone} total={ex.sets} complete={complete} />
											<span className="pct">{complete ? '✓' : `${nDone}/${ex.sets}`}</span>
										</div>
									)}
									<div className="ex-info">
										<div className="ex-name">
											{ex.name}
											<Icon name="check" className="chk" />
										</div>
										<div className="ex-cue">{ex.cue}</div>
									</div>
									<div className="ex-target">
										<div className="v">
											{ex.sets}×{ex.reps}
										</div>
										<div className="l">{ex.unit === 'lb' ? 'target' : ex.unit === 'band' ? 'band' : 'hold'}</div>
									</div>
								</div>

								<div className="set-row">
									{arr.map((val, si) => {
										const isFlash = flash === `${ei}-${si}`;
										return (
											<button
												key={si}
												className={`set-tile${val ? ' done' : ''}${isFlash ? ' flash' : ''}`}
												onClick={() => tileTap(ei, si)}
											>
												{val ? (
													<>
														<span className="setn">Set {si + 1}</span>
														<span className="w">{tileLabel(ex, val)}</span>
														<span className="r">{tileUnit(ex, val)}</span>
													</>
												) : (
													<>
														<span className="plus">+</span>
														<span className="setn">Set {si + 1}</span>
													</>
												)}
											</button>
										);
									})}
								</div>
							</div>
						);
					})}
					<div
						style={{
							textAlign: 'center',
							color: 'var(--color-text-muted)',
							fontSize: 12,
							padding: '14px 0 4px',
							letterSpacing: '0.08em',
							textTransform: 'uppercase',
							fontWeight: 700,
						}}
					>
						End of Workout {w.workout}
					</div>
				</div>
			</div>

			{/* Finish bar */}
			<div className="finish-bar">
				<button
					className={`finish-btn${allDone ? '' : ' muted'}`}
					onClick={() => onFinish({ doneSets, totalSets, elapsed, exDoneCount: exDone.filter(Boolean).length })}
				>
					{allDone ? (
						<>
							<Icon name="flag" style={{ width: 18, height: 18 }} /> Finish session
						</>
					) : (
						`Finish early · ${doneSets}/${totalSets} sets`
					)}
				</button>
			</div>

			{/* Log sheet */}
			{sheet && (
				<LogSheet
					ex={w.exercises[sheet.exIdx]}
					setIdx={sheet.setIdx}
					mode={loggingMode === 'pad' ? 'pad' : 'steppers'}
					existing={sets[sheet.exIdx][sheet.setIdx]}
					prefillWeight={lastUsed[sheet.exIdx]}
					onClose={() => setSheet(null)}
					onSave={(value) => {
						commitSet(sheet.exIdx, sheet.setIdx, value);
						setSheet(null);
					}}
				/>
			)}
		</div>
	);
}

// ── Log bottom sheet ────────────────────────────────────────────
function LogSheet({ ex, setIdx, mode, existing, prefillWeight, onClose, onSave }) {
	const { n: defReps, suffix } = parseReps(ex.reps);
	const init = existing || { weight: prefillWeight, reps: defReps };
	const [weight, setWeight] = useState(init.weight);
	const [reps, setReps] = useState(init.reps);
	const [padField, setPadField] = useState(ex.unit === 'lb' ? 'weight' : 'reps');
	const [padStr, setPadStr] = useState('');

	const isLb = ex.unit === 'lb';
	const isBand = ex.unit === 'band';
	const isBw = ex.unit === 'bw';

	function bumpWeight(d) {
		if (isBand) {
			const i = Math.max(0, Math.min(BANDS.length - 1, BANDS.indexOf(weight) + d));
			setWeight(BANDS[i]);
		} else {
			setWeight((wt) => Math.max(0, (typeof wt === 'number' ? wt : 0) + d * 5));
		}
	}

	// number pad
	function padPress(k) {
		if (k === 'del') {
			setPadStr((s) => s.slice(0, -1));
			return;
		}
		if (k === 'next') {
			applyPad();
			setPadField((f) => (f === 'weight' ? 'reps' : 'weight'));
			setPadStr('');
			return;
		}
		if (padStr.length >= 4) return;
		setPadStr((s) => s + k);
	}
	function applyPad() {
		if (padStr === '') return;
		const v = parseInt(padStr, 10);
		if (padField === 'weight') setWeight(v);
		else setReps(v);
	}
	const padWeight = padField === 'weight' && padStr !== '' ? padStr : isLb ? weight : isBand ? weight : '—';
	const padReps = padField === 'reps' && padStr !== '' ? padStr : reps;

	function save() {
		if (mode === 'pad' && padStr !== '') applyPad();
		const finalWeight = isBw ? 'BW' : weight;
		const finalReps =
			mode === 'pad' && padField === 'reps' && padStr !== ''
				? parseInt(padStr, 10)
				: mode === 'pad' && padField === 'weight' && padStr !== ''
					? reps
					: reps;
		onSave({ weight: finalWeight, reps: finalReps });
	}

	return (
		<div className="sheet-back" onClick={onClose}>
			<div className="sheet" onClick={(e) => e.stopPropagation()}>
				<div className="sheet-grab" />
				<div className="sheet-head">
					<span className="nm">{ex.name}</span>
					<span className="st">Set {setIdx + 1}</span>
				</div>
				<div className="sheet-prev">
					{ex.last != null ? (
						<>
							Last time · <b>{isBand ? ex.last : `${ex.last}${isLb ? ' lb' : ''}`}</b> × {defReps}
							{suffix ? ' ' + suffix : ''}
						</>
					) : (
						<>
							Target ·{' '}
							<b>
								{defReps}
								{suffix ? ' ' + suffix : ''}
							</b>{' '}
							· bodyweight
						</>
					)}
				</div>

				{mode === 'steppers' ? (
					<div className="stepper-grp">
						{!isBw && (
							<div className="stepper">
								<div className="cap">{isBand ? 'Band' : 'Weight'}</div>
								<div className="row">
									<button className="step-btn" onClick={() => bumpWeight(-1)}>
										<Icon name="minus" style={{ width: 22, height: 22 }} />
									</button>
									<div className="step-val">
										<div className="n">{isBand ? weight : weight}</div>
										<div className="u">{isBand ? 'level' : 'lb'}</div>
									</div>
									<button className="step-btn" onClick={() => bumpWeight(1)}>
										<Icon name="plus" style={{ width: 22, height: 22 }} />
									</button>
								</div>
							</div>
						)}
						<div className="stepper">
							<div className="cap">{suffix === 's' ? 'Hold' : 'Reps'}</div>
							<div className="row">
								<button className="step-btn" onClick={() => setReps((r) => Math.max(0, r - (suffix === 's' ? 5 : 1)))}>
									<Icon name="minus" style={{ width: 22, height: 22 }} />
								</button>
								<div className="step-val">
									<div className="n">{reps}</div>
									<div className="u">{suffix === 's' ? 'sec' : suffix === 'ea' ? 'each' : 'reps'}</div>
								</div>
								<button className="step-btn" onClick={() => setReps((r) => r + (suffix === 's' ? 5 : 1))}>
									<Icon name="plus" style={{ width: 22, height: 22 }} />
								</button>
							</div>
						</div>
					</div>
				) : (
					<>
						<div className="pad-field">
							{!isBw && (
								<div
									className={`pad-slot${padField === 'weight' ? ' active' : ''}`}
									onClick={() => {
										applyPad();
										setPadField('weight');
										setPadStr('');
									}}
								>
									<div className="l">{isBand ? 'Band' : 'Weight (lb)'}</div>
									<div className="v">{padWeight}</div>
								</div>
							)}
							<div
								className={`pad-slot${padField === 'reps' ? ' active' : ''}`}
								onClick={() => {
									applyPad();
									setPadField('reps');
									setPadStr('');
								}}
							>
								<div className="l">{suffix === 's' ? 'Hold (s)' : 'Reps'}</div>
								<div className="v">{padReps}</div>
							</div>
						</div>
						<div className="pad">
							{['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => (
								<button key={k} className="pad-key" onClick={() => padPress(k)}>
									{k}
								</button>
							))}
							<button className="pad-key fn" onClick={() => padPress('del')}>
								Del
							</button>
							<button className="pad-key" onClick={() => padPress('0')}>
								0
							</button>
							<button className="pad-key fn" onClick={() => padPress('next')}>
								Next
							</button>
						</div>
					</>
				)}

				<button className="sheet-confirm" onClick={save}>
					<Icon name="check" /> Log set {setIdx + 1}
				</button>
			</div>
		</div>
	);
}

Object.assign(window, { SessionView, LogSheet });
