#!/usr/bin/env python3
"""Find a newer low-cloud Sentinel-2 scene for facility pins and crop it.

Search uses the public Planetary Computer STAC API (Copernicus Sentinel-2 L2A).
A CDSE STAC search is also attempted and its product id is printed. Downloading
pixels from CDSE requires CDSE_CLIENT_ID and CDSE_CLIENT_SECRET, which this
script does not send. Image bytes come from Planetary Computer when gdalwarp
is installed. Scene acquisition time is the STAC property datetime.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "data-centers.json"
OUT = ROOT / "public" / "satellites"
UA = {"User-Agent": "nbismodel-research"}


def get_json(url: str, body: dict | None = None) -> dict:
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers={**UA, "Content-Type": "application/json", "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as response:
        return json.load(response)


def main() -> None:
    doc = json.loads(DATA.read_text())
    if not shutil.which("gdalwarp"):
        print("gdalwarp is not installed. Scene search only; no new image written.")
    for site in doc["sites"]:
        pin = site.get("pin")
        if not pin or not str(pin.get("precision", "")).startswith("Facility"):
            continue
        lon, lat = pin["lon"], pin["lat"]
        search = {
            "collections": ["sentinel-2-l2a"],
            "intersects": {"type": "Point", "coordinates": [lon, lat]},
            "limit": 15,
            "query": {"eo:cloud_cover": {"lt": 20}},
            "sortby": [{"field": "properties.datetime", "direction": "desc"}],
        }
        found = get_json("https://planetarycomputer.microsoft.com/api/stac/v1/search", search)
        preferred = [f for f in found.get("features", []) if "T35VMH" in f["id"]]
        features = preferred or found.get("features", [])
        if not features:
            print(site["id"], "no scene")
            continue
        feature = features[0]
        acquired = feature["properties"]["datetime"]
        day = acquired[:10]
        existing = {scene["acquiredAt"][:10] for scene in site.get("scenes", [])}
        bbox = f"{lon-0.05},{lat-0.03},{lon+0.05},{lat+0.03}"
        cdse = (
            "https://catalogue.dataspace.copernicus.eu/stac/collections/sentinel-2-l2a/items"
            f"?bbox={bbox}&datetime={day}T00:00:00Z/{day}T23:59:59Z&limit=1"
        )
        try:
            catalog = get_json(cdse)
            cdse_id = (catalog.get("features") or [{}])[0].get("id")
        except Exception as error:  # network or schema
            cdse_id = None
            print("CDSE search failed", error)
        print(site["id"], "latest", feature["id"], acquired, "cdse", cdse_id)
        if day in existing:
            print(" already stored")
            continue
        if not shutil.which("gdalwarp"):
            continue
        href = feature["assets"]["visual"]["href"]
        signed = get_json(
            "https://planetarycomputer.microsoft.com/api/sas/v1/sign?href=" + urllib.parse.quote(href, safe="")
        )["href"]
        OUT.mkdir(parents=True, exist_ok=True)
        dest = OUT / f"{site['id']}-{day}.jpg"
        minx, miny, maxx, maxy = lon - 0.02, lat - 0.01, lon + 0.02, lat + 0.01
        subprocess.check_call(
            [
                "gdalwarp", "-q", "-t_srs", "EPSG:3857", "-te_srs", "EPSG:4326",
                "-te", str(minx), str(miny), str(maxx), str(maxy),
                "-ts", "520", "520", "-r", "bilinear", "-of", "JPEG", "-co", "QUALITY=82",
                f"/vsicurl/{signed}", str(dest),
            ]
        )
        site.setdefault("scenes", []).append(
            {
                "file": f"/satellites/{dest.name}",
                "acquiredAt": acquired,
                "cloudCoverPct": feature["properties"].get("eo:cloud_cover"),
                "itemId": feature["id"],
                "platform": feature["properties"].get("platform"),
            }
        )
        print(" wrote", dest)
    DATA.write_text(json.dumps(doc, indent=2) + "\n")


if __name__ == "__main__":
    main()
