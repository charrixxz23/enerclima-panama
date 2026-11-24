"""generamos agregados reproducibles sin modificar las entradas."""

import argparse
import csv
import hashlib
import json
import math
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_SHA256 = "ef52f68fc8989d02ff2f2565134014eaf9707318a8389d4022cd38d44656fbce"
MINIMUM = 3
STATIONS = {"Tocumen": "T2M_toc", "Santiago": "T2M_san", "David": "T2M_dav"}


def quantile(values, probability):
    ordered = sorted(values)
    position = (len(ordered) - 1) * probability
    lower = math.floor(position)
    fraction = position - lower
    return ordered[lower] + fraction * (ordered[min(lower + 1, len(ordered) - 1)] - ordered[lower])


def aggregate(source):
    raw = source.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    if digest != SOURCE_SHA256:
        raise ValueError("el sha-256 de entrada no coincide con la version documentada")
    cells = {}
    samples = {key: [] for key in ["nat_demand", *STATIONS.values()]}
    first = last = origin = None
    rows = 0
    with source.open(encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            stamp = datetime.fromisoformat(row["datetime"])
            if last is not None and stamp <= last:
                raise ValueError("las marcas deben estar ordenadas y ser unicas")
            if first is None:
                first = stamp
                origin = stamp.replace(hour=0, minute=0, second=0, microsecond=0)
            last = stamp
            block = (stamp - origin).days // 4
            cell = cells.setdefault((block, stamp.hour), [[], []])
            for key in samples:
                value = float(row[key])
                if math.isfinite(value):
                    samples[key].append(value)
                    if key == "nat_demand":
                        cell[0].append(value)
                    elif key == "T2M_toc":
                        cell[1].append(value)
            rows += 1
    columns = (last - origin).days // 4 + 1
    grid = []
    for block in range(columns):
        for hour in range(24):
            demand, temperature = cells.get((block, hour), [[], []])
            grid.append([
                math.fsum(demand) / len(demand) if len(demand) >= MINIMUM else None,
                len(demand),
                math.fsum(temperature) / len(temperature) if len(temperature) >= MINIMUM else None,
                len(temperature),
            ])
    quantiles = {
        name: {f"p{int(q * 100)}": quantile(samples[key], q) for q in [0.01, 0.5, 0.95, 0.99]}
        for name, key in {"demanda": "nat_demand", **STATIONS}.items()
    }
    metadata = {
        "version": 1,
        "fuente": {"archivo": source.name, "sha256": digest, "filas": rows,
                   "inicio": first.isoformat(), "fin": last.isoformat(),
                   "zona_horaria": "no especificada en el csv; conservamos la hora registrada"},
        "agregacion": {"dias": 4, "horas": 24, "minimo_observaciones": MINIMUM,
                       "origen": origin.isoformat(), "columnas": columns,
                       "orden": "bloque, hora; demanda media, n demanda, temperatura media Tocumen, n temperatura",
                       "celdas_vacias": sum(row[0] is None or row[2] is None for row in grid)},
        "cuantiles": quantiles,
        "metodo_cuantiles": "interpolacion lineal, indice (n - 1) * p; tipo 7",
        "colores_temperatura": ["#21656b", "#776b5b", "#b43e2e"],
        "colores_demanda": ["#eee8dd", "#817b70"],
    }
    return {"metadata": metadata, "celdas": grid}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=ROOT / "data/raw/continuous dataset.csv")
    parser.add_argument("--output", type=Path, default=ROOT / "web/public/data/thermal-field.json")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    result = aggregate(args.input)
    outputs = {args.output: result, args.output.with_name("thermal-summary.json"): result["metadata"]}
    for path, value in outputs.items():
        encoded = (json.dumps(value, ensure_ascii=False, separators=(",", ":"), allow_nan=False) + "\n").encode("utf-8")
        if args.check:
            if path.read_bytes() != encoded:
                raise ValueError(f"el agregado no es reproducible: {path.name}")
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(encoded)
    print(json.dumps(result["metadata"], ensure_ascii=False))


if __name__ == "__main__":
    main()
