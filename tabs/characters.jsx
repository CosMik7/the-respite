// Character sheet tab — profile switcher + sheet, inline edit, layout variants

function CharactersTab() {
  const app = useApp();
  const { players, characters, selectedPlayer, setSelectedPlayer, updateCharacter, sheetLayout } = app;
  const playerList = players.filter(p => p.role === "Player");
  const player = playerList.find(p => p.id === selectedPlayer) || playerList[0];
  const c = characters[player.id];

  return (
    <div className="page">
      {/* Player switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, alignItems: "center", overflowX: "auto", paddingBottom: 4 }}>
        <span className="eyebrow" style={{ marginRight: 8, flexShrink: 0 }}>Profiles</span>
        {playerList.map(p => {
          const active = p.id === player.id;
          const ch = characters[p.id];
          return (
            <button key={p.id}
              onClick={() => setSelectedPlayer(p.id)}
              className="card"
              style={{
                display: "flex", gap: 10, alignItems: "center", padding: "8px 14px 8px 8px",
                background: active ? "var(--bg-2)" : "var(--bg-1)",
                border: active ? "1px solid var(--ember)" : "1px solid var(--line)",
                cursor: "pointer", flexShrink: 0,
                boxShadow: active ? "0 0 0 1px oklch(0.70 0.17 45 / 0.3), var(--shadow-glow)" : "none",
                transition: "all 0.15s",
              }}
            >
              <Avatar player={p}/>
              <div style={{ textAlign: "left" }}>
                <div className="serif" style={{ fontSize: 14, color: active ? "var(--ink-0)" : "var(--ink-1)", fontWeight: 600, lineHeight: 1.1 }}>{ch?.name || p.name}</div>
                <div className="dim" style={{ fontSize: 11 }}>{p.name} · {ch ? `${ch.cls} ${ch.level}` : "—"}</div>
              </div>
            </button>
          );
        })}
      </div>

      {sheetLayout === "stacked"
        ? <SheetStacked character={c} updateCharacter={updateCharacter} player={player}/>
        : <SheetSpread character={c} updateCharacter={updateCharacter} player={player}/>}
    </div>
  );
}

// Layout A: spread (portrait left + stats right + content tabs below)
function SheetSpread({ character: c, updateCharacter, player }) {
  const set = (path, value) => updateCharacter(player.id, path, value);
  const [section, setSection] = useState("abilities");
  const sections = [
    { id: "abilities", label: "Abilities" },
    { id: "features", label: "Features & Kit" },
    { id: "skills", label: "Skills & Perks" },
    { id: "origin", label: "Culture & Career" },
    { id: "projects", label: "Downtime" },
    { id: "inventory", label: "Inventory" },
    { id: "ties", label: "Ties & Backstory" },
    { id: "conditions", label: "Conditions & Notes" },
    { id: "dice", label: "Dice" },
  ];

  return (
    <>
      {/* Header card */}
      <Card pad={false} rail style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 0 }}>
          <div style={{ padding: 18, borderRight: "1px solid var(--line)" }}>
            <PortraitPlaceholder tint={c.portraitTint} label={c.portrait} ratio="3 / 4"/>
          </div>
          <div style={{ padding: "22px 26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 8 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 4 }}>{c.titles[0]}</div>
                <h1 className="serif" style={{ fontSize: 36, margin: 0, color: "var(--ink-0)", letterSpacing: "0.005em", lineHeight: 1 }}>
                  <Editable value={c.name} onChange={v => set("name", v)}/>
                </h1>
                <div className="muted serif italic" style={{ fontSize: 14, marginTop: 6 }}>{c.pronouns} · played by {player.name}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Pill tone="ember">Level {c.level}</Pill>
                <Pill tone="race">{c.ancestry}</Pill>
                <Pill>{c.cls}</Pill>
                <Pill tone="gold">{c.career}</Pill>
                <Pill tone="gold">{c.kit} kit</Pill>
              </div>
            </div>

            <div className="rule"></div>

            {/* Characteristics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 18 }}>
              {Object.entries(c.characteristics).map(([k, v]) => (
                <div key={k} className="stat-tile" style={{ background: "var(--bg-0)" }}>
                  <div className="label">{k}</div>
                  <div className="value" style={{ fontVariantNumeric: "tabular-nums" }}>{v >= 0 ? `+${v}` : v}</div>
                </div>
              ))}
            </div>

            {/* Stamina + recoveries + resource + surges */}
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 12 }}>
              <div className="card" style={{ padding: "12px 14px", background: "var(--bg-0)" }}>
                <StaminaBar
                  current={c.stamina.current} max={c.stamina.max}
                  temp={c.tempStamina ?? 0}
                  winded={Math.floor(c.stamina.max / 2)}
                  dying={-Math.floor(c.stamina.max / 2)}
                  onTempChange={v => set("tempStamina", v)}
                />
              </div>
              <div className="card" style={{ padding: "10px 14px", background: "var(--bg-0)" }}>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Recoveries</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span className="serif" style={{ fontSize: 22, fontWeight: 600, color: "var(--ink-0)" }}>{c.stamina.recoveries.current}</span>
                  <span className="dim">/ {c.stamina.recoveries.max}</span>
                </div>
                <div className="dim mono" style={{ fontSize: 10, marginTop: 4 }}>{c.stamina.recoveries.value} stamina each</div>
              </div>
              <div className="card" style={{ padding: "10px 14px", background: "var(--bg-0)" }}>
                <div className="eyebrow" style={{ marginBottom: 6 }}>{c.resource.name}</div>
                <PipTrack current={c.resource.current} max={c.resource.max}
                  onChange={v => set("resource.current", v)}/>
              </div>
              <SurgesTile c={c} set={set}/>
            </div>

            {/* XP + Victories strip */}
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginTop: 16 }}>
              <XPBar c={c} set={set}/>
              <VictoriesTrack c={c} set={set}/>
            </div>

            {/* Wealth / Renown / Hero tokens / Turn taken */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.2fr", gap: 12, marginTop: 12 }}>
              <CounterTile label="Wealth" value={c.wealth ?? 0} icon="◆" tone="gold" onChange={v => set("wealth", Math.max(0, v))}/>
              <CounterTile label="Renown" value={c.renown ?? 0} icon="✦" tone="gold" onChange={v => set("renown", Math.max(0, v))}/>
              <CounterTile label="Hero Tokens" value={c.heroTokens ?? 0} icon="●" tone="ember" onChange={v => set("heroTokens", Math.max(0, v))}/>
              <TurnTakenTile taken={c.turnTaken ?? false} onToggle={() => set("turnTaken", !c.turnTaken)}/>
            </div>
          </div>
        </div>
      </Card>

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--line)", marginBottom: 20 }}>
        {sections.map(s => (
          <button key={s.id}
            onClick={() => setSection(s.id)}
            className="tab"
            style={{
              color: section === s.id ? "var(--ember)" : "var(--ink-2)",
              fontFamily: "var(--font-serif)",
              textTransform: "none",
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: "0.01em",
              padding: "10px 18px",
            }}>
            {s.label}
            {section === s.id && <span style={{ position: "absolute", left: 18, right: 18, bottom: -1, height: 2, background: "var(--ember)", boxShadow: "0 0 8px var(--ember-glow)" }}/>}
          </button>
        ))}
      </div>

      {section === "abilities" && <AbilitiesPanel c={c} set={set}/>}
      {section === "features" && <FeaturesPanel c={c} set={set}/>}
      {section === "skills" && <SkillsPerksPanel c={c} set={set}/>}
      {section === "origin" && <OriginPanel c={c} set={set}/>}
      {section === "projects" && <ProjectsPanel c={c} set={set}/>}
      {section === "inventory" && <InventoryPanel c={c} set={set}/>}
      {section === "ties" && <TiesPanel c={c} set={set}/>}
      {section === "conditions" && <ConditionsPanel c={c} set={set}/>}
      {section === "dice" && <DicePanel/>}
    </>
  );
}

