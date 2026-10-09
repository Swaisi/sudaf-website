// Single-lane roundabout microsimulation for the home page hero.
// Right-hand traffic (counter-clockwise circulation), Intelligent Driver Model
// for car following, and critical-gap acceptance at the give-way lines.
// Units: 1 px = 0.25 m, time in seconds.

export const SIZE = 560; // logical canvas size (square)
const C = SIZE / 2;
export const R = 150; // circulating lane centre-line radius
export const RING_W = 28; // circulating lane width
export const LANE = 12; // approach lane offset from arm axis
const FAR = SIZE / 2 + 24; // where vehicles spawn / despawn
const STOP_R = R + RING_W / 2 + 6; // give-way line distance from centre
const DELTA = 0.34; // rad between arm axis and merge/diverge point
export const M_PER_PX = 0.25;

const IDM = { a: 45, b: 70, s0: 8, T: 0.9, vApproach: 56, vRing: 38 };
const VEH_LEN = 15;
const CRIT_GAP_S = 2.2; // critical gap (s) for entering vehicles

export const ARMS = [0, Math.PI / 2, Math.PI, -Math.PI / 2]; // E, S, W, N (screen coords, y down)
const DEMAND = [0.46, 0.26, 0.4, 0.24]; // veh/s per arm at peak

const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const unit = (ang) => [Math.cos(ang), Math.sin(ang)];
const ringPt = (th) => [C + R * Math.cos(th), C + R * Math.sin(th)];
// counter-clockwise (on screen) travel direction at angle th
const ccwTan = (th) => [Math.sin(th), -Math.cos(th)];

// Inbound vehicles keep right: for heading h the right-hand side is (-h.y, h.x).
export function inLaneOffset(alpha) {
  const u = unit(alpha);
  return [u[1], -u[0]];
}

function cubic(p0, p1, p2, p3, n, out) {
  for (let i = 1; i <= n; i++) {
    const t = i / n, m = 1 - t;
    out.push([
      m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0],
      m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
}

function buildPath(from, to) {
  const alpha = ARMS[from], beta = ARMS[to];
  const u = unit(alpha), w = unit(beta);
  const rIn = inLaneOffset(alpha);
  const rOut = mul(inLaneOffset(beta), -1);

  const a0 = add([C, C], add(mul(u, FAR), mul(rIn, LANE)));
  const a1 = add([C, C], add(mul(u, STOP_R), mul(rIn, LANE)));
  const thJ = alpha - DELTA;
  let thX = beta + DELTA;
  while (thX >= thJ) thX -= 2 * Math.PI;
  if (thJ - thX < 0.6) thX -= 2 * Math.PI; // a U-turn style loop for same-arm exits

  const pts = [a0];
  const approachSteps = Math.ceil((FAR - STOP_R) / 3);
  for (let i = 1; i <= approachSteps; i++) {
    const t = i / approachSteps;
    pts.push([a0[0] + (a1[0] - a0[0]) * t, a0[1] + (a1[1] - a0[1]) * t]);
  }
  const stopIndex = pts.length - 1;

  const j = ringPt(thJ);
  cubic(a1, add(a1, mul(u, -14)), add(j, mul(ccwTan(thJ), -16)), j, 14, pts);
  const ringStart = pts.length - 1;

  const arc = thJ - thX;
  const steps = Math.ceil((arc * R) / 3);
  for (let i = 1; i <= steps; i++) pts.push(ringPt(thJ - (arc * i) / steps));
  const ringEnd = pts.length - 1;

  const x = ringPt(thX);
  const b1 = add([C, C], add(mul(w, STOP_R), mul(rOut, LANE)));
  const b0 = add([C, C], add(mul(w, FAR), mul(rOut, LANE)));
  cubic(x, add(x, mul(ccwTan(thX), 16)), add(b1, mul(w, -14)), b1, 14, pts);
  const exitSteps = Math.ceil((FAR - STOP_R) / 3);
  for (let i = 1; i <= exitSteps; i++) {
    const t = i / exitSteps;
    pts.push([b1[0] + (b0[0] - b1[0]) * t, b1[1] + (b0[1] - b1[1]) * t]);
  }

  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  return {
    pts,
    cum,
    length: cum[cum.length - 1],
    sStop: cum[stopIndex],
    sRingIn: cum[ringStart],
    sRingOut: cum[ringEnd],
    join: j,
  };
}

const paths = ARMS.map((_, from) => ARMS.map((__, to) => buildPath(from, to)));

function sample(path, s) {
  const { pts, cum } = path;
  let lo = 0, hi = cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= s) lo = mid;
    else hi = mid;
  }
  const seg = cum[hi] - cum[lo] || 1;
  const t = Math.min(1, Math.max(0, (s - cum[lo]) / seg));
  const p = pts[lo], q = pts[hi];
  const dx = q[0] - p[0], dy = q[1] - p[1];
  const d = Math.hypot(dx, dy) || 1;
  return { x: p[0] + dx * t, y: p[1] + dy * t, hx: dx / d, hy: dy / d };
}

