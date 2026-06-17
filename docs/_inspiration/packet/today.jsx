// today.jsx — Today view: today's packet + week strip.

function TodayView({ workout: w, weekStrip, weekDone, weekTotal, streak, showEmoji, onStart }) {
	return (
		<div className="scroll fade-in">
			<div className="scr-pad top-pad" style={{ paddingTop: 'max(22px, env(safe-area-inset-top))' }}>
				<div className="today-head">
					<div>
						<div className="eyebrow">Tue · Jun 9</div>
						<div className="screen-title" style={{ marginTop: 6 }}>
							Today
						</div>
					</div>
					<div className="streak-pill">
						<Icon name="flame" style={{ width: 15, height: 15, color: 'var(--accent)' }} />
						<span>
							<b>5</b> wk streak
						</span>
					</div>
				</div>
			</div>

			{/* Packet hero card */}
			<div className="pkt-card">
				<div className="pkt-tabs">
					<span className="pkt-tab">
						<svg
							className="staple"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.4"
							strokeLinecap="round"
						>
							<path d="M5 8v8M9 6v10M13 8v8M17 6v10" />
						</svg>
						Packet {w.packet} · {w.packetName}
					</span>
					<span className="pkt-tab-ghost">Week {w.week}</span>
					<span className="pkt-tab-ghost">Workout {w.workout}</span>
				</div>

				<h2 className="pkt-title">{w.title}</h2>

				<div className="pkt-meta">
					{w.focus.split(' · ').map((f, i) => (
						<span className="focus-chip" key={i}>
							<span className="dot" />
							{f}
						</span>
					))}
					<span className="focus-chip">
						<Icon name="timer" style={{ width: 13, height: 13 }} />~{w.estMin} min
					</span>
				</div>

				<div className="pkt-exlist">
					{w.exercises.map((ex, i) => (
						<div className="pkt-exrow" key={ex.id}>
							<span className="ix">{i + 1}</span>
							{showEmoji && <span className="em">{ex.icon}</span>}
							<span className="nm">{ex.name}</span>
							<span className="tg">
								{ex.sets}×{ex.reps}
							</span>
						</div>
					))}
				</div>

				<button className="start-btn" onClick={onStart}>
					<Icon name="play" /> Start session
				</button>
			</div>

			{/* This week strip */}
			<div className="scr-pad">
				<div className="section-label">
					<h3>This week</h3>
					<span className="count">
						{weekDone}/{weekTotal} done
					</span>
				</div>
				<div className="week-strip">
					{weekStrip.map((d, i) => (
						<div className={`wday ${d.status}`} key={i}>
							<span className="dow">{d.dow}</span>
							<span className="dn">{d.date}</span>
							<span className="ind" />
						</div>
					))}
				</div>
			</div>

			<div style={{ height: 24 }} />
		</div>
	);
}

Object.assign(window, { TodayView });
