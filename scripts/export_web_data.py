import json
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
RESULTS = ROOT / "results"
OUTPUT = ROOT / "web" / "public" / "data" / "dashboard.json"
NAMES = {"toc": "Tocumen", "san": "Santiago", "dav": "David"}
COORDINATES = {"Tocumen": [9.05, -79.37], "Santiago": [8.08, -80.95], "David": [8.40, -82.42]}


def records(frame):
    return json.loads(frame.to_json(orient="records", date_format="iso"))


def main():
    df = pd.read_csv(RAW / "continuous dataset.csv", parse_dates=["datetime"])
    results = json.loads((RESULTS / "metrics" / "resultados.json").read_text(encoding="utf-8"))
    daily = df.set_index("datetime")["nat_demand"].resample("D").mean().rename("demanda_mwh").dropna().reset_index()
    daily = daily.iloc[::4]
    weekly = df.set_index("datetime")["nat_demand"].resample("W").mean().rename("demanda_mwh").dropna().reset_index()
    monthly = df.assign(mes=df.datetime.dt.strftime("%Y-%m")).groupby("mes").nat_demand.mean().rename("demanda_mwh").reset_index()
    regional = df.set_index("datetime")[[f"T2M_{station}" for station in NAMES]].resample("W").mean().dropna().reset_index()
    regional = regional.iloc[::2]
    profile = df.assign(hora=df.datetime.dt.hour).groupby("hora").nat_demand.mean().rename("demanda_mwh").reset_index()
    payload = {
        "version": results["version_analisis"],
        "generado": results["fecha_generacion_utc"],
        "periodo": results["periodo_historico"],
        "unidad": results["unidad_demanda"],
        "resumen": {"filas": results["filas"], "media": results["demanda_media"], "mediana": results["demanda_mediana"], "maxima": results["demanda_maxima"], "minima": results["demanda_minima"]},
        "modelo": results["modelos_prueba"],
        "modeloSeleccionado": results["particion"]["modelo_seleccionado"],
        "particion": results["particion"],
        "sensibilidad": results["sensibilidad"],
        "eventos": results["eventos"],
        "asociaciones": results["asociaciones_ajustadas"],
        "temperaturaMetricas": results["metricas_por_temperatura"],
        "predespacho": results["pronostico_predespacho"],
        "limitaciones": results["limitaciones"],
        "demandaSemanal": records(weekly),
        "demandaDiaria": records(daily),
        "demandaMensual": records(monthly),
        "perfilHorario": records(profile),
        "temperaturaRegional": records(regional),
        "estaciones": [{"nombre": name, "temperatura": f"T2M_{code}", "latitud": COORDINATES[name][0], "longitud": COORDINATES[name][1], "nota": "referencia aeroportuaria según NOAA/AOML; no identifica la celda meteorológica"} for code, name in NAMES.items()],
        "correlaciones": results["correlaciones_spearman"],
        "calidad": json.loads((RESULTS / "metrics" / "auditoria.json").read_text(encoding="utf-8")),
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"archivo={OUTPUT.relative_to(ROOT)} bytes={OUTPUT.stat().st_size}")


if __name__ == "__main__":
    main()
