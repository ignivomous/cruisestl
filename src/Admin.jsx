import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./supabase";

const ADMIN_PASSWORD = "cruisestl2026";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState({}); // id -> "approving" | "rejecting" | "done"

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

  const approve = async (sub) => {
    setActionStatus(p => ({ ...p, [sub.id]: "approving" }));
    await supabase.from("events").insert([{
      name: sub.name,
      date: sub.date,
      date_end: sub.date_end || null,
      types: sub.types,
      venue: sub.venue,
      address: sub.address || null,
      city: sub.city,
      state: sub.state,
      region: sub.region,
      recurring: sub.recurring,
      url: sub.url || null,
      image: sub.image || null,
      time_start: sub.time_start || null,
      time_end: sub.time_end || null,
      notes: sub.notes || null,
    }]);
    await supabase.from("submissions").update({ status: "approved" }).eq("id", sub.id);
    setActionStatus(p => ({ ...p, [sub.id]: "approved" }));
    setSubmissions(p => p.filter(s => s.id !== sub.id));
  };

  const reject = async (sub) => {
    setActionStatus(p => ({ ...p, [sub.id]: "rejecting" }));
    await supabase.from("submissions").update({ status: "rejected" }).eq("id", sub.id);
    setActionStatus(p => ({ ...p, [sub.id]: "rejected" }));
    setSubmissions(p => p.filter(s => s.id !== sub.id));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0D", color: "#E8E0D0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .stripe{height:5px;background:repeating-linear-gradient(90deg,#E84040 0,#E84040 18px,#F5A623 18px,#F5A623 36px,#0D0D0D 36px,#0D0D0D 40px);}
        .finput{width:100%;padding:10px 12px;background:#0f0f0f;border:1px solid #222;border-radius:3px;color:#C8C0B0;font-family:'Barlow',sans-serif;font-size:13px;outline:none;transition:border-color .15s;}
        .finput:focus{border-color:#E84040;}
        .approve-btn{padding:8px 18px;background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.3);color:#34D399;font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;border-radius:3px;transition:all .15s;}
        .approve-btn:hover{background:rgba(52,211,153,0.2);}
        .approve-btn:disabled{opacity:0.4;cursor:not-allowed;}
        .reject-btn{padding:8px 18px;background:transparent;border:1px solid #2a2a2a;color:#555;font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;border-radius:3px;transition:all .15s;}
        .reject-btn:hover{border-color:#E84040;color:#E84040;}
        .reject-btn:disabled{opacity:0.4;cursor:not-allowed;}
        .card{background:#111;border:1px solid #1e1e1e;border-radius:4px;padding:24px;margin-bottom:16px;}
        .tag{display:inline-block;padding:2px 8px;border-radius:2px;font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;background:rgba(232,64,64,0.1);color:#E84040;margin-right:4px;}
        .row{display:flex;gap:12px;margin-bottom:8px;}
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
              <div key={sub.id} className="card">
                {/* Name + types */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: "0.04em", color: "#F0E8D8", marginBottom: 6 }}>
                      {sub.name}
                    </h3>
                    <div>
                      {(sub.types || "").split(",").map(t => (
                        <span key={t} className="tag">{t.trim()}</span>
                      ))}
                      {sub.recurring && <span className="tag" style={{ background: "rgba(200,185,154,0.1)", color: "#C8B99A" }}>Recurring</span>}
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: "#333", whiteSpace: "nowrap" }}>
                    {new Date(sub.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </div>
                </div>

                {/* Details */}
                <div style={{ marginBottom: 16 }}>
                  <div className="row"><span className="rlabel">Date</span><span className="rval">{formatDate(sub.date)}{sub.date_end ? ` – ${formatDate(sub.date_end)}` : ""}</span></div>
                  {(sub.time_start||sub.time_end)&&<div className="row"><span className="rlabel">Time</span><span className="rval">{[sub.time_start,sub.time_end].filter(Boolean).join(" – ")}</span></div>}
                  <div className="row"><span className="rlabel">Venue</span><span className="rval">{sub.venue || "—"}</span></div>
                  {sub.address && <div className="row"><span className="rlabel">Address</span><span className="rval">{sub.address}</span></div>}
                  <div className="row"><span className="rlabel">Location</span><span className="rval">{sub.city}{sub.state ? `, ${sub.state}` : ""}</span></div>
                  <div className="row"><span className="rlabel">Region</span><span className="rval">{sub.region || "—"}</span></div>
                  {sub.url && <div className="row"><span className="rlabel">Link</span><a href={sub.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: "#F5A623", textDecoration: "none" }}>{sub.url}</a></div>}
                  {sub.notes && <div className="row"><span className="rlabel">Notes</span><span className="rval">{sub.notes}</span></div>}
                  {sub.notes && <div className="row"><span className="rlabel">Notes</span><span className="rval">{sub.notes}</span></div>}
                  {(sub.submitter_name || sub.submitter_email) && (
                    <div className="row">
                      <span className="rlabel">From</span>
                      <span className="rval">{sub.submitter_name}{sub.submitter_email ? ` · ${sub.submitter_email}` : ""}</span>
                    </div>
                  )}
                </div>

                {/* Flyer preview */}
                {sub.image && (
                  <div style={{ marginBottom: 16 }}>
                    <img src={sub.image} alt="Flyer" style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 3, border: "1px solid #1e1e1e", background: "#0a0a0a" }} />
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, paddingTop: 16, borderTop: "1px solid #1a1a1a" }}>
                  <button
                    className="approve-btn"
                    disabled={!!actionStatus[sub.id]}
                    onClick={() => approve(sub)}
                  >
                    {actionStatus[sub.id] === "approving" ? "Approving..." : "✓ Approve"}
                  </button>
                  <button
                    className="reject-btn"
                    disabled={!!actionStatus[sub.id]}
                    onClick={() => reject(sub)}
                  >
                    {actionStatus[sub.id] === "rejecting" ? "Rejecting..." : "Reject"}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
