# Diagnóstico de rendimiento público de la fase 2 publicada

Leemos tres corridas de Lighthouse móvil del sitio publicado, con CPU y red simuladas. Conservamos OneDrive activo. Medimos el commit `cb4f658`, sin atribuir los cambios del equipo a una causa no demostrada.

| Corrida | TBT, ms | LCP, ms | CLS | Hilo principal, ms |
|---|---:|---:|---:|---:|
| 1 | 462 | 1008.79 | 0 | 1829.73 |
| 2 | 526 | 1105.02 | 0 | 1969.4 |
| 3 | 531.5 | 1026.83 | 0 | 1970.55 |

Obtenemos medianas de TBT **526.0 ms**, LCP **1026.8 ms**, CLS **0** y hilo principal **1969.4 ms**.

Identificamos como elemento LCP el `h1` con «El clima y la energía, en el mismo mapa», selector `section#inicio > div.atlas-hero-grid > div > h1`. No identificamos el raster como elemento LCP.

Registramos **62,081 B**, aproximadamente **60.6 KiB**, de JavaScript sin usar estimado por Lighthouse, concentrado en los dos paquetes principales. Lo tratamos como estimación de cobertura, no como tiempo de CPU ni como promesa de ahorro equivalente de TBT.

## Tiempo de hilo principal por URL

Conservamos las filas que Lighthouse publica en bootup-time. Mostramos las medianas por fila; no las sumamos entre sí porque proceden de tres corridas. Tampoco las sumamos al TBT, que mide otra magnitud.

| URL o archivo | Identificación | CPU total, ms | Evaluación, ms | Parseo/compilación, ms |
|---|---|---:|---:|---:|
| `documento HTML` | documento | 677.8 | 14.5 | 23.7 |
| `Unattributable` | sin atribucion | 455.3 | 8.2 | 0.0 |
| `4bd1b696-c7408084347438ae.js` | React DOM | 413.9 | 368.4 | 19.8 |
| `794-961df89b69f69717.js` | Next App Router y cliente RSC | 314.9 | 254.9 | 26.9 |

Encontramos seis scripts iniciales: el runtime de webpack, React DOM, Next/RSC, main-app y dos paquetes de la aplicación. No inventamos tiempos para los scripts sin fila individual en esta auditoría. Conservamos sus URL, bytes y huellas en el JSON adjunto.

## Recharts y Leaflet

Comprobamos tanto la red de Lighthouse como el contenido de los seis scripts descargados. No encontramos Recharts ni Leaflet en esa carga inicial: atribuimos **0 B y 0 ms de ejecución inicial** a esas bibliotecas, no a su uso posterior. Ya se cargan mediante next/dynamic e IntersectionObserver al entrar en sus secciones. No identificamos la CPU de React DOM como coste de Recharts.

## Verificación después de añadir los perfiles

Identificamos el TBT como límite principal, con LCP y CLS ya bajos. Diferir otra vez Recharts o Leaflet no elimina el trabajo inicial que observamos. No podemos calcular una futura puntuación a partir del número de SVG.

Implementamos perfiles precalculados, máscaras externas y texto de servidor, sin añadir islas cliente. Conservamos la contención de las secciones fuera de pantalla y comprobamos que las bibliotecas sigan ausentes al inicio. Si la mediana pública baja de 92, detenemos el cierre de la fase y corregimos antes de continuar. Reservamos una reducción de hidratación de React/Next para una optimización específica si las mediciones la justifican; no la atribuimos a bibliotecas que aún no se descargan.

Interpretamos las auditorías siguiendo [tiempo de ejecución de JavaScript](https://developer.chrome.com/docs/lighthouse/performance/bootup-time) y [JavaScript sin usar](https://developer.chrome.com/docs/lighthouse/performance/unused-javascript). Conservamos los informes completos en evidencias/rediseno y el resumen de cifras en este JSON versionado.

Registramos rendimiento 88, 87, 87; mediana **87**, frente a la referencia **92**. Conservamos la meta de 95.
