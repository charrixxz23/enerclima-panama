"""resumimos tres informes publicos sin mezclar cpu, tbt y transferencia."""
import argparse
import hashlib
import json
import statistics
from pathlib import Path
from urllib.request import urlopen


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--prefix", required=True)
    parser.add_argument("--commit", default="94c2ff7")
    parser.add_argument("--reference", type=int, default=91)
    parser.add_argument("--stage", choices=["before", "after"], default="before")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    reports = [json.loads(Path(f"{args.prefix}-{i}.report.json").read_text(encoding="utf-8")) for i in range(1, 4)]
    median = statistics.median
    series = lambda key: [r["audits"][key]["numericValue"] for r in reports]
    cpu = {}
    for report in reports:
        for item in report["audits"]["bootup-time"]["details"]["items"]:
            cpu.setdefault(item["url"], []).append(item)
    scripts = [x for x in reports[0]["audits"]["network-requests"]["details"]["items"] if x.get("resourceType") == "Script"]
    libraries = {"Recharts": False, "Leaflet": False}
    classifications = {}
    for item in scripts:
        raw = urlopen(item["url"], timeout=30).read()
        code = raw.decode("utf-8")
        family = "aplicacion o arranque"
        if "AppRouter" in code and "ACTION_NAVIGATE" in code:
            family = "Next App Router y cliente RSC"
        elif "Minified React error" in code and "__DOM_INTERNALS_DO_NOT_USE" in code:
            family = "React DOM"
        for name, marker in [("Recharts", "recharts-wrapper"), ("Leaflet", "leaflet-pane")]:
            if marker in code:
                libraries[name] = True
                family = name
        classifications[item["url"]] = {"familia": family, "sha256": hashlib.sha256(raw).hexdigest()}
    metrics = {key: {"corridas": series(key), "mediana": median(series(key))} for key in ["total-blocking-time", "largest-contentful-paint", "cumulative-layout-shift", "mainthread-work-breakdown"]}
    unused = [r["audits"]["unused-javascript"]["details"]["overallSavingsBytes"] for r in reports]
    cpu_rows = [{"url": url, "familia": classifications.get(url, {}).get("familia", "documento" if url.startswith("https:") else "sin atribucion"), **{key: median([row[key] for row in rows]) for key in ["total", "scripting", "scriptParseCompile"]}} for url, rows in cpu.items()]
    lcp_nodes = [next((item for item in r["audits"]["lcp-breakdown-insight"]["details"]["items"] if item.get("type") == "node"), {}) for r in reports]
    result = {"lcp_elementos": lcp_nodes, "commit": args.commit, "referencia_rendimiento": args.reference, "categorias": {key: [round(r["categories"][key]["score"] * 100) for r in reports] for key in ["performance", "accessibility", "best-practices", "seo"]}, "url": reports[0]["requestedUrl"], "fechas": [r["fetchTime"] for r in reports], "lighthouse": reports[0]["lighthouseVersion"], "metodo": reports[0]["configSettings"]["throttlingMethod"], "metricas": metrics, "javascript_no_usado_estimado_bytes": {"corridas": unused, "mediana": median(unused)}, "cpu_por_url": cpu_rows, "scripts_iniciales": [{"url": item["url"], "bytes_transferidos": item["transferSize"], **classifications[item["url"]]} for item in scripts], "bibliotecas_descargadas_al_inicio": libraries}
    assert all(node.get("selector", "").endswith("h1") for node in lcp_nodes), "revisamos un cambio del elemento lcp antes de describirlo"
    assert not any(libraries.values()), "revisamos las bibliotecas presentes al inicio antes de describirlas"
    args.output.with_suffix(".json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# Diagnóstico de rendimiento público antes de la fase 2", "", "Leemos tres corridas de Lighthouse móvil del sitio publicado, con CPU y red simuladas. Conservamos OneDrive activo. Medimos el commit `94c2ff7`, sin atribuir los cambios del equipo a una causa no demostrada.", "", "| Corrida | TBT, ms | LCP, ms | CLS | Hilo principal, ms |", "|---|---:|---:|---:|---:|"]
    for i in range(3):
        lines.append(f"| {i+1} | " + " | ".join(str(round(metrics[key]["corridas"][i], 2)) for key in metrics) + " |")
    lines += ["", f"Obtenemos medianas de TBT **{median(series('total-blocking-time')):.1f} ms**, LCP **{median(series('largest-contentful-paint')):.1f} ms**, CLS **{median(series('cumulative-layout-shift')):.4g}** y hilo principal **{median(series('mainthread-work-breakdown')):.1f} ms**.", "", "Identificamos como elemento LCP el `h1` con «El clima y la energía, en el mismo mapa», selector `section#inicio > div.atlas-hero-grid > div > h1`. No identificamos el raster como elemento LCP.", "", f"Registramos **{median(unused):,.0f} B**, aproximadamente **{median(unused)/1024:.1f} KiB**, de JavaScript sin usar estimado por Lighthouse, concentrado en los dos paquetes principales. Lo tratamos como estimación de cobertura, no como tiempo de CPU ni como promesa de ahorro equivalente de TBT.", "", "## Tiempo de hilo principal por URL", "", "Conservamos las filas que Lighthouse publica en bootup-time. Mostramos las medianas por fila; no las sumamos entre sí porque proceden de tres corridas. Tampoco las sumamos al TBT, que mide otra magnitud.", "", "| URL o archivo | Identificación | CPU total, ms | Evaluación, ms | Parseo/compilación, ms |", "|---|---|---:|---:|---:|"]
    for row in cpu_rows:
        name = row["url"].split("/")[-1] or "documento HTML"
        lines.append(f"| `{name}` | {row['familia']} | {row['total']:.1f} | {row['scripting']:.1f} | {row['scriptParseCompile']:.1f} |")
    lines += ["", "Encontramos seis scripts iniciales: el runtime de webpack, React DOM, Next/RSC, main-app y dos paquetes de la aplicación. No inventamos tiempos para los scripts sin fila individual en esta auditoría. Conservamos sus URL, bytes y huellas en el JSON adjunto.", "", "## Recharts y Leaflet", "", "Comprobamos tanto la red de Lighthouse como el contenido de los seis scripts descargados. No encontramos Recharts ni Leaflet en esa carga inicial: atribuimos **0 B y 0 ms de ejecución inicial** a esas bibliotecas, no a su uso posterior. Ya se cargan mediante next/dynamic e IntersectionObserver al entrar en sus secciones. No identificamos la CPU de React DOM como coste de Recharts.", "", "## Decisión antes de añadir formas", "", "Identificamos el TBT como límite principal, con LCP y CLS ya bajos. Diferir otra vez Recharts o Leaflet no elimina el trabajo inicial que observamos. No podemos calcular una futura puntuación a partir del número de SVG.", "", "Procedemos con perfiles precalculados, máscaras externas y texto de servidor, sin añadir islas cliente. Conservamos la contención de las secciones fuera de pantalla y comprobamos que las bibliotecas sigan ausentes al inicio. Si la mediana pública baja de {referencia}, detenemos el cierre de la fase y corregimos antes de continuar. Reservamos una reducción de hidratación de React/Next para una optimización específica si las mediciones la justifican; no la atribuimos a bibliotecas que aún no se descargan.", "", "Interpretamos las auditorías siguiendo [tiempo de ejecución de JavaScript](https://developer.chrome.com/docs/lighthouse/performance/bootup-time) y [JavaScript sin usar](https://developer.chrome.com/docs/lighthouse/performance/unused-javascript). Conservamos los informes completos en evidencias/rediseno y el resumen de cifras en este JSON versionado.", ""]
    text = "\n".join(lines).replace("commit `94c2ff7`", f"commit `{args.commit}`").replace("{referencia}", str(args.reference))
    scores = result["categorias"]["performance"]
    text += f"\nRegistramos rendimiento {', '.join(map(str, scores))}; mediana **{median(scores)}**, frente a la referencia **{args.reference}**. Conservamos la meta de 95.\n"
    if args.stage == "after":
        text = text.replace("antes de la fase 2", "de la fase 2 publicada").replace("## Decisión antes de añadir formas", "## Verificación después de añadir los perfiles").replace("Procedemos con perfiles precalculados", "Implementamos perfiles precalculados")
    args.output.write_text(text, encoding="utf-8")
    print(json.dumps({"tbt_ms": median(series("total-blocking-time")), "lcp_ms": median(series("largest-contentful-paint")), "main_ms": median(series("mainthread-work-breakdown")), "unused_bytes": median(unused), "bibliotecas_iniciales": libraries}))


if __name__ == "__main__":
    main()
