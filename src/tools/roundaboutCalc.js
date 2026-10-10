// Roundabout design calculations used by the Engineering Tools page.
// Indicative design aid only — always verify against the current editions of
// DMRB CD 116, TRL LR942, NCHRP Report 672 and the Highway Capacity Manual.

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/* ---------------------------------------------------------------------------
   UK — DMRB CD 116 / TRL LR942 (Kimber, 1980) empirical entry capacity
--------------------------------------------------------------------------- */

// Range of the data the LR942 relationship was calibrated on.
export const KIMBER_RANGE = {
  E: [3.6, 16.5],
  V: [1.9, 12.5],
  lp: [1, 100],
  S: [0, 2.9],
  D: [13.5, 171.6],
  phi: [0, 77],
  r: [3.4, 100],
};

export function kimber({ V, E, lp, r, phi, D, Qc }) {
  const S = (1.6 * (E - V)) / lp;
  const x2 = V + (E - V) / (1 + 2 * S);
  const M = Math.exp((D - 60) / 10);
  const tD = 1 + 0.5 / (1 + M);
  const k = 1 - 0.00347 * (phi - 30) - 0.978 * (1 / r - 0.05);
  const F = 303 * x2;
  const fc = 0.21 * tD * (1 + 0.2 * x2);
  const Qe = Math.max(0, k * (F - fc * Qc));
  return { S, x2, M, tD, k, F, fc, Qe };
}

// QA/QC checklist: status "pass" | "warn" | "fail" with the governing guidance.
export function dmrbChecks(input, result, demand) {
  const { V, E, lp, r, phi, D, circW, entryPathR, exitR } = input;
  const rfc = result.Qe > 0 ? demand / result.Qe : Infinity;
  const inRange = Object.entries({ E, V, lp, S: result.S, D, phi, r }).every(
    ([key, val]) => val >= KIMBER_RANGE[key][0] && val <= KIMBER_RANGE[key][1]
  );
  const checks = [
    {
      id: "phi",
      status: phi >= 20 && phi <= 60 ? "pass" : "warn",
      value: `${phi}°`,
      en: "Entry angle φ within 20°–60°",
      ar: "زاوية الدخول φ بين 20° و60°",
    },
    {
      id: "r",
      status: r >= 20 && r <= 100 ? "pass" : r >= 6 ? "warn" : "fail",
      value: `${r} m`,
      en: "Entry radius r within 6–100 m (≈20 m typical)",
      ar: "نصف قطر المدخل r بين 6 و100 م (النموذجي ≈ 20 م)",
    },
    {
      id: "flare",
      status: E >= V && result.S <= 2.9 ? "pass" : "fail",
      value: `S = ${result.S.toFixed(2)}`,
      en: "Flare: E ≥ V and sharpness S ≤ 2.9",
      ar: "التوسعة: E ≥ V وحدّة التوسعة S ≤ 2.9",
    },
    {
      id: "circ",
      status: circW >= E && circW <= 1.2 * E && circW <= 15 ? "pass" : "warn",
      value: `${circW} m (${(circW / E).toFixed(2)}E)`,
      en: "Circulatory width 1.0–1.2 × max entry width, ≤ 15 m",
      ar: "عرض الطريق الدائري بين 1.0 و1.2 من أكبر عرض مدخل، ولا يتجاوز 15 م",
    },
    {
      id: "deflection",
      status: entryPathR <= 100 ? "pass" : "fail",
      value: `${entryPathR} m`,
      en: "Entry path radius (deflection) ≤ 100 m",
      ar: "نصف قطر مسار الدخول (الانحراف) ≤ 100 م",
    },
    {
      id: "exit",
      status: exitR >= 40 ? "pass" : exitR >= 20 ? "warn" : "fail",
      value: `${exitR} m`,
      en: "Exit radius ≥ 20 m (≥ 40 m preferred)",
      ar: "نصف قطر المخرج ≥ 20 م (يُفضَّل ≥ 40 م)",
    },
    {
      id: "icd",
      status: D >= 28 ? "pass" : "warn",
      value: `${D} m`,
      en: "ICD ≥ 28 m for a normal roundabout (smaller = compact/mini)",
      ar: "القطر الخارجي ≥ 28 م لجزيرة الدوران العادية (الأصغر: مدمجة/صغيرة)",
    },
    {
      id: "range",
      status: inRange ? "pass" : "warn",
      value: inRange ? "✓" : "!",
      en: "All inputs inside the LR942 calibration range",
      ar: "جميع المدخلات ضمن نطاق معايرة LR942",
    },
    {
      id: "rfc",
      status: rfc <= 0.85 ? "pass" : rfc <= 1 ? "warn" : "fail",
      value: `RFC ${Number.isFinite(rfc) ? rfc.toFixed(2) : "∞"}`,
      en: "Ratio of flow to capacity ≤ 0.85",
      ar: "نسبة التدفق إلى السعة RFC ≤ 0.85",
    },
  ];
  return { rfc, checks };
}

/* ---------------------------------------------------------------------------
   US — FHWA / NCHRP Report 672 fastest path, HCM entry capacity & delay
--------------------------------------------------------------------------- */

