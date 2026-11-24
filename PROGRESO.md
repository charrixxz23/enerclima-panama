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

Ejecutamos las cinco comprobaciones de cada fase y ampliamos la cobertura a nueve pruebas. Medimos Lighthouse móvil antes y después: rendimiento 38 → 100, accesibilidad 93 → 100, buenas prácticas 96 → 100 y SEO 100 → 100. Esa medición corresponde a una exportación local anterior con gzip; conservamos el detalle y sus condiciones en `docs/DISENO.md` y los informes completos en `evidencias/rediseno/`.

Conservamos `dashboard.json` sin cambios y mantenemos fuera del repositorio los datos y documentos académicos privados. La actualización de `main` activa el flujo existente de GitHub Pages.


### Verificación pública anterior al Bloque A

Aprobamos las nueve pruebas contra GitHub Pages y confirmamos que los datos publicados son idénticos al JSON local. Medimos tres corridas públicas con rendimiento 84, 86 y 91 (mediana 86), accesibilidad 100, buenas prácticas 100 y SEO 100. Conservamos el objetivo móvil de rendimiento ≥95 como no alcanzado en este entorno. Por indicación del grupo mantenemos activa la sincronización de OneDrive y conservamos las mediciones reales, sin atribuirle de forma concluyente el resultado.


## Bloque A · presentación de cifras

Implementamos formatos semánticos centralizados, valores completos accesibles, unidades con espacio duro, cifras tabulares y fechas largas. Conservamos los datos, cuadernos y generadores. Documentamos la política en `docs/FORMATO_CIFRAS.md` y preparamos el plan del Bloque B para aprobación antes de cambiar la dirección visual.

Verificamos el Bloque A con lint, tipos, build estático y exportación sin errores; aprobamos 13 pruebas unitarias y 10 de navegador. Comprobamos también los diez dígitos tabulares en la fuente real, las seis anchuras y los valores completos en los atributos. Regeneramos las vistas previas en AVIF y WebP, todas menores de 250 KB. Conservamos la salida real en `evidencias/rediseno/bloque-a-*.txt`.

## Bloque B · fase 1: campo conjunto y sistema visual

Implementamos la superficie de demanda nacional y los perfiles temporales de temperatura de Tocumen a partir de medias por bloques de cuatro días y hora. Exigimos N = 3, conservamos ambos conteos y marcamos 23 celdas vacías. Registramos el SHA-256 del CSV, el script y el comando exacto para regenerar y verificar los dos JSON. Conservamos dashboard.json, los cuadernos, generadores anteriores y documentos originales sin cambios.

Anclamos la rampa a p1–p99 horarios con inflexión en p95; el color de inflexión alcanza 4,70:1 contra el papel. Rasterizamos durante el build: AVIF/WebP de escritorio y móvil, una sola imagen seleccionada por visitante frente al máximo de 120.000 B; corregimos la contabilidad y añadimos la variante ancha en la revisión posterior. Incorporamos la puerta de peso al build y a la verificación de la exportación.

Mantenemos únicamente el tema claro. Conservamos Source Sans 3 para párrafos, usamos Barlow Condensed en cifras y etiquetas y verificamos su tnum real en ambos WOFF2 y las anchuras en navegador. Instanciamos Fraunces con SOFT 50 y WONK 1. Retiramos la ilustración antigua restante; los PNG antiguos ya no forman parte del árbol público. Regeneramos las capturas en AVIF y WebP bajo 250 KB.

Aprobamos 19 pruebas unitarias y 11 de navegador durante la verificación, incluidos overflow y recorte de la portada a 360, 390 y 768 px y las demás anchuras. Conservamos salidas, capturas y mediciones en evidencias/rediseno. Mantenemos OneDrive activo y tomamos como referencia de rendimiento la mediana pública inmediatamente anterior de 90. Cerramos la fase después de comprobar que no disminuya.

Conservamos los contornos de secciones, los tres desbordes deliberados y las anotaciones marginales como trabajo de las fases siguientes. No damos el Bloque B completo por terminado.

## Revisión previa a la fase 2

Corregimos el presupuesto a bytes de una imagen seleccionada por visitante, comparamos nitidez a 2.560 px y conservamos la variante de 3.006 px por su mejora visible. Reforzamos únicamente la superficie neutra de demanda hasta 3,44:1 entre extremos. Dejamos la rampa térmica intacta y aclaramos que cada celda válida contiene 3–4 observaciones por variable. Entregamos el diagnóstico público de TBT, LCP, CLS, JavaScript sin usar y CPU por URL en docs/RENDIMIENTO_ANTES_FASE2.md. Comprobamos que Recharts y Leaflet aportan cero descarga y ejecución a la carga inicial, aunque se utilizan después al entrar en las secciones.


## Bloque B · fase 2: perfiles y lectura entrelazada

Implementamos ocho perfiles temporales derivados del JSON preservado, sus máscaras y tablas estáticas diferidas, el reloj entre secciones, el campo a sangre, la cifra marginal de Tocumen y su guía arqueada. Aplicamos una escala de espacio de 48/80/128 px en escritorio para diferenciar Eventos, el ritmo común y Metodología. Conservamos los nueve anclajes y el tema claro.

Comprobamos 21 pruebas unitarias y 13 de navegador durante el desarrollo, incluida la ausencia de scroll horizontal en siete anchuras, el conteo completo de cada tabla y la descarga de una sola imagen del hero. Conservamos la referencia pública inmediatamente anterior de 92 y verificamos la fase publicada antes de cerrar. La meta de 95 sigue sujeta a medición; mantenemos OneDrive activo.


### Puerta de rendimiento de la fase 2

La primera publicación cb4f658 obtiene mediana 87 y no aprueba el cierre. Conservamos sus diagnósticos y corregimos el contraste del reloj; priorizamos la reducción del trabajo de hidratación, retiramos el cliente de next/image del hero y mantenemos inertes las tablas de los perfiles hasta abrirlas. Verificamos la corrección contra la referencia 92 antes de dar la fase por cerrada.


La primera corrección alcanza mediana pública 91 y accesibilidad 100, pero conservamos el cierre pendiente frente a 92. Reducimos después la hidratación de la navegación y los ocho encabezados estáticos. Aprobamos 22 pruebas unitarias y las 13 de navegador, además de lint, tipos, build y exportación, antes de medir de nuevo la versión pública.
