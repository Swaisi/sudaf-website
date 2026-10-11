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

function Plan({ L, v, Ri, apron = 0, children }) {
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
      <circle cx={cx} cy={cy} r={Ri * v.s} className={apron ? "kerb apron-ring" : "kerb island"} />
      {apron > 0 && <circle cx={cx} cy={cy} r={(Ri - apron) * v.s} className="kerb island" />}
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
   FHWA / NCHRP 672 — geometry-driven fastest paths
   Geometry -> fastest paths (1.5 m from islands, 1.0 m from kerbs) ->
   R1–R5 measured on the drawn paths -> speeds (NCHRP 672 Eq. 6-1/6-2).
====================================================================== */

export const US_GEOM_DEFAULT = {
  ICD: 50, circW: 9.2, We: 7.4, Wx: 6.0, splitter: 4.4, rIn: 20, rOut: 30, apron: 3,
};

// Signed radius of the circle through three points (+ = right-hand bend on screen).
function circle3(a, b, c) {
  const [ax, ay] = a, [bx, by] = b, [cx, cy] = c;
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  if (Math.abs(d) < 1e-9) return null;
  const a2 = ax * ax + ay * ay, b2 = bx * bx + by * by, c2 = cx * cx + cy * cy;
  const ux = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / d;
  const uy = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d;
  const cross = (bx - ax) * (cy - by) - (by - ay) * (cx - bx);
  return { r: Math.hypot(ax - ux, ay - uy), sign: Math.sign(cross), c: [ux, uy] };
}

function resample(pts, step = 0.5) {
  const out = [pts[0]];
  let need = step;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    let t = need;
    while (t <= seg) {
      out.push([x0 + ((x1 - x0) * t) / seg, y0 + ((y1 - y0) * t) / seg]);
      t += step;
    }
    need = t - seg;
  }
  return out;
}

// Smallest radius of the requested bend direction within a region of the path,
// measured over a ~20 m arc (three points 10 m apart along the path).
function measure(path, sign, inRegion) {
  const k = 20; // 20 samples x 0.5 m = 10 m
  let best = null;
  for (let i = k; i < path.length - k; i++) {
    const pt = path[i];
    if (!inRegion(pt)) continue;
    const c = circle3(path[i - k], pt, path[i + k]);
    if (!c || c.sign !== sign) continue;
    if (!best || c.r < best.r) best = { r: c.r, at: pt, c: c.c };
  }
  return best;
}

// Point at the middle of a kerb fillet, moved `off` metres into the carriageway.
function fil(f, R, off) {
  const mid = arcBetween(f.c, f.t1, f.t2, 2)[1];
  const k = (f.r + off) / f.r;
  return rot([f.c[0] + (mid[0] - f.c[0]) * k, f.c[1] + (mid[1] - f.c[1]) * k], R);
}

