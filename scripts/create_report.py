from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "entregables" / "Proyecto_Final_Munoz_Smith_Valdes_Bellamy_1SF132" / "Informe_Proyecto_Final_EnerClima_Panama.docx"
OUT.parent.mkdir(parents=True, exist_ok=True)
doc = Document()
section = doc.sections[0]
section.page_width = Inches(8.5)
section.page_height = Inches(11)
section.top_margin = Inches(0.8)
section.bottom_margin = Inches(0.75)
section.left_margin = Inches(1)
section.right_margin = Inches(1)

styles = doc.styles
normal = styles["Normal"]
normal.font.name = "Arial"
normal.font.size = Pt(12)
normal.font.color.rgb = RGBColor(0, 0, 0)
normal.paragraph_format.line_spacing = 1.5
normal.paragraph_format.space_after = Pt(5)
normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
for name, size in [("Title", 20), ("Heading 1", 15), ("Heading 2", 13)]:
    style = styles[name]
    style.font.name = "Arial"
    style.font.size = Pt(size)
    style.font.bold = True
    style.font.color.rgb = RGBColor(0, 0, 0)
    style.paragraph_format.space_before = Pt(8)
    style.paragraph_format.space_after = Pt(5)

footer = section.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = footer.add_run("Universidad Tecnológica de Panamá | Proyecto final de Ingeniería Ambiental | ")
run.font.name = "Arial"
run.font.size = Pt(8)
field = OxmlElement("w:fldSimple")
field.set(qn("w:instr"), "PAGE")
footer._p.append(field)


def para(text, boldlead=None):
    p = doc.add_paragraph()
    if boldlead and text.startswith(boldlead):
        p.add_run(boldlead).bold = True
        p.add_run(text[len(boldlead):])
    else:
        p.add_run(text)
    return p


def heading(text, level=1):
    return doc.add_heading(text, level=level)


def page(title):
    doc.add_page_break()
    heading(title)


def table(headers, rows, widths=None):
    t = doc.add_table(rows=1, cols=len(headers))
    t.style = "Table Grid"
    for i, value in enumerate(headers):
        cell = t.rows[0].cells[i]
        cell.text = value
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        for r in cell.paragraphs[0].runs:
            r.font.name = "Arial"
            r.font.size = Pt(9)
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)
        shd = OxmlElement("w:shd")
        shd.set(qn("w:fill"), "165C48")
        cell._tc.get_or_add_tcPr().append(shd)
    for row in rows:
        cells = t.add_row().cells
        for i, value in enumerate(row):
            cells[i].text = str(value)
            cells[i].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            for p in cells[i].paragraphs:
                p.paragraph_format.line_spacing = 1.0
                p.paragraph_format.space_after = Pt(2)
                for r in p.runs:
                    r.font.name = "Arial"
                    r.font.size = Pt(9)
    if widths:
        for row in t.rows:
            for i, width in enumerate(widths):
                row.cells[i].width = Inches(width)
    doc.add_paragraph()
    return t


def figure(filename, width=6.1, caption=""):
    path = ROOT / "results" / "figures" / filename
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(str(path), width=Inches(width))
    if caption:
        cp = doc.add_paragraph(caption)
        cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cp.paragraph_format.line_spacing = 1.0
        for r in cp.runs:
            r.font.size = Pt(9)


# portada
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(35)
r = p.add_run("UNIVERSIDAD TECNOLÓGICA DE PANAMÁ")
r.bold = True
r.font.name = "Arial"
r.font.size = Pt(16)
for line in ["Facultad de Ingeniería de Sistemas Computacionales", "Departamento de Computación y Simulación de Sistemas", "Ingeniería Ambiental | Grupo 1SF132"]:
    p = doc.add_paragraph(line)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.line_spacing = 1.2
p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(55)
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run("Análisis de la sensibilidad del consumo energético ante fluctuaciones microclimáticas y eventos de temperatura regional")
r.bold = True
r.font.name = "Arial"
r.font.size = Pt(20)
p = doc.add_paragraph("Informe del proyecto final")
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(15)
for line in ["Alejandro Muñoz", "Angie Valdés", "Richard Smith", "Abisai Bellamy", "", "Profesora: Vivian Valenzuela", "2026"]:
    p = doc.add_paragraph(line)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.line_spacing = 1.15

