import { useState, useMemo } from "react";

const EVENTS = [
  // APRIL
  { id: 1, name: "Real Easter Car Show", date: "2026-04-05", type: "car-show", venue: "Family Arena", city: "St. Charles", state: "MO" },
  { id: 2, name: "Memories Car Cruise", date: "2026-04-10", type: "cruise-night", venue: "Faith Church", city: "St. Louis", state: "MO", recurring: true },
  { id: 3, name: "JJ's Car Cruise", date: "2026-04-11", type: "cruise-night", venue: "TBD", city: "St. Charles", state: "MO", recurring: true },
  { id: 4, name: "GCS Ballpark Swap Meet", date: "2026-04-12", type: "swap-meet", venue: "GCS Ballpark", city: "Sauget", state: "IL" },
  { id: 5, name: "WWT Import Show & Stereo Competition", date: "2026-04-12", type: "car-show", venue: "WWT Raceway", city: "Madison", state: "IL" },
  { id: 6, name: "Cruisin Lindbergh — Spring", date: "2026-04-18", type: "cruise-night", venue: "Lindbergh Blvd", city: "St. Louis", state: "MO", recurring: true },
  { id: 7, name: "Gear-Jammers Cruise-In", date: "2026-04-26", type: "cruise-night", venue: "Danny's Irish Pub & Banquet Center", city: "Belleville", state: "IL", recurring: true },
  // MAY
  { id: 8, name: "Memories Car Cruise", date: "2026-05-01", type: "cruise-night", venue: "Faith Church", city: "St. Louis", state: "MO", recurring: true },
  { id: 9, name: "Magic Dragon Car Show", date: "2026-05-01", dateEnd: "2026-05-02", type: "car-show", venue: "Bagnell Dam", city: "Lake Ozark", state: "MO" },
  { id: 10, name: "GCS Ballpark Model T Swap Meet", date: "2026-05-03", type: "swap-meet", venue: "GCS Ballpark", city: "Sauget", state: "IL" },
  { id: 11, name: "Moonshine Mashup", date: "2026-05-08", dateEnd: "2026-05-09", type: "car-show", venue: "TBD", city: "Lebanon", state: "MO" },
  { id: 12, name: "Arnold Car Show", date: "2026-05-09", type: "car-show", venue: "Fox Center", city: "Arnold", state: "MO" },
  { id: 13, name: "Crystal City Car Show", date: "2026-05-09", type: "car-show", venue: "Saint Pius X Catholic High School", city: "Crystal City", state: "MO" },
  { id: 14, name: "Perryville Car Show", date: "2026-05-09", type: "car-show", venue: "Knights of Columbus", city: "Perryville", state: "MO" },
  { id: 15, name: "JJ's Car Cruise", date: "2026-05-09", type: "cruise-night", venue: "TBD", city: "St. Charles", state: "MO", recurring: true },
  { id: 16, name: "Columbia Car Cruise", date: "2026-05-15", type: "cruise-night", venue: "Westpark Bowl", city: "Columbia", state: "IL", recurring: true },
  { id: 17, name: "Relaxin in the Park", date: "2026-05-15", dateEnd: "2026-05-16", type: "car-show", venue: "Festus Park", city: "Festus", state: "MO" },
  { id: 18, name: "Gear-Jammers Cruise-In", date: "2026-05-17", type: "cruise-night", venue: "No Jacks", city: "Smithton", state: "IL", recurring: true },
  { id: 19, name: "NDRL Races & Free Car Show", date: "2026-05-22", dateEnd: "2026-05-23", type: "drag-race", venue: "WWT Raceway", city: "Madison", state: "IL" },
  // JUNE
  { id: 20, name: "Sybergs SMN Pre-Party", date: "2026-06-03", type: "cruise-night", venue: "Sybergs", city: "O'Fallon", state: "IL" },
  { id: 21, name: "Street Machine Nationals", date: "2026-06-05", dateEnd: "2026-06-07", type: "car-show", venue: "Du Quoin State Fairgrounds", city: "Du Quoin", state: "IL" },
  { id: 22, name: "Wheatland Drag Boats", date: "2026-06-06", dateEnd: "2026-06-07", type: "other", venue: "Wheatland Lake", city: "Wheatland", state: "MO" },
  { id: 23, name: "Hot Rod Power Tour", date: "2026-06-08", dateEnd: "2026-06-12", type: "other", venue: "Multiple Stops", city: "Midwest", state: "" },
  { id: 24, name: "Custom Car Revival", date: "2026-06-11", dateEnd: "2026-06-13", type: "car-show", venue: "TBD", city: "Indianapolis", state: "IN" },
  { id: 25, name: "JJ's Car Cruise", date: "2026-06-13", type: "cruise-night", venue: "TBD", city: "St. Charles", state: "MO", recurring: true },
  { id: 26, name: "Boostfest", date: "2026-06-13", type: "car-show", venue: "WWT Raceway", city: "Madison", state: "IL" },
  { id: 27, name: "Gear-Jammers Cruise-In", date: "2026-06-14", type: "cruise-night", venue: "Corner Chill and Grill", city: "Belleville", state: "IL", recurring: true },
  { id: 28, name: "Columbia Car Cruise", date: "2026-06-19", type: "cruise-night", venue: "Westpark Bowl", city: "Columbia", state: "IL", recurring: true },
  { id: 29, name: "Heartland Nova Show", date: "2026-06-18", dateEnd: "2026-06-20", type: "car-show", venue: "TBD", city: "St. Louis", state: "MO" },
  { id: 30, name: "Mexico Missouri Car Show", date: "2026-06-20", type: "car-show", venue: "TBD", city: "Mexico", state: "MO" },
  // JULY
  { id: 31, name: "Memories Car Cruise", date: "2026-07-03", type: "cruise-night", venue: "Faith Church", city: "St. Louis", state: "MO", recurring: true },
  { id: 32, name: "NDRL Indy", date: "2026-07-10", dateEnd: "2026-07-11", type: "drag-race", venue: "TBD", city: "Indianapolis", state: "IN" },
  { id: 33, name: "JJ's Car Cruise", date: "2026-07-11", type: "cruise-night", venue: "TBD", city: "St. Charles", state: "MO", recurring: true },
  { id: 34, name: "Meltdown Drags", date: "2026-07-17", dateEnd: "2026-07-18", type: "drag-race", venue: "Byron Dragway", city: "Byron", state: "IL" },
  { id: 35, name: "Columbia Car Cruise", date: "2026-07-17", type: "cruise-night", venue: "Westpark Bowl", city: "Columbia", state: "IL", recurring: true },
  { id: 36, name: "Cruisin Lindbergh — Summer", date: "2026-07-18", type: "cruise-night", venue: "Lindbergh Blvd", city: "St. Louis", state: "MO", recurring: true },
  { id: 37, name: "Gear-Jammers Cruise-In", date: "2026-07-18", type: "cruise-night", venue: "Belleville/Swansea Moose Lodge #1221", city: "Swansea", state: "IL", recurring: true },
  { id: 38, name: "Bootheel Races", date: "2026-07-24", dateEnd: "2026-07-25", type: "drag-race", venue: "TBD", city: "Sikeston", state: "MO" },
  { id: 39, name: "Fatheads Car Show", date: "2026-07-25", type: "car-show", venue: "Fatheads", city: "Wright City", state: "MO" },
  // AUGUST
  { id: 40, name: "Memories Car Cruise", date: "2026-08-07", type: "cruise-night", venue: "Faith Church", city: "St. Louis", state: "MO", recurring: true },
  { id: 41, name: "JJ's Car Cruise", date: "2026-08-08", type: "cruise-night", venue: "TBD", city: "St. Charles", state: "MO", recurring: true },
  { id: 42, name: "SOA Models Car Show", date: "2026-08-08", type: "car-show", venue: "TBD", city: "St. Louis", state: "MO" },
  { id: 43, name: "Columbia Car Cruise", date: "2026-08-21", type: "cruise-night", venue: "Westpark Bowl", city: "Columbia", state: "IL", recurring: true },
  { id: 44, name: "Gear-Jammers Cruise-In", date: "2026-08-16", type: "cruise-night", venue: "AJ's Smashed and Smoked", city: "Belleville", state: "IL", recurring: true },
  { id: 45, name: "Glutton Club Party", date: "2026-08-29", type: "other", venue: "TBD", city: "St. Louis", state: "MO" },
  // SEPTEMBER
  { id: 46, name: "Memories Car Cruise", date: "2026-09-04", type: "cruise-night", venue: "Faith Church", city: "St. Louis", state: "MO", recurring: true },
  { id: 47, name: "Wheatland Drag Boats", date: "2026-09-04", dateEnd: "2026-09-06", type: "other", venue: "Wheatland Lake", city: "Wheatland", state: "MO" },
  { id: 48, name: "JJ's Car Cruise", date: "2026-09-12", type: "cruise-night", venue: "TBD", city: "St. Charles", state: "MO", recurring: true },
  { id: 49, name: "Columbia Car Cruise", date: "2026-09-18", type: "cruise-night", venue: "Westpark Bowl", city: "Columbia", state: "IL", recurring: true },
  { id: 50, name: "Gear-Jammers 31st Annual Car Show", date: "2026-09-13", type: "car-show", venue: "Silver Creek Sports & Social", city: "Belleville", state: "IL" },
  { id: 51, name: "Drag Week", date: "2026-09-14", dateEnd: "2026-09-18", type: "drag-race", venue: "Multiple Stops", city: "Midwest", state: "" },
  { id: 52, name: "Route 66 Cruise", date: "2026-09-25", dateEnd: "2026-09-27", type: "other", venue: "Route 66", city: "Springfield", state: "IL" },
  { id: 53, name: "Bonne Terre Sick Races", date: "2026-09-28", type: "drag-race", venue: "TBD", city: "Bonne Terre", state: "MO" },
  // OCTOBER
  { id: 54, name: "Bonne Terre Sick Races", date: "2026-10-02", type: "drag-race", venue: "TBD", city: "Bonne Terre", state: "MO" },
  { id: 55, name: "Memories Car Cruise", date: "2026-10-02", type: "cruise-night", venue: "Faith Church", city: "St. Louis", state: "MO", recurring: true },
  { id: 56, name: "JJ's Car Cruise", date: "2026-10-10", type: "cruise-night", venue: "TBD", city: "St. Charles", state: "MO", recurring: true },
  { id: 57, name: "Gear-Jammers — Susan G. Komen Car Show", date: "2026-10-10", type: "car-show", venue: "Freeburg Recreation Park", city: "Freeburg", state: "IL" },
  { id: 58, name: "Columbia Car Cruise", date: "2026-10-16", type: "cruise-night", venue: "Westpark Bowl", city: "Columbia", state: "IL", recurring: true },
  { id: 59, name: "Cruisin Lindbergh — Fall", date: "2026-10-17", type: "cruise-night", venue: "Lindbergh Blvd", city: "St. Louis", state: "MO", recurring: true },
  { id: 60, name: "55 Raceway Reunion", date: "2026-10-25", type: "car-show", venue: "55 Raceway", city: "Pevely", state: "MO" },
  { id: 61, name: "Gear-Jammers Cruise-In", date: "2026-10-25", type: "cruise-night", venue: "Valhalla-Gaerdner-Holton Funeral Home", city: "Belleville", state: "IL", recurring: true },
  // APRIL recurring
  { id: 62, name: "Columbia Car Cruise", date: "2026-04-17", type: "cruise-night", venue: "Westpark Bowl", city: "Columbia", state: "IL", recurring: true },
];

