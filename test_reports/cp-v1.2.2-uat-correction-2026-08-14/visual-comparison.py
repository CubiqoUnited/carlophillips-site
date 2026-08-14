#!/usr/bin/env python3
"""Create Production-versus-candidate screenshot comparison evidence."""

from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageChops, ImageEnhance, ImageStat


ROOT = Path(__file__).resolve().parent
PRODUCTION = ROOT / "screenshots" / "production"
CANDIDATE = ROOT / "screenshots" / "candidate"
COMPARISONS = ROOT / "comparisons"


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def main() -> None:
    COMPARISONS.mkdir(parents=True, exist_ok=True)
    results = []
    for production_path in sorted(PRODUCTION.glob("*.png")):
        candidate_path = CANDIDATE / production_path.name
        production = Image.open(production_path).convert("RGB")
        candidate = Image.open(candidate_path).convert("RGB")
        if production.size != candidate.size:
            raise ValueError(f"Dimension mismatch: {production_path.name}")
        difference = ImageChops.difference(production, candidate)
        statistics = ImageStat.Stat(difference)
        mae = sum(statistics.mean) / (len(statistics.mean) * 255)
        rms = math.sqrt(sum(value * value for value in statistics.rms) / len(statistics.rms)) / 255
        changed = sum(1 for pixel in difference.get_flattened_data() if max(pixel) > 4)
        changed_percent = changed * 100 / (production.width * production.height)

        diff_path = COMPARISONS / production_path.name.replace(".png", "-diff.png")
        side_path = COMPARISONS / production_path.name.replace(".png", "-side-by-side.png")
        ImageEnhance.Contrast(difference).enhance(6).save(diff_path)
        side = Image.new("RGB", (production.width * 2, production.height), "black")
        side.paste(production, (0, 0))
        side.paste(candidate, (production.width, 0))
        side.save(side_path)
        results.append({
            "state": production_path.stem,
            "dimensions": [production.width, production.height],
            "production": relative(production_path),
            "candidate": relative(candidate_path),
            "meanAbsoluteError": round(mae, 6),
            "normalizedRms": round(rms, 6),
            "changedPixelPercentOver4": round(changed_percent, 4),
            "differenceBoundingBox": list(difference.getbbox() or (0, 0, 0, 0)),
            "diff": relative(diff_path),
            "sideBySide": relative(side_path),
        })

    report = {
        "schemaVersion": "cp.v1.2.2-uat-correction-visual-comparison.v1",
        "baseline": "https://www.carlophillips.com",
        "candidateMethod": "local corrected build; content differences are expected where local fixtures replace live commerce truth",
        "sameDimensions": all(result["dimensions"] for result in results),
        "comparisons": results,
    }
    (ROOT / "visual-comparison.json").write_text(
        json.dumps(report, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"comparisons": len(results), "sameDimensions": report["sameDimensions"]}, indent=2))


if __name__ == "__main__":
    main()
