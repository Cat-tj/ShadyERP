/**
 * Generator Knowledge System — baca kode asli, hasilkan diagram Mermaid
 * DAN vault Obsidian (catatan atomik + [[wikilink]] untuk Graph View).
 *
 * Sumber kebenaran:
 *   1. prisma/schema.prisma  → ERD per domain (docs/knowledge/database/*.md)
 *                            → catatan per model (docs/obsidian-vault/Database/*.md)
 *   2. import antar service  → graf relasi fitur (docs/knowledge/relasi-fitur.md)
 *                            → catatan per fitur (docs/obsidian-vault/Fitur/*.md)
 *   3. import halaman→service → peta halaman memakai service apa
 *   4. `prisma.<model>.` di dalam service → relasi Fitur↔Database di vault
 *
 * Jalankan: npm run knowledge   (setiap habis ubah schema/service)
 *
 * Folder "Alur Kerja/" di vault Obsidian ditulis MANUAL (bukan digenerate) —
 * script ini tidak pernah menyentuhnya.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "docs", "knowledge");
const VAULT = path.join(ROOT, "docs", "obsidian-vault");

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

// ---------- 6. Vault Obsidian (catatan atomik + [[wikilink]]) ----------
// Nama file service TETAP pakai suffix "-service" (beda dari nama di docs/knowledge)
// supaya filename-nya tidak pernah tabrakan dengan nama Model (mis. "sale-service"
// vs "Sale" — jelas beda string, aman di filesystem case-insensitive macOS/Windows).
const rawSvcEdges = []; // [fromFileBase, toFileBase], nama file lengkap dgn "-service"
for (const file of serviceFiles) {
  const fromBase = file.replace(/\.ts$/, "");
  const src = fs.readFileSync(path.join(servicesDir, file), "utf8");
  for (const m of src.matchAll(importRe)) {
    if (m[1] !== fromBase) rawSvcEdges.push([fromBase, m[1]]);
  }
}

// Model mana dipakai service mana, lewat pemanggilan prisma.<accessor>.
const accessorToModel = {};
for (const name of modelNames) accessorToModel[name[0].toLowerCase() + name.slice(1)] = name;
const prismaCallRe = /prisma\.(\w+)\./g;
const svcModelUsage = {}; // serviceFileBase -> Set(ModelName)
const modelSvcUsage = {}; // ModelName -> Set(serviceFileBase)
for (const file of serviceFiles) {
  const fromBase = file.replace(/\.ts$/, "");
  const src = fs.readFileSync(path.join(servicesDir, file), "utf8");
  for (const m of src.matchAll(prismaCallRe)) {
    const modelName = accessorToModel[m[1]];
    if (!modelName) continue;
    (svcModelUsage[fromBase] ??= new Set()).add(modelName);
    (modelSvcUsage[modelName] ??= new Set()).add(fromBase);
  }
}

const wikiSafe = (s) => s.replace(/[[\]|#^]/g, ""); // hindari karakter yang bentrok sintaks wikilink

fs.rmSync(path.join(VAULT, "Database"), { recursive: true, force: true });
fs.rmSync(path.join(VAULT, "Fitur"), { recursive: true, force: true });
fs.rmSync(path.join(VAULT, "Domain"), { recursive: true, force: true });
fs.mkdirSync(path.join(VAULT, "Database"), { recursive: true });
fs.mkdirSync(path.join(VAULT, "Fitur"), { recursive: true });
fs.mkdirSync(path.join(VAULT, "Domain"), { recursive: true });
fs.mkdirSync(path.join(VAULT, "Alur Kerja"), { recursive: true }); // dijaga tetap ada, isinya manual

// Adjacency semua relasi model (lintas domain), dipakai per-catatan Database/*.md
const modelAdjacency = {}; // ModelName -> [{other, label, kind}]
for (const e of edges) {
  (modelAdjacency[e.one] ??= []).push({ other: e.many, label: e.label, kind: e.kind });
  (modelAdjacency[e.many] ??= []).push({ other: e.one, label: e.label, kind: e.kind });
}

// Judul catatan Domain HARUS sama persis dengan nama file (tanpa .md) supaya
// wikilink ke domain selalu resolve — nama section di schema.prisma kadang
// mengandung karakter tidak valid untuk nama file (mis. "BOOKING / APPOINTMENT").
const domainTitle = (section) => section.replace(/[\\/:*?"<>|]/g, "-");

// 6a. Domain/<Section>.md — Map of Content per domain
for (const [section, names] of Object.entries(sections)) {
  const title = domainTitle(section);
  let md = `---\ntags: [domain]\n---\n# ${title}\n\n`;
  md += `Domain schema berisi ${names.length} model:\n\n`;
  for (const name of names.sort()) md += `- [[${wikiSafe(name)}]]\n`;
  fs.writeFileSync(path.join(VAULT, "Domain", `${title}.md`), md);
}

// 6b. Database/<Model>.md
for (const [name, model] of Object.entries(models)) {
  let md = `---\ntags: [database]\n---\n# ${name}\n\n`;
  md += `Domain: [[${wikiSafe(domainTitle(model.section))}]]\n\n`;
  const scalarFields = model.fields.filter((f) => !modelNames.has(f.type));
  if (scalarFields.length > 0) {
    md += `## Field\n\n`;
    for (const f of scalarFields) {
      md += `- \`${f.name}\`: ${f.type}${f.optional ? "?" : ""}\n`;
    }
    md += "\n";
  }
  const rel = (modelAdjacency[name] ?? []).sort((a, b) => a.other.localeCompare(b.other));
  if (rel.length > 0) {
    md += `## Relasi Database\n\n`;
    for (const r of rel) md += `- [[${wikiSafe(r.other)}]] (\`${r.label}\`, ${r.kind})\n`;
    md += "\n";
  }
  const usedBy = [...(modelSvcUsage[name] ?? [])].sort();
  if (usedBy.length > 0) {
    md += `## Dipakai oleh Fitur\n\n`;
    for (const s of usedBy) md += `- [[${wikiSafe(s)}]]\n`;
  }
  fs.writeFileSync(path.join(VAULT, "Database", `${name}.md`), md);
}

// 6c. Fitur/<service>-service.md
const svcOut = new Map(); // fromFileBase -> Set(toFileBase)
const svcIn = new Map(); // toFileBase -> Set(fromFileBase)
for (const [from, to] of rawSvcEdges) {
  (svcOut.get(from) ?? svcOut.set(from, new Set()).get(from)).add(to);
  (svcIn.get(to) ?? svcIn.set(to, new Set()).get(to)).add(from);
}
for (const file of serviceFiles) {
  const base = file.replace(/\.ts$/, "");
  let md = `---\ntags: [fitur]\n---\n# ${base}\n\n`;
  const deps = [...(svcOut.get(base) ?? [])].sort();
  if (deps.length > 0) {
    md += `## Bergantung ke fitur lain\n\n`;
    for (const d of deps) md += `- [[${wikiSafe(d)}]]\n`;
    md += "\n";
  }
  const dependents = [...(svcIn.get(base) ?? [])].sort();
  if (dependents.length > 0) {
    md += `## Dipakai fitur lain\n\n`;
    for (const d of dependents) md += `- [[${wikiSafe(d)}]]\n`;
    md += "\n";
  }
  const usedModels = [...(svcModelUsage[base] ?? [])].sort();
  if (usedModels.length > 0) {
    md += `## Memakai model database\n\n`;
    for (const m of usedModels) md += `- [[${wikiSafe(m)}]]\n`;
    md += "\n";
  }
  const routes = [...(usage[base.replace(/-service$/, "")] ?? [])].sort();
  if (routes.length > 0) {
    md += `## Dipakai di halaman\n\n`;
    for (const r of routes) md += `- \`${r}\`\n`;
  }
  fs.writeFileSync(path.join(VAULT, "Fitur", `${base}.md`), md);
}

// 6d. Home.md — pintu masuk vault (jangan overwrite kalau sudah ada perubahan manual besar;
// di sini kita selalu regenerate karena isinya murni daftar link, bukan narasi).
let home = `---\ntags: [home]\n---\n# Altora — Knowledge Vault\n\n`;
home += `Pusat pengetahuan proyek. Klik **Graph View** (ikon di sidebar kiri) untuk melihat semua relasi sebagai peta interaktif.\n\n`;
home += `## Domain Database (${Object.keys(sections).length})\n\n`;
for (const section of Object.keys(sections).sort()) home += `- [[${wikiSafe(domainTitle(section))}]]\n`;
home += `\n## Fitur (${serviceFiles.length})\n\n`;
for (const file of serviceFiles.map((f) => f.replace(/\.ts$/, "")).sort()) home += `- [[${wikiSafe(file)}]]\n`;
home += `\n## Alur Kerja (ditulis manual)\n\n`;
const alurDir = path.join(VAULT, "Alur Kerja");
const alurFiles = fs.existsSync(alurDir) ? fs.readdirSync(alurDir).filter((f) => f.endsWith(".md")) : [];
for (const f of alurFiles.sort()) home += `- [[${wikiSafe(f.replace(/\.md$/, ""))}]]\n`;
home += `\n---\n\n> Folder \`Database/\`, \`Fitur/\`, \`Domain/\`, dan catatan ini digenerate otomatis dari kode asli\n> (\`npm run knowledge\`) — jangan diedit manual, perubahan akan hilang. Folder\n> \`Alur Kerja/\` sengaja tidak disentuh script ini, aman diedit manual.\n`;
fs.writeFileSync(path.join(VAULT, "Home.md"), home);

console.log(
  `Selesai: ${modelNames.size} model, ${edges.length} relasi DB, ${svcEdges.length} relasi service, ${Object.keys(usage).length} service terpakai halaman.`
);
console.log(
  `Vault Obsidian: ${modelNames.size} catatan Database, ${serviceFiles.length} catatan Fitur, ${Object.keys(sections).length} catatan Domain → docs/obsidian-vault/`
);
