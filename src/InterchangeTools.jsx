import { useMemo, useState } from "react";
import { ACCEL, DECEL, MIN_RADIUS_E4, RAMP_COLS, RAMP_SPEED, lane, radiusFor } from "./tools/aashto";

function Select({ id, label, value, options, onChange, render = (o) => o }) {
  return (
    <div className="tool-field seg-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="tool-select" value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {options.map((o) => (
          <option key={o} value={o}>{render(o)}</option>
        ))}
      </select>
    </div>
  );
}

function Num({ id, label, unit, value, onChange, step = 1, min = 0, max }) {
  return (
    <div className="tool-field seg-field">
      <label htmlFor={id}>{label}</label>
      <span className="num-wrap" dir="ltr">
        <input id={id} type="number" className="tool-num" value={value} step={step} min={min} max={max}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} />
        <small>{unit}</small>
      </span>
    </div>
  );
}

function Metric({ label, value, unit, note }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong dir="ltr">{value} <small>{unit}</small></strong>
      {note && <em className="metric-note">{note}</em>}
    </div>
  );
}

/* ---------- AASHTO ramp design ---------- */

const RANGES = [
  { i: 0, en: "85 %", ar: "85%" },
  { i: 1, en: "70 %", ar: "70%" },
  { i: 2, en: "50 %", ar: "50%" },
];

