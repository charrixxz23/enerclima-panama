from __future__ import annotations

import json
import time
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
import statsmodels.formula.api as smf
from sklearn.ensemble import RandomForestRegressor
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import make_pipeline


ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
RESULTS = ROOT / "results"
FIGURES = RESULTS / "figures"
TABLES = RESULTS / "tables"
METRICS = RESULTS / "metrics"
SCENARIOS = RESULTS / "scenarios"
PROCESSED = ROOT / "data" / "processed"
RNG_SEED = 42
STATIONS = {"toc": "Tocumen", "san": "Santiago", "dav": "David"}
COLORS = {"toc": "#165C48", "san": "#FFB547", "dav": "#287A9B"}


def json_safe(value):
    if isinstance(value, dict):
        return {str(key): json_safe(val) for key, val in value.items()}
    if isinstance(value, list):
        return [json_safe(val) for val in value]
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        return None if not np.isfinite(value) else float(value)
    if isinstance(value, (pd.Timestamp, np.datetime64)):
        return pd.Timestamp(value).isoformat()
    if pd.isna(value):
        return None
    return value


def write_json(path: Path, payload: dict):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(json_safe(payload), ensure_ascii=False, indent=2), encoding="utf-8")


def metric_values(actual, predicted):
    actual = np.asarray(actual, dtype=float)
    predicted = np.asarray(predicted, dtype=float)
    return {
        "mae": float(mean_absolute_error(actual, predicted)),
        "rmse": float(np.sqrt(mean_squared_error(actual, predicted))),
        "mape_pct": float(np.mean(np.abs((actual - predicted) / actual)) * 100),
        "r2": float(r2_score(actual, predicted)),
    }


def make_features(frame: pd.DataFrame) -> pd.DataFrame:
    dt = frame["datetime"]
    features = pd.DataFrame(index=frame.index)
    hour = dt.dt.hour
    weekday = dt.dt.day_of_week
    day_year = dt.dt.day_of_year
    features["hora_sin"] = np.sin(2 * np.pi * hour / 24)
    features["hora_cos"] = np.cos(2 * np.pi * hour / 24)
    features["semana_sin"] = np.sin(2 * np.pi * weekday / 7)
    features["semana_cos"] = np.cos(2 * np.pi * weekday / 7)
    features["ano_sin"] = np.sin(2 * np.pi * day_year / 365.25)
    features["ano_cos"] = np.cos(2 * np.pi * day_year / 365.25)
    features["fin_de_semana"] = (weekday >= 5).astype(int)
    features["feriado"] = frame["holiday"].astype(int)
    features["periodo_escolar"] = frame["school"].astype(int)
    features["holiday_id"] = frame["Holiday_ID"].astype(float)
    weather_columns = [column for column in frame.columns if column.startswith(("T2M_", "QV2M_", "TQL_", "W2M_"))]
    for column in weather_columns:
        features[column] = frame[column].astype(float)
    for lag in (1, 24, 168):
        features[f"demanda_rezago_{lag}"] = frame["nat_demand"].shift(lag)
    features["media_movil_24"] = frame["nat_demand"].shift(1).rolling(24, min_periods=24).mean()
    return features


