#!/usr/bin/env python3
"""Ingest MUSE PDFs into page image/text pairs and manifests."""

from __future__ import annotations

import datetime as dt
import json
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CORPUS_DIR = ROOT / "docs" / "muse-corpus"

ISSUES = {
    "2024": {
        "issue": "MUSE Issue 01 / 2024",
        "source_url": "https://heyzine.com/flip-book/4d7f1d311e.html",
        "pdf_url": "https://cdnc.heyzine.com/files/uploaded/4d7f1d311e4f5b15a7c7a2f3b1318898f9da2585.pdf",
    },
    "2025": {
        "issue": "MUSE Issue 02 / 2025",
        "source_url": "https://heyzine.com/flip-book/MUSE",
        "pdf_url": "https://cdnc.heyzine.com/files/uploaded/50ca31df594ecc4bbc3950692941a82a6ec50d2e.pdf",
    },
    "2026": {
        "issue": "MUSE Issue 03 / 2026",
        "source_url": "https://heyzine.com/flip-book/MUSE26",
        "pdf_url": "https://cdnc.heyzine.com/files/uploaded/v3/5e4ca7b610dcf5736b0bca9efb46698ae0ae1253.pdf",
    },
}


def require_tool(name: str) -> str:
    path = shutil.which(name)
    if not path:
        raise SystemExit(f"Missing required tool: {name}")
    return path


def run(args: list[str]) -> str:
    return subprocess.check_output(args, text=True, stderr=subprocess.STDOUT)


def download(url: str, dest: Path) -> None:
    if dest.exists() and dest.stat().st_size > 0:
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=120) as response:
        dest.write_bytes(response.read())


def page_count(pdf: Path) -> int:
    output = run(["pdfinfo", str(pdf)])
    for line in output.splitlines():
        if line.startswith("Pages:"):
            return int(line.split(":", 1)[1].strip())
    raise RuntimeError(f"Could not determine page count for {pdf}")


def extract_text(pdf: Path, page: int, text_path: Path) -> str:
    text_path.parent.mkdir(parents=True, exist_ok=True)
    run([
        "pdftotext",
        "-f",
        str(page),
        "-l",
        str(page),
        "-layout",
        str(pdf),
        str(text_path),
    ])
    return text_path.read_text(encoding="utf-8", errors="replace").strip()


def render_page(pdf: Path, page: int, image_path: Path) -> None:
    image_path.parent.mkdir(parents=True, exist_ok=True)
    prefix = image_path.with_suffix("")
    run([
        "pdftoppm",
        "-f",
        str(page),
        "-singlefile",
        "-jpeg",
        "-jpegopt",
        "quality=85",
        "-r",
        "150",
        str(pdf),
        str(prefix),
    ])


def ocr_image(image_path: Path) -> str:
    try:
        return run(["tesseract", str(image_path), "stdout", "--psm", "6"]).strip()
    except subprocess.CalledProcessError:
        return ""


def ingest_issue(year: str, meta: dict[str, str]) -> dict[str, object]:
    issue_dir = CORPUS_DIR / year
    pages_dir = issue_dir / "pages"
    pdf_path = issue_dir / "source.pdf"
    download(meta["pdf_url"], pdf_path)
    count = page_count(pdf_path)

    pages: list[dict[str, object]] = []
    for page in range(1, count + 1):
        basename = f"muse-{year}-page-{page:03d}"
        image_path = pages_dir / f"{basename}.jpg"
        text_path = pages_dir / f"{basename}.txt"
        render_page(pdf_path, page, image_path)
        text = extract_text(pdf_path, page, text_path)
        extraction = "pdftotext"
        if len(text) < 20:
            ocr_text = ocr_image(image_path)
            if len(ocr_text) > len(text):
                text_path.write_text(ocr_text + "\n", encoding="utf-8")
                text = ocr_text
                extraction = "tesseract"
        pages.append({
            "page": page,
            "image": str(image_path.relative_to(issue_dir)),
            "text": str(text_path.relative_to(issue_dir)),
            "text_chars": len(text),
            "text_extraction": extraction,
        })

    try:
        pdf_path.unlink()
        source_pdf_retained = False
    except OSError:
        source_pdf_retained = True

    manifest = {
        "issue_year": year,
        "issue": meta["issue"],
        "source_url": meta["source_url"],
        "pdf_url": meta["pdf_url"],
        "source_pdf_retained": source_pdf_retained,
        "page_count": count,
        "extracted_at": dt.datetime.now(dt.UTC).isoformat(timespec="seconds"),
        "tools": {
            "pdfinfo": run(["pdfinfo", "-v"]).splitlines()[0],
            "pdftotext": run(["pdftotext", "-v"]).splitlines()[0],
            "pdftoppm": run(["pdftoppm", "-v"]).splitlines()[0],
            "tesseract": run(["tesseract", "--version"]).splitlines()[0],
        },
        "notes": [
            "Each page has a same-basename PNG image and TXT text file.",
            "Text is extracted with pdftotext first; tesseract is used for pages with very short extracted text.",
        ],
        "pages": pages,
    }
    (issue_dir / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    return manifest


def main() -> None:
    for tool in ["pdfinfo", "pdftotext", "pdftoppm", "tesseract"]:
        require_tool(tool)
    selected = sys.argv[1:] or list(ISSUES)
    for year in selected:
        if year not in ISSUES:
            raise SystemExit(f"Unknown issue year: {year}")
        manifest = ingest_issue(year, ISSUES[year])
        print(f"{year}: {manifest['page_count']} pages")


if __name__ == "__main__":
    main()