export function usGeometry(g) {
  const Rc = g.ICD / 2;
  const circW = Math.min(g.circW, Rc - 6);
  const Ri = Rc - circW;
  const sp = g.splitter / 2;
  const farO = Math.max(40, Rc + 18);
  const farW = farO + 34;
  const L = buildLayout({
    Rc,
    circW,
    leg: { yOff: sp, V: g.We - 0.8, E: g.We, lp: 12, r: g.rIn, Wx: g.Wx, rx: g.rOut, sp },
    farW,
    farO,
  });
  const xA = L.xA;
  // rotations applied to the local (west-pointing) leg geometry
  const W = 0, S = -Math.PI / 2, E = Math.PI, N = Math.PI / 2;
  const rr = Ri + 1.5;
  const islandPt = (deg) => [rr * Math.cos(toRad(deg)), rr * Math.sin(toRad(deg))];
  const approach = [[-farW, sp + 1.5], [xA - 14, sp + 1.5]];
  const entry = fil(L.ent, W, 1.0);
  const exitTo = (R) => [fil(L.ext, R, 1.0), rot([xA - 14, -(sp + 1.5)], R), rot([-farO - 2, -(sp + 1.5)], R)];

  const through = resample(spline([...approach, entry, islandPt(90), ...exitTo(E)], 24));
  // left turn: follows the island at 1.5 m offset between the entry and exit transitions
  const [exN, ...exRest] = exitTo(N);
  const gapTo = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const arc = [];
  for (let a = 120; a >= -75; a -= 6) {
    const q = islandPt(a);
    // keep only the part of the circle clear of the entry and exit transitions
    if (gapTo(q, entry) > Rc * 0.45 && gapTo(q, exN) > Rc * 0.45) arc.push(q);
  }
  const left = resample(spline([...approach, entry, ...arc, exN, ...exRest], 12));
  const yR = sp + g.We - 1.0, yRx = sp + g.Wx - 1.0;
  const right = resample(
    spline([[-farW, yR], [xA - 10, yR], fil(L.ent, W, 1.0), fil(L.ext, S, 1.0), rot([xA - 10, -yRx], S), rot([-farO - 2, -yRx], S)], 24)
  );

  const zone = Ri * 0.75;
  const radii = {
    R1: measure(through, 1, (q) => q[0] < -zone),
    R2: measure(through, -1, (q) => Math.abs(q[0]) <= zone),
    R3: measure(through, 1, (q) => q[0] > zone),
    R4: measure(left, -1, (q) => Math.hypot(q[0], q[1]) < Rc),
    R5: measure(right, 1, () => true),
  };
  return { Rc, Ri, circW, sp, farW, farO, L, xA, through, left, right, radii };
}

