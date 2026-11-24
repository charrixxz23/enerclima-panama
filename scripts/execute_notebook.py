from pathlib import Path
import shutil

import nbformat
from nbclient import NotebookClient


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_NOTEBOOK = ROOT / "notebooks" / "EnerClima_Panama_Proyecto_Final.ipynb"
PRIVATE_DIR = ROOT / "entregables" / "Proyecto_Final_Munoz_Smith_Valdes_Bellamy_1SF132"
PRIVATE_NOTEBOOK = PRIVATE_DIR / "EnerClima_Panama_Proyecto_Final.ipynb"

notebook = nbformat.read(PUBLIC_NOTEBOOK, as_version=4)
NotebookClient(
    notebook,
    timeout=1200,
    kernel_name="python3",
    resources={"metadata": {"path": str(ROOT)}},
).execute()
nbformat.write(notebook, PUBLIC_NOTEBOOK)

PRIVATE_DIR.mkdir(parents=True, exist_ok=True)
shutil.copy2(PUBLIC_NOTEBOOK, PRIVATE_NOTEBOOK)
private_notebook = nbformat.read(PRIVATE_NOTEBOOK, as_version=4)
print(f"Cuaderno reproducible: {PUBLIC_NOTEBOOK}")
print(f"Copia académica: {PRIVATE_NOTEBOOK}")
