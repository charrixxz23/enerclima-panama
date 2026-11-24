"use client";
import { useEffect } from "react";
export default function Motion() {
  useEffect(() => {
    const button = document.querySelector<HTMLButtonElement>(".nav-toggle");
    const navigation = document.querySelector<HTMLElement>("#atlas-nav");
    const setNavigation = (open: boolean) => {
      navigation?.classList.toggle("open", open);
      button?.setAttribute("aria-expanded", String(open));
      button?.setAttribute(
        "aria-label",
        open ? "Cerrar índice de navegación" : "Índice: abrir navegación",
      );
      if (button) button.textContent = open ? "Cerrar" : "Índice";
    };
    const toggleNavigation = () =>
      setNavigation(button?.getAttribute("aria-expanded") !== "true");
    const closeNavigation = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("a"))
        setNavigation(false);
    };
    const escapeNavigation = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        button?.getAttribute("aria-expanded") === "true"
      ) {
        setNavigation(false);
        button.focus();
      }
    };
    button?.addEventListener("click", toggleNavigation);
    navigation?.addEventListener("click", closeNavigation);
    document.addEventListener("keydown", escapeNavigation);
    const loadProfile = (details: HTMLDetailsElement) => {
      if (!details.open || !details.matches(".profile-details")) return;
      const template = details.querySelector("template");
      if (template) template.replaceWith(template.content.cloneNode(true));
    };
    const onToggle = (event: Event) => {
      if (event.target instanceof HTMLDetailsElement) loadProfile(event.target);
    };
    document.addEventListener("toggle", onToggle, true);
    document
      .querySelectorAll<HTMLDetailsElement>(".profile-details[open]")
      .forEach(loadProfile);
    const detach = () => {
      document.removeEventListener("toggle", onToggle, true);
      button?.removeEventListener("click", toggleNavigation);
      navigation?.removeEventListener("click", closeNavigation);
      document.removeEventListener("keydown", escapeNavigation);
    };
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return detach;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.classList.add("is-seen");
            observer.unobserve(entry.target);
          }
      },
      { threshold: 0.08 },
    );
    document
      .querySelectorAll(".data-piece")
      .forEach((el) => observer.observe(el));
    return () => {
      detach();
      observer.disconnect();
    };
  }, []);
  return null;
}
