# Sistema visual de EnerClima Panamá

## Dirección

Elegimos Atlas climático. Organizamos el sitio como una lámina de atlas, con serif de contraste, retícula editorial, trazos propios, silueta de Panamá y divisores de sección. Construimos la portada con la demanda diaria del JSON. Identificamos la silueta como diagramática y usamos coordenadas aeroportuarias de referencia; no presentamos cartografía oficial ni celdas meteorológicas.

## Tokens

Definimos colores, tipografía, espaciado, duraciones, medidas y bordes en `web/app/tokens.css`. Ordenamos los estilos en las capas `tokens`, `base`, `atlas` y `motion`. Dividimos las subcapas de atlas en portada, resultados, investigación, piezas de datos, controles y ajustes responsivos; mantenemos sus archivos CSS separados. Distribuimos la lectura sobre una retícula editorial de doce columnas conceptuales; cada sección usa las fracciones necesarias.

| Uso | Tema claro | Contraste con papel | Tema oscuro | Contraste con superficie |
|---|---|---:|---|---:|
| Fondo | #FAF7F1 | — | #102A2B | — |
| Texto | #183A3A | 11.52:1 | #F4F0E8 | 13.31:1 |
| Texto secundario | #53635F | 5.92:1 | #C4CEC8 | 9.37:1 |
| Temperatura menor | #28776A | 4.99:1 | #64BDA5 | 6.75:1 |
| Temperatura intermedia | #8A5B0A | 5.48:1 | #F2BD62 | 8.81:1 |
| Temperatura mayor | #AD432C | 5.43:1 | #F48B72 | 6.33:1 |

Calculamos contrastes con luminancia relativa sRGB según WCAG. Usamos las reglas claras y oscuras como separadores decorativos; no las usamos para texto.

Usamos espaciados de 4, 8, 12, 16, 24, 32, 48, 64 y 96 píxeles expresados en rem. Reservamos 14 píxeles equivalentes para etiquetas y 18 para cuerpo. Ajustamos títulos con `clamp()` y respetamos la escala del navegador. Usamos números tabulares, bordes rectos y foco visible de tres píxeles.

