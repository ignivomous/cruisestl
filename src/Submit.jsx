import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./supabase";

const TYPES = [
  { value: "car-show",        label: "Car Show" },
  { value: "cruise-night",    label: "Cruise Night" },
  { value: "swap-meet",       label: "Swap Meet" },
  { value: "drag-race",       label: "Drag Race" },
  { value: "cars-and-coffee", label: "Cars & Coffee" },
  { value: "other",           label: "Other" },
];

const REGIONS = [
  { value: "city-central",  label: "City / Central" },
  { value: "west",          label: "West" },
  { value: "south",         label: "South" },
  { value: "east",          label: "East" },
  { value: "north",         label: "North" },
  { value: "out-of-region", label: "Road Trip (60+ miles)" },
];

const EMPTY_DATE = { date: "", date_end: "" };

const EMPTY = {
  name: "",
  dates: [{ date: "", date_end: "" }],
  types: [],
  venue: "",
  address: "",
  city: "",
  state: "",
  region: "",
  recurring: false,
  url: "",
  notes: "",
  submitter_name: "",
  submitter_email: "",
};

export default function Submit() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const toggleType = (val) => {
    setForm(p => ({
      ...p,
      types: p.types.includes(val) ? p.types.filter(t => t !== val) : [...p.types, val]
    }));
  };

  const setDate = (index, field, value) => {
    setForm(p => {
      const dates = [...p.dates];
      dates[index] = { ...dates[index], [field]: value };
      return { ...p, dates };
    });
  };

  const addDate = () => setForm(p => ({ ...p, dates: [...p.dates, { ...EMPTY_DATE }] }));

  const removeDate = (index) => setForm(p => ({
    ...p,
    dates: p.dates.filter((_, i) => i !== index)
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validDates = form.dates.filter(d => d.date);
    if (!form.name || validDates.length === 0 || form.types.length === 0 || !form.city || !form.region) {
      setErrorMsg("Please fill in all required fields including at least one date.");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");

    const rows = validDates.map(d => ({
      name: form.name.trim(),
      date: d.date,
      date_end: d.date_end || null,
      types: form.types.join(","),
      venue: form.venue.trim() || "TBD",
      address: form.address.trim() || null,
      city: form.city.trim(),
      state: form.state.trim(),
      region: form.region,
      recurring: form.recurring,
      url: form.url.trim() || null,
      notes: form.notes.trim() || null,
      submitter_name: form.submitter_name.trim() || null,
      submitter_email: form.submitter_email.trim() || null,
      status: "pending",
    }));

    const { error } = await supabase.from("submissions").insert(rows);

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("success");
      setForm(EMPTY);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0D", color: "#E8E0D0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .stripe{height:5px;background:repeating-linear-gradient(90deg,#E84040 0,#E84040 18px,#F5A623 18px,#F5A623 36px,#0D0D0D 36px,#0D0D0D 40px);}
        .finput{width:100%;padding:10px 12px;background:#0f0f0f;border:1px solid #222;border-radius:3px;color:#C8C0B0;font-family:'Barlow',sans-serif;font-size:13px;outline:none;transition:border-color .15s;}
        .finput:focus{border-color:#E84040;}
        .finput::placeholder{color:#333;}
        .fchip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid #222;border-radius:3px;cursor:pointer;transition:all .15s;font-family:'Barlow',sans-serif;font-size:12px;color:#555;background:transparent;user-select:none;}
        .fchip.active{border-color:#E84040;color:#E84040;background:rgba(232,64,64,0.1);}
        .fchip:hover{border-color:#444;color:#888;}
        .rchip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid #222;border-radius:3px;cursor:pointer;transition:all .15s;font-family:'Barlow',sans-serif;font-size:12px;color:#555;background:transparent;user-select:none;}
        .rchip.active{border-color:#C8B99A;color:#C8B99A;background:rgba(200,185,154,0.08);}
        .rchip:hover{border-color:#444;color:#888;}
        .submit-btn{width:100%;padding:12px;background:#E84040;border:none;border-radius:3px;color:#fff;font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:14px;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;transition:background .15s;}
        .submit-btn:hover{background:#cc3333;}
        .submit-btn:disabled{background:#2a2a2a;color:#555;cursor:not-allowed;}
        .add-date-btn{display:flex;align-items:center;gap:6px;padding:7px 14px;background:transparent;border:1px dashed #2a2a2a;border-radius:3px;color:#555;font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;transition:all .15s;margin-top:8px;}
        .add-date-btn:hover{border-color:#E84040;color:#E84040;}
        .remove-date-btn{padding:0 8px;background:transparent;border:none;color:#333;font-size:16px;cursor:pointer;transition:color .15s;line-height:1;align-self:center;}
        .remove-date-btn:hover{color:#E84040;}
        label{display:block;font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#555;margin-bottom:6px;}
        .req{color:#E84040;margin-left:2px;}
        @media(max-width:640px){.form-grid{grid-template-columns:1fr!important;}.date-grid{grid-template-columns:1fr!important;}}
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1a1a" }}>
        <div className="stripe" />
        <div style={{ padding: "18px 40px 14px", maxWidth: 700, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <Link to="/" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(28px,4vw,46px)", letterSpacing: "0.06em", lineHeight: 1, color: "#F0E8D8", textDecoration: "none" }}>
              CRUISE<span style={{ color: "#E84040" }}>STL</span>
            </Link>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", color: "#E84040", textTransform: "uppercase" }}>Submit Event</span>
          </div>
          <Link to="/" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, letterSpacing: "0.1em", color: "#444", textDecoration: "none", textTransform: "uppercase" }}>
            ← Back to Calendar
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 40px 80px" }}>

        {status === "success" ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 42, color: "#34D399", letterSpacing: "0.06em", marginBottom: 12 }}>
              Thanks!
            </div>
            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 14, color: "#777", marginBottom: 8, lineHeight: 1.6 }}>
              Your event has been submitted for review.
            </p>
            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: "#555", marginBottom: 32, lineHeight: 1.6 }}>
              Once approved it'll appear on the calendar automatically — usually within 24–48 hours. No follow-up needed.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setStatus("idle")} style={{ padding: "9px 20px", background: "rgba(232,64,64,0.1)", border: "1px solid rgba(232,64,64,0.3)", color: "#E84040", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", borderRadius: 3 }}>
                Submit Another
              </button>
              <Link to="/" style={{ padding: "9px 20px", background: "transparent", border: "1px solid #222", color: "#555", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: 3, textDecoration: "none" }}>
                Back to Calendar
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>

            {/* Intro */}
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, letterSpacing: "0.06em", color: "#C8B99A", marginBottom: 8 }}>
                Know of a Show?
              </h2>
              <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: "#555", lineHeight: 1.7 }}>
                Help keep the calendar complete. Submit any car show, cruise night, swap meet, or drag race in the St. Louis region and we'll get it listed.
              </p>
            </div>

            {/* Event Name */}
            <div style={{ marginBottom: 20 }}>
              <label>Event Name <span className="req">*</span></label>
              <input className="finput" type="text" placeholder="e.g. Cruisin Lindbergh" value={form.name} onChange={e => set("name", e.target.value)} />
            </div>

            {/* Dates — multi-date */}
            <div style={{ marginBottom: 20 }}>
              <label>Date(s) <span className="req">*</span></label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {form.dates.map((d, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div className="date-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, flex: 1 }}>
                      <input
                        className="finput"
                        type="date"
                        value={d.date}
                        onChange={e => setDate(i, "date", e.target.value)}
                      />
                      <input
                        className="finput"
                        type="date"
                        placeholder="End date (optional)"
                        value={d.date_end}
                        onChange={e => setDate(i, "date_end", e.target.value)}
                      />
                    </div>
                    {form.dates.length > 1 && (
                      <button type="button" className="remove-date-btn" onClick={() => removeDate(i)}>×</button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" className="add-date-btn" onClick={addDate}>
                + Add another date
              </button>
              <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: "#333", marginTop: 6 }}>
                For recurring series, add each date separately. End date is only needed for multi-day events.
              </p>
            </div>

            {/* Event Types */}
            <div style={{ marginBottom: 20 }}>
              <label>Event Type <span className="req">*</span></label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TYPES.map(t => (
                  <div key={t.value} className={`fchip${form.types.includes(t.value) ? " active" : ""}`} onClick={() => toggleType(t.value)}>
                    {form.types.includes(t.value) && <span>✓</span>}
                    {t.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Venue */}
            <div style={{ marginBottom: 20 }}>
              <label>Venue Name</label>
              <input className="finput" type="text" placeholder="e.g. WWT Raceway, Festus Park" value={form.venue} onChange={e => set("venue", e.target.value)} />
            </div>

            {/* Address */}
            <div style={{ marginBottom: 20 }}>
              <label>Full Address <span style={{ color: "#333", fontSize: 10 }}>(helps with map accuracy)</span></label>
              <input className="finput" type="text" placeholder="e.g. 700 Raceway Blvd, Madison, IL 62060" value={form.address} onChange={e => set("address", e.target.value)} />
            </div>

            {/* City / State */}
            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <label>City <span className="req">*</span></label>
                <input className="finput" type="text" placeholder="e.g. St. Charles" value={form.city} onChange={e => set("city", e.target.value)} />
              </div>
              <div>
                <label>State <span className="req">*</span></label>
                <input className="finput" type="text" placeholder="MO" maxLength={2} value={form.state} onChange={e => set("state", e.target.value.toUpperCase())} />
              </div>
            </div>

            {/* Region */}
            <div style={{ marginBottom: 20 }}>
              <label>Region <span className="req">*</span></label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {REGIONS.map(r => (
                  <div key={r.value} className={`rchip${form.region === r.value ? " active" : ""}`} onClick={() => set("region", r.value)}>
                    {r.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Recurring */}
            <div style={{ marginBottom: 20 }}>
              <label>Does this event repeat?</label>
              <div style={{ display: "flex", gap: 8 }}>
                <div className={`rchip${form.recurring ? " active" : ""}`} onClick={() => set("recurring", true)}>
                  Yes — recurring series
                </div>
                <div className={`rchip${!form.recurring ? " active" : ""}`} onClick={() => set("recurring", false)}>
                  No — one time
                </div>
              </div>
            </div>

            {/* URL */}
            <div style={{ marginBottom: 20 }}>
              <label>Website or Facebook Link</label>
              <input className="finput" type="url" placeholder="https://..." value={form.url} onChange={e => set("url", e.target.value)} />
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 28 }}>
              <label>Anything else we should know?</label>
              <textarea className="finput" rows={3} placeholder="Entry fee, special categories, contact info, etc." value={form.notes} onChange={e => set("notes", e.target.value)} style={{ resize: "vertical" }} />
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid #1a1a1a", marginBottom: 28 }} />

            {/* Submitter info */}
            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: "#444", marginBottom: 16 }}>
              Optional — in case we need to follow up.
            </p>
            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
              <div>
                <label>Your Name</label>
                <input className="finput" type="text" placeholder="Chris" value={form.submitter_name} onChange={e => set("submitter_name", e.target.value)} />
              </div>
              <div>
                <label>Your Email</label>
                <input className="finput" type="email" placeholder="you@email.com" value={form.submitter_email} onChange={e => set("submitter_email", e.target.value)} />
              </div>
            </div>

            {/* Error */}
            {errorMsg && (
              <div style={{ padding: "10px 14px", background: "rgba(232,64,64,0.1)", border: "1px solid rgba(232,64,64,0.3)", borderRadius: 3, fontFamily: "'Barlow',sans-serif", fontSize: 12, color: "#E84040", marginBottom: 16 }}>
                {errorMsg}
              </div>
            )}

            {/* Submit */}
            <button className="submit-btn" type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Submitting..." : "Submit Event"}
            </button>

          </form>
        )}
      </div>
    </div>
  );
}
