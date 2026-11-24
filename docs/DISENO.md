# Sistema visual de EnerClima Panamá

## Alcance del Bloque B · fase 1

Implementamos el sistema tipográfico, el papel cálido y el campo conjunto de demanda y temperatura. Conservamos los nueve anclajes, el rigor científico y la exportación estática bajo `/enerclima-panama`. Completamos sus contornos, tres desbordes y anotaciones en la fase 2, descrita al final de este documento.

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

Implementamos la escala irregular, los límites curvos, los tres elementos que cruzan el margen y la anotación guiada por datos en la fase 2. Reservamos la renovación final de los recursos de metadatos para la fase siguiente. Comprobamos los mismos límites móviles antes de cerrar cada fase.

## Verificación de la fase 1

Conservamos los registros completos de lint, tipos, build, exportación y navegador en `evidencias/rediseno/bloque-b-fase-1-*.txt`. Conservamos también las mediciones Lighthouse, las capturas y las mediciones iniciales que motivaron la corrección de proporciones. Comparamos la mediana móvil pública con la referencia inmediatamente anterior de **90**, manteniendo OneDrive activo. Cerramos esta fase únicamente después de comprobar que no disminuya.

En la comprobación local final obtuvimos rendimiento 91, 91 y 94 (mediana 91) y 100 en accesibilidad, buenas prácticas y SEO. Conservamos las corridas iniciales de rendimiento 100 y buenas prácticas 96, junto con la corrección de proporciones. No sustituimos con estas mediciones locales la comparación pública con la referencia 90.

## Diagnóstico antes de abrir la fase 2

Entregamos el [diagnóstico público por métrica y script](RENDIMIENTO_ANTES_FASE2.md), con su JSON de cifras. Medimos TBT, LCP y su elemento, CLS, cobertura estimada sin usar y tiempos del hilo principal por URL. Verificamos que Recharts y Leaflet no se descarguen al inicio y que entren al consultar sus secciones. Optamos por perfiles de servidor y máscaras precalculadas, sin nuevas islas cliente, para conservar esa separación.


## Revisión previa y referencia de la fase 2

Resolvemos los cinco puntos de revisión antes de abrir esta fase. Conservamos el diagnóstico de la fase 1 en RENDIMIENTO_ANTES_FASE2.md y registramos la medición posterior a las correcciones en [RENDIMIENTO_REVISION_PREVIA.md](RENDIMIENTO_REVISION_PREVIA.md), commit `1697177`. En esta última obtenemos rendimiento 94, 92 y 89, mediana **92**, que pasa a ser la referencia obligatoria. Registramos TBT de 349 ms, LCP de 1.050 ms sobre el h1, CLS de 0 y 61.997 B de JavaScript estimado sin usar. Recharts y Leaflet siguen aportando 0 B y 0 ms a la carga inicial; no los confundimos con el trabajo de React DOM y Next.

## Bloque B · fase 2: perfiles y secciones entrelazadas

Derivamos ocho perfiles de `temperaturaRegional` de dashboard.json, sin alterar ese archivo. La serie contiene medias semanales muestreadas cada dos semanas: el generador original usa `resample("W").mean()` y luego `iloc[::2]`. No las presentamos como medias de dos semanas ni como datos horarios. Elegimos explícitamente estación y periodo para cada sección:

| Sección | Estación | Periodo | Puntos | Primera y última fecha |
|---|---|---|---:|---|
| observatorio | Tocumen | completo | 144 | 2015-01-04 → 2020-06-28 |
| clima | Santiago | completo | 144 | 2015-01-04 → 2020-06-28 |
| eventos | David | completo | 144 | 2015-01-04 → 2020-06-28 |
| modelos | Santiago | validacion | 21 | 2018-11-18 → 2019-08-25 |
| sensibilidad | Tocumen | prueba | 21 | 2019-09-08 → 2020-06-14 |
| investigacion | David | entrenamiento | 100 | 2015-01-18 → 2018-11-04 |
| metodologia | Santiago | entrenamiento | 100 | 2015-01-18 → 2018-11-04 |
| equipo | David | prueba | 21 | 2019-09-08 → 2020-06-14 |

Compartimos el dominio vertical de las tres estaciones completas, de 23,1 a 30,3 °C; conservamos sus extremos exactos en `temporal-profiles.json`. Normalizamos la fecha de cada periodo a 0–1. No usamos estas formas para comparar duraciones entre periodos. Usamos toda la serie regional en Observatorio, Clima y Eventos, la ventana de validación en Modelos y la de prueba en Sensibilidad. Retomamos entrenamiento en Investigación y Metodología y prueba en Equipo como cierre visual; no atribuimos una variable climática al equipo humano. Las etiquetas declaran siempre estación, periodo, conteo y rango.

