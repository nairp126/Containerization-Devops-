const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
const puppeteer = require("puppeteer");

// ─── Configuration ──────────────────────────────────────────────
const LAB_DIR = path.resolve(__dirname, "..", "lab");
const OUTPUT_PDF = path.resolve(__dirname, "..", "Lab_Report_Pranav_Nair.pdf");

const STUDENT = {
  name: "Pranav R Nair",
  sapId: "500121466",
  rollNo: "R2142230197",
  batch: "2 (CCVT)",
  course: "Containerization & DevOps",
  university: "University of Petroleum and Energy Studies",
};

// Order of experiments (matches repo)
const EXPERIMENTS = [
  "EXP-1", "EXP-2", "EXP-3", "EXP-4", "EXP-5",
  "EXP-6", "EXP-7", "EXP-9", "EXP-10", "EXP-11", "EXP-12",
];

// ─── Markdown → HTML (with Mermaid support) ─────────────────────
function parseMarkdown(md, expDir) {
  // Convert image paths: ![alt](Screenshot...) → inline base64 data URIs
  // Puppeteer's setContent() cannot load file:// URLs, so we embed images directly
  md = md.replace(
    /!\[([^\]]*)\]\((?!http|data:)(.+?(?:\.png|\.jpg|\.jpeg|\.gif|\.webp|\.svg))\)/gi,
    (_, alt, src) => {
      const absPath = path.resolve(expDir, decodeURIComponent(src));
      if (fs.existsSync(absPath)) {
        const ext = path.extname(absPath).toLowerCase().replace(".", "");
        const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
        const base64 = fs.readFileSync(absPath).toString("base64");
        return `![${alt}](data:${mime};base64,${base64})`;
      }
      console.log(`    ⚠️  Image not found: ${absPath}`);
      return `![${alt}]()`;
    }
  );

  // Strip Jekyll frontmatter
  md = md.replace(/^---[\s\S]*?---\s*/, "");

  // Custom renderer to handle Mermaid code blocks
  const renderer = new marked.Renderer();
  const origCode = renderer.code;

  renderer.code = function ({ text, lang }) {
    if (lang === "mermaid") {
      return `<pre class="mermaid">${text}</pre>`;
    }
    // Use default code rendering
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<pre><code class="language-${lang || ""}">${escaped}</code></pre>`;
  };

  return marked(md, { renderer });
}

// ─── Extract title from markdown ────────────────────────────────
function extractTitle(md) {
  // Try Jekyll frontmatter title
  const fmMatch = md.match(/title:\s*["']?(.+?)["']?\s*$/m);
  if (fmMatch) return fmMatch[1];

  // Try first # heading
  const h1Match = md.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1];

  return "Untitled Experiment";
}

// ─── Build HTML ─────────────────────────────────────────────────
function buildHTML(experiments) {
  const coverPage = `
    <div class="cover-page">
      <div class="cover-border">
        <div class="cover-university">${STUDENT.university}</div>
        <div class="cover-title">${STUDENT.course}</div>
        <div class="cover-subtitle">Lab Report</div>
        <div class="cover-divider"></div>
        <table class="cover-table">
          <tr><td class="cover-label">Name</td><td class="cover-value">${STUDENT.name}</td></tr>
          <tr><td class="cover-label">SAP ID</td><td class="cover-value">${STUDENT.sapId}</td></tr>
          <tr><td class="cover-label">Roll No</td><td class="cover-value">${STUDENT.rollNo}</td></tr>
          <tr><td class="cover-label">Batch</td><td class="cover-value">${STUDENT.batch}</td></tr>
        </table>
        <div class="cover-divider"></div>
        <div class="cover-index-title">Index of Experiments</div>
        <table class="index-table">
          <thead>
            <tr><th>#</th><th>Experiment Title</th><th>Page</th></tr>
          </thead>
          <tbody>
            ${experiments
      .map(
        (exp, i) =>
          `<tr><td>${i + 1}</td><td>${exp.title}</td><td>—</td></tr>`
      )
      .join("\n")}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const experimentPages = experiments
    .map(
      (exp) => `
    <div class="experiment-section">
      ${exp.html}
    </div>
  `
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${STUDENT.course} - Lab Report - ${STUDENT.name}</title>
  <style>
    /* ─── Page Setup ─── */
    @page {
      size: A4;
      margin: 20mm 18mm 25mm 18mm;
    }
    @page :first {
      margin: 0;
    }

    * { box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a2e;
      max-width: 100%;
    }

    /* ─── Cover Page ─── */
    .cover-page {
      page-break-after: always;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 30mm;
      background: #fff;
    }
    .cover-border {
      border: 3px solid #0f3460;
      border-radius: 8px;
      padding: 40px 50px;
      text-align: center;
      width: 100%;
    }
    .cover-university {
      font-size: 14pt;
      color: #555;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .cover-title {
      font-size: 28pt;
      font-weight: 700;
      color: #0f3460;
      margin: 10px 0 5px;
    }
    .cover-subtitle {
      font-size: 18pt;
      color: #e94560;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .cover-divider {
      width: 60%;
      height: 2px;
      background: linear-gradient(90deg, transparent, #0f3460, transparent);
      margin: 20px auto;
    }
    .cover-table {
      margin: 15px auto;
      border-collapse: collapse;
      font-size: 12pt;
    }
    .cover-table td {
      padding: 6px 20px;
      text-align: left;
    }
    .cover-label {
      font-weight: 600;
      color: #0f3460;
      width: 100px;
    }
    .cover-value {
      color: #333;
    }
    .cover-index-title {
      font-size: 16pt;
      font-weight: 700;
      color: #0f3460;
      margin-bottom: 12px;
    }
    .index-table {
      margin: 0 auto;
      border-collapse: collapse;
      width: 90%;
      font-size: 10.5pt;
    }
    .index-table th {
      background: #0f3460;
      color: #fff;
      padding: 8px 12px;
      text-align: left;
    }
    .index-table td {
      padding: 6px 12px;
      border-bottom: 1px solid #ddd;
    }
    .index-table tr:nth-child(even) td {
      background: #f7f9fc;
    }

    /* ─── Experiment Sections ─── */
    .experiment-section {
      page-break-before: always;
    }

    /* ─── Typography ─── */
    h1 {
      font-size: 20pt;
      color: #0f3460;
      border-bottom: 3px solid #e94560;
      padding-bottom: 6px;
      margin-top: 0;
    }
    h2 {
      font-size: 16pt;
      color: #0f3460;
      border-bottom: 1px solid #ddd;
      padding-bottom: 4px;
      margin-top: 25px;
    }
    h3 {
      font-size: 13pt;
      color: #16213e;
      margin-top: 20px;
    }
    h4 {
      font-size: 11.5pt;
      color: #333;
      margin-top: 15px;
    }

    /* ─── Tables ─── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 10pt;
    }
    th {
      background: #0f3460;
      color: #fff;
      padding: 8px 10px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 7px 10px;
      border-bottom: 1px solid #e0e0e0;
    }
    tr:nth-child(even) td {
      background: #f7f9fc;
    }

    /* ─── Code Blocks ─── */
    pre {
      background: #1e1e2e;
      color: #cdd6f4;
      padding: 14px 16px;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 9.5pt;
      line-height: 1.5;
      page-break-inside: avoid;
    }
    code {
      font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
      font-size: 9.5pt;
    }
    p code, li code, td code {
      background: #e8edf3;
      color: #d33833;
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 9pt;
    }

    /* ─── Mermaid Diagrams ─── */
    pre.mermaid {
      background: #fff;
      text-align: center;
      padding: 20px;
      border: 1px solid #e0e0e0;
      color: #1a1a2e;
      page-break-inside: avoid;
    }

    /* ─── Images ─── */
    img {
      max-width: 100%;
      height: auto;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin: 10px 0;
      page-break-inside: avoid;
    }

    /* ─── Blockquotes ─── */
    blockquote {
      border-left: 4px solid #f5a623;
      background: #fffdf5;
      padding: 10px 16px;
      margin: 12px 0;
      font-size: 10.5pt;
      color: #555;
      page-break-inside: avoid;
    }
    blockquote strong {
      color: #d33833;
    }

    /* ─── Lists ─── */
    ul, ol {
      padding-left: 22px;
    }
    li {
      margin-bottom: 3px;
    }

    /* ─── Horizontal Rule ─── */
    hr {
      border: none;
      height: 1px;
      background: linear-gradient(90deg, transparent, #0f3460, transparent);
      margin: 25px 0;
    }

    /* ─── Print Optimizations ─── */
    @media print {
      body { font-size: 10.5pt; }
      pre { font-size: 8.5pt; }
      .cover-page { padding: 20mm; }
    }
  </style>
</head>
<body>
  ${coverPage}
  ${experimentPages}

  <!-- Mermaid.js for diagram rendering -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: { useMaxWidth: true, htmlLabels: true },
    });
  </script>
</body>
</html>`;
}

// ─── Main ───────────────────────────────────────────────────────
async function main() {
  console.log("📄 Lab Report Generator");
  console.log("========================\n");

  // 1. Read all experiment markdown files
  const experiments = [];
  for (const expName of EXPERIMENTS) {
    const expDir = path.join(LAB_DIR, expName);
    const mdPath = path.join(expDir, "index.md");

    if (!fs.existsSync(mdPath)) {
      console.log(`  ⚠️  Skipping ${expName} — index.md not found`);
      continue;
    }

    const md = fs.readFileSync(mdPath, "utf-8");
    const title = extractTitle(md);
    const html = parseMarkdown(md, expDir);

    experiments.push({ name: expName, title, html });
    console.log(`  ✅ ${expName}: ${title}`);
  }

  console.log(`\n📦 Combining ${experiments.length} experiments...\n`);

  // 2. Build combined HTML
  const html = buildHTML(experiments);

  // Save HTML (useful for debugging)
  const htmlPath = path.resolve(__dirname, "..", "Lab_Report.html");
  fs.writeFileSync(htmlPath, html, "utf-8");
  console.log(`  📝 HTML saved: ${htmlPath}`);

  // 3. Launch Puppeteer and generate PDF
  console.log("  🚀 Launching browser for PDF generation...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Load the HTML — images are base64-inlined so no network needed for them
  console.log("  ⏳ Loading HTML (this may take a moment with embedded images)...");
  await page.setContent(html, {
    waitUntil: "domcontentloaded",
    timeout: 300000,
  });

  // Wait for Mermaid diagrams to render
  console.log("  ⏳ Waiting for Mermaid diagrams to render...");
  await page.waitForFunction(
    () => {
      const diagrams = document.querySelectorAll("pre.mermaid");
      if (diagrams.length === 0) return true;
      // Mermaid replaces <pre> content with SVG
      return Array.from(diagrams).every(
        (d) => d.querySelector("svg") || d.getAttribute("data-processed")
      );
    },
    { timeout: 60000 }
  ).catch(() => {
    console.log("  ⚠️  Some Mermaid diagrams may not have rendered (timeout)");
  });

  // Extra wait for SVG rendering
  await new Promise((r) => setTimeout(r, 3000));

  // 4. Generate PDF
  console.log("  📄 Generating PDF...");
  await page.pdf({
    path: OUTPUT_PDF,
    format: "A4",
    printBackground: true,
    margin: {
      top: "20mm",
      right: "18mm",
      bottom: "25mm",
      left: "18mm",
    },
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:8pt; color:#999; width:100%; text-align:center; padding:5px 0;">
      ${STUDENT.course} — ${STUDENT.name} (${STUDENT.sapId})
    </div>`,
    footerTemplate: `<div style="font-size:8pt; color:#999; width:100%; text-align:center; padding:5px 0;">
      Page <span class="pageNumber"></span> of <span class="totalPages"></span>
    </div>`,
  });

  await browser.close();

  const stats = fs.statSync(OUTPUT_PDF);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);

  console.log(`\n✅ Done! PDF generated successfully.`);
  console.log(`   📁 ${OUTPUT_PDF}`);
  console.log(`   📊 Size: ${sizeMB} MB`);
  console.log(`   📑 Experiments: ${experiments.length}`);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
