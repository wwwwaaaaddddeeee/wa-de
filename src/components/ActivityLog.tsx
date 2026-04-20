"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LogEntry {
  message: string;
  date: string;
  sha: string;
  url: string;
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ActivityLog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLog = async () => {
    try {
      const res = await fetch("/api/log");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEntries(data);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchLog();
    const interval = setInterval(fetchLog, 30_000);
    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
          style={{
            overflow: "hidden",
            width: "100%",
            marginTop: 12,
            fontFamily: "monospace",
            fontSize: 10,
          }}
        >
          <div
            style={{
              background: "rgba(218, 218, 218, 0.15)",
              borderRadius: 12,
              padding: "12px 16px",
              maxHeight: 240,
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <span style={{ color: "#999", fontWeight: 600, letterSpacing: "0.05em" }}>
                ACTIVITY LOG
              </span>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "#DADADA",
                  cursor: "pointer",
                  fontSize: 10,
                  fontFamily: "monospace",
                  padding: 0,
                }}
              >
                CLOSE
              </button>
            </div>

            {loading ? (
              <div style={{ color: "#DADADA" }}>Loading...</div>
            ) : entries.length === 0 ? (
              <div style={{ color: "#DADADA" }}>No activity found.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {entries.map((entry) => (
                  <a
                    key={entry.sha}
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 8,
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <span style={{ color: "#777", flex: 1, lineHeight: 1.4 }}>
                      <span style={{ color: "#CACACA" }}>{entry.sha}</span>{" "}
                      {entry.message}
                    </span>
                    <span
                      style={{
                        color: "#DADADA",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {timeAgo(entry.date)}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