Alojamos subconjuntos latinos de [Fraunces](https://github.com/google/fonts/blob/main/ofl/fraunces/OFL.txt) y [Source Sans 3](https://github.com/google/fonts/blob/main/ofl/sourcesans3/OFL.txt), ambas bajo SIL OFL 1.1. Incluimos las licencias junto a los WOFF2 y cargamos mediante `next/font/local`, con `font-display: swap`.

## Uso de la escala térmica

Reservamos verde, ámbar y terracota para temperatura. Interpolamos la misma escala entre los umbrales P95 de las estaciones tanto en los puntos del mapa como en sus valores de eventos. Explicamos que el color compara umbrales dentro de su rango y no indica alertas. Usamos tinta neutra para demanda, correlaciones, calidad y métricas de error. Ajustamos los tres colores térmicos para el tema oscuro; no invertimos la imagen.

## Piezas de datos

- Construimos el hero con todos los puntos de `demandaDiaria`.
- Dibujamos un reloj radial con `perfilHorario`; hacemos el radio proporcional al valor desde el origen y conservamos todas las horas.
- Representamos `demandaMensual` mediante relieves anuales de amplitud común. Explicamos el origen en el mínimo observado y conservamos los meses de los años incompletos.
- Presentamos cada coeficiente de `correlaciones` frente a `nat_demand`, con explicación del signo al foco y al pasar el puntero. Identificamos la autocorrelación de identidad; no inventamos una matriz de parejas.
- Mostramos los campos de `calidad`, el mínimo para revisión y la discrepancia QV2M. No añadimos conteos que no figuran en el JSON.
- Comparamos escenarios discretos de sensibilidad con sus propias referencias válidas. No sumamos una demanda final que no exista en el archivo fuente.

## Integridad científica

Conservamos `dashboard.json` sin cambios y usamos su precisión completa para los cálculos. Aplicamos el redondeo de presentación por magnitud en `web/lib/format.ts`, con coma decimal y punto de miles. Guardamos los valores originales en `data-exact` y `title`, y documentamos las reglas en [FORMATO_CIFRAS.md](FORMATO_CIFRAS.md). Tomamos métricas, intervalos, umbrales, escenarios, versión y generación del JSON.

Mantenemos exactamente `#inicio`, `#observatorio`, `#clima`, `#eventos`, `#modelos`, `#sensibilidad`, `#investigacion`, `#metodologia` y `#equipo`. Destacamos el alcance ex post junto a modelos, el alcance condicionado junto al simulador y las cuatro limitaciones completas en metodología. Conservamos la referencia semanal por separado.

## Arquitectura y rendimiento

Componemos las secciones estáticas durante la exportación. Limitamos las islas de cliente a navegación, tema, selectores, sensibilidad, movimiento y carga diferida. Declaramos tipos y parseo en `web/lib/dashboard.ts`; aislamos la lectura del JSON en `web/lib/data.ts` para no importar todo el conjunto desde los controles.

Cargamos Recharts y Leaflet con `next/dynamic` e IntersectionObserver cuando entran en pantalla, con contenedores de altura reservada. Prescindimos de teselas y fuentes remotas. Conservamos `output: export` y el patrón `NEXT_PUBLIC_BASE_PATH`. Generamos robots, sitemap y manifest durante el build estático; incluimos favicon, icono Apple, OG, Twitter y JSON-LD Dataset y ScholarlyArticle.

Comprimimos imágenes a AVIF y WebP y mantenemos cada archivo por debajo de 250 KB. Conservamos la antigua ilustración solo como archivo secundario optimizado; la portada usa SVG de datos.

## Movimiento y accesibilidad

Revelamos exclusivamente piezas de datos, una vez y con doce píxeles de recorrido. Dibujamos trazos SVG al entrar en pantalla. Interpolamos el trazado y la posición del marcador al cambiar escenarios, conservando el texto numérico exacto del escenario seleccionado. Resolvemos así la petición de transición sin fabricar valores numéricos intermedios ni contadores científicos.

Desactivamos desplazamiento, dibujo progresivo y transiciones con `prefers-reduced-motion`. Seguimos el tema del sistema y conservamos una elección explícita en almacenamiento local. Añadimos acceso directo al contenido, estructura h1–h2–h3, etiquetas de controles y regiones, foco visible y tablas con encabezados y títulos. Cada figura tiene figcaption y tabla consultable. Las explicaciones de correlación expanden el contenido sin tapar otras celdas.

Verificamos anchos de 360, 390, 768, 1024, 1440 y 1920 píxeles. Las tablas extensas se desplazan dentro de su contenedor; mantenemos el texto científico exacto. No equiparamos una puntuación automatizada con una auditoría manual completa de WCAG.

## Verificación y mediciones

Registramos la salida real de las cinco comprobaciones de cada fase en `evidencias/rediseno/fase-XX-*.txt`. Conservamos informes Lighthouse JSON y HTML, capturas de las seis anchuras y tema oscuro en esa carpeta local ignorada. Contrastamos los escenarios, coeficientes e intervalos con el JSON y comprobamos anclajes, tablas, persistencia del tema y ausencia de solicitudes de recursos externos.

| Categoría | Antes: sitio publicado | Después: exportación local |
|---|---:|---:|
| Rendimiento | 38 | 100 |
| Accesibilidad | 93 | 100 |
| Buenas prácticas | 96 | 100 |
| SEO | 100 | 100 |

Medimos con Lighthouse móvil y Chromium, con limitación simulada de CPU y red. Tomamos el antes en la URL pública de la versión anterior y el después sobre la exportación estática local servida con gzip. Documentamos el cambio de entorno para no atribuir toda la diferencia a diseño o código. También medimos la URL publicada; registramos el resultado actual al final de este documento.

En una medición local anterior obtuvimos LCP de 1.1 s, TBT de 60 ms y CLS de 0.001. Corregimos la estructura de listas descriptivas y los nombres accesibles de los controles. Montamos las filas de las tablas extensas al abrirlas para reducir el trabajo inicial; conservamos todos los registros y un acceso al JSON sin JavaScript.

| Fase | Lint | Tipos | Build | Exportación | Navegador |
|---|---:|---:|---:|---:|---|
| 01 · tokens y capas | 0 | 0 | 0 | 0 | 4 aprobadas |
| 02 · componentes y tipos | 0 | 0 | 0 | 0 | 4 aprobadas |
| 03 · portada e índice | 0 | 0 | 0 | 0 | 4 aprobadas |
| 04 · secciones 01–04 | 0 | 0 | 0 | 0 | 4 aprobadas |
| 05 · secciones 05–08 | 0 | 0 | 0 | 0 | 4 aprobadas |
| 06 · piezas de datos | 0 | 0 | 0 | 0 | 6 aprobadas |
| 07 · tema y movimiento | 0 | 0 | 0 | 0 | 8 aprobadas |
| 08 · rendimiento y metadatos | 0 | 0 | 0 | 0 | 9 aprobadas |

Registramos códigos de salida reales, después de corregir los fallos encontrados. Verificamos en la exportación final los recursos de metadatos, las tablas al abrirse y las seis anchuras. Confirmamos que el objeto Git de `dashboard.json` sigue siendo `172ac7c88204fe758352b2bebd29dc87ed40e487`, igual al de la versión inicial. No modificamos los documentos académicos originales ni añadimos dependencias al manifiesto o al lockfile de npm.



### Corrección posterior a la primera publicación

Medimos tres veces la primera versión publicada y obtuvimos rendimiento 93, 89 y 90, con mediana 90; las otras tres categorías se mantuvieron en 100. Conservamos esos informes y no usamos la medición local como sustituto de la pública.

Para reducir el trabajo inicial retiramos las filas de las tablas cerradas del HTML y de los datos serializados. Consultamos `dashboard.json` desde el propio sitio al abrir una tabla o al entrar un gráfico en pantalla y compartimos una sola lectura en memoria. Conservamos las tablas completas, los valores exactos, los textos estáticos y la altura de los gráficos. Volvimos a ejecutar lint, tipos, build, exportación y las nueve pruebas antes de publicar la corrección.


Externalizamos también las series estáticas de demanda diaria, perfil horario y relieves mensuales en SVG propios generados por `npm run prebuild` desde el JSON. Aplicamos la paleta mediante máscaras CSS, con etiquetas HTML legibles en ambos temas y revelado progresivo compatible con movimiento reducido. Limitamos a centésimas la precisión de las coordenadas gráficas y conservamos la fuente científica completa. Desde el Bloque A aplicamos el formato de presentación centralizado a las cifras visibles y guardamos los valores originales en sus atributos. Reducimos el HTML inicial a 110,840 bytes y conservamos las nueve pruebas aprobadas después de esta corrección.


Aplicamos `content-visibility: auto` con tamaño intrínseco reservado a las secciones fuera de pantalla para reducir la composición inicial. Conservamos los elementos en el documento y verificamos la navegación por anclas y las seis anchuras tras recorrer todas las secciones. Seguimos la [documentación de CSS Containment](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content-visibility). Damos un fondo explícito a las etiquetas del reloj y de los relieves para mantener su contraste sobre las máscaras en ambos temas.


Aislamos la caché local de Next.js y las evidencias temporales de auditoría en AppData mediante enlaces de directorio. Conservamos el código y los recursos públicos dentro de EnerClima-Panama; no incluimos rutas personales en el repositorio. En Linux y en GitHub Actions usamos los directorios normales del proyecto.


## Auditoría pública anterior al Bloque A

Publicamos la corrección de contraste y composición y aprobamos las nueve pruebas contra la URL pública. Verificamos HTTP 200 para la página, los datos, robots, sitemap, manifest, iconos, imagen OG y los cuatro SVG generados. Comparamos el JSON servido con el archivo local y confirmamos igualdad de bytes. Conservamos los documentos académicos originales.

| Categoría | Antes público | Actual público: mediana de tres |
|---|---:|---:|
| Rendimiento | 38 | 86 |
| Accesibilidad | 93 | 100 |
| Buenas prácticas | 96 | 100 |
| SEO | 100 | 100 |

Obtuvimos rendimiento 84, 86 y 91 en las tres corridas actuales. No alcanzamos el objetivo móvil de 95 en este entorno. Detectamos actividad alta de OneDrive durante las mediciones, pero no demostramos que explique por sí sola el resultado. Por indicación del grupo mantenemos activa la sincronización de OneDrive. Conservamos la meta de rendimiento de 95 como no alcanzada en este entorno; no sustituimos el resultado público por el 100 observado anteriormente en local.

Guardamos la salida real y las capturas en `evidencias/rediseno/`, que apunta a un directorio temporal local para evitar escrituras pesadas en OneDrive. Conservamos los informes anteriores, incluidos los resultados que motivaron las correcciones. No añadimos dependencias de npm; incorporamos únicamente el paso de generación de SVG al build.


## Actualización de formato numérico · Bloque A

Centralizamos los formatos semánticos, igualamos la precisión del coeficiente y su intervalo y conservamos el orden de magnitud de los cambios porcentuales pequeños. Mostramos las particiones con fechas largas y preservamos las marcas completas. Mantenemos el diseño Atlas climático hasta que aprobemos el plan del Bloque B.