function pickExit(from, rnd) {
  // right 30%, straight 40%, left 26%, U-turn 4% (counter-clockwise order of arms)
  const r = rnd();
  const k = r < 0.3 ? 1 : r < 0.7 ? 2 : r < 0.96 ? 3 : 4;
  return (from - k + 8) % 4;
}

function idmAccel(v, v0, gap, dv) {
  const sStar = IDM.s0 + Math.max(0, v * IDM.T + (v * dv) / (2 * Math.sqrt(IDM.a * IDM.b)));
  const free = 1 - Math.pow(v / v0, 4);
  if (gap === Infinity) return IDM.a * free;
  return IDM.a * (free - Math.pow(sStar / Math.max(gap, 0.5), 2));
}

export function createSim(seed = 7) {
  let state = seed;
  const rnd = () => ((state = (state * 16807) % 2147483647) / 2147483647);
  return { vehicles: [], time: 0, nextId: 0, rnd, spawnAcc: [0, 0, 0, 0], exited: 0 };
}

function inRing(v) {
  return v.s > v.path.sRingIn - 4 && v.s < v.path.sRingOut;
}

export function step(sim, dt) {
  const { vehicles, rnd } = sim;
  sim.time += dt;

  // Demand rises and falls slowly so queues build and dissipate.
  const peak = 0.75 + 0.25 * Math.sin(sim.time / 22);
  for (let arm = 0; arm < 4; arm++) {
    sim.spawnAcc[arm] += DEMAND[arm] * peak * dt;
    if (sim.spawnAcc[arm] >= 1 && rnd() < 0.5 + dt) {
      const path = paths[arm][pickExit(arm, rnd)];
      const blocked = vehicles.some((o) => o.from === arm && o.s < 30);
      if (!blocked) {
        sim.spawnAcc[arm] -= 1 + rnd() * 0.6;
        vehicles.push({ id: sim.nextId++, from: arm, path, s: 0, v: IDM.vApproach * 0.8, committed: false, stuck: 0 });
      }
    }
  }

  for (const v of vehicles) Object.assign(v, sample(v.path, v.s));

  for (const v of vehicles) {
    const v0 = inRing(v) ? IDM.vRing : v.s > v.path.sRingOut ? IDM.vApproach : Math.max(IDM.vRing, IDM.vApproach - Math.max(0, v.s - (v.path.sStop - 60)) * 0.3);

    // Leader: nearest vehicle ahead in the same lane and travelling the same way.
    let gap = Infinity, dv = 0;
    for (const o of vehicles) {
      if (o === v) continue;
      const rx = o.x - v.x, ry = o.y - v.y;
      const ahead = rx * v.hx + ry * v.hy;
      if (ahead <= 0 || ahead > 90) continue;
      const lateral = Math.abs(-rx * v.hy + ry * v.hx);
      if (lateral > 7 + ahead * 0.12) continue;
      if (o.hx * v.hx + o.hy * v.hy < 0.55) continue;
      const g = ahead - VEH_LEN;
      if (g < gap) {
        gap = g;
        dv = v.v - o.v;
      }
    }
    if (v.stuck > 5) gap = Infinity; // fail-safe against rare mutual blocking

    // Give way to circulating traffic: wait at the line until the critical gap is available.
    if (!v.committed && v.s < v.path.sStop + 1) {
      const toLine = v.path.sStop - v.s;
      if (toLine < 45) {
        const j = v.path.join;
        const reach = IDM.vRing * CRIT_GAP_S + 18;
        const conflict = vehicles.some((o) => {
          if (o === v || !(inRing(o) || (o.committed && o.s < o.path.sRingIn))) return false;
          const dx = j[0] - o.x, dy = j[1] - o.y;
          const d = Math.hypot(dx, dy);
          if (d < 20) return true;
          return d < reach && (dx * o.hx + dy * o.hy) > 0.35 * d;
        });
        if (conflict) {
          if (toLine < gap) {
            gap = Math.max(toLine - 1, 0);
            dv = v.v;
          }
        } else if (toLine < 6) {
          v.committed = true;
        }
      }
    }

    v.acc = Math.max(-IDM.b * 2.5, idmAccel(v.v, v0, gap, dv));
  }

  for (const v of vehicles) {
    v.v = Math.max(0, v.v + v.acc * dt);
    v.s += v.v * dt;
    if (v.s >= v.path.sStop) v.committed = true;
    v.stuck = v.v < 0.5 && v.committed && v.s < v.path.sRingOut ? v.stuck + dt : 0;
  }

  for (let i = vehicles.length - 1; i >= 0; i--) {
    if (vehicles[i].s >= vehicles[i].path.length) {
      vehicles.splice(i, 1);
      sim.exited++;
    }
  }
}

export function stats(sim) {
  const n = sim.vehicles.length;
  const mean = n ? sim.vehicles.reduce((t, v) => t + v.v, 0) / n : 0;
  const queued = sim.vehicles.filter((v) => !v.committed && v.v < 3).length;
  return {
    vehicles: n,
    meanKmh: Math.round(mean * M_PER_PX * 3.6),
    queued,
  };
}

export const geometry = { C, R, RING_W, LANE, FAR, STOP_R, vMax: IDM.vApproach };
