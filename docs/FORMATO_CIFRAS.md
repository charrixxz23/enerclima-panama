# Política de presentación de cifras

## Alcance

Aplicamos el redondeo exclusivamente en la interfaz. Conservamos `web/public/data/dashboard.json`, los cuadernos y los scripts que generan los resultados. Usamos los valores completos para cálculos, selección de escenarios, posiciones de gráficos y colores.

Centralizamos la presentación en `web/lib/format.ts`. Usamos `Intl.NumberFormat("es-PA")` y normalizamos sus partes a coma decimal y punto de miles para cumplir los ejemplos del encargo. Documentamos esta adaptación porque el patrón nativo de es-PA en Intl suele usar otros separadores. No usamos `toFixed()` en componentes.

Adoptamos cuatro cifras significativas como criterio general para magnitudes auxiliares. Damos prioridad a las reglas específicas solicitadas: la demanda con un decimal puede conservar cinco cifras significativas, los conteos se muestran completos y las fechas y versiones no se tratan como mediciones.

| Magnitud | Regla | Ejemplo |
|---|---|---|
| Demanda y diferencias, MWh | Un decimal; si su magnitud es menor que uno, dos | 1.182,9; 199,8; 0,44 |
| Demanda en métricas grandes | Cero decimales | 1.183 MWh |
| Temperatura y umbrales | Un decimal siempre | 30,4 °C; 31,7 °C |
| Coeficiente e IC 95% | Dos decimales en ambos | 22,72; 18,33 a 27,11 |
| Porcentajes menores que diez | Dos decimales | 1,66%; 4,95% |
| Porcentajes desde diez | Un decimal | 10,0% |
| Porcentajes no nulos menores que 0,1 en magnitud | Dos cifras significativas | 0,037% |
| R² | Tres decimales | 0,977 |
| MAE y RMSE | Un decimal en toda la columna | 19,6; 27,7 |
| Conteos | Enteros con punto de miles | 48.048; 2.403; 33.516 |
| Correlaciones | Dos decimales y signo menos matemático cuando corresponde | 0,70; −0,02 |
| p-valores | Umbral si p < 0,001; tres decimales en el resto | p < 0,001; p = 0,009 |
| Fechas de partición | Fecha larga en español, sin conversión de día por zona horaria | 10 de enero de 2015 |

## Unidades, exactitud y accesibilidad

Separamos los valores y las unidades físicas con espacio duro U+00A0. Evitamos que un número y MWh, °C o MWh/°C queden en líneas distintas. Mantenemos el símbolo % junto al porcentaje, como en los ejemplos solicitados. En tablas con unidades declaradas en el encabezado no repetimos la unidad en cada celda.

Conservamos el valor completo de cada cifra abreviada en `data-exact` y en `title`. En las tablas de calidad con objetos o rangos guardamos su representación JSON completa en esos atributos. En las fechas conservamos la marca temporal original. Mostramos el p-valor completo en una nota, fuera del resultado abreviado.

Aplicamos números tabulares y de altura uniforme mediante `font-variant-numeric` y `font-feature-settings`. Source Sans 3 usa por defecto dígitos de igual anchura; comprobamos sus métricas y añadimos una comprobación en el navegador con los diez dígitos.

Limitamos a cinco las marcas de cada eje. Presentamos las marcas numéricas como enteros con separador de miles y los valores de tooltips con un decimal. Los datos que alimentan los trazos mantienen su precisión original. El reloj horario conserva cuatro referencias horarias y la tabla de todas las horas.

## Verificación

Probamos las funciones con `node:test` y valores reales del JSON, incluidos porcentajes muy pequeños, números negativos, límites de p, conteos y fechas. Contrastamos en navegador el texto mostrado con los atributos exactos, la unidad con espacio duro, las doce combinaciones de sensibilidad y los intervalos de las tres estaciones. Integramos `npm run test:unit` en GitHub Actions. En la verificación final aprobamos las 13 pruebas unitarias y las 10 pruebas de navegador; lint, tipos, build y exportación terminaron con código cero.

La dirección visual orgánica del Bloque B requiere aprobación aparte; este cambio modifica exclusivamente la presentación de cifras y su trazabilidad.