Unimos los puntos con cúbicas monótonas limitadas para evitar nuevos extremos entre muestras. Conservamos la amplitud relativa entre estaciones con el dominio común. Reflejamos la curva únicamente en el cierre inferior de la sección; ese reflejo es composición y no una segunda serie observada. No llamamos isotermas a estos perfiles.

Generamos SVG externos con clipPath real y los utilizamos como máscaras CSS para recortar la superficie y dibujar su borde. No añadimos miles de nodos al DOM, nuevas bibliotecas ni componentes cliente. Producimos tablas HTML estáticas con todas las fechas y valores completos, enlazadas desde cada figura en details, dentro de iframe nativo con loading="lazy". Comprobamos que las ocho tablas no se soliciten en la carga inicial y que, al abrirlas, sus filas y valores coincidan con el JSON original. Aplicamos los formateadores centrales y conservamos data-exact y title.

Regeneramos las 24 piezas SVG, las ocho tablas y el manifiesto desde la raíz con:

```sh
node web/scripts/build-temporal-profiles.mjs
```

Ejecutamos también el generador automáticamente en prebuild. Registramos el SHA-256 de dashboard.json: `bbe505c36a73ce31cb1030341ec46260eba9c46665fad2ec0a4cb2981a34fd17`. Conservamos el trazado en tinta; la rampa térmica permanece reservada a valores de temperatura.

Entrelazamos el reloj radial entre Observatorio y Clima, con 64 px de solapamiento en escritorio y un ancho máximo 160 px mayor que la columna central. Extendemos el campo del hero hasta el margen de 16 px de la ventana y colgamos la cifra de 2.403 h a la izquierda de la columna desde 1.920 px. Estos son los tres elementos que rompen el margen central. Repetimos el perfil de Tocumen por detrás de la navegación y mantenemos una base de papel bajo sus enlaces. Permitimos pintura vertical del main y recortamos solo su eje horizontal: no escondemos esa continuación con overflow:clip en ambos ejes.

Vinculamos la anotación de Tocumen a las 2.403 horas sobre 30,4 °C del registro de Eventos, con aria-describedby y una guía arqueada cuyo extremo llega al conteo. No añadimos una nueva interpretación causal. En móvil devolvemos el reloj y la anotación al flujo, ocultamos la guía y retiramos el desplazamiento del titular. Verificamos 360, 390 y 768 px y extendemos la prueba a 1.024, 1.440, 1.920 y 2.560 px; comprobamos el contenido después de recorrer todos los anclajes.

Elegimos 80 px de espacio interior ordinario en escritorio, 48 px en Eventos y 128 px en Metodología. Hacemos Eventos más compacto para leer sus umbrales juntos y damos a Metodología más pausa para sus criterios y limitaciones. En móvil reducimos esos espacios a 48, 32 y 64 px, respectivamente. Diferenciamos también la altura de sus curvas: 128, 80 y 160 px en escritorio. No uniformamos todas las secciones ni usamos alturas elegidas al azar.

Conservamos foco visible, jerarquía de encabezados, tablas y movimiento reducido. Mantenemos el contorno legible sobre ambas superficies y damos al texto térmico del umbral un fondo de papel para conservar el contraste 4,70:1. Usamos content-visibility en las secciones fuera de pantalla; imprimimos su contenido completo. Continuamos exclusivamente con tema claro.


### Corrección de la puerta pública de la fase 2

Conservamos la primera medición de cb4f658 en [RENDIMIENTO_FASE2_INICIAL.md](RENDIMIENTO_FASE2_INICIAL.md): 88, 87 y 87, mediana 87 frente a la referencia obligatoria de 92. Medimos TBT de 526 ms, LCP de 1.027 ms, CLS 0 y 62.081 B estimados sin usar. No damos esa medición por aprobada ni reducimos la referencia a 87. También detectamos contraste insuficiente en el pie del reloj cuando la auditoría lo cruza con la máscara de Clima.

Ante ese resultado priorizamos la optimización antes de cerrar la fase. Sustituimos next/image por img nativo dentro del mismo picture estático; conservamos todas sus fuentes, dimensiones y prioridades y retiramos una frontera cliente innecesaria. Generamos las cabeceras inmutables de los perfiles como HTML durante prebuild y las insertamos como bloques opacos para React. Escapamos los valores de la tabla y construimos las cabeceras únicamente con nombres constantes y cifras finitas del JSON conservado; no insertamos HTML de usuarios.

