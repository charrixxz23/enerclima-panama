import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  fmtDemanda,
  fmtTemp,
  fmtCoef,
  fmtIC,
  fmtPct,
  fmtR2,
  fmtError,
  fmtConteo,
  fmtCorrelacion,
  fmtP,
  fmtPExacto,
  fmtFechaLarga,
  fmtCalidad,
} from "../lib/format.ts";
const data = JSON.parse(
  readFileSync(
    new URL("../public/data/dashboard.json", import.meta.url),
    "utf8",
  ),
);
test("demanda y resumen con precision de presentacion", () => {
  assert.equal(fmtDemanda(data.resumen.media), "1.182,9");
  assert.equal(fmtDemanda(data.resumen.media, { hero: true }), "1.183");
  assert.equal(fmtDemanda(data.eventos[0].diferencia_media_mwh), "199,8");
  assert.equal(fmtDemanda(data.sensibilidad[0].cambio_estimado_mwh), "0,44");
});
test("temperaturas y umbrales mantienen un decimal", () => {
  assert.equal(fmtTemp(data.eventos[0].percentil_95_c), "30,4");
  assert.equal(fmtTemp(data.sensibilidad[0].limite_p99_c), "31,7");
  assert.equal(fmtTemp(30), "30,0");
});
test("coeficiente e intervalo comparten dos decimales", () => {
  const a = data.asociaciones[0];
  assert.equal(fmtCoef(a.coeficiente_mwh_por_c), "22,72");
  assert.equal(fmtIC(a.ic95_inferior), "18,33");
  assert.equal(fmtIC(a.ic95_superior), "27,11");
});
test("porcentajes pequenos conservan dos cifras significativas", () => {
  assert.equal(fmtPct(data.sensibilidad[0].cambio_estimado_pct), "0,037%");
  assert.equal(fmtPct(0.001234), "0,0012%");
  assert.equal(fmtPct(-0.03667), "−0,037%");
  assert.equal(fmtPct(0), "0,00%");
});
test("mape aplica la precision indicada a ambos lados de diez", () => {
  assert.equal(fmtPct(data.modelo[0].mape_pct), "1,66%");
  assert.equal(fmtPct(data.predespacho.mape_pct), "4,95%");
  assert.equal(fmtPct(data.modelo[3].mape_pct), "10,0%");
});
test("r2 y errores mantienen su precision por columna", () => {
  assert.equal(fmtR2(data.modelo[0].r2), "0,977");
  assert.equal(fmtError(data.modelo[0].mae), "19,6");
  assert.equal(fmtError(data.modelo[0].rmse), "27,7");
  for (const row of data.modelo) assert.match(fmtError(row.rmse), /,\d$/);
});
test("conteos usan punto de miles", () => {
  assert.equal(fmtConteo(data.resumen.filas), "48.048");
  assert.equal(fmtConteo(data.eventos[0].horas_sobre_umbral), "2.403");
  assert.equal(fmtConteo(data.particion.train_filas), "33.516");
  assert.equal(fmtConteo(data.particion.prueba_filas), "7.182");
});
test("correlaciones usan signo matematico solo cuando corresponde", () => {
  assert.equal(fmtCorrelacion(data.correlaciones.T2M_dav), "0,70");
  assert.equal(fmtCorrelacion(data.correlaciones.QV2M_toc), "−0,02");
  assert.equal(fmtCorrelacion(-0), "0,00");
});
test("p valores evitan notacion cientifica en las celdas", () => {
  assert.equal(fmtP(data.asociaciones[0].p_valor), "p < 0,001");
  assert.equal(fmtP(data.asociaciones[1].p_valor), "p = 0,009");
  assert.equal(fmtP(0.001), "p = 0,001");
  assert.equal(
    fmtPExacto(data.asociaciones[0].p_valor),
    String(data.asociaciones[0].p_valor),
  );
});
test("fechas de particion son largas y estables entre zonas horarias", () => {
  assert.equal(
    fmtFechaLarga(data.particion.inicio_entrenamiento),
    "10 de enero de 2015",
  );
  assert.equal(
    fmtFechaLarga(data.particion.inicio_prueba),
    "1 de septiembre de 2019",
  );
});
test("la auditoria respeta unidades y codigos", () => {
  assert.equal(
    fmtCalidad("forecast_cobertura_pct", data.calidad.forecast_cobertura_pct),
    "97,9%",
  );
  assert.equal(
    fmtCalidad("demanda_resumen.mean", data.resumen.media),
    "1.182,9",
  );
  assert.equal(
    fmtCalidad(
      "rangos_observados.T2M_toc",
      data.calidad.rangos_observados.T2M_toc,
    ),
    "23,0 a 35,0",
  );
});
test("los formatos no modifican los valores fuente", () => {
  const before = JSON.stringify(data);
  for (const row of data.sensibilidad) {
    fmtDemanda(row.cambio_estimado_mwh);
    fmtPct(row.cambio_estimado_pct);
  }
  assert.equal(JSON.stringify(data), before);
});
test("valores no finitos se presentan como dato ausente", () => {
  for (const fn of [
    fmtDemanda,
    fmtTemp,
    fmtCoef,
    fmtIC,
    fmtPct,
    fmtR2,
    fmtError,
    fmtConteo,
    fmtCorrelacion,
    fmtP,
    fmtPExacto,
  ])
    assert.equal(fn(NaN), "—");
});
