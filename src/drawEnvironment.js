// Static surroundings for the roundabout simulation: ground, pavements,
// buildings with rooftop details and shadows, and palm trees.
// Drawn once into the cached ground layer, so it costs nothing per frame.

const CELL = 4;

// Occupancy grid of everything that must stay clear (roads, flyover, ring).
function buildMask(size, roadPaths, { C, R, ringW, deckHalf }, clearance) {
  const n = Math.ceil(size / CELL);
  const mask = new Uint8Array(n * n);
  const stamp = (x, y, r) => {
    const r2 = r * r;
    const x0 = Math.max(0, Math.floor((x - r) / CELL)), x1 = Math.min(n - 1, Math.floor((x + r) / CELL));
    const y0 = Math.max(0, Math.floor((y - r) / CELL)), y1 = Math.min(n - 1, Math.floor((y + r) / CELL));
    for (let gy = y0; gy <= y1; gy++) {
      for (let gx = x0; gx <= x1; gx++) {
        const cx = gx * CELL + CELL / 2 - x, cy = gy * CELL + CELL / 2 - y;
        if (cx * cx + cy * cy <= r2) mask[gy * n + gx] = 1;
      }
    }
  };

  for (const path of roadPaths) {
    for (let i = 0; i < path.pts.length; i += 2) stamp(path.pts[i][0], path.pts[i][1], clearance);
  }
  for (let gy = 0; gy < n; gy++) {
    for (let gx = 0; gx < n; gx++) {
      const x = gx * CELL + CELL / 2, y = gy * CELL + CELL / 2;
      const d = Math.hypot(x - C, y - C);
      if (Math.abs(x - C) < deckHalf + 14 || d < R + ringW / 2 + clearance) mask[gy * n + gx] = 1;
    }
  }
  return { mask, n };
}

function isFree({ mask, n }, x, y, w, h, size) {
  // parts outside the canvas are allowed (buildings get cropped at the edge)
  const x0 = Math.max(0, Math.floor(x / CELL)), x1 = Math.min(n - 1, Math.floor((x + w) / CELL));
  const y0 = Math.max(0, Math.floor(y / CELL)), y1 = Math.min(n - 1, Math.floor((y + h) / CELL));
  if (x + w < 0 || y + h < 0 || x > size || y > size) return false;
  for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) if (mask[gy * n + gx]) return false;
  return true;
}

function occupy({ mask, n }, x, y, w, h, pad) {
  const x0 = Math.max(0, Math.floor((x - pad) / CELL)), x1 = Math.min(n - 1, Math.floor((x + w + pad) / CELL));
  const y0 = Math.max(0, Math.floor((y - pad) / CELL)), y1 = Math.min(n - 1, Math.floor((y + h + pad) / CELL));
  for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) mask[gy * n + gx] = 1;
}

const ROOFS = ["#2b3f56", "#314760", "#38506a", "#2f4a5c", "#3d5168"];
const SHADOW = "rgba(0,0,0,0.38)";
const SUN = [6, 7]; // shadow offset (light from the north-west)

function shadowOf(ctx, x, y, w, h, height) {
  const k = height / 10;
  ctx.fillStyle = SHADOW;
  ctx.beginPath();
  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w + SUN[0] * k, y + SUN[1] * k);
  ctx.lineTo(x + w + SUN[0] * k, y + h + SUN[1] * k);
  ctx.lineTo(x + SUN[0] * k, y + h + SUN[1] * k);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
}

