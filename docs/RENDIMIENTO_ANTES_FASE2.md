# Diagnóstico de rendimiento público antes de la fase 2

Leemos tres corridas de Lighthouse móvil del sitio publicado, con CPU y red simuladas. Conservamos OneDrive activo. Tomamos como referencia la fase 1, commit `94c2ff7`, sin atribuir los cambios del equipo a una causa no demostrada.

| Corrida | TBT, ms | LCP, ms | CLS | Hilo principal, ms |
|---|---:|---:|---:|---:|
| 1 | 367.5 | 1025.53 | 0 | 1373.84 |
| 2 | 411 | 1095.43 | 0 | 1536.48 |
| 3 | 240 | 1195.5 | 0 | 1393.87 |

Obtenemos medianas de TBT **367.5 ms**, LCP **1095.4 ms**, CLS **0** y hilo principal **1393.9 ms**.

Identificamos como elemento LCP el `h1` con «El clima y la energía, en el mismo mapa», selector `section#inicio > div.atlas-hero-grid > div > h1`. No identificamos el raster como elemento LCP.

Registramos **62,027 B**, aproximadamente **60.6 KiB**, de JavaScript sin usar estimado por Lighthouse, concentrado en los dos paquetes principales. Lo tratamos como estimación de cobertura, no como tiempo de CPU ni como promesa de ahorro equivalente de TBT.

## Tiempo de hilo principal por URL

Conservamos las filas que Lighthouse publica en bootup-time. Mostramos las medianas por fila; no las sumamos entre sí porque proceden de tres corridas. Tampoco las sumamos al TBT, que mide otra magnitud.

| URL o archivo | Identificación | CPU total, ms | Evaluación, ms | Parseo/compilación, ms |
|---|---|---:|---:|---:|
| `documento HTML` | documento | 523.6 | 11.4 | 16.7 |
| `4bd1b696-c7408084347438ae.js` | React DOM | 340.4 | 302.0 | 15.2 |
| `Unattributable` | sin atribucion | 377.9 | 6.7 | 0.0 |
| `794-961df89b69f69717.js` | Next App Router y cliente RSC | 215.6 | 175.1 | 22.1 |

Encontramos seis scripts iniciales: el runtime de webpack, React DOM, Next/RSC, main-app y dos paquetes de la aplicación. No inventamos tiempos para los scripts sin fila individual en esta auditoría. Conservamos sus URL, bytes y huellas en el JSON adjunto.

## Recharts y Leaflet

Comprobamos tanto la red de Lighthouse como el contenido de los seis scripts descargados. No encontramos Recharts ni Leaflet en esa carga inicial: atribuimos **0 B y 0 ms de ejecución inicial** a esas bibliotecas, no a su uso posterior. Ya se cargan mediante next/dynamic e IntersectionObserver al entrar en sus secciones. No identificamos los aproximadamente 340 ms de React DOM como coste de Recharts.

## Decisión antes de añadir formas

Identificamos el TBT como límite principal, con LCP y CLS ya bajos. Diferir otra vez Recharts o Leaflet no elimina el trabajo inicial que observamos. No podemos calcular una futura puntuación a partir del número de SVG.

Procedemos con perfiles precalculados, máscaras externas y texto de servidor, sin añadir islas cliente. Conservamos la contención de las secciones fuera de pantalla y comprobamos que las bibliotecas sigan ausentes al inicio. Si la mediana pública baja de 91, detenemos el cierre de la fase y corregimos antes de continuar. Reservamos una reducción de hidratación de React/Next para una optimización específica si las mediciones la justifican; no la atribuimos a bibliotecas que aún no se descargan.

Interpretamos las auditorías siguiendo [tiempo de ejecución de JavaScript](https://developer.chrome.com/docs/lighthouse/performance/bootup-time) y [JavaScript sin usar](https://developer.chrome.com/docs/lighthouse/performance/unused-javascript). Conservamos los informes completos en evidencias/rediseno y el resumen de cifras en este JSON versionado.
