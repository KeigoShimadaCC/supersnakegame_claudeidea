import { useState } from 'react';

const sections = [
  {
    id: "vision",
    title: "THE VISION",
    subtitle: "What if Snake discovered it lived inside a cube?",
    content: [
      {
        heading: "Core Fantasy",
        text: `You are OUROBOROS — a cosmic serpent that exists simultaneously in flat 2D space and volumetric 3D space. The game's central tension: what you eat in 2D casts shadows into 3D, and what you devour in 3D collapses back into 2D geometry. You are always playing both games at once, but your attention can only focus on one dimension at a time.`
      },
      {
        heading: "The Feeling",
        text: `Imagine the satisfying flow-state of classic Snake — that hypnotic rhythm of turning corners, threading through gaps in your own body. Now layer on top of that the mind-bending "aha!" of Fez, where rotating the world 90° reveals platforms that didn't exist a moment ago. Add the escalating power-fantasy of MageTrain, where every segment you add to your body is a new weapon. That's Super Snake.`
      },
      {
        heading: "Design Inspirations",
        text: `• Fez — the 2D↔3D rotation mechanic as philosophical metaphor; "design by subtraction"\n• Super Paper Mario — simultaneous dimension-play as core mechanic, not gimmick\n• MageTrain / Nimble Quest — snake-as-hero-train with roguelike progression\n• Crush (PSP/3DS) — collapsing 3D space into 2D to create new paths\n• Snake Clash! — boss battles and seasonal event structure for long-term engagement\n• Powerline.io — proximity-based energy mechanics between snake bodies`
      }
    ]
  },
  {
    id: "dimension",
    title: "THE DIMENSION FLIP",
    subtitle: "The mechanic that makes this more than a snake game",
    content: [
      {
        heading: "How It Works",
        text: `The play area is a CUBE. In 2D mode, you see one face of the cube — classic top-down snake. Swipe a special gesture (two-finger twist on mobile, Q/E on PC) and the cube ROTATES 90°, revealing a new face. But here's the twist: your snake exists on ALL faces simultaneously. In 2D, you control movement on the current face. The moment you flip, your snake's trail on the previous face becomes a WALL on the new face — visible as a glowing silhouette. This means every move you make in one dimension constrains your options in another. It's chess with yourself across dimensions.`
      },
      {
        heading: "The \"Flatland Moment\"",
        text: `At the start of the game, you don't KNOW 3D exists. Stage 1 is pure 2D. You play classic snake. Then, at the end of Stage 1, the screen glitches — the camera pulls back and you realize your 2D arena was one face of a cube all along. The cube unfolds. Your snake slithers across the edge onto a new face. This is the game's thesis statement: you were always in 3D. You just couldn't see it.`
      },
      {
        heading: "Simultaneous Split-View (Late Game)",
        text: `By Stage 5+, the player earns a "Third Eye" power-up. The screen splits: the main view shows your active 2D face, while a translucent 3D wireframe of the entire cube floats in the corner, showing your snake threading through all faces in real-time. Advanced players learn to read both views simultaneously — the 2D for precision, the 3D for strategy. On PC, the 3D mini-view can be expanded to fullscreen with Tab.`
      }
    ]
  },
  {
    id: "stages",
    title: "STAGE ARCHITECTURE",
    subtitle: "10 Worlds. 50 stages. One escalating fever dream.",
    content: [
      {
        heading: "World 1: FLATLAND (Stages 1–5)",
        text: `Theme: Clean, minimal, monochrome with neon accents. Nokia nostalgia.\nMechanic: Pure 2D. Classic snake with modern polish.\nEscalation: Walls appear. Moving obstacles. Speed increases.\nBoss: "THE FRAME" — the border of the arena comes alive, contracting inward.\nFeel: Comfort → surprise.`
      },
      {
        heading: "World 2: THE UNFOLD (Stages 6–10)",
        text: `Theme: The monochrome cracks. Color bleeds in from the edges.\nMechanic: The cube reveal. First dimension-flips introduced.\nEscalation: Food becomes time-limited. Some food is "dimensional."\nBoss: "THE HINGE" — a giant serpent that moves along the EDGES of the cube.\nFeel: Disorientation → mastery.`
      }
    ]
  },
  {
    id: "controls",
    title: "CONTROLS & FEEL",
    subtitle: "One thumb. Infinite depth.",
    content: [
      {
        heading: "Mobile (Primary)",
        text: `Movement: Swipe in cardinal directions.\nDimension Flip: Two-finger twist gesture.\nHaptic Feedback: Every eat = subtle pulse. Every dimension flip = heavy thud.`
      },
      {
        heading: "PC (Premium)",
        text: `Movement: WASD or Arrow keys.\nDimension Flip: Q/E to rotate cube left/right. R/F to rotate up/down.\nSpecial: Tab toggles views. Spacebar for Coil. ESC to pause.`
      }
    ]
  },
];