page("1. Introducción y planteamiento")
para("En este proyecto examinamos cómo las variaciones de temperatura registradas en tres puntos de Panamá coinciden con cambios en la demanda eléctrica nacional. Nos interesa esta relación porque el calor puede aumentar el uso de aire acondicionado y refrigeración, mientras el sistema eléctrico debe atender la demanda horaria sin perder confiabilidad. La información climática y energética permite describir ese vínculo y construir herramientas de análisis reproducible.")
para("Trabajamos con una serie horaria de demanda del Sistema Interconectado Nacional (SIN) y con variables meteorológicas de Tocumen, Santiago y David. La demanda cubre del 3 de enero de 2015 al 27 de junio de 2020. Conservamos el alcance nacional de la variable energética: no atribuimos a cada estación una demanda eléctrica regional porque los archivos no contienen mediciones de consumo por provincia o ciudad.")
para("Nuestro objetivo general consiste en evaluar la sensibilidad descriptiva y predictiva de la demanda nacional ante la temperatura observada en esas estaciones. Para ello auditamos la continuidad de los datos, analizamos eventos térmicos por percentil, estimamos asociaciones ajustadas y comparamos modelos con particiones temporales. Luego implementamos un observatorio web que comunica los resultados con cautelas y un cuaderno que permite repetir el análisis.")
para("La pregunta central es cuánto aportan la temperatura y el historial reciente de demanda a la estimación horaria dentro del periodo evaluado. Separamos asociación, predicción y escenario simulado, pues cada procedimiento responde a una pregunta distinta y tiene límites propios.")

page("2. Justificación, objetivos y alcance")
para("Seleccionamos este problema porque relaciona una presión ambiental observable, el aumento de temperatura, con una necesidad social y operativa, atender la electricidad. En un clima tropical, la demanda de enfriamiento puede influir en los perfiles de carga. La literatura internacional relaciona el uso de aire acondicionado con el crecimiento del consumo eléctrico y con mayores exigencias para las redes (IEA, s. f.). El IPCC también documenta cambios de temperatura y extremos de calor en América Central y del Sur (IPCC, 2022). Estos antecedentes motivan el análisis, pero no sustituyen evidencia local.")
heading("Objetivos específicos", 2)
para("Auditamos la estructura temporal, la integridad y los rangos; caracterizamos la demanda y la temperatura; comparamos modelos con validación y prueba temporal; describimos horas por encima del percentil 95; estimamos asociaciones ajustadas por calendario; y simulamos aumentos de temperatura dentro del rango observado.")
para("Limitamos las conclusiones a los datos horarios de 2015–2020 y a las estaciones incluidas. El trabajo no estima emisiones, consumo de aire acondicionado, demanda por región, costos económicos ni cambios futuros del clima. Tampoco representa un sistema de despacho en tiempo real, porque las entradas meteorológicas corresponden a observaciones de la misma hora que la demanda objetivo.")
para("La propuesta inicial planteó comparar Tocumen, Santiago y David y estudiar eventos cálidos. Conservamos ese enfoque, pero reformulamos el alcance para no presentar la demanda nacional como regional ni afirmar causalidad a partir de datos observacionales.")

page("3. Marco teórico y antecedentes")
para("La demanda eléctrica es una serie temporal con patrones diarios, semanales, estacionales y episodios atípicos. La temperatura puede modificar el uso de enfriamiento y coincidir con cambios en la demanda, pero también comparte patrones con la hora, la estación del año y la actividad humana. Por eso una correlación simple no identifica por sí sola el mecanismo ni su magnitud causal.")
para("Los modelos de aprendizaje automático pueden combinar variables temporales, meteorológicas y valores previos de demanda para aproximar relaciones no lineales. Un modelo de árboles, como Random Forest, particiona el espacio de variables y promedia muchos árboles. Puede representar umbrales e interacciones, aunque su respuesta a aumentos de temperatura suele ser escalonada y depende del rango de entrenamiento.")
para("Para evaluar series temporales usamos una partición cronológica: entrenamos con el periodo inicial, seleccionamos el modelo en una ventana posterior de validación y medimos el desempeño en el tramo final de prueba. Así evitamos mezclar observaciones futuras en el entrenamiento. Comparamos el error absoluto medio (MAE), la raíz del error cuadrático medio (RMSE), el error porcentual absoluto medio (MAPE) y R². Cada indicador resume aspectos distintos y no convierte el desempeño de prueba en garantía para otros periodos.")
para("El percentil 95 sirve como umbral relativo a la distribución de cada estación. No equivale a una alerta oficial de salud ni a un umbral físico universal. La regresión con covarianza HAC permite ajustar errores estándar ante autocorrelación y heterocedasticidad. Sus coeficientes siguen siendo asociaciones condicionadas al modelo y a las variables disponibles.")