export function RampTool({ ar }) {
  const [hw, setHw] = useState(100);
  const [range, setRange] = useState(2);
  const [e, setE] = useState(4);
  const [lanesRamp, setLanesRamp] = useState(60);

  const rampV = RAMP_SPEED[hw][range];
  const fRow = MIN_RADIUS_E4[rampV];
  const R = fRow ? radiusFor(rampV, e, fRow[0]) : null;
  const acc = lane(ACCEL, hw, lanesRamp);
  const dec = lane(DECEL, hw, lanesRamp);

  return (
    <div className="tool-grid">
      <div className="tool-col">
        <div className="tool-card">
          <h3>{ar ? "المدخلات" : "Inputs"}</h3>
          <Select id="r-hw" label={ar ? "السرعة التصميمية للطريق" : "Highway design speed"} value={hw}
            options={Object.keys(RAMP_SPEED).map(Number)} onChange={setHw} render={(o) => `${o} km/h`} />
          <div className="tool-field seg-field">
            <span className="seg-label">{ar ? "مدى سرعة المنحدر: أعلى / متوسط / أدنى (جدول 10-1)" : "Ramp speed range: upper / middle / lower (Table 10-1)"}</span>
            <div className="tool-seg">
              {RANGES.map((r) => (
                <button key={r.i} className={range === r.i ? "active" : ""} aria-pressed={range === r.i} onClick={() => setRange(r.i)}>
                  {ar ? r.ar : r.en}
                </button>
              ))}
            </div>
          </div>
          <Num id="r-e" label={ar ? "الميل العرضي الأقصى e" : "Max superelevation e"} unit="%" value={e} step={0.5} min={0} max={12} onChange={setE} />
          <Select id="r-ls" label={ar ? "سرعة العنصر الحاكم على المنحدر (لحارات تغيير السرعة)" : "Ramp controlling-feature speed (speed-change lanes)"}
            value={lanesRamp} options={RAMP_COLS} onChange={setLanesRamp}
            render={(o) => (o === 0 ? (ar ? "توقف" : "Stop condition") : `${o} km/h`)} />
        </div>
      </div>
      <div className="tool-col">
        <div className="tool-card">
          <h3>{ar ? "النتائج — AASHTO Green Book" : "Results — AASHTO Green Book"}</h3>
          <div className="metrics">
            <Metric label={ar ? "سرعة تصميم المنحدر" : "Ramp design speed"} value={rampV} unit="km/h" note="Table 10-1" />
            <Metric label={ar ? "أقل نصف قطر" : "Minimum radius"} value={R ? Math.ceil(R) : "—"} unit="m"
              note={fRow ? `f = ${fRow[0]} · e = ${e}%` : ""} />
            <Metric label={ar ? "طول حارة التسارع" : "Acceleration lane"} value={acc ?? "—"} unit="m" note="Table 10-3" />
            <Metric label={ar ? "طول حارة التباطؤ" : "Deceleration lane"} value={dec ?? "—"} unit="m" note="Table 10-5" />
          </div>
          <div className="formula" dir="ltr">
            <code>R = V² / 127 (0.01e + f)</code>
            <dl>
              <div><dt>V</dt><dd>{rampV} km/h</dd></div>
              <div><dt>e</dt><dd>{e} %</dd></div>
              <div><dt>f</dt><dd>{fRow ? fRow[0] : "—"}</dd></div>
            </dl>
          </div>
          {(acc === null || dec === null) && (
            <p className="tool-hint">
              {ar ? "لا توجد قيمة في الجدول لهذا التركيب من السرعات." : "No tabulated value for this speed combination."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Traffic growth (CAGR) ---------- */

export function GrowthTool({ ar }) {
  const [v0, setV0] = useState(2625);
  const [g, setG] = useState(2.5);
  const [y0, setY0] = useState(2025);
  const [lanes, setLanes] = useState(2);
  const [cap, setCap] = useState(1800);

  const capacity = lanes * cap;
  const rows = useMemo(() => {
    const out = [];
    for (let t = 0; t <= 30; t++) out.push({ year: y0 + t, v: v0 * Math.pow(1 + g / 100, t) });
    return out;
  }, [v0, g, y0]);
  const yearAt = (ratio) => {
    if (g <= 0) return v0 / capacity >= ratio ? y0 : null;
    const t = Math.log((ratio * capacity) / v0) / Math.log(1 + g / 100);
    return t <= 0 ? y0 : Math.ceil(y0 + t);
  };
  const y85 = yearAt(0.85), y100 = yearAt(1);

  const W = 520, H = 200, pad = 34;
  const vmax = Math.max(capacity * 1.1, rows[rows.length - 1].v * 1.05);
  const x = (i) => pad + (i / 30) * (W - pad - 24);
  const y = (v) => H - 24 - (v / vmax) * (H - 40);
  const path = rows.map((r, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(r.v).toFixed(1)}`).join("");

  return (
    <div className="tool-grid">
      <div className="tool-col">
        <div className="tool-card">
          <h3>{ar ? "المدخلات" : "Inputs"}</h3>
          <Num id="g-v0" label={ar ? "حجم الذروة الحالي V₀" : "Base peak volume V₀"} unit="veh/h" value={v0} step={50} onChange={setV0} />
          <Num id="g-g" label={ar ? "معدل النمو السنوي g" : "Annual growth rate g"} unit="%" value={g} step={0.1} onChange={setG} />
          <Num id="g-y0" label={ar ? "سنة الأساس" : "Base year"} unit="" value={y0} onChange={setY0} />
          <Num id="g-l" label={ar ? "عدد المسارات" : "Number of lanes"} unit="" value={lanes} min={1} max={8} onChange={setLanes} />
          <Num id="g-c" label={ar ? "سعة المسار" : "Capacity per lane"} unit="veh/h/ln" value={cap} step={50} onChange={setCap} />
        </div>
      </div>
      <div className="tool-col">
        <div className="tool-card">
          <h3>{ar ? "الحجوم المتوقعة — Vt = V₀ (1 + g)^(t − t₀)" : "Projected volumes — Vt = V₀ (1 + g)^(t − t₀)"}</h3>
          <svg className="growth-svg" viewBox={`0 0 ${W} ${H}`} dir="ltr" role="img"
            aria-label={ar ? "منحنى نمو الحجم المروري مقارنة بالسعة" : "Projected volume against capacity"}>
            <line x1={pad} x2={W - 10} y1={y(capacity)} y2={y(capacity)} className="g-cap" />
            <text x={W - 12} y={y(capacity) - 6} textAnchor="end" className="g-lbl">
              {ar ? "السعة" : "Capacity"} {Math.round(capacity)}
            </text>
            <line x1={pad} x2={W - 10} y1={H - 24} y2={H - 24} className="g-axis" />
            {[0, 10, 20, 30].map((t) => (
              <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="g-tick">{y0 + t}</text>
            ))}
            <path d={path} className="g-line" />
            {[10, 20, 30].map((t) => (
              <circle key={t} cx={x(t)} cy={y(rows[t].v)} r="4" className="g-dot" />
            ))}
          </svg>
          <table className="speed-table" dir="ltr">
            <thead>
              <tr><th>{ar ? "السنة" : "Year"}</th><th>{ar ? "معامل النمو" : "Factor"}</th><th>veh/h</th><th>v/c</th></tr>
            </thead>
            <tbody>
              {[0, 10, 20, 30].map((t) => (
                <tr key={t}>
                  <td>{rows[t].year}</td>
                  <td>{(rows[t].v / v0).toFixed(2)}</td>
                  <td><strong>{Math.round(rows[t].v).toLocaleString("en")}</strong></td>
                  <td>{(rows[t].v / capacity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="metrics">
            <Metric label={ar ? "سنة بلوغ v/c = 0.85" : "Year v/c reaches 0.85"} value={y85 ?? "—"} unit="" />
            <Metric label={ar ? "سنة بلوغ السعة (v/c = 1.0)" : "Year capacity is reached"} value={y100 ?? "—"} unit="" />
          </div>
        </div>
      </div>
    </div>
  );
}
