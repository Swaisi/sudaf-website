import { useState } from "react";

// Plan-view "design elements" drawings for the roundabout tools, in the style of
// the FHWA roundabout design-elements figure: kerb lines only, dashed inscribed
// circle across each leg mouth, two-part splitter islands, and labelled callouts.
// Geometry is computed in metres (x east, y south) and drawn to scale.
// Right-hand traffic: inbound vehicles keep right, circulation is counter-clockwise.

const toRad = (d) => (d * Math.PI) / 180;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const ang = (p) => Math.atan2(p[1], p[0]);

const ARMS = [Math.PI, Math.PI / 2, 0, -Math.PI / 2]; // W, S, E, N
const legRot = (alpha) => alpha - Math.PI; // legs are built pointing west

// Kerb fillet between a straight kerb y = yk (running east into the circle) and the
// outside of the inscribed circle. side = +1: kerb turns toward +y; -1: toward -y.
function fillet(yk, r, Rc, side) {
  const cy = yk + side * r;
  const d = Rc + r;
  const cx = -Math.sqrt(Math.max(d * d - cy * cy, 0));
  return { c: [cx, cy], r, t1: [cx, yk], t2: [(cx * Rc) / d, (cy * Rc) / d] };
}

function arcBetween(c, a, b, n = 18) {
  const a0 = Math.atan2(a[1] - c[1], a[0] - c[0]);
  let dd = Math.atan2(b[1] - c[1], b[0] - c[0]) - a0;
  while (dd > Math.PI) dd -= 2 * Math.PI;
  while (dd < -Math.PI) dd += 2 * Math.PI;
  const r = Math.hypot(a[0] - c[0], a[1] - c[1]);
  return Array.from({ length: n + 1 }, (_, i) => [c[0] + r * Math.cos(a0 + (dd * i) / n), c[1] + r * Math.sin(a0 + (dd * i) / n)]);
}

const circleArc = (R, from, to, n = 48) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = from + ((to - from) * i) / n;
    return [R * Math.cos(t), R * Math.sin(t)];
  });

function capsule(x0, x1, y, h) {
  const r = h / 2;
  return [
    ...arcBetween([x1, y], [x1, y - r], [x1 + r, y], 6),
    ...arcBetween([x1, y], [x1 + r, y], [x1, y + r], 6),
    ...arcBetween([x0, y], [x0, y + r], [x0 - r, y], 6),
    ...arcBetween([x0, y], [x0 - r, y], [x0, y - r], 6),
  ];
}