def save_data_audit(df: pd.DataFrame, forecast: pd.DataFrame):
    date_delta = df["datetime"].diff().dropna()
    expected_hours = pd.date_range(df["datetime"].min(), df["datetime"].max(), freq="h")
    numeric = df.select_dtypes(include=np.number)
    quality = pd.DataFrame(index=df.columns)
    quality["tipo"] = df.dtypes.astype(str)
    quality["nulos"] = df.isna().sum()
    quality["infinitos"] = [int(np.isinf(df[c]).sum()) if pd.api.types.is_numeric_dtype(df[c]) else 0 for c in df.columns]
    quality["unicos"] = df.nunique(dropna=True)
    quality["duplicados_exactos"] = [int(df.duplicated().sum()) if c == df.columns[0] else "" for c in df.columns]
    quality.to_csv(TABLES / "calidad_datos.csv", encoding="utf-8-sig")
    low_demand = df.loc[df["nat_demand"] < 500, ["datetime", "nat_demand"]].copy()
    low_demand["criterio_revision"] = "demanda menor que 500 MWh por intervalo horario; se conserva sin correccion"
    low_demand.to_csv(TABLES / "valores_demanda_para_revision.csv", index=False, encoding="utf-8-sig")
    plausible_limits = {
        "nat_demand": (0, 5000, "cribado amplio positivo, no umbral operativo"),
        "T2M_toc": (-60, 60, "rango físico amplio en °C"),
        "T2M_san": (-60, 60, "rango físico amplio en °C"),
        "T2M_dav": (-60, 60, "rango físico amplio en °C"),
        "QV2M_toc": (0, 0.1, "humedad específica kg/kg según NASA"),
        "QV2M_san": (0, 0.1, "humedad específica kg/kg según NASA"),
        "QV2M_dav": (0, 0.1, "humedad específica kg/kg según NASA"),
        "TQL_toc": (0, 10, "agua líquida precipitable kg/m2 según NASA"),
        "TQL_san": (0, 10, "agua líquida precipitable kg/m2 según NASA"),
        "TQL_dav": (0, 10, "agua líquida precipitable kg/m2 según NASA"),
        "W2M_toc": (0, 150, "rango físico amplio en m/s"),
        "W2M_san": (0, 150, "rango físico amplio en m/s"),
        "W2M_dav": (0, 150, "rango físico amplio en m/s"),
        "Holiday_ID": (0, 30, "codigo entero categorico no negativo"),
        "holiday": (0, 1, "indicador binario"),
        "school": (0, 1, "indicador binario"),
    }
    range_rows = []
    for variable, (lower, upper, criterio) in plausible_limits.items():
        values = df[variable]
        range_rows.append({"variable": variable, "min_observado": float(values.min()), "max_observado": float(values.max()), "limite_inferior_cribado": lower, "limite_superior_cribado": upper, "valores_fuera_limite": int(((values < lower) | (values > upper)).sum()), "criterio": criterio})
    pd.DataFrame(range_rows).to_csv(TABLES / "verificacion_rangos.csv", index=False, encoding="utf-8-sig")
    descriptions = numeric.describe(percentiles=[.01, .05, .5, .95, .99]).T
    descriptions.to_csv(TABLES / "estadisticas_descriptivas.csv", encoding="utf-8-sig")
    weather_units = {
        "nat_demand": "MWh por intervalo horario, según metadatos del paquete",
        "T2M": "°C",
        "QV2M": "kg/kg (humedad específica; definición de NASA; existe discrepancia con metadatos del paquete)",
        "TQL": "kg/m² (agua líquida precipitable en columna; definición de NASA; no es nubosidad)",
        "W2M": "m/s",
        "Holiday_ID": "entero categórico",
        "holiday": "indicador binario",
        "school": "indicador binario",
        "datetime": "fecha y hora, zona indicada como UTC-05:00 en metadatos",
    }
    dictionary = []
    for column in df.columns:
        if column == "datetime":
            definition = "Marca temporal horaria de Panamá"
        elif column == "nat_demand":
            definition = "Demanda eléctrica nacional del SIN; el PDF del dataset la etiqueta en MWh. La unidad describe el intervalo y no potencia MW."
        elif column.startswith("T2M_"):
            definition = f"Temperatura del aire a 2 m en {STATIONS[column[-3:]]}"
        elif column.startswith("QV2M_"):
            definition = f"Humedad a 2 m en {STATIONS[column[-3:]]}; la ficha del paquete dice humedad relativa, pero NASA define QV2M como humedad específica (kg/kg). Conservamos la discrepancia y el valor original."
        elif column.startswith("TQL_"):
            definition = f"Agua líquida precipitable total en columna para {STATIONS[column[-3:]]}; el código NASA TQL no es fracción de nubosidad."
        elif column.startswith("W2M_"):
            definition = f"Rapidez del viento a 2 m en {STATIONS[column[-3:]]}"
        elif column == "Holiday_ID":
            definition = "Código que identifica el tipo de feriado según la tabla incluida en el PDF de metadatos"
        elif column == "holiday":
            definition = "Indicador: 1 feriado, 0 día regular"
        else:
            definition = "Indicador: 1 periodo escolar, 0 vacaciones"
        unit = weather_units.get(column.split("_")[0] if column.startswith(("T2M_", "QV2M_", "TQL_", "W2M_")) else column, "")
        dictionary.append({"variable": column, "definicion": definition, "unidad": unit, "tipo": str(df[column].dtype), "origen": "dataset incluido en archive.zip"})
    dictionary_df = pd.DataFrame(dictionary)
    dictionary_df.to_csv(ROOT / "data" / "metadata" / "diccionario_datos.csv", index=False, encoding="utf-8-sig")
    dictionary_df.to_markdown(ROOT / "data" / "metadata" / "diccionario_datos.md", index=False)
    matching = forecast["datetime"].isin(df["datetime"])
    audit = {
        "filas": len(df),
        "columnas": len(df.columns),
        "nombres_columnas": df.columns.tolist(),
        "fecha_inicio": df["datetime"].min(),
        "fecha_fin": df["datetime"].max(),
        "frecuencia_moda": str(date_delta.mode().iloc[0]),
        "intervalos_no_horarios": int((date_delta != pd.Timedelta(hours=1)).sum()),
        "horas_esperadas": len(expected_hours),
        "horas_faltantes": len(expected_hours.difference(df["datetime"])),
        "fechas_duplicadas": int(df["datetime"].duplicated().sum()),
        "filas_duplicadas": int(df.duplicated().sum()),
        "valores_nulos": int(df.isna().sum().sum()),
        "valores_infinitos": int(np.isinf(numeric.to_numpy()).sum()),
        "forecast_filas": len(forecast),
        "forecast_fechas_en_dataset": int(matching.sum()),
        "forecast_cobertura_pct": float(matching.mean() * 100),
        "indicadores": {key: sorted(df[key].dropna().unique().tolist()) for key in ["holiday", "school"]},
        "demanda_resumen": df["nat_demand"].describe().to_dict(),
        "rangos_observados": {column: [float(df[column].min()), float(df[column].max())] for column in numeric.columns},
        "fuera_de_limites_cribado_amplio": int(sum(row["valores_fuera_limite"] for row in range_rows)),
        "auditoria_generada": pd.Timestamp.now(tz="UTC"),
        "version_analisis": "1.0.0",
    }
    write_json(METRICS / "dataset.json", audit)
    return audit, descriptions


