// program.jsx — Program view, Workout editor, Exercise library sheet.

const { useState, useCallback, useRef } = React;

// ── Cat color map ────────────────────────────────────────────────
const CAT_COLOR = {
	Hinge: '#B2F042',
	Squat: '#B2F042',
	Push: '#B286FD',
	Pull: '#60C6FF',
	Lateral: '#E55733',
	Rotational: '#E55733',
	Power: '#B2F042',
	Carry: '#B286FD',
};
const WORKOUT_ACCENT = { lime: 'var(--color-lime)', lavender: 'var(--color-lavender)', red: 'var(--color-red)' };
const WORKOUT_STATUS = { wA: 'today', wB: 'scheduled', wC: 'done' };

// ── ProgramView ──────────────────────────────────────────────────
function ProgramView({ onEdit }) {
	return (
		<div className="scroll fade-in">
			<div className="scr-pad top-pad" style={{ paddingTop: 'max(22px, env(safe-area-inset-top))' }}>
				<div className="eyebrow" style={{ marginBottom: 6 }}>
					Program
				</div>
				<div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
					<div className="screen-title">
						Packet 1<span style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}> · Foundation</span>
					</div>
				</div>

				{/* Packet progress bar */}
				<div style={{ marginBottom: 28 }}>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
						<span
							style={{
								fontSize: 12,
								fontWeight: 700,
								letterSpacing: 'var(--ls-wide)',
								textTransform: 'uppercase',
								color: 'var(--color-text-secondary)',
							}}
						>
							Week progress
						</span>
						<span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-secondary)' }}>
							Wk 2 of 12
						</span>
					</div>
					<div style={{ height: 6, borderRadius: 4, background: 'var(--color-surface-3)', overflow: 'hidden' }}>
						<div
							style={{
								height: '100%',
								width: `${(2 / 12) * 100}%`,
								background: 'var(--accent)',
								borderRadius: 4,
								transition: 'width 600ms var(--ease-spring)',
							}}
						/>
					</div>
				</div>

				{/* Workout cards */}
				<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
					{PACKET_WORKOUTS.map((w) => (
						<WorkoutCard key={w.id} workout={w} status={WORKOUT_STATUS[w.id]} onEdit={() => onEdit(w)} />
					))}
				</div>

				{/* New workout button */}
				<button className="prog-new-btn" onClick={() => onEdit(null)}>
					<Icon name="plus" style={{ width: 18, height: 18 }} />
					New workout
				</button>
			</div>
			<div style={{ height: 24 }} />
		</div>
	);
}

function WorkoutCard({ workout: w, status, onEdit }) {
	const accent = WORKOUT_ACCENT[w.color] || 'var(--accent)';
	const isToday = status === 'today';
	return (
		<div className={`prog-card${isToday ? ' prog-card-today' : ''}`} style={{ '--waccent': accent }}>
			<div className="prog-card-head">
				<div className="prog-letter" style={{ background: accent, color: isToday ? '#101010' : '#101010' }}>
					{w.letter}
				</div>
				<div style={{ flex: 1, minWidth: 0 }}>
					<div
						style={{
							fontSize: 16,
							fontWeight: 700,
							letterSpacing: '-0.01em',
							display: 'flex',
							alignItems: 'center',
							gap: 8,
						}}
					>
						{w.title}
						{isToday && <span className="prog-today-badge">Today</span>}
					</div>
					<div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2, fontWeight: 500 }}>
						{w.focus}
					</div>
				</div>
				<button className="prog-edit-btn" onClick={onEdit} aria-label="Edit workout">
					<Icon name="edit" style={{ width: 16, height: 16 }} />
					Edit
				</button>
			</div>
			<div className="prog-ex-chips">
				{w.exercises.map((ex, i) => (
					<span className="prog-ex-chip" key={i}>
						{ex.name}
					</span>
				))}
			</div>
		</div>
	);
}

