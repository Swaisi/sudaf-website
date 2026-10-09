// Grade-separated roundabout ("throughabout") microsimulation for the home hero.
// - North–south main road crosses the centre on a flyover (2 lanes each way).
// - At-grade two-lane roundabout serves turning and east–west traffic.
//   Lane choice: left turns / U-turns use the inner lane, through traffic mostly
//   the outer lane. Inner-lane vehicles give way to the outer lane when exiting.
// - Free-flow right-turn slip lanes at every corner (added lane on the exit).
// - Right-hand traffic, counter-clockwise circulation.
// - IDM car following; critical-gap acceptance at give-way lines.
// - Mixed fleet: cars, vans, buses, articulated trucks.
// Units: 1 px = 0.25 m, time in seconds.

export const SIZE = 560;
const C = SIZE / 2;
export const R = 130; // centre of the two-lane circulating carriageway
export const RING_W = 30;
export const RADIUS = { o: R + 7, i: R - 7 }; // outer / inner lane centre-lines
const FAR = SIZE / 2 + 140; // spawn / despawn distance from centre (off-canvas so queues can grow)
const STOP_R = R + RING_W / 2 + 7; // give-way line distance along the arm axis
const SLIP_D = 252; // where slip lanes leave / rejoin the arm axis
export const DECK_HALF = 30; // flyover deck half-width
export const M_PER_PX = 0.25;

export const ARMS = [0, Math.PI / 2, Math.PI, -Math.PI / 2]; // E, S, W, N (screen, y down)
export const isMain = (arm) => arm === 1 || arm === 3; // N–S main road
// Lateral offsets from the arm axis: inner entry/exit lane, outer entry/exit lane, slip lane.
export const LANES = {
  i: (arm) => (isMain(arm) ? 40 : 11),
  o: (arm) => (isMain(arm) ? 52 : 23),
  slip: (arm) => (isMain(arm) ? 64 : 35),
  fly: [8, 20],
};

const IDM = { b: 70, s0: 7, T: 0.9 };
const V0 = { approach: 52, ring: 36, slip: 42, fly: 66 };

export const TYPES = {
  car: { len: 15, w: 7.6, a: 45, v0f: 1, crit: 2.2 },
  van: { len: 18, w: 8.4, a: 38, v0f: 0.95, crit: 2.4 },
  bus: { len: 30, w: 9, a: 26, v0f: 0.85, crit: 2.8 },
  truck: { len: 36, w: 9, a: 20, v0f: 0.8, crit: 3.0 },
};

const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const unit = (ang) => [Math.cos(ang), Math.sin(ang)];
const ringPt = (th, r) => [C + r * Math.cos(th), C + r * Math.sin(th)];
const ccwTan = (th) => [Math.sin(th), -Math.cos(th)];
const distC = (p) => Math.hypot(p[0] - C, p[1] - C);

// Inbound vehicles keep right: for heading h the right-hand side is (-h.y, h.x).
export const inSide = (alpha) => {
  const u = unit(alpha);
  return [u[1], -u[0]];
};
const outSide = (alpha) => mul(inSide(alpha), -1);
const armPt = (alpha, along, side, off) => add([C, C], add(mul(unit(alpha), along), mul(side, off)));

function line(a, b, out) {
  const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 3));
  for (let i = 1; i <= n; i++) out.push([a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n]);
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

function finish(pts, extra) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  return { pts, cum, length: cum[cum.length - 1], ...extra };
}

