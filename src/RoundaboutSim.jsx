import { useEffect, useRef, useState } from "react";
import { ARMS, LANE, R, RING_W, SIZE, createSim, geometry, inLaneOffset, stats, step } from "./sim/roundabout";

const { C, FAR, STOP_R, vMax } = geometry;
const ROAD_W = LANE * 2 + 16;

// slow -> fast: red, amber, gold, pale gold
const STOPS = [
  [0, [229, 72, 77]],
  [0.35, [245, 165, 36]],
  [0.7, [214, 180, 106]],
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

function drawRoads(ctx, logo) {
  ctx.lineCap = "butt";

  // Arms
  ctx.strokeStyle = "#1d3249";
  ctx.lineWidth = ROAD_W;
  for (const a of ARMS) {
    ctx.beginPath();
    ctx.moveTo(C + Math.cos(a) * R, C + Math.sin(a) * R);
    ctx.lineTo(C + Math.cos(a) * FAR, C + Math.sin(a) * FAR);
    ctx.stroke();
  }

  // Circulating carriageway
  ctx.lineWidth = RING_W + 6;
  ctx.beginPath();
  ctx.arc(C, C, R, 0, Math.PI * 2);
  ctx.stroke();

  // Edge lines of the ring
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(C, C, R - RING_W / 2 - 3, 0, Math.PI * 2);
  ctx.stroke();

  // Central island
  ctx.fillStyle = "rgba(214,180,106,0.10)";
  ctx.strokeStyle = "rgba(214,180,106,0.65)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(C, C, R - RING_W / 2 - 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(214,180,106,0.25)";
  ctx.setLineDash([2, 6]);
  ctx.beginPath();
  ctx.arc(C, C, R - RING_W / 2 - 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  if (logo?.complete && logo.naturalWidth) {
    const h = 92, w = (logo.naturalWidth / logo.naturalHeight) * h;
    ctx.globalAlpha = 0.9;
    ctx.drawImage(logo, C - w / 2, C - h / 2, w, h);
    ctx.globalAlpha = 1;
  }

  for (const a of ARMS) {
    const u = [Math.cos(a), Math.sin(a)];
    const rIn = inLaneOffset(a);

    // Splitter island between entry and exit lanes
    ctx.fillStyle = "rgba(214,180,106,0.18)";
    ctx.beginPath();
    ctx.moveTo(C + u[0] * (STOP_R + 2), C + u[1] * (STOP_R + 2));
    ctx.lineTo(C + u[0] * (STOP_R + 46) + rIn[0] * 3, C + u[1] * (STOP_R + 46) + rIn[1] * 3);
    ctx.lineTo(C + u[0] * (STOP_R + 46) - rIn[0] * 3, C + u[1] * (STOP_R + 46) - rIn[1] * 3);
    ctx.closePath();
    ctx.fill();

    // Centre line beyond the splitter
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(C + u[0] * (STOP_R + 50), C + u[1] * (STOP_R + 50));
    ctx.lineTo(C + u[0] * FAR, C + u[1] * FAR);
    ctx.stroke();
    ctx.setLineDash([]);

    // Give-way "shark teeth" across the entry lane
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    for (let k = -2; k <= 2; k++) {
      const off = LANE + k * 4.4;
      const bx = C + u[0] * (STOP_R + 1) + rIn[0] * off;
      const by = C + u[1] * (STOP_R + 1) + rIn[1] * off;
      ctx.beginPath();
      ctx.moveTo(bx - rIn[0] * 1.8, by - rIn[1] * 1.8);
      ctx.lineTo(bx + rIn[0] * 1.8, by + rIn[1] * 1.8);
      ctx.lineTo(bx + u[0] * 5, by + u[1] * 5);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawVehicles(ctx, sim) {
  for (const v of sim.vehicles) {
    if (v.x === undefined) continue;
    const ang = Math.atan2(v.hy, v.hx);
    ctx.save();
    ctx.translate(v.x, v.y);
    ctx.rotate(ang);
    ctx.fillStyle = speedColor(v.v / vMax);
    ctx.beginPath();
    ctx.roundRect(-7.5, -3.8, 15, 7.6, 2.2);
    ctx.fill();
    ctx.fillStyle = "rgba(12,31,51,0.55)";
    ctx.fillRect(2, -2.8, 2.8, 5.6); // windscreen
    ctx.restore();
  }
}

export default function RoundaboutSim({ ar }) {
  const canvasRef = useRef(null);
  const [hud, setHud] = useState({ vehicles: 0, meanKmh: 0, queued: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);

    const logo = new Image();
    logo.src = "/logo.svg";

    const sim = createSim(Date.now() % 100000);
    for (let i = 0; i < 40 * 30; i++) step(sim, 1 / 30); // warm up so the scene starts busy

    const render = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      drawRoads(ctx, logo);
      drawVehicles(ctx, sim);
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      logo.onload = render;
      render();
      setHud(stats(sim));
      return;
    }

    let raf = 0, last = 0, visible = true, hudTimer = 0;
    const frame = (t) => {
      const dt = Math.min(0.05, (t - last) / 1000 || 0);
      last = t;
      const sub = Math.ceil(dt / (1 / 60));
      for (let i = 0; i < sub; i++) step(sim, dt / sub);
      render();
      hudTimer += dt;
      if (hudTimer > 0.5) {
        hudTimer = 0;
        setHud(stats(sim));
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
        <span className="sim-model" dir="ltr">IDM · Gap acceptance</span>
      </div>

      <canvas
        ref={canvasRef}
        className="sim-canvas"
        role="img"
        aria-label={
          ar
            ? "محاكاة حيّة لدوّار مروري بمسار واحد، تتوقف فيها المركبات عند خط إفساح الطريق حتى تتوفر فجوة مناسبة في حركة الدوّار"
            : "Live simulation of a single-lane roundabout where vehicles wait at the give-way line until an acceptable gap appears in circulating traffic"
        }
      />

      <figcaption className="sim-foot">
        <dl className="sim-stats">
          <div>
            <dt>{ar ? "المركبات" : "Vehicles"}</dt>
            <dd>{hud.vehicles}</dd>
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
        <div className="sim-legend" aria-hidden="true">
          <span>{ar ? "متوقف" : "Stopped"}</span>
          <i />
          <span>{ar ? "سرعة حرة" : "Free flow"}</span>
        </div>
      </figcaption>
    </figure>
  );
}
