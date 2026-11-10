const c = require(process.argv[2]);
const out = {};
for (const k of Object.keys(c)) {
  const v = c[k];
  const steps = Array.isArray(v) ? v : (v && (v.steps || v.slides)) || [];
  out[k] = steps.map((s) => s && s.say).filter(Boolean);
}
console.log(JSON.stringify(out));