def save_eda(df: pd.DataFrame):
    sns.set_theme(style="whitegrid", font="DejaVu Sans")
    daily = df.set_index("datetime")["nat_demand"].resample("D").mean()
    plt.figure(figsize=(12, 4.4))
    daily.plot(color="#165C48", linewidth=1.0)
    plt.title("Demanda eléctrica nacional diaria (histórica)")
    plt.ylabel("Demanda (MWh por intervalo horario, promedio diario)")
    plt.xlabel("Fecha")
    plt.tight_layout()
    plt.savefig(FIGURES / "demanda_historica.png", dpi=180)
    plt.savefig(FIGURES / "demanda_historica.svg")
    plt.close()
    hourly = df.assign(hora=df.datetime.dt.hour).groupby("hora")["nat_demand"].agg(["mean", "std"])
    hourly.to_csv(TABLES / "demanda_por_hora.csv", encoding="utf-8-sig")
    plt.figure(figsize=(9, 4.5))
    plt.plot(hourly.index, hourly["mean"], color="#165C48", linewidth=2.4)
    plt.fill_between(hourly.index, hourly["mean"] - hourly["std"], hourly["mean"] + hourly["std"], alpha=.16, color="#165C48")
    plt.title("Perfil horario promedio de la demanda")
    plt.xlabel("Hora del día")
    plt.ylabel("Demanda (MWh por intervalo horario)")
    plt.xticks(range(0, 24, 2))
    plt.tight_layout()
    plt.savefig(FIGURES / "perfil_horario.png", dpi=180)
    plt.savefig(FIGURES / "perfil_horario.svg")
    plt.close()
    month = df.assign(mes=df.datetime.dt.month).groupby("mes")["nat_demand"].mean()
    month.to_csv(TABLES / "demanda_mensual.csv", encoding="utf-8-sig", header=["demanda_media_mwh"])
    plt.figure(figsize=(9, 4.5))
    plt.bar(month.index, month.values, color="#287A9B")
    plt.title("Demanda promedio por mes")
    plt.xlabel("Mes")
    plt.ylabel("Demanda (MWh por intervalo horario)")
    plt.xticks(range(1, 13))
    plt.tight_layout()
    plt.savefig(FIGURES / "demanda_mensual.png", dpi=180)
    plt.close()
    region_rows = []
    for station, name in STATIONS.items():
        col = f"T2M_{station}"
        df.assign(mes=df.datetime.dt.month).groupby("mes")[col].mean().rename(name).to_csv(TABLES / f"temperatura_mensual_{station}.csv", encoding="utf-8-sig")
        region_rows.append(df[col].describe().rename(name))
    temp_summary = pd.DataFrame(region_rows)
    temp_summary.to_csv(TABLES / "resumen_temperaturas.csv", encoding="utf-8-sig")
    plt.figure(figsize=(9, 4.5))
    for station, name in STATIONS.items():
        smooth = df.set_index("datetime")[f"T2M_{station}"].resample("D").mean().rolling(14, min_periods=1).mean()
        plt.plot(smooth.index, smooth, label=name, color=COLORS[station], linewidth=1.4)
    plt.title("Temperatura diaria por estación (media móvil de 14 días)")
    plt.ylabel("Temperatura (°C)")
    plt.xlabel("Fecha")
    plt.legend()
    plt.tight_layout()
    plt.savefig(FIGURES / "temperatura_regional.png", dpi=180)
    plt.close()
    correlations = df.select_dtypes(include=np.number).corr(method="spearman")["nat_demand"].sort_values(ascending=False)
    correlations.to_csv(TABLES / "correlaciones_spearman_demanda.csv", encoding="utf-8-sig", header=["spearman_vs_demanda"])
    plt.figure(figsize=(11, 8))
    sns.heatmap(df.select_dtypes(include=np.number).corr(), cmap="vlag", center=0, vmin=-1, vmax=1, square=False)
    plt.title("Correlaciones de Pearson entre variables")
    plt.tight_layout()
    plt.savefig(FIGURES / "matriz_correlaciones.png", dpi=180)
    plt.close()
    day_type = df.assign(dia=np.where(df.datetime.dt.day_of_week >= 5, "Fin de semana", "Laborable")).groupby("dia")["nat_demand"].agg(["mean", "median", "count"])
    holiday = df.assign(tipo=np.where(df.holiday == 1, "Feriado", "Día regular")).groupby("tipo")["nat_demand"].agg(["mean", "median", "count"])
    school = df.assign(tipo=np.where(df.school == 1, "Periodo escolar", "Vacaciones escolares")).groupby("tipo")["nat_demand"].agg(["mean", "median", "count"])
    day_type.to_csv(TABLES / "demanda_tipo_dia.csv", encoding="utf-8-sig")
    holiday.to_csv(TABLES / "demanda_feriados.csv", encoding="utf-8-sig")
    school.to_csv(TABLES / "demanda_periodo_escolar.csv", encoding="utf-8-sig")
    scatter = df.sample(min(5000, len(df)), random_state=RNG_SEED)
    fig, axes = plt.subplots(1, 3, figsize=(13, 4.2), sharey=True)
    for axis, (station, name) in zip(axes, STATIONS.items()):
        axis.scatter(scatter[f"T2M_{station}"], scatter["nat_demand"], s=6, alpha=.25, color=COLORS[station])
        axis.set_title(name)
        axis.set_xlabel("Temperatura (°C)")
    axes[0].set_ylabel("Demanda nacional (MWh por intervalo)")
    fig.suptitle("Demanda nacional y temperatura observada por estación")
    plt.tight_layout()
    plt.savefig(FIGURES / "temperatura_demanda.png", dpi=180)
    plt.close()
    return correlations


