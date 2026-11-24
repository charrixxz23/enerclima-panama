"use client";
import { useEffect } from "react";
export default function Motion() {
  useEffect(() => {
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
    const detach = () => document.removeEventListener("toggle", onToggle, true);
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
