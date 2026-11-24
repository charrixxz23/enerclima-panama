# Auditoría final del proyecto

## Material recibido

Inspeccionamos recursivamente el directorio de trabajo. Encontramos `archive.zip`, el PDF con las indicaciones de la profesora y el PDF de la propuesta inicial. No encontramos referencias visuales ni plantillas adicionales. Leímos los documentos y guardamos copias de texto privadas para consulta. Descomprimimos el ZIP en `data/raw/` sin modificar los originales.

La consigna pide un proyecto grupal de Ingeniería Ambiental con TIC, un video de 4–6 minutos, un informe de 8–12 páginas en Arial 12 e interlineado 1.5, y una presentación basada en el informe con participación de todos. La fecha depende del examen semestral; la consigna no especifica un día calendario. La matriz documenta el cumplimiento y los pasos que el grupo aún debe completar.

## Entorno y ejecución

Comprobamos Python 3.12.10, Node.js 24.22.1, npm 11.19.1, Git 2.55.0 y Jupyter. Vercel CLI no estaba instalado. Creamos el entorno virtual de Python en `%LOCALAPPDATA%\\EnerClima-Panama-venv` y ubicamos las dependencias web fuera de OneDrive. El código construye rutas relativas desde el proyecto.

La web pasó lint, revisión de tipos, compilación de producción, cuatro pruebas de navegador y auditoría de dependencias de producción. Las capturas responsivas no muestran desbordamiento horizontal en 390, 768, 1024 ni 1440 píxeles. El cuaderno se ejecutó de principio a fin. Renderizamos y revisamos las 12 páginas del informe y las 12 diapositivas de la presentación.

## Integridad de datos y resultados

El conjunto continuo tiene 48,048 filas, 17 variables y frecuencia horaria desde 2015-01-03 01:00 hasta 2020-06-27 00:00. No contiene horas faltantes, marcas duplicadas, valores nulos ni infinitos. El CSV de pronóstico semanal contiene 40,152 filas; 39,313 marcas de tiempo coinciden con el histórico (97.91%). Las 14 semanas oficiales de prueba cubren 2,352 horas y coinciden con el archivo de pronóstico.

La demanda media es 1,182.87 MWh por intervalo horario según los metadatos. Retuvimos seis observaciones por debajo de 500 MWh del 20 de enero de 2019 para revisión. La validación de rangos físicos amplios no encontró otros valores fuera de límites. Documentamos la discrepancia entre las etiquetas del paquete para QV2M y TQL y las definiciones de NASA; conservamos los valores sin conversiones.

La partición cronológica asigna 70% al entrenamiento, 15% a validación y 15% a prueba. El Random Forest seleccionado por RMSE de validación obtuvo MAE 19.61 MWh, RMSE 27.72 MWh, MAPE 1.66% y R² 0.977 en prueba. Usa clima observado en la misma hora objetivo, por lo que su resultado es retrospectivo, no un pronóstico operativo. El predespacho semanal se evalúa aparte en las 14 ventanas oficiales. Las asociaciones y simulaciones son observacionales o condicionadas al modelo; no afirmamos causalidad.

## Separación, privacidad y publicación

- `data/raw/` contiene la extracción local y se excluye de Git.
- `docs/privado/` y `docs/privado_academico/` contienen copias de los documentos académicos y se excluyen de Git.
- La carpeta identificada `entregables/Proyecto_Final_Munoz_Smith_Valdes_Bellamy_1SF132/` y su ZIP son privados y se excluyen de Git.
- La carpeta de entregables reúne el informe, cuaderno ejecutado, presentación de 12 diapositivas, guiones de exposición y grabación, y enlaces locales.
- El repositorio público solo contiene código, resultados agregados, referencias, documentación y capturas generales de la web. No contiene cédulas ni archivos de datos fuente.
- No publicamos un repositorio remoto ni un despliegue Vercel. Las integraciones muestran más de una cuenta conectada para cada servicio, y no seleccionamos una cuenta en nombre del grupo. La ficha del conjunto tampoco permite confirmar derechos para redistribuir los archivos fuente.

## Acciones pendientes del grupo

Debemos confirmar con el curso la fecha exacta; grabar el video con los cuatro rostros y nombres; verificar el contenido final de la carpeta de entrega; y seleccionar las cuentas de GitHub y Vercel antes de publicar. No simulamos ni inventamos una grabación o URL pública.