function ringPath(from, to, lane) {
  const alpha = ARMS[from], beta = ARMS[to];
  const r = RADIUS[lane];
  const offIn = LANES[lane](from), offOut = LANES[lane](to);
  const thJ = alpha - (Math.asin(offIn / r) + 0.24);
  let thX = beta + Math.asin(offOut / r) + 0.24;
  while (thX >= thJ) thX -= 2 * Math.PI;
  if (thJ - thX < 0.6) thX -= 2 * Math.PI;

  const a0 = armPt(alpha, FAR, inSide(alpha), offIn);
  const a1 = armPt(alpha, STOP_R, inSide(alpha), offIn);
  const pts = [a0];
  line(a0, a1, pts);
  const iStop = pts.length - 1;

  const j = ringPt(thJ, r);
  cubic(a1, add(a1, mul(unit(alpha), -12)), add(j, mul(ccwTan(thJ), -16)), j, 16, pts);
  const iRingIn = pts.length - 1;

  const arc = thJ - thX;
  const n = Math.ceil((arc * r) / 3);
  for (let i = 1; i <= n; i++) pts.push(ringPt(thJ - (arc * i) / n, r));
  const iRingOut = pts.length - 1;

  const x = ringPt(thX, r);
  const b1 = armPt(beta, STOP_R, outSide(beta), offOut);
  cubic(x, add(x, mul(ccwTan(thX), 16)), add(b1, mul(unit(beta), -12)), b1, 16, pts);
  const iExitEnd = pts.length - 1;
  line(b1, armPt(beta, FAR, outSide(beta), offOut), pts);

  const path = finish(pts, { level: 0, lane, join: j });
  path.sStop = path.cum[iStop];
  path.sRingIn = path.cum[iRingIn];
  path.sRingOut = path.cum[iRingOut];
  path.sExitEnd = path.cum[iExitEnd];

  // Conflict points with circulating traffic.
  path.entryConflicts = [{ pt: j, lane }];
  if (lane === "i") {
    // the entry curve cuts across the outer lane
    const k = pts.findIndex((p, idx) => idx > iStop && distC(p) <= RADIUS.o);
    path.entryConflicts.unshift({ pt: pts[k], lane: "o" });
    // the exit curve cuts across the outer lane
    const q = pts.findIndex((p, idx) => idx > iRingOut && distC(p) >= RADIUS.o);
    path.exitConflict = { pt: pts[q], lane: "o" };
  }
  return path;
}

function slipPath(from) {
  const to = (from + 3) % 4; // first exit counter-clockwise = right turn
  const alpha = ARMS[from], beta = ARMS[to];
  const p0 = armPt(alpha, SLIP_D, inSide(alpha), LANES.slip(from));
  const p3 = armPt(beta, SLIP_D, outSide(beta), LANES.slip(to));
  const pts = [armPt(alpha, FAR, inSide(alpha), LANES.slip(from))];
  line(pts[0], p0, pts);
  cubic(p0, add(p0, mul(unit(alpha), -34)), add(p3, mul(unit(beta), -34)), p3, 30, pts);
  line(p3, armPt(beta, FAR, outSide(beta), LANES.slip(to)), pts);
  return finish(pts, { level: 0, slip: true });
}

function flyPath(from, lane) {
  const alpha = ARMS[from];
  const off = LANES.fly[lane];
  const pts = [armPt(alpha, FAR, inSide(alpha), off)];
  line(pts[0], armPt(alpha, -FAR, inSide(alpha), off), pts);
  return finish(pts, { level: 1 });
}

export const PATHS = {
  ring: {
    o: ARMS.map((_, f) => ARMS.map((__, t) => ringPath(f, t, "o"))),
    i: ARMS.map((_, f) => ARMS.map((__, t) => ringPath(f, t, "i"))),
  },
  slip: ARMS.map((_, f) => slipPath(f)),
  fly: [1, 3].map((f) => [flyPath(f, 0), flyPath(f, 1)]),
};

// Lane choice: outer lane for through traffic; inner lane for left turns,
// U-turns and some through traffic. Right turns use the slip lanes.
const exitArm = (from, k) => (from - k + 8) % 4;
function outerExit(from) {
  return exitArm(from, 2);
}
function innerExit(from, rnd) {
  const r = rnd();
  const k = isMain(from) ? (r < 0.85 ? 3 : 4) : r < 0.35 ? 2 : r < 0.88 ? 3 : 4;
  return exitArm(from, k);
}

function pickType(rnd) {
  const r = rnd();
  return r < 0.68 ? "car" : r < 0.8 ? "van" : r < 0.89 ? "bus" : "truck";
}

// Lane sources with demand in veh/s at typical peak.
const SOURCES = [];
for (let arm = 0; arm < 4; arm++) {
  const main = isMain(arm);
  SOURCES.push({ key: `o${arm}`, rate: main ? 0.04 : 0.2, path: () => PATHS.ring.o[arm][outerExit(arm)] });
  SOURCES.push({ key: `i${arm}`, rate: main ? 0.13 : 0.17, path: (rnd) => PATHS.ring.i[arm][innerExit(arm, rnd)] });
  SOURCES.push({ key: `s${arm}`, rate: main ? 0.07 : 0.1, path: () => PATHS.slip[arm] });
  if (main) {
    const fi = arm === 1 ? 0 : 1;
    SOURCES.push({ key: `f${arm}0`, rate: 0.3, path: () => PATHS.fly[fi][0] });
    SOURCES.push({ key: `f${arm}1`, rate: 0.24, path: () => PATHS.fly[fi][1] });
  }
}

