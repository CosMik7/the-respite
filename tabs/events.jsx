// Events tab — upcoming, past, attendance

function EventsTab() {
  const app = useApp();
  const { sessions, players, setRsvp, meId } = app;
  const upcoming = sessions.filter(s => s.upcoming).sort((a,b) => new Date(a.date) - new Date(b.date));
  const past = sessions.filter(s => s.past).sort((a,b) => new Date(b.date) - new Date(a.date));
  const next = upcoming[0];
  const cd = useCountdown(next.date);

  return (
    <div className="page">
      {/* Hero countdown */}
      <Card pad={false} style={{ marginBottom: 32, padding: "32px 36px", background: "linear-gradient(135deg, var(--bg-1) 0%, var(--bg-2) 100%)" }} rail>
        <div style={{ padding: "32px 36px", display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>The next gathering</div>
            <h1 className="serif" style={{ fontSize: 36, margin: "0 0 8px", color: "var(--ink-0)", letterSpacing: "0.005em" }}>{next.title}</h1>
            <div className="muted serif italic" style={{ fontSize: 16, marginBottom: 16 }}>"{next.summary}"</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              <Pill tone="ember">{fmtDate(next.date, { weekday: "long" })}</Pill>
              <Pill>{fmtTime(next.date)}</Pill>
              <Pill tone={next.mode === "in-person" ? "moss" : next.mode === "remote" ? "gold" : ""}>{next.mode}</Pill>
              <span className="dim" style={{ fontSize: 13 }}>· {next.location}</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Until then</div>
            <div className="serif" style={{ fontSize: 64, fontWeight: 600, color: "var(--ember)", lineHeight: 1, fontVariantNumeric: "tabular-nums", textShadow: "0 0 24px oklch(0.70 0.17 45 / 0.4)" }}>
              {cd.days}<span className="dim" style={{ fontSize: 22 }}>d</span> {String(cd.hours).padStart(2,"0")}<span className="dim" style={{ fontSize: 22 }}>h</span>
            </div>
            <div className="dim mono" style={{ fontSize: 11, marginTop: 6 }}>
              {String(cd.mins).padStart(2, "0")}m {String(cd.secs).padStart(2, "0")}s
            </div>
          </div>
        </div>
      </Card>

      {/* Upcoming */}
      <SectionH eyebrow="Upcoming" title="On the road ahead" action={
        <button className="btn ghost sm">+ Schedule</button>
      }/>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
        {upcoming.map(s => <UpcomingRow key={s.id} session={s} players={players} setRsvp={setRsvp} meId={meId}/>)}
      </div>

      {/* Past */}
      <SectionH eyebrow="The Chronicle" title="Sessions logged" action={
        <span className="dim mono" style={{ fontSize: 11 }}>{past.length} sessions · {past.reduce((a,s) => a + Object.values(s.rsvps).filter(v => v === "yes").length, 0)} attendances</span>
      }/>
      <div style={{ display: "flex", flexDirection: "column", gap: 0, borderTop: "1px solid var(--line)" }}>
        {past.map(s => <PastRow key={s.id} session={s} players={players}/>)}
      </div>
    </div>
  );
}

function UpcomingRow({ session, players, setRsvp, meId }) {
  const cd = useCountdown(session.date);
  const myRsvp = session.rsvps[meId];
  const yes = Object.entries(session.rsvps).filter(([_, v]) => v === "yes").map(([k]) => k);
  const maybe = Object.entries(session.rsvps).filter(([_, v]) => v === "maybe").map(([k]) => k);
  const no = Object.entries(session.rsvps).filter(([_, v]) => v === "no").map(([k]) => k);

  return (
    <Card rail>
      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 24, alignItems: "center" }}>
        {/* Date block */}
        <div style={{ textAlign: "center", borderRight: "1px solid var(--line)", paddingRight: 24 }}>
          <div className="display" style={{ color: "var(--ember)", fontSize: 14, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {new Date(session.date).toLocaleDateString(undefined, { month: "short" })}
          </div>
          <div className="serif" style={{ fontSize: 38, color: "var(--ink-0)", lineHeight: 1, fontWeight: 600 }}>
            {new Date(session.date).getDate()}
          </div>
          <div className="dim" style={{ fontSize: 11, marginTop: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {new Date(session.date).toLocaleDateString(undefined, { weekday: "short" })} · {fmtTime(session.date)}
          </div>
        </div>

        {/* Body */}
        <div>
          <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 6 }}>
            <span className="dim mono" style={{ fontSize: 11 }}>SESSION {String(session.number).padStart(2, "0")}</span>
            <Pill tone={session.mode === "in-person" ? "moss" : session.mode === "remote" ? "gold" : ""}>{session.mode}</Pill>
            <span className="dim" style={{ fontSize: 12 }}>· {cd.days}d {cd.hours}h away</span>
          </div>
          <div className="serif" style={{ fontSize: 22, color: "var(--ink-0)", fontWeight: 600, marginBottom: 6 }}>{session.title}</div>
          <div className="muted serif italic" style={{ fontSize: 14, marginBottom: 8, maxWidth: 640 }}>"{session.summary}"</div>
          <div className="dim" style={{ fontSize: 12 }}>📍 {session.location}</div>
        </div>

        {/* RSVP */}
        <div style={{ minWidth: 200 }}>
          <div className="dim" style={{ fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6, textAlign: "right" }}>Your RSVP</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 12, justifyContent: "flex-end" }}>
            {[
              { v: "yes", label: "Yes" },
              { v: "maybe", label: "Maybe" },
              { v: "no", label: "No" },
            ].map(o => (
              <button key={o.v}
                className={`btn sm ${myRsvp === o.v ? "ember" : "ghost"}`}
                onClick={() => setRsvp(session.id, meId, o.v)}>
                {o.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <AttendanceCluster players={players} ids={yes} tone="moss" label={`${yes.length} in`}/>
            {maybe.length > 0 && <AttendanceCluster players={players} ids={maybe} tone="gold" label={`${maybe.length} maybe`}/>}
            {no.length > 0 && <AttendanceCluster players={players} ids={no} tone="blood" label={`${no.length} out`} dim/>}
          </div>
        </div>
      </div>
    </Card>
  );
}

function AttendanceCluster({ players, ids, tone, label, dim = false }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, opacity: dim ? 0.6 : 1 }} title={label}>
      <div style={{ display: "flex" }}>
        {ids.map((id, i) => {
          const p = players.find(pp => pp.id === id);
          if (!p) return null;
          return (
            <div key={id} style={{ marginLeft: i === 0 ? 0 : -8, border: "2px solid var(--bg-1)", borderRadius: "50%" }}>
              <Avatar player={p}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PastRow({ session, players }) {
  const [open, setOpen] = useState(false);
  const yes = Object.entries(session.rsvps).filter(([_, v]) => v === "yes").map(([k]) => k);

  return (
    <div style={{ borderBottom: "1px solid var(--line)" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "grid", gridTemplateColumns: "60px 1fr auto auto", gap: 20, alignItems: "center",
          width: "100%", textAlign: "left", padding: "16px 4px", background: "transparent", border: 0,
        }}
      >
        <div className="dim mono" style={{ fontSize: 11 }}>S{String(session.number).padStart(2, "0")}</div>
        <div>
          <div className="serif" style={{ fontSize: 16, color: "var(--ink-0)", fontWeight: 600 }}>{session.title}</div>
          <div className="dim" style={{ fontSize: 12, marginTop: 2 }}>{fmtDate(session.date)} · {session.location}</div>
        </div>
        <div style={{ display: "flex" }}>
          {players.map((p, i) => {
            const present = yes.includes(p.id);
            return (
              <div key={p.id} style={{
                marginLeft: i === 0 ? 0 : -6,
                opacity: present ? 1 : 0.25,
                filter: present ? "none" : "grayscale(0.8)",
              }}>
                <Avatar player={p}/>
              </div>
            );
          })}
        </div>
        <div className="dim" style={{ fontSize: 18, transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</div>
      </button>
      {open && (
        <div style={{ padding: "0 4px 20px 84px" }}>
          <div className="muted serif italic" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>"{session.summary}"</div>
          {session.recap && (
            <div style={{
              padding: "12px 16px", borderLeft: "2px solid var(--ember)",
              background: "var(--bg-1)", borderRadius: "0 6px 6px 0",
              fontSize: 13, color: "var(--ink-1)", lineHeight: 1.6,
            }}>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Recap</div>
              {session.recap}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

window.EventsTab = EventsTab;