// ── WorkoutEditor ────────────────────────────────────────────────
function WorkoutEditor({ workout: initWorkout, onBack }) {
	const isNew = !initWorkout;
	const [workout, setWorkout] = useState(() =>
		initWorkout
			? { ...initWorkout, exercises: initWorkout.exercises.map((e, i) => ({ ...e, _key: i })) }
			: { id: 'new', letter: 'D', title: 'New Workout', focus: '', exercises: [] },
	);
	const [editingEx, setEditingEx] = useState(null); // exercise index being edited
	const [showLibrary, setShowLibrary] = useState(false);
	const [editTitle, setEditTitle] = useState(false);
	const keyRef = useRef(100);

	function moveEx(i, dir) {
		setWorkout((w) => {
			const exs = w.exercises.slice();
			const j = i + dir;
			if (j < 0 || j >= exs.length) return w;
			[exs[i], exs[j]] = [exs[j], exs[i]];
			return { ...w, exercises: exs };
		});
	}

	function removeEx(i) {
		setWorkout((w) => ({ ...w, exercises: w.exercises.filter((_, idx) => idx !== i) }));
	}

	function addEx(libEx) {
		keyRef.current++;
		setWorkout((w) => ({
			...w,
			exercises: [
				...w.exercises,
				{
					id: libEx.id,
					name: libEx.name,
					sets: libEx.defaultSets,
					reps: libEx.defaultReps,
					unit: libEx.unit,
					_key: keyRef.current,
				},
			],
		}));
		setShowLibrary(false);
	}

	function updateEx(i, sets, reps) {
		setWorkout((w) => {
			const exs = w.exercises.slice();
			exs[i] = { ...exs[i], sets, reps };
			return { ...w, exercises: exs };
		});
		setEditingEx(null);
	}

	return (
		<div className="session enter">
			{/* Header */}
			<div className="ses-top" style={{ paddingBottom: 14 }}>
				<div className="ses-bar">
					<button className="icon-btn" onClick={onBack} aria-label="Back">
						<Icon name="chevL" />
					</button>
					<div className="ses-titles" style={{ flex: 1 }}>
						{editTitle ? (
							<input
								className="editor-title-input"
								autoFocus
								value={workout.title}
								onChange={(e) => setWorkout((w) => ({ ...w, title: e.target.value }))}
								onBlur={() => setEditTitle(false)}
								onKeyDown={(e) => e.key === 'Enter' && setEditTitle(false)}
							/>
						) : (
							<div className="t" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
								{workout.title}
								<button
									style={{
										background: 'none',
										border: 'none',
										color: 'var(--color-text-muted)',
										padding: 0,
										display: 'flex',
									}}
									onClick={() => setEditTitle(true)}
									aria-label="Edit title"
								>
									<Icon name="edit" style={{ width: 15, height: 15 }} />
								</button>
							</div>
						)}
						<div className="s">
							Workout {workout.letter} · {workout.exercises.length} exercises
						</div>
					</div>
					<button className="prog-save-btn" onClick={onBack}>
						Save
					</button>
				</div>
			</div>

			<div className="scroll">
				<div style={{ padding: '4px 14px 140px', display: 'flex', flexDirection: 'column', gap: 8 }}>
					{workout.exercises.length === 0 && (
						<div className="editor-empty">
							<div style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: '32px 0' }}>
								No exercises yet — tap below to browse the library.
							</div>
						</div>
					)}

					{workout.exercises.map((ex, i) => (
						<div className="editor-row" key={ex._key ?? i}>
							{/* reorder */}
							<div className="editor-reorder">
								<button className="reorder-btn" onClick={() => moveEx(i, -1)} disabled={i === 0}>
									<Icon name="chevL" style={{ transform: 'rotate(90deg)', width: 16, height: 16 }} />
								</button>
								<button
									className="reorder-btn"
									onClick={() => moveEx(i, 1)}
									disabled={i === workout.exercises.length - 1}
								>
									<Icon name="chevL" style={{ transform: 'rotate(-90deg)', width: 16, height: 16 }} />
								</button>
							</div>
							{/* index */}
							<span className="editor-ix">{i + 1}</span>
							{/* name + sets */}
							<div style={{ flex: 1, minWidth: 0 }}>
								<div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>{ex.name}</div>
								<div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 1 }}>
									{(() => {
										const lib = EXERCISE_LIBRARY.find((l) => l.id === ex.id);
										return lib
											? lib.muscles
											: ex.unit === 'lb'
												? 'Weighted'
												: ex.unit === 'band'
													? 'Band'
													: 'Bodyweight';
									})()}
								</div>
							</div>
							{/* sets×reps tap to edit */}
							<button className="editor-sets-btn" onClick={() => setEditingEx(editingEx === i ? null : i)}>
								<span className="mono">
									{ex.sets}
									<span style={{ color: 'var(--color-text-muted)' }}>×</span>
									{ex.reps}
								</span>
								<Icon name="edit" style={{ width: 13, height: 13, color: 'var(--color-text-muted)', marginTop: 1 }} />
							</button>
							{/* delete */}
							<button className="editor-del-btn" onClick={() => removeEx(i)} aria-label="Remove">
								<Icon name="close" style={{ width: 15, height: 15 }} />
							</button>
						</div>
					))}

					{/* Inline sets/reps editor */}
					{editingEx != null && editingEx < workout.exercises.length && (
						<InlineSetEditor
							ex={workout.exercises[editingEx]}
							onSave={(s, r) => updateEx(editingEx, s, r)}
							onCancel={() => setEditingEx(null)}
						/>
					)}

					{/* Divider */}
					<div style={{ height: 1, background: 'var(--color-border)', margin: '6px 0' }} />

					{/* Add exercise */}
					<button className="editor-add-btn" onClick={() => setShowLibrary(true)}>
						<Icon name="plus" style={{ width: 18, height: 18 }} />
						Browse exercise library
					</button>
				</div>
			</div>

			{/* Library sheet */}
			{showLibrary && <ExerciseLibrary onAdd={addEx} onClose={() => setShowLibrary(false)} />}
		</div>
	);
}