export function sample(path, s) {
  const { pts, cum } = path;
  const sc = Math.min(Math.max(s, 0), path.length);
  let lo = 0, hi = cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= sc) lo = mid;
    else hi = mid;
  }
  const seg = cum[hi] - cum[lo] || 1;
  const t = (sc - cum[lo]) / seg;
  const p = pts[lo], q = pts[hi];
  const dx = q[0] - p[0], dy = q[1] - p[1];
  const d = Math.hypot(dx, dy) || 1;
  return { x: p[0] + dx * t, y: p[1] + dy * t, hx: dx / d, hy: dy / d };
}

function idmAccel(v, v0, a, gap, dv) {
  const sStar = IDM.s0 + Math.max(0, v * IDM.T + (v * dv) / (2 * Math.sqrt(a * IDM.b)));
  const free = 1 - Math.pow(v / v0, 4);
  if (gap === Infinity) return a * free;
  return a * (free - Math.pow(sStar / Math.max(gap, 0.5), 2));
}

// Demand multiplier per scenario: free flow, typical peak, oversaturated.
export const MODES = { free: 0.35, peak: 0.62, jam: 3.2 };

export function createSim(seed = 7) {
  let state = (seed % 2147483646) + 1;
  const rnd = () => ((state = (state * 16807) % 2147483647) / 2147483647);
  return { vehicles: [], time: 0, nextId: 0, rnd, acc: {}, exited: 0, mode: "peak", demand: 1, delays: [] };
}

export function setMode(sim, mode) {
  sim.mode = mode;
  sim.delays = [];
}

// On the circular arc itself (not on the entry or exit curves).
const onArc = (v) => v.path.lane && v.s > v.path.sRingIn && v.s < v.path.sRingOut;
// Anywhere a circulating vehicle can block others: entry curve to end of exit curve.
const inRingZone = (v) => v.path.lane && v.s > v.path.sRingIn - 20 && v.s < v.path.sExitEnd;

function conflictAt(vehicles, self, { pt, lane }, crit) {
  const reach = V0.ring * crit + 18;
  return vehicles.some((o) => {
    if (o === self || o.path.level !== 0 || !(inRingZone(o) || (o.committed && o.s < o.path.sRingIn))) return false;
    const dx = pt[0] - o.x, dy = pt[1] - o.y;
    const d = Math.hypot(dx, dy);
    if (d < 11 + o.type.len / 2) return true; // physically occupying the conflict area
    // approaching in the conflicting lane
    return onArc(o) && o.path.lane === lane && d < reach && dx * o.hx + dy * o.hy > 0.35 * d;
  });
}

