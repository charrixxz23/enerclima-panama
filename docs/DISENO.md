# Sistema visual de EnerClima Panamá

## Alcance del Bloque B · fase 1

Implementamos el sistema tipográfico, el papel cálido y el campo conjunto de demanda y temperatura. Conservamos los nueve anclajes, el rigor científico y la exportación estática bajo `/enerclima-panama`. Reservamos los contornos de sección, los tres desbordes deliberados y las anotaciones marginales para las fases siguientes.

Ofrecemos exclusivamente un tema claro en este alcance. Retiramos el selector, el script de preferencias, la paleta oscura y el mapa oscuro. Ignoramos las preferencias oscuras antiguas guardadas y las del sistema; no mantenemos un segundo sistema visual.

Conservamos el [registro histórico del Atlas anterior](DISENO_ATLAS_ANTERIOR.md). Sus temas y mediciones anteriores describen aquella versión.

## Paleta y codificación

Usamos papel `#F7F3EA`, tinta `#152421` y texto secundario `#4E5C58`. Calculamos contrastes de 14,52:1 y 6,33:1 contra el papel. Superponemos ruido SVG `feTurbulence` en una tesela de 160 × 160 con opacidad 0,025; conservamos el papel si el filtro no está disponible.

Reservamos la rampa teal–ascua para temperatura. No coloreamos la demanda con ella. Usamos una superficie neutra de `#EEE8DD` a `#817B70` para la demanda; vinculamos sus extremos a p1 = 851,2 y p99 = 1.586,4 MWh de la serie horaria. Recortamos únicamente el color fuera del dominio; conservamos las medias completas.

| Ancla térmica | Color | Contraste contra el papel |
|---|---|---:|
| p1 horario | `#21656B` | 6,04:1 |
| p95 horario: inflexión | `#776B5B` | 4,70:1 |
| p99 horario | `#B43E2E` | 5,17:1 |

Calculamos los cuantiles sobre las 48.048 temperaturas horarias, antes de agregar. Usamos interpolación lineal con índice `(n - 1) * p`, equivalente al tipo 7. No usamos el rango de las medias regionales para describir la variabilidad horaria.

| Estación | p1, °C | p95, °C | p99, °C |
|---|---:|---:|---:|
| Tocumen | 24,3 | 30,4 | 31,7 |
| Santiago | 21,7 | 33,1 | 36,0 |
| David | 21,1 | 29,5 | 31,8 |

Mostramos un decimal en esta tabla y conservamos los cuantiles completos en `web/public/data/thermal-summary.json`. En Tocumen guardamos p1 = `24.27690063476565`, p95 = `30.410319519042993` y p99 = `31.71909576416018`. Hacemos coincidir exactamente p95 con el umbral de Eventos y p99 con el límite de sensibilidad del JSON original.

Interpolamos los canales sRGB entre p1 y p95 y después entre p95 y p99, redondeando solamente los canales a enteros. Fijamos el color frío por debajo de p1 y el cálido por encima de p99. Situamos la inflexión en su posición numérica real dentro del dominio, no en el 50 % geométrico de la leyenda. Retiramos el punto claro `#D9CFC2`; el nuevo punto de inflexión supera el mínimo solicitado de 2:1.

Anclamos los colores de los umbrales del mapa y de Eventos a los cuantiles de su propia estación. Por eso representamos cada P95 con el mismo color de inflexión; comparamos los grados mediante sus cifras, no igualamos temperaturas entre estaciones por su color. No usamos estos colores para asignar categorías decorativas a ciudades.

## Campo conjunto y celdas vacías

Calculamos en una misma lectura del CSV la demanda media `nat_demand`, la temperatura media `T2M_toc` y sus dos conteos independientes por bloque de cuatro días y hora registrada. Anclamos los bloques en `2015-01-03T00:00:00`, conservamos 501 columnas y las 24 horas y exigimos **N = 3** observaciones finitas por variable. Cada celda válida promedia entre **3 y 4 observaciones por variable**: agrupamos cuatro días y una observación por hora, con N = 3 de un máximo de 4. No promediamos cientos de horas en cada celda.

Guardamos cada celda como `[demanda_media, n_demanda, temperatura_media, n_temperatura]`, en orden bloque–hora. Guardamos `null` para la media que no alcanza N. Marcamos las 23 celdas insuficientes con rayado y no rellenamos sus valores. Conservamos los conteos de las 48.048 observaciones, incluidas las celdas enmascaradas.

