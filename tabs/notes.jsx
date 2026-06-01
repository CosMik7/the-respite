// Notes tab — shared timeline

function NotesTab() {
  const app = useApp();
  const { notes, players, sessions, meId, addNote } = app;
  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState("");
  const [tagDraft, setTagDraft] = useState("");

  const sorted = [...notes].sort((a, b) => new Date(b.posted) - new Date(a.posted));
  const filtered = filter === "all" ? sorted : sorted.filter(n => n.tags.includes(filter));
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  const post = () => {
    if (!draft.trim()) return;
    addNote({
      authorId: meId,
      body: draft.trim(),
      tags: tagDraft.split(",").map(t => t.trim()).filter(Boolean),
      sessionId: sessions.find(s => s.upcoming)?.id || null,
    });
    setDraft("");
    setTagDraft("");
  };

  const me = players.find(p => p.id === meId);

  return (
    <div className="page" style={{ maxWidth: 880 }}>
      <SectionH eyebrow="Memoria" title="The shared chronicle"/>

      {/* Composer */}
      <Card rail style={{ marginBottom: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14 }}>
          <Avatar player={me} size="lg"/>
          <div>
            <div style={{ marginBottom: 6 }}>
              <span className="serif" style={{ color: "var(--ink-0)", fontWeight: 600, fontSize: 15 }}>{me.name}</span>
              <span className="dim italic serif" style={{ fontSize: 13, marginLeft: 8 }}>posts to the table</span>
            </div>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Theory, recap, request, joke. Speak it into the page."
              style={{
                width: "100%", minHeight: 80, padding: "10px 12px",
                background: "var(--bg-0)", border: "1px solid var(--line)", borderRadius: 6,
                color: "var(--ink-0)", fontSize: 14, fontFamily: "var(--font-serif)", lineHeight: 1.55,
                outline: "none", resize: "vertical",
              }}
            />
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 10 }}>
              <input
                value={tagDraft}
                onChange={e => setTagDraft(e.target.value)}
                placeholder="tags, comma, separated"
                style={{
                  flex: 1, padding: "6px 10px",
                  background: "var(--bg-0)", border: "1px solid var(--line)", borderRadius: 4,
                  color: "var(--ink-1)", fontSize: 12, fontFamily: "var(--font-mono)",
                  outline: "none",
                }}
              />
              <button className="btn ember" onClick={post}>Post to the chronicle</button>
            </div>
          </div>
        </div>
      </Card>

      {/* Filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <span className="eyebrow" style={{ marginRight: 6 }}>Filter</span>
        <button className={`pill ${filter === "all" ? "ember" : ""}`} style={{ cursor: "pointer" }} onClick={() => setFilter("all")}>All · {notes.length}</button>
        {allTags.map(t => (
          <button key={t} className={`pill ${filter === t ? "ember" : ""}`} style={{ cursor: "pointer" }} onClick={() => setFilter(t)}>
            #{t} · {notes.filter(n => n.tags.includes(t)).length}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 27, top: 0, bottom: 0, width: 1, background: "linear-gradient(180deg, transparent, var(--line) 8%, var(--line) 92%, transparent)" }}/>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {filtered.map(n => <NoteEntry key={n.id} note={n} players={players} sessions={sessions}/>)}
        </div>
      </div>
    </div>
  );
}

function NoteEntry({ note, players, sessions }) {
  const author = players.find(p => p.id === note.authorId);
  const session = sessions.find(s => s.id === note.sessionId);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "56px 1fr", gap: 14 }}>
      <div style={{ position: "relative", zIndex: 1 }}>
        <Avatar player={author} size="lg"/>
      </div>
      <Card style={{ background: "var(--bg-1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
          <div>
            <span className="serif" style={{ color: "var(--ink-0)", fontWeight: 600, fontSize: 15 }}>{author?.name}</span>
            <span className="dim italic serif" style={{ fontSize: 12, marginLeft: 8 }}>· {fmtRelative(note.posted)}</span>
          </div>
          {session && (
            <span className="dim mono" style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              re: S{String(session.number).padStart(2, "0")} {session.title}
            </span>
          )}
        </div>
        <div className="serif" style={{ fontSize: 14.5, color: "var(--ink-1)", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
          {note.body}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          {note.tags.map(t => (
            <span key={t} className="dim mono" style={{ fontSize: 11 }}>#{t}</span>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button className="dim" style={{ background: "transparent", border: 0, fontSize: 12, cursor: "pointer", padding: 0 }}>Reply</button>
            <button className="dim" style={{ background: "transparent", border: 0, fontSize: 12, cursor: "pointer", padding: 0 }}>↻</button>
          </div>
        </div>
      </Card>
    </div>
  );
}

window.NotesTab = NotesTab;