const MONTHS = ["April","May","June","July","August","September","October"];
const MONTH_NUMS = [4,5,6,7,8,9,10];

const TYPE_META = {
  "car-show":     { label: "Car Show",     color: "#E84040", bg: "rgba(232,64,64,0.15)" },
  "cruise-night": { label: "Cruise Night", color: "#F5A623", bg: "rgba(245,166,35,0.15)" },
  "swap-meet":    { label: "Swap Meet",    color: "#4ECDC4", bg: "rgba(78,205,196,0.15)" },
  "drag-race":    { label: "Drag Race",    color: "#A78BFA", bg: "rgba(167,139,250,0.15)" },
  "other":        { label: "Other",        color: "#94A3B8", bg: "rgba(148,163,184,0.15)" },
};

function formatDate(dateStr, dateEndStr) {
  const d = new Date(dateStr + "T12:00:00");
  const opts = { month: "short", day: "numeric" };
  if (!dateEndStr) return d.toLocaleDateString("en-US", opts);
  const d2 = new Date(dateEndStr + "T12:00:00");
  if (d.getMonth() === d2.getMonth()) {
    return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${d2.getDate()}`;
  }
  return `${d.toLocaleDateString("en-US", opts)} – ${d2.toLocaleDateString("en-US", opts)}`;
}

function getDayOfWeek(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
}

function getDay(dateStr) {
  return new Date(dateStr + "T12:00:00").getDate();
}

function getMonthNum(dateStr) {
  return new Date(dateStr + "T12:00:00").getMonth() + 1;
}

export default function App() {
  const [activeMonth, setActiveMonth] = useState(null);
  const [activeTypes, setActiveTypes] = useState([]);
  const [selected, setSelected] = useState(null);

  const toggleType = (t) => {
    setActiveTypes(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const filtered = useMemo(() => {
    return EVENTS.filter(e => {
      const m = getMonthNum(e.date);
      if (activeMonth !== null && m !== activeMonth) return false;
      if (activeTypes.length > 0 && !activeTypes.includes(e.type)) return false;
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [activeMonth, activeTypes]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(e => {
      const m = getMonthNum(e.date);
      if (!groups[m]) groups[m] = [];
      groups[m].push(e);
    });
    return groups;
  }, [filtered]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0D0D0D",
      fontFamily: "'Georgia', serif",
      color: "#E8E0D0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        .event-card { transition: all 0.18s ease; cursor: pointer; }
        .event-card:hover { transform: translateX(4px); background: rgba(255,255,255,0.04) !important; }
        .month-pill { transition: all 0.15s ease; cursor: pointer; }
        .month-pill:hover { opacity: 1 !important; }
        .type-chip { transition: all 0.15s ease; cursor: pointer; }
        .type-chip:hover { opacity: 0.85; }
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.75);
          display: flex; align-items: center; justify-content: center;
          z-index: 100; backdrop-filter: blur(4px);
          animation: fadeIn 0.15s ease;
        }
        .modal-box {
          background: #181818; border: 1px solid #2a2a2a;
          max-width: 460px; width: 90%; border-radius: 4px;
          padding: 36px; position: relative;
          animation: slideUp 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .stripe {
          height: 6px;
          background: repeating-linear-gradient(
            90deg, #E84040 0px, #E84040 20px, #F5A623 20px, #F5A623 40px,
            #0D0D0D 40px, #0D0D0D 44px
          );
        }
        @media (max-width: 600px) {
          .header-pad { padding: 24px 20px 20px !important; }
          .content-pad { padding: 0 20px 60px !important; }
          .event-venue { display: none; }
        }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #222" }}>
        <div className="stripe" />
        <div className="header-pad" style={{ padding: "32px 40px 28px", maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(42px, 8vw, 72px)",
              letterSpacing: "0.04em",
              lineHeight: 1,
              color: "#F0E8D8",
            }}>
              CruiseSTL
            </h1>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.2em",
              color: "#E84040",
              textTransform: "uppercase",
              paddingBottom: 4,
            }}>
              2026 Season
            </span>
          </div>
          <p style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: 14,
            color: "#777",
            marginTop: 6,
            letterSpacing: "0.02em",
          }}>
            Shows · Cruise Nights · Swap Meets · Drag Races — St. Louis &amp; surrounding region
          </p>
        </div>
      </div>

      <div className="content-pad" style={{ maxWidth: 900, margin: "0 auto", padding: "0 40px 80px" }}>

        {/* Filters */}
        <div style={{ padding: "28px 0 24px", borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {MONTHS.map((m, i) => {
              const mn = MONTH_NUMS[i];
              const active = activeMonth === mn;
              return (
                <button
                  key={m}
                  className="month-pill"
                  onClick={() => setActiveMonth(active ? null : mn)}
                  style={{
                    padding: "5px 14px",
                    border: active ? "1px solid #E84040" : "1px solid #2a2a2a",
                    borderRadius: 2,
                    background: active ? "rgba(232,64,64,0.1)" : "transparent",
                    color: active ? "#E84040" : "#666",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    opacity: activeMonth !== null && !active ? 0.5 : 1,
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(TYPE_META).map(([key, meta]) => {
              const active = activeTypes.includes(key);
              return (
                <button
                  key={key}
                  className="type-chip"
                  onClick={() => toggleType(key)}
                  style={{
                    padding: "4px 12px",
                    border: `1px solid ${active ? meta.color : "#222"}`,
                    borderRadius: 2,
                    background: active ? meta.bg : "transparent",
                    color: active ? meta.color : "#555",
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 500,
                    fontSize: 12,
                    cursor: "pointer",
                    letterSpacing: "0.04em",
                  }}
                >
                  {meta.label}
                </button>
              );
            })}
            <span style={{
              padding: "4px 12px",
              fontFamily: "'Barlow', sans-serif",
              fontSize: 12,
              color: "#444",
              alignSelf: "center",
            }}>
              {filtered.length} event{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Event list */}
        {MONTH_NUMS.filter(mn => grouped[mn]).map((mn) => (
          <div key={mn} style={{ marginTop: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 28,
                letterSpacing: "0.08em",
                color: "#C8B99A",
              }}>
                {MONTHS[MONTH_NUMS.indexOf(mn)]}
              </h2>
              <div style={{ flex: 1, height: 1, background: "#1e1e1e" }} />
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 12,
                color: "#444",
                letterSpacing: "0.1em",
              }}>
                {grouped[mn].length} EVENT{grouped[mn].length !== 1 ? "S" : ""}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {grouped[mn].map(event => {
                const meta = TYPE_META[event.type];
                return (
                  <div
                    key={event.id}
                    className="event-card"
                    onClick={() => setSelected(event)}
                    style={{
                      display: "flex",
                      alignItems: "stretch",
                      background: "rgba(255,255,255,0.015)",
                      borderLeft: `3px solid ${meta.color}`,
                      borderRadius: 2,
                    }}
                  >
                    {/* Date block */}
                    <div style={{
                      width: 64,
                      minWidth: 64,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "14px 0",
                      borderRight: "1px solid #1a1a1a",
                    }}>
                      <div style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.15em",
                        color: "#555",
                      }}>
                        {getDayOfWeek(event.date)}
                      </div>
                      <div style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 26,
                        lineHeight: 1,
                        color: "#D0C4B0",
                        marginTop: 2,
                      }}>
                        {getDay(event.date)}
                      </div>
                      {event.dateEnd && (
                        <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 9, color: "#444", marginTop: 1 }}>
                          –{getDay(event.dateEnd)}
                        </div>
                      )}
                    </div>

                    {/* Event info */}
                    <div style={{ flex: 1, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 15, color: "#E8E0D0" }}>
                            {event.name}
                          </span>
                          {event.recurring && (
                            <span style={{
                              fontSize: 9,
                              fontFamily: "'Barlow Condensed', sans-serif",
                              letterSpacing: "0.12em",
                              color: "#555",
                              textTransform: "uppercase",
                              border: "1px solid #2a2a2a",
                              padding: "1px 5px",
                              borderRadius: 2,
                            }}>
                              Recurring
                            </span>
                          )}
                        </div>
                        <div className="event-venue" style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#666", marginTop: 3 }}>
                          {event.venue !== "TBD" ? `${event.venue} · ` : ""}{event.city}{event.state ? `, ${event.state}` : ""}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{
                          padding: "3px 10px",
                          background: meta.bg,
                          color: meta.color,
                          borderRadius: 2,
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontWeight: 600,
                          fontSize: 11,
                          letterSpacing: "0.1em",
                          whiteSpace: "nowrap",
                          textTransform: "uppercase",
                        }}>
                          {meta.label}
                        </span>
                        <span style={{ color: "#333", fontSize: 18 }}>›</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", fontFamily: "'Barlow', sans-serif", color: "#444", fontSize: 14 }}>
            No events match your filters.
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 60,
          paddingTop: 24,
          borderTop: "1px solid #1a1a1a",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#3a3a3a" }}>
            Community-sourced. Know of a show? Submit it →
          </span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#2e2e2e", letterSpacing: "0.1em" }}>
            CRUISESTL · 2026
          </span>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{
              height: 3,
              background: TYPE_META[selected.type].color,
              marginBottom: 24,
              marginLeft: -36,
              marginRight: -36,
              marginTop: -36,
              borderRadius: "4px 4px 0 0",
            }} />
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 11,
              letterSpacing: "0.15em",
              color: TYPE_META[selected.type].color,
              textTransform: "uppercase",
              marginBottom: 8,
            }}>
              {TYPE_META[selected.type].label}{selected.recurring ? "  ·  Recurring" : ""}
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 32,
              letterSpacing: "0.05em",
              color: "#F0E8D8",
              lineHeight: 1.1,
              marginBottom: 20,
            }}>
              {selected.name}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Row label="Date" value={formatDate(selected.date, selected.dateEnd)} />
              <Row label="Venue" value={selected.venue !== "TBD" ? selected.venue : "—"} />
              <Row label="Location" value={`${selected.city}${selected.state ? `, ${selected.state}` : ""}`} />
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{
                marginTop: 28,
                width: "100%",
                padding: "10px",
                background: "transparent",
                border: "1px solid #2a2a2a",
                color: "#666",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 13,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                borderRadius: 2,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", gap: 16 }}>
      <span style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 11,
        letterSpacing: "0.12em",
        color: "#555",
        textTransform: "uppercase",
        width: 64,
        minWidth: 64,
        paddingTop: 1,
      }}>
        {label}
      </span>
      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#B8B0A0" }}>
        {value}
      </span>
    </div>
  );
}