function spline(pts, seg = 14) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < seg; k++) {
      const t = k / seg, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/* ---------- roundabout layout shared by both drawings ---------- */

// leg: { yOff, V, E, lp, r, Wx, rx, sp }  (local, west-pointing, metres)
function buildLayout({ Rc, circW, leg, farW, farO }) {
  const { yOff, V, E, lp, r, Wx, rx, sp } = leg;
  const ent = fillet(yOff + E, r, Rc, 1);
  const yX = yOff - 2 * sp - Wx;
  const ext = fillet(yX, rx, Rc, -1);
  let xA = ent.t1[0];
  if (xA * xA + yOff * yOff < Rc * Rc) xA = -Math.sqrt(Rc * Rc - yOff * yOff) - 0.3;
  const axis = yOff - sp;
  const Ls = clamp(lp * 0.9, 9, 22);

  const legs = ARMS.map((alpha) => {
    const R = legRot(alpha);
    const far = alpha === Math.PI ? farW : farO;
    const G = [Math.max(xA - 2 * lp, -far + 4), yOff + V];
    const L = (pts) => pts.map((q) => rot(q, R));
    return {
      alpha,
      far,
      entryKerb: L([[-far, yOff + V], G, [xA, yOff + E], ent.t1, ...arcBetween(ent.c, ent.t1, ent.t2)]),
      exitKerb: L([...arcBetween(ext.c, ext.t2, ext.t1), [-far, yX]]),
      mouth: L(circleArc(Rc, Math.PI - Math.asin(clamp((yOff + E) / Rc, -1, 1)), Math.PI - Math.asin(clamp(yX / Rc, -1, 1)), 20)),
      splitter: L([
        [xA - 0.6, yOff - 0.35], [xA - Ls, axis + 0.55], [xA - Ls - 0.6, axis], [xA - Ls, axis - 0.55],
        [xA - 0.6, yOff - 2 * sp + 0.35], [xA + 0.2, axis - sp * 0.6], [xA + 0.2, axis + sp * 0.6],
      ]),
      pill: L(capsule(xA - Ls - 8, xA - Ls - 3, axis, 1.3)),
      centre: [L([[xA - Ls - 10, axis - 0.25], [-far, axis - 0.25]]), L([[xA - Ls - 10, axis + 0.25], [-far, axis + 0.25]])],
      giveway: L([[xA + 0.15, yOff], [xA + 0.15, yOff + E]]),
    };
  });

  // Outer kerb arcs between an entry and the exit of the next leg (counter-clockwise).
  const ring = ARMS.map((alpha, i) => {
    const next = ARMS[(i + 1) % 4];
    const a0 = ang(rot(ent.t2, legRot(alpha)));
    let a1 = ang(rot(ext.t2, legRot(next)));
    while (a1 > a0) a1 -= 2 * Math.PI;
    return circleArc(Rc, a0, a1, 30);
  });

  return { legs, ring, ent, ext, xA, axis, yX, Ri: Rc - circW };
}

/* ---------- SVG helpers ---------- */

function makeView(minX, minY, maxX, maxY, widthPx = 640) {
  const s = widthPx / (maxX - minX);
  const P = ([x, y]) => [(x - minX) * s, (y - minY) * s];
  const d = (pts, close) => pts.map((p, i) => `${i ? "L" : "M"}${P(p)[0].toFixed(1)},${P(p)[1].toFixed(1)}`).join("") + (close ? "Z" : "");
  return { s, P, d, W: widthPx, H: Math.round((maxY - minY) * s) };
}

const Defs = () => (
  <defs>
    <marker id="dimA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,1 L10,5 L0,9 z" fill="#f5c84c" />
    </marker>
    <pattern id="bp-grid" width="18" height="18" patternUnits="userSpaceOnUse">
      <path d="M18 0H0V18" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
    </pattern>
  </defs>
);

function Plan({ L, v, Ri, children }) {
  const { P, d } = v;
  const [cx, cy] = P([0, 0]);
  return (
    <>
      <rect width={v.W} height={v.H} fill="url(#bp-grid)" />
      {L.ring.map((a, i) => <path key={`r${i}`} d={d(a)} className="kerb" />)}
      {L.legs.map((g, i) => (
        <g key={i}>
          <path d={d(g.entryKerb)} className="kerb" />
          <path d={d(g.exitKerb)} className="kerb" />
          <path d={d(g.mouth)} className="mouth" />
          <path d={d(g.splitter, true)} className="kerb splitter" />
          <path d={d(g.pill, true)} className="kerb splitter" />
          {g.centre.map((c, k) => <path key={k} d={d(c)} className="centre" />)}
          <path d={d(g.giveway)} className="giveway" />
        </g>
      ))}
      <circle cx={cx} cy={cy} r={Ri * v.s} className="kerb island" />
      {children}
    </>
  );
}

// Dimension line with end ticks (FHWA figure style).
function Dim({ a, b, v }) {
  const [x1, y1] = v.P(a), [x2, y2] = v.P(b);
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const nx = (-(y2 - y1) / len) * 6, ny = ((x2 - x1) / len) * 6;
  return (
    <g className="dim2">
      <line x1={x1} y1={y1} x2={x2} y2={y2} markerStart="url(#dimA)" markerEnd="url(#dimA)" />
      <line x1={x1 - nx} y1={y1 - ny} x2={x1 + nx} y2={y1 + ny} />
      <line x1={x2 - nx} y1={y2 - ny} x2={x2 + nx} y2={y2 + ny} />
    </g>
  );
}

// Callout: leader line from a point on the drawing to a label.
function Callout({ at, label, lines, v, anchor = "start" }) {
  const [x, y] = v.P(at);
  const [tx, ty] = label;
  const a = anchor;
  return (
    <g className="callout">
      <polyline points={`${x},${y} ${tx},${ty}`} />
      <circle cx={x} cy={y} r="2.4" />
      <text x={tx + (a === "end" ? -5 : a === "start" ? 5 : 0)} y={ty + 4} textAnchor={a}>
        {lines.map((l, i) => (
          <tspan key={i} x={tx + (a === "end" ? -5 : a === "start" ? 5 : 0)} dy={i ? 15 : 0} className={i ? "sub" : ""}>{l}</tspan>
        ))}
      </text>
    </g>
  );
}

function ScaleBar({ v, metres = 10 }) {
  const x = 14, y = 22, w = metres * v.s;
  return (
    <g className="scalebar">
      <rect x={x} y={y - 4} width={w / 2} height="4" />
      <rect x={x + w / 2} y={y - 4} width={w / 2} height="4" className="hollow" />
      <text x={x} y={y - 9}>0</text>
      <text x={x + w} y={y - 9} textAnchor="middle">{metres} m</text>
    </g>
  );
}

function Pt({ p, v, name, dx = 6, dy = -6 }) {
  const [x, y] = v.P(p);
  return (
    <g className="pt">
      <circle cx={x} cy={y} r="2.2" />
      <text x={x + dx} y={y + dy}>{name}</text>
    </g>
  );
}

/* ======================================================================
   DMRB CD 116 / TRL LR942 geometric parameters
====================================================================== */

export function DmrbDiagram({ p }) {
  const Rc = p.D / 2;
  const circW = Math.min(p.circW, Rc - 3);
  const rho = Rc - circW / 2;
  const V = p.V, E = Math.max(p.E, p.V);
  const sp = 1.6;

  // Offset the approach so the entry path through C meets the circulating
  // centre-line at the entry angle φ.
  const yC = rho * Math.cos(toRad(clamp(p.phi, 12, 78)));
  const yOff = Math.min(yC - (V + E) / 2, Rc - 1 - E);
  const lp = p.lp;
  const farW = Rc + 2 * lp + 26;
  const farO = Rc + 16;
  const L = buildLayout({ Rc, circW, leg: { yOff, V, E, lp, r: p.r, Wx: V, rx: p.exitR, sp }, farW, farO });

  const xA = L.xA;
  const yCa = yOff + (V + E) / 2;
  const A = [xA, yOff + E], Dp = [xA, yOff], B = [xA, yOff + V], C = [xA, yCa];
  const G = [Math.max(xA - 2 * lp, -farW + 4), yOff + V];
  const F = [xA - lp, yCa];
  const qy = clamp(yCa, -rho + 0.2, rho - 0.2);
  const Q = [-Math.sqrt(rho * rho - qy * qy), qy];
  const tan = [Math.sin(ang(Q)), -Math.cos(ang(Q))];

  const v = makeView(-farW, -farO, farO, farO, 640);
  const k = 1 / v.s; // metres per pixel
  const phiR = 30 * k;
  const aTan = Math.atan2(tan[1], tan[0]);
  const phiArc = Array.from({ length: 13 }, (_, i) => [Q[0] + phiR * Math.cos((aTan * i) / 12), Q[1] + phiR * Math.sin((aTan * i) / 12)]);
  const diag = toRad(-40);
  const wcAng = toRad(45);
  const entMid = arcBetween(L.ent.c, L.ent.t1, L.ent.t2, 2)[1];
  const extMid = arcBetween(L.ext.c, L.ext.t1, L.ext.t2, 2)[1];

  return (
    <svg className="tool-svg plan" viewBox={`0 0 ${v.W} ${v.H}`} dir="ltr" role="img" aria-label="DMRB roundabout geometric parameters">
      <Defs />
      <Plan L={L} v={v} Ri={L.Ri}>
        {/* construction lines */}
        <path d={v.d([B, G])} className="constr" />
        <path d={v.d([C, Q])} className="constr" />
        <path d={v.d([[Q[0] - tan[0] * 10, Q[1] - tan[1] * 10], [Q[0] + tan[0] * 10, Q[1] + tan[1] * 10]])} className="constr" />
        <path d={v.d(phiArc)} className="angle" />
        <path d={v.d([L.ent.c, entMid])} className="radius" />
        <path d={v.d([L.ext.c, extMid])} className="radius" />

        <Dim a={[-Rc * Math.cos(diag), -Rc * Math.sin(diag)]} b={[Rc * Math.cos(diag), Rc * Math.sin(diag)]} v={v} />
        <Dim a={Dp} b={A} v={v} />
        <Dim a={[G[0] - 3, yOff]} b={[G[0] - 3, yOff + V]} v={v} />
        <Dim a={F} b={C} v={v} />
        <Dim a={[L.Ri * Math.cos(wcAng), L.Ri * Math.sin(wcAng)]} b={[Rc * Math.cos(wcAng), Rc * Math.sin(wcAng)]} v={v} />

        <Pt p={A} v={v} name="A" dx={5} dy={13} />
        <Pt p={B} v={v} name="B" dx={-13} dy={4} />
        <Pt p={C} v={v} name="C" dx={5} dy={-5} />
        <Pt p={Dp} v={v} name="D" dx={5} dy={-6} />
        <Pt p={F} v={v} name="F" dx={-4} dy={-7} />
        <Pt p={G} v={v} name="G" dx={-4} dy={14} />

        <Callout v={v} at={[Rc * Math.cos(diag) * 0.55, Rc * Math.sin(diag) * 0.55]} label={[v.W - 196, 30]} lines={["Inscribed circle diameter", `D = ${p.D} m`]} />
        <Callout v={v} at={[(L.Ri + Rc) / 2 * Math.cos(wcAng), (L.Ri + Rc) / 2 * Math.sin(wcAng)]} label={[v.W - 122, v.H * 0.79]} lines={["Circulatory width", `Wc = ${p.circW} m`]} />
        <Callout v={v} at={[Q[0] + phiR * 0.7, Q[1] + phiR * 0.25]} label={[v.W - 122, v.H * 0.55]} lines={["Entry angle", `φ = ${p.phi}°`]} />
        <Callout v={v} at={entMid} label={[v.W * 0.71, v.H - 34]} lines={["Entry radius", `r = ${p.r} m`]} />
        <Callout v={v} at={[xA, yOff + E * 0.8]} label={[v.W * 0.54, v.H - 34]} lines={["Entry width", `E = ${E} m`]} />
        <Callout v={v} at={[(F[0] + C[0]) / 2, yCa]} label={[v.W * 0.28, v.H - 34]} lines={["Effective flare length", `l′ = CF = ${p.lp} m`]} />
        <Callout v={v} at={[G[0] - 3, yOff + V / 2]} label={[12, v.H - 34]} lines={["Approach half-width", `V = ${p.V} m`]} />
        <Callout v={v} at={extMid} label={[150, 70]} anchor="end" lines={["Exit radius", `Rex = ${p.exitR} m`]} />
        <Callout v={v} at={[xA - 4, L.axis]} label={[150, 130]} anchor="end" lines={["Splitter island"]} />
      </Plan>
      <ScaleBar v={v} metres={p.D > 90 ? 20 : 10} />
      <text x={14} y={40} className="svg-note">DMRB CD 116 · TRL LR942 — to scale</text>
    </svg>
  );
}

/* ======================================================================
   FHWA / NCHRP 672 design elements and fastest paths
====================================================================== */

export function UsDiagram({ sp: speeds, p, ar }) {
  const [layer, setLayer] = useState("elements");
  const Rc = 23; // ICD 46 m
  const circW = p.circLanes === 2 ? 9.2 : 5.5;
  const sp = 2.2;
  const We = p.entryLanes * 3.7, Wx = p.entryLanes === 2 ? 6 : 4.6;
  const V = We - 0.8;
  const farW = 74, farO = 40;
  const L = buildLayout({ Rc, circW, leg: { yOff: sp, V, E: We, lp: 12, r: 18, Wx, rx: 24, sp }, farW, farO });
  const v = makeView(-farW, -farO, farO, farO, 640);
  const Ri = L.Ri;
  const xA = L.xA;

  // Fastest paths from the west approach: 1.0 m from kerbs, 1.5 m from islands.
  const yE = sp + We - 1.0, yX = sp + Wx - 1.0, rr = Ri + 1.5;
  const through = spline([[-farW, sp + 1.5], [-Rc - 10, yE - 0.4], [-Rc + 3, yE + 2], [0, rr], [Rc - 3, yX + 2], [Rc + 10, yX - 0.4], [farO, sp + 1.5]]);
  const leftTurn = spline([
    [-farW, sp + 1.5], [-Rc - 10, yE - 0.4], [-Rc + 3, yE + 2],
    ...[110, 70, 30, -10, -50].map((a) => [rr * Math.cos(toRad(a)), rr * Math.sin(toRad(a))]),
    [yX + 2, -Rc + 3], [yX - 0.4, -Rc - 10], [sp + 1.5, -farO],
  ]);
  const rightTurn = spline([[-farW, yE], [-Rc - 7, yE], [-Rc + 1, yE + 4.5], [-yX - 4.5, Rc - 1], [-yX, Rc + 7], [-yX, farO]]);

  const tag = (q, name, val, cls) => {
    const [x, y] = v.P(q);
    return (
      <g className={`ptag ${cls}`} transform={`translate(${x},${y})`}>
        <circle r="13" />
        <text y="4" textAnchor="middle">{name}</text>
        <text y="28" textAnchor="middle" className="ptag-v">{`${val.toFixed(0)} km/h`}</text>
      </g>
    );
  };

  const diag = toRad(-40);
  const wc = toRad(45);

  return (
    <div className="plan-wrap">
      <div className="plan-toggle" role="group">
        <button className={layer === "elements" ? "active" : ""} aria-pressed={layer === "elements"} onClick={() => setLayer("elements")}>
          {ar ? "عناصر التصميم" : "Design elements"}
        </button>
        <button className={layer === "paths" ? "active" : ""} aria-pressed={layer === "paths"} onClick={() => setLayer("paths")}>
          {ar ? "المسار الأسرع" : "Fastest paths"}
        </button>
      </div>
      <svg className="tool-svg plan" viewBox={`0 0 ${v.W} ${v.H}`} dir="ltr" role="img" aria-label="FHWA roundabout design elements and fastest paths">
        <Defs />
        <Plan L={L} v={v} Ri={Ri}>
          {layer === "elements" ? (
            <>
              <Dim a={[-Rc * Math.cos(diag), -Rc * Math.sin(diag)]} b={[Rc * Math.cos(diag), Rc * Math.sin(diag)]} v={v} />
              <Dim a={[xA - 1.5, sp]} b={[xA - 1.5, sp + We]} v={v} />
              <Dim a={[xA - 1.5, -sp]} b={[xA - 1.5, -sp - Wx]} v={v} />
              <Dim a={[xA + 2.2, -sp]} b={[xA + 2.2, sp]} v={v} />
              <Dim a={[Ri * Math.cos(wc), Ri * Math.sin(wc)]} b={[Rc * Math.cos(wc), Rc * Math.sin(wc)]} v={v} />
              <Callout v={v} at={[Rc * Math.cos(diag) * 0.5, Rc * Math.sin(diag) * 0.5]} label={[v.W - 196, 30]} lines={["Inscribed circle diameter", "ICD = 46 m"]} />
              <Callout v={v} at={[xA - 1.5, -sp - Wx / 2]} label={[200, 110]} anchor="end" lines={["Exit width", `${Wx.toFixed(1)} m`]} />
              <Callout v={v} at={[xA - 1.5, sp + We / 2]} label={[200, v.H - 110]} anchor="end" lines={["Entry width", `${We.toFixed(1)} m · ${p.entryLanes} lane${p.entryLanes > 1 ? "s" : ""}`]} />
              <Callout v={v} at={[xA + 2.2, 0]} label={[200, v.H - 40]} anchor="end" lines={["Splitter island width", `${(2 * sp).toFixed(1)} m`]} />
              <Callout v={v} at={[(Ri + Rc) / 2 * Math.cos(wc), (Ri + Rc) / 2 * Math.sin(wc)]} label={[v.W - 210, v.H - 40]} lines={["Circulatory roadway width", `${circW} m · ${p.circLanes} lane${p.circLanes > 1 ? "s" : ""}`]} />
            </>
          ) : (
            <>
              <path d={v.d(rightTurn)} className="path p5" />
              <path d={v.d(leftTurn)} className="path p4" />
              <path d={v.d(through)} className="path p1" />
              {tag([-Rc - 5, yE + 9], "R1", speeds.V1, "t1")}
              {tag([0, rr + 5], "R2", speeds.V2, "t1")}
              {tag([Rc + 5, yX + 9], "R3", speeds.V3, "t1")}
              {tag([rr * Math.cos(toRad(-25)) + 6, rr * Math.sin(toRad(-25)) - 3], "R4", speeds.V4, "t4")}
              {tag([-Rc - 9, Rc + 7], "R5", speeds.V5, "t5")}
            </>
          )}
        </Plan>
        <ScaleBar v={v} metres={10} />
        <text x={14} y={40} className="svg-note">FHWA / NCHRP 672 — to scale</text>
      </svg>
      {layer === "paths" && (
        <ul className="path-legend">
          <li><i className="p1" /> {ar ? "المسار المستقيم R1–R3" : "Through R1–R3"}</li>
          <li><i className="p4" /> {ar ? "الانعطاف لليسار R4" : "Left turn R4"}</li>
          <li><i className="p5" /> {ar ? "الانعطاف لليمين R5" : "Right turn R5"}</li>
        </ul>
      )}
    </div>
  );
}
