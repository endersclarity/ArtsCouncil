# Committee Report Delivery Guide

## Overview
This guide covers how to convert the markdown demand signal report into a PDF suitable for committee meetings, and how to automate the monthly process.

---

## PDF Conversion: Three Options

### Option 1: Pandoc (RECOMMENDED)

**Why:** Free, offline, professional output, widely supported, easy to customize with templates.

**Setup (one-time):**
```bash
# Install pandoc
# On Mac:
brew install pandoc

# On Windows (via Chocolatey):
choco install pandoc

# On Linux (Ubuntu/Debian):
sudo apt-get install pandoc
```

**Basic conversion:**
```bash
cd /Users/ender/.claude/projects/artsCouncil/.planning/phases/07-demand-signal-reporting/

pandoc SAMPLE-REPORT-FEBRUARY-2026.md -o report-february-2026.pdf \
  --from markdown \
  --to pdf \
  --variable fontsize=11pt \
  --variable geometry=margin=1in
```

**Output:** `report-february-2026.pdf` (professional 1-page or 2-page document)

**Customization with template:**

Create a file `committee-report-template.latex` with header/footer/branding:

```latex
\documentclass{article}
\usepackage[utf-8]{inputenc}
\usepackage{graphicx}
\usepackage{fancyhdr}
\usepackage{geometry}

\geometry{
  margin=1in,
  top=1.2in,
  bottom=1.2in
}

% Header with Arts Council logo
\pagestyle{fancy}
\lhead{\includegraphics[width=1in]{arts-council-logo.png}}
\chead{\textbf{Nevada County Arts Council}}
\rhead{\small \today}
\lfoot{\small Cultural Map Analytics Report}
\cfoot{\thepage}
\rfoot{\small \textit{Confidential - Committee Only}}

\title{Visitor Demand Signal Report}
\author{Cultural Map Analytics Team}
\date{\today}

\begin{document}

% Content will be inserted here

\end{document}
```

Then use:
```bash
pandoc SAMPLE-REPORT-FEBRUARY-2026.md -o report.pdf \
  --template committee-report-template.latex \
  --variable fontsize=11pt
```

**Pros:**
- ✓ Free and open-source
- ✓ No dependencies beyond pandoc
- ✓ Offline (no API calls)
- ✓ High-quality PDF output
- ✓ Easy LaTeX customization for branding

**Cons:**
- Requires pandoc installation
- LaTeX syntax learning curve for advanced customization

---

### Option 2: Markdown-PDF (Node.js)

**Why:** Fast, Node.js native, works on Windows/Mac/Linux without external tools.

**Setup:**
```bash
cd /Users/ender/.claude/projects/artsCouncil/

# Install globally
npm install -g markdown-pdf

# Or in project
npm install markdown-pdf
```

**Basic conversion:**
```bash
markdown-pdf .planning/phases/07-demand-signal-reporting/SAMPLE-REPORT-FEBRUARY-2026.md \
  -o report-february-2026.pdf
```

**Customization with CSS:**

Create `committee-report-styles.css`:
```css
body {
  font-family: Georgia, serif;
  line-height: 1.6;
  color: #333;
  background: white;
}

h1 {
  border-bottom: 3px solid #8B4513; /* Arts Council brown */
  padding-bottom: 10px;
  margin-top: 0;
}

h2 {
  color: #8B4513;
  margin-top: 30px;
  border-left: 4px solid #DAA520; /* Gold accent */
  padding-left: 15px;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 15px 0;
}

table th {
  background-color: #f2ece4; /* Cream background */
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}

table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.footer {
  border-top: 1px solid #ccc;
  margin-top: 20px;
  padding-top: 10px;
  font-size: 0.9em;
  color: #666;
}

/* Page break before new major sections */
h2:not(:first-of-type) {
  page-break-before: avoid;
}

/* Prevent orphaned headers */
h3 {
  page-break-after: avoid;
}
```

Then use:
```bash
markdown-pdf SAMPLE-REPORT-FEBRUARY-2026.md \
  -o report-february-2026.pdf \
  -c committee-report-styles.css
```

**Pros:**
- ✓ No external dependencies (pandoc not needed)
- ✓ Fast conversion
- ✓ CSS-based styling (familiar to web developers)

**Cons:**
- Requires Node.js
- Less control over layout than LaTeX
- Sometimes produces inconsistent pagination

---

### Option 3: Browser Print (Vercel Function)

**Why:** Branded, consistent with website design, accessible to non-technical committee members.

**Setup:**

1. Create `/api/render-report.js` in Vercel project:

