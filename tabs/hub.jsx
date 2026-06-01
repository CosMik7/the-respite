// Hub homepage — landing dashboard

const { useApp: _useAppHub, Card: _CardHub, Avatar: _AvatarHub, Pill: _PillHub, useCountdown: _useCountdownHub, fmtDate: _fmtDateHub, fmtTime: _fmtTimeHub, fmtRelative: _fmtRelativeHub, PortraitPlaceholder: _PortraitHub } = window;

function Hub() {
  const app = useApp();
  const { setTab, setSelectedPlayer, sessions, players, characters, notes } = app;
  const upcoming = sessions.find(s => s.upcoming);
  const cd = useCountdown(upcoming.date);
  const recentNotes = [...notes].sort((a,b) => new Date(b.posted) - new Date(a.posted)).slice(0, 3);

  const meId = app.meId;
  const myRsvp = upcoming.rsvps[meId];

  return (
    <div className="page">
      {/* Hero — countdown + welcome */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, marginBottom: 36 }}>
        <Card rail style={{ padding: "32px 36px", background: "linear-gradient(135deg, var(--bg-1) 0%, var(--bg-2) 100%)" }} pad={false}>
          <div style={{ padding: "32px 36px" }}>
            <div className="flourish" style={{ marginBottom: 16, justifyContent: "flex-start", maxWidth: 360 }}>By the hearth · Session {upcoming.number}</div>
            <h1 className="brand-mark" style={{ fontSize: 44, margin: "0 0 8px", color: "var(--ink-0)", lineHeight: 1.1, letterSpacing: "0.005em" }}>
              {upcoming.title}
            </h1>
            <div className="serif italic" style={{ color: "var(--ink-2)", fontSize: 17, marginBottom: 24, maxWidth: 540 }}>
              "{upcoming.summary}"
            </div>

            <div style={{ display: "flex", gap: 28, alignItems: "flex-end", flexWrap: "wrap" }}>
              {[
                { label: "Days", val: cd.days },
                { label: "Hours", val: cd.hours },
                { label: "Mins", val: cd.mins },
                { label: "Secs", val: cd.secs },
              ].map(b => (
                <div key={b.label}>
                  <div className="serif" style={{ fontSize: 56, fontWeight: 600, color: "var(--ember)", lineHeight: 1, fontVariantNumeric: "tabular-nums", textShadow: "0 0 24px oklch(0.70 0.17 45 / 0.4)" }}>
                    {String(b.val).padStart(2, "0")}
                  </div>
                  <div className="display" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>{b.label}</div>
                </div>
              ))}
            </div>

            <div className="rule" style={{ margin: "28px 0 20px" }}></div>

            <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
              <span className="muted" style={{ fontSize: 13 }}>
                <span className="display" style={{ color: "var(--ember)", marginRight: 8 }}>{fmtDate(upcoming.date, { weekday: "long" })}</span>
                · {fmtTime(upcoming.date)} · {upcoming.location}
              </span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                {["yes", "maybe", "no"].map(opt => (
                  <button
                    key={opt}
                    className={`btn sm ${myRsvp === opt ? "ember" : "ghost"}`}
                    onClick={() => app.setRsvp(upcoming.id, meId, opt)}
                    style={{ textTransform: "capitalize" }}
                  >
                    {opt === "yes" ? "I'll be there" : opt === "maybe" ? "Maybe" : "Can't make it"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flourish" style={{ marginBottom: 14, justifyContent: "flex-start" }}>The Party</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {players.filter(p => p.role === "Player").map(p => {
              const c = characters[p.id];
              const rsvp = upcoming.rsvps[p.id];
              return (
                <div
                  key={p.id}
                  onClick={() => { setSelectedPlayer(p.id); setTab("characters"); }}
                  style={{
                    display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center",
                    padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 6,
                    background: "var(--bg-0)", cursor: "pointer", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--ember-soft)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; }}
                >
                  <Avatar player={p} />
                  <div style={{ minWidth: 0 }}>
                    <div className="serif" style={{ fontSize: 16, color: "var(--ink-0)", fontWeight: 600, lineHeight: 1.1 }}>
                      {c?.name || p.name}
                    </div>
                    <div className="dim" style={{ fontSize: 11, marginTop: 2 }}>
                      {c ? `${c.ancestry} · ${c.cls} ${c.level}` : p.role} · played by {p.name}
                    </div>
                  </div>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: rsvp === "yes" ? "var(--moss)" : rsvp === "maybe" ? "var(--gold)" : rsvp === "no" ? "var(--blood)" : "var(--ink-3)",
                    boxShadow: rsvp === "yes" ? "0 0 8px var(--moss)" : "none",
                  }} title={`RSVP: ${rsvp}`}/>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Quick tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 36 }}>
        {[
          { tab: "events", eyebrow: "Schedule", title: "Events", body: `${sessions.filter(s => s.upcoming).length} upcoming · ${sessions.filter(s => s.past).length} logged` },
          { tab: "characters", eyebrow: "Heroes", title: "Sheets", body: `${Object.keys(characters).length} characters · L${Object.values(characters)[0].level}` },
          { tab: "media", eyebrow: "Vault", title: "Media", body: `${app.media.length} items in ${new Set(app.media.map(m => m.folder)).size} folders` },
          { tab: "notes", eyebrow: "Memoria", title: "Notes", body: `${notes.length} entries · ${recentNotes.length ? fmtRelative(recentNotes[0].posted) : ""}` },
        ].map(t => (
          <button
            key={t.tab}
            onClick={() => setTab(t.tab)}
            className="card"
            style={{
              padding: "20px 22px", textAlign: "left", cursor: "pointer", transition: "all 0.15s",
              background: "var(--bg-1)", border: "1px solid var(--line)",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--ember-soft)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.transform = "none"; }}
          >
            <div className="eyebrow" style={{ marginBottom: 8 }}>{t.eyebrow}</div>
            <div className="serif" style={{ fontSize: 24, fontWeight: 600, color: "var(--ink-0)", marginBottom: 4 }}>{t.title}</div>
            <div className="dim" style={{ fontSize: 12 }}>{t.body}</div>
          </button>
        ))}
      </div>

      {/* Recent notes + last session */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
        <Card>
          <SectionH eyebrow="Memoria" title="From the table" action={
            <button className="btn ghost sm" onClick={() => setTab("notes")}>All notes →</button>
          } />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {recentNotes.map(n => {
              const author = players.find(p => p.id === n.authorId);
              return (
                <div key={n.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12 }}>
                  <Avatar player={author} />
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 4 }}>
                      <span className="serif" style={{ color: "var(--ink-0)", fontWeight: 600 }}>{author?.name}</span>
                      <span className="dim" style={{ fontSize: 11 }}>· {fmtRelative(n.posted)}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--ink-1)", lineHeight: 1.55 }}>{n.body}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <SectionH eyebrow="Last session" title={`#${sessions.find(s => s.past).number} — ${sessions.find(s => s.past).title}`} action={null}/>
          <div className="serif italic" style={{ color: "var(--ink-1)", fontSize: 15, lineHeight: 1.55, marginBottom: 16 }}>
            "{sessions.find(s => s.past).recap}"
          </div>
          <div className="dim" style={{ fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>Attendance</div>
          <div style={{ display: "flex", gap: 6 }}>
            {players.map(p => {
              const r = sessions.find(s => s.past).rsvps[p.id];
              return (
                <div key={p.id} style={{ position: "relative", opacity: r === "yes" ? 1 : 0.35 }}>
                  <Avatar player={p}/>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

window.Hub = Hub;
