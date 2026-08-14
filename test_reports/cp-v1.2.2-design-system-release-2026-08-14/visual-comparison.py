#!/usr/bin/env python3
"""Regenerate deterministic screenshot comparisons for the v1.2.2 release evidence."""

from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageOps, ImageStat


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
EVIDENCE_ROOT = Path(__file__).resolve().parent
BASELINE_ROOT = REPOSITORY_ROOT / "test_reports/cp-home-one-overlay-2026-08-09/screenshots"
SCREENSHOT_ROOT = EVIDENCE_ROOT / "screenshots"
COMPARISON_ROOT = EVIDENCE_ROOT / "comparisons"

VIEWPORTS = {
    "desktop": (1440, 1000),
    "compact": (584, 486),
    "mobile": (390, 844),
}

STATES = {
    "home-hero": "landing",
    "home-one": "product",
    "home-overlay": "overlay",
}


def relative(path: Path) -> str:
    return path.relative_to(REPOSITORY_ROOT).as_posix()


def compare(viewport: str, state: str, baseline_state: str) -> dict:
    baseline_path = BASELINE_ROOT / f"{viewport}-{baseline_state}.png"
    candidate_path = SCREENSHOT_ROOT / f"{viewport}-{state}.png"
    baseline = Image.open(baseline_path).convert("RGB")
    candidate = Image.open(candidate_path).convert("RGB")
    expected = VIEWPORTS[viewport]
    if baseline.size != expected or candidate.size != expected:
        raise ValueError(f"Dimension mismatch for {viewport}/{state}: {baseline.size} vs {candidate.size}")

    difference = ImageChops.difference(baseline, candidate)
    statistics = ImageStat.Stat(difference)
    mean_absolute_error = sum(statistics.mean) / (len(statistics.mean) * 255)
    normalized_rms = math.sqrt(sum(value * value for value in statistics.rms) / len(statistics.rms)) / 255
    changed = sum(1 for pixel in difference.get_flattened_data() if max(pixel) > 4)
    changed_percent = changed * 100 / (expected[0] * expected[1])

    diff_path = COMPARISON_ROOT / f"{viewport}-{state}-diff.png"
    side_path = COMPARISON_ROOT / f"{viewport}-{state}-side-by-side.png"
    ImageEnhance.Contrast(difference).enhance(6).save(diff_path)
    side = Image.new("RGB", (expected[0] * 2, expected[1]), "black")
    side.paste(baseline, (0, 0))
    side.paste(candidate, (expected[0], 0))
    side.save(side_path)

    return {
        "viewport": viewport,
        "state": state,
        "baseline": relative(baseline_path),
        "candidate": relative(candidate_path),
        "dimensions": list(expected),
        "meanAbsoluteError": round(mean_absolute_error, 6),
        "normalizedRms": round(normalized_rms, 6),
        "changedPixelPercentOver4": round(changed_percent, 4),
        "differenceBoundingBox": list(difference.getbbox() or (0, 0, 0, 0)),
        "diff": relative(diff_path),
        "sideBySide": relative(side_path),
    }


def contact_sheet(path: Path, rows: list[tuple[str, list[tuple[str, Path]]]]) -> None:
    thumb_size = (300, 200)
    gutter = 16
    label_height = 24
    columns = max(len(items) for _, items in rows)
    canvas = Image.new(
        "RGB",
        (
            gutter + columns * (thumb_size[0] + gutter),
            gutter + len(rows) * (thumb_size[1] + label_height + gutter),
        ),
        "#080808",
    )
    draw = ImageDraw.Draw(canvas)
    for row_index, (row_label, items) in enumerate(rows):
        y = gutter + row_index * (thumb_size[1] + label_height + gutter)
        for column_index, (item_label, image_path) in enumerate(items):
            x = gutter + column_index * (thumb_size[0] + gutter)
            image = Image.open(image_path).convert("RGB")
            canvas.paste(ImageOps.fit(image, thumb_size, method=Image.Resampling.LANCZOS), (x, y + label_height))
            draw.text((x, y), f"{row_label} · {item_label}", fill="#f1f0ec")
    canvas.save(path)


def main() -> None:
    COMPARISON_ROOT.mkdir(parents=True, exist_ok=True)
    comparisons = [
        compare(viewport, state, baseline_state)
        for viewport in VIEWPORTS
        for state, baseline_state in STATES.items()
    ]
    report = {
        "schemaVersion": "cp.visual-comparison.v1",
        "baselineCommit": "bb9568f",
        "baselineEvidence": "test_reports/cp-home-one-overlay-2026-08-09",
        "candidate": "v1.2.2",
        "acceptanceContract": {
            "sameViewportDimensions": True,
            "exactOverlayGeometry": True,
            "exactHeroAssetAndCopy": True,
            "exactProductHierarchyAndFourTags": True,
            "truthfulViewCount": 12,
            "normalMotionVarianceExpected": True,
        },
        "comparisons": comparisons,
    }
    (EVIDENCE_ROOT / "visual-comparison.json").write_text(
        json.dumps(report, indent=2) + "\n",
        encoding="utf-8",
    )

    contact_sheet(
        COMPARISON_ROOT / "baseline-contact-sheet.png",
        [
            (
                viewport,
                [(state, BASELINE_ROOT / f"{viewport}-{baseline_state}.png") for state, baseline_state in STATES.items()],
            )
            for viewport in VIEWPORTS
        ],
    )
    route_states = ["home-hero", "home-menu", "home-one", "home-overlay", "shop", "pdp", "bag"]
    contact_sheet(
        COMPARISON_ROOT / "route-contact-sheet.png",
        [
            (viewport, [(state, SCREENSHOT_ROOT / f"{viewport}-{state}.png") for state in route_states])
            for viewport in VIEWPORTS
        ],
    )
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
