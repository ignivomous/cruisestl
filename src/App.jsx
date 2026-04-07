import { useState, useMemo, useEffect } from "react";
import { supabase } from "./supabase";

const MONTHS = ["April","May","June","July","August","September","October"];
const MONTH_NUMS = [4,5,6,7,8,9,10];

const TYPE_META = {
  "car-show":     { label: "Car Show",     color: "#E84040", bg: "rgba(232,64,64,0.15)" },
  "cruise-night": { label: "Cruise Night", color: "#F5A623", bg: "rgba(245,166,35,0.15)" },
  "swap-meet":    { label: "Swap Meet",    color: "#4ECDC4", bg: "rgba(78,205,196,0.15)" },
  "drag-race":    { label: "Drag Race",    color: "#A78BFA", bg: "rgba(167,139,250,0.15)" },
  "other":        { label: "Other",        color: "#94A3B8", bg: "rgba(148,163,184,0.15)" },
};

const REGION_META = {
  "downtown":      { label: "Downtown / Inner Ring" },
  "west":          { label: "West County" },
  "south":         { label: "South County" },
  "st-charles":    { label: "St. Charles" },
  "metro-east":    { label: "Metro East (IL)" },
  "out-of-region": { label: "Road Trip" },
};

function formatDate(dateStr, dateEndStr) {
  const d = new Date(dateStr + "T12:00:00");
  const opts = { month: "short", day: "numeric" };
  if (!dateEndStr) return d.toLocaleDateString("en-US", opts);
  const d2 = new Date(dateEndStr + "T12:00:00");
  if (d.getMonth() === d2.getMonth()) return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${d2.getDate()}`;
  return `${d.toLocaleDateString("en-US", opts)} – ${d2.toLocaleDateString("en-US", opts)}`;
}

function getDayOfWeek(dateStr) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
}

function getDay(dateStr) {
  return new Date(dateStr + "T12:00:00").getDate();
}

function getMonthNum(dateStr) {
  return new Date(dateStr + "T12:00:00").getMonth() + 1;
}

function isPast(dateStr, dateEndStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  return new Date((dateEndStr || dateStr) + "T23:59:59") < today;
}

function isThisWeekend(dateStr, dateEndStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  const dow = today.getDay();
  const friday = new Date(today); friday.setDate(today.getDate() + ((5 - dow + 7) % 7));
  const sunday = new Date(friday); sunday.setDate(friday.getDate() + 2); sunday.setHours(23,59,59);
  return new Date(dateStr + "T00:00:00") <= sunday && new Date((dateEndStr || dateStr) + "T23:59:59") >= friday;
}

function googleMapsUrl(venue, city, state) {
  const q = encodeURIComponent(`${venue !== "TBD" ? venue + ", " : ""}${city}${state ? ", " + state : ""}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function addToCalendarUrl(event) {
  const start = event.date.replace(/-/g,"");
  const end = (event.date_end || event.date).replace(/-/g,"");
  const title = encodeURIComponent(event.name);
  const loc = encodeURIComponent(`${event.venue !== "TBD" ? event.venue + ", " : ""}${event.city}${event.state ? ", " + event.state : ""}`);
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${loc}`;
}

// Supabase stores types as a comma-separated string — convert to array
function parseTypes(typesStr) {
  if (!typesStr) return ["other"];
  return typesStr.split(",").map(t => t.trim());
}

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMonth, setActiveMonth] = useState(null);
  const [activeTypes, setActiveTypes] = useState([]);
  const [activeRegions, setActiveRegions] = useState([]);
  const [showPast, setShowPast] = useState(false);
  const [weekend, setWeekend] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("date", { ascending: true });
        if (error) throw error;
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const toggleType = t => setActiveTypes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const toggleRegion = r => setActiveRegions(p => p.includes(r) ? p.filter(x => x !== r) : [...p, r]);

  const filtered = useMemo(() => events.filter(e => {
    const types = parseTypes(e.types);
    if (!showPast && isPast(e.date, e.date_end)) return false;
    if (weekend && !isThisWeekend(e.date, e.date_end)) return false;
    if (activeMonth !== null && getMonthNum(e.date) !== activeMonth) return false;
    if (activeTypes.length > 0 && !activeTypes.some(t => types.includes(t))) return false;
    if (activeRegions.length > 0 && !activeRegions.includes(e.region)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!e.name.toLowerCase().includes(q) && !e.city.toLowerCase().includes(q) && !(e.venue||"").toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a,b) => a.date.localeCompare(b.date)), [events, activeMonth, activeTypes, activeRegions, showPast, weekend, search]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(e => { const m = getMonthNum(e.date); if (!g[m]) g[m] = []; g[m].push(e); });
    return g;
  }, [filtered]);

  const hasFilters = activeMonth || activeTypes.length || activeRegions.length || weekend || search.trim();
  const clearAll = () => { setActiveMonth(null); setActiveTypes([]); setActiveRegions([]); setWeekend(false); setSearch(""); };

  return (
    <div style={{ minHeight:"100vh", background:"#0D0D0D", color:"#E8E0D0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:6px;} ::-webkit-scrollbar-track{background:#111;} ::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:3px;}
        .ecard{transition:all .18s ease;cursor:pointer;}
        .ecard:hover{transform:translateX(4px);background:rgba(255,255,255,0.05)!important;}
        .ecard.past{opacity:.3;}
        .pill{transition:all .15s ease;cursor:pointer;border:none;}
        .pill:hover{opacity:.8;}
        .sbtn{transition:all .15s ease;}
        .sbtn:hover{background:#E84040!important;color:#fff!important;border-color:#E84040!important;}
        .mlink{text-decoration:none;transition:color .15s;}
        .mlink:hover{color:#F5A623!important;}
        .sinput{outline:none;} .sinput::placeholder{color:#3a3a3a;}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.82);display:flex;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(6px);animation:fi .15s ease;padding:16px;}
        .mbox{background:#161616;border:1px solid #222;max-width:480px;width:100%;border-radius:6px;padding:30px;max-height:90vh;overflow-y:auto;animation:su .2s ease;}
        @keyframes fi{from{opacity:0}to{opacity:1}}
        @keyframes su{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
        .stripe{height:5px;background:repeating-linear-gradient(90deg,#E84040 0,#E84040 18px,#F5A623 18px,#F5A623 36px,#0D0D0D 36px,#0D0D0D 40px);}
        @media(max-width:640px){
          .hi{padding:16px 16px 14px!important;}
          .ci{padding:0 16px 60px!important;}
          .hm{display:none!important;}
          .mbox{padding:22px;}
        }
      `}</style>

      {/* Sticky header */}
      <div style={{borderBottom:"1px solid #1a1a1a",position:"sticky",top:0,zIndex:50,background:"#0D0D0D"}}>
        <div className="stripe"/>
        <div className="hi" style={{padding:"18px 40px 14px",maxWidth:940,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <div>
            <div style={{display:"flex",alignItems:"baseline",gap:10,flexWrap:"wrap"}}>
              <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(34px,5.5vw,58px)",letterSpacing:"0.06em",lineHeight:1,color:"#F0E8D8"}}>CruiseSTL</h1>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"#E84040",textTransform:"uppercase"}}>2026 Season</span>
            </div>
            <p className="hm" style={{fontFamily:"'Barlow',sans-serif",fontSize:12,color:"#444",marginTop:2}}>Shows · Cruise Nights · Swap Meets · Drag Races — St. Louis region</p>
          </div>
          <a href="https://forms.gle/placeholder" target="_blank" rel="noopener noreferrer" className="sbtn" style={{
            padding:"8px 16px",background:"transparent",border:"1px solid #E84040",color:"#E84040",
            fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:12,letterSpacing:"0.12em",
            textTransform:"uppercase",borderRadius:3,textDecoration:"none",whiteSpace:"nowrap",flexShrink:0,
          }}>+ Submit Event</a>
        </div>
      </div>

      <div className="ci" style={{maxWidth:940,margin:"0 auto",padding:"0 40px 80px"}}>

        {/* Loading state */}
        {loading && (
          <div style={{textAlign:"center",padding:"80px 0"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:"#2a2a2a",letterSpacing:"0.1em"}}>Loading Events...</div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div style={{textAlign:"center",padding:"80px 0"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:"#E84040",letterSpacing:"0.1em"}}>Could not load events</div>
            <div style={{fontFamily:"'Barlow',sans-serif",fontSize:13,color:"#555",marginTop:8}}>{error}</div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Filters */}
            <div style={{padding:"18px 0 0"}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10,flexWrap:"wrap"}}>
                <div style={{position:"relative",flex:"1",minWidth:160}}>
                  <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#3a3a3a",fontSize:14,pointerEvents:"none"}}>⌕</span>
                  <input className="sinput" type="text" placeholder="Search events, venues, cities..." value={search} onChange={e=>setSearch(e.target.value)}
                    style={{width:"100%",padding:"7px 10px 7px 28px",background:"#0f0f0f",border:"1px solid #1e1e1e",borderRadius:3,color:"#B8B0A0",fontFamily:"'Barlow',sans-serif",fontSize:12}}/>
                </div>
                <button className="pill" onClick={()=>setWeekend(p=>!p)} style={{padding:"6px 12px",background:weekend?"rgba(245,166,35,0.12)":"transparent",border:`1px solid ${weekend?"#F5A623":"#1e1e1e"}`,color:weekend?"#F5A623":"#555",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",borderRadius:3,whiteSpace:"nowrap"}}>
                  This Weekend
                </button>
                <button className="pill" onClick={()=>setShowPast(p=>!p)} style={{padding:"6px 12px",background:showPast?"rgba(148,163,184,0.08)":"transparent",border:`1px solid ${showPast?"#444":"#1e1e1e"}`,color:showPast?"#777":"#3a3a3a",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",borderRadius:3,whiteSpace:"nowrap"}}>
                  Show Past
                </button>
                {hasFilters && <button className="pill" onClick={clearAll} style={{padding:"6px 10px",background:"transparent",border:"1px solid #222",color:"#444",fontFamily:"'Barlow',sans-serif",fontSize:11,borderRadius:3}}>Clear all</button>}
              </div>

              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>
                {MONTHS.map((m,i)=>{const mn=MONTH_NUMS[i];const a=activeMonth===mn;return(
                  <button key={m} className="pill" onClick={()=>setActiveMonth(a?null:mn)} style={{padding:"3px 11px",border:a?"1px solid #E84040":"1px solid #1a1a1a",borderRadius:2,background:a?"rgba(232,64,64,0.1)":"transparent",color:a?"#E84040":"#555",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:11,letterSpacing:"0.12em",textTransform:"uppercase",opacity:activeMonth!==null&&!a?0.35:1}}>
                    {m}
                  </button>
                );})}
              </div>

              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>
                {Object.entries(TYPE_META).map(([key,meta])=>{const a=activeTypes.includes(key);return(
                  <button key={key} className="pill" onClick={()=>toggleType(key)} style={{padding:"3px 10px",border:`1px solid ${a?meta.color:"#1a1a1a"}`,borderRadius:2,background:a?meta.bg:"transparent",color:a?meta.color:"#555",fontFamily:"'Barlow',sans-serif",fontWeight:500,fontSize:11}}>
                    {meta.label}
                  </button>
                );})}
              </div>

              <div style={{display:"flex",gap:5,flexWrap:"wrap",paddingBottom:14,borderBottom:"1px solid #181818"}}>
                {Object.entries(REGION_META).map(([key,meta])=>{const a=activeRegions.includes(key);return(
                  <button key={key} className="pill" onClick={()=>toggleRegion(key)} style={{padding:"3px 10px",border:`1px solid ${a?"#C8B99A":"#1a1a1a"}`,borderRadius:2,background:a?"rgba(200,185,154,0.08)":"transparent",color:a?"#C8B99A":"#555",fontFamily:"'Barlow',sans-serif",fontWeight:500,fontSize:11}}>
                    {meta.label}
                  </button>
                );})}
                <span style={{fontFamily:"'Barlow',sans-serif",fontSize:11,color:"#2e2e2e",alignSelf:"center",marginLeft:6}}>
                  {filtered.length} event{filtered.length!==1?"s":""}
                </span>
              </div>
            </div>

            {/* Event list */}
            {MONTH_NUMS.filter(mn=>grouped[mn]).map(mn=>(
              <div key={mn} style={{marginTop:32}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                  <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:"0.08em",color:"#C8B99A"}}>{MONTHS[MONTH_NUMS.indexOf(mn)]}</h2>
                  <div style={{flex:1,height:1,background:"#181818"}}/>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,color:"#2e2e2e",letterSpacing:"0.1em"}}>{grouped[mn].length} EVENT{grouped[mn].length!==1?"S":""}</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:1}}>
                  {grouped[mn].map(event=>{
                    const past=isPast(event.date,event.date_end);
                    const types=parseTypes(event.types);
                    const meta=TYPE_META[types[0]]||TYPE_META["other"];
                    return(
                      <div key={event.id} className={`ecard${past?" past":""}`} onClick={()=>setSelected(event)}
                        style={{display:"flex",alignItems:"stretch",background:"rgba(255,255,255,0.012)",borderLeft:`3px solid ${meta.color}`,borderRadius:2}}>
                        <div style={{width:56,minWidth:56,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"11px 0",borderRight:"1px solid #161616"}}>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,fontWeight:600,letterSpacing:"0.15em",color:"#3a3a3a"}}>{getDayOfWeek(event.date)}</div>
                          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,lineHeight:1,color:"#B8A88A",marginTop:1}}>{getDay(event.date)}</div>
                          {event.date_end&&<div style={{fontFamily:"'Barlow',sans-serif",fontSize:8,color:"#333",marginTop:1}}>–{getDay(event.date_end)}</div>}
                        </div>
                        <div style={{flex:1,padding:"11px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,minWidth:0}}>
                          <div style={{minWidth:0,flex:1}}>
                            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                              <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:13,color:"#E0D8C8"}}>{event.name}</span>
                              {event.recurring&&<span style={{fontSize:8,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.1em",color:"#3a3a3a",textTransform:"uppercase",border:"1px solid #1e1e1e",padding:"1px 4px",borderRadius:2,whiteSpace:"nowrap"}}>Series</span>}
                            </div>
                            <div style={{fontFamily:"'Barlow',sans-serif",fontSize:11,color:"#4a4a4a",marginTop:2}}>
                              {event.venue!=="TBD"&&<span className="hm">{event.venue} · </span>}
                              <span style={{color:"#555"}}>{event.city}{event.state?`, ${event.state}`:""}</span>
                              {event.region&&<span style={{marginLeft:6,color:"#2e2e2e",fontSize:10}}>{REGION_META[event.region]?.label}</span>}
                            </div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
                            <div style={{display:"flex",flexDirection:"column",gap:2,alignItems:"flex-end"}}>
                              {types.map(t=>(
                                <span key={t} style={{padding:"2px 7px",background:(TYPE_META[t]||TYPE_META.other).bg,color:(TYPE_META[t]||TYPE_META.other).color,borderRadius:2,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:9,letterSpacing:"0.08em",whiteSpace:"nowrap",textTransform:"uppercase"}}>{(TYPE_META[t]||TYPE_META.other).label}</span>
                              ))}
                            </div>
                            <span style={{color:"#282828",fontSize:14}}>›</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {filtered.length===0&&(
              <div style={{textAlign:"center",padding:"72px 0"}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:"#222",letterSpacing:"0.1em"}}>No Events Found</div>
                <div style={{fontFamily:"'Barlow',sans-serif",fontSize:13,color:"#3a3a3a",marginTop:8}}>
                  Try adjusting your filters or <span style={{color:"#E84040",cursor:"pointer"}} onClick={clearAll}>clear all</span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{marginTop:56,paddingTop:18,borderTop:"1px solid #181818",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
              <span style={{fontFamily:"'Barlow',sans-serif",fontSize:11,color:"#2a2a2a"}}>Community-sourced · St. Louis car culture</span>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,color:"#222",letterSpacing:"0.1em"}}>CRUISESTL · 2026</span>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {selected&&(()=>{
        const types=parseTypes(selected.types);
        const meta=TYPE_META[types[0]]||TYPE_META.other;
        return(
          <div className="overlay" onClick={()=>setSelected(null)}>
            <div className="mbox" onClick={e=>e.stopPropagation()}>
              <div style={{height:3,background:meta.color,marginBottom:18,marginLeft:-30,marginRight:-30,marginTop:-30,borderRadius:"6px 6px 0 0"}}/>
              <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
                {types.map(t=>(
                  <span key={t} style={{padding:"2px 9px",background:(TYPE_META[t]||TYPE_META.other).bg,color:(TYPE_META[t]||TYPE_META.other).color,borderRadius:2,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase"}}>{(TYPE_META[t]||TYPE_META.other).label}</span>
                ))}
                {selected.recurring&&<span style={{padding:"2px 9px",border:"1px solid #222",color:"#444",borderRadius:2,fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase"}}>Recurring Series</span>}
              </div>
              <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:"0.04em",color:"#F0E8D8",lineHeight:1.1,marginBottom:16}}>{selected.name}</h2>
              {selected.image&&<img src={selected.image} alt="Event flyer" style={{width:"100%",borderRadius:3,marginBottom:16,border:"1px solid #1e1e1e"}}/>}
              <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:20}}>
                <MRow label="Date" value={formatDate(selected.date,selected.date_end)}/>
                <div style={{display:"flex",gap:14}}>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:"0.12em",color:"#444",textTransform:"uppercase",width:60,minWidth:60,paddingTop:1}}>Venue</span>
                  {selected.venue!=="TBD"
                    ?<a href={googleMapsUrl(selected.venue,selected.city,selected.state)} target="_blank" rel="noopener noreferrer" className="mlink" style={{fontFamily:"'Barlow',sans-serif",fontSize:13,color:"#A8A098"}}>{selected.venue} ↗</a>
                    :<span style={{fontFamily:"'Barlow',sans-serif",fontSize:13,color:"#333"}}>TBD</span>}
                </div>
                <div style={{display:"flex",gap:14}}>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:"0.12em",color:"#444",textTransform:"uppercase",width:60,minWidth:60,paddingTop:1}}>Location</span>
                  <a href={googleMapsUrl(selected.venue,selected.city,selected.state)} target="_blank" rel="noopener noreferrer" className="mlink" style={{fontFamily:"'Barlow',sans-serif",fontSize:13,color:"#A8A098"}}>
                    {selected.city}{selected.state?`, ${selected.state}`:""} ↗
                  </a>
                </div>
                <MRow label="Area" value={REGION_META[selected.region]?.label||"—"}/>
                {selected.url&&(
                  <div style={{display:"flex",gap:14}}>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:"0.12em",color:"#444",textTransform:"uppercase",width:60,minWidth:60,paddingTop:1}}>More Info</span>
                    <a href={selected.url} target="_blank" rel="noopener noreferrer" className="mlink" style={{fontFamily:"'Barlow',sans-serif",fontSize:13,color:"#A8A098"}}>Visit website ↗</a>
                  </div>
                )}
              </div>
              <div style={{display:"flex",gap:8}}>
                <a href={addToCalendarUrl(selected)} target="_blank" rel="noopener noreferrer" style={{flex:1,padding:"9px",textAlign:"center",background:"rgba(232,64,64,0.08)",border:"1px solid rgba(232,64,64,0.25)",color:"#E84040",fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",borderRadius:3,textDecoration:"none"}}>
                  + Add to Calendar
                </a>
                <button onClick={()=>setSelected(null)} style={{flex:1,padding:"9px",background:"transparent",border:"1px solid #1e1e1e",color:"#444",fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",borderRadius:3}}>
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function MRow({label,value}){
  return(
    <div style={{display:"flex",gap:14}}>
      <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:"0.12em",color:"#444",textTransform:"uppercase",width:60,minWidth:60,paddingTop:1}}>{label}</span>
      <span style={{fontFamily:"'Barlow',sans-serif",fontSize:13,color:"#A8A098"}}>{value}</span>
    </div>
  );
}