page("4. Datos y auditoría de calidad")
para("Usamos el conjunto de pronóstico de carga de corto plazo de Panamá distribuido por IEEE PES Data Sharing Task Force y descrito por Aguilar Madrid y Antonio (2021). También conservamos como procedencia la versión del conjunto en Mendeley Data. El archivo continuo contiene 48,048 observaciones y 17 columnas. La demanda nacional está documentada en MWh por intervalo horario. Las variables de clima incluyen temperatura, humedad específica, agua líquida precipitable y velocidad del viento en tres estaciones, junto con indicadores de feriado y periodo escolar.")
table(["Comprobación", "Resultado"], [["Periodo", "2015-01-03 01:00 a 2020-06-27 00:00"], ["Frecuencia", "1 hora; sin intervalos faltantes"], ["Fechas duplicadas", "0"], ["Nulos e infinitos", "0"], ["Pronóstico semanal", "40,152 filas; cobertura histórica 97.91%"]], [2.1, 4.1])
para("El cribado con límites físicos amplios no registró valores fuera de rango, aunque identificamos seis observaciones de demanda inferiores a 500 MWh entre las 12:00 y las 17:00 del 20 de enero de 2019. Los valores van de 85.19 a 417 MWh. El patrón amerita validación con la fuente original, pero no tenemos evidencia que permita reemplazarlo. Lo conservamos y lo reportamos como posible anomalía, de modo que el procesamiento no oculte la incertidumbre.")
para("La ficha del conjunto etiqueta QV2M como humedad relativa y TQL como precipitación líquida. La documentación de NASA define QV2M como humedad específica a 2 m en kg/kg, y TQL como agua líquida precipitable total en columna en kg/m². Los valores QV2M cercanos a 0.01–0.02 respaldan la primera interpretación. Registramos la discrepancia y conservamos los valores sin conversión.")

page("5. Herramientas y método")
para("Desarrollamos el flujo con Python, pandas, NumPy, scikit-learn, statsmodels y Matplotlib. El cuaderno Jupyter ejecuta la canalización desde rutas relativas. Construimos el sitio con Next.js, TypeScript y Recharts, y publicamos únicamente métricas agregadas y series resumidas. Así mantenemos separados los datos originales y los resultados web.")
para("Primero analizamos continuidad horaria, duplicados, faltantes, tipos y rangos. Después construimos variables de hora, calendario, seno y coseno cíclicos, y rezagos de demanda. Usamos 70% inicial para entrenamiento, 15% para validación y 15% final para prueba. La selección se basó en RMSE de validación. Para la evaluación principal usamos predicciones rodantes de un paso, con valores históricos y clima observado en la hora objetivo.")
para("Comparamos Random Forest con regresión lineal, una referencia semanal ingenua y regresiones que excluyen historia o clima. Calculamos asociaciones con una regresión que controla hora, día de semana, mes, año, feriado y escuela, incorpora simultáneamente las tres temperaturas y usa errores HAC con 24 rezagos horarios.")
para("Definimos eventos térmicos usando el percentil 95 histórico por estación y comparamos las medias horarias de demanda durante esas horas con el resto. Para sensibilidad perturbamos la temperatura en el conjunto de prueba en incrementos de 1, 2 y 3 °C, mantuvimos fijas las demás variables y excluimos casos que superaban el percentil 99 observado. Evaluamos aparte el pronóstico semanal de predespacho en las 14 ventanas oficiales de 168 horas.")

page("6. Caracterización y eventos térmicos")
para("La demanda media fue 1,182.87 MWh por intervalo horario y la mediana 1,168.43 MWh. El máximo llegó a 1,754.88 MWh y el mínimo a 85.19 MWh, que corresponde al episodio bajo señalado para revisión. Los perfiles varían por hora y calendario, lo cual justifica incluir patrones temporales en los modelos.")
figure("temperatura_regional.png", 5.8, "Figura 1. Temperatura diaria media con ventana móvil de 14 días en las tres estaciones. Fuente: conjunto entregado al grupo.")
para("El percentil 95 de temperatura fue 30.41 °C en Tocumen, 33.07 °C en Santiago y 29.48 °C en David. Cada estación registró 2,403 horas por encima de su umbral, aunque esas horas se distribuyeron en distinta cantidad de días. Durante esas horas, la demanda nacional media superó la media del resto en aproximadamente 199.81 MWh para Tocumen, 197.20 MWh para Santiago y 200.83 MWh para David.")
para("Estas diferencias son descriptivas. Las mismas horas también difieren en calendario, actividad y condiciones compartidas. No afirmamos que la temperatura causara el incremento ni que la cifra represente consumo local de cada estación.")

