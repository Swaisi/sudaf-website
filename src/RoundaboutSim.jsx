import { useEffect, useRef, useState } from "react";
import TrendChart from "./TrendChart";
import { drawEnvironment } from "./drawEnvironment";
import {
  ARMS, DECK_HALF, LANES, PATHS, R, RING_W, SIZE,
  createSim, geometry, inSide, isMain, sample, setMode, stats, step,
} from "./sim/roundabout";

const { C, STOP_R, SLIP_D, vMax } = geometry;
const ASPHALT = "#1d3249";
const LANE_W = 13;

// slow -> fast: red, amber, gold, pale gold
const STOPS = [
  [0, [229, 72, 77]],
  [0.3, [245, 165, 36]],
  [0.65, [214, 180, 106]],
  [1, [246, 233, 200]],
];

function speedColor(ratio) {
  const r = Math.min(1, Math.max(0, ratio));
  for (let i = 1; i < STOPS.length; i++) {
    if (r <= STOPS[i][0]) {
      const [p0, c0] = STOPS[i - 1], [p1, c1] = STOPS[i];
      const t = (r - p0) / (p1 - p0);
      return `rgb(${c0.map((c, k) => Math.round(c + (c1[k] - c) * t)).join(",")})`;
    }
  }
  return "rgb(246,233,200)";
}

const LOS_COLORS = { A: "#3ddc84", B: "#8fd14f", C: "#d6c94a", D: "#f5a524", E: "#f07a2a", F: "#e5484d" };

function strokePath(ctx, path) {
  ctx.beginPath();
  path.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
}

const armPoint = (alpha, along, off) => {
  const u = [Math.cos(alpha), Math.sin(alpha)], s = inSide(alpha);
  return [C + u[0] * along + s[0] * off, C + u[1] * along + s[1] * off];
};

