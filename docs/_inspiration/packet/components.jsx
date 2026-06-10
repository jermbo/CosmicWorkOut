// components.jsx — shared bits: SVG icon set + exercise progress ring.

// Minimal line-icon set (no emoji) — clean + athletic.
function Icon({ name, ...rest }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    today: <><path {...p} d="M4 7h16M4 7l1.2 11.5a1.5 1.5 0 0 0 1.5 1.5h10.6a1.5 1.5 0 0 0 1.5-1.5L20 7M9 7V5a3 3 0 0 1 6 0v2" /></>,
    flame: <><path {...p} d="M12 3c.5 3 3 4.2 3 7a3 3 0 0 1-6 0c0-1 .4-1.6.4-1.6C7 10 6 12 6 14a6 6 0 0 0 12 0c0-4.5-4-6.8-6-11Z" /></>,
    calendar: <><rect {...p} x="3.5" y="4.5" width="17" height="16" rx="2.5" /><path {...p} d="M3.5 9h17M8 3v3M16 3v3" /></>,
    play: <><path d="M7 4.5v15a1 1 0 0 0 1.5.87l12-7.5a1 1 0 0 0 0-1.74l-12-7.5A1 1 0 0 0 7 4.5Z" fill="currentColor" /></>,
    chevL: <><path {...p} d="M15 5l-7 7 7 7" /></>,
    chevR: <><path {...p} d="M9 5l7 7-7 7" /></>,
    close: <><path {...p} d="M6 6l12 12M18 6L6 18" /></>,
    check: <><path {...p} strokeWidth="2.4" d="M5 12.5l4.5 4.5L19 6.5" /></>,
    plus: <><path {...p} d="M12 5v14M5 12h14" /></>,
    minus: <><path {...p} d="M5 12h14" /></>,
    flag: <><path {...p} d="M5 21V4M5 4h11l-2 4 2 4H5" /></>,
    timer: <><circle {...p} cx="12" cy="13" r="7.5" /><path {...p} d="M12 13V9.5M9.5 2.5h5" /></>,
    edit: <><path {...p} d="M4 20h4L18 10l-4-4L4 16v4ZM13 7l4 4" /></>,
    dumbbell: <><path {...p} d="M6.5 9v6M3.5 10.5v3M17.5 9v6M20.5 10.5v3M6.5 12h11" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...rest}>{paths[name]}</svg>;
}

// Circular progress ring for an exercise (sets done / total).
function ProgressRing({ done, total, size = 42, stroke = 4, complete }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const frac = total ? done / total : 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--color-surface-4)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="var(--accent)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - frac)}
        style={{ transition: 'stroke-dashoffset 400ms cubic-bezier(0.34,1.56,0.64,1)' }} />
    </svg>
  );
}

// Fire a burst of confetti pieces into a container element.
function fireConfetti(host, accent) {
  if (!host) return;
  const colors = [accent, '#B286FD', '#60C6FF', '#FFFFFF', '#E55733'];
  for (let i = 0; i < 64; i++) {
    const el = document.createElement('i');
    el.className = 'confetti';
    el.style.left = Math.random() * 100 + '%';
    el.style.background = colors[i % colors.length];
    const dur = 1400 + Math.random() * 1400;
    el.style.animation = `confFall ${dur}ms cubic-bezier(0.2,0.6,0.4,1) ${Math.random() * 400}ms forwards`;
    el.style.transform = `scale(${0.6 + Math.random() * 0.9})`;
    host.appendChild(el);
    setTimeout(() => el.remove(), dur + 600);
  }
}

Object.assign(window, { Icon, ProgressRing, fireConfetti });