// Layout B: stacked (single column, all sections visible)
function SheetStacked({ character: c, updateCharacter, player }) {
  const set = (path, value) => updateCharacter(player.id, path, value);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
      <div style={{ position: "sticky", top: 92, alignSelf: "start", display: "flex", flexDirection: "column", gap: 16 }}>
        <Card pad={false}>
          <div style={{ padding: 14 }}><PortraitPlaceholder tint={c.portraitTint} label={c.portrait} ratio="3 / 4"/></div>
          <div style={{ padding: "0 18px 18px" }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>{c.titles[0]}</div>
            <h1 className="serif" style={{ fontSize: 26, margin: "0 0 4px", color: "var(--ink-0)", lineHeight: 1.1 }}>
              <Editable value={c.name} onChange={v => set("name", v)}/>
            </h1>
            <div className="dim" style={{ fontSize: 12, marginBottom: 10 }}>{c.pronouns} · {player.name}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Pill tone="ember">L{c.level}</Pill>
              <Pill tone="race">{c.ancestry}</Pill>
              <Pill>{c.cls}</Pill>
              <Pill tone="gold">{c.career}</Pill>
            </div>
          </div>
        </Card>
        <Card>
          <StaminaBar
            current={c.stamina.current} max={c.stamina.max}
            temp={c.tempStamina ?? 0}
            winded={Math.floor(c.stamina.max / 2)}
            dying={-Math.floor(c.stamina.max / 2)}
            onTempChange={v => set("tempStamina", v)}
          />
          <div className="rule"></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Recoveries</div>
              <div className="serif" style={{ fontSize: 18, color: "var(--ink-0)" }}>{c.stamina.recoveries.current}/{c.stamina.recoveries.max}</div>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>{c.resource.name}</div>
              <PipTrack current={c.resource.current} max={c.resource.max} onChange={v => set("resource.current", v)}/>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Surges</div>
              <div className="serif" style={{ fontSize: 18, color: "var(--ember)", fontWeight: 600 }}>{c.surges ?? 0}</div>
            </div>
          </div>
          <div className="rule"></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <CounterTile compact label="Wealth" value={c.wealth ?? 0} icon="◆" tone="gold" onChange={v => set("wealth", Math.max(0, v))}/>
            <CounterTile compact label="Renown" value={c.renown ?? 0} icon="✦" tone="gold" onChange={v => set("renown", Math.max(0, v))}/>
            <CounterTile compact label="Hero" value={c.heroTokens ?? 0} icon="●" tone="ember" onChange={v => set("heroTokens", Math.max(0, v))}/>
            <TurnTakenTile compact taken={c.turnTaken ?? false} onToggle={() => set("turnTaken", !c.turnTaken)}/>
          </div>
          <div className="rule"></div>
          <XPBar c={c} set={set} compact/>
          <div style={{ marginTop: 10 }}>
            <VictoriesTrack c={c} set={set} compact/>
          </div>
          <div className="rule"></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {Object.entries(c.characteristics).map(([k, v]) => (
              <div key={k} style={{ textAlign: "center" }}>
                <div className="dim" style={{ fontSize: 9, letterSpacing: "0.04em", textTransform: "uppercase" }}>{k.slice(0,3)}</div>
                <div className="serif" style={{ fontSize: 20, fontWeight: 600, color: "var(--ink-0)" }}>{v >= 0 ? `+${v}` : v}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Card><AbilitiesPanel c={c} set={set}/></Card>
        <Card><FeaturesPanel c={c} set={set}/></Card>
        <Card><SkillsPerksPanel c={c} set={set}/></Card>
        <Card><OriginPanel c={c} set={set}/></Card>
        <Card><ProjectsPanel c={c} set={set}/></Card>
        <Card><InventoryPanel c={c} set={set}/></Card>
        <Card><TiesPanel c={c} set={set}/></Card>
        <Card><ConditionsPanel c={c} set={set}/></Card>
        <Card><DicePanel/></Card>
      </div>
    </div>
  );
}

// ----- XP + Victories trackers -----

function XPBar({ c, set, compact = false }) {
  const xp = c.xp || { current: 0, next: 24 };
  const pct = Math.max(0, Math.min(100, (xp.current / xp.next) * 100));
  const adjust = (delta) => {
    const v = Math.max(0, xp.current + delta);
    set("xp", { ...xp, current: v });
  };

  return (
    <div className="card" style={{ padding: compact ? "8px 12px" : "10px 14px", background: "var(--bg-0)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span className="eyebrow">Experience</span>
        <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
          {!compact && (
            <>
              <button className="btn ghost sm" style={{ padding: "1px 7px", borderRadius: 3, fontSize: 11 }} onClick={() => adjust(-1)}>−</button>
              <button className="btn ghost sm" style={{ padding: "1px 7px", borderRadius: 3, fontSize: 11 }} onClick={() => adjust(+1)}>+</button>
            </>
          )}
          <span className="serif" style={{ fontSize: compact ? 14 : 17, fontWeight: 600, color: "var(--ink-0)", fontVariantNumeric: "tabular-nums" }}>
            {xp.current}<span className="dim" style={{ fontSize: compact ? 11 : 13 }}> / {xp.next}</span>
          </span>
        </div>
      </div>
      <div className="bar" style={{ height: compact ? 6 : 8 }}>
        <div className="fill" style={{
          width: `${pct}%`,
          background: "linear-gradient(90deg, oklch(0.55 0.12 45), var(--gold))",
        }}/>
      </div>
      {!compact && (
        <div className="dim mono" style={{ fontSize: 10, marginTop: 6 }}>
          {xp.next - xp.current} XP to level {c.level + 1}
        </div>
      )}
    </div>
  );
}

function VictoriesTrack({ c, set, compact = false }) {
  const v = c.victories ?? 0;
  const max = 30;
  const milestones = [15, 30];
  const adjust = (delta) => set("victories", Math.max(0, Math.min(max, v + delta)));
  const setTo = (n) => set("victories", n);

  return (
    <div className="card" style={{ padding: compact ? "8px 12px" : "10px 14px", background: "var(--bg-0)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span className="eyebrow">Victories</span>
        <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
          {!compact && (
            <>
              <button className="btn ghost sm" style={{ padding: "1px 7px", borderRadius: 3, fontSize: 11 }} onClick={() => adjust(-1)}>−</button>
              <button className="btn ghost sm" style={{ padding: "1px 7px", borderRadius: 3, fontSize: 11 }} onClick={() => adjust(+1)}>+</button>
            </>
          )}
          <span className="serif" style={{ fontSize: compact ? 14 : 17, fontWeight: 600, color: "var(--ink-0)", fontVariantNumeric: "tabular-nums" }}>
            {v}<span className="dim" style={{ fontSize: compact ? 11 : 13 }}> / {max}</span>
          </span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(15, 1fr)", gap: 3 }}>
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < v;
          const isMilestone = milestones.includes(i + 1);
          return (
            <button
              key={i}
              onClick={() => setTo(i + 1 === v ? i : i + 1)}
              title={`Set victories to ${i + 1 === v ? i : i + 1}${isMilestone ? " · milestone" : ""}`}
              style={{
                aspectRatio: "1 / 1",
                border: `1px solid ${filled ? (isMilestone ? "var(--gold)" : "var(--ember-deep)") : (isMilestone ? "var(--gold-soft)" : "var(--line-strong)")}`,
                background: filled ? (isMilestone ? "var(--gold)" : "var(--ember)") : "var(--bg-2)",
                cursor: "pointer",
                borderRadius: 2,
                padding: 0,
                transform: "rotate(45deg) scale(0.85)",
                boxShadow: filled ? (isMilestone ? "0 0 8px oklch(0.80 0.11 85 / 0.5)" : "0 0 5px var(--ember-glow)") : "none",
                transition: "all 0.12s",
              }}
            />
          );
        })}
      </div>
      {!compact && (
        <div className="dim mono" style={{ fontSize: 10, marginTop: 8, display: "flex", justifyContent: "space-between" }}>
          <span>Banked between sessions</span>
          <span style={{ color: "var(--gold-soft)" }}>◆ milestone every 15</span>
        </div>
      )}
    </div>
  );
}

function SurgesTile({ c, set }) {
  const s = c.surges ?? 0;
  const adjust = (delta) => set("surges", Math.max(0, s + delta));
  return (
    <div className="card" style={{ padding: "10px 14px", background: "var(--bg-0)" }}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>Surges</div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <span className="serif" style={{ fontSize: 28, fontWeight: 600, color: "var(--ember)", lineHeight: 1, textShadow: s > 0 ? "0 0 12px oklch(0.70 0.17 45 / 0.5)" : "none", fontVariantNumeric: "tabular-nums" }}>
          {s}
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <button className="btn ghost sm" style={{ padding: "1px 8px", borderRadius: 3, fontSize: 11, lineHeight: 1 }} onClick={() => adjust(+1)}>+</button>
          <button className="btn ghost sm" style={{ padding: "1px 8px", borderRadius: 3, fontSize: 11, lineHeight: 1 }} onClick={() => adjust(-1)}>−</button>
        </div>
      </div>
      <div className="dim mono" style={{ fontSize: 10, marginTop: 4 }}>+1 tier of damage</div>
    </div>
  );
}

// ----- Section Panels -----

function AbilitiesPanel({ c, set }) {
  const tiers = ["Signature", "Heroic", "Triggered"];
  return (
    <div>
      <SectionH eyebrow="The Arsenal" title="Abilities & Powers"/>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {tiers.map(tier => {
          const list = c.abilities.filter(a => a.tier === tier);
          if (!list.length) return null;
          return (
            <div key={tier}>
              <div className="flourish" style={{ justifyContent: "flex-start", marginBottom: 10 }}>{tier}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 12 }}>
                {list.map((a, i) => <AbilityCard key={i} ability={a}/>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AbilityCard({ ability: a }) {
  return (
    <div className="card" style={{ padding: "14px 16px", background: "var(--bg-2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <div className="serif" style={{ fontSize: 17, fontWeight: 600, color: "var(--ink-0)" }}>{a.name}</div>
        <div className="dim mono" style={{ fontSize: 10 }}>{a.type}</div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        {a.cost && <Pill tone="ember">{a.cost}</Pill>}
        {a.keywords && <span className="dim mono" style={{ fontSize: 10 }}>{a.keywords}</span>}
      </div>
      {a.trigger && (
        <div style={{ fontSize: 12, color: "var(--ink-2)", fontStyle: "italic", marginBottom: 6 }}>
          <span className="eyebrow" style={{ marginRight: 6 }}>Trigger</span>{a.trigger}
        </div>
      )}
      {a.potency && <PotencyStrip potency={a.potency}/>}
      <div style={{ fontSize: 13, color: "var(--ink-1)", lineHeight: 1.55 }}>{a.text}</div>
    </div>
  );
}

function PotencyStrip({ potency }) {
  const tiers = [
    { key: "weak", label: "Weak", color: "var(--ink-2)" },
    { key: "average", label: "Avg", color: "var(--ember)" },
    { key: "strong", label: "Strong", color: "var(--gold)" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, padding: "6px 8px", background: "var(--bg-0)", border: "1px solid var(--line)", borderRadius: 4 }}>
      <span className="mono" style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-2)" }}>Potency</span>
      <span className="dim mono" style={{ fontSize: 10 }}>{potency.stat ?? "—"} &lt;</span>
      <div style={{ display: "flex", gap: 4, flex: 1 }}>
        {tiers.map(t => (
          <div key={t.key} style={{ flex: 1, display: "flex", alignItems: "baseline", gap: 4 }}>
            <span className="mono" style={{ fontSize: 9, color: "var(--ink-2)", textTransform: "uppercase" }}>{t.label}</span>
            <span className="serif" style={{ fontSize: 14, fontWeight: 600, color: t.color, fontVariantNumeric: "tabular-nums" }}>{potency[t.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----- Counter tiles (wealth, renown, hero tokens) -----
function CounterTile({ label, value, icon, tone = "ember", onChange, compact = false }) {
  const color = tone === "gold" ? "var(--gold)" : "var(--ember)";
  return (
    <div className="card" style={{ padding: compact ? "8px 10px" : "12px 14px", background: "var(--bg-0)" }}>
      <div className="eyebrow" style={{ marginBottom: compact ? 2 : 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <span className="serif" style={{ fontSize: compact ? 20 : 26, fontWeight: 600, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
          <span style={{ fontSize: compact ? 12 : 14, marginRight: 4, opacity: 0.7 }}>{icon}</span>{value}
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <button className="btn ghost sm" style={{ padding: "1px 7px", borderRadius: 3, fontSize: 11, lineHeight: 1 }} onClick={() => onChange(value + 1)}>+</button>
          <button className="btn ghost sm" style={{ padding: "1px 7px", borderRadius: 3, fontSize: 11, lineHeight: 1 }} onClick={() => onChange(value - 1)}>−</button>
        </div>
      </div>
    </div>
  );
}

function TurnTakenTile({ taken, onToggle, compact = false }) {
  return (
    <button onClick={onToggle} className="card" style={{
      padding: compact ? "8px 10px" : "12px 14px",
      background: taken ? "oklch(0.30 0.05 140 / 0.30)" : "var(--bg-0)",
      border: taken ? "1px solid var(--moss)" : "1px solid var(--line)",
      cursor: "pointer", textAlign: "left", width: "100%",
      transition: "all 0.15s",
    }}>
      <div className="eyebrow" style={{ marginBottom: compact ? 2 : 6 }}>Turn</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: compact ? 16 : 20, height: compact ? 16 : 20,
          border: `2px solid ${taken ? "var(--moss)" : "var(--line-strong)"}`,
          borderRadius: "50%",
          background: taken ? "var(--moss)" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--bg-0)", fontSize: compact ? 10 : 12, fontWeight: 700,
        }}>{taken ? "✓" : ""}</div>
        <span className="serif" style={{ fontSize: compact ? 13 : 15, color: taken ? "var(--moss)" : "var(--ink-1)", fontWeight: 600 }}>
          {taken ? "Taken" : "Ready"}
        </span>
      </div>
    </button>
  );
}

// ----- Skills & Perks panel -----
function SkillsPerksPanel({ c, set }) {
  const skills = c.skills || [];
  const perks = c.perks || [];
  const groups = ["Crafting", "Exploration", "Interpersonal", "Intrigue", "Lore"];
  const toggleEdge = (i) => {
    const next = [...skills];
    next[i] = { ...next[i], edge: !next[i].edge };
    set("skills", next);
  };
  return (
    <div>
      <SectionH eyebrow="Trained & Honed" title="Skills & Perks"/>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
        <div>
          <div className="flourish" style={{ justifyContent: "flex-start", marginBottom: 10 }}>Skills</div>
          {skills.length === 0 ? (
            <div className="muted italic serif" style={{ fontSize: 14, padding: "12px 0" }}>No trained skills.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {groups.map(g => {
                const list = skills.map((s, i) => ({ ...s, _i: i })).filter(s => s.group === g);
                if (!list.length) return null;
                return (
                  <div key={g} style={{ marginBottom: 8 }}>
                    <div className="dim mono" style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>{g}</div>
                    {list.map(s => (
                      <div key={s._i} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, alignItems: "center", padding: "6px 8px", borderBottom: "1px solid var(--line)" }}>
                        <button onClick={() => toggleEdge(s._i)} title="Edge" style={{
                          width: 18, height: 18, padding: 0,
                          border: `1.5px solid ${s.edge ? "var(--ember)" : "var(--line-strong)"}`,
                          background: s.edge ? "var(--ember)" : "transparent",
                          borderRadius: 3, cursor: "pointer",
                          color: "var(--bg-0)", fontSize: 11, fontWeight: 700, lineHeight: 1,
                          boxShadow: s.edge ? "0 0 6px var(--ember-glow)" : "none",
                        }}>{s.edge ? "✓" : ""}</button>
                        <span className="serif" style={{ fontSize: 14, color: "var(--ink-0)" }}>{s.name}</span>
                        <span className="mono" style={{ fontSize: 9, color: s.edge ? "var(--ember)" : "var(--ink-2)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.edge ? "Edge" : "Trained"}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div>
          <div className="flourish" style={{ justifyContent: "flex-start", marginBottom: 10 }}>Perks</div>
          {perks.length === 0 ? (
            <div className="muted italic serif" style={{ fontSize: 14, padding: "12px 0" }}>No perks taken.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {perks.map((p, i) => (
                <div key={i} style={{ padding: "10px 12px", border: "1px solid var(--line)", borderLeft: "2px solid var(--gold)", background: "var(--bg-2)", borderRadius: "0 6px 6px 0" }}>
                  <div className="serif" style={{ fontSize: 14, color: "var(--ink-0)", fontWeight: 600, marginBottom: 3 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-1)", lineHeight: 1.5 }}>{p.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----- Downtime projects -----
function ProjectsPanel({ c, set }) {
  const projects = c.projects || [];
  const adjust = (i, delta) => {
    const next = [...projects];
    next[i] = { ...next[i], progress: Math.max(0, Math.min(next[i].goal, next[i].progress + delta)) };
    set("projects", next);
  };
  return (
    <div>
      <SectionH eyebrow="Between sessions" title="Downtime Projects" action={
        <button className="btn ghost sm">+ Project</button>
      }/>
      {projects.length === 0 ? (
        <div className="muted italic serif" style={{ fontSize: 14, padding: "20px 0", textAlign: "center" }}>Nothing in the workshop.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {projects.map((p, i) => {
            const pct = Math.max(0, Math.min(100, (p.progress / p.goal) * 100));
            const done = p.progress >= p.goal;
            return (
              <div key={i} style={{ padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 6, background: "var(--bg-2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6, gap: 12 }}>
                  <div className="serif" style={{ fontSize: 15, color: "var(--ink-0)", fontWeight: 600 }}>{p.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    {p.characteristic && <span className="dim mono" style={{ fontSize: 10 }}>{p.characteristic}</span>}
                    <button className="btn ghost sm" style={{ padding: "1px 7px", borderRadius: 3, fontSize: 11 }} onClick={() => adjust(i, -1)}>−</button>
                    <button className="btn ghost sm" style={{ padding: "1px 7px", borderRadius: 3, fontSize: 11 }} onClick={() => adjust(i, +1)}>+</button>
                    <span className="serif" style={{ fontSize: 15, color: done ? "var(--moss)" : "var(--ink-0)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                      {p.progress}<span className="dim" style={{ fontSize: 12 }}> / {p.goal}</span>
                    </span>
                  </div>
                </div>
                <div className="bar" style={{ height: 6 }}>
                  <div className="fill" style={{
                    width: `${pct}%`,
                    background: done ? "var(--moss)" : "linear-gradient(90deg, oklch(0.55 0.10 80), var(--gold))",
                  }}/>
                </div>
                {done && <div className="mono" style={{ fontSize: 10, color: "var(--moss)", marginTop: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>● Complete</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FeaturesPanel({ c, set }) {
  return (
    <div>
      <SectionH eyebrow="Class & Kit" title="Features"/>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {c.features.map((f, i) => (
          <div key={i} style={{ padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 6, background: "var(--bg-2)" }}>
            <div className="serif" style={{ fontSize: 16, fontWeight: 600, color: "var(--ink-0)", marginBottom: 4 }}>{f.name}</div>
            <div style={{ fontSize: 13, color: "var(--ink-1)", lineHeight: 1.55 }}>{f.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InventoryPanel({ c, set }) {
  return (
    <div>
      <SectionH eyebrow="On their person" title="Inventory & Treasures" action={
        <button className="btn ghost sm">+ Item</button>
      }/>
      <div style={{ borderTop: "1px solid var(--line)" }}>
        {c.inventory.map((it, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 16, padding: "10px 4px", borderBottom: "1px solid var(--line)" }}>
            <div className="serif" style={{ fontSize: 15, color: "var(--ink-0)" }}>{it.name}</div>
            <div className="muted italic serif" style={{ fontSize: 13 }}>{it.note || "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TiesPanel({ c, set }) {
  return (
    <div>
      <SectionH eyebrow="The Web" title="Ties & Backstory"/>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <div className="flourish" style={{ justifyContent: "flex-start", marginBottom: 10 }}>Ties</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {c.ties.map((t, i) => (
              <div key={i} style={{ padding: "10px 12px", border: "1px solid var(--line)", borderLeft: "2px solid var(--ember)", background: "var(--bg-2)", borderRadius: "0 6px 6px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span className="serif" style={{ fontSize: 14, color: "var(--ink-0)", fontWeight: 600 }}>{t.who}</span>
                  <span className="dim mono" style={{ fontSize: 10 }}>{t.how}</span>
                </div>
                <div className="muted italic" style={{ fontSize: 12 }}>{t.note}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flourish" style={{ justifyContent: "flex-start", marginBottom: 10 }}>Story</div>
          <div className="serif italic" style={{ fontSize: 14, color: "var(--ink-1)", lineHeight: 1.65, marginBottom: 16, padding: "0 4px" }}>
            "<Editable multiline value={c.backstory} onChange={v => set("backstory", v)}/>"
          </div>
          <div className="flourish" style={{ justifyContent: "flex-start", marginBottom: 10 }}>Goals</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            {c.goals.map((g, i) => (
              <li key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--ink-1)", padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
                <span style={{ color: "var(--ember)", fontFamily: "var(--font-display)" }}>✦</span> {g}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ConditionsPanel({ c, set }) {
  return (
    <div>
      <SectionH eyebrow="The State of Things" title="Conditions & Notes"/>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        <div>
          <div className="flourish" style={{ justifyContent: "flex-start", marginBottom: 10 }}>Conditions</div>
          {c.conditions.length === 0 ? (
            <div className="muted italic serif" style={{ fontSize: 14, padding: "20px 0", textAlign: "center" }}>None — for now.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {c.conditions.map((cond, i) => (
                <div key={i} style={{ padding: "10px 12px", border: "1px solid oklch(0.42 0.10 25)", background: "oklch(0.30 0.08 25 / 0.20)", borderRadius: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span className="serif" style={{ color: "var(--ink-0)", fontWeight: 600 }}>{cond.name}</span>
                    <span className="dim mono" style={{ fontSize: 10 }}>{cond.duration}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{cond.source}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <DamageList
            title="Weaknesses"
            tone="blood"
            items={c.weaknesses || []}
            empty="No known weaknesses."
            sign="+"
            sub="extra damage taken"
          />
          <div style={{ height: 16 }}></div>
          <DamageList
            title="Immunities"
            tone="moss"
            items={c.immunities || []}
            empty="Vulnerable to all."
            sign="−"
            sub="damage reduced"
          />
        </div>
        <div>
          <div className="flourish" style={{ justifyContent: "flex-start", marginBottom: 10 }}>Notes</div>
          <div style={{ padding: "0 4px" }}>
            <Editable multiline value={c.notes} onChange={v => set("notes", v)}
              style={{ minHeight: 100, fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 14, color: "var(--ink-1)", lineHeight: 1.6 }}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function DamageList({ title, tone, items, empty, sign, sub }) {
  const colors = tone === "blood"
    ? { border: "oklch(0.42 0.10 25)", bg: "oklch(0.30 0.08 25 / 0.20)", text: "var(--blood)" }
    : { border: "oklch(0.40 0.06 140)", bg: "oklch(0.30 0.05 140 / 0.20)", text: "var(--moss)" };
  return (
    <div>
      <div className="flourish" style={{ justifyContent: "flex-start", marginBottom: 10 }}>{title}</div>
      {items.length === 0 ? (
        <div className="muted italic serif" style={{ fontSize: 13, padding: "12px 0" }}>{empty}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {items.map((it, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 12,
              padding: "8px 12px", border: `1px solid ${colors.border}`,
              background: colors.bg, borderRadius: 6,
            }}>
              <div>
                <div className="serif" style={{ fontSize: 14, color: "var(--ink-0)", fontWeight: 600 }}>{it.type}</div>
                <div className="dim mono" style={{ fontSize: 10, marginTop: 1 }}>{sub}</div>
              </div>
              <div className="serif" style={{ fontSize: 22, fontWeight: 600, color: colors.text, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                {sign}{it.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

window.CharactersTab = CharactersTab;

// ----- Culture & Career panel -----
function OriginPanel({ c, set }) {
  const culture = c.culture || {};
  const career = c.careerData || {};
  return (
    <div>
      <SectionH eyebrow="Where they come from" title="Culture & Career"/>

      {/* Career card */}
      <div style={{
        padding: "16px 18px", marginBottom: 24,
        border: "1px solid var(--line)", borderLeft: "3px solid var(--gold)",
        background: "linear-gradient(180deg, oklch(0.30 0.03 85 / 0.10), transparent)",
        borderRadius: "0 6px 6px 0",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, gap: 12 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Career</div>
            <div className="serif" style={{ fontSize: 22, fontWeight: 600, color: "var(--ink-0)", letterSpacing: "0.005em" }}>{c.career}</div>
          </div>
          {career.skills && career.skills.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {career.skills.map(s => <Pill key={s} tone="gold">{s}</Pill>)}
            </div>
          )}
        </div>
        {career.benefits && (
          <div style={{ marginBottom: 14 }}>
            <div className="dim mono" style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Benefits</div>
            <div style={{ fontSize: 13, color: "var(--ink-1)", lineHeight: 1.55 }}>{career.benefits}</div>
          </div>
        )}
        {career.perk && (
          <div style={{ marginBottom: 14, padding: "10px 12px", background: "var(--bg-2)", borderRadius: 4, border: "1px solid var(--line)" }}>
            <div className="dim mono" style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4, color: "var(--gold)" }}>Career Perk</div>
            <div style={{ fontSize: 13, color: "var(--ink-1)", lineHeight: 1.55 }}>{career.perk}</div>
          </div>
        )}
        {career.incident && (
          <div className="serif italic" style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6, paddingLeft: 12, borderLeft: "2px solid var(--ember-deep)" }}>
            <span className="eyebrow" style={{ marginRight: 8, color: "var(--ember)" }}>Inciting Incident</span>
            {career.incident}
          </div>
        )}
      </div>

      {/* Culture & Backgrounds */}
      <div className="flourish" style={{ justifyContent: "flex-start", marginBottom: 14 }}>Culture & Backgrounds</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <CultureField label="Environment" value={culture.environment} icon="◐"/>
        <CultureField label="Organization" value={culture.organization} icon="◇"/>
        <CultureField label="Upbringing" value={culture.upbringing} icon="✦"/>
        <CultureField label="Languages" value={(culture.languages || []).join(" · ")} icon="❝"/>
      </div>

      {/* Complications */}
      <div>
        <div className="dim mono" style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8, color: "var(--blood)" }}>Complications</div>
        {(!culture.complications || culture.complications.length === 0) ? (
          <div className="muted italic serif" style={{ fontSize: 13, padding: "8px 0" }}>No known complications.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {culture.complications.map((comp, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, alignItems: "flex-start",
                padding: "8px 12px",
                background: "oklch(0.30 0.06 25 / 0.15)",
                border: "1px solid oklch(0.40 0.08 25)",
                borderRadius: 4,
              }}>
                <span style={{ color: "var(--blood)", fontFamily: "var(--font-display)", fontSize: 14, lineHeight: 1.4, flexShrink: 0 }}>※</span>
                <span className="serif italic" style={{ fontSize: 13, color: "var(--ink-1)", lineHeight: 1.55 }}>{comp}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CultureField({ label, value, icon }) {
  return (
    <div style={{
      padding: "10px 14px",
      border: "1px solid var(--line)",
      background: "var(--bg-2)",
      borderRadius: 6,
    }}>
      <div className="eyebrow" style={{ marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: "var(--ember)", fontFamily: "var(--font-display)", fontSize: 11, opacity: 0.8 }}>{icon}</span>
        {label}
      </div>
      <div className="serif" style={{ fontSize: 14, color: "var(--ink-0)", lineHeight: 1.4 }}>{value || <span className="muted italic">Unknown</span>}</div>
    </div>
  );
}

// ----- Inline dice panel (compact) for character-sheet section -----
function DicePanel() {
  return (
    <div>
      <SectionH eyebrow="The Bones" title="Dice"/>
      <DiceTab/>
    </div>
  );
}
window.DicePanel = DicePanel;
