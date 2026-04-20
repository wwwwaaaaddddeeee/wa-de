"use client";

import { useState } from "react";
import ActivityLog from "./ActivityLog";

export default function LogButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ display: "contents" }}>
      <span style={{ flex: 1 }} />
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "none",
          border: "none",
          color: isOpen ? "#777" : "#DADADA",
          fontSize: 10,
          fontFamily: "monospace",
          cursor: "pointer",
          marginRight: 16,
          padding: 0,
          transition: "color 0.2s ease",
        }}
      >
        LOG
      </button>
      {isOpen && (
        <div style={{ flexBasis: "100%", width: "100%" }}>
          <ActivityLog isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
