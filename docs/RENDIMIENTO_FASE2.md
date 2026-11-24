# Diagnóstico de rendimiento público de la fase 2 publicada

Leemos tres corridas de Lighthouse móvil del sitio publicado, con CPU y red simuladas. Conservamos OneDrive activo. Medimos el commit `9da5bed`, sin atribuir los cambios del equipo a una causa no demostrada.

| Corrida | TBT, ms | LCP, ms | CLS | Hilo principal, ms |
|---|---:|---:|---:|---:|
| 1 | 231 | 1064.83 | 0 | 1163.59 |
| 2 | 306 | 1020.83 | 0 | 1283.47 |
| 3 | 364.5 | 1092.84 | 0 | 1518.29 |

Obtenemos medianas de TBT **306.0 ms**, LCP **1064.8 ms**, CLS **0** y hilo principal **1283.5 ms**.

Identificamos como elemento LCP el `h1` con «El clima y la energía, en el mismo mapa», selector `section#inicio > div.atlas-hero-grid > div > h1`. No identificamos el raster como elemento LCP.

Registramos **62,199 B**, aproximadamente **60.7 KiB**, de JavaScript sin usar estimado por Lighthouse, concentrado en los dos paquetes principales. Lo tratamos como estimación de cobertura, no como tiempo de CPU ni como promesa de ahorro equivalente de TBT.

## Tiempo de hilo principal por URL

Conservamos las filas que Lighthouse publica en bootup-time. Mostramos las medianas por fila; no las sumamos entre sí porque proceden de tres corridas. Tampoco las sumamos al TBT, que mide otra magnitud.

| URL o archivo | Identificación | CPU total, ms | Evaluación, ms | Parseo/compilación, ms |
|---|---|---:|---:|---:|
| `794-961df89b69f69717.js` | Next App Router y cliente RSC | 457.2 | 400.8 | 16.3 |
| `documento HTML` | documento | 559.8 | 9.9 | 13.7 |
| `Unattributable` | sin atribucion | 249.1 | 5.0 | 0.0 |

Encontramos 5 scripts iniciales. Clasificamos sus contenidos en el JSON adjunto y conservamos sus URL, bytes y huellas. No inventamos tiempos para los scripts sin fila individual en esta auditoría.

## Recharts y Leaflet

Comprobamos tanto la red de Lighthouse como el contenido de todos los scripts iniciales descargados. No encontramos Recharts ni Leaflet en esa carga inicial: atribuimos **0 B y 0 ms de ejecución inicial** a esas bibliotecas, no a su uso posterior. Ya se cargan mediante next/dynamic e IntersectionObserver al entrar en sus secciones. No identificamos la CPU de React DOM como coste de Recharts.

## Verificación después de añadir los perfiles

Identificamos el TBT como límite principal, con LCP y CLS ya bajos. Diferir otra vez Recharts o Leaflet no elimina el trabajo inicial que observamos. No podemos calcular una futura puntuación a partir del número de SVG.

Implementamos perfiles precalculados, máscaras externas y texto de servidor, sin añadir islas cliente. Conservamos la contención de las secciones fuera de pantalla y comprobamos que las bibliotecas sigan ausentes al inicio. Si la mediana pública baja de 92, detenemos el cierre de la fase y corregimos antes de continuar. Evaluamos el coste de hidratación de React/Next durante la fase y conservamos todas las corridas. No lo atribuimos a bibliotecas que aún no se descargan.

Interpretamos las auditorías siguiendo [tiempo de ejecución de JavaScript](https://developer.chrome.com/docs/lighthouse/performance/bootup-time) y [JavaScript sin usar](https://developer.chrome.com/docs/lighthouse/performance/unused-javascript). Conservamos los informes completos en evidencias/rediseno y el resumen de cifras en este JSON versionado.


En estas corridas, bootup-time no publica una fila individual de React DOM. No le atribuimos por ello cero CPU: conservamos los tiempos por URL que la auditoría sí ofrece y distinguimos la identificación del contenido de una atribución interna por biblioteca.

Registramos rendimiento 96, 93, 91; mediana **93**, frente a la referencia **92**. Conservamos la meta de 95.
