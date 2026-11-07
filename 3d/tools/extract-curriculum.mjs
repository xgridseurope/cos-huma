// Usage: node extract-curriculum.mjs <existing index.html> <out json>
// Pulls the textbook dictionary (N), zones, types and part zones from the current 2D COS-HUMA.
import fs from 'fs';
const [src, out] = process.argv.slice(2);
const s = fs.readFileSync(src, 'utf8');
const grab = (name) => { const i = s.indexOf(`const ${name}=`); const j = s.indexOf(';\n', i); return s.slice(i + name.length + 7, j); };
const N = eval('(' + grab('N') + ')'), ZONE = eval('(' + grab('ZONE') + ')'), TYPE = eval('(' + grab('TYPE') + ')');
const meta = {};
for (const m of s.matchAll(/key:'([a-z]+)',zone:'([a-z]+)'([^}]*?)(?:svg|$)/g)) {
  const t = /type:'([a-z]+)'/.exec(m[3]);
  meta[m[1]] ||= { zone: m[2], type: t ? t[1] : null };
}
const L = ['ca', 'es', 'zh', 'en'];
const BONE_KEYS = ['crani','maxillar','columna','costella','estern','pelvis','omoplat','humer','cubit','radi','carp','metacarp','falma','femur','rotula','tibia','perone','tars','metatars','fpeu'];
const m_type = (k) => (BONE_KEYS.includes(k) ? 'pending' : 'n/a');
const items = Object.keys(N).map(k => ({
  key: k, lesson: BONE_KEYS.includes(k) ? 'esquelet' : 'musculatura', exam: true,
  zone: meta[k]?.zone ?? null, type: meta[k]?.type ?? null,
  name: Object.fromEntries(L.map((l, i) => [l, N[k][i][0]])), def: Object.fromEntries(L.map((l, i) => [l, N[k][i][1]])),
  status: { name: 'transcribed', zone: 'transcribed', type: m_type(k), def: 'pending' },
}));
// Extras shown in 3D only: never in quizzes or default labels
items.push({ key: 'clavicula', lesson: 'esquelet', exam: false, zone: null, type: null,
  name: { ca: 'Clavícula', es: 'Clavícula', zh: '锁骨', en: 'Collarbone' }, def: { ca: '', es: '', zh: '', en: '' }, status: { name: 'not-in-textbook' } });
items.push({ key: 'altres', lesson: 'esquelet', exam: false, zone: null, type: null,
  name: { ca: 'Altres ossos', es: 'Otros huesos', zh: '其他骨', en: 'Other bones' }, def: { ca: '', es: '', zh: '', en: '' }, status: { name: 'not-in-textbook' } });
fs.writeFileSync(out, JSON.stringify({ version: '0.2',
  statusLegend: { confirmed: 'checked by a person against textbook pp.25/27', transcribed: 'copied from the textbook photos into the 2D app (AI transcription, not yet checked by a person)', pending: 'written for the 2D app, not from the textbook; must not be used in exercises until confirmed', 'not-in-textbook': 'extra shown in 3D only; never labelled or used in exercises' },
  exerciseRule: 'exercises may only use items with exam=true and fields whose status is confirmed or transcribed', source: 'xgridseurope/cos-huma index.html (2D, transcribed from textbook pp.25 & 27)', zones: ZONE, types: TYPE, items }, null, 1));
console.log(items.length, 'items'); console.log(items.map(i => `${i.key}:${i.zone}:${i.type}`).join(' '));