const colors = {
  bg: "#0a0a0f",
  surface: "#12121a",
  accent: "#00ffd5",
  accent2: "#ff3366",
  accent3: "#8b5cf6",
  text: "#e8e8f0",
  textDim: "#7a7a8e",
  border: "#1e1e2e"
};

interface GDDViewerProps {
  onBack: () => void;
}

export function GDDViewer({ onBack }: GDDViewerProps) {
  const [activeSection, setActiveSection] = useState("vision");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const current = sections.find(s => s.id === activeSection);

  return (
    <div style={{
      background: colors.bg,
      color: colors.text,
      minHeight: "100vh",
      fontFamily: "'Courier New', monospace",
      overflow: "auto"
    }}>
      <div style={{
        padding: "32px 24px 20px",
        borderBottom: `1px solid ${colors.border}`,
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          background: `linear-gradient(135deg, ${colors.accent}08, ${colors.accent2}08, ${colors.accent3}08)`,
          pointerEvents: "none"
        }} />
        <div style={{ position: "relative" }}>
          <button
            onClick={onBack}
            style={{
              background: 'transparent',
              border: `1px solid ${colors.border}`,
              color: colors.textDim,
              padding: '6px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '10px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontFamily: 'inherit',
              marginBottom: '16px',
            }}
          >
            Back to Game
          </button>
          <div style={{
            fontSize: "10px",
            letterSpacing: "6px",
            color: colors.accent,
            textTransform: "uppercase",
            marginBottom: "8px"
          }}>
            Game Design Document v1.0
          </div>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 700,
            margin: 0,
            letterSpacing: "-1px",
            lineHeight: 1.1
          }}>
            SUPER <span style={{ color: colors.accent }}>SNAKE</span> GAME
          </h1>
          <div style={{
            fontSize: "13px",
            color: colors.textDim,
            marginTop: "8px",
            maxWidth: "500px",
            lineHeight: 1.5
          }}>
            A dimension-flipping snake game where your 2D decisions reshape 3D reality.
          </div>
        </div>
      </div>

      <div style={{
        display: "flex",
        gap: "2px",
        padding: "8px",
        overflowX: "auto",
        borderBottom: `1px solid ${colors.border}`,
        WebkitOverflowScrolling: "touch"
      }}>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => { setActiveSection(s.id); setExpandedCard(null); }}
            style={{
              background: activeSection === s.id
                ? `linear-gradient(135deg, ${colors.accent}20, ${colors.accent3}15)`
                : "transparent",
              border: activeSection === s.id
                ? `1px solid ${colors.accent}40`
                : `1px solid transparent`,
              color: activeSection === s.id ? colors.accent : colors.textDim,
              padding: "8px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "10px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
              transition: "all 0.2s"
            }}
          >
            {s.title.replace("THE ", "")}
          </button>
        ))}
      </div>

      {current && (
        <div style={{ padding: "24px 24px 0" }}>
          <h2 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 700, margin: 0, color: colors.text }}>
            {current.title}
          </h2>
          <p style={{ fontSize: "13px", color: colors.accent2, margin: "4px 0 0", fontStyle: "italic" }}>
            {current.subtitle}
          </p>
        </div>
      )}

      <div style={{ padding: "16px 24px 80px" }}>
        {current?.content.map((item, i) => {
          const isExpanded = expandedCard === i;
          return (
            <div
              key={i}
              onClick={() => setExpandedCard(isExpanded ? null : i)}
              style={{
                background: colors.surface,
                border: `1px solid ${isExpanded ? colors.accent + "60" : colors.border}`,
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "8px",
                cursor: "pointer",
                transition: "all 0.25s ease",
                borderLeft: `3px solid ${colors.accent}40`
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 style={{
                  fontSize: "14px", fontWeight: 700, margin: 0,
                  color: isExpanded ? colors.accent : colors.text,
                  letterSpacing: "0.5px", lineHeight: 1.4, flex: 1
                }}>
                  {item.heading}
                </h3>
                <span style={{
                  color: colors.textDim, fontSize: "16px", marginLeft: "12px",
                  transform: isExpanded ? "rotate(45deg)" : "rotate(0deg)",
                  transition: "transform 0.2s", flexShrink: 0
                }}>+</span>
              </div>
              {isExpanded && (
                <div style={{
                  marginTop: "12px", fontSize: "13px", lineHeight: 1.75,
                  color: colors.textDim, whiteSpace: "pre-wrap",
                  borderTop: `1px solid ${colors.border}`, paddingTop: "12px"
                }}>
                  {item.text.split("\n").map((line, j) => (
                    <div key={j} style={{
                      marginBottom: line === "" ? "8px" : "4px",
                      color: line.startsWith("•") || line.includes(":") ? colors.text : colors.textDim
                    }}>
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