def save_events(df: pd.DataFrame):
    rows = []
    event_rows = []
    for station, name in STATIONS.items():
        col = f"T2M_{station}"
        threshold = float(df[col].quantile(.95))
        hot = df[col] > threshold
        days_hot = df.loc[hot, "datetime"].dt.date.nunique()
        hot_demand = float(df.loc[hot, "nat_demand"].mean())
        normal_demand = float(df.loc[~hot, "nat_demand"].mean())
        rows.append({"estacion": name, "percentil_95_c": threshold, "horas_sobre_umbral": int(hot.sum()), "dias_con_horas_elevadas": int(days_hot), "demanda_media_eventos_mwh": hot_demand, "demanda_media_resto_mwh": normal_demand, "diferencia_media_mwh": hot_demand - normal_demand})
        active = hot.to_numpy()
        start = None
        for i, flag in enumerate(active):
            if flag and start is None:
                start = i
            if start is not None and (not flag or i == len(active) - 1):
                end = i if flag and i == len(active) - 1 else i - 1
                event_rows.append({"estacion": name, "inicio": df.datetime.iloc[start], "fin": df.datetime.iloc[end], "duracion_horas": end - start + 1, "demanda_media_mwh": float(df.nat_demand.iloc[start : end + 1].mean())})
                start = None
    events = pd.DataFrame(rows)
    event_table = pd.DataFrame(event_rows)
    events.to_csv(TABLES / "eventos_termicos_resumen.csv", index=False, encoding="utf-8-sig")
    event_table.to_csv(TABLES / "eventos_termicos_detalle.csv", index=False, encoding="utf-8-sig")
    plt.figure(figsize=(9, 4.8))
    sns.barplot(data=events, x="estacion", y="diferencia_media_mwh", hue="estacion", palette=[COLORS[k] for k in STATIONS], legend=False)
    plt.axhline(0, color="#102C3B", linewidth=1)
    plt.title("Diferencia descriptiva de demanda durante horas sobre el percentil 95")
    plt.ylabel("Diferencia de demanda media (MWh por intervalo)")
    plt.xlabel("Estación usada para definir el evento")
    plt.tight_layout()
    plt.savefig(FIGURES / "eventos_termicos_demanda.png", dpi=180)
    plt.close()
    return events, event_table


