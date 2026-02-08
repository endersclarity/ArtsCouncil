#!/usr/bin/env python
# -*- coding: utf-8 -*-
import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
"""
Fetch images for Nevada County cultural assets.

Tier 1: Scrape og:image from asset websites
Tier 2: Query Wikimedia Commons API for landmarks/trails/public art
Tier 3: Flag remaining assets for manual review

Outputs updated image_data.json with the schema:
{
  "Asset Name": {
    "img": "https://...",
    "alt": "Description",
    "credit": "Source",
    "source": "og:image|wikimedia|manual"
  }
}

Usage:
  python scripts/fetch_images.py                   # Run full pipeline
  python scripts/fetch_images.py --tier1-only      # Only og:image scraping
  python scripts/fetch_images.py --tier2-only      # Only Wikimedia Commons
  python scripts/fetch_images.py --dry-run         # Show what would be fetched
  python scripts/fetch_images.py --resume          # Skip already-found images
"""

import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
import urllib.error
import ssl
from html.parser import HTMLParser
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
SITE_DIR = PROJECT_DIR / "website" / "cultural-map-redesign"
DATA_JSON = SITE_DIR / "data.json"
IMAGE_JSON = SITE_DIR / "image_data.json"
REPORT_FILE = SCRIPT_DIR / "image_fetch_report.json"
GOOGLE_API_KEY_FILE = Path.home() / ".gmail_credentials" / "google_places_api_key.txt"

# Rate limiting
OG_DELAY = 1.0        # seconds between og:image requests
WIKI_DELAY = 0.5      # seconds between Wikimedia requests
PLACES_DELAY = 0.2    # seconds between Google Places requests
REQUEST_TIMEOUT = 10   # seconds per request

# Categories best served by Wikimedia
WIKI_CATEGORIES = {"Historic Landmarks", "Walks & Trails", "Public Art", "Preservation & Culture"}

# SSL context that doesn't verify (some small business sites have bad certs)
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

USER_AGENT = "NevadaCountyCulturalMap/1.0 (community project; contact development@thenorthstarhouse.org)"


class OGImageParser(HTMLParser):
    """Extract og:image, twitter:image, and first large <img> from HTML <head>."""

    def __init__(self):
        super().__init__()
        self.og_image = None
        self.twitter_image = None
        self.in_head = False
        self.done = False

    def handle_starttag(self, tag, attrs):
        if self.done:
            return
        attrs_dict = dict(attrs)

        if tag == "head":
            self.in_head = True
            return

        if tag == "meta" and self.in_head:
            prop = attrs_dict.get("property", "").lower()
            name = attrs_dict.get("name", "").lower()
            content = attrs_dict.get("content", "")

            if prop == "og:image" and content:
                self.og_image = content
                self.done = True
            elif name == "twitter:image" and content and not self.og_image:
                self.twitter_image = content

    def handle_endtag(self, tag):
        if tag == "head":
            self.in_head = False
            if self.og_image or self.twitter_image:
                self.done = True

    def get_image(self):
        return self.og_image or self.twitter_image