// ── Inline sets/reps editor ──────────────────────────────────────
function InlineSetEditor({ ex, onSave, onCancel }) {
	const [sets, setSets] = useState(ex.sets);
	const [reps, setReps] = useState(ex.reps);
	return (
		<div className="inline-editor">
			<div
				style={{
					fontSize: 12,
					fontWeight: 700,
					letterSpacing: 'var(--ls-wide)',
					textTransform: 'uppercase',
					color: 'var(--color-text-secondary)',
					marginBottom: 12,
				}}
			>
				{ex.name}
			</div>
			<div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
				{/* Sets stepper */}
				<div className="ie-stepper">
					<div className="ie-cap">Sets</div>
					<div className="ie-row">
						<button
							className="step-btn"
							style={{ width: 38, height: 38, fontSize: 20 }}
							onClick={() => setSets((s) => Math.max(1, s - 1))}
						>
							<Icon name="minus" style={{ width: 18, height: 18 }} />
						</button>
						<span className="mono" style={{ fontSize: 26, fontWeight: 700, flex: 1, textAlign: 'center' }}>
							{sets}
						</span>
						<button
							className="step-btn"
							style={{ width: 38, height: 38, fontSize: 20 }}
							onClick={() => setSets((s) => Math.min(8, s + 1))}
						>
							<Icon name="plus" style={{ width: 18, height: 18 }} />
						</button>
					</div>
				</div>
				{/* Reps input */}
				<div className="ie-stepper">
					<div className="ie-cap">Reps / hold</div>
					<div className="ie-row">
						<input
							className="ie-reps-input"
							value={reps}
							onChange={(e) => setReps(e.target.value)}
							placeholder="e.g. 10 ea"
						/>
					</div>
				</div>
			</div>
			<div style={{ display: 'flex', gap: 8 }}>
				<button className="sheet-confirm" style={{ flex: 1 }} onClick={() => onSave(sets, reps)}>
					<Icon name="check" />
					Done
				</button>
				<button
					className="icon-btn"
					style={{ width: 50, height: 50, flexShrink: 0, background: 'var(--color-surface-3)' }}
					onClick={onCancel}
				>
					<Icon name="close" />
				</button>
			</div>
		</div>
	);
}

