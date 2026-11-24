"""preparamos subconjuntos locales conservando las funciones opentype."""

import argparse
from io import BytesIO
from pathlib import Path
from urllib.parse import quote
from urllib.request import urlopen
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://raw.githubusercontent.com/google/fonts/83c62e30d87daa70216dab6b984d00d20d96d585/ofl/"


def prepare(raw, output, axes=None):
    font = TTFont(BytesIO(raw), recalcTimestamp=False)
    if axes:
        font = instantiateVariableFont(font, axes, inplace=False)
    options = subset.Options()
    options.layout_features = ["ccmp", "locl", "liga", "kern", "pnum", "tnum", "rvrn"]
    options.recalc_timestamp = False
    sub = subset.Subsetter(options=options)
    sub.populate(unicodes=[*range(32, 256), *range(0x2000, 0x2070), 0x2212])
    sub.subset(font)
    font.flavor = "woff2"
    font.save(output)
    return font


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "web/public/fonts")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    fraunces = urlopen(BASE + "fraunces/" + quote("Fraunces[SOFT,WONK,opsz,wght].ttf")).read()
    for weight in [400, 600]:
        output = args.output / f"fraunces-{weight}-latin.woff2"
        prepare(fraunces, output, {"SOFT": 50, "WONK": 1, "opsz": 72, "wght": weight})
        print(output.name, output.stat().st_size, "SOFT=50 WONK=1 opsz=72", weight)
    for weight, style in [(400, "Regular"), (600, "SemiBold")]:
        raw = urlopen(BASE + f"barlowcondensed/BarlowCondensed-{style}.ttf").read()
        output = args.output / f"barlow-condensed-{weight}-latin.woff2"
        font = prepare(raw, output)
        tags = [record.FeatureTag for record in font["GSUB"].table.FeatureList.FeatureRecord]
        if "tnum" not in tags:
            raise ValueError("falta tnum en el subconjunto")
        print(output.name, output.stat().st_size, "tnum verificado")
    for family, name in [("fraunces", "fraunces"), ("barlowcondensed", "barlow-condensed")]:
        license_text = urlopen(BASE + family + "/OFL.txt").read().decode("utf-8")
        (args.output / f"{name}-OFL.txt").write_text("\n".join(line.rstrip() for line in license_text.splitlines()) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
