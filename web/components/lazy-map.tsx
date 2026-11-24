"use client";
import dynamic from "next/dynamic";
import {useEffect,useRef,useState} from "react";
import type { Station, ThermalEvent } from "../lib/dashboard";
const Map=dynamic(()=>import("./map-view"),{ssr:false,loading:()=> <p className="chart-placeholder">Cargamos el esquema regional.</p>});
export default function LazyMap({stations,events}:{stations:Station[];events:ThermalEvent[]}){const ref=useRef<HTMLDivElement>(null);const[visible,setVisible]=useState(false);useEffect(()=>{const o=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){setVisible(true);o.disconnect();}});if(ref.current)o.observe(ref.current);return()=>o.disconnect();},[]);return <div ref={ref} className="map-frame" role="region" aria-label="Mapa esquemático de Tocumen, Santiago y David">{visible?<Map stations={stations} events={events}/>:<p className="chart-placeholder">Podemos consultar las coordenadas debajo del mapa.</p>}</div>;}