def save_adjusted_associations(df: pd.DataFrame):
    analysis = df.copy()
    analysis["hora"] = analysis.datetime.dt.hour
    analysis["dia_semana"] = analysis.datetime.dt.day_of_week
    analysis["mes"] = analysis.datetime.dt.month
    analysis["ano"] = analysis.datetime.dt.year
    formula = "nat_demand ~ T2M_toc + T2M_san + T2M_dav + C(hora) + C(dia_semana) + C(mes) + C(ano) + holiday + school"
    fitted = smf.ols(formula, data=analysis).fit(cov_type="HAC", cov_kwds={"maxlags": 24})
    rows = []
    for station, name in STATIONS.items():
        term = f"T2M_{station}"
        rows.append({"estacion": name, "variable": term, "coeficiente_mwh_por_c": float(fitted.params[term]), "error_estandar_hac": float(fitted.bse[term]), "ic95_inferior": float(fitted.conf_int().loc[term, 0]), "ic95_superior": float(fitted.conf_int().loc[term, 1]), "p_valor": float(fitted.pvalues[term]), "n": int(fitted.nobs), "covarianza": "HAC con 24 rezagos horarios", "controles": "hora, día de semana, mes, año, feriado y periodo escolar"})
    table = pd.DataFrame(rows)
    table.to_csv(TABLES / "asociaciones_temperatura_ajustadas.csv", index=False, encoding="utf-8-sig")
    return table


def save_weekly_forecast_benchmark(df: pd.DataFrame):
    test_book = pd.ExcelFile(RAW / "test_dataframes.xlsx")
    forecast = pd.read_csv(RAW / "weekly pre-dispatch forecast.csv", parse_dates=["datetime"])
    actual = df[["datetime", "nat_demand"]]
    parts = []
    for sheet in test_book.sheet_names:
        test_rows = pd.read_excel(RAW / "test_dataframes.xlsx", sheet_name=sheet, usecols=["datetime", "DEMAND"])
        joined = test_rows.merge(forecast, on="datetime", how="inner").merge(actual, on="datetime", how="inner")
        joined["semana_oficial"] = sheet
        parts.append(joined)
    matched = pd.concat(parts, ignore_index=True)
    values = metric_values(matched["nat_demand"], matched["load_forecast"])
    per_week = matched.groupby("semana_oficial").apply(lambda part: pd.Series(metric_values(part.nat_demand, part.load_forecast)), include_groups=False).reset_index()
    per_week.to_csv(TABLES / "pronostico_pre despacho_por_semana.csv".replace(" ", "_"), index=False, encoding="utf-8-sig")
    matched.to_csv(TABLES / "pronostico_pre_despacho_validacion.csv", index=False, encoding="utf-8-sig")
    return {"modelo": "pronóstico semanal predespacho del archivo original", **values, "filas_comparadas": len(matched), "semanas_oficiales": len(test_book.sheet_names), "horizonte_horas_por_semana": 168, "comparabilidad": "fechas exactas y mismas 14 ventanas oficiales del archivo de prueba", "comparar_con_modelo_rodante": False}, per_week


