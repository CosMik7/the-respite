// Shared UI primitives for The Respite

const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;

// ----- App-wide context -----
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

// ----- Avatar -----
function Avatar({ player, size = "md" }) {
  if (!player) return null;
  const cls = size === "lg" ? "avatar lg" : size === "xl" ? "avatar xl" : "avatar";
  return (
    <div className={`${cls} ${player.avatar}`} title={player.name}>
      {player.initials}
    </div>
  );
}

// ----- Editable text field (inline) -----
function Editable({ value, onChange, multiline = false, placeholder = "", className = "", style = {} }) {
  const [v, setV] = useState(value);
  useEffect(() => { setV(value); }, [value]);

  const commit = () => { if (v !== value) onChange(v); };
  const Tag = multiline ? "textarea" : "input";

  return (
    <Tag
      className={`editable ${className}`}
      value={v}
      placeholder={placeholder}
      style={style}
      rows={multiline ? 3 : undefined}
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (!multiline && e.key === "Enter") { e.preventDefault(); e.target.blur(); }
        if (e.key === "Escape") { setV(value); e.target.blur(); }
      }}
    />
  );
}

// ----- Editable number with +/- pip control -----
function NumberStepper({ value, max, onChange, label, sub }) {
  return (
    <div className="stat-tile" style={{ minWidth: 88 }}>
      {label && <div className="label">{label}</div>}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6 }}>
        <button className="btn ghost sm" style={{ padding: "2px 7px", borderRadius: 4 }}
          onClick={() => onChange(Math.max(0, value - 1))}>−</button>
        <div className="value">{value}</div>
        <button className="btn ghost sm" style={{ padding: "2px 7px", borderRadius: 4 }}
          onClick={() => onChange(Math.min(max ?? 999, value + 1))}>+</button>
      </div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

// ----- Pip track (for resources, recoveries) -----
function PipTrack({ current, max, onChange, color = "ember" }) {
  return (
    <div className="pip-track">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`pip ${i < current ? "filled" : ""}`}
          onClick={() => onChange(i + 1 === current ? i : i + 1)}
        />
      ))}
    </div>
  );
}

