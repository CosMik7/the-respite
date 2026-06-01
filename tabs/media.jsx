// Media tab — folders, gallery, docs, links

function MediaTab() {
  const app = useApp();
  const { media, players } = app;
  const [folder, setFolder] = useState("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");

  const folders = ["All", ...Array.from(new Set(media.map(m => m.folder)))];
  const filtered = media.filter(m => {
    if (folder !== "All" && m.folder !== folder) return false;
    if (search && !(m.title.toLowerCase().includes(search.toLowerCase()) ||
                    m.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))) return false;
    return true;
  });

  return (
    <div className="page">
      <SectionH eyebrow="The Vault" title="Media & references" action={
        <div style={{ display: "flex", gap: 8 }}>
          <button className={`btn ghost sm ${view === "grid" ? "ember" : ""}`} onClick={() => setView("grid")}>Grid</button>
          <button className={`btn ghost sm ${view === "list" ? "ember" : ""}`} onClick={() => setView("list")}>List</button>
          <button className="btn sm">+ Upload</button>
        </div>
      }/>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24 }}>
        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <input
            type="text"
            placeholder="Search the vault…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: "8px 12px", background: "var(--bg-1)",
              border: "1px solid var(--line)", borderRadius: 6,
              color: "var(--ink-0)", fontSize: 13, marginBottom: 8, outline: "none",
            }}
          />
          <div className="eyebrow" style={{ padding: "8px 4px 4px" }}>Folders</div>
          {folders.map(f => {
            const count = f === "All" ? media.length : media.filter(m => m.folder === f).length;
            const active = folder === f;
            return (
              <button key={f} onClick={() => setFolder(f)}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 12px", borderRadius: 4, border: 0,
                  background: active ? "var(--bg-2)" : "transparent",
                  color: active ? "var(--ember)" : "var(--ink-1)",
                  textAlign: "left", fontSize: 13, fontFamily: "var(--font-serif)", fontWeight: active ? 600 : 400,
                  borderLeft: active ? "2px solid var(--ember)" : "2px solid transparent",
                }}>
                {f}
                <span className="dim mono" style={{ fontSize: 11 }}>{count}</span>
              </button>
            );
          })}
          <div className="eyebrow" style={{ padding: "16px 4px 4px" }}>Common Tags</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "0 4px" }}>
            {["map", "portrait", "rules", "handout", "lore", "npc", "link"].map(t => (
              <button key={t} onClick={() => setSearch(t)}
                className="pill" style={{ cursor: "pointer", border: "1px solid var(--line)" }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="dim mono" style={{ fontSize: 11, marginBottom: 12 }}>
            {filtered.length} item{filtered.length !== 1 ? "s" : ""} {folder !== "All" && `in ${folder}`}
          </div>
          {view === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {filtered.map(m => <MediaCard key={m.id} m={m} players={players}/>)}
            </div>
          ) : (
            <div style={{ borderTop: "1px solid var(--line)" }}>
              {filtered.map(m => <MediaRow key={m.id} m={m} players={players}/>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MediaCard({ m, players }) {
  const uploader = players.find(p => p.id === m.uploader);
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", cursor: "pointer", transition: "all 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--ember-soft)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; }}>
      {m.kind === "image" && <PortraitPlaceholder tint="ember" label={m.placeholder} ratio="4 / 3" style={{ borderRadius: 0, border: 0, borderBottom: "1px solid var(--line)" }}/>}
      {m.kind === "doc" && (
        <div style={{ aspectRatio: "4 / 3", background: "var(--bg-2)", borderBottom: "1px solid var(--line)", display: "grid", placeItems: "center", position: "relative" }}>
          <div className="serif" style={{ fontSize: 64, color: "var(--ember)", opacity: 0.5, fontFamily: "var(--font-display)" }}>{m.ext?.toUpperCase()}</div>
          <div className="dim mono" style={{ position: "absolute", bottom: 8, right: 12, fontSize: 10 }}>{m.size}</div>
        </div>
      )}
      {m.kind === "link" && (
        <div style={{ aspectRatio: "4 / 3", background: "linear-gradient(135deg, var(--bg-2), var(--bg-1))", borderBottom: "1px solid var(--line)", display: "grid", placeItems: "center", position: "relative" }}>
          <div style={{ textAlign: "center" }}>
            <div className="display" style={{ fontSize: 36, color: "var(--gold)", marginBottom: 4 }}>↗</div>
            <div className="dim mono" style={{ fontSize: 11 }}>{m.url}</div>
          </div>
        </div>
      )}
      <div style={{ padding: "10px 14px 12px" }}>
        <div className="serif" style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-0)", marginBottom: 4, lineHeight: 1.2 }}>{m.title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="dim" style={{ fontSize: 11 }}>{m.folder}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {uploader && <Avatar player={uploader}/>}
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaRow({ m, players }) {
  const uploader = players.find(p => p.id === m.uploader);
  const icon = m.kind === "image" ? "▦" : m.kind === "doc" ? "▤" : "↗";
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "auto 1fr 100px 90px 100px auto", gap: 16,
      alignItems: "center", padding: "12px 4px", borderBottom: "1px solid var(--line)",
      cursor: "pointer", transition: "background 0.1s",
    }}
      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-1)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <div className="serif" style={{ fontSize: 18, color: "var(--ember)", width: 24, textAlign: "center" }}>{icon}</div>
      <div>
        <div className="serif" style={{ fontSize: 14, color: "var(--ink-0)", fontWeight: 500 }}>{m.title}</div>
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          {m.tags.map(t => <span key={t} className="dim mono" style={{ fontSize: 10 }}>#{t}</span>)}
        </div>
      </div>
      <div className="dim" style={{ fontSize: 12 }}>{m.folder}</div>
      <div className="dim mono" style={{ fontSize: 11 }}>{m.size || m.ext || "link"}</div>
      <div className="dim" style={{ fontSize: 12 }}>{fmtDate(m.date)}</div>
      {uploader && <Avatar player={uploader}/>}
    </div>
  );
}

window.MediaTab = MediaTab;
