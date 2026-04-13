import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./supabase";

const ADMIN_PASSWORD = "cruisestl2026";

const REGIONS = ["city-central", "west", "south", "east", "north", "out-of-region"];
const TYPES = ["car-show", "cruise-night", "swap-meet", "car-meet", "race"];

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function EditableField({ label, value, onChange, type = "text", options = null }) {
  if (options) {
    return (
      <div className="row">
        <span className="rlabel">{label}</span>
        <select
          className="finput"
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          style={{ width: "auto", minWidth: 160, padding: "3px 8px", fontSize: 13 }}
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  if (type === "textarea") {
    return (
      <div className="row">
        <span className="rlabel">{label}</span>
        <textarea
          className="finput"
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          rows={3}
          style={{ flex: 1, resize: "vertical", fontSize: 13, lineHeight: 1.5 }}
        />
      </div>
    );
  }
  return (
    <div className="row">
      <span className="rlabel">{label}</span>
      <input
        className="finput"
        type={type}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        style={{ flex: 1, padding: "3px 8px", fontSize: 13 }}
      />
    </div>
  );
}

function SubmissionCard({ sub, onApprove, onReject }) {
  const [fields, setFields] = useState({ ...sub });
  const [uploading, setUploading] = useState(false);
  const [actionStatus, setActionStatus] = useState(null);
  const fileRef = useRef();

  const set = (key) => (val) => setFields(f => ({ ...f, [key]: val }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `flyers/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("flyers").upload(path, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage.from("flyers").getPublicUrl(path);
      set("image")(urlData.publicUrl);
    }
    setUploading(false);
  };

  const handleApprove = async () => {
    setActionStatus("approving");
    await onApprove(fields);
  };

  const handleReject = async () => {
    setActionStatus("rejecting");
    await onReject(fields);
  };

  return (
    <div className="card">
      {/* Name + types */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <input
            className="finput"
            value={fields.name || ""}
            onChange={e => set("name")(e.target.value)}
            style={{ fontSize: 20, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.04em", color: "#F0E8D8", marginBottom: 8, background: "transparent", border: "1px solid #2a2a2a" }}
          />
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <select
              className="finput"
              value={fields.types || "car-show"}
              onChange={e => set("types")(e.target.value)}
              style={{ width: "auto", fontSize: 11, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 8px" }}
            >
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: "#555", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={!!fields.recurring}
                onChange={e => set("recurring")(e.target.checked)}
              />
              Recurring
            </label>
          </div>
        </div>
        <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: "#333", whiteSpace: "nowrap" }}>
          {new Date(sub.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
        </div>
      </div>

      {/* Details */}
      <div style={{ marginBottom: 16 }}>
        <EditableField label="Date" value={fields.date} onChange={set("date")} type="date" />
        <EditableField label="Date End" value={fields.date_end} onChange={set("date_end")} type="date" />
        <EditableField label="Time Start" value={fields.time_start} onChange={set("time_start")} />
        <EditableField label="Time End" value={fields.time_end} onChange={set("time_end")} />
        <EditableField label="Venue" value={fields.venue} onChange={set("venue")} />
        <EditableField label="Address" value={fields.address} onChange={set("address")} />
        <EditableField label="City" value={fields.city} onChange={set("city")} />
        <EditableField label="State" value={fields.state} onChange={set("state")} />
        <EditableField label="Region" value={fields.region} onChange={set("region")} options={REGIONS} />
        <EditableField label="Link" value={fields.url} onChange={set("url")} />
        <EditableField label="Notes" value={fields.notes} onChange={set("notes")} type="textarea" />

        {(sub.submitter_name || sub.submitter_email) && (
          <div className="row">
            <span className="rlabel">From</span>
            <span className="rval">{sub.submitter_name}{sub.submitter_email ? ` · ${sub.submitter_email}` : ""}</span>
          </div>
        )}
      </div>

      {/* Image */}
      <div style={{ marginBottom: 16 }}>
        <div className="row" style={{ alignItems: "flex-start" }}>
          <span className="rlabel">Flyer</span>
          <div style={{ flex: 1 }}>
            {fields.image && (
              <div style={{ marginBottom: 8 }}>
                <img src={fields.image} alt="Flyer" style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 3, border: "1px solid #1e1e1e", background: "#0a0a0a", display: "block", marginBottom: 6 }} />
                <button
                  onClick={() => set("image")("")}
                  style={{ fontSize: 11, color: "#E84040", background: "none", border: "none", cursor: "pointer", fontFamily: "'Barlow',sans-serif", padding: 0 }}
                >
                  Remove image
                </button>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
            <button
              onClick={() => fileRef.current.click()}
              disabled={uploading}
              style={{ padding: "5px 12px", background: "transparent", border: "1px solid #2a2a2a", color: "#555", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", borderRadius: 3 }}
            >
              {uploading ? "Uploading..." : fields.image ? "Replace Image" : "Upload Image"}
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, paddingTop: 16, borderTop: "1px solid #1a1a1a" }}>
        <button
          className="approve-btn"
          disabled={!!actionStatus}
          onClick={handleApprove}
        >
          {actionStatus === "approving" ? "Approving..." : "✓ Approve"}
        </button>
        <button
          className="reject-btn"
          disabled={!!actionStatus}
          onClick={handleReject}
        >
          {actionStatus === "rejecting" ? "Rejecting..." : "Reject"}
        </button>
      </div>
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    const { data } = await supabase
      .from("submissions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    setSubmissions(data || []);
    setLoading(false);
  };

  const approve = async (fields) => {
    await supabase.from("events").insert([{
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
      source_uid: fields.source_uid || null,
    }]);
    await supabase.from("submissions").update({ status: "approved" }).eq("id", fields.id);
    setSubmissions(p => p.filter(s => s.id !== fields.id));
  };

  const reject = async (fields) => {
    await supabase.from("submissions").update({ status: "rejected" }).eq("id", fields.id);
    setSubmissions(p => p.filter(s => s.id !== fields.id));
  };

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

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1a1a" }}>
        <div className="stripe" />
        <div style={{ padding: "18px 40px 14px", maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <Link to="/" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(28px,4vw,46px)", letterSpacing: "0.06em", lineHeight: 1, color: "#F0E8D8", textDecoration: "none" }}>
              CRUISE<span style={{ color: "#E84040" }}>STL</span>
            </Link>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase" }}>Admin</span>
          </div>
          <Link to="/" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, letterSpacing: "0.1em", color: "#444", textDecoration: "none", textTransform: "uppercase" }}>
            ← Back to Calendar
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 40px 80px" }}>
        {!authed ? (
          <div style={{ maxWidth: 360, margin: "60px auto" }}>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: "0.06em", color: "#C8B99A", marginBottom: 20 }}>
              Admin Access
            </h2>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 12 }}>
                <input
                  className="finput"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPasswordError(false); }}
                  autoFocus
                />
                {passwordError && (
                  <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: "#E84040", marginTop: 6 }}>
                    Incorrect password.
                  </p>
                )}
              </div>
              <button type="submit" style={{ width: "100%", padding: "10px", background: "#E84040", border: "none", borderRadius: 3, color: "#fff", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>
                Enter
              </button>
            </form>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: "0.06em", color: "#C8B99A" }}>
                Pending Submissions
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: "#333" }}>
                  {submissions.length} pending
                </span>
                <button onClick={fetchSubmissions} style={{ padding: "6px 12px", background: "transparent", border: "1px solid #222", color: "#555", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", borderRadius: 3 }}>
                  Refresh
                </button>
              </div>
            </div>

            {loading && (
              <div style={{ textAlign: "center", padding: "40px 0", fontFamily: "'Barlow',sans-serif", fontSize: 13, color: "#333" }}>
                Loading...
              </div>
            )}

            {!loading && submissions.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: "#222", letterSpacing: "0.1em" }}>All Clear</div>
                <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: "#333", marginTop: 8 }}>No pending submissions.</p>
              </div>
            )}

            {submissions.map(sub => (
              <SubmissionCard
                key={sub.id}
                sub={sub}
                onApprove={approve}
                onReject={reject}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
