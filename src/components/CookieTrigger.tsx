"use client";

import React from "react";
import { openCookieSettings } from "./CookieConsent";

export default function CookieTrigger() {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      style={{
        background: "none",
        border: "none",
        color: "#888",
        padding: 0,
        font: "inherit",
        cursor: "pointer",
        textAlign: "left",
        transition: "color 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#d4af37")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
    >
      Configuración de Cookies
    </button>
  );
}
