# Referencias verificadas

1. IEEE PES Data Sharing Task Force. *Short-term electricity load forecasting: Panama dataset*. https://ieee-pes-data-sharing.org/datasets/detail/e40ed690-2469-4c83-bfc2-ed868fe6df50. Consultado el 24 de noviembre de 2026. Usamos la ficha para identificar la distribución del conjunto y su contexto de pronóstico de demanda.

2. Aguilar Madrid, E., y Antonio, N. (2021). *Short-Term Electricity Load Forecasting with Machine Learning*. Information, 12(2), 50. https://doi.org/10.3390/info12020050. Consultado el 24 de noviembre de 2026. Este artículo presenta el estudio de pronóstico semanal de 168 horas asociado a los datos de Panamá.

3. Aguilar Madrid, E. (2021). *Short-Term Electricity Load Forecasting (Panama Case Study), Version 1* [conjunto de datos]. Mendeley Data. https://doi.org/10.17632/byx7sztj59.1. Consultado el 24 de noviembre de 2026. Usamos la referencia como documentación del conjunto original.

4. NASA Goddard Earth Sciences Data and Information Services Center. *MERRA File Specification*. https://gmao.gsfc.nasa.gov/media/gmao_products/IqPeIBhIWLGrweILfVPj9Vmdoc/MERRA_File_Specification.pdf. Consultado el 24 de noviembre de 2026. Usamos la especificación para verificar los códigos meteorológicos QV2M y TQL.

5. NASA Langley Research Center. *POWER API: Data parameters*. https://power.larc.nasa.gov/docs/services/api/projection/. Consultado el 24 de noviembre de 2026. Fuente complementaria para nombres y unidades de las variables meteorológicas.

6. Intergovernmental Panel on Climate Change. *Climate Change 2022: Impacts, Adaptation and Vulnerability, Chapter 12: Central and South America*. https://www.ipcc.ch/report/ar6/wg2/chapter/chapter-12/. Consultado el 24 de noviembre de 2026. Contexto regional sobre calentamiento y extremos de temperatura.

7. International Energy Agency. *The Future of Cooling*. https://www.iea.org/reports/the-future-of-cooling. Consultado el 24 de noviembre de 2026. Contexto general sobre la demanda eléctrica asociada al enfriamiento.

8. Centro Nacional de Despacho, ETESA. *Estadísticas del Sistema Interconectado Nacional*. https://www.cnd.com.pa/index.php/estadisticas. Consultado el 24 de noviembre de 2026. Portal de estadísticas operativas nacionales.

9. Centro Nacional de Despacho, ETESA. *Comportamiento de la demanda durante el COVID-19*. https://www.etesa.com.pa/es/noticias/comportamiento-la-demanda-durante-el-covid-19-mar. Consultado el 24 de noviembre de 2026. Contexto sobre la evolución diaria y los cambios de demanda en 2020.

10. National Oceanic and Atmospheric Administration, Atlantic Oceanographic and Meteorological Laboratory. *Hurricane Forecast Project 2010: station coordinates*. https://www.aoml.noaa.gov/hrd/HFP2010/HFP2010_part2.pdf. Consultado el 24 de noviembre de 2026. Usamos las coordenadas de referencia aeroportuaria para ubicar las ciudades. El material entregado no identifica coordenadas exactas de las celdas meteorológicas.

## Nota sobre las unidades meteorológicas

El PDF de metadatos adjunto al conjunto describe QV2M como humedad relativa y TQL como precipitación líquida. La documentación NASA consultada define QV2M como humedad específica a 2 m (kg/kg) y TQL como agua líquida precipitable total en columna (kg/m²). Los valores QV2M observados, cercanos a 0.01–0.02, son coherentes con humedad específica. Conservamos los datos originales y hacemos explícita la discrepancia sin convertir ni reinterpretar sus valores como lluvia o nubosidad.

## Licencia y distribución

La ficha consultada permite ubicar el conjunto en el repositorio de IEEE PES, pero no verificamos una licencia que autorice redistribuir los archivos originales. Por ello, el repositorio del proyecto excluye los datos fuente y los documentos académicos privados. Los resultados agregados, scripts y gráficos se incluyen para explicar y reproducir el análisis cuando el usuario posee los archivos originales.
