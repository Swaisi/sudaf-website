import { projects } from "./data";
import { Icon } from "./icons";

// Schematic plan icons of interchange forms (not to scale).
function InterchangeIcon({ shape }) {
  const road = { stroke: "currentColor", strokeWidth: 3, fill: "none", strokeLinecap: "round" };
  const ramp = { stroke: "var(--gold-500)", strokeWidth: 2, fill: "none", strokeLinecap: "round" };
  return (
    <svg viewBox="0 0 120 120" className="ix-icon" aria-hidden="true">
      <line x1="6" y1="60" x2="114" y2="60" {...road} />
      <line x1="60" y1="6" x2="60" y2="114" {...road} />
      {shape === "clover" &&
        [[1, 1], [-1, 1], [1, -1], [-1, -1]].map(([sx, sy], i) => (
          <g key={i}>
            <circle cx={60 + sx * 20} cy={60 + sy * 20} r="15" {...ramp} />
            <path d={`M${60 + sx * 52},${60 + sy * 6} Q${60 + sx * 46},${60 + sy * 46} ${60 + sx * 6},${60 + sy * 52}`} {...ramp} />
          </g>
        ))}
      {shape === "diamond" &&
        [[1, 1], [-1, 1], [1, -1], [-1, -1]].map(([sx, sy], i) => (
          <path key={i} d={`M${60 + sx * 54},${60 + sy * 7} L${60 + sx * 14},${60 + sy * 22}`} {...ramp} />
        ))}
      {shape === "roundabout" && (
        <>
          <circle cx="60" cy="60" r="24" {...ramp} />
          <circle cx="60" cy="60" r="14" fill="rgba(214,180,106,0.15)" />
        </>
      )}
    </svg>
  );
}

// One measure (delay) per chart, single hue; the recommended option carries the accent.
function DelayChart({ rows, ar }) {
  const max = Math.max(...rows.map((r) => r.delay || 0)) * 1.15;
  return (
    <figure className="pchart">
      <figcaption>
        {ar ? "متوسط التأخير في ذروة 2045 (ث/مركبة)" : "Average delay, 2045 design peak (s/veh)"}
      </figcaption>
      <ul>
        {rows.map((r) => (
          <li key={r.alt} className={r.best ? "best" : ""}>
            <span className="pchart-label">
              <strong>{r.alt}</strong> {ar ? r.ar : r.en}
            </span>
            <span className="pchart-track">
              {r.delay ? (
                <span className="pchart-bar" style={{ width: `${(r.delay / max) * 100}%` }} />
              ) : (
                <span className="pchart-fail">{ar ? "فشل تشغيلي (v/c > 1)" : "Fails (v/c > 1)"}</span>
              )}
            </span>
            <span className="pchart-val" dir="ltr">{r.delay ? `≈ ${r.delay}` : "—"}</span>
          </li>
        ))}
      </ul>
      <table className="pchart-table" dir="ltr">
        <thead>
          <tr>
            <th>Alt</th>
            <th>{ar ? "طابور 95% (م)" : "95th queue (m)"}</th>
            <th>{ar ? "أقصى v/c" : "Max v/c"}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.alt} className={r.best ? "best" : ""}>
              <td>{r.alt}</td>
              <td>{r.queue ? `≈ ${r.queue}` : ar ? "غير مستقر" : "unstable"}</td>
              <td>{r.vc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

function CaseStudy({ p, i, ar }) {
  return (
    <article className="case reveal" id={p.id}>
      <div className="case-side">
        <span className="case-num">{String(i + 1).padStart(2, "0")}</span>
        <dl className="case-meta">
          <div>
            <dt>{ar ? "الموقع" : "Location"}</dt>
            <dd>{ar ? p.cityAr : p.city}</dd>
          </div>
          {p.year && (
            <div>
              <dt>{ar ? "السنة" : "Year"}</dt>
              <dd>{p.year}</dd>
            </div>
          )}
          <div>
            <dt>{ar ? "الجهة / الإطار" : "Client / context"}</dt>
            <dd>{ar ? p.clientAr : p.client}</dd>
          </div>
          <div>
            <dt>{ar ? "الفريق" : "Team"}</dt>
            <dd>{ar ? "فريق المهندسين في سدف" : "Sudaf engineering team"}</dd>
          </div>
        </dl>
      </div>

      <div className="case-body">
        <h2>{ar ? p.titleAr : p.title}</h2>
        <p className="case-lead">{ar ? p.summaryAr : p.summary}</p>

        <div className="case-grid">
          <section>
            <h3>{ar ? "التحدي" : "Challenge"}</h3>
            <p>{ar ? p.challengeAr : p.challenge}</p>
          </section>
          <section>
            <h3>{ar ? "المنهجية" : "Approach"}</h3>
            <ul className="check-list">
              {(ar ? p.approachAr : p.approach).map((a) => (
                <li key={a}>
                  <Icon name="check" size={18} />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {p.results && <DelayChart rows={p.results} ar={ar} />}

        {p.alternatives && (
          <div className="ix-row">
            {p.alternatives.map((a) => (
              <div key={a.shape} className="ix">
                <InterchangeIcon shape={a.shape} />
                <span>{ar ? a.ar : a.en}</span>
              </div>
            ))}
          </div>
        )}

        <div className="case-outcome">
          <h3>{ar ? "النتيجة" : "Outcome"}</h3>
          <p>{ar ? p.outcomeAr : p.outcome}</p>
        </div>
      </div>
    </article>
  );
}

export default function ProjectsList({ ar }) {
  return (
    <div className="cases">
      <p className="cases-note">
        {ar
          ? "نماذج مختارة من دراسات أعدّها فريق المهندسين في سدف. تُعرض النتائج الفنية فقط، دون البيانات المالية أو بيانات الملكيات."
          : "Selected studies prepared by the Sudaf engineering team. Technical findings only — financial and property data are not published."}
      </p>
      {projects.map((p, i) => (
        <CaseStudy key={p.id} p={p} i={i} ar={ar} />
      ))}
    </div>
  );
}
