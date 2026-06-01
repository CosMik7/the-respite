// Dice tab — d4/d6/d8/d10/d12/d20 roller with history

function DiceTab() {
  const app = useApp();
  const { players, meId } = app;
  const me = players.find(p => p.id === meId);
  const [pool, setPool] = useState({ 4: 0, 6: 0, 8: 0, 10: 0, 12: 0, 20: 0 });
  const [modifier, setModifier] = useState(0);
  const [edge, setEdge] = useState("none"); // none | edge | bane | doubleEdge | doubleBane
  const [label, setLabel] = useState("");
  const [history, setHistory] = useState([]);
  const [rolling, setRolling] = useState(false);
  const [latest, setLatest] = useState(null);

  const dice = [4, 6, 8, 10, 12, 20];
  const total = Object.values(pool).reduce((a, b) => a + b, 0);

  const adjust = (d, delta) => setPool(p => ({ ...p, [d]: Math.max(0, p[d] + delta) }));
  const reset = () => { setPool({ 4: 0, 6: 0, 8: 0, 10: 0, 12: 0, 20: 0 }); setModifier(0); setEdge("none"); setLabel(""); };

  const rollOne = (sides) => Math.floor(Math.random() * sides) + 1;

  const roll = () => {
    if (total === 0) return;
    setRolling(true);

    // Drawsteel-style: 2d10 power roll baseline (when only d10s present we treat as power roll)
    const groups = dice.flatMap(d => Array.from({ length: pool[d] }).map(() => ({ sides: d, value: rollOne(d) })));

    // edge/bane modifier
    let edgeBonus = 0;
    if (edge === "edge") edgeBonus = 2;
    if (edge === "doubleEdge") edgeBonus = 4;
    if (edge === "bane") edgeBonus = -2;
    if (edge === "doubleBane") edgeBonus = -4;

    const sum = groups.reduce((a, g) => a + g.value, 0) + Number(modifier) + edgeBonus;

    // Power-roll tier interpretation if it's a 2d10 roll (Drawsteel canonical)
    let tier = null;
    if (pool[10] === 2 && Object.entries(pool).every(([k, v]) => k === "10" || v === 0)) {
      const base = sum;
      if (base <= 11) tier = 1;
      else if (base <= 16) tier = 2;
      else tier = 3;
      // natural 19-20 bumps tier
      const natSum = groups.reduce((a, g) => a + g.value, 0);
      if (natSum >= 19) tier = Math.min(3, tier + 1);
    }

    const result = {
      id: "r" + Date.now(),
      who: me.id,
      whoName: me.name,
      label: label || (tier ? "Power roll" : "Dice roll"),
      groups, modifier: Number(modifier), edge, edgeBonus,
      total: sum,
      tier,
      ts: new Date().toISOString(),
    };

    setTimeout(() => {
      setLatest(result);
      setHistory(h => [result, ...h].slice(0, 30));
      setRolling(false);
    }, 600);
  };

  const presets = [
    { name: "Power roll", desc: "2d10", apply: () => setPool({ 4: 0, 6: 0, 8: 0, 10: 2, 12: 0, 20: 0 }) },
    { name: "Damage (light)", desc: "2d6", apply: () => setPool({ 4: 0, 6: 2, 8: 0, 10: 0, 12: 0, 20: 0 }) },
    { name: "Damage (heavy)", desc: "2d8 + 1d6", apply: () => setPool({ 4: 0, 6: 1, 8: 2, 10: 0, 12: 0, 20: 0 }) },
    { name: "Big hit", desc: "1d12", apply: () => setPool({ 4: 0, 6: 0, 8: 0, 10: 0, 12: 1, 20: 0 }) },
    { name: "d20", desc: "1d20", apply: () => setPool({ 4: 0, 6: 0, 8: 0, 10: 0, 12: 0, 20: 1 }) },
  ];

  return (
    <div className="page">
      <SectionH eyebrow="The Bones" title="Dice" action={
        <span className="dim mono" style={{ fontSize: 11 }}>Rolling as <span style={{ color: "var(--ember)" }}>{me.name}</span></span>
      }/>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
        {/* Builder */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card rail>
            <div className="flourish" style={{ justifyContent: "flex-start", marginBottom: 14 }}>The Pool</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {dice.map(d => (
                <DieControl key={d} sides={d} count={pool[d]}
                  onInc={() => adjust(d, +1)}
                  onDec={() => adjust(d, -1)}
                  onClear={() => setPool(p => ({ ...p, [d]: 0 }))}/>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flourish" style={{ justifyContent: "flex-start", marginBottom: 14 }}>Modifiers</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, alignItems: "start" }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Flat bonus</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button className="btn ghost sm" onClick={() => setModifier(m => m - 1)}>−</button>
                  <input type="number" value={modifier} onChange={e => setModifier(parseInt(e.target.value || 0))}
                    style={{ width: 64, textAlign: "center", padding: "6px 8px", background: "var(--bg-0)", border: "1px solid var(--line)", borderRadius: 4, color: "var(--ink-0)", fontSize: 16, fontFamily: "var(--font-serif)", fontWeight: 600 }}/>
                  <button className="btn ghost sm" onClick={() => setModifier(m => m + 1)}>+</button>
                </div>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Edge / Bane</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
                  {[
                    { v: "doubleBane", label: "−−", color: "blood" },
                    { v: "bane", label: "−", color: "blood" },
                    { v: "none", label: "·", color: "" },
                    { v: "edge", label: "+", color: "moss" },
                    { v: "doubleEdge", label: "++", color: "moss" },
                  ].map(o => (
                    <button key={o.v} onClick={() => setEdge(o.v)}
                      className={`btn sm ${edge === o.v ? "ember" : "ghost"}`}
                      style={{ padding: "6px 4px", fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600 }}>
                      {o.label}
                    </button>
                  ))}
                </div>
                <div className="dim mono" style={{ fontSize: 10, marginTop: 6 }}>−− to ++ shifts result by ±2 / ±4</div>
              </div>
            </div>

            <div className="rule"></div>

            <div className="eyebrow" style={{ marginBottom: 6 }}>Label (optional)</div>
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Twin Fang vs Wakeknight"
              style={{ width: "100%", padding: "8px 12px", background: "var(--bg-0)", border: "1px solid var(--line)", borderRadius: 4, color: "var(--ink-0)", fontSize: 13, fontFamily: "var(--font-serif)", fontStyle: "italic", outline: "none" }}/>
          </Card>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn ember" disabled={total === 0 || rolling} onClick={roll}
              style={{ flex: 1, padding: "14px 20px", fontSize: 15, opacity: total === 0 ? 0.4 : 1, cursor: total === 0 ? "not-allowed" : "pointer" }}>
              {rolling ? "Rolling…" : total === 0 ? "Pick at least one die" : `Cast ${total} ${total === 1 ? "die" : "dice"}`}
            </button>
            <button className="btn ghost" onClick={reset}>Reset</button>
          </div>

          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Quick presets</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {presets.map(p => (
                <button key={p.name} className="btn ghost sm" onClick={p.apply}
                  style={{ display: "flex", flexDirection: "column", gap: 2, padding: "6px 12px", alignItems: "flex-start" }}>
                  <span className="serif" style={{ fontSize: 13, color: "var(--ink-0)" }}>{p.name}</span>
                  <span className="dim mono" style={{ fontSize: 10 }}>{p.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result + history */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ResultCard latest={latest} rolling={rolling}/>
          <Card>
            <SectionH eyebrow="Recent" title="At the table" action={history.length > 0 && (
              <button className="btn ghost sm" onClick={() => setHistory([])}>Clear</button>
            )}/>
            {history.length === 0 ? (
              <div className="muted serif italic" style={{ fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                No rolls yet. The bones are quiet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {history.map(r => <HistoryRow key={r.id} r={r}/>)}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function DieControl({ sides, count, onInc, onDec, onClear }) {
  const active = count > 0;
  return (
    <div className="card" style={{ padding: "14px 12px", background: active ? "var(--bg-2)" : "var(--bg-0)", border: active ? "1px solid var(--ember)" : "1px solid var(--line)", boxShadow: active ? "0 0 0 1px oklch(0.70 0.17 45 / 0.25), var(--shadow-glow)" : "none", transition: "all 0.15s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <DieGlyph sides={sides} active={active}/>
        <div className="serif" style={{ fontSize: 28, fontWeight: 600, color: active ? "var(--ember)" : "var(--ink-3)", fontVariantNumeric: "tabular-nums", lineHeight: 1, textShadow: active ? "0 0 12px oklch(0.70 0.17 45 / 0.5)" : "none" }}>
          {count}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
        <button className="btn ghost sm" onClick={onDec} style={{ padding: "5px 0" }}>−</button>
        <button className="btn ghost sm" onClick={onInc} style={{ padding: "5px 0" }}>+</button>
      </div>
    </div>
  );
}

function DieGlyph({ sides, active }) {
  // Simple inline shape per die — square (d4 triangle), hex, octagon, etc.
  const color = active ? "var(--ember)" : "var(--ink-2)";
  const stroke = active ? "var(--ember)" : "var(--line-strong)";
  const shapes = {
    4: <polygon points="20,4 36,32 4,32" fill="none" stroke={stroke} strokeWidth="1.5"/>,
    6: <rect x="6" y="6" width="28" height="28" fill="none" stroke={stroke} strokeWidth="1.5" transform="rotate(8 20 20)"/>,
    8: <polygon points="20,4 32,12 32,28 20,36 8,28 8,12" fill="none" stroke={stroke} strokeWidth="1.5"/>,
    10: <polygon points="20,4 36,16 28,34 12,34 4,16" fill="none" stroke={stroke} strokeWidth="1.5"/>,
    12: <polygon points="20,3 32,9 36,22 28,33 12,33 4,22 8,9" fill="none" stroke={stroke} strokeWidth="1.5"/>,
    20: <polygon points="20,2 36,12 36,28 20,38 4,28 4,12" fill="none" stroke={stroke} strokeWidth="1.5"/>,
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <svg width="36" height="36" viewBox="0 0 40 40" style={{ filter: active ? "drop-shadow(0 0 6px oklch(0.70 0.17 45 / 0.6))" : "none" }}>
        {shapes[sides]}
      </svg>
      <div className="serif" style={{ fontSize: 18, fontWeight: 600, color, lineHeight: 1 }}>d{sides}</div>
    </div>
  );
}

function ResultCard({ latest, rolling }) {
  if (rolling) {
    return (
      <Card style={{ background: "linear-gradient(135deg, var(--bg-1), var(--bg-2))", textAlign: "center", padding: "40px 20px" }}>
        <div className="serif italic" style={{ color: "var(--ember)", fontSize: 22, animation: "ember-pulse 0.7s ease-in-out infinite" }}>The bones tumble…</div>
      </Card>
    );
  }
  if (!latest) {
    return (
      <Card style={{ textAlign: "center", padding: "40px 20px", background: "linear-gradient(135deg, var(--bg-1), var(--bg-2))" }}>
        <div className="display" style={{ color: "var(--ember)", fontSize: 28, marginBottom: 8 }}>The Bones Wait</div>
        <div className="muted serif italic" style={{ fontSize: 14 }}>Build a pool, then cast.</div>
      </Card>
    );
  }
  const tierLabel = latest.tier === 1 ? "Tier I" : latest.tier === 2 ? "Tier II" : latest.tier === 3 ? "Tier III" : null;
  return (
    <Card rail style={{ background: "linear-gradient(135deg, var(--bg-1), var(--bg-2))", padding: "24px 26px" }}>
      <div className="eyebrow" style={{ marginBottom: 4 }}>{latest.label}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 16 }}>
        <div className="serif" style={{ fontSize: 64, fontWeight: 600, color: "var(--ember)", lineHeight: 1, fontVariantNumeric: "tabular-nums", textShadow: "0 0 24px oklch(0.70 0.17 45 / 0.5)" }}>
          {latest.total}
        </div>
        {tierLabel && (
          <div style={{ textAlign: "right" }}>
            <div className="display" style={{ color: latest.tier === 3 ? "var(--gold)" : "var(--ember)", fontSize: 22 }}>{tierLabel}</div>
            <div className="dim mono" style={{ fontSize: 10 }}>power roll</div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {latest.groups.map((g, i) => (
          <div key={i} style={{
            display: "grid", placeItems: "center", minWidth: 36, padding: "4px 8px",
            background: g.value === g.sides ? "oklch(0.55 0.10 140 / 0.25)" : g.value === 1 ? "oklch(0.40 0.10 25 / 0.25)" : "var(--bg-0)",
            border: `1px solid ${g.value === g.sides ? "var(--moss)" : g.value === 1 ? "var(--blood)" : "var(--line-strong)"}`,
            borderRadius: 4,
          }}>
            <div className="serif" style={{ fontSize: 18, fontWeight: 600, color: "var(--ink-0)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{g.value}</div>
            <div className="dim mono" style={{ fontSize: 9, marginTop: 1 }}>d{g.sides}</div>
          </div>
        ))}
        {latest.modifier !== 0 && (
          <div style={{ display: "grid", placeItems: "center", padding: "4px 10px", background: "var(--bg-0)", border: "1px solid var(--line-strong)", borderRadius: 4 }}>
            <div className="serif" style={{ fontSize: 18, fontWeight: 600, color: "var(--ink-1)", lineHeight: 1 }}>{latest.modifier > 0 ? `+${latest.modifier}` : latest.modifier}</div>
            <div className="dim mono" style={{ fontSize: 9, marginTop: 1 }}>mod</div>
          </div>
        )}
        {latest.edgeBonus !== 0 && (
          <div style={{ display: "grid", placeItems: "center", padding: "4px 10px", background: latest.edgeBonus > 0 ? "oklch(0.55 0.10 140 / 0.20)" : "oklch(0.40 0.10 25 / 0.20)", border: `1px solid ${latest.edgeBonus > 0 ? "var(--moss)" : "var(--blood)"}`, borderRadius: 4 }}>
            <div className="serif" style={{ fontSize: 18, fontWeight: 600, color: "var(--ink-0)", lineHeight: 1 }}>{latest.edgeBonus > 0 ? `+${latest.edgeBonus}` : latest.edgeBonus}</div>
            <div className="dim mono" style={{ fontSize: 9, marginTop: 1 }}>{latest.edgeBonus > 0 ? "edge" : "bane"}</div>
          </div>
        )}
      </div>

      <div className="dim mono" style={{ fontSize: 10 }}>
        {latest.whoName} · {fmtRelative(latest.ts)}
      </div>
    </Card>
  );
}

function HistoryRow({ r }) {
  const tierLabel = r.tier === 1 ? "I" : r.tier === 2 ? "II" : r.tier === 3 ? "III" : null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
      <div className="serif" style={{ fontSize: 22, fontWeight: 600, color: "var(--ember)", fontVariantNumeric: "tabular-nums", minWidth: 36, textAlign: "center" }}>{r.total}</div>
      <div>
        <div className="serif" style={{ fontSize: 13, color: "var(--ink-0)" }}>{r.label}</div>
        <div className="dim mono" style={{ fontSize: 10, marginTop: 2 }}>
          {r.groups.map((g, i) => `${i > 0 ? "+" : ""}${g.value}(d${g.sides})`).join("")}
          {r.modifier !== 0 && (r.modifier > 0 ? `+${r.modifier}` : r.modifier)}
          {r.edgeBonus !== 0 && (r.edgeBonus > 0 ? `+${r.edgeBonus}` : r.edgeBonus)}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        {tierLabel && <div className="display" style={{ fontSize: 14, color: r.tier === 3 ? "var(--gold)" : "var(--ember)" }}>{tierLabel}</div>}
        <div className="dim mono" style={{ fontSize: 9 }}>{r.whoName}</div>
      </div>
    </div>
  );
}

window.DiceTab = DiceTab;
