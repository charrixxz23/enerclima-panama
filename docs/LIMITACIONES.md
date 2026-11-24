# Limitaciones del análisis

1. La demanda representa el Sistema Interconectado Nacional. No contamos con consumo por provincia o por estación meteorológica.
2. El paquete indica MWh por intervalo horario. No convertimos la demanda a potencia MW.
3. La ficha incluida describe QV2M como humedad relativa y TQL como precipitación. NASA define QV2M como humedad específica (kg/kg) y TQL como agua líquida precipitable en columna (kg/m²). Conservamos los datos sin conversión y señalamos la discrepancia.
4. Seis observaciones de demanda menores que 500 MWh entre 12:00 y 17:00 del 20 de enero de 2019 requieren verificación con la fuente. Las conservamos.
5. El modelo principal predice un paso rodante con historia reciente de demanda y meteorología observada en la hora objetivo. Sus métricas no representan un pronóstico disponible antes de esa hora.
6. La selección del modelo usa RMSE de validación y la prueba es cronológica. Aun así, el periodo termina en junio de 2020 y puede no representar condiciones actuales.
7. Las asociaciones ajustadas son observacionales, las temperaturas locales pueden estar correlacionadas y no inferimos causalidad.
8. Los eventos P95 se definen por estación y por el histórico completo para describir episodios. No son umbrales oficiales de salud o alerta.
9. Las simulaciones de temperatura fijan los demás predictores, limitan los casos al percentil 99 observado y usan un modelo de árboles. No son pronósticos climáticos ni respuestas físicas del sistema.
10. El pronóstico semanal del archivo original cubre 14 ventanas oficiales de 168 horas. Lo evaluamos aparte de las métricas rodantes de una hora.
11. La ficha pública del dataset no permitió confirmar una licencia para redistribuir los datos originales. El repositorio excluye las entradas fuente y los documentos académicos privados.
12. Las ubicaciones del mapa son aproximaciones de las ciudades, no coordenadas verificadas de las celdas meteorológicas.

## Recomendaciones para ampliar

Confirmamos los valores bajos con el proveedor, aclaramos las unidades con la documentación original, añadimos pronósticos meteorológicos históricos y demanda desagregada, y probamos ventanas adicionales con cambios estructurales y métricas operativas acordadas con el CND.
