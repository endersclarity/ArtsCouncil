# MUSE Evidence Corpus

This folder stores local MUSE issue evidence for the Arts Council prototype.

Each issue folder contains:

- `manifest.json`: source URL, PDF URL, page count, extraction tool notes, and page inventory.
- `pages/muse-YYYY-page-NNN.jpg`: page image for visual reference.
- `pages/muse-YYYY-page-NNN.txt`: OCR/text extraction for the same page.

The source PDFs are not retained. Re-run `scripts/ingest-muse-corpus.py` to refetch and regenerate page pairs from the manifest source URLs.

Use issue year and page number when grounding card copy or visual references.