```javascript
// website/cultural-map-redesign-stitch-lab/api/render-report.js

import fs from 'fs';
import path from 'path';

// Simple markdown to HTML converter
function markdownToHTML(md) {
  let html = md
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/\| (.*?) \|/g, '<td>$1</td>')
    .replace(/^(\|.*\|)$/gm, '<tr>$1</tr>');

  return `<p>${html}</p>`;
}

export default async function handler(req, res) {
  const { month = 'february', year = '2026' } = req.query;

  // Read report markdown from file
  const reportPath = path.join(
    process.cwd(),
    'public',
    'reports',
    `report-${month}-${year}.md`
  );

  let markdown = '';
  try {
    markdown = fs.readFileSync(reportPath, 'utf-8');
  } catch (err) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const html = markdownToHTML(markdown);

  const htmlPage = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Demand Signal Report — ${month.toUpperCase()} ${year}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'DM Sans', system-ui, sans-serif;
          line-height: 1.6;
          color: #1a1612;
          background: white;
          padding: 2in;
          max-width: 8.5in;
          margin: 0 auto;
        }
        @page { size: letter; margin: 1in; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
          h2 { page-break-after: avoid; }
          h3 { page-break-after: avoid; }
          table { page-break-inside: avoid; }
        }
        h1 {
          border-bottom: 3px solid #8B4513;
          padding-bottom: 15px;
          margin-bottom: 10px;
          font-size: 24px;
        }
        h2 {
          color: #8B4513;
          margin-top: 30px;
          margin-bottom: 15px;
          border-left: 4px solid #DAA520;
          padding-left: 15px;
          font-size: 18px;
        }
        h3 {
          color: #333;
          margin-top: 15px;
          margin-bottom: 10px;
          font-size: 14px;
          font-weight: 600;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 15px 0;
          font-size: 0.9em;
        }
        table th {
          background-color: #f2ece4;
          border: 1px solid #ccc;
          padding: 10px;
          text-align: left;
          font-weight: 600;
        }
        table td {
          border: 1px solid #ddd;
          padding: 8px;
        }
        em { font-style: italic; }
        strong { font-weight: 600; }
        .print-notice {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ccc;
          font-size: 0.85em;
          color: #666;
        }
        .no-print {
          background: #f9f6f0;
          padding: 15px;
          margin-bottom: 20px;
          border-left: 4px solid #DAA520;
        }
      </style>
    </head>
    <body>
      <div class="no-print">
        <p><strong>Print instructions:</strong> Use Ctrl+P (Cmd+P on Mac) and select "Save as PDF" to generate the final document.</p>
      </div>

      ${html}

      <div class="print-notice">
        <p><em>This report was generated by the Cultural Map analytics pipeline. For questions or corrections, contact the Arts Council office.</em></p>
      </div>
    </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(htmlPage);
}
```

2. Place report markdown in `public/reports/`:
```
website/cultural-map-redesign-stitch-lab/
├── public/
│   └── reports/
│       ├── report-january-2026.md
│       ├── report-february-2026.md
│       └── report-march-2026.md
```

3. Access and print:
```
https://cultural-map-redesign-stitch-lab.vercel.app/api/render-report?month=february&year=2026
→ Press Ctrl+P → Save as PDF
```

**Pros:**
- ✓ Branded with Arts Council styling
- ✓ No external tools needed (works in any browser)
- ✓ Same look as website
- ✓ Easy to customize CSS

**Cons:**
- Requires Vercel function deployment
- Browser print quality varies (different on Windows/Mac/Chrome/Safari)
- Extra step (visit URL, then print)

---

## Recommended Approach

**For this project: Use Pandoc + LaTeX template.**