// Static ground layer: carriageways, island landscaping and markings.
function drawGround(ctx) {
  const roadPaths = [...PATHS.ring.o.flat(), ...PATHS.ring.i.flat(), ...PATHS.slip];
  drawEnvironment(ctx, SIZE, roadPaths, { C, R, ringW: RING_W, deckHalf: DECK_HALF });

  ctx.lineCap = "butt";
  ctx.lineJoin = "round";

  // Arm carriageways (both directions, ring and slip lanes)
  ctx.fillStyle = ASPHALT;
  for (let a = 0; a < 4; a++) {
    const alpha = ARMS[a];
    const inner = isMain(a) ? LANES.i(a) - LANE_W / 2 - 1 : 0;
    // entry/exit lanes run all the way in; slip lanes only until they peel off
    const bands = [
      [R, LANES.o(a) + LANE_W / 2 + 1],
      [SLIP_D, LANES.slip(a) + LANE_W / 2 + 1],
    ];
    for (const [from, outer] of bands) {
      for (const sign of [1, -1]) {
        const p = [armPoint(alpha, from, sign * inner), armPoint(alpha, SIZE, sign * inner), armPoint(alpha, SIZE, sign * outer), armPoint(alpha, from, sign * outer)];
        ctx.beginPath();
        p.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.fill();
      }
    }
  }

  // Lane surfaces along every movement, plus the circulating carriageway
  ctx.strokeStyle = ASPHALT;
  ctx.lineWidth = LANE_W + 2;
  for (const lane of ["o", "i"]) PATHS.ring[lane].forEach((row) => row.forEach((p) => strokePath(ctx, p)));
  PATHS.slip.forEach((p) => strokePath(ctx, p));
  ctx.lineWidth = RING_W + 4;
  ctx.beginPath();
  ctx.arc(C, C, R, 0, Math.PI * 2);
  ctx.stroke();

  // Ring edge lines and the dashed line between the two circulating lanes
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1;
  for (const r of [R - RING_W / 2 - 2, R + RING_W / 2 + 2]) {
    ctx.beginPath();
    ctx.arc(C, C, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.arc(C, C, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Landscaped central island
  const islandR = R - RING_W / 2 - 5;
  const grass = ctx.createRadialGradient(C, C, 10, C, C, islandR);
  grass.addColorStop(0, "#2f6b45");
  grass.addColorStop(1, "#24563a");
  ctx.fillStyle = grass;
  ctx.beginPath();
  ctx.arc(C, C, islandR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(214,180,106,0.7)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Trees and flower beds (deterministic layout)
  let seed = 3;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 46; i++) {
    const ang = rnd() * Math.PI * 2;
    const rad = 30 + rnd() * (islandR - 42);
    const x = C + Math.cos(ang) * rad, y = C + Math.sin(ang) * rad;
    if (Math.abs(x - C) < DECK_HALF + 8) continue;
    const big = rnd() < 0.55;
    ctx.fillStyle = big ? "rgba(26,72,44,0.95)" : rnd() < 0.5 ? "rgba(214,120,160,0.75)" : "rgba(214,180,106,0.7)";
    ctx.beginPath();
    ctx.arc(x, y, big ? 5 + rnd() * 4 : 2.2, 0, Math.PI * 2);
    ctx.fill();
    if (big) {
      ctx.fillStyle = "rgba(90,150,95,0.55)";
      ctx.beginPath();
      ctx.arc(x - 1.5, y - 1.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Arm markings
  for (let a = 0; a < 4; a++) {
    const alpha = ARMS[a];
    const u = [Math.cos(alpha), Math.sin(alpha)], side = inSide(alpha);
    const offI = LANES.i(a), offO = LANES.o(a), offS = LANES.slip(a);

    // Dashed lane lines: between the two entry/exit lanes, and beside the slip lane
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    ctx.setLineDash([7, 7]);
    for (const sign of [1, -1]) {
      for (const [off, until] of [[(offI + offO) / 2, STOP_R + 4], [(offO + offS) / 2, SLIP_D]]) {
        ctx.beginPath();
        ctx.moveTo(...armPoint(alpha, SIZE, sign * off));
        ctx.lineTo(...armPoint(alpha, until, sign * off));
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);

    // Splitter island / median
    if (!isMain(a)) {
      ctx.fillStyle = "rgba(214,180,106,0.22)";
      ctx.beginPath();
      ctx.moveTo(...armPoint(alpha, STOP_R - 2, 0));
      ctx.lineTo(...armPoint(alpha, STOP_R + 56, 3.5));
      ctx.lineTo(...armPoint(alpha, SIZE, 2.5));
      ctx.lineTo(...armPoint(alpha, SIZE, -2.5));
      ctx.lineTo(...armPoint(alpha, STOP_R + 56, -3.5));
      ctx.closePath();
      ctx.fill();
    }

    // Give-way "shark teeth" across both entry lanes
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    for (let k = -4; k <= 4; k++) {
      const off = (offI + offO) / 2 + k * 2.9;
      const bx = C + u[0] * (STOP_R + 1) + side[0] * off;
      const by = C + u[1] * (STOP_R + 1) + side[1] * off;
      ctx.beginPath();
      ctx.moveTo(bx - side[0] * 1.2, by - side[1] * 1.2);
      ctx.lineTo(bx + side[0] * 1.2, by + side[1] * 1.2);
      ctx.lineTo(bx + u[0] * 4, by + u[1] * 4);
      ctx.closePath();
      ctx.fill();
    }
  }
}

// Flyover deck with shadow, parapets and lane markings.
function drawDeck(ctx) {
  ctx.fillStyle = "rgba(0,0,0,0.38)";
  ctx.fillRect(C - DECK_HALF + 9, 0, DECK_HALF * 2, SIZE);

  const g = ctx.createLinearGradient(C - DECK_HALF, 0, C + DECK_HALF, 0);
  g.addColorStop(0, "#2c4766");
  g.addColorStop(0.5, "#32506f");
  g.addColorStop(1, "#2c4766");
  ctx.fillStyle = g;
  ctx.fillRect(C - DECK_HALF, 0, DECK_HALF * 2, SIZE);

  // Parapets
  ctx.fillStyle = "rgba(230,236,245,0.75)";
  ctx.fillRect(C - DECK_HALF, 0, 2.5, SIZE);
  ctx.fillRect(C + DECK_HALF - 2.5, 0, 2.5, SIZE);

  // Median (double gold line) and lane lines
  ctx.fillStyle = "rgba(214,180,106,0.9)";
  ctx.fillRect(C - 2, 0, 1.2, SIZE);
  ctx.fillRect(C + 0.8, 0, 1.2, SIZE);
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 1;
  ctx.setLineDash([9, 9]);
  for (const x of [C - 14, C + 14]) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, SIZE);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Expansion joints where the deck passes over the ring
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  for (const y of [C - R - RING_W, C + R + RING_W]) ctx.fillRect(C - DECK_HALF, y, DECK_HALF * 2, 1.5);
}

// Draws a body segment that follows the path between two arc-length positions.
function segment(ctx, path, sFront, sRear, width, fill, radius = 2) {
  const f = sample(path, sFront), r = sample(path, sRear);
  const dx = f.x - r.x, dy = f.y - r.y;
  const len = Math.hypot(dx, dy) || 1;
  ctx.save();
  ctx.translate((f.x + r.x) / 2, (f.y + r.y) / 2);
  ctx.rotate(Math.atan2(dy, dx));
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(-len / 2, -width / 2, len, width, radius);
  ctx.fill();
  return len; // caller restores
}

function drawVehicle(ctx, v) {
  const { len, w } = v.type;
  const body = speedColor(v.v / vMax);
  const front = v.s + len / 2, rear = v.s - len / 2;
  const glass = "rgba(12,31,51,0.6)";

  if (v.kind === "truck") {
    // Trailer, then cab — each follows the path so the rig articulates on curves.
    const tl = segment(ctx, v.path, front - 10, rear, w, "rgba(226,232,240,0.92)", 1.5);
    ctx.fillStyle = body;
    ctx.fillRect(-tl / 2 + 2, -w / 2 + 1.5, tl - 4, w - 3);
    ctx.restore();
    const cl = segment(ctx, v.path, front, front - 9, w - 0.6, body, 2);
    ctx.fillStyle = glass;
    ctx.fillRect(cl / 2 - 3.2, -w / 2 + 1.2, 2.2, w - 2.4);
    ctx.restore();
    return;
  }

  const l = segment(ctx, v.path, front, rear, w, body, v.kind === "bus" ? 2.5 : 2.2);
  if (v.kind === "bus") {
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(-l / 2 + 3, -w / 2 + 1.6, l - 7, w - 3.2); // roof panel
    ctx.fillStyle = glass;
    ctx.fillRect(l / 2 - 3, -w / 2 + 1.2, 2, w - 2.4);
  } else {
    ctx.fillStyle = glass;
    ctx.fillRect(l * 0.12, -w / 2 + 1.1, l * 0.18, w - 2.2); // windscreen
    if (v.kind === "van") ctx.fillRect(-l / 2 + 1.5, -w / 2 + 1.4, l * 0.5, w - 2.8);
    else ctx.fillRect(-l * 0.38, -w / 2 + 1.4, l * 0.14, w - 2.8);
  }
  ctx.restore();
}

const HISTORY_S = 90;

// Advance the simulation and sample delay / queue once per simulated second.
function advance(sim, dt) {
  step(sim, dt);
  if (sim.time - (sim.lastSample || 0) >= 1) {
    sim.lastSample = sim.time;
    const st = stats(sim);
    sim.history = (sim.history || []).concat({ t: sim.time, delay: st.delay, queued: st.queued }).slice(-HISTORY_S);
  }
}

// A fresh scenario starts from typical demand and is fast-forwarded until its
// state has developed: `ff` steps are played back as a short time-lapse.
function newSim(mode) {
  const sim = createSim(Date.now() % 100000);
  setMode(sim, mode);
  sim.demand = 1;
  sim.ff = (mode === "jam" ? 100 : 60) * 30;
  return sim;
}

function fastForward(sim, maxSteps) {
  const k = Math.min(sim.ff, maxSteps);
  for (let i = 0; i < k; i++) advance(sim, 1 / 30);
  sim.ff -= k;
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const SCENARIOS = [
  { id: "free", en: "Free flow", ar: "تدفق حر" },
  { id: "peak", en: "Peak hour", ar: "ساعة الذروة" },
  { id: "jam", en: "Congestion", ar: "ازدحام" },
];

export default function RoundaboutSim({ ar }) {
  const canvasRef = useRef(null);
  const simRef = useRef(null);
  const [mode, setModeState] = useState("peak");
  const [hud, setHud] = useState({ vehicles: 0, meanKmh: 0, queued: 0, delay: 0, los: "A", history: [] });

  const choose = (id) => {
    setModeState(id);
    if (!simRef.current) return;
    // Load the scenario fresh; the animation loop fast-forwards it as a time-lapse.
    const sim = newSim(id);
    if (reducedMotion()) fastForward(sim, Infinity);
    Object.assign(simRef.current, sim, { history: [], lastSample: 0 });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);

    const layer = (draw) => {
      const c = document.createElement("canvas");
      c.width = SIZE * dpr;
      c.height = SIZE * dpr;
      const x = c.getContext("2d");
      x.scale(dpr, dpr);
      draw(x);
      return c;
    };
    const ground = layer(drawGround);
    const deck = layer(drawDeck);

    const sim = newSim("peak");
    fastForward(sim, 20 * 30); // enough for a populated first frame
    simRef.current = sim;

    const render = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.drawImage(ground, 0, 0, SIZE, SIZE);
      for (const v of sim.vehicles) if (v.path.level === 0 && v.x !== undefined) drawVehicle(ctx, v);
      ctx.drawImage(deck, 0, 0, SIZE, SIZE);
      for (const v of sim.vehicles) if (v.path.level === 1 && v.x !== undefined) drawVehicle(ctx, v);
    };

    if (reducedMotion()) {
      fastForward(sim, Infinity);
      render();
      setHud({ ...stats(sim), history: sim.history || [], ff: sim.ff > 0 });
      return;
    }

    let raf = 0, last = 0, visible = true, hudTimer = 0;
    const frame = (t) => {
      const dt = Math.min(0.05, (t - last) / 1000 || 0);
      last = t;
      if (sim.ff > 0) fastForward(sim, 90);
      else {
        const sub = Math.ceil(dt / (1 / 60));
        for (let i = 0; i < sub; i++) advance(sim, dt / sub);
      }
      render();
      hudTimer += dt;
      if (hudTimer > 0.5 || sim.ff > 0) {
        hudTimer = 0;
        setHud({ ...stats(sim), history: sim.history || [], ff: sim.ff > 0 });
      }
      raf = visible ? requestAnimationFrame(frame) : 0;
    };
    const start = () => {
      if (!raf && visible && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // Pause when scrolled out of view or the tab is hidden.
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      visible ? start() : stop();
    });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <figure className="sim-panel">
      <div className="sim-head">
        <span className="sim-live">
          <span className="sim-dot" aria-hidden="true" />
          {ar ? "محاكاة مرورية حيّة" : "Live traffic microsimulation"}
        </span>
        <span className="sim-model" dir="ltr">
          {hud.ff ? (ar ? "⏩ تسريع زمني" : "⏩ Time-lapse") : "IDM · Gap acceptance"}
        </span>
      </div>

      <div className="sim-modes" role="group" aria-label={ar ? "سيناريو الطلب المروري" : "Traffic demand scenario"}>
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            className={`sim-mode ${mode === s.id ? "active" : ""} ${s.id}`}
            aria-pressed={mode === s.id}
            onClick={() => choose(s.id)}
          >
            {ar ? s.ar : s.en}
          </button>
        ))}
      </div>

      <div className="sim-stage">
        <canvas
          ref={canvasRef}
          className="sim-canvas"
          role="img"
          aria-label={
            ar
              ? "محاكاة حيّة لتقاطع دوّار بجسر علوي للطريق الرئيسي، ومسارات انعطاف حر لليمين، ومركبات متنوعة من سيارات وحافلات وشاحنات"
              : "Live simulation of a grade-separated roundabout with a flyover on the main road, free right-turn slip lanes, and a mixed fleet of cars, buses and trucks"
          }
        />
        <div className="sim-legend overlay" aria-hidden="true">
          <span>{ar ? "متوقف" : "Stopped"}</span>
          <i />
          <span>{ar ? "سرعة حرة" : "Free flow"}</span>
        </div>
      </div>

      <figcaption className="sim-foot">
        <dl className="sim-stats">
          <div>
            <dt>{ar ? "مستوى الخدمة" : "LOS"}</dt>
            <dd>
              <span className="los" style={{ background: LOS_COLORS[hud.los] }}>{hud.los}</span>
            </dd>
          </div>
          <div>
            <dt>{ar ? "متوسط التأخير" : "Avg. delay"}</dt>
            <dd>
              {hud.delay} <small>{ar ? "ث/مركبة" : "s/veh"}</small>
            </dd>
          </div>
          <div>
            <dt>{ar ? "متوسط السرعة" : "Mean speed"}</dt>
            <dd>
              {hud.meanKmh} <small>{ar ? "كم/س" : "km/h"}</small>
            </dd>
          </div>
          <div>
            <dt>{ar ? "في الانتظار" : "Queued"}</dt>
            <dd>{hud.queued}</dd>
          </div>
        </dl>
        <div className="sim-trends">
          <TrendChart
            title={ar ? "متوسط التأخير" : "Average delay"}
            unit={ar ? "ث/مركبة" : "s/veh"}
            minMax={20}
            data={hud.history.map((h) => ({ t: h.t, value: h.delay }))}
            ariaLabel={ar ? "متوسط تأخير التحكم خلال آخر 90 ثانية" : "Average control delay over the last 90 seconds"}
          />
          <TrendChart
            title={ar ? "المركبات المنتظرة" : "Queued vehicles"}
            unit={ar ? "مركبة" : "veh"}
            minMax={8}
            data={hud.history.map((h) => ({ t: h.t, value: h.queued }))}
            ariaLabel={ar ? "عدد المركبات المنتظرة خلال آخر 90 ثانية" : "Queued vehicles over the last 90 seconds"}
          />
        </div>

      </figcaption>
    </figure>
  );
}
