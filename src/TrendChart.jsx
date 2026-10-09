import { useState } from "react";

// Compact single-series time chart (one measure per chart, one y-axis) with a hover crosshair.
// data: [{ t, value }] oldest first; t in seconds.
export default function TrendChart({ title, unit, data, minMax, format = (v) => v, ariaLabel }) {
  const [hover, setHover] = useState(null);
  const W = 200, H = 40, PAD_T = 3, PAD_B = 3;
  const n = data.length;
  const max = Math.max(minMax, ...data.map((d) => d.value));
  const x = (i) => (n > 1 ? (i / (n - 1)) * W : W);
  const y = (v) => PAD_T + (1 - v / max) * (H - PAD_T - PAD_B);

  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join("");
  const area = n > 1 ? `${line}L${W},${H - PAD_B}L0,${H - PAD_B}Z` : "";
  const last = data[n - 1];
  const shown = hover !== null ? data[hover] : last;

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - r.left) / r.width) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  };

  return (
    <div className="trend">
      <div className="trend-head">
        <span>{title}</span>
        <strong>
          {shown ? format(shown.value) : "–"} <small>{unit}</small>
          {hover !== null && last && <em dir="ltr"> {Math.round(shown.t - last.t)}s</em>}
        </strong>
      </div>
      <svg
        className="trend-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={ariaLabel}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        dir="ltr"
      >
        <line x1="0" x2={W} y1={H - PAD_B} y2={H - PAD_B} className="trend-base" />
        <line x1="0" x2={W} y1={y(max / 2)} y2={y(max / 2)} className="trend-grid" />
        {area && <path d={area} className="trend-area" />}
        {n > 1 && <path d={line} className="trend-line" />}
        {hover !== null && n > 1 && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1="0" y2={H} className="trend-cross" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r="3" className="trend-dot" />
          </>
        )}
      </svg>
    </div>
  );
}
