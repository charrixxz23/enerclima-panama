"use client";

import { useState } from "react";
import AtlasMark from "./atlas-mark";
const links = [
  ["Inicio", "inicio"],
  ["Observatorio", "observatorio"],
  ["Clima regional", "clima"],
  ["Eventos térmicos", "eventos"],
  ["Modelos", "modelos"],
  ["Sensibilidad", "sensibilidad"],
  ["Investigación", "investigacion"],
  ["Metodología", "metodologia"],
  ["Equipo", "equipo"],
];
export default function Navigation() {
  const [open, setOpen] = useState(false);
  return (
    <header className="atlas-header">
      <div className="masthead">
        <a
          className="atlas-brand"
          href="#inicio"
          aria-label="EnerClima Panamá, inicio"
        >
          <AtlasMark />
          <span>
            EnerClima <b>Panamá</b>
          </span>
        </a>
        <span className="edition">
          Universidad Tecnológica de Panamá
          <br />
          Observatorio energético y ambiental
        </span>
        <button
          className="nav-toggle"
          aria-label={
            open ? "Cerrar índice de navegación" : "Índice: abrir navegación"
          }
          aria-expanded={open}
          aria-controls="atlas-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? "Cerrar" : "Índice"}
        </button>
      </div>
      <nav
        id="atlas-nav"
        className={open ? "atlas-nav open" : "atlas-nav"}
        aria-label="Navegación principal"
      >
        {links.map(([label, id], i) => (
          <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
            <span aria-hidden="true">
              {i === 0 ? "—" : String(i).padStart(2, "0")}
            </span>
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}
