# Reporte de pruebas y validaciones

## Aplicación web

- `npm run lint`: aprobado.
- `npx tsc --noEmit`: aprobado.
- `npm run build`: compilación de producción aprobada con Next.js 16.4.6 y webpack.
- `npm run test:e2e`: 4 de 4 pruebas aprobadas en Chromium.
- Comprobamos datos agregados, interacciones del simulador, navegación móvil, enlaces de sección y ausencia de desbordamiento horizontal a 1440, 1024, 768 y 390 píxeles.
- Guardamos e inspeccionamos capturas de escritorio, móvil, inicio y simulador en `evidencias/web/`. Incluimos dos capturas sin datos privados en `web/public/previews/` y en el README.
- `npm audit --omit=dev`: 0 vulnerabilidades en dependencias de producción.
- La compilación produce una ruta estática principal. El despliegue remoto queda pendiente de seleccionar cuentas de GitHub y Vercel.

## Datos y análisis

- Ejecutamos la canalización completa en `scripts/run_analysis.py`.
- Confirmamos 48,048 filas y 17 variables, sin horas faltantes, fechas duplicadas, valores nulos o infinitos.
- El análisis de rangos físicos amplios no detectó registros fuera de los límites definidos. Seis demandas menores de 500 MWh quedan señaladas para revisión en `results/tables/valores_demanda_para_revision.csv`; no las corregimos ni eliminamos.
- Exportamos al sitio métricas agregadas y series resumidas, sin incluir los datos originales.
- Ejecutamos todas las celdas del cuaderno y guardamos sus salidas. La copia pública no contiene cédulas; la copia privada sí contiene la portada académica.

## Documentos y presentación

- El informe Word y su PDF tienen 12 páginas tamaño carta. Revisamos Arial 12, interlineado 1.5 en el cuerpo y renderizamos las 12 páginas para inspección visual.
- La presentación final tiene 12 diapositivas, notas de exposición, tres gráficos cuantitativos y datos integrados. El validador del paquete comprobó fuentes, gráficos, integridad y conteo de diapositivas.
- Convertimos la presentación a PDF de 12 páginas y revisamos sus diapositivas, incluida la bibliografía final.
- El ZIP de entrega reúne solo los documentos de la carpeta académica privada, sin incluir datos originales.

## Herramientas e integraciones

- Comprobamos Python 3.12.10, Node.js 24.22.1, npm 11.19.1, Git 2.55.0 y Jupyter.
- Vercel CLI no estaba instalado; las integraciones de GitHub y Vercel están disponibles y muestran más de una cuenta conectada en cada servicio.
- No encontramos un repositorio ni proyecto remoto EnerClima. La aplicación local está validada, pero todavía no hay despliegue público porque falta escoger cuenta y perfil.