page("7. Modelos y desempeño")
para("La partición de entrenamiento tuvo 33,516 filas útiles, validación 7,182 y prueba 7,182. El mejor modelo con clima en validación fue Random Forest con historia de demanda, calendario y meteorología. Su RMSE de validación fue 31.75 MWh por intervalo. La prueba abarcó del 1 de septiembre de 2019 al 27 de junio de 2020.")
table(["Modelo en prueba", "MAE", "RMSE", "MAPE", "R²"], [["Random Forest + historia + clima", "19.61", "27.72", "1.66%", "0.977"], ["Regresión + historia + clima", "29.41", "38.33", "2.48%", "0.957"], ["Referencia semanal", "71.27", "99.23", "5.95%", "0.711"], ["Regresión + clima, sin historia", "119.13", "147.29", "10.03%", "0.364"], ["Regresión temporal", "124.73", "153.12", "10.45%", "0.312"]], [2.8, 0.8, 0.8, 0.9, 0.8])
para("El modelo con historia reciente obtuvo menor error que las referencias dentro de esta prueba. La diferencia entre la regresión con clima e historia y la regresión con clima sin historia indica que los rezagos aportan información predictiva importante. No aislamos una contribución causal del clima con esta comparación porque los modelos también difieren en estructura y variables.")
para("El pronóstico semanal de predespacho original, evaluado en las mismas 14 semanas oficiales, obtuvo MAE 59.20 MWh, RMSE 74.03 MWh, MAPE 4.95% y R² 0.845 en 2,352 observaciones. Lo reportamos como evaluación separada, pues su horizonte de 168 horas no es directamente comparable con la predicción rodante de un paso.")

page("8. Asociaciones ajustadas y sensibilidad")
para("En la regresión ajustada, la asociación de Tocumen fue +22.72 MWh por °C (IC 95%: 18.33 a 27.11); la de Santiago fue −4.37 (−7.63 a −1.11); y la de David +5.29 (1.13 a 9.44). Las tres temperaturas ingresan simultáneamente y pueden estar correlacionadas. El signo negativo de Santiago evidencia que los coeficientes condicionados no deben leerse como efectos físicos aislados. No derivamos causalidad.")
figure("sensibilidad_temperatura.png", 5.8, "Figura 2. Cambio modelado en la demanda estimada ante perturbaciones de temperatura.")
para("Al aumentar juntas las tres temperaturas en 1, 2 y 3 °C, el Random Forest estimó cambios medios de +0.97, +1.52 y +1.68 MWh por intervalo, respectivamente, sobre las referencias válidas del conjunto de prueba. Para cada escenario mantuvimos fijas las otras variables y limitamos los casos que excedían el percentil 99 observado. El aumento no es lineal porque los árboles responden por escalones y la perturbación se aplica a observaciones existentes.")
para("Estos escenarios expresan la respuesta interna del modelo en datos disponibles, no una proyección climática ni una respuesta causal de la población o del sistema eléctrico. La pequeña magnitud también aconseja no convertir el resultado en una recomendación operativa sin nuevas pruebas y variables explicativas.")

page("9. Herramienta y discusión")
para("Implementamos un observatorio web con secciones de resumen, mapa, eventos, modelos, sensibilidad, investigación y metodología. Las cifras se generan a partir del análisis y se exportan como agregados. El mapa ubica de forma aproximada las ciudades de referencia, no los puntos de celda de las observaciones meteorológicas. La imagen de portada se identifica como ilustrativa y generada con inteligencia artificial.")
para("El cuaderno Jupyter reproduce auditoría, tablas y figuras desde rutas relativas, tanto en una carpeta local como en Google Colab si mantenemos la estructura del proyecto. El código y el README indican que los datos originales deben suministrarse por separado. Esto evita publicar archivos cuya licencia de redistribución no logramos verificar y mantiene privados los documentos de clase y los identificadores estudiantiles.")
para("Los resultados coinciden con la literatura en que el clima ofrece contexto útil para estudiar la carga, pero nuestro diseño mide una relación observacional y retrospectiva. La precisión alta del modelo depende en gran medida de historia reciente y no acredita un pronóstico futuro disponible antes del periodo. Para operación real harían falta pronósticos meteorológicos, validaciones por temporada, controles de cambios estructurales y pruebas externas.")
para("También recomendamos confirmar con la fuente el episodio de demanda baja y aclarar por escrito las etiquetas de QV2M y TQL. Antes de un uso operativo, convendría obtener datos de demanda por región, información sobre actividad y enfriamiento, y comparar el modelo con procedimientos vigentes del CND usando horizontes y fechas idénticos.")