// ── ExerciseLibrary ──────────────────────────────────────────────
function ExerciseLibrary({ onAdd, onClose }) {
	const [cat, setCat] = useState('All');
	const [query, setQuery] = useState('');

	const filtered = EXERCISE_LIBRARY.filter((ex) => {
		const matchCat = cat === 'All' || ex.cat === cat;
		const matchQ =
			!query ||
			ex.name.toLowerCase().includes(query.toLowerCase()) ||
			ex.muscles.toLowerCase().includes(query.toLowerCase());
		return matchCat && matchQ;
	});

	return (
		<div className="sheet-back" onClick={onClose}>
			<div
				className="sheet"
				style={{ maxHeight: '85dvh', display: 'flex', flexDirection: 'column', padding: '10px 0 0' }}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="sheet-grab" style={{ margin: '0 auto 14px' }} />

				{/* Header */}
				<div style={{ padding: '0 20px 12px', flexShrink: 0 }}>
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
						<span
							style={{
								fontFamily: 'var(--font-display)',
								fontWeight: 700,
								fontSize: 20,
								letterSpacing: 'var(--ls-tight)',
							}}
						>
							Exercise Library
						</span>
						<button className="icon-btn" onClick={onClose}>
							<Icon name="close" />
						</button>
					</div>
					{/* Search */}
					<div className="lib-search">
						<Icon name="dumbbell" style={{ width: 15, height: 15, color: 'var(--color-text-muted)', flexShrink: 0 }} />
						<input
							placeholder="Search exercises or muscles…"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
						/>
					</div>
				</div>

				{/* Filter chips */}
				<div className="lib-cats" style={{ flexShrink: 0 }}>
					{LIBRARY_CATS.map((c) => (
						<button key={c} className={`lib-cat${cat === c ? ' active' : ''}`} onClick={() => setCat(c)}>
							{c}
						</button>
					))}
				</div>

				{/* Exercise list */}
				<div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px calc(16px + env(safe-area-inset-bottom))' }}>
					{filtered.length === 0 && (
						<div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)', fontSize: 13 }}>
							No exercises match.
						</div>
					)}
					<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
						{filtered.map((ex) => (
							<LibExRow key={ex.id} ex={ex} onAdd={() => onAdd(ex)} />
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

function LibExRow({ ex, onAdd }) {
	const [open, setOpen] = useState(false);
	const dot = CAT_COLOR[ex.cat] || 'var(--accent)';
	return (
		<div className={`lib-row${open ? ' lib-row-open' : ''}`}>
			<div className="lib-row-main" onClick={() => setOpen((o) => !o)}>
				<span className="lib-dot" style={{ background: dot }} />
				<div style={{ flex: 1, minWidth: 0 }}>
					<div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>{ex.name}</div>
					<div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', marginTop: 2 }}>{ex.muscles}</div>
				</div>
				<span className="lib-cat-tag" style={{ '--dt': dot }}>
					{ex.cat}
				</span>
				<span className="mono" style={{ fontSize: 12, color: 'var(--color-text-secondary)', flexShrink: 0 }}>
					{ex.defaultSets}×{ex.defaultReps}
				</span>
				<Icon
					name={open ? 'chevL' : 'chevR'}
					style={{
						width: 15,
						height: 15,
						color: 'var(--color-text-muted)',
						transform: open ? 'rotate(90deg)' : 'rotate(-90deg)',
						flexShrink: 0,
					}}
				/>
			</div>
			{open && (
				<div className="lib-row-detail">
					<div className="lib-cue">"{ex.cue}"</div>
					<button className="lib-add-btn" onClick={onAdd}>
						<Icon name="plus" style={{ width: 15, height: 15 }} />
						Add to workout
					</button>
				</div>
			)}
		</div>
	);
}

Object.assign(window, { ProgramView, WorkoutEditor, WorkoutCard, ExerciseLibrary, LibExRow, InlineSetEditor });