def fit_models(df: pd.DataFrame):
    features = make_features(df)
    target = df["nat_demand"].astype(float)
    valid = features.notna().all(axis=1)
    features = features.loc[valid]
    target = target.loc[valid]
    stamps = df.loc[valid, "datetime"]
    n = len(features)
    train_end = int(n * .70)
    valid_end = int(n * .85)
    split = {"train_filas": train_end, "validacion_filas": valid_end - train_end, "prueba_filas": n - valid_end, "inicio_prueba": stamps.iloc[valid_end], "fin_prueba": stamps.iloc[-1]}
    time_cols = ["hora_sin", "hora_cos", "semana_sin", "semana_cos", "ano_sin", "ano_cos", "fin_de_semana", "feriado", "periodo_escolar", "holiday_id"]
    weather_cols = [column for column in features.columns if column.startswith(("T2M_", "QV2M_", "TQL_", "W2M_"))]
    history_cols = [column for column in features.columns if column.startswith("demanda_rezago_") or column == "media_movil_24"]
    candidates = {
        "regresion_temporal": (LinearRegression(), time_cols),
        "regresion_temporal_clima": (LinearRegression(), time_cols + weather_cols),
        "regresion_temporal_clima_historia": (LinearRegression(), time_cols + weather_cols + history_cols),
        "random_forest_temporal_clima_historia": (RandomForestRegressor(n_estimators=100, min_samples_leaf=3, max_depth=18, n_jobs=-1, random_state=RNG_SEED), time_cols + weather_cols + history_cols),
    }
    rows = []
    fitted = {}
    for name, (model, columns) in candidates.items():
        started = time.perf_counter()
        model.fit(features.iloc[:train_end][columns], target.iloc[:train_end])
        validation_prediction = model.predict(features.iloc[train_end:valid_end][columns])
        duration = time.perf_counter() - started
        rows.append({"modelo": name, "variables": len(columns), **metric_values(target.iloc[train_end:valid_end], validation_prediction), "segundos_entrenamiento": duration})
        fitted[name] = (model, columns)
    seasonal_validation = target.iloc[train_end:valid_end].to_numpy()
    naive_validation = df.loc[stamps.iloc[train_end:valid_end].index, "nat_demand"].shift(168).to_numpy()
    valid_idx = stamps.iloc[train_end:valid_end].index
    naive_validation = df.loc[valid_idx - 168, "nat_demand"].to_numpy()
    rows.append({"modelo": "referencia_semanal_ingenua", "variables": 1, **metric_values(seasonal_validation, naive_validation), "segundos_entrenamiento": 0.0})
    validation_table = pd.DataFrame(rows).sort_values("rmse")
    winner = validation_table.iloc[0]["modelo"]
    model_rows = []
    predictions = {}
    if winner == "referencia_semanal_ingenua":
        test_index = stamps.iloc[valid_end:].index
        test_pred = df.loc[test_index - 168, "nat_demand"].to_numpy()
        predictions[winner] = test_pred
        model_rows.append({"modelo": winner, **metric_values(target.iloc[valid_end:], test_pred), "seleccion": "mejor RMSE en validación"})
        weather_winner = min([row for row in rows if "clima" in row["modelo"]], key=lambda row: row["rmse"])["modelo"]
    else:
        selected_model, selected_columns = fitted[winner]
        combined_x = features.iloc[:valid_end][selected_columns]
        combined_y = target.iloc[:valid_end]
        if hasattr(selected_model, "fit"):
            final_model = selected_model
            final_model.fit(combined_x, combined_y)
        test_x = features.iloc[valid_end:][selected_columns]
        test_y = target.iloc[valid_end:]
        test_pred = final_model.predict(test_x)
        predictions[winner] = test_pred
        model_rows.append({"modelo": winner, **metric_values(test_y, test_pred), "seleccion": "mejor RMSE en validación"})
        climate_candidates = [row for row in rows if "clima" in row["modelo"]]
        weather_winner = min(climate_candidates, key=lambda row: row["rmse"])["modelo"]
        climate_model, climate_columns = fitted[weather_winner]
        climate_model.fit(features.iloc[:valid_end][climate_columns], target.iloc[:valid_end])
        climate_prediction = climate_model.predict(features.iloc[valid_end:][climate_columns])
        if weather_winner != winner:
            model_rows.append({"modelo": weather_winner, **metric_values(test_y, climate_prediction), "seleccion": "mejor modelo con clima en validación; usado para sensibilidad"})
        rows_test = []
        for row in rows:
            if row["modelo"] in fitted:
                local_model, columns = fitted[row["modelo"]]
                local_model.fit(features.iloc[:valid_end][columns], target.iloc[:valid_end])
                pred = local_model.predict(features.iloc[valid_end:][columns])
                rows_test.append({"modelo": row["modelo"], **metric_values(target.iloc[valid_end:], pred)})
        naive_test_index = stamps.iloc[valid_end:].index
        naive_test = df.loc[naive_test_index - 168, "nat_demand"].to_numpy()
        rows_test.append({"modelo": "referencia_semanal_ingenua", **metric_values(target.iloc[valid_end:], naive_test)})
        model_table = pd.DataFrame(rows_test).sort_values("rmse")
    if winner == "referencia_semanal_ingenua":
        test_y = target.iloc[valid_end:]
        model_table = pd.DataFrame([{"modelo": winner, **metric_values(test_y, predictions[winner])}])
    model_table.to_csv(TABLES / "metricas_modelos_prueba.csv", index=False, encoding="utf-8-sig")
    validation_table.to_csv(TABLES / "metricas_modelos_validacion.csv", index=False, encoding="utf-8-sig")
    test_index = stamps.iloc[valid_end:].index
    result_predictions = pd.DataFrame({"datetime": stamps.iloc[valid_end:].to_numpy(), "demanda_real_mwh": target.iloc[valid_end:].to_numpy(), "demanda_estimada_mwh": predictions[winner]})
    result_predictions.to_csv(TABLES / "predicciones_prueba.csv", index=False, encoding="utf-8-sig")
    test_thresholds = {station: float(df.loc[stamps.iloc[:train_end].index, f"T2M_{station}"].quantile(.95)) for station in STATIONS}
    heat_rows = []
    test_actual_index = stamps.iloc[valid_end:].index
    for station, name in STATIONS.items():
        hot = df.loc[test_actual_index, f"T2M_{station}"].to_numpy() > test_thresholds[station]
        for label, mask in (("temperatura normal", ~hot), ("sobre percentil 95 de entrenamiento", hot)):
            if mask.any():
                heat_rows.append({"estacion": name, "grupo": label, "umbral_c_entrenamiento": test_thresholds[station], "filas": int(mask.sum()), **metric_values(target.iloc[valid_end:].to_numpy()[mask], predictions[winner][mask])})
    heat_table = pd.DataFrame(heat_rows)
    heat_table.to_csv(TABLES / "metricas_modelo_por_temperatura.csv", index=False, encoding="utf-8-sig")
    result_predictions = result_predictions.iloc[::4]
    plt.figure(figsize=(12, 4.5))
    plt.plot(result_predictions.datetime, result_predictions.demanda_real_mwh, label="Demanda observada", color="#102C3B", linewidth=1)
    plt.plot(result_predictions.datetime, result_predictions.demanda_estimada_mwh, label="Estimación", color="#FFB547", linewidth=1)
    plt.title(f"Demanda observada y estimada en la prueba: {winner.replace('_', ' ')}")
    plt.xlabel("Fecha")
    plt.ylabel("Demanda (MWh por intervalo)")
    plt.legend()
    plt.tight_layout()
    plt.savefig(FIGURES / "demanda_real_estimacion.png", dpi=180)
    plt.close()
    residuals = result_predictions.demanda_real_mwh - result_predictions.demanda_estimada_mwh
    plt.figure(figsize=(8, 4.5))
    sns.histplot(residuals, bins=45, color="#287A9B")
    plt.title("Distribución de errores en la prueba")
    plt.xlabel("Error: observada menos estimada (MWh)")
    plt.tight_layout()
    plt.savefig(FIGURES / "distribucion_errores.png", dpi=180)
    plt.close()
    final_model, climate_columns = fitted[weather_winner]
    final_model.fit(features.iloc[:valid_end][climate_columns], target.iloc[:valid_end])
    test_x = features.iloc[valid_end:][climate_columns]
    permutation_data = test_x.iloc[::max(1, len(test_x) // 1200)]
    permutation_target = target.loc[permutation_data.index]
    importance = permutation_importance(final_model, permutation_data, permutation_target, scoring="neg_mean_absolute_error", n_repeats=4, random_state=RNG_SEED, n_jobs=-1)
    importance_table = pd.DataFrame({"variable": climate_columns, "importancia_permutacion_mae": importance.importances_mean, "desviacion": importance.importances_std}).sort_values("importancia_permutacion_mae", ascending=False)
    importance_table.to_csv(TABLES / "importancia_variables.csv", index=False, encoding="utf-8-sig")
    plt.figure(figsize=(9, 5))
    shown = importance_table.head(12).sort_values("importancia_permutacion_mae")
    plt.barh(shown.variable, shown.importancia_permutacion_mae, color="#165C48")
    plt.title("Importancia por permutación en el conjunto de prueba")
    plt.xlabel("Aumento del MAE al mezclar la variable (MWh)")
    plt.tight_layout()
    plt.savefig(FIGURES / "importancia_variables.png", dpi=180)
    plt.close()
    split.update({"inicio_entrenamiento": stamps.iloc[0], "fin_entrenamiento": stamps.iloc[train_end - 1], "inicio_validacion": stamps.iloc[train_end], "fin_validacion": stamps.iloc[valid_end - 1], "fin_prueba": stamps.iloc[-1], "modelo_seleccionado": winner, "modelo_climatico_sensibilidad": weather_winner})
    return model_table, validation_table, split, result_predictions, final_model, climate_columns, features, target, valid_end, heat_table


def save_sensitivity(df, model, columns, features, target, valid_end):
    test_features = features.iloc[valid_end:].copy()
    test_y = target.iloc[valid_end:]
    positions = test_features.index
    original = test_features[columns].copy()
    reference = model.predict(original)
    rows = []
    for station, name in STATIONS.items():
        column = f"T2M_{station}"
        upper = float(df[column].quantile(.99))
        base = original.loc[positions, column]
        for increment in (1, 2, 3):
            allowed = base + increment <= upper
            if not allowed.any():
                continue
            local = original.loc[allowed].copy()
            shifted = local.copy()
            shifted[column] = shifted[column] + increment
            delta = model.predict(shifted) - model.predict(local)
            rows.append({"estacion": name, "incremento_c": increment, "referencias_validas": int(allowed.sum()), "limite_p99_c": upper, "demanda_base_modelo_mwh": float(np.mean(model.predict(local))), "cambio_estimado_mwh": float(np.mean(delta)), "cambio_estimado_pct": float(np.mean(delta) / np.mean(model.predict(local)) * 100), "tipo": "unica_estacion"})
    for increment in (1, 2, 3):
        allowed = pd.Series(True, index=original.index)
        shifted = original.copy()
        for station in STATIONS:
            column = f"T2M_{station}"
            allowed &= shifted[column] + increment <= float(df[column].quantile(.99))
            shifted[column] = shifted[column] + increment
        if allowed.any():
            local = original.loc[allowed].copy()
            changed = shifted.loc[allowed].copy()
            delta = model.predict(changed) - model.predict(local)
            rows.append({"estacion": "Tres estaciones", "incremento_c": increment, "referencias_validas": int(allowed.sum()), "limite_p99_c": None, "demanda_base_modelo_mwh": float(np.mean(model.predict(local))), "cambio_estimado_mwh": float(np.mean(delta)), "cambio_estimado_pct": float(np.mean(delta) / np.mean(model.predict(local)) * 100), "tipo": "conjunta"})
    result = pd.DataFrame(rows)
    result.to_csv(TABLES / "sensibilidad_temperatura.csv", index=False, encoding="utf-8-sig")
    write_json(SCENARIOS / "sensibilidad.json", {"metodo": "perturbaciones sobre observaciones del periodo de prueba, con predictores restantes fijos y exclusión de casos que exceden el percentil 99 observado", "unidad_demanda": "MWh por intervalo horario", "modelo": "mejor modelo con clima según RMSE de validación", "resultados": rows})
    plt.figure(figsize=(9, 4.8))
    for station, name in STATIONS.items():
        local = result[result.estacion == name].sort_values("incremento_c")
        plt.plot(local.incremento_c, local.cambio_estimado_mwh, marker="o", color=COLORS[station], label=name)
    local = result[result.estacion == "Tres estaciones"].sort_values("incremento_c")
    if not local.empty:
        plt.plot(local.incremento_c, local.cambio_estimado_mwh, marker="s", linestyle="--", color="#102C3B", label="Tres estaciones")
    plt.axhline(0, color="#888", linewidth=.8)
    plt.title("Sensibilidad estimada ante incrementos de temperatura")
    plt.xlabel("Incremento de temperatura (°C)")
    plt.ylabel("Cambio medio estimado en demanda (MWh/intervalo)")
    plt.legend()
    plt.tight_layout()
    plt.savefig(FIGURES / "sensibilidad_temperatura.png", dpi=180)
    plt.close()
    return result


def main():
    for folder in (FIGURES, TABLES, METRICS, SCENARIOS, PROCESSED):
        folder.mkdir(parents=True, exist_ok=True)
    df = pd.read_csv(RAW / "continuous dataset.csv", low_memory=False)
    df["datetime"] = pd.to_datetime(df["datetime"], errors="coerce")
    df = df.sort_values("datetime").reset_index(drop=True)
    forecast = pd.read_csv(RAW / "weekly pre-dispatch forecast.csv", low_memory=False)
    forecast["datetime"] = pd.to_datetime(forecast["datetime"], errors="coerce")
    audit, stats = save_data_audit(df, forecast)
    df.to_csv(PROCESSED / "continuous_clean.csv", index=False, encoding="utf-8-sig")
    correlations = save_eda(df)
    events, event_details = save_events(df)
    associations = save_adjusted_associations(df)
    weekly_benchmark, weekly_by_window = save_weekly_forecast_benchmark(df)
    metrics, validation, split, predictions, model, model_columns, features, target, valid_end, heat_table = fit_models(df)
    sensitivity = save_sensitivity(df, model, model_columns, features, target, valid_end)
    demand = df.nat_demand
    metadata = {
        "version_analisis": "1.0.0",
        "fecha_generacion_utc": pd.Timestamp.now(tz="UTC"),
        "fuente_datos": "IEEE PES Data Sharing Task Force, Short-term electricity load forecasting (Panama), archivos provistos por el grupo",
        "unidad_demanda": "MWh por intervalo horario según el PDF de metadatos del paquete",
        "periodo_historico": [df.datetime.min(), df.datetime.max()],
        "filas": len(df),
        "demanda_media": float(demand.mean()),
        "demanda_mediana": float(demand.median()),
        "demanda_maxima": float(demand.max()),
        "demanda_minima": float(demand.min()),
        "correlaciones_spearman": correlations.to_dict(),
        "eventos": events.to_dict("records"),
        "modelos_prueba": metrics.to_dict("records"),
        "modelos_validacion": validation.to_dict("records"),
        "particion": split,
        "sensibilidad": sensitivity.to_dict("records"),
        "asociaciones_ajustadas": associations.to_dict("records"),
        "metricas_por_temperatura": heat_table.to_dict("records"),
        "pronostico_predespacho": weekly_benchmark,
        "limitaciones": ["Las variables meteorológicas observadas en la misma hora del objetivo permiten un análisis ex post y no constituyen pronóstico operativo con clima futuro.", "La demanda se expresa en MWh por intervalo horario según los metadatos del paquete; no la convertimos a MW.", "La documentación incluida etiqueta QV2M como humedad relativa, pero la definición de NASA es humedad específica. Usamos sus valores sin conversión y documentamos la discrepancia.", "Los cambios de temperatura simulados son estimaciones condicionadas al modelo, no efectos causales ni proyecciones oficiales."],
    }
    write_json(METRICS / "resultados.json", metadata)
    write_json(METRICS / "auditoria.json", audit)
    print(json.dumps(json_safe({"auditoria": audit, "metricas_prueba": metrics.to_dict("records"), "validacion": validation.to_dict("records"), "particion": split, "eventos": events.to_dict("records"), "sensibilidad": sensitivity.to_dict("records"), "asociaciones_ajustadas": associations.to_dict("records"), "metricas_por_temperatura": heat_table.to_dict("records"), "pronostico_predespacho": weekly_benchmark}), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
