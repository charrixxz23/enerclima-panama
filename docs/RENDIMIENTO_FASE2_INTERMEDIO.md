# Diagnóstico de rendimiento público de la fase 2 publicada

Leemos tres corridas de Lighthouse móvil del sitio publicado, con CPU y red simuladas. Conservamos OneDrive activo. Medimos el commit `9cd5d8a`, sin atribuir los cambios del equipo a una causa no demostrada.

| Corrida | TBT, ms | LCP, ms | CLS | Hilo principal, ms |
|---|---:|---:|---:|---:|
| 1 | 400.0 | 1089.6 | 0 | 1625.71 |
| 2 | 368 | 1129.12 | 0 | 1772.56 |
| 3 | 369 | 1094.96 | 0 | 1582.14 |

Obtenemos medianas de TBT **369.0 ms**, LCP **1095.0 ms**, CLS **0** y hilo principal **1625.7 ms**.

Identificamos como elemento LCP el `h1` con «El clima y la energía, en el mismo mapa», selector `section#inicio > div.atlas-hero-grid > div > h1`. No identificamos el raster como elemento LCP.

Registramos **62,184 B**, aproximadamente **60.7 KiB**, de JavaScript sin usar estimado por Lighthouse, concentrado en los dos paquetes principales. Lo tratamos como estimación de cobertura, no como tiempo de CPU ni como promesa de ahorro equivalente de TBT.

## Tiempo de hilo principal por URL

Conservamos las filas que Lighthouse publica en bootup-time. Mostramos las medianas por fila; no las sumamos entre sí porque proceden de tres corridas. Tampoco las sumamos al TBT, que mide otra magnitud.

| URL o archivo | Identificación | CPU total, ms | Evaluación, ms | Parseo/compilación, ms |
|---|---|---:|---:|---:|
| `Unattributable` | sin atribucion | 474.6 | 6.9 | 0.0 |
| `documento HTML` | documento | 609.1 | 13.5 | 21.5 |
| `4bd1b696-c7408084347438ae.js` | React DOM | 331.7 | 295.9 | 13.5 |
| `794-961df89b69f69717.js` | Next App Router y cliente RSC | 263.9 | 201.9 | 27.0 |
| `page-a40bb19c382b883c.js` | aplicacion o arranque | 53.6 | 47.6 | 3.8 |

Encontramos 5 scripts iniciales. Clasificamos sus contenidos en el JSON adjunto y conservamos sus URL, bytes y huellas. No inventamos tiempos para los scripts sin fila individual en esta auditoría.

## Recharts y Leaflet

Comprobamos tanto la red de Lighthouse como el contenido de todos los scripts iniciales descargados. No encontramos Recharts ni Leaflet en esa carga inicial: atribuimos **0 B y 0 ms de ejecución inicial** a esas bibliotecas, no a su uso posterior. Ya se cargan mediante next/dynamic e IntersectionObserver al entrar en sus secciones. No identificamos la CPU de React DOM como coste de Recharts.

## Verificación después de añadir los perfiles

Identificamos el TBT como límite principal, con LCP y CLS ya bajos. Diferir otra vez Recharts o Leaflet no elimina el trabajo inicial que observamos. No podemos calcular una futura puntuación a partir del número de SVG.

Implementamos perfiles precalculados, máscaras externas y texto de servidor, sin añadir islas cliente. Conservamos la contención de las secciones fuera de pantalla y comprobamos que las bibliotecas sigan ausentes al inicio. Si la mediana pública baja de 92, detenemos el cierre de la fase y corregimos antes de continuar. Reservamos una reducción de hidratación de React/Next para una optimización específica si las mediciones la justifican; no la atribuimos a bibliotecas que aún no se descargan.

Interpretamos las auditorías siguiendo [tiempo de ejecución de JavaScript](https://developer.chrome.com/docs/lighthouse/performance/bootup-time) y [JavaScript sin usar](https://developer.chrome.com/docs/lighthouse/performance/unused-javascript). Conservamos los informes completos en evidencias/rediseno y el resumen de cifras en este JSON versionado.

Registramos rendimiento 90, 91, 91; mediana **91**, frente a la referencia **92**. Conservamos la meta de 95.
