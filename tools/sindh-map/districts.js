// Makes the simplified district shapes for the "My Sindh" map (/sindh/my-sindh/).
// Each district is the part of Sindh's outline nearer to its centre point than to any other centre (a Voronoi cell),
// so the shapes are a teaching sketch, not survey boundaries. Run: node tools/sindh-map/districts.js > out.json
const OUTLINE = [[68.22, 28.47], [68.75, 28.6], [69.35, 28.62], [69.75, 28.52], [70.05, 28.2], [70.1, 27.85], [70.0, 27.3],
  [70.15, 26.7], [70.3, 26.1], [70.3, 25.7], [70.65, 25.35], [71.0, 25.0], [71.12, 24.7], [70.7, 24.35], [69.9, 24.2], [69.1, 24.28], [68.75, 24.3],
  [68.2, 23.7], [67.7, 23.95], [67.35, 24.1], [67.2, 24.5], [67.0, 24.8], [66.7, 24.85], [66.65, 25.05], [66.95, 25.45],
  [67.3, 25.75], [67.35, 26.3], [67.4, 26.85], [67.55, 27.3], [67.7, 27.85], [68.0, 28.1]];
// district (English name as in window.CITIES) -> centre used for the cell [lon, lat]
const SEEDS = {
  'Karachi': [67.05, 24.95], 'Thatta': [67.75, 24.6], 'Sujawal': [68.15, 24.25], 'Badin': [68.85, 24.6],
  'Tando Muhammad Khan': [68.55, 25.05], 'Hyderabad': [68.35, 25.4], 'Tando Allahyar': [68.8, 25.4], 'Matiari': [68.45, 25.75],
  'Jamshoro': [67.6, 25.7], 'Dadu': [67.6, 26.55], 'Kambar Shahdadkot': [67.85, 27.45], 'Larkana': [68.2, 27.35],
  'Jacobabad': [68.35, 28.15], 'Shikarpur': [68.75, 27.85], 'Kashmore': [69.3, 28.35], 'Ghotki': [69.75, 28.0],
  'Sukkur': [69.1, 27.5], 'Khairpur': [69.35, 26.85], 'Naushahro Feroze': [68.2, 26.85], 'Shaheed Benazirabad': [68.4, 26.25],
  'Sanghar': [69.25, 26.05], 'Mirpurkhas': [69.15, 25.45], 'Umerkot': [69.85, 25.4], 'Tharparkar': [70.3, 24.75]
};
function clip(poly, a, b) { // keep the side of the bisector nearer to a
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, nx = b[0] - a[0], ny = b[1] - a[1];
  const side = p => (p[0] - mx) * nx + (p[1] - my) * ny; // <0 = nearer a
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length], sp = side(p), sq = side(q);
    if (sp <= 0) out.push(p);
    if ((sp < 0 && sq > 0) || (sp > 0 && sq < 0)) { const t = sp / (sp - sq); out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]); }
  }
  return out;
}
const px = p => [Math.round((p[0] - 66.45) * 92 * 10) / 10, Math.round((28.75 - p[1]) * 100 * 10) / 10];
const res = {};
for (const [name, s] of Object.entries(SEEDS)) {
  let poly = OUTLINE.slice();
  for (const [n2, s2] of Object.entries(SEEDS)) if (n2 !== name) poly = clip(poly, s, s2);
  let A = 0, cx = 0, cy = 0; const P = poly.map(px);
  for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length], c = p[0] * q[1] - q[0] * p[1]; A += c; cx += (p[0] + q[0]) * c; cy += (p[1] + q[1]) * c; }
  A /= 2;
  res[name] = { d: 'M' + P.map(p => p.join(' ')).join('L') + 'Z', c: [Math.round(cx / (6 * A)), Math.round(cy / (6 * A))] };
}
console.log(JSON.stringify(res));
