import { useMemo, useState } from "react";
import { dmrbChecks, fmt, kimber, usAnalysis } from "./tools/roundaboutCalc";
import { DmrbDiagram, UsDiagram, usGeometry, US_GEOM_DEFAULT } from "./tools/RoundaboutDiagrams";

/* ---------- shared UI ---------- */

function Field({ id, sym, label, unit, min, max, step = 1, value, onChange }) {
  return (
    <div className="tool-field">
      <label htmlFor={id}>
        <span className="sym" dir="ltr">{sym}</span>
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <output htmlFor={id} dir="ltr">
        {value} <small>{unit}</small>
      </output>
    </div>
  );
}

function Segmented({ label, options, value, onChange }) {
  return (
    <div className="tool-field seg-field">
      <span className="seg-label">{label}</span>
      <div className="tool-seg" role="group" aria-label={label}>
        {options.map((o) => (
          <button key={o} aria-pressed={value === o} className={value === o ? "active" : ""} onClick={() => onChange(o)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

const STATUS = {
  pass: { icon: "✓", en: "Pass", ar: "مطابق" },
  warn: { icon: "!", en: "Review", ar: "يحتاج مراجعة" },
  fail: { icon: "✕", en: "Fail", ar: "غير مطابق" },
};

function Checklist({ checks, ar, title }) {
  const counts = checks.reduce((a, c) => ({ ...a, [c.status]: (a[c.status] || 0) + 1 }), {});
  return (
    <div className="tool-card">
      <div className="check-head">
        <h3>{title}</h3>
        <span className="check-summary">
          {["pass", "warn", "fail"].map((s) =>
            counts[s] ? (
              <span key={s} className={`badge ${s}`}>
                {STATUS[s].icon} {counts[s]}
              </span>
            ) : null
          )}
        </span>
      </div>
      <ul className="qa-list">
        {checks.map((c) => (
          <li key={c.id}>
            <span className={`badge ${c.status}`}>
              {STATUS[c.status].icon} {ar ? STATUS[c.status].ar : STATUS[c.status].en}
            </span>
            <span className="qa-text">{ar ? c.ar : c.en}</span>
            <span className="qa-value" dir="ltr">{c.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Metric({ label, value, unit, tone }) {
  return (
    <div className={`metric ${tone || ""}`}>
      <span>{label}</span>
      <strong dir="ltr">
        {value} <small>{unit}</small>
      </strong>
    </div>
  );
}

/* ---------- UK: DMRB / Kimber ---------- */

const DMRB_DEFAULT = { V: 6.5, E: 7.3, lp: 25, r: 20, phi: 30, D: 72, Qc: 900, demand: 1100, circW: 8, entryPathR: 70, exitR: 40 };

function DmrbTool({ ar }) {
  const [p, setP] = useState(DMRB_DEFAULT);
  const set = (k) => (v) => setP((s) => ({ ...s, [k]: v }));
  const res = useMemo(() => kimber(p), [p]);
  const { rfc, checks } = useMemo(() => dmrbChecks(p, res, p.demand), [p, res]);
  const tone = rfc <= 0.85 ? "good" : rfc <= 1 ? "warn" : "bad";

  return (
    <div className="tool-grid">
      <div className="tool-col">
        <div className="tool-card dark">
          <DmrbDiagram p={p} />
        </div>
        <div className="tool-card">
          <h3>{ar ? "النتائج — نموذج Kimber (TRL LR942)" : "Results — Kimber model (TRL LR942)"}</h3>
          <div className="metrics">
            <Metric label={ar ? "سعة المدخل Qe" : "Entry capacity Qe"} value={fmt(res.Qe)} unit="pcu/h" />
            <Metric label={ar ? "نسبة التدفق للسعة" : "Flow / capacity"} value={fmt(rfc, 2)} unit="RFC" tone={tone} />
            <Metric label={ar ? "السعة الاحتياطية" : "Reserve capacity"} value={fmt(Math.max(0, res.Qe - p.demand))} unit="pcu/h" />
          </div>
          <div className="formula" dir="ltr">
            <code>Qe = k (F − fc·Qc)</code>
            <dl>
              <div><dt>S</dt><dd>{fmt(res.S, 3)}</dd></div>
              <div><dt>x₂</dt><dd>{fmt(res.x2, 2)}</dd></div>
              <div><dt>k</dt><dd>{fmt(res.k, 3)}</dd></div>
              <div><dt>t<sub>D</sub></dt><dd>{fmt(res.tD, 3)}</dd></div>
              <div><dt>F</dt><dd>{fmt(res.F)}</dd></div>
              <div><dt>f<sub>c</sub></dt><dd>{fmt(res.fc, 3)}</dd></div>
            </dl>
          </div>
        </div>
      </div>

      <div className="tool-col">
        <div className="tool-card">
          <h3>{ar ? "الهندسة والتدفقات" : "Geometry & flows"}</h3>
          <Field id="d-V" sym="V" label={ar ? "نصف عرض الاقتراب" : "Approach half-width"} unit="m" min={2} max={12.5} step={0.1} value={p.V} onChange={set("V")} />
          <Field id="d-E" sym="E" label={ar ? "عرض المدخل" : "Entry width"} unit="m" min={3.6} max={16.5} step={0.1} value={p.E} onChange={set("E")} />
          <Field id="d-l" sym="l′" label={ar ? "الطول الفعّال للتوسعة" : "Effective flare length"} unit="m" min={1} max={100} value={p.lp} onChange={set("lp")} />
          <Field id="d-r" sym="r" label={ar ? "نصف قطر المدخل" : "Entry radius"} unit="m" min={4} max={100} value={p.r} onChange={set("r")} />
          <Field id="d-phi" sym="φ" label={ar ? "زاوية الدخول" : "Entry angle"} unit="°" min={0} max={77} value={p.phi} onChange={set("phi")} />
          <Field id="d-D" sym="D" label={ar ? "القطر الخارجي (ICD)" : "Inscribed circle diameter"} unit="m" min={14} max={170} value={p.D} onChange={set("D")} />
          <Field id="d-cw" sym="Wc" label={ar ? "عرض الطريق الدائري" : "Circulatory width"} unit="m" min={4} max={18} step={0.1} value={p.circW} onChange={set("circW")} />
          <Field id="d-ep" sym="Rep" label={ar ? "نصف قطر مسار الدخول" : "Entry path radius"} unit="m" min={20} max={200} value={p.entryPathR} onChange={set("entryPathR")} />
          <Field id="d-ex" sym="Rex" label={ar ? "نصف قطر المخرج" : "Exit radius"} unit="m" min={10} max={100} value={p.exitR} onChange={set("exitR")} />
          <Field id="d-qc" sym="Qc" label={ar ? "التدفق الدائري المتعارض" : "Circulating flow"} unit="pcu/h" min={0} max={3000} step={50} value={p.Qc} onChange={set("Qc")} />
          <Field id="d-q" sym="q" label={ar ? "الطلب على المدخل" : "Entry demand"} unit="pcu/h" min={0} max={3500} step={50} value={p.demand} onChange={set("demand")} />
        </div>
        <Checklist checks={checks} ar={ar} title={ar ? "قائمة فحص الجودة — DMRB CD 116" : "QA/QC checklist — DMRB CD 116"} />
      </div>
    </div>
  );
}

/* ---------- US: FHWA / NCHRP 672 fastest path + HCM ---------- */

const US_DEFAULT = { entryLanes: 2, circLanes: 2, ve: 1100, vc: 700 };

function UsTool({ ar }) {
  const [p, setP] = useState(US_DEFAULT);
  const [g, setG] = useState(US_GEOM_DEFAULT);
  const set = (k) => (v) => setP((s) => ({ ...s, [k]: v }));
  const setGeo = (k) => (v) => setG((s) => ({ ...s, [k]: v }));

  // Lane counts drive typical widths; the sliders can then fine-tune them.
  const setLanes = (k) => (n) => {
    setP((s) => ({ ...s, [k]: n }));
    if (k === "entryLanes") setG((s) => ({ ...s, We: n === 2 ? 7.4 : 4.6, Wx: n === 2 ? 6.0 : 4.6 }));
    if (k === "circLanes") setG((s) => ({ ...s, circW: n === 2 ? 9.2 : 5.5, ICD: n === 2 ? Math.max(s.ICD, 46) : s.ICD }));
  };

  const geo = useMemo(() => usGeometry(g), [g]);
  const radii = Object.fromEntries(["R1", "R2", "R3", "R4", "R5"].map((k) => [k, geo.radii[k] ? Math.round(geo.radii[k].r) : 999]));
  const res = useMemo(() => usAnalysis({ ...p, ...radii }), [p, radii.R1, radii.R2, radii.R3, radii.R4, radii.R5]);
  const tone = res.worst.x <= 0.85 ? "good" : res.worst.x <= 1 ? "warn" : "bad";
  const laneName = (i) =>
    res.lanes.length === 1 ? (ar ? "المسار" : "Lane") : i === 0 ? (ar ? "المسار الأيمن" : "Right lane") : ar ? "المسار الأيسر" : "Left lane";

  return (
    <div className="tool-grid">
      <div className="tool-col">
        <div className="tool-card dark">
          <UsDiagram geo={geo} g={g} p={p} speeds={res.speeds} ar={ar} />
        </div>
        <div className="tool-card">
          <h3>{ar ? "النتائج — NCHRP 672 وHCM" : "Results — NCHRP 672 & HCM"}</h3>
          <table className="speed-table" dir="ltr">
            <thead>
              <tr><th>Path</th><th>{ar ? "R مقاس (م)" : "R measured (m)"}</th><th>e</th><th>V (km/h)</th></tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td>R{i}</td>
                  <td>{radii[`R${i}`] === 999 ? "—" : radii[`R${i}`]}</td>
                  <td>{i === 2 || i === 4 ? "−0.02" : "+0.02"}</td>
                  <td><strong>{fmt(res.speeds[`V${i}`])}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="metrics">
            {res.lanes.map((l, i) => (
              <Metric key={i} label={`${laneName(i)} — ${ar ? "السعة" : "capacity"}`} value={fmt(l.c)} unit="pc/h" />
            ))}
            <Metric label={ar ? "نسبة الحجم للسعة (الحرجة)" : "v/c (critical)"} value={fmt(res.worst.x, 2)} unit="" tone={tone} />
            <Metric label={ar ? "تأخير التحكم" : "Control delay"} value={fmt(res.worst.d, 1)} unit={ar ? "ث/مركبة" : "s/veh"} />
            <Metric label={ar ? "مستوى الخدمة" : "LOS"} value={res.worst.los} unit="" tone={tone} />
          </div>
        </div>
      </div>

      <div className="tool-col">
        <div className="tool-card">
          <h3>{ar ? "هندسة جزيرة الدوران" : "Roundabout geometry"}</h3>
          <Segmented label={ar ? "مسارات المدخل" : "Entry lanes"} options={[1, 2]} value={p.entryLanes} onChange={setLanes("entryLanes")} />
          <Segmented label={ar ? "المسارات الدائرية" : "Circulating lanes"} options={[1, 2]} value={p.circLanes} onChange={setLanes("circLanes")} />
          <Field id="u-icd" sym="ICD" label={ar ? "القطر الخارجي" : "Inscribed circle diameter"} unit="m" min={30} max={80} value={g.ICD} onChange={setGeo("ICD")} />
          <Field id="u-cw" sym="Wc" label={ar ? "عرض الطريق الدائري" : "Circulatory width"} unit="m" min={4.5} max={12} step={0.1} value={g.circW} onChange={setGeo("circW")} />
          <Field id="u-ap" sym="Wa" label={ar ? "عرض مئزر الشاحنات" : "Truck apron width"} unit="m" min={0} max={5} step={0.5} value={g.apron} onChange={setGeo("apron")} />
          <Field id="u-we" sym="We" label={ar ? "عرض المدخل" : "Entry width"} unit="m" min={4} max={11} step={0.1} value={g.We} onChange={setGeo("We")} />
          <Field id="u-wx" sym="Wx" label={ar ? "عرض المخرج" : "Exit width"} unit="m" min={4} max={10} step={0.1} value={g.Wx} onChange={setGeo("Wx")} />
          <Field id="u-sp" sym="Ws" label={ar ? "عرض الجزيرة الفاصلة" : "Splitter island width"} unit="m" min={1.8} max={10} step={0.2} value={g.splitter} onChange={setGeo("splitter")} />
          <Field id="u-ri" sym="Rin" label={ar ? "نصف قطر حافة المدخل" : "Entry kerb radius"} unit="m" min={10} max={45} value={g.rIn} onChange={setGeo("rIn")} />
          <Field id="u-ro" sym="Rex" label={ar ? "نصف قطر حافة المخرج" : "Exit kerb radius"} unit="m" min={15} max={80} value={g.rOut} onChange={setGeo("rOut")} />
          <p className="tool-hint muted-hint">
            {ar
              ? "يُرسم المسار الأسرع تلقائيًا على بُعد 1.5 م من الجزر و1.0 م من الحواف، وتُقاس أنصاف الأقطار R1–R5 من المسار المرسوم على قوس طوله نحو 20 م."
              : "Fastest paths are drawn 1.5 m from islands and 1.0 m from kerbs; R1–R5 are measured on the drawn paths over a ~20 m arc."}
          </p>
          <h3 className="sub">{ar ? "التدفقات (HCM)" : "Flows (HCM)"}</h3>
          <Field id="u-ve" sym="ve" label={ar ? "حجم المدخل" : "Entry flow"} unit="pc/h" min={0} max={2400} step={50} value={p.ve} onChange={set("ve")} />
          <Field id="u-vc" sym="vc" label={ar ? "التدفق الدائري المتعارض" : "Conflicting flow"} unit="pc/h" min={0} max={2000} step={50} value={p.vc} onChange={set("vc")} />
        </div>
        <Checklist checks={res.checks} ar={ar} title={ar ? "فحوص التصميم — FHWA / NCHRP 672" : "Design checks — FHWA / NCHRP 672"} />
      </div>
    </div>
  );
}

/* ---------- wrapper ---------- */

export default function RoundaboutTool({ ar }) {
  const [tab, setTab] = useState("uk");
  return (
    <div className="rtool">
      <div className="tool-tabs" role="tablist">
        <button role="tab" aria-selected={tab === "uk"} className={tab === "uk" ? "active" : ""} onClick={() => setTab("uk")}>
          <strong>DMRB CD 116</strong>
          <span>{ar ? "المعيار البريطاني — السعة وفحص الجودة" : "UK — capacity & QA/QC"}</span>
        </button>
        <button role="tab" aria-selected={tab === "us"} className={tab === "us" ? "active" : ""} onClick={() => setTab("us")}>
          <strong>FHWA · NCHRP 672</strong>
          <span>{ar ? "الدليل الأمريكي — المسار الأسرع وHCM" : "US — fastest path & HCM"}</span>
        </button>
      </div>

      {tab === "uk" ? <DmrbTool ar={ar} /> : <UsTool ar={ar} />}

      <p className="tool-disclaimer">
        {ar
          ? "أداة إرشادية للتصميم الأولي فقط. يجب التحقق من جميع النتائج وفق الإصدارات السارية من DMRB CD 116 وTRL LR942 وNCHRP Report 672 ودليل HCM، ومن قبل مهندس مختص."
          : "Indicative preliminary-design aid only. Verify all results against the current editions of DMRB CD 116, TRL LR942, NCHRP Report 672 and the HCM, under the review of a qualified engineer."}
      </p>
    </div>
  );
}
