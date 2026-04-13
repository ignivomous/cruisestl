import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./supabase";

const ADMIN_PASSWORD = "cruisestl2026";
const REGIONS = ["city-central", "west", "south", "east", "north", "out-of-region"];
const TYPES = ["car-show", "cruise-night", "swap-meet", "car-meet", "race"];

function TypeSelector({ value, onChange }) {
  const selected = (value || "car-show").split(",").map(t => t.trim()).filter(Boolean);
  const available = TYPES.filter(t => !selected.includes(t));
  const remove = (type) => onChange(selected.filter(t => t !== type).join(","));
  const add = (type) => { if (type) onChange([...selected, type].join(",")); };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
      {selected.map(t => (
        <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 2, background: "rgba(232,64,64,0.1)", border: "1px solid rgba(232,64,64,0.2)", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#E84040" }}>
          {t}
          <button onClick={() => remove(t)} style={{ background: "none", border: "none", color: "#E84040", cursor: "pointer", fontSize: 12, lineHeight: 1, padding: 0, opacity: 0.6 }}>×</button>
        </span>
      ))}
      {available.length > 0 && (
        <select value="" onChange={e => add(e.target.value)} style={{ background: "#0f0f0f", border: "1px dashed #333", borderRadius: 2, color: "#555", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 6px", cursor: "pointer", outline: "none" }}>
          <option value="">+ Add type</option>
          {available.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      )}
    </div>
  );
}

function EditableField({ label, value, onChange, type = "text" }) {
  if (type === "textarea") {
    return (
      <div className="row">
        <span className="rlabel">{label}</span>
        <textarea className="finput" value={value || ""} onChange={e => onChange(e.target.value)} rows={3} style={{ flex: 1, resize: "vertical", fontSize: 13, lineHeight: 1.5 }} />
      </div>
    );
  }
  return (
    <div className="row">
      <span className="rlabel">{label}</span>
      <input className="finput" type={type} value={value || ""} onChange={e => onChange(e.target.value)} style={{ flex: 1, padding: "3px 8px", fontSize: 13 }} />
    </div>
  );
}

function RegionField({ value, onChange }) {
  return (
    <div className="row">
      <span className="rlabel">Region</span>
      <select className="finput" value={value || "out-of-region"} onChange={e => onChange(e.target.value)} style={{ width: "auto", minWidth: 180, padding: "3px 8px", fontSize: 13 }}>
        {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
    </div>
  );
}

function EventCard({ event, onSave, onDelete }) {
  const [fields, setFields] = useState({ ...event });
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // null | "saving" | "saved" | "error" | "deleting"
  const [error, setError] = useState(null);
  const fileRef = useRef();
  const set = (key) => (val) => setFields(f => ({ ...f, [key]: val }));

const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setUploading(true);
  setError(null);
  const ext = file.name.split(".").pop();
const path = `submissions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
const { data: uploadData, error: uploadError } = await supabase.storage
  .from("flyers")
  .upload(path, file, { contentType: file.type });
  if (uploadError) {
    setError(`Upload failed: ${uploadError.message}`);
  } else {
    const { data: urlData } = supabase.storage.from("flyers").getPublicUrl(path);
    set("image")(urlData.publicUrl);
  }
  setUploading(false);
};

  const handleSave = async () => {
    setStatus("saving");
    setError(null);
    const { error } = await supabase.from("events").update({
      name: fields.name,
      date: fields.date,
      date_end: fields.date_end || null,
      types: fields.types,
      venue: fields.venue,
      address: fields.address || null,
      city: fields.city,
      state: fields.state,
      region: fields.region,
      recurring: fields.recurring,
      url: fields.url || null,
      image: fields.image || null,
      time_start: fields.time_start || null,
      time_end: fields.time_end || null,
      notes: fields.notes || null,
      featured: fields.featured || false,
    }).eq("id", fields.id);
    if (error) { setStatus("error"); setError(error.message); }
    else { setStatus("saved"); setTimeout(() => setStatus(null), 2000); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${fields.name}"? This cannot be undone.`)) return;
    setStatus("deleting");
    await onDelete(fields.id);
  };

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <input className="finput" value={fields.name || ""} onChange={e => set("name")(e.target.value)} style={{ fontSize: 20, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.04em", color: "#F0E8D8", marginBottom: 10, background: "transparent", border: "1px solid #2a2a2a" }} />
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <TypeSelector value={fields.types} onChange={set("types")} />
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: "#555", cursor: "pointer" }}>
              <input type="checkbox" checked={!!fields.recurring} onChange={e => set("recurring")(e.target.checked)} /> Recurring
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: "#F5A623", cursor: "pointer" }}>
              <input type="checkbox" checked={!!fields.featured} onChange={e => set("featured")(e.target.checked)} /> Featured
            </label>
          </div>
        </div>
        <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: "#333", whiteSpace: "nowrap" }}>
          {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <EditableField label="Date" value={fields.date} onChange={set("date")} type="date" />
        <EditableField label="Date End" value={fields.date_end} onChange={set("date_end")} type="date" />
        <EditableField label="Time Start" value={fields.time_start} onChange={set("time_start")} />
        <EditableField label="Time End" value={fields.time_end} onChange={set("time_end")} />
        <EditableField label="Venue" value={fields.venue} onChange={set("venue")} />
        <EditableField label="Address" value={fields.address} onChange={set("address")} />
        <EditableField label="City" value={fields.city} onChange={set("city")} />
        <EditableField label="State" value={fields.state} onChange={set("state")} />
        <RegionField value={fields.region} onChange={set("region")} />
        <EditableField label="Link" value={fields.url} onChange={set("url")} />
        <EditableField label="Notes" value={fields.notes} onChange={set("notes")} type="textarea" />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="row" style={{ alignItems: "flex-start" }}>
          <span className="rlabel">Flyer</span>
          <div style={{ flex: 1 }}>
            {fields.image && (
              <div style={{ marginBottom: 8 }}>
                <img src={fields.image} alt="Flyer" style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 3, border: "1px solid #1e1e1e", background: "#0a0a0a", display: "block", marginBottom: 6 }} />
                <button onClick={() => set("image")("")} style={{ fontSize: 11, color: "#E84040", background: "none", border: "none", cursor: "pointer", fontFamily: "'Barlow',sans-serif", padding: 0 }}>Remove image</button>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
            <button onClick={() => fileRef.current.click()} disabled={uploading} style={{ padding: "5px 12px", background: "transparent", border: "1px solid #2a2a2a", color: "#555", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", borderRadius: 3 }}>
              {uploading ? "Uploading..." : fields.image ? "Replace Image" : "Upload Image"}
            </button>
          </div>
        </div>
      </div>

      {error && <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: "#E84040", marginBottom: 12, padding: "8px 12px", background: "rgba(232,64,64,0.05)", border: "1px solid rgba(232,64,64,0.2)", borderRadius: 3 }}>Error: {error}</div>}

      <div style={{ display: "flex", gap: 8, paddingTop: 16, borderTop: "1px solid #1a1a1a", alignItems: "center" }}>
        <button className="approve-btn" disabled={!!status} onClick={handleSave}>
          {status === "saving" ? "Saving..." : status === "saved" ? "✓ Saved" : "Save Changes"}
        </button>
        <button className="reject-btn" disabled={!!status} onClick={handleDelete} style={{ marginLeft: "auto" }}>
          {status === "deleting" ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

function SubmissionCard({ sub, onApprove, onReject }) {
  const [fields, setFields] = useState({ ...sub });
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef();
  const set = (key) => (val) => setFields(f => ({ ...f, [key]: val }));

const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setUploading(true);
  setError(null);
  const ext = file.name.split(".").pop();
const path = `submissions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
  .from("flyers")
  .upload(path, file, { contentType: file.type });

  if (uploadError) {
    setError(`Image upload failed: ${uploadError.message}`);
  } else {
    const { data: urlData } = supabase.storage.from("flyers").getPublicUrl(path);
  
    set("image")(urlData.publicUrl);
  }
  setUploading(false);
};

  const handleApprove = async () => {
    setStatus("approving");
    setError(null);
    const { error } = await supabase.from("events").insert([{
      name: fields.name,
      date: fields.date,
      date_end: fields.date_end || null,
      types: fields.types,
      venue: fields.venue,
      address: fields.address || null,
      city: fields.city,
      state: fields.state,
      region: fields.region,
      recurring: fields.recurring || false,
      url: fields.url || null,
      image: fields.image || null,
      time_start: fields.time_start || null,
      time_end: fields.time_end || null,
      notes: fields.notes || null,
      featured: false,
      source_uid: fields.source_uid || null,
    }]);
    if (error) {
      setStatus("error");
      setError(error.message);
    } else {
      await supabase.from("submissions").update({ status: "approved" }).eq("id", fields.id);
      await onApprove(fields.id);
    }
  };

  const handleReject = async () => {
    setStatus("rejecting");
    await onReject(fields.id);
  };

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <input className="finput" value={fields.name || ""} onChange={e => set("name")(e.target.value)} style={{ fontSize: 20, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.04em", color: "#F0E8D8", marginBottom: 10, background: "transparent", border: "1px solid #2a2a2a" }} />
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <TypeSelector value={fields.types} onChange={set("types")} />
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: "#555", cursor: "pointer" }}>
              <input type="checkbox" checked={!!fields.recurring} onChange={e => set("recurring")(e.target.checked)} /> Recurring
            </label>
          </div>
        </div>
        <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: "#333", whiteSpace: "nowrap" }}>
          {new Date(sub.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <EditableField label="Date" value={fields.date} onChange={set("date")} type="date" />
        <EditableField label="Date End" value={fields.date_end} onChange={set("date_end")} type="date" />
        <EditableField label="Time Start" value={fields.time_start} onChange={set("time_start")} />
        <EditableField label="Time End" value={fields.time_end} onChange={set("time_end")} />
        <EditableField label="Venue" value={fields.venue} onChange={set("venue")} />
        <EditableField label="Address" value={fields.address} onChange={set("address")} />
        <EditableField label="City" value={fields.city} onChange={set("city")} />
        <EditableField label="State" value={fields.state} onChange={set("state")} />
        <RegionField value={fields.region} onChange={set("region")} />
        <EditableField label="Link" value={fields.url} onChange={set("url")} />
        <EditableField label="Notes" value={fields.notes} onChange={set("notes")} type="textarea" />
        {(sub.submitter_name || sub.submitter_email) && (
          <div className="row">
            <span className="rlabel">From</span>
            <span className="rval">{sub.submitter_name}{sub.submitter_email ? ` · ${sub.submitter_email}` : ""}</span>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="row" style={{ alignItems: "flex-start" }}>
          <span className="rlabel">Flyer</span>
          <div style={{ flex: 1 }}>
            {fields.image && (
              <div style={{ marginBottom: 8 }}>
                <img src={fields.image} alt="Flyer" style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 3, border: "1px solid #1e1e1e", background: "#0a0a0a", display: "block", marginBottom: 6 }} />
                <button onClick={() => set("image")("")} style={{ fontSize: 11, color: "#E84040", background: "none", border: "none", cursor: "pointer", fontFamily: "'Barlow',sans-serif", padding: 0 }}>Remove image</button>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
            <button onClick={() => fileRef.current.click()} disabled={uploading} style={{ padding: "5px 12px", background: "transparent", border: "1px solid #2a2a2a", color: "#555", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", borderRadius: 3 }}>
              {uploading ? "Uploading..." : fields.image ? "Replace Image" : "Upload Image"}
            </button>
          </div>
        </div>
      </div>

      {error && <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: "#E84040", marginBottom: 12, padding: "8px 12px", background: "rgba(232,64,64,0.05)", border: "1px solid rgba(232,64,64,0.2)", borderRadius: 3 }}>Error: {error}</div>}

      <div style={{ display: "flex", gap: 8, paddingTop: 16, borderTop: "1px solid #1a1a1a" }}>
        <button className="approve-btn" disabled={!!status} onClick={handleApprove}>
          {status === "approving" ? "Approving..." : "✓ Approve"}
        </button>
        <button className="reject-btn" disabled={!!status} onClick={handleReject}>
          {status === "rejecting" ? "Rejecting..." : "Reject"}
        </button>
      </div>
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [tab, setTab] = useState("submissions"); // "submissions" | "events"
  const [submissions, setSubmissions] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventSearch, setEventSearch] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      fetchSubmissions();
    } else {
      setPasswordError(true);
    }
  };

  const fetchSubmissions = async () => {
    setLoadingSubs(true);
    const { data } = await supabase.from("submissions").select("*").eq("status", "pending").order("created_at", { ascending: true });
    setSubmissions(data || []);
    setLoadingSubs(false);
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    const { data } = await supabase.from("events").select("*").order("date", { ascending: true });
    setEvents(data || []);
    setLoadingEvents(false);
  };

  const handleTabChange = (t) => {
    setTab(t);
    if (t === "events" && events.length === 0) fetchEvents();
  };

  const filteredEvents = events.filter(e =>
    !eventSearch || e.name?.toLowerCase().includes(eventSearch.toLowerCase()) || e.city?.toLowerCase().includes(eventSearch.toLowerCase())
  );

  const tabStyle = (t) => ({
    padding: "8px 20px",
    background: "transparent",
    border: "none",
    borderBottom: tab === t ? "2px solid #E84040" : "2px solid transparent",
    color: tab === t ? "#E84040" : "#444",
    fontFamily: "'Barlow Condensed',sans-serif",
    fontWeight: 600,
    fontSize: 13,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    cursor: "pointer",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0D", color: "#E8E0D0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .stripe{height:5px;background:repeating-linear-gradient(90deg,#E84040 0,#E84040 18px,#F5A623 18px,#F5A623 36px,#0D0D0D 36px,#0D0D0D 40px);}
        .finput{width:100%;padding:10px 12px;background:#0f0f0f;border:1px solid #222;border-radius:3px;color:#C8C0B0;font-family:'Barlow',sans-serif;font-size:13px;outline:none;transition:border-color .15s;}
        .finput:focus{border-color:#E84040;}
        select.finput{cursor:pointer;}
        .approve-btn{padding:8px 18px;background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.3);color:#34D399;font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;border-radius:3px;transition:all .15s;}
        .approve-btn:hover{background:rgba(52,211,153,0.2);}
        .approve-btn:disabled{opacity:0.4;cursor:not-allowed;}
        .reject-btn{padding:8px 18px;background:transparent;border:1px solid #2a2a2a;color:#555;font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;border-radius:3px;transition:all .15s;}
        .reject-btn:hover{border-color:#E84040;color:#E84040;}
        .reject-btn:disabled{opacity:0.4;cursor:not-allowed;}
        .card{background:#111;border:1px solid #1e1e1e;border-radius:4px;padding:24px;margin-bottom:16px;}
        .row{display:flex;gap:12px;margin-bottom:8px;align-items:center;}
        .rlabel{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#444;width:80px;min-width:80px;padding-top:1px;}
        .rval{font-family:'Barlow',sans-serif;font-size:13px;color:#888;}
      `}</style>

      <div style={{ borderBottom: "1px solid #1a1a1a" }}>
        <div className="stripe" />
        <div style={{ padding: "18px 40px 14px", maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <Link to="/" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(28px,4vw,46px)", letterSpacing: "0.06em", lineHeight: 1, color: "#F0E8D8", textDecoration: "none" }}>
              CRUISE<span style={{ color: "#E84040" }}>STL</span>
            </Link>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase" }}>Admin</span>
          </div>
          <Link to="/" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, letterSpacing: "0.1em", color: "#444", textDecoration: "none", textTransform: "uppercase" }}>← Back to Calendar</Link>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 40px 80px" }}>
        {!authed ? (
          <div style={{ maxWidth: 360, margin: "60px auto" }}>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: "0.06em", color: "#C8B99A", marginBottom: 20 }}>Admin Access</h2>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 12 }}>
                <input className="finput" type="password" placeholder="Password" value={password} onChange={e => { setPassword(e.target.value); setPasswordError(false); }} autoFocus />
                {passwordError && <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: "#E84040", marginTop: 6 }}>Incorrect password.</p>}
              </div>
              <button type="submit" style={{ width: "100%", padding: "10px", background: "#E84040", border: "none", borderRadius: 3, color: "#fff", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>Enter</button>
            </form>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #1a1a1a", marginBottom: 28, marginTop: 24 }}>
              <button style={tabStyle("submissions")} onClick={() => handleTabChange("submissions")}>
                Submissions {submissions.length > 0 && <span style={{ background: "#E84040", color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: 10, marginLeft: 6 }}>{submissions.length}</span>}
              </button>
              <button style={tabStyle("events")} onClick={() => handleTabChange("events")}>
                Events
              </button>
            </div>

            {/* Submissions tab */}
            {tab === "submissions" && (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: "#333" }}>{submissions.length} pending</span>
                  <button onClick={fetchSubmissions} style={{ padding: "6px 12px", background: "transparent", border: "1px solid #222", color: "#555", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", borderRadius: 3 }}>Refresh</button>
                </div>
                {loadingSubs && <div style={{ textAlign: "center", padding: "40px 0", fontFamily: "'Barlow',sans-serif", fontSize: 13, color: "#333" }}>Loading...</div>}
                {!loadingSubs && submissions.length === 0 && (
                  <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: "#222", letterSpacing: "0.1em" }}>All Clear</div>
                    <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: "#333", marginTop: 8 }}>No pending submissions.</p>
                  </div>
                )}
                {submissions.map(sub => (
                  <SubmissionCard
                    key={sub.id}
                    sub={sub}
                    onApprove={(id) => setSubmissions(p => p.filter(s => s.id !== id))}
                    onReject={async (id) => {
                      await supabase.from("submissions").update({ status: "rejected" }).eq("id", id);
                      setSubmissions(p => p.filter(s => s.id !== id));
                    }}
                  />
                ))}
              </>
            )}

            {/* Events tab */}
            {tab === "events" && (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 12 }}>
                  <input
                    className="finput"
                    placeholder="Search events..."
                    value={eventSearch}
                    onChange={e => setEventSearch(e.target.value)}
                    style={{ maxWidth: 280 }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: "#333", whiteSpace: "nowrap" }}>{filteredEvents.length} events</span>
                    <button onClick={fetchEvents} style={{ padding: "6px 12px", background: "transparent", border: "1px solid #222", color: "#555", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", borderRadius: 3 }}>Refresh</button>
                  </div>
                </div>
                {loadingEvents && <div style={{ textAlign: "center", padding: "40px 0", fontFamily: "'Barlow',sans-serif", fontSize: 13, color: "#333" }}>Loading...</div>}
                {filteredEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onDelete={async (id) => {
                      await supabase.from("events").delete().eq("id", id);
                      setEvents(p => p.filter(e => e.id !== id));
                    }}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