**Why:**
1. One-time setup cost (install pandoc)
2. Offline (doesn't depend on Vercel availability)
3. Highest-quality PDF output
4. Professional appearance with branded header/footer
5. Easy to automate in scripts
6. Portable (works in CI/CD pipelines)

**Setup (copy-paste ready):**

```bash
# 1. Install pandoc (one-time)
brew install pandoc  # or apt-get / choco

# 2. Create template file
cat > /Users/ender/.claude/projects/artsCouncil/.planning/phases/07-demand-signal-reporting/template.latex << 'EOF'
\documentclass{article}
\usepackage[utf-8]{inputenc}
\usepackage{graphicx}
\usepackage{fancyhdr}
\usepackage{geometry}
\usepackage{hyperref}

\geometry{margin=1in, top=1.25in, bottom=1in}

\pagestyle{fancy}
\fancyhf{}
\lhead{\textbf{Nevada County Arts Council}}
\chead{\textit{Visitor Demand Signal Report}}
\rhead{\small\today}
\lfoot{\small Cultural Map Analytics}
\cfoot{\thepage}
\rfoot{\small Confidential — Committee Use Only}
\renewcommand{\headrulewidth}{1pt}

\hypersetup{colorlinks=true, urlcolor=blue}

\title{Visitor Demand Signal Report}
\author{Cultural Map Analytics Team}

\begin{document}

$body$

\end{document}
EOF

# 3. Convert markdown to PDF
pandoc SAMPLE-REPORT-FEBRUARY-2026.md \
  -o report-february-2026.pdf \
  --template template.latex \
  --variable fontsize=11pt \
  --toc \
  --number-sections
```

---

## Automation: Monthly Report Generation

### Step 1: Create Data Pull Script

Create `/scripts/generate-monthly-report.js`:

```javascript
#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const path = require('path');
require('dotenv').config();

const UMAMI_API = 'https://cloud.umami.is/analytics/us/api';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;
const UMAMI_TOKEN = process.env.UMAMI_API_TOKEN; // Requires extraction from browser
const UMAMI_WEBSITE_ID = process.env.UMAMI_WEBSITE_ID;

async function fetchUmamiStats(startAt, endAt) {
  const url = `${UMAMI_API}/websites/${UMAMI_WEBSITE_ID}/events/stats?startAt=${startAt}&endAt=${endAt}`;
  return fetch(url, {
    headers: { 'Authorization': `Bearer ${UMAMI_TOKEN}` }
  }).then(r => r.json());
}

async function fetchUmamiEvents(startAt, endAt) {
  const url = `${UMAMI_API}/websites/${UMAMI_WEBSITE_ID}/metrics?startAt=${startAt}&endAt=${endAt}&type=event`;
  return fetch(url, {
    headers: { 'Authorization': `Bearer ${UMAMI_TOKEN}` }
  }).then(r => r.json());
}

async function fetchSupabaseChatlogs(startDate, endDate) {
  const url = `${SUPABASE_URL}/rest/v1/chat_logs?select=*&created_at=gte.${startDate}&created_at=lt.${endDate}&order=created_at.desc`;
  return fetch(url, {
    headers: { 'Authorization': `Bearer ${SUPABASE_KEY}` }
  }).then(r => r.json());
}

async function generateReport(month, year) {
  console.log(`Generating report for ${month}/${year}...`);

  // Get month boundaries
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);
  const startAt = startDate.getTime();
  const endAt = endDate.getTime();

  // Fetch data
  const stats = await fetchUmamiStats(startAt, endAt);
  const events = await fetchUmamiEvents(startAt, endAt);
  const chatlogs = await fetchSupabaseChatlogs(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  );

  // Generate markdown (fill in template with data)
  const markdown = `
# Nevada County Arts Council — Visitor Demand Signal Report

**Report Period:** ${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
**Report Date:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

## Executive Summary

${stats.visitors} visitors explored our cultural asset map...

[Continue filling in sections with actual data]
  `.trim();

  // Save markdown
  const filename = `report-${month}-${year}.md`;
  fs.writeFileSync(filename, markdown);
  console.log(`✓ Generated ${filename}`);

  return filename;
}

// Run
const [month, year] = process.argv.slice(2);
if (!month || !year) {
  console.error('Usage: node generate-monthly-report.js <month> <year>');
  process.exit(1);
}

generateReport(parseInt(month), parseInt(year))
  .then(() => {
    console.log('✓ Report generation complete');
    console.log('Next: pandoc <filename>.md -o <filename>.pdf --template template.latex');
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
```

### Step 2: Create Shell Script to Automate All Steps

Create `/scripts/publish-monthly-report.sh`:

```bash
#!/bin/bash

# publish-monthly-report.sh — Automated monthly report generation and distribution

set -e

REPORT_DIR="/Users/ender/.claude/projects/artsCouncil/.planning/phases/07-demand-signal-reporting"
SCRIPT_DIR="/Users/ender/.claude/projects/artsCouncil/scripts"

# Get current month/year
MONTH=$(date +%m)
YEAR=$(date +%Y)
MONTH_NAME=$(date +%B)

echo "📊 Generating demand signal report for $MONTH_NAME $YEAR..."

# 1. Generate markdown
node "$SCRIPT_DIR/generate-monthly-report.js" "$MONTH" "$YEAR"
MD_FILE="$REPORT_DIR/report-${MONTH}-${YEAR}.md"

# 2. Convert to PDF
echo "📄 Converting to PDF..."
pandoc "$MD_FILE" \
  -o "$REPORT_DIR/report-${MONTH}-${YEAR}.pdf" \
  --template "$REPORT_DIR/template.latex" \
  --variable fontsize=11pt

# 3. Create archive
echo "📦 Archiving..."
mkdir -p "$REPORT_DIR/archive"
cp "$REPORT_DIR/report-${MONTH}-${YEAR}.pdf" "$REPORT_DIR/archive/"

# 4. Email to committee (optional — requires mail setup)
# echo "📧 Emailing committee..."
# mail -s "Arts Council Demand Signal Report - $MONTH_NAME $YEAR" \
#   "committee@nevadacountyartscouncil.org" \
#   -a "$REPORT_DIR/report-${MONTH}-${YEAR}.pdf" \
#   < /dev/null

echo "✅ Report complete:"
echo "   Markdown: $MD_FILE"
echo "   PDF: $REPORT_DIR/report-${MONTH}-${YEAR}.pdf"
echo ""
echo "Next step: Review PDF and send to committee"
```

### Step 3: Schedule with Cron (Mac/Linux)

```bash
# Edit crontab
crontab -e

# Add this line to run report generation on 1st of month at 6am
0 6 1 * * bash /Users/ender/.claude/projects/artsCouncil/scripts/publish-monthly-report.sh
```

### Step 4: Manual Execution

```bash
# If you need to generate a specific month (useful for backtesting)
node scripts/generate-monthly-report.js 2 2026  # February 2026

# Then convert
pandoc .planning/phases/07-demand-signal-reporting/report-2-2026.md \
  -o .planning/phases/07-demand-signal-reporting/report-2-2026.pdf \
  --template .planning/phases/07-demand-signal-reporting/template.latex \
  --variable fontsize=11pt
```

---

## Distribution Checklist

Before sending the PDF to the committee:

- [ ] **Data sanity check:** Do the numbers make sense? Compare to last month.
- [ ] **No PII:** Verify no sensitive data (IPs, emails, phone numbers) in the final report.
- [ ] **Visual check:** Open PDF in Adobe Reader or Preview. Check formatting, fonts, tables.
- [ ] **Links work:** If PDF has hyperlinks, test them.
- [ ] **File size:** Should be 100KB–2MB. If larger, investigate.
- [ ] **Filename:** Use format `report-MONTH-YEAR.pdf` (e.g., `report-february-2026.pdf`)
- [ ] **Archive:** Save a copy to `archive/` folder for future reference.
- [ ] **Email subject:** Clear and dated: "Arts Council Demand Signal Report — February 2026"

---

## Committee Meeting Presentation

### 5-Minute Overview

1. **Show Executive Summary slide:** "Here's what happened this month in 30 seconds."
2. **Show Business Engagement Ranking table:** "Which local businesses got real traffic."
3. **Show one case study:** "Here's a real example of a visitor's journey."
4. **Ask one question:** "Which businesses should we support next?"

### Full 15-Minute Presentation

1. Metrics overview (1 min)
2. Demand signals breakdown by type (4 min)
3. Business engagement ranking + case studies (5 min)
4. Trends & recommendations (3 min)
5. Q&A (2 min)

### Handout

Print 2-3 copies of the PDF for each meeting. Include a cover sheet:

```
Nevada County Arts Council
Experience Planning Committee Meeting

[Date]

Visitor Demand Signal Report — [Month] [Year]

This report shows:
• How many visitors used our cultural map
• What kinds of experiences they're looking for
• Which local businesses got traffic from our platform
• What the data suggests we should do next

Questions? Contact [Your Name] at [Email]
```

---

## File Structure

After setting up, your directory should look like:

```
.planning/phases/07-demand-signal-reporting/
├── COMMITTEE-REPORT-TEMPLATE.md           ← Template (fill this in monthly)
├── METRICS-DATASOURCE-MAPPING.md          ← Data source reference
├── SAMPLE-REPORT-FEBRUARY-2026.md         ← Example output
├── REPORT-DELIVERY-GUIDE.md               ← This file
├── template.latex                         ← Pandoc LaTeX template
├── archive/
│   ├── report-january-2026.pdf
│   ├── report-february-2026.pdf
│   ├── report-march-2026.pdf
│   └── ...
├── report-january-2026.md
├── report-january-2026.pdf
├── report-february-2026.md
├── report-february-2026.pdf
└── ...
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Pandoc not found | Install with `brew install pandoc` |
| "Bearer token invalid" error | Extract fresh token from `localStorage['umami.auth']` in Umami dashboard |
| PDF looks broken (fonts/tables) | Try Pandoc v2.18+ ; update with `brew upgrade pandoc` |
| Charts don't render | Use markdown tables, not HTML <table> elements |
| Report generation times out | Split data pull into weeks instead of full month; add error handling |

---

## Next Steps

1. **Test Pandoc workflow** with SAMPLE-REPORT-FEBRUARY-2026.md
2. **Extract Umami API token** and add to `.env`
3. **Create template.latex** with Arts Council branding
4. **Test data pull script** with January 2026 data
5. **Schedule cron job** for automated monthly generation
6. **Run first committee report** and gather feedback on format

---

**Document version:** 1.0
**Last updated:** February 18, 2026
**Maintained by:** Reporter team (Phase 7)
