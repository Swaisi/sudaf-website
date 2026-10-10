// AASHTO Green Book (7th ed.) metric lookup tables used by the ramp tool.

// Table 10-1: ramp design speed (km/h) by highway design speed — upper / middle / lower range.
export const RAMP_SPEED = {
  50: [40, 30, 20], 60: [50, 40, 30], 70: [60, 50, 40], 80: [70, 60, 40], 90: [80, 60, 50],
  100: [90, 70, 50], 110: [100, 80, 60], 120: [110, 90, 70], 130: [120, 100, 80],
};

// Table 3-7: minimum radius with e = 4 % — design speed: [f max, rounded radius m].
export const MIN_RADIUS_E4 = {
  15: [0.4, 4], 20: [0.35, 8], 30: [0.28, 22], 40: [0.23, 47], 50: [0.19, 86],
  60: [0.17, 135], 70: [0.15, 203], 80: [0.14, 280], 90: [0.13, 375], 100: [0.12, 492],
};

// Ramp controlling-feature design speed columns used by Tables 10-3 and 10-5.
export const RAMP_COLS = [0, 20, 30, 40, 50, 60, 70, 80]; // 0 = stop condition

// Acceleration lane length (m), Table 10-3 metric. Row: highway design speed.
export const ACCEL = {
  50: [60, 50, 30], 60: [95, 80, 65, 45], 70: [150, 130, 110, 90, 65], 80: [200, 180, 165, 145, 115, 65],
  90: [260, 245, 225, 205, 175, 125, 35], 100: [345, 325, 305, 285, 255, 205, 110, 40],
  110: [430, 410, 390, 370, 340, 290, 200, 125], 120: [545, 530, 515, 490, 460, 410, 325, 245],
  130: [610, 580, 550, 530, 520, 500, 375, 300],
};

// Deceleration lane length (m), Table 10-5 metric.
export const DECEL = {
  50: [75, 70, 60, 45], 60: [95, 90, 80, 65, 55], 70: [110, 105, 95, 85, 70, 55],
  80: [130, 125, 115, 100, 90, 80, 55], 90: [145, 140, 135, 120, 110, 100, 75, 60],
  100: [170, 165, 155, 145, 135, 120, 100, 85], 110: [180, 180, 170, 160, 150, 140, 120, 105],
  120: [200, 195, 185, 175, 170, 155, 140, 120], 130: [215, 210, 205, 195, 185, 170, 155, 135],
};

// f = V²/(127R) − 0.01e  →  R = V² / (127 (0.01e + f))
export const radiusFor = (V, e, f) => (V * V) / (127 * (0.01 * e + f));

export function lane(table, highway, ramp) {
  const col = RAMP_COLS.indexOf(ramp);
  const v = table[highway]?.[col];
  return v === undefined ? null : v;
}
