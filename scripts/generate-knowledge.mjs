/**
 * Generator Knowledge System — baca kode asli, hasilkan diagram Mermaid.
 *
 * Sumber kebenaran:
 *   1. prisma/schema.prisma  → ERD per domain (docs/knowledge/database/*.md)
 *   2. import antar service  → graf relasi fitur (docs/knowledge/relasi-fitur.md)
 *   3. import halaman→service → peta halaman memakai service apa
 *
 * Jalankan: npm run knowledge   (setiap habis ubah schema/service)
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "docs", "knowledge");

// ---------- 1. Parse schema.prisma ----------
const schema = fs.readFileSync(path.join(ROOT, "prisma", "schema.prisma"), "utf8");
const lines = schema.split("\n");

const models = {}; // name -> { section, fields: [{name,type,isList,optional}] }
let currentSection = "Lainnya";
let currentModel = null;

for (const line of lines) {
  const header = line.match(/^\/\/ =+ (.+?) =+\s*$/);
  if (header) {
    currentSection = header[1].trim();
    continue;
  }
  const modelStart = line.match(/^model (\w+) \{/);
  if (modelStart) {
    currentModel = modelStart[1];
    models[currentModel] = { section: currentSection, fields: [] };
    continue;
  }
  if (currentModel && /^\}/.test(line)) {
    currentModel = null;
    continue;
  }
  if (currentModel) {
    const field = line.match(/^\s{2}(\w+)\s+(\w+)(\[\])?(\?)?/);
    if (field) {
      models[currentModel].fields.push({
        name: field[1],
        type: field[2],
        isList: Boolean(field[3]),
        optional: Boolean(field[4]),
      });
    }
  }
}

const modelNames = new Set(Object.keys(models));

// Relasi: edge {from, to, label, kind} — didedup supaya satu pasangan satu garis.
const edges = [];
const seenPair = new Set();
for (const [name, model] of Object.entries(models)) {
  for (const field of model.fields) {
    if (!modelNames.has(field.type) || field.type === name) continue;
    const pairKey = [name, field.type].sort().join("::") + "::" + field.name;
    if (field.isList) {
      // name punya banyak field.type → one-to-many dari sisi list
      const key = [name, field.type].sort().join("::");
      if (seenPair.has(key)) continue;
      seenPair.add(key);
      edges.push({ one: name, many: field.type, label: field.name, kind: "1-N" });
    } else {
      // singular: cek apakah sisi lain punya list balik — kalau iya, akan tertangkap dari sana
      const other = models[field.type];
      const otherHasList = other.fields.some((f) => f.type === name && f.isList);
      if (otherHasList) continue;
      const key = [name, field.type].sort().join("::");
      if (seenPair.has(key)) continue;
      seenPair.add(key);
      edges.push({ one: field.type, many: name, label: field.name, kind: field.optional ? "1-1?" : "1-1" });
    }
  }
}

// ---------- 2. Tulis ERD per domain ----------
const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const sections = {};
for (const [name, model] of Object.entries(models)) {
  (sections[model.section] ??= []).push(name);
}

fs.rmSync(path.join(OUT, "database"), { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "database"), { recursive: true });

const dbIndexRows = [];
for (const [section, names] of Object.entries(sections)) {
  const inSet = new Set(names);
  const internal = edges.filter((e) => inSet.has(e.one) && inSet.has(e.many));
  const external = edges.filter(
    (e) => (inSet.has(e.one) && !inSet.has(e.many)) || (!inSet.has(e.one) && inSet.has(e.many))
  );

  let md = `# Domain: ${section}\n\n`;
  md += `> Digenerate otomatis dari \`prisma/schema.prisma\` — jangan edit manual, jalankan \`npm run knowledge\`.\n\n`;
  md += `Model: ${names.map((n) => `\`${n}\``).join(", ")}\n\n`;
  md += "```mermaid\nerDiagram\n";
  for (const name of names) {
    const scalarFields = models[name].fields
      .filter((f) => !modelNames.has(f.type))
      .slice(0, 8); // batasi biar diagram tetap kebaca
    md += `  ${name} {\n`;
    for (const f of scalarFields) md += `    ${f.type} ${f.name}\n`;
    md += "  }\n";
  }
  for (const e of internal) {
    const card = e.kind === "1-N" ? "||--o{" : "||--||";
    md += `  ${e.one} ${card} ${e.many} : "${e.label}"\n`;
  }
  md += "```\n";

  if (external.length > 0) {
    md += `\n## Relasi keluar domain\n\n`;
    for (const e of external) {
      md += `- \`${e.one}\` → \`${e.many}\` (\`${e.label}\`, ${e.kind})\n`;
    }
  }
  const file = `${slugify(section)}.md`;
  fs.writeFileSync(path.join(OUT, "database", file), md);
  dbIndexRows.push({ section, file, count: names.length });
}

// ---------- 3. Graf relasi antar service ----------
const servicesDir = path.join(ROOT, "src", "server", "services");
const serviceFiles = fs.readdirSync(servicesDir).filter((f) => f.endsWith(".ts"));
const svcName = (f) => f.replace(/\.ts$/, "").replace(/-service$/, "");
const importRe = /from ["']@\/server\/services\/([\w-]+)["']/g;

const svcEdges = [];
for (const file of serviceFiles) {
  const src = fs.readFileSync(path.join(servicesDir, file), "utf8");
  for (const m of src.matchAll(importRe)) {
    const target = m[1].replace(/-service$/, "");
    if (target !== svcName(file)) svcEdges.push([svcName(file), target]);
  }
}

// ---------- 4. Halaman → service ----------
function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else if (/\.(ts|tsx)$/.test(entry.name)) acc.push(p);
  }
  return acc;
}
const appDir = path.join(ROOT, "src", "app");
const usage = {}; // service -> Set(route)
for (const file of walk(appDir)) {
  const src = fs.readFileSync(file, "utf8");
  const route =
    "/" +
    path
      .relative(appDir, path.dirname(file))
      .replace(/\\/g, "/")
      .replace(/\(app\)\/?/, "")
      .replace(/\(.*?\)\/?/g, "");
  for (const m of src.matchAll(importRe)) {
    const target = m[1].replace(/-service$/, "");
    (usage[target] ??= new Set()).add(route || "/");
  }
}

let featMd = `# Relasi Fitur (Service ↔ Service, Halaman → Service)\n\n`;
featMd += `> Digenerate otomatis dari import statement asli di kode — jangan edit manual, jalankan \`npm run knowledge\`.\n\n`;
featMd += `## Service yang saling memakai\n\nPanah A → B artinya service A meng-import service B. Makin banyak panah masuk = makin banyak fitur bergantung padanya.\n\n`;
featMd += "```mermaid\nflowchart LR\n";
const inGraph = new Set();
for (const [from, to] of svcEdges) {
  featMd += `  ${from.replace(/-/g, "_")}["${from}"] --> ${to.replace(/-/g, "_")}["${to}"]\n`;
  inGraph.add(from);
  inGraph.add(to);
}
const standalone = serviceFiles.map(svcName).filter((s) => !inGraph.has(s));
featMd += "```\n";
if (standalone.length > 0) {
  featMd += `\nService mandiri (tidak import / di-import service lain): ${standalone.map((s) => `\`${s}\``).join(", ")}\n`;
}

featMd += `\n## Halaman mana memakai service apa\n\n| Service | Dipakai halaman |\n|---|---|\n`;
for (const [service, routes] of Object.entries(usage).sort((a, b) => b[1].size - a[1].size)) {
  featMd += `| \`${service}\` | ${[...routes].sort().join(", ")} |\n`;
}
fs.writeFileSync(path.join(OUT, "relasi-fitur.md"), featMd);

// ---------- 5. Index database ----------
let dbIndex = `# Peta Database per Domain\n\n> Digenerate otomatis — \`npm run knowledge\`. Total ${modelNames.size} model, ${edges.length} relasi.\n\n| Domain | Model | File |\n|---|---|---|\n`;
for (const row of dbIndexRows.sort((a, b) => b.count - a.count)) {
  dbIndex += `| ${row.section} | ${row.count} | [${row.file}](./${row.file}) |\n`;
}
fs.writeFileSync(path.join(OUT, "database", "README.md"), dbIndex);

console.log(
  `Selesai: ${modelNames.size} model, ${edges.length} relasi DB, ${svcEdges.length} relasi service, ${Object.keys(usage).length} service terpakai halaman.`
);
