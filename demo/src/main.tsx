import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { DockNav, DockNavItem } from "../../src/DockNav";

// macOS-style app icons
const FinderIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 100 100">
    <defs>
      <linearGradient id="finder-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#6dd5ed" />
        <stop offset="100%" stopColor="#2193b0" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="22" fill="url(#finder-grad)" />
    <ellipse cx="35" cy="45" rx="8" ry="10" fill="#1a1a2e" />
    <ellipse cx="65" cy="45" rx="8" ry="10" fill="#1a1a2e" />
    <path
      d="M30 65 Q50 80 70 65"
      stroke="#1a1a2e"
      strokeWidth="4"
      fill="none"
    />
  </svg>
);

const SafariIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 100 100">
    <defs>
      <linearGradient id="safari-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#89f7fe" />
        <stop offset="100%" stopColor="#66a6ff" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="22" fill="url(#safari-grad)" />
    <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="3" />
    <polygon points="50,25 55,50 50,75 45,50" fill="white" />
    <polygon points="25,50 50,45 75,50 50,55" fill="#ff6b6b" />
  </svg>
);

const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 100 100">
    <defs>
      <linearGradient id="mail-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="22" fill="url(#mail-grad)" />
    <rect x="20" y="30" width="60" height="40" rx="4" fill="white" />
    <path
      d="M20 34 L50 55 L80 34"
      stroke="#764ba2"
      strokeWidth="3"
      fill="none"
    />
  </svg>
);

const MusicIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 100 100">
    <defs>
      <linearGradient id="music-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fc466b" />
        <stop offset="100%" stopColor="#3f5efb" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="22" fill="url(#music-grad)" />
    <circle cx="35" cy="65" r="12" fill="white" />
    <circle cx="65" cy="60" r="12" fill="white" />
    <rect x="45" y="25" width="4" height="40" fill="white" />
    <rect x="75" y="20" width="4" height="40" fill="white" />
    <rect x="45" y="22" width="34" height="6" fill="white" />
  </svg>
);

const PhotosIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 100 100">
    <rect width="100" height="100" rx="22" fill="white" />
    <circle
      cx="50"
      cy="50"
      r="25"
      fill="none"
      stroke="#ff9500"
      strokeWidth="10"
    />
    <circle
      cx="50"
      cy="50"
      r="25"
      fill="none"
      stroke="#ff2d55"
      strokeWidth="10"
      strokeDasharray="40 120"
      strokeDashoffset="0"
    />
    <circle
      cx="50"
      cy="50"
      r="25"
      fill="none"
      stroke="#5856d6"
      strokeWidth="10"
      strokeDasharray="40 120"
      strokeDashoffset="-52"
    />
    <circle
      cx="50"
      cy="50"
      r="25"
      fill="none"
      stroke="#34c759"
      strokeWidth="10"
      strokeDasharray="40 120"
      strokeDashoffset="-104"
    />
  </svg>
);

const MessagesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 100 100">
    <defs>
      <linearGradient id="msg-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#43e97b" />
        <stop offset="100%" stopColor="#38f9d7" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="22" fill="url(#msg-grad)" />
    <ellipse cx="50" cy="45" rx="28" ry="22" fill="white" />
    <ellipse cx="35" cy="70" rx="8" ry="6" fill="white" />
  </svg>
);

const items: DockNavItem[] = [
  { id: "finder", label: "Finder", icon: FinderIcon },
  { id: "safari", label: "Safari", icon: SafariIcon },
  { id: "mail", label: "Mail", icon: MailIcon },
  { id: "music", label: "Music", icon: MusicIcon },
  { id: "photos", label: "Photos", icon: PhotosIcon },
  { id: "messages", label: "Messages", icon: MessagesIcon },
];

function App() {
  const [active, setActive] = useState("finder");

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        position: "relative",
      }}
    >
      <main style={{ padding: 60, color: "white", textAlign: "center" }}>
        <h1
          style={{
            fontSize: 48,
            fontWeight: 300,
            marginBottom: 16,
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          DockNav
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 18 }}>
          Hover over the dock to see the magnification effect
        </p>
      </main>

      <DockNav
        items={items}
        activeId={active}
        onNavigate={setActive}
        position="bottom"
        baseSize={72}
        maxScale={1.5}
        gap={16}
        magnifyDistance={140}
        style={{
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: 20,
          border: "1px solid rgba(255, 255, 255, 0.2)",
          padding: "8px 12px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}
        theme={{
          activeBackground: "transparent",
          inactiveBackground: "transparent",
          activeColor: "inherit",
          inactiveColor: "inherit",
          indicatorColor: "rgba(255, 255, 255, 0.9)",
          tooltipBackground: "rgba(30, 30, 30, 0.95)",
          tooltipColor: "white",
        }}
      />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
