// calendar.jsx — full-month calendar with training status + day summary.

const DOW_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function CalendarView({ training, dayLog, monthLabel, monthStartDow, daysInMonth, todayDate }) {
	const [openDay, setOpenDay] = React.useState(null);

	// Monday-first grid. monthStartDow: 0=Sun..6=Sat.
	const lead = (monthStartDow + 6) % 7;
	const cells = [];
	for (let i = 0; i < lead; i++) cells.push(null);
	for (let d = 1; d <= daysInMonth; d++) cells.push(d);

	const doneDays = Object.entries(training).filter(([, v]) => v.status === 'done');
	const scheduledCount = Object.values(training).filter(
		(v) => v.status === 'scheduled' || v.status === 'today',
	).length;
	const totalVolume = doneDays.reduce((a, [, v]) => a + (v.volume || 0), 0);

	return (
		<div className="scroll fade-in">
			<div
				className="scr-pad top-pad"
				style={{ paddingTop: 'max(22px, env(safe-area-inset-top))' }}
			>
				<div
					className="eyebrow"
					style={{ marginBottom: 6 }}
				>
					History
				</div>
				<div className="cal-head">
					<div className="cal-month">{monthLabel}</div>
					<div className="cal-nav">
						<button
							className="icon-btn"
							aria-label="Previous month"
						>
							<Icon name="chevL" />
						</button>
						<button
							className="icon-btn"
							aria-label="Next month"
						>
							<Icon name="chevR" />
						</button>
					</div>
				</div>

				{/* Month stats */}
				<div className="cal-stats">
					<div className="stat-box">
						<div className="v accent">
							{doneDays.length}
							<small> / {doneDays.length + scheduledCount}</small>
						</div>
						<div className="l">Sessions done</div>
					</div>
					<div className="stat-box">
						<div className="v">
							{(totalVolume / 1000).toFixed(1)}
							<small>k lb</small>
						</div>
						<div className="l">Volume lifted</div>
					</div>
					<div className="stat-box">
						<div className="v">
							5<small> wk</small>
						</div>
						<div className="l">Current streak</div>
					</div>
				</div>

				{/* Calendar grid */}
				<div className="cal-dows">
					{DOW_LABELS.map((d, i) => (
						<span key={i}>{d}</span>
					))}
				</div>
				<div className="cal-grid">
					{cells.map((d, i) => {
						if (d == null)
							return (
								<div
									key={i}
									className="cal-cell empty"
								/>
							);
						const t = training[d];
						const status = d === todayDate ? 'today' : t ? t.status : 'rest';
						const tappable = status === 'done';
						return (
							<div
								key={i}
								className={`cal-cell ${status}${tappable ? ' tappable' : ''}`}
								onClick={tappable ? () => setOpenDay(d) : undefined}
							>
								<span className="d">{d}</span>
								<span className="mk" />
							</div>
						);
					})}
				</div>

				{/* Legend */}
				<div className="cal-legend">
					<span className="leg">
						<span className="sw done" />
						Completed
					</span>
					<span className="leg">
						<span className="sw scheduled" />
						Scheduled
					</span>
					<span className="leg">
						<span className="sw skipped" />
						Skipped
					</span>
					<span className="leg">
						<span className="sw rest" />
						Rest
					</span>
				</div>
			</div>

			<div style={{ height: 24 }} />

			{openDay != null && (
				<DaySummary
					date={openDay}
					info={training[openDay]}
					log={dayLog[openDay]}
					onClose={() => setOpenDay(null)}
				/>
			)}
		</div>
	);
}

function DaySummary({ date, info, log, onClose }) {
	const sets = log ? log.length : 0;
	return (
		<div
			className="sheet-back"
			onClick={onClose}
		>
			<div
				className="sheet"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="sheet-grab" />
				<div className="day-sum-head">
					<div className="day-sum-badge">
						<span className="dn">{date}</span>
						<span className="mo">Jun</span>
					</div>
					<div className="day-sum-titles">
						<div className="t">
							Workout {info.workout} · {info.title}
						</div>
						<div className="s">Week {info.week} · completed</div>
					</div>
				</div>

				<div className="day-stats">
					<div className="day-stat">
						<div className="v">{info.min}m</div>
						<div className="l">Duration</div>
					</div>
					<div className="day-stat">
						<div className="v">{log ? log.length : info.sets}</div>
						<div className="l">Exercises</div>
					</div>
					<div className="day-stat">
						<div className="v">{(info.volume / 1000).toFixed(1)}k</div>
						<div className="l">lb volume</div>
					</div>
				</div>

				{log ? (
					<div className="day-log">
						{log.map((row, i) => (
							<div
								className="day-log-row"
								key={i}
							>
								<span className="nm">{row.name}</span>
								<span className="se">{row.sets}</span>
								<span className="tp">{row.top}</span>
							</div>
						))}
					</div>
				) : (
					<div className="day-empty">Logged — detail not available for this day.</div>
				)}
			</div>
		</div>
	);
}

Object.assign(window, { CalendarView, DaySummary });