Conservamos la hora escrita en el CSV. No asignamos ni convertimos una zona horaria que el archivo no declara.

Rasterizamos la superficie de demanda y superponemos perfiles temporales de temperatura en p1, p50, p95 y p99. Usamos celdas válidas para calcular los cruces de cada nivel mediante marching squares; no trazamos segmentos sobre una celda vacía. Resolvemos las ambigüedades con el promedio de las cuatro esquinas y explicamos la interpolación como una operación de dibujo entre medias. No inferimos un valor en un hueco. Destacamos p95 con mayor grosor y usamos un halo de papel para distinguir los perfiles de la superficie.

Llamamos a estos trazos **perfiles temporales**, sin atribuirles una interpretación de isolíneas geográficas. Describimos coincidencias, no causalidad. Conservamos el carácter condicionado de los escenarios y todas las limitaciones.

## Reproducibilidad y procedencia

Versionamos `scripts/build_thermal_field.py`, `thermal-field.json`, `thermal-summary.json`, el generador raster y su informe de peso. Conservamos el CSV privado; podemos obtener la fuente a través de la [ficha del conjunto de datos](https://doi.org/10.17632/byx7sztj59.1) y colocar el archivo original en `data/raw/continuous dataset.csv`.

Registramos el SHA-256 exacto de entrada:

```text
ef52f68fc8989d02ff2f2565134014eaf9707318a8389d4022cd38d44656fbce
```

Rechazamos una entrada cuyo hash difiera. Desde la raíz del repositorio regeneramos los dos JSON con Python 3.12 y únicamente su biblioteca estándar:

```sh
python scripts/build_thermal_field.py --input "data/raw/continuous dataset.csv" --output "web/public/data/thermal-field.json"
```

Comprobamos la igualdad de bytes del resultado con:

```sh
python scripts/build_thermal_field.py --input "data/raw/continuous dataset.csv" --output "web/public/data/thermal-field.json" --check
```

Regeneramos el raster desde el agregado versionado durante el build, sin necesitar el CSV privado ni acceso a servicios externos:

```sh
cd web
npm ci
npm run build
```

Declaramos **sharp 0.35.5 como única dependencia npm directa nueva**, solo de desarrollo. Ya figuraba como dependencia transitiva de Next; la declaramos para garantizar que el generador pueda producir AVIF y WebP en una instalación limpia. No añadimos una biblioteca de visualización ni de animación.

## Presupuesto del hero por visitante

Corregimos la contabilidad: picture selecciona una sola imagen compatible con el ancho y el formato del navegador. No sumamos variantes para describir el coste de una visita. Comprobamos el tamaño individual de cada alternativa y usamos el mayor como puerta conservadora de 120.000 bytes por visitante; no incluimos aquí fuentes, HTML ni otros recursos de la página, que diagnosticamos por separado.

Servimos tres tamaños: móvil de 501 × 336 px, escritorio de 1.503 × 432 px y ancho de 3.006 × 864 px desde 1.600 px. Elegimos AVIF cuando es compatible y WebP como alternativa. Declaramos las dimensiones de cada fuente y conservamos su proporción.

En Windows registramos 12.914 B AVIF / 19.500 B WebP para móvil; 32.979 / 46.224 B para escritorio; y 71.974 / 112.090 B para pantallas anchas. No interpretamos su suma como transferencia por visitante. Volvemos a calcular los tamaños reales en Linux durante el build; hacemos fallar prebuild y test:export si alguna alternativa supera 120.000 B. Comprobamos en navegador que la visita solicite una sola imagen del campo.

Comparamos el raster original de 1.503 px con el de 3.006 px en el mismo render a 2.560 px, con un campo de 2.488 px de ancho. Conservamos capturas completas y recortes del mismo punto en evidencias/rediseno/revision-campo. En el original vemos perfiles y halos suavizados por el escalado de 1,66×; en la variante ancha conservamos bordes y separación del halo más definidos. Por esa diferencia visible mantenemos la variante ancha. Podemos repetir la comparación con `node web/scripts/compare-thermal-field.mjs` y `node web/scripts/capture-field-comparison.mjs`; el segundo comando requiere el sitio de referencia publicado.

No confundimos las líneas térmicas con la estructura de demanda. Comparamos también la superficie sin perfiles. Distinguimos el ciclo día/noche en la paleta anterior, pero vemos débiles sus variaciones temporales. Oscurecemos solo el extremo alto de demanda de #A8A295 a #817B70, pasando de 2,08:1 a 3,44:1 entre extremos. Conservamos el extremo claro #EEE8DD y toda la rampa térmica. No reforzamos el contraste con normalizaciones por año ni inventamos etiquetas de estación seca o lluviosa.

No incluimos las 12.024 celdas en el HTML ni en los datos de hidratación. Consultamos el agregado solo al abrir la tabla, mostramos 24 horas por bloque y ofrecemos todos los bloques y el JSON completo. Comprimimos la imagen y preservamos las cifras completas.

Confirmamos que los PNG antiguos ya estaban fuera del árbol público. Retiramos también la ilustración antigua restante. Conservamos las vistas previas en AVIF y WebP, por debajo de 250 KB.

## Tipografía

Conservamos Source Sans 3 de ancho normal para párrafos. Reservamos Barlow Condensed para cifras, ejes y etiquetas. Conservamos Fraunces para titulares y fijamos deliberadamente sus ejes en el generador: **SOFT = 50, WONK = 1, opsz = 72**, en pesos 400 y 600. Elegimos SOFT 50 para suavizar los remates, WONK 1 para conservar las formas irregulares y opsz 72 para la escala de los titulares. Instanciamos esos valores antes del subconjunto; no fingimos ejes variables en un archivo estático. Cargamos el peso 400 para los titulares de esta fase.

Alojamos todas las fuentes con `next/font/local` y mantenemos sus licencias SIL OFL 1.1. Fijamos la fuente de Fraunces y Barlow a la revisión `83c62e30d87daa70216dab6b984d00d20d96d585` de Google Fonts. Podemos regenerar esos subconjuntos con:

```sh
python -m pip install -r requirements-assets.txt
python scripts/build_web_fonts.py
```

Conservamos `tnum` y `pnum` y comprobamos el **WOFF2 realmente autoalojado** en pruebas Node: descomprimimos el bloque Brotli, leemos GSUB y verificamos que `tnum` apunte a sustituciones no vacías en ambos pesos. Comprobamos también en navegador que los diez dígitos ocupen la misma anchura.

## Movimiento, accesibilidad y siguientes fases

Conservamos el estado final sin animaciones con movimiento reducido, foco visible, jerarquía de encabezados, figcaption y tabla consultable. Presentamos los datos del campo con etiquetas y conteos y no exigimos interpretar el color para acceder al valor. Mantenemos Leaflet y Recharts diferidos.

Verificamos overflow horizontal en 360, 390 y 768 px, además de las otras tres anchuras existentes, después de recorrer todas las secciones. Comprobamos también que el titular, la descripción, el campo, sus leyendas y la lectura no se recorten en móvil.

Conservamos para las fases siguientes la escala irregular aprobada de espaciado, los límites curvos derivados de `temperaturaRegional`, los tres elementos que cruzan el gutter, las anotaciones guiadas por datos y la renovación final de los recursos de metadatos. Comprobamos los mismos límites móviles antes de cerrar cada fase.

## Verificación de la fase 1

Conservamos los registros completos de lint, tipos, build, exportación y navegador en `evidencias/rediseno/bloque-b-fase-1-*.txt`. Conservamos también las mediciones Lighthouse, las capturas y las mediciones iniciales que motivaron la corrección de proporciones. Comparamos la mediana móvil pública con la referencia inmediatamente anterior de **90**, manteniendo OneDrive activo. Cerramos esta fase únicamente después de comprobar que no disminuya.

En la comprobación local final obtuvimos rendimiento 91, 91 y 94 (mediana 91) y 100 en accesibilidad, buenas prácticas y SEO. Conservamos las corridas iniciales de rendimiento 100 y buenas prácticas 96, junto con la corrección de proporciones. No sustituimos con estas mediciones locales la comparación pública con la referencia 90.

## Diagnóstico antes de abrir la fase 2

Entregamos el [diagnóstico público por métrica y script](RENDIMIENTO_ANTES_FASE2.md), con su JSON de cifras. Medimos TBT, LCP y su elemento, CLS, cobertura estimada sin usar y tiempos del hilo principal por URL. Verificamos que Recharts y Leaflet no se descarguen al inicio y que entren al consultar sus secciones. Optamos por perfiles de servidor y máscaras precalculadas, sin nuevas islas cliente, para conservar esa separación.
