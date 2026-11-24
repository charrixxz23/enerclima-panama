"use client";
import { useState } from "react";
import { Wind, Menu, X } from "lucide-react";
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

export default function Navigation() { const [mobileOpen, setMobileOpen] = useState(false); return (<header className="site-header">
        <a className="brand" href="#inicio" aria-label="EnerClima Panamá, inicio">
          <span className="brand-mark"><Wind size={20} strokeWidth={2.1} /></span>
          <span>EnerClima <b>Panamá</b></span>
        </a>
        <button className="mobile-toggle" aria-label={mobileOpen ? "Cerrar navegación" : "Abrir navegación"} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}</button>
        <nav className={mobileOpen ? "main-nav open" : "main-nav"} aria-label="Navegación principal">
          {links.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMobileOpen(false)}>{label}</a>)}
        </nav>
      </header>); }