def fetch_url(url, timeout=REQUEST_TIMEOUT):
    """Fetch URL content with proper headers and error handling."""
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    req = urllib.request.Request(url, headers={
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,*/*",
    })
    try:
        resp = urllib.request.urlopen(req, timeout=timeout, context=SSL_CTX)
        # Only read first 100KB - og:image is always in <head>
        data = resp.read(100_000)
        charset = resp.headers.get_content_charset() or "utf-8"
        return data.decode(charset, errors="replace")
    except Exception as e:
        return None


def normalize_url(img_url, base_url):
    """Resolve relative image URLs against the page base URL."""
    if not img_url:
        return None
    img_url = img_url.strip()
    if img_url.startswith("//"):
        return "https:" + img_url
    if img_url.startswith("/"):
        parsed = urllib.parse.urlparse(base_url)
        return f"{parsed.scheme}://{parsed.netloc}{img_url}"
    if not img_url.startswith(("http://", "https://")):
        return urllib.parse.urljoin(base_url, img_url)
    return img_url


def verify_image_url(url):
    """Quick HEAD request to verify the image URL is reachable and is actually an image."""
    if not url:
        return False
    try:
        req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": USER_AGENT})
        resp = urllib.request.urlopen(req, timeout=5, context=SSL_CTX)
        content_type = resp.headers.get("Content-Type", "")
        return "image" in content_type or url.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"))
    except Exception:
        # Some servers block HEAD, try anyway
        return True


def scrape_og_image(website_url):
    """Fetch a page and extract the og:image URL."""
    html = fetch_url(website_url)
    if not html:
        return None

    parser = OGImageParser()
    try:
        parser.feed(html)
    except Exception:
        pass

    img = parser.get_image()
    return normalize_url(img, website_url)


def search_wikimedia(query, city=None):
    """Search Wikimedia Commons for an image matching the query.

    Returns (image_url, artist, license) or (None, None, None).
    """
    search_term = query
    if city:
        search_term += f" {city}"
    search_term += " Nevada County California"

    # Step 1: Search for files
    params = urllib.parse.urlencode({
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrnamespace": "6",  # File namespace
        "gsrsearch": search_term,
        "gsrlimit": "3",
        "prop": "imageinfo",
        "iiprop": "url|extmetadata|mime",
        "iiurlwidth": "800",
    })
    url = f"https://commons.wikimedia.org/w/api.php?{params}"

    try:
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        resp = urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT)
        data = json.loads(resp.read())
    except Exception:
        return None, None, None

    pages = data.get("query", {}).get("pages", {})
    if not pages:
        return None, None, None

    # Pick the first image result
    for page_id, page in sorted(pages.items(), key=lambda x: x[0]):
        imageinfo = page.get("imageinfo", [{}])[0]
        mime = imageinfo.get("mime", "")
        if "image" not in mime:
            continue

        thumb_url = imageinfo.get("thumburl") or imageinfo.get("url")
        if not thumb_url:
            continue

        meta = imageinfo.get("extmetadata", {})
        artist = meta.get("Artist", {}).get("value", "Unknown")
        # Strip HTML from artist
        artist = re.sub(r"<[^>]+>", "", artist).strip()
        license_short = meta.get("LicenseShortName", {}).get("value", "")

        return thumb_url, artist, license_short

    return None, None, None


def search_google_places(name, city, api_key):
    """Search Google Places for a business/landmark and return a stable photo URL.

    Returns (image_url, attribution) or (None, None).
    The photo URL is resolved to the final googleusercontent.com URL so it can
    be hotlinked without burning an API call on every page view.
    """
    query = f"{name} {city} CA" if city else f"{name} Nevada County CA"
    params = urllib.parse.urlencode({
        "query": query,
        "key": api_key,
    })
    url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?{params}"

    try:
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        resp = urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT)
        data = json.loads(resp.read())
    except Exception:
        return None, None

    if data.get("status") != "OK" or not data.get("results"):
        return None, None

    place = data["results"][0]
    photos = place.get("photos", [])
    if not photos:
        return None, None

    photo_ref = photos[0]["photo_reference"]
    attributions = photos[0].get("html_attributions", [])
    attr_text = re.sub(r"<[^>]+>", "", attributions[0]).strip() if attributions else "Google"

    # Build the Places Photo URL and resolve the redirect to get a stable URL
    photo_api_url = (
        f"https://maps.googleapis.com/maps/api/place/photo"
        f"?maxwidth=600&photo_reference={photo_ref}&key={api_key}"
    )
    try:
        req = urllib.request.Request(photo_api_url, method="HEAD", headers={"User-Agent": USER_AGENT})
        resp = urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT)
        final_url = resp.url  # the redirected googleusercontent.com URL
        return final_url, attr_text
    except Exception:
        # If HEAD fails, return the API URL as fallback
        return photo_api_url, attr_text


def make_alt_text(name, category, city):
    """Generate a reasonable alt text."""
    if category == "Historic Landmarks":
        return f"{name}, historic landmark in {city or 'Nevada County'}"
    elif category == "Walks & Trails":
        return f"{name} trail in {city or 'Nevada County'}"
    elif category == "Public Art":
        return f"{name}, public art in {city or 'Nevada County'}"
    elif category == "Galleries & Museums":
        return f"{name} in {city or 'Nevada County'}"
    elif category == "Performance Spaces":
        return f"{name} in {city or 'Nevada County'}"
    elif category == "Eat, Drink & Stay":
        return f"{name} in {city or 'Nevada County'}"
    else:
        return f"{name} in {city or 'Nevada County'}"


def run_pipeline(tier1=True, tier2=True, tier3=True, dry_run=False, resume=True):
    """Main pipeline."""

    # Load data
    with open(DATA_JSON) as f:
        assets = json.load(f)

    # Load existing image data
    if IMAGE_JSON.exists():
        with open(IMAGE_JSON, encoding="utf-8") as f:
            image_data = json.load(f)
    else:
        image_data = {}

    print(f"Loaded {len(assets)} assets, {len(image_data)} already have images")

    # Stats
    stats = {
        "total": len(assets),
        "already_had": len(image_data),
        "og_found": 0,
        "og_failed": 0,
        "og_skipped": 0,
        "wiki_found": 0,
        "wiki_failed": 0,
        "wiki_skipped": 0,
        "places_found": 0,
        "places_failed": 0,
        "places_skipped": 0,
        "no_image": 0,
    }
    failures = []

    # ── Tier 1: og:image scraping ──
    if tier1:
        candidates = [a for a in assets if a.get("w")]
        print(f"\n{'='*60}")
        print(f"TIER 1: og:image scraping ({len(candidates)} assets with websites)")
        print(f"{'='*60}")

        for i, asset in enumerate(candidates):
            name = asset["n"]
            website = asset["w"]

            if resume and name in image_data:
                stats["og_skipped"] += 1
                continue

            if dry_run:
                print(f"  [DRY RUN] Would fetch: {name} -> {website}")
                continue

            print(f"  [{i+1}/{len(candidates)}] {name}...", end=" ", flush=True)

            img_url = scrape_og_image(website)
            if img_url:
                image_data[name] = {
                    "img": img_url,
                    "alt": make_alt_text(name, asset["l"], asset.get("c", "")),
                    "credit": name,
                    "source": "og:image",
                }
                stats["og_found"] += 1
                print(f"OK")
            else:
                stats["og_failed"] += 1
                failures.append({"name": name, "tier": "og:image", "website": website})
                print(f"no og:image")

            time.sleep(OG_DELAY)

            # Save progress every 25 assets
            if (i + 1) % 25 == 0:
                _save(image_data, stats)

    # ── Tier 2: Wikimedia Commons ──
    if tier2:
        wiki_assets = [a for a in assets if a["l"] in WIKI_CATEGORIES]
        print(f"\n{'='*60}")
        print(f"TIER 2: Wikimedia Commons ({len(wiki_assets)} assets in wiki-friendly categories)")
        print(f"{'='*60}")

        for i, asset in enumerate(wiki_assets):
            name = asset["n"]

            if resume and name in image_data:
                stats["wiki_skipped"] += 1
                continue

            if dry_run:
                print(f"  [DRY RUN] Would search: {name}")
                continue

            print(f"  [{i+1}/{len(wiki_assets)}] {name}...", end=" ", flush=True)

            img_url, artist, license_info = search_wikimedia(name, asset.get("c", ""))
            if img_url:
                credit = f"{artist}, via Wikimedia Commons"
                if license_info:
                    credit += f" ({license_info})"
                image_data[name] = {
                    "img": img_url,
                    "alt": make_alt_text(name, asset["l"], asset.get("c", "")),
                    "credit": credit,
                    "source": "wikimedia",
                }
                stats["wiki_found"] += 1
                print(f"OK")
            else:
                stats["wiki_failed"] += 1
                failures.append({"name": name, "tier": "wikimedia", "category": asset["l"]})
                print(f"not found")

            time.sleep(WIKI_DELAY)

            if (i + 1) % 25 == 0:
                _save(image_data, stats)

    # ── Tier 3: Google Places Photos ──
    if tier3:
        # Load API key
        if GOOGLE_API_KEY_FILE.exists():
            gapi_key = GOOGLE_API_KEY_FILE.read_text().strip()
        else:
            print(f"\n  WARNING: Google Places API key not found at {GOOGLE_API_KEY_FILE}")
            print(f"  Skipping Tier 3")
            gapi_key = None

        if gapi_key:
            # Try all assets that still don't have images
            remaining = [a for a in assets if a["n"] not in image_data]
            print(f"\n{'='*60}")
            print(f"TIER 3: Google Places Photos ({len(remaining)} assets without images)")
            print(f"{'='*60}")

            for i, asset in enumerate(remaining):
                name = asset["n"]

                if dry_run:
                    print(f"  [DRY RUN] Would search: {name} in {asset.get('c', '?')}")
                    continue

                print(f"  [{i+1}/{len(remaining)}] {name}...", end=" ", flush=True)

                img_url, attribution = search_google_places(name, asset.get("c", ""), gapi_key)
                if img_url:
                    image_data[name] = {
                        "img": img_url,
                        "alt": make_alt_text(name, asset["l"], asset.get("c", "")),
                        "credit": f"{attribution}, via Google",
                        "source": "google_places",
                    }
                    stats["places_found"] += 1
                    print(f"OK")
                else:
                    stats["places_failed"] += 1
                    failures.append({"name": name, "tier": "google_places", "category": asset["l"]})
                    print(f"not found")

                time.sleep(PLACES_DELAY)

                if (i + 1) % 25 == 0:
                    _save(image_data, stats)

    # Count unresolved
    all_names = {a["n"] for a in assets}
    resolved = set(image_data.keys())
    unresolved = all_names - resolved
    stats["no_image"] = len(unresolved)

    # Save final results
    _save(image_data, stats)

    # Save report
    report = {
        "stats": stats,
        "failures": failures,
        "unresolved": sorted(unresolved),
        "unresolved_by_category": {},
    }
    for a in assets:
        if a["n"] in unresolved:
            cat = a["l"]
            if cat not in report["unresolved_by_category"]:
                report["unresolved_by_category"][cat] = []
            report["unresolved_by_category"][cat].append(a["n"])

    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    # Print summary
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"  Total assets:          {stats['total']}")
    print(f"  Already had images:    {stats['already_had']}")
    print(f"  og:image found:        {stats['og_found']}")
    print(f"  og:image failed:       {stats['og_failed']}")
    print(f"  og:image skipped:      {stats['og_skipped']}")
    print(f"  Wikimedia found:       {stats['wiki_found']}")
    print(f"  Wikimedia failed:      {stats['wiki_failed']}")
    print(f"  Wikimedia skipped:     {stats['wiki_skipped']}")
    print(f"  Google Places found:   {stats['places_found']}")
    print(f"  Google Places failed:  {stats['places_failed']}")
    print(f"  Google Places skipped: {stats['places_skipped']}")
    print(f"  Still need images:     {stats['no_image']}")
    print(f"\n  Results: {IMAGE_JSON}")
    print(f"  Report:  {REPORT_FILE}")


def _save(image_data, stats):
    """Save current image_data.json."""
    with open(IMAGE_JSON, "w", encoding="utf-8") as f:
        json.dump(image_data, f, indent=2, ensure_ascii=False)
    total_found = stats["already_had"] + stats["og_found"] + stats["wiki_found"] + stats["places_found"]
    print(f"    [saved {total_found} images to image_data.json]")


if __name__ == "__main__":
    args = set(sys.argv[1:])

    tier1 = "--tier2-only" not in args and "--tier3-only" not in args
    tier2 = "--tier1-only" not in args and "--tier3-only" not in args
    tier3 = "--tier1-only" not in args and "--tier2-only" not in args
    dry_run = "--dry-run" in args
    resume = "--no-resume" not in args  # resume by default

    run_pipeline(tier1=tier1, tier2=tier2, tier3=tier3, dry_run=dry_run, resume=resume)