export function step(sim, dt) {
  const { vehicles, rnd } = sim;
  sim.time += dt;

  const target = MODES[sim.mode] * (1 + 0.15 * Math.sin(sim.time / 15));
  sim.demand += (target - sim.demand) * Math.min(1, dt * 0.8);
  const peak = Math.max(0.2, sim.demand);
  for (const src of SOURCES) {
    sim.acc[src.key] = (sim.acc[src.key] || 0) + src.rate * peak * dt;
    if (sim.acc[src.key] < 1) continue;
    const typeName = src.next || (src.next = pickType(rnd));
    const type = TYPES[typeName];
    // the rear of the last vehicle in this lane must be clear of the new vehicle
    const blocked = vehicles.some((o) => o.src === src.key && o.s - o.type.len / 2 < type.len + IDM.s0 + 4);
    if (blocked) continue;
    src.next = null;
    sim.acc[src.key] -= 1 + rnd() * 0.5;
    vehicles.push({
      id: sim.nextId++,
      src: src.key,
      kind: typeName,
      type,
      path: src.path(rnd),
      s: type.len / 2,
      v: 40 * type.v0f,
      committed: false,
      exitCommitted: false,
      stuck: 0,
    });
  }

  for (const v of vehicles) {
    Object.assign(v, sample(v.path, v.s));
    v.theta = Math.atan2(v.y - C, v.x - C);
  }

  for (const v of vehicles) {
    const p = v.path;
    let v0;
    if (p.level === 1) v0 = V0.fly;
    else if (p.slip) v0 = V0.slip;
    else if (v.s > p.sRingIn - 4 && v.s < p.sRingOut) v0 = V0.ring;
    else if (v.s > p.sRingOut) v0 = V0.approach;
    else v0 = Math.max(V0.ring, V0.approach - Math.max(0, v.s - (p.sStop - 60)) * 0.3);
    v0 *= v.type.v0f;

    // Leader search. Two vehicles on the arc: same lane only, arc distance.
    // Otherwise: nearest vehicle ahead, same level, same lane, same direction.
    let gap = Infinity, dv = 0;
    const vArc = onArc(v);
    for (const o of vehicles) {
      if (o === v || o.path.level !== p.level) continue;
      let ahead;
      if (vArc && onArc(o)) {
        if (o.path.lane !== p.lane) continue;
        let dth = v.theta - o.theta; // counter-clockwise = decreasing angle
        if (dth < 0) dth += 2 * Math.PI;
        ahead = dth * RADIUS[p.lane];
        if (ahead <= 0 || ahead > 100) continue;
      } else {
        const rx = o.x - v.x, ry = o.y - v.y;
        ahead = rx * v.hx + ry * v.hy;
        if (ahead <= 0 || ahead > 100) continue;
        const lateral = Math.abs(-rx * v.hy + ry * v.hx);
        if (lateral > 5 + ahead * 0.05) continue;
        if (o.hx * v.hx + o.hy * v.hy < 0.55) continue;
      }
      const g = ahead - (v.type.len + o.type.len) / 2;
      if (g < gap) {
        gap = g;
        dv = v.v - o.v;
      }
    }
    if (v.stuck > 15) gap = Infinity; // fail-safe against rare mutual blocking

    const stopAt = (dist) => {
      if (dist < gap) {
        gap = Math.max(dist - 1, 0);
        dv = v.v;
      }
    };

    // Give way to circulating traffic until the critical gap is available.
    if (p.sStop !== undefined && !v.committed) {
      const toLine = p.sStop - (v.s + v.type.len / 2); // measured from the front bumper
      if (toLine < 50) {
        const blocked = p.entryConflicts.some((c) => conflictAt(vehicles, v, c, v.type.crit));
        if (blocked) stopAt(toLine);
        else if (toLine < 6) v.committed = true;
      }
    }

    // Inner-lane vehicles give way to the outer lane before crossing it to exit.
    if (p.exitConflict && !v.exitCommitted && v.s > p.sRingIn) {
      const toExit = p.sRingOut - (v.s + v.type.len / 2);
      if (toExit < 40) {
        if (v.stuck < 10 && conflictAt(vehicles, v, p.exitConflict, 1.6)) stopAt(toExit);
        else if (toExit < 4) v.exitCommitted = true;
      }
    }

    v.accel = Math.max(-IDM.b * 2.5, idmAccel(v.v, v0, v.type.a, gap, dv));
    // Control delay for roundabout users: time lost relative to desired speed.
    if (p.lane && v.s < p.sRingOut) v.delay = (v.delay || 0) + dt * Math.max(0, 1 - v.v / v0);
  }

  for (const v of vehicles) {
    v.v = Math.max(0, v.v + v.accel * dt);
    v.s += v.v * dt;
    if (v.path.sStop === undefined || v.s + v.type.len / 2 >= v.path.sStop + 1) v.committed = true;
    if (v.path.sRingOut !== undefined && v.s + v.type.len / 2 >= v.path.sRingOut + 1) v.exitCommitted = true;
    v.stuck = v.v < 0.5 && v.committed && v.path.lane && v.s < v.path.sRingOut ? v.stuck + dt : 0;
  }

  for (const v of vehicles) {
    if (v.delay !== undefined && !v.logged && v.s >= v.path.sRingOut) {
      v.logged = true;
      sim.delays.push(v.delay);
      if (sim.delays.length > 20) sim.delays.shift();
    }
  }

  for (let i = vehicles.length - 1; i >= 0; i--) {
    if (vehicles[i].s - vehicles[i].type.len / 2 >= vehicles[i].path.length) {
      vehicles.splice(i, 1);
      sim.exited++;
    }
  }
}

export function stats(sim) {
  const onCanvas = sim.vehicles.filter((v) => v.x > -10 && v.x < SIZE + 10 && v.y > -10 && v.y < SIZE + 10);
  const n = onCanvas.length;
  const mean = n ? onCanvas.reduce((t, v) => t + v.v, 0) / n : 0;
  // Average control delay over recently served vehicles plus those still queuing,
  // so the reading responds while queues are building. HCM roundabout LOS thresholds.
  const waiting = sim.vehicles.filter((v) => v.delay !== undefined && !v.logged && v.delay > 1).map((v) => v.delay);
  const all = sim.delays.concat(waiting);
  const d = all.length ? all.reduce((a, b) => a + b, 0) / all.length : 0;
  const los = d <= 10 ? "A" : d <= 15 ? "B" : d <= 25 ? "C" : d <= 35 ? "D" : d <= 50 ? "E" : "F";
  return {
    vehicles: n,
    meanKmh: Math.round(mean * M_PER_PX * 3.6),
    queued: onCanvas.filter((v) => !v.committed && v.v < 3).length,
    delay: Math.round(d),
    los,
  };
}

export const geometry = { C, R, RING_W, FAR, STOP_R, SLIP_D, vMax: V0.fly };