function warehouse(ctx, x, y, w, h, rnd) {
  shadowOf(ctx, x, y, w, h, 9);
  const light = rnd() < 0.35;
  ctx.fillStyle = light ? "#4a5d72" : "#3a4e64";
  ctx.fillRect(x, y, w, h);
  // corrugated roof panels along the long side
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  const along = w > h;
  for (let t = 4; t < (along ? h : w); t += 4) {
    ctx.beginPath();
    if (along) {
      ctx.moveTo(x + 1, y + t);
      ctx.lineTo(x + w - 1, y + t);
    } else {
      ctx.moveTo(x + t, y + 1);
      ctx.lineTo(x + t, y + h - 1);
    }
    ctx.stroke();
  }
  // ridge and skylights
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  if (along) ctx.fillRect(x + 2, y + h / 2 - 0.75, w - 4, 1.5);
  else ctx.fillRect(x + w / 2 - 0.75, y + 2, 1.5, h - 4);
  ctx.fillStyle = "rgba(170,200,230,0.18)";
  for (let k = 1; k < 4; k++) {
    if (along) ctx.fillRect(x + (w * k) / 4 - 3, y + 4, 6, h - 8);
    else ctx.fillRect(x + 4, y + (h * k) / 4 - 3, w - 8, 6);
  }
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

function residential(ctx, x, y, w, h, rnd, tall) {
  shadowOf(ctx, x, y, w, h, tall ? 14 : 6);
  ctx.fillStyle = ROOFS[Math.floor(rnd() * ROOFS.length)];
  ctx.fillRect(x, y, w, h);
  // parapet
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  // stair / lift housing
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  const sw = Math.min(8, w * 0.3), sh = Math.min(7, h * 0.3);
  ctx.fillRect(x + w * (0.15 + rnd() * 0.4), y + h * (0.15 + rnd() * 0.4), sw, sh);
  // rooftop water tanks — typical of Libyan buildings
  const tanks = 1 + Math.floor(rnd() * (tall ? 4 : 2));
  for (let i = 0; i < tanks; i++) {
    const tx = x + 3 + rnd() * (w - 6), ty = y + 3 + rnd() * (h - 6);
    ctx.fillStyle = rnd() < 0.5 ? "rgba(214,180,106,0.55)" : "rgba(230,236,245,0.45)";
    ctx.beginPath();
    ctx.arc(tx, ty, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  if (tall && rnd() < 0.5) {
    // solar panels
    ctx.fillStyle = "rgba(80,120,180,0.45)";
    ctx.fillRect(x + w - 10, y + h - 7, 7, 4);
  }
}

function palm(ctx, x, y, r, rnd) {
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(x + r * 0.6, y + r * 0.7, r * 0.9, r * 0.6, 0.6, 0, Math.PI * 2);
  ctx.fill();
  const fronds = 7;
  const rot = rnd() * Math.PI;
  ctx.strokeStyle = "#3f7a4c";
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  for (let i = 0; i < fronds; i++) {
    const a = rot + (i / fronds) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.cos(a + 0.3) * r * 0.6, y + Math.sin(a + 0.3) * r * 0.6, x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.stroke();
  }
  ctx.fillStyle = "#5a9a62";
  ctx.beginPath();
  ctx.arc(x, y, 1.6, 0, Math.PI * 2);
  ctx.fill();
}

function shrub(ctx, x, y, r) {
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.arc(x + 2, y + 2, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2f6140";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(120,180,120,0.35)";
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

export function drawEnvironment(ctx, size, roadPaths, geom) {
  let seed = 20261009;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // Ground: dusk-toned sandy urban land with subtle texture
  ctx.fillStyle = "#1b2c3e";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = rnd() < 0.5 ? "rgba(214,180,106,0.035)" : "rgba(255,255,255,0.025)";
    ctx.fillRect(rnd() * size, rnd() * size, 2 + rnd() * 5, 2 + rnd() * 5);
  }

  // Pavements along every road, drawn wider than the carriageway
  ctx.strokeStyle = "#2c3f55";
  ctx.lineCap = "butt";
  ctx.lineJoin = "round";
  ctx.lineWidth = 26;
  for (const p of roadPaths) {
    ctx.beginPath();
    p.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  }

  const grid = buildMask(size, roadPaths, geom, 22); // buildings keep back from the kerb
  const veg = buildMask(size, roadPaths, geom, 15); // trees may stand closer

  // Buildings: try larger footprints first, then fill gaps with smaller ones
  const kinds = [
    { n: 140, w: [52, 84], h: [34, 52], draw: warehouse },
    { n: 260, w: [26, 40], h: [24, 38], draw: (c, x, y, w, h, r) => residential(c, x, y, w, h, r, true) },
    { n: 600, w: [13, 22], h: [12, 20], draw: (c, x, y, w, h, r) => residential(c, x, y, w, h, r, false) },
  ];
  for (const k of kinds) {
    for (let i = 0; i < k.n; i++) {
      const w = k.w[0] + rnd() * (k.w[1] - k.w[0]);
      const h = k.h[0] + rnd() * (k.h[1] - k.h[0]);
      const [bw, bh] = rnd() < 0.5 ? [w, h] : [h, w];
      const x = -bw / 2 + rnd() * (size + bw / 2), y = -bh / 2 + rnd() * (size + bh / 2);
      if (!isFree(grid, x, y, bw, bh, size)) continue;
      occupy(grid, x, y, bw, bh, 5);
      occupy(veg, x, y, bw, bh, 3);
      k.draw(ctx, Math.round(x), Math.round(y), Math.round(bw), Math.round(bh), rnd);
    }
  }

  // Palm trees and shrubs in the remaining open land and along pavements
  for (let i = 0; i < 700; i++) {
    const x = rnd() * size, y = rnd() * size;
    if (!isFree(veg, x - 4, y - 4, 8, 8, size)) continue;
    occupy(veg, x - 4, y - 4, 8, 8, 6);
    if (rnd() < 0.55) palm(ctx, x, y, 5 + rnd() * 3, rnd);
    else shrub(ctx, x, y, 2.5 + rnd() * 2);
  }
}