Mantenemos cada iframe dentro de template, sin crear su contexto de navegación al inicio. El componente Motion existente escucha la apertura nativa de details e inserta la tabla una sola vez. Ejecutamos esa mejora incluso con movimiento reducido; esa preferencia solo desactiva la animación. No añadimos otra isla cliente. Conservamos el enlace directo a cada tabla como alternativa si JavaScript está desactivado. Probamos que inicialmente no existan iframes activos ni solicitudes de esas tablas y que sus filas completas aparezcan al abrirlas.

Damos una base de papel al pie y al resumen del reloj para conservar el contraste al cruzar las curvas. Conservamos las primeras corridas, la corrección y las mediciones posteriores con sus prefijos separados en evidencias/rediseno. Volvemos a exigir una mediana pública de al menos 92, con OneDrive activo.


En la comprobación local de esta corrección obtenemos TBT de 294 ms, LCP de 960 ms, rendimiento 94 y accesibilidad 100, con cinco scripts iniciales frente a seis. No sustituimos con esta corrida la mediana pública de tres mediciones. Conservamos esa comparación como puerta final.


La corrección 9cd5d8a eleva la mediana pública a 91, con TBT de 369 ms y accesibilidad 100, pero aún no aprueba la referencia 92. Conservamos [el diagnóstico intermedio](RENDIMIENTO_FASE2_INTERMEDIO.md). Reducimos además la navegación y los encabezados inmutables a bloques HTML opacos, escapando todo su texto. Retiramos el estado React del índice móvil y conservamos su apertura, cierre, foco y atributos ARIA mediante el controlador existente. No diferimos todo el arranque para ocultar trabajo a Lighthouse ni sustituimos la puerta pública por la corrida local.


## Verificación pública final de la fase 2

Medimos el código 9da5bed con tres corridas públicas: rendimiento 96, 93 y 91, mediana **93**, frente a la referencia 92. Obtenemos accesibilidad, buenas prácticas y SEO 100 en todas. Registramos TBT mediano de 306 ms, LCP de 1.064,8 ms sobre el h1 y CLS 0. Conservamos [las cifras por corrida y CPU por URL](RENDIMIENTO_FASE2.md), con su JSON, los dos diagnósticos fallidos anteriores y todos los informes originales. Conservamos la meta de 95 como pendiente y fijamos 93 como referencia inmediata para la siguiente fase. Mantenemos OneDrive activo.

Aprobamos 22 pruebas unitarias y 13 pruebas locales de navegador, las cinco comprobaciones de compilación y las 13 pruebas completas contra GitHub Pages. Comprobamos las siete anchuras, el formato exacto, las tablas, el índice móvil con movimiento reducido y la ausencia de librerías de gráficos al inicio. Probamos además que Escape cierre el índice y devuelva el foco al botón.

Comprobamos el peso real publicado en Linux por visitante: AVIF móvil 12.219 B, escritorio 30.839 B y ancho 66.736 B. La alternativa más pesada es WebP ancho, 112.090 B frente al máximo de 120.000 B. No sumamos las seis variantes. Conservamos las vistas previas bajo 250 KB y el tema exclusivamente claro.

El commit de cierre documental conserva exactamente el árbol web del código medido. No añadimos otra pieza visual después de estas corridas. Reservamos la revisión final de los recursos de metadatos para la fase siguiente del plan.


## Ajuste visual según la propuesta

Tomamos la lámina «EnerClima Panamá — propuesta visual» como referencia visual solicitada: cabecera y portada azul petróleo, acento naranja, titular editorial, campo de datos en segundo plano, tarjeta explicativa y banda de métricas superpuesta. Recompusimos Eventos con una lectura grande de la diferencia descriptiva y las tres estaciones debajo. Conservamos el contenido y el muestreo del campo existentes, las cifras del conjunto original, las advertencias de no causalidad y los contrastes aprobados. Conservamos el resto del sitio en papel claro y el alcance exclusivamente claro; el color de acento de la portada no reemplaza ni extiende la rampa térmica.

Adaptamos la composición para móvil: mantenemos la tarjeta explicativa y las métricas en el flujo, reorganizamos el índice y apilamos la lectura de Eventos sin recortar valores. Regeneramos la vista previa del README para que represente la página corregida. Medimos las vistas previas después de regenerarlas: portada AVIF 35.760 B, portada WebP 42.578 B, simulador AVIF 41.066 B y simulador WebP 46.800 B; cada recurso queda bajo 250 KB. Mantenemos el tema exclusivamente claro, sin modo oscuro.