// ----- Stamina bar -----
function StaminaBar({ current, max, temp = 0, winded, dying = 0, onTempChange }) {
  const windedAt = typeof winded === "number" ? winded : Math.floor(max / 2);
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const tempPct = Math.max(0, Math.min(100, (temp / max) * 100));
  const windedPct = Math.max(0, Math.min(100, (windedAt / max) * 100));
  // dying is shown as a band below 0; visualize on the left edge as a tick
  const isDying = current <= dying;
  const isWinded = current <= windedAt && !isDying;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <span className="eyebrow">Stamina</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          {isDying && <span className="mono" style={{ fontSize: 10, color: "var(--blood)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>● Dying</span>}
          {isWinded && <span className="mono" style={{ fontSize: 10, color: "var(--gold-soft)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>● Winded</span>}
          <span className="serif" style={{ fontSize: 18, fontWeight: 600, color: "var(--ink-0)" }}>
            {current}{temp > 0 && <span style={{ color: "var(--moss)", fontSize: 13 }}> +{temp}</span>} <span className="dim" style={{ fontSize: 13 }}>/ {max}</span>
          </span>
        </div>
      </div>
      <div className="bar" style={{ position: "relative", overflow: "visible" }}>
        <div className="fill" style={{ width: `${pct}%`, background: isDying ? "var(--blood)" : isWinded ? "linear-gradient(90deg, var(--gold-soft), var(--ember))" : undefined }}></div>
        {/* temp stamina overlay (striped) */}
        {temp > 0 && (
          <div style={{
            position: "absolute", top: 0, bottom: 0,
            left: `${pct}%`, width: `${tempPct}%`,
            background: "repeating-linear-gradient(45deg, oklch(0.55 0.10 140) 0 4px, oklch(0.45 0.08 140) 4px 8px)",
            borderRight: "1px solid var(--moss)",
          }}/>
        )}
        {/* winded threshold tick */}
        <div style={{
          position: "absolute", top: -2, bottom: -2, left: `${windedPct}%`, width: 1,
          background: "var(--gold-soft)", boxShadow: "0 0 4px var(--gold)",
        }} title={`Winded at ${windedAt}`}/>
      </div>
      <div className="dim mono" style={{ fontSize: 10, display: "flex", justifyContent: "space-between" }}>
        <span>Dying ≤ {dying}</span>
        <span style={{ color: "var(--gold-soft)" }}>Winded ≤ {windedAt}</span>
        {onTempChange ? (
          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--moss)" }}>
            <button onClick={() => onTempChange(Math.max(0, temp - 1))} style={{ background: "none", border: "none", color: "var(--moss)", cursor: "pointer", padding: "0 4px", fontSize: 11 }}>−</button>
            Temp {temp}
            <button onClick={() => onTempChange(temp + 1)} style={{ background: "none", border: "none", color: "var(--moss)", cursor: "pointer", padding: "0 4px", fontSize: 11 }}>+</button>
          </span>
        ) : (
          <span style={{ color: "var(--moss)" }}>Temp +{temp}</span>
        )}
      </div>
    </div>
  );
}

// ----- Section header -----
function SectionH({ eyebrow, title, action }) {
  return (
    <div className="section-h">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

// ----- Card -----
function Card({ children, rail = false, pad = true, style = {}, className = "" }) {
  return (
    <div className={`card ${rail ? "with-rail" : ""} ${className}`} style={style}>
      {pad ? <div className="card-pad">{children}</div> : children}
    </div>
  );
}

// ----- Striped placeholder -----
function Placeholder({ label, ratio = "16 / 9", style = {}, className = "" }) {
  return (
    <div className={`placeholder ${className}`} style={{ aspectRatio: ratio, width: "100%", ...style }}>
      {label}
    </div>
  );
}

// ----- Portrait placeholder (with tinted overlay) -----
function PortraitPlaceholder({ tint = "moss", label, ratio = "3 / 4", style = {} }) {
  const tintMap = {
    moss: "oklch(0.55 0.07 140 / 0.18)",
    arcane: "oklch(0.60 0.10 280 / 0.18)",
    gold: "oklch(0.80 0.11 85 / 0.16)",
    blood: "oklch(0.50 0.14 25 / 0.18)",
    ember: "oklch(0.70 0.17 45 / 0.16)",
  };
  return (
    <div
      className="placeholder"
      style={{
        aspectRatio: ratio,
        width: "100%",
        position: "relative",
        background: `
          linear-gradient(180deg, ${tintMap[tint] || tintMap.moss}, transparent 60%),
          repeating-linear-gradient(135deg, var(--bg-2) 0, var(--bg-2) 6px, var(--bg-1) 6px, var(--bg-1) 12px)
        `,
        ...style,
      }}
    >
      <div style={{ textAlign: "center", padding: 12, lineHeight: 1.4 }}>{label}</div>
    </div>
  );
}

// ----- Pill -----
function Pill({ children, tone = "" }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}

// ----- Format date helpers -----
function fmtDate(iso, opts = {}) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", ...opts });
}
function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
function fmtRelative(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = (d - now) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return "just now";
  if (abs < 3600) return `${Math.round(abs / 60)}m ${diff < 0 ? "ago" : ""}`;
  if (abs < 86400) return `${Math.round(abs / 3600)}h ${diff < 0 ? "ago" : ""}`;
  if (abs < 86400 * 7) return `${Math.round(abs / 86400)}d ${diff < 0 ? "ago" : ""}`;
  return fmtDate(iso);
}

// ----- Countdown -----
function useCountdown(targetIso) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const target = new Date(targetIso).getTime();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs, done: diff === 0 };
}

Object.assign(window, {
  AppContext, useApp,
  Avatar, Editable, NumberStepper, PipTrack, StaminaBar,
  SectionH, Card, Placeholder, PortraitPlaceholder, Pill,
  fmtDate, fmtTime, fmtRelative, useCountdown,
});
