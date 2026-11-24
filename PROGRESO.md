# Progreso del proyecto

**Actualizado:** 24 de noviembre de 2026

| Fase | Avance | Evidencia |
|---|---|---|
| Inventario y lectura de la consigna | Completado | `docs/AUDITORIA_FINAL.md`; archivos originales preservados |
| Extracción y auditoría de datos | Completado | `data/raw/`, `results/metrics/auditoria.json`, tablas de revisión |
| Investigación de fuentes | Completado | `docs/references/referencias_verificadas.md` |
| Modelado y análisis | Completado | Canalización Python, métricas, tablas y figuras |
| Cuaderno ejecutable | Completado | Cuaderno público ejecutado y copia privada identificada |
| Aplicación web y GitHub Pages | Publicado y verificado | `https://charrixxz23.github.io/enerclima-panama/`; pruebas locales, estáticas y remotas aprobadas |
| Informe Word y PDF | Completado | 12 páginas, renderizadas e inspeccionadas |
| Presentación PPTX y PDF | Completado | 12 diapositivas/páginas, con notas y gráficos |
| Guiones y checklist | Preparado | Carpeta académica privada de entregables |
| ZIP académico | Completado | Archivo en `entregables/` con documentos privados |
| Grabación del video | Pendiente del grupo | Debemos grabar con rostros y nombres y subirlo al curso |
| Repositorio público y flujo automático | Completado | `https://github.com/charrixxz23/enerclima-panama`, rama `main`; GitHub Actions pasó |
| Verificación del sitio en producción | Completado | HTTP 200 sin autenticación; 4 pruebas de navegador y capturas de escritorio y móvil |

Conservamos los archivos originales y dejamos fuera de Git los datos fuente, cédulas y documentos académicos privados. Queda a cargo del grupo grabar el video y confirmar la fecha de entrega con el curso.


## Rediseño Atlas climático · 24 de noviembre de 2026

Completamos las ocho fases del rediseño y conservamos los nueve anclajes, los datos de análisis y la exportación estática. Añadimos las piezas de datos, fuentes locales, temas persistentes, movimiento reducido, alternativas accesibles, metadatos y recursos de marca. Regeneramos las capturas en AVIF y WebP, con todos los archivos de imagen por debajo de 250 KB.

Ejecutamos las cinco comprobaciones de cada fase y ampliamos la cobertura a nueve pruebas. Medimos Lighthouse móvil antes y después: rendimiento 38 → 100, accesibilidad 93 → 100, buenas prácticas 96 → 100 y SEO 100 → 100. El después corresponde a la exportación final local con gzip; conservamos el detalle y sus condiciones en `docs/DISENO.md` y los informes completos en `evidencias/rediseno/`.

Conservamos `dashboard.json` sin cambios y mantenemos fuera del repositorio los datos y documentos académicos privados. La actualización de `main` activa el flujo existente de GitHub Pages.