page("10. Conclusiones")
para("Auditamos 48,048 registros horarios entre 2015 y 2020 y no encontramos fechas faltantes, duplicadas ni valores nulos. Identificamos seis observaciones bajas que requieren verificación, pero las conservamos para no alterar la fuente. Documentamos la diferencia entre las etiquetas del paquete para QV2M y TQL y las definiciones oficiales de NASA.")
para("En las horas por encima del percentil 95 de cada estación, la demanda nacional media fue cerca de 197–201 MWh mayor que en el resto de las horas. Los coeficientes ajustados variaron entre las estaciones, incluso cambiaron de signo. Interpretamos ambos resultados con cautela porque son observacionales, las temperaturas se correlacionan y la demanda disponible es nacional.")
para("El Random Forest con historia, calendario y clima superó las referencias incluidas durante la prueba temporal, con MAE de 19.61 MWh y RMSE de 27.72 MWh. La evaluación del pronóstico de predespacho muestra otra tarea y otro horizonte. Los escenarios de temperatura produjeron cambios modelados modestos y escalonados, que no constituyen causalidad ni pronósticos oficiales.")
para("Concluimos que la herramienta puede apoyar el análisis exploratorio y la comunicación de datos. Para avanzar hacia una aplicación ambiental y energética, debemos aclarar unidades, validar anomalías, incorporar pronósticos meteorológicos y evaluar datos desagregados y horizontes operativos. El cuaderno y el sitio hacen visibles resultados, supuestos y límites para que el grupo pueda reproducirlos y explicarlos.")

page("Referencias")
for citation in [
    "IEEE PES Data Sharing Task Force. (s. f.). Short-term electricity load forecasting: Panama dataset. https://ieee-pes-data-sharing.org/datasets/detail/e40ed690-2469-4c83-bfc2-ed868fe6df50",
    "Aguilar Madrid, E., y Antonio, N. (2021). Short-Term Electricity Load Forecasting with Machine Learning. Information, 12(2), 50. https://doi.org/10.3390/info12020050",
    "Aguilar Madrid, E. (2021). Short-Term Electricity Load Forecasting (Panama Case Study), Version 1 [conjunto de datos]. Mendeley Data. https://doi.org/10.17632/byx7sztj59.1",
    "NASA Goddard Earth Sciences Data and Information Services Center. (s. f.). MERRA File Specification. https://gmao.gsfc.nasa.gov/media/gmao_products/IqPeIBhIWLGrweILfVPj9Vmdoc/MERRA_File_Specification.pdf",
    "NASA Langley Research Center. (s. f.). POWER API: Data parameters. https://power.larc.nasa.gov/docs/services/api/projection/",
    "Intergovernmental Panel on Climate Change. (2022). Climate Change 2022: Impacts, Adaptation and Vulnerability, Chapter 12: Central and South America. https://www.ipcc.ch/report/ar6/wg2/chapter/chapter-12/",
    "International Energy Agency. (s. f.). The Future of Cooling. https://www.iea.org/reports/the-future-of-cooling",
    "Centro Nacional de Despacho, ETESA. (s. f.). Estadísticas del Sistema Interconectado Nacional. https://www.cnd.com.pa/index.php/estadisticas",
    "Centro Nacional de Despacho, ETESA. (2020). Comportamiento de la demanda durante el COVID-19. https://www.etesa.com.pa/es/noticias/comportamiento-la-demanda-durante-el-covid-19-mar",
    "National Oceanic and Atmospheric Administration, Atlantic Oceanographic and Meteorological Laboratory. (2010). Hurricane Forecast Project 2010: station coordinates. https://www.aoml.noaa.gov/hrd/HFP2010/HFP2010_part2.pdf",
]:
    p = para(citation)
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_after = Pt(5)

doc.save(OUT)
print(OUT)