// NCHRP 672 Eq. 6-1 / 6-2 (metric): speed (km/h) from path radius (m).
export const speedPlus = (R) => 8.7602 * Math.pow(R, 0.3861); // superelevation e = +0.02
export const speedMinus = (R) => 8.6164 * Math.pow(R, 0.3673); // e = -0.02 (circulating)

export function fastestPath({ R1, R2, R3, R4, R5 }) {
  return {
    V1: speedPlus(R1),
    V2: speedMinus(R2),
    V3: speedPlus(R3),
    V4: speedMinus(R4),
    V5: speedPlus(R5),
  };
}

// HCM 6th/7th ed. roundabout entry lane capacity (pc/h) from conflicting flow vc (pc/h).
export function hcmCapacity(entryLanes, circLanes, vc) {
  if (entryLanes === 1 && circLanes === 1) return [1380 * Math.exp(-1.02e-3 * vc)];
  if (entryLanes === 1 && circLanes === 2) return [1420 * Math.exp(-0.85e-3 * vc)];
  if (entryLanes === 2 && circLanes === 1) return [1420 * Math.exp(-0.91e-3 * vc), 1420 * Math.exp(-0.91e-3 * vc)];
  // two entry lanes, two circulating lanes: right lane, left lane
  return [1420 * Math.exp(-0.85e-3 * vc), 1350 * Math.exp(-0.92e-3 * vc)];
}

// HCM control delay (s/veh) for one entry lane; T = analysis period in hours.
export function hcmDelay(v, c, T = 0.25) {
  const x = v / c;
  const term = (x - 1) + Math.sqrt((x - 1) ** 2 + ((3600 / c) * x) / (450 * T));
  return 3600 / c + 900 * T * term + 5 * Math.min(x, 1);
}

export function losFromDelay(d, x) {
  if (x > 1) return "F";
  return d <= 10 ? "A" : d <= 15 ? "B" : d <= 25 ? "C" : d <= 35 ? "D" : d <= 50 ? "E" : "F";
}

export function usAnalysis(input) {
  const sp = fastestPath(input);
  const { entryLanes, circLanes, ve, vc } = input;
  const caps = hcmCapacity(entryLanes, circLanes, vc);
  const perLane = ve / caps.length;
  const lanes = caps.map((c) => {
    const x = perLane / c;
    const d = hcmDelay(perLane, c);
    return { c, x, d, los: losFromDelay(d, x) };
  });
  const worst = lanes.reduce((a, b) => (b.d > a.d ? b : a));
  const vMax = entryLanes === 1 ? 40 : 48; // single-lane 20–25 mph, multilane 25–30 mph
  const checks = [
    {
      id: "v1",
      status: sp.V1 <= vMax ? "pass" : sp.V1 <= vMax + 8 ? "warn" : "fail",
      value: `${sp.V1.toFixed(0)} km/h`,
      en: `Entry speed V1 ≤ ${vMax} km/h (${entryLanes === 1 ? "single-lane" : "multilane"} entry)`,
      ar: `سرعة الدخول V1 ≤ ${vMax} كم/س (${entryLanes === 1 ? "مدخل بمسار واحد" : "مدخل متعدد المسارات"})`,
    },
    {
      id: "v12",
      status: Math.abs(sp.V1 - sp.V2) <= 16 ? "pass" : Math.abs(sp.V1 - sp.V2) <= 24 ? "warn" : "fail",
      value: `Δ ${Math.abs(sp.V1 - sp.V2).toFixed(0)} km/h`,
      en: "Speed consistency |V1 − V2| ≤ 16 km/h (10 mph), max 24",
      ar: "اتساق السرعة |V1 − V2| ≤ 16 كم/س، وبحد أقصى 24",
    },
    {
      id: "v14",
      status: Math.abs(sp.V1 - sp.V4) <= 24 ? "pass" : "warn",
      value: `Δ ${Math.abs(sp.V1 - sp.V4).toFixed(0)} km/h`,
      en: "Entry vs left-turn speed |V1 − V4| ≤ 24 km/h",
      ar: "فرق سرعة الدخول والانعطاف لليسار |V1 − V4| ≤ 24 كم/س",
    },
    {
      id: "v13",
      status: sp.V1 <= sp.V3 ? "pass" : "warn",
      value: `${sp.V1.toFixed(0)} / ${sp.V3.toFixed(0)}`,
      en: "Entry slower than exit (V1 ≤ V3)",
      ar: "سرعة الدخول أقل من سرعة الخروج (V1 ≤ V3)",
    },
    {
      id: "v5",
      status: sp.V5 <= vMax ? "pass" : "warn",
      value: `${sp.V5.toFixed(0)} km/h`,
      en: `Right-turn speed V5 ≤ ${vMax} km/h`,
      ar: `سرعة الانعطاف لليمين V5 ≤ ${vMax} كم/س`,
    },
    {
      id: "vc",
      status: worst.x <= 0.85 ? "pass" : worst.x <= 1 ? "warn" : "fail",
      value: `v/c ${worst.x.toFixed(2)}`,
      en: "Volume-to-capacity ratio ≤ 0.85 (critical lane)",
      ar: "نسبة الحجم إلى السعة ≤ 0.85 (المسار الحرج)",
    },
  ];
  return { speeds: sp, lanes, worst, checks };
}

export const fmt = (v, d = 0) => (Number.isFinite(v) ? v.toFixed(d) : "—");
export { clamp };