export function UsDiagram({ geo, g, p, speeds, ar }) {
  const [layer, setLayer] = useState("paths");
  const { Rc, Ri, circW, sp, farW, farO, L, xA, radii } = geo;
  const v = makeView(-farW, -farO, farO, farO, 640);
  const diag = toRad(-40);
  const wc = toRad(45);

  // Fitted radius: short arc of the fitted circle, radius line and centre point.
  const mark = (m, cls, key) => {
    if (!m) return null;
    const a = Math.atan2(m.at[1] - m.c[1], m.at[0] - m.c[0]);
    const span = Math.min(0.6, 14 / m.r);
    const arc = Array.from({ length: 21 }, (_, i) => {
      const t = a - span + (2 * span * i) / 20;
      return [m.c[0] + m.r * Math.cos(t), m.c[1] + m.r * Math.sin(t)];
    });
    const near = m.r < 60;
    const from = near ? m.c : [m.at[0] - ((m.at[0] - m.c[0]) * 12) / m.r, m.at[1] - ((m.at[1] - m.c[1]) * 12) / m.r];
    return (
      <g key={key} className={`rmark ${cls}`}>
        <path d={v.d(arc)} />
        <path d={v.d([from, m.at])} className="rline" />
        {near && <circle cx={v.P(m.c)[0]} cy={v.P(m.c)[1]} r="2.5" />}
      </g>
    );
  };

  const placed = [];
  const tag = (name, cls, val) => {
    const m = radii[name];
    if (!m) return null;
    const dx = m.at[0] - m.c[0], dy = m.at[1] - m.c[1], k = 7 / Math.hypot(dx, dy);
    let [x, y] = v.P([m.at[0] + dx * k, m.at[1] + dy * k]);
    // nudge away from labels already placed
    for (let n = 0; n < 6 && placed.some(([px, py]) => Math.abs(px - x) < 90 && Math.abs(py - y) < 44); n++) y += 46;
    y = Math.min(y, v.H - 40);
    placed.push([x, y]);
    return (
      <g key={name} className={`ptag ${cls}`} transform={`translate(${x},${y})`}>
        <circle r="13" />
        <text y="4" textAnchor="middle">{name}</text>
        <text y="28" textAnchor="middle" className="ptag-v">{`${Math.round(m.r)} m · ${val.toFixed(0)} km/h`}</text>
      </g>
    );
  };

  return (
    <div className="plan-wrap">
      <div className="plan-toggle" role="group">
        <button className={layer === "paths" ? "active" : ""} aria-pressed={layer === "paths"} onClick={() => setLayer("paths")}>
          {ar ? "المسار الأسرع" : "Fastest paths"}
        </button>
        <button className={layer === "elements" ? "active" : ""} aria-pressed={layer === "elements"} onClick={() => setLayer("elements")}>
          {ar ? "عناصر التصميم" : "Design elements"}
        </button>
      </div>
      <svg className="tool-svg plan" viewBox={`0 0 ${v.W} ${v.H}`} dir="ltr" role="img" aria-label="FHWA roundabout design elements and fastest paths, to scale">
        <Defs />
        <Plan L={L} v={v} Ri={Ri} apron={g.apron}>
          {layer === "elements" ? (
            <>
              <Dim a={[-Rc * Math.cos(diag), -Rc * Math.sin(diag)]} b={[Rc * Math.cos(diag), Rc * Math.sin(diag)]} v={v} />
              <Dim a={[xA - 1.5, sp]} b={[xA - 1.5, sp + g.We]} v={v} />
              <Dim a={[xA - 1.5, -sp]} b={[xA - 1.5, -sp - g.Wx]} v={v} />
              <Dim a={[xA + 2.2, -sp]} b={[xA + 2.2, sp]} v={v} />
              <Dim a={[Ri * Math.cos(wc), Ri * Math.sin(wc)]} b={[Rc * Math.cos(wc), Rc * Math.sin(wc)]} v={v} />
              <Callout v={v} at={[Rc * Math.cos(diag) * 0.5, Rc * Math.sin(diag) * 0.5]} label={[v.W - 196, 30]} lines={["Inscribed circle diameter", `ICD = ${g.ICD} m`]} />
              <Callout v={v} at={[xA - 1.5, -sp - g.Wx / 2]} label={[200, 110]} anchor="end" lines={["Exit width", `${g.Wx} m`]} />
              <Callout v={v} at={[xA - 1.5, sp + g.We / 2]} label={[200, v.H - 110]} anchor="end" lines={["Entry width", `${g.We} m · ${p.entryLanes} lane${p.entryLanes > 1 ? "s" : ""}`]} />
              <Callout v={v} at={[xA + 2.2, 0]} label={[200, v.H - 40]} anchor="end" lines={["Splitter island width", `${g.splitter} m`]} />
              <Callout v={v} at={[((Ri + Rc) / 2) * Math.cos(wc), ((Ri + Rc) / 2) * Math.sin(wc)]} label={[v.W - 210, v.H - 40]} lines={["Circulatory roadway width", `${circW} m · ${p.circLanes} lane${p.circLanes > 1 ? "s" : ""}`]} />
              {g.apron > 0 && <Callout v={v} at={[0, -(Ri - g.apron / 2)]} label={[v.W - 196, 92]} lines={["Truck apron", `${g.apron} m`]} />}
            </>
          ) : (
            <>
              <path d={v.d(geo.right)} className="path p5" />
              <path d={v.d(geo.left)} className="path p4" />
              <path d={v.d(geo.through)} className="path p1" />
              {mark(radii.R5, "t5", "m5")}
              {mark(radii.R4, "t4", "m4")}
              {mark(radii.R1, "t1", "m1")}
              {mark(radii.R2, "t1", "m2")}
              {mark(radii.R3, "t1", "m3")}
              {tag("R1", "t1", speeds.V1)}
              {tag("R2", "t1", speeds.V2)}
              {tag("R3", "t1", speeds.V3)}
              {tag("R4", "t4", speeds.V4)}
              {tag("R5", "t5", speeds.V5)}
            </>
          )}
        </Plan>
        <ScaleBar v={v} metres={10} />
        <text x={14} y={40} className="svg-note">FHWA / NCHRP 672 — to scale · radii measured on drawn paths</text>
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
