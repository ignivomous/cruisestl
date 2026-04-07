import { useState, useMemo } from "react";

const EVENTS = [
  // APRIL
  { id: 1, name: "Real Easter Car Show", date: "2026-04-05", types: ["car-show"], venue: "Family Arena", city: "St. Charles", state: "MO", region: "st-charles", url: null, image: null },
  { id: 2, name: "Memories Car Cruise", date: "2026-04-10", types: ["cruise-night"], venue: "Faith Church", city: "St. Louis", state: "MO", region: "downtown", recurring: true, url: null, image: null },
  { id: 3, name: "JJ's Car Cruise", date: "2026-04-11", types: ["cruise-night"], venue: "TBD", city: "St. Charles", state: "MO", region: "st-charles", recurring: true, url: null, image: null },
  { id: 4, name: "GCS Ballpark Swap Meet", date: "2026-04-12", types: ["swap-meet"], venue: "GCS Ballpark", city: "Sauget", state: "IL", region: "metro-east", url: null, image: null },
  { id: 5, name: "WWT Import Show & Stereo Competition", date: "2026-04-12", types: ["car-show"], venue: "WWT Raceway", city: "Madison", state: "IL", region: "metro-east", url: null, image: null },
  { id: 6, name: "Cruisin Lindbergh — Spring", date: "2026-04-18", types: ["cruise-night"], venue: "Lindbergh Blvd", city: "St. Louis", state: "MO", region: "west", recurring: true, url: null, image: null },
  { id: 7, name: "Columbia Car Cruise", date: "2026-04-17", types: ["cruise-night"], venue: "Westpark Bowl", city: "Columbia", state: "IL", region: "metro-east", recurring: true, url: null, image: null },
  { id: 8, name: "Gear-Jammers Cruise-In", date: "2026-04-26", types: ["cruise-night"], venue: "Danny's Irish Pub & Banquet Center", city: "Belleville", state: "IL", region: "metro-east", recurring: true, url: null, image: null },
  // MAY
  { id: 9, name: "Memories Car Cruise", date: "2026-05-01", types: ["cruise-night"], venue: "Faith Church", city: "St. Louis", state: "MO", region: "downtown", recurring: true, url: null, image: null },
  { id: 10, name: "Magic Dragon Car Show", date: "2026-05-01", dateEnd: "2026-05-02", types: ["car-show"], venue: "Bagnell Dam", city: "Lake Ozark", state: "MO", region: "out-of-region", url: null, image: null },
  { id: 11, name: "GCS Ballpark Model T Swap Meet", date: "2026-05-03", types: ["swap-meet"], venue: "GCS Ballpark", city: "Sauget", state: "IL", region: "metro-east", url: null, image: null },
  { id: 12, name: "Moonshine Mashup", date: "2026-05-08", dateEnd: "2026-05-09", types: ["car-show"], venue: "TBD", city: "Lebanon", state: "MO", region: "out-of-region", url: null, image: null },
  { id: 13, name: "Arnold Car Show", date: "2026-05-09", types: ["car-show"], venue: "Fox Center", city: "Arnold", state: "MO", region: "south", url: null, image: null },
  { id: 14, name: "Crystal City Car Show", date: "2026-05-09", types: ["car-show"], venue: "Saint Pius X Catholic High School", city: "Crystal City", state: "MO", region: "south", url: null, image: null },
  { id: 15, name: "Perryville Car Show", date: "2026-05-09", types: ["car-show"], venue: "Knights of Columbus", city: "Perryville", state: "MO", region: "out-of-region", url: null, image: null },
  { id: 16, name: "JJ's Car Cruise", date: "2026-05-09", types: ["cruise-night"], venue: "TBD", city: "St. Charles", state: "MO", region: "st-charles", recurring: true, url: null, image: null },
  { id: 17, name: "Columbia Car Cruise", date: "2026-05-15", types: ["cruise-night"], venue: "Westpark Bowl", city: "Columbia", state: "IL", region: "metro-east", recurring: true, url: null, image: null },
  { id: 18, name: "Relaxin in the Park", date: "2026-05-15", dateEnd: "2026-05-16", types: ["car-show"], venue: "Festus Park", city: "Festus", state: "MO", region: "south", url: null, image: null },
  { id: 19, name: "Gear-Jammers Cruise-In", date: "2026-05-17", types: ["cruise-night"], venue: "No Jacks", city: "Smithton", state: "IL", region: "metro-east", recurring: true, url: null, image: null },
  { id: 20, name: "NDRL Races & Free Car Show", date: "2026-05-22", dateEnd: "2026-05-23", types: ["drag-race", "car-show"], venue: "WWT Raceway", city: "Madison", state: "IL", region: "metro-east", url: null, image: null },
  // JUNE
  { id: 21, name: "Sybergs SMN Pre-Party", date: "2026-06-03", types: ["cruise-night"], venue: "Sybergs", city: "O'Fallon", state: "IL", region: "metro-east", url: null, image: null },
  { id: 22, name: "Street Machine Nationals", date: "2026-06-05", dateEnd: "2026-06-07", types: ["car-show"], venue: "Du Quoin State Fairgrounds", city: "Du Quoin", state: "IL", region: "out-of-region", url: null, image: null },
  { id: 23, name: "Wheatland Drag Boats", date: "2026-06-06", dateEnd: "2026-06-07", types: ["other"], venue: "Wheatland Lake", city: "Wheatland", state: "MO", region: "out-of-region", url: null, image: null },
  { id: 24, name: "Hot Rod Power Tour", date: "2026-06-08", dateEnd: "2026-06-12", types: ["other"], venue: "Multiple Stops", city: "Midwest", state: "", region: "out-of-region", url: null, image: null },
  { id: 25, name: "Custom Car Revival", date: "2026-06-11", dateEnd: "2026-06-13", types: ["car-show"], venue: "TBD", city: "Indianapolis", state: "IN", region: "out-of-region", url: null, image: null },
  { id: 26, name: "JJ's Car Cruise", date: "2026-06-13", types: ["cruise-night"], venue: "TBD", city: "St. Charles", state: "MO", region: "st-charles", recurring: true, url: null, image: null },
  { id: 27, name: "Boostfest", date: "2026-06-13", types: ["car-show"], venue: "WWT Raceway", city: "Madison", state: "IL", region: "metro-east", url: null, image: null },
  { id: 28, name: "Gear-Jammers Cruise-In", date: "2026-06-14", types: ["cruise-night"], venue: "Corner Chill and Grill", city: "Belleville", state: "IL", region: "metro-east", recurring: true, url: null, image: null },
  { id: 29, name: "Columbia Car Cruise", date: "2026-06-19", types: ["cruise-night"], venue: "Westpark Bowl", city: "Columbia", state: "IL", region: "metro-east", recurring: true, url: null, image: null },
  { id: 30, name: "Heartland Nova Show", date: "2026-06-18", dateEnd: "2026-06-20", types: ["car-show"], venue: "TBD", city: "St. Louis", state: "MO", region: "downtown", url: null, image: null },
  { id: 31, name: "Mexico Missouri Car Show", date: "2026-06-20", types: ["car-show"], venue: "TBD", city: "Mexico", state: "MO", region: "out-of-region", url: null, image: null },
  // JULY
  { id: 32, name: "Memories Car Cruise", date: "2026-07-03", types: ["cruise-night"], venue: "Faith Church", city: "St. Louis", state: "MO", region: "downtown", recurring: true, url: null, image: null },
  { id: 33, name: "NDRL Indy", date: "2026-07-10", dateEnd: "2026-07-11", types: ["drag-race"], venue: "TBD", city: "Indianapolis", state: "IN", region: "out-of-region", url: null, image: null },
  { id: 34, name: "JJ's Car Cruise", date: "2026-07-11", types: ["cruise-night"], venue: "TBD", city: "St. Charles", state: "MO", region: "st-charles", recurring: true, url: null, image: null },
  { id: 35, name: "Meltdown Drags", date: "2026-07-17", dateEnd: "2026-07-18", types: ["drag-race"], venue: "Byron Dragway", city: "Byron", state: "IL", region: "out-of-region", url: null, image: null },
  { id: 36, name: "Columbia Car Cruise", date: "2026-07-17", types: ["cruise-night"], venue: "Westpark Bowl", city: "Columbia", state: "IL", region: "metro-east", recurring: true, url: null, image: null },
  { id: 37, name: "Cruisin Lindbergh — Summer", date: "2026-07-18", types: ["cruise-night"], venue: "Lindbergh Blvd", city: "St. Louis", state: "MO", region: "west", recurring: true, url: null, image: null },
  { id: 38, name: "Gear-Jammers Cruise-In", date: "2026-07-18", types: ["cruise-night"], venue: "Belleville/Swansea Moose Lodge #1221", city: "Swansea", state: "IL", region: "metro-east", recurring: true, url: null, image: null },
  { id: 39, name: "Bootheel Races", date: "2026-07-24", dateEnd: "2026-07-25", types: ["drag-race"], venue: "TBD", city: "Sikeston", state: "MO", region: "out-of-region", url: null, image: null },
  { id: 40, name: "Fatheads Car Show", date: "2026-07-25", types: ["car-show"], venue: "Fatheads", city: "Wright City", state: "MO", region: "st-charles", url: null, image: null },
  // AUGUST
  { id: 41, name: "Memories Car Cruise", date: "2026-08-07", types: ["cruise-night"], venue: "Faith Church", city: "St. Louis", state: "MO", region: "downtown", recurring: true, url: null, image: null },
  { id: 42, name: "JJ's Car Cruise", date: "2026-08-08", types: ["cruise-night"], venue: "TBD", city: "St. Charles", state: "MO", region: "st-charles", recurring: true, url: null, image: null },
  { id: 43, name: "SOA Models Car Show", date: "2026-08-08", types: ["car-show"], venue: "TBD", city: "St. Louis", state: "MO", region: "downtown", url: null, image: null },
  { id: 44, name: "Gear-Jammers Cruise-In", date: "2026-08-16", types: ["cruise-night"], venue: "AJ's Smashed and Smoked", city: "Belleville", state: "IL", region: "metro-east", recurring: true, url: null, image: null },
  { id: 45, name: "Columbia Car Cruise", date: "2026-08-21", types: ["cruise-night"], venue: "Westpark Bowl", city: "Columbia", state: "IL", region: "metro-east", recurring: true, url: null, image: null },
  { id: 46, name: "Glutton Club Party", date: "2026-08-29", types: ["other"], venue: "TBD", city: "St. Louis", state: "MO", region: "downtown", url: null, image: null },
  // SEPTEMBER
  { id: 47, name: "Memories Car Cruise", date: "2026-09-04", types: ["cruise-night"], venue: "Faith Church", city: "St. Louis", state: "MO", region: "downtown", recurring: true, url: null, image: null },
  { id: 48, name: "Wheatland Drag Boats", date: "2026-09-04", dateEnd: "2026-09-06", types: ["other"], venue: "Wheatland Lake", city: "Wheatland", state: "MO", region: "out-of-region", url: null, image: null },
  { id: 49, name: "JJ's Car Cruise", date: "2026-09-12", types: ["cruise-night"], venue: "TBD", city: "St. Charles", state: "MO", region: "st-charles", recurring: true, url: null, image: null },
  { id: 50, name: "Gear-Jammers 31st Annual Car Show", date: "2026-09-13", types: ["car-show", "cruise-night"], venue: "Silver Creek Sports & Social", city: "Belleville", state: "IL", region: "metro-east", url: null, image: null },
  { id: 51, name: "Drag Week", date: "2026-09-14", dateEnd: "2026-09-18", types: ["drag-race"], venue: "Multiple Stops", city: "Midwest", state: "", region: "out-of-region", url: null, image: null },
  { id: 52, name: "Columbia Car Cruise", date: "2026-09-18", types: ["cruise-night"], venue: "Westpark Bowl", city: "Columbia", state: "IL", region: "metro-east", recurring: true, url: null, image: null },
  { id: 53, name: "Route 66 Cruise", date: "2026-09-25", dateEnd: "2026-09-27", types: ["other"], venue: "Route 66", city: "Springfield", state: "IL", region: "out-of-region", url: null, image: null },
  { id: 54, name: "Bonne Terre Sick Races", date: "2026-09-28", types: ["drag-race"], venue: "TBD", city: "Bonne Terre", state: "MO", region: "south", url: null, image: null },
  // OCTOBER
  { id: 55, name: "Bonne Terre Sick Races", date: "2026-10-02", types: ["drag-race"], venue: "TBD", city: "Bonne Terre", state: "MO", region: "south", url: null, image: null },
  { id: 56, name: "Memories Car Cruise", date: "2026-10-02", types: ["cruise-night"], venue: "Faith Church", city: "St. Louis", state: "MO", region: "downtown", recurring: true, url: null, image: null },
  { id: 57, name: "JJ's Car Cruise", date: "2026-10-10", types: ["cruise-night"], venue: "TBD", city: "St. Charles", state: "MO", region: "st-charles", recurring: true, url: null, image: null },
  { id: 58, name: "Gear-Jammers — Susan G. Komen Car Show", date: "2026-10-10", types: ["car-show"], venue: "Freeburg Recreation Park", city: "Freeburg", state: "IL", region: "metro-east", url: null, image: null },
  { id: 59, name: "Columbia Car Cruise", date: "2026-10-16", types: ["cruise-night"], venue: "Westpark Bowl", city: "Columbia", state: "IL", region: "metro-east", recurring: true, url: null, image: null },
  { id: 60, name: "Cruisin Lindbergh — Fall", date: "2026-10-17", types: ["cruise-night"], venue: "Lindbergh Blvd", city: "St. Louis", state: "MO", region: "west", recurring: true, url: null, image: null },
  { id: 61, name: "55 Raceway Reunion", date: "2026-10-25", types: ["car-show"], venue: "55 Raceway", city: "Pevely", state: "MO", region: "south", url: null, image: null },
  { id: 62, name: "Gear-Jammers Cruise-In", date: "2026-10-25", types: ["cruise-night"], venue: "Valhalla-Gaerdner-Holton Funeral Home", city: "Belleville", state: "IL", region: "metro-east", recurring: true, url: null, image: null },
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
  const end = (event.dateEnd || event.date).replace(/-/g,"");
  const title = encodeURIComponent(event.name);
  const loc = encodeURIComponent(`${event.venue !== "TBD" ? event.venue + ", " : ""}${event.city}${event.state ? ", " + event.state : ""}`);
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${loc}`;
}

export default function App() {
  const [activeMonth, setActiveMonth] = useState(null);
  const [activeTypes, setActiveTypes] = useState([]);
  const [activeRegions, setActiveRegions] = useState([]);
  const [showPast, setShowPast] = useState(false);
  const [weekend, setWeekend] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const toggleType = t => setActiveTypes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const toggleRegion = r => setActiveRegions(p => p.includes(r) ? p.filter(x => x !== r) : [...p, r]);

  const filtered = useMemo(() => EVENTS.filter(e => {
    if (!showPast && isPast(e.date, e.dateEnd)) return false;
    if (weekend && !isThisWeekend(e.date, e.dateEnd)) return false;
    if (activeMonth !== null && getMonthNum(e.date) !== activeMonth) return false;
    if (activeTypes.length > 0 && !activeTypes.some(t => e.types.includes(t))) return false;
    if (activeRegions.length > 0 && !activeRegions.includes(e.region)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!e.name.toLowerCase().includes(q) && !e.city.toLowerCase().includes(q) && !e.venue.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a,b) => a.date.localeCompare(b.date)), [activeMonth, activeTypes, activeRegions, showPast, weekend, search]);

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

        {/* Filters */}
        <div style={{padding:"18px 0 0"}}>

          {/* Row 1: search + quick toggles */}
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

          {/* Row 2: months */}
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>
            {MONTHS.map((m,i)=>{const mn=MONTH_NUMS[i];const a=activeMonth===mn;return(
              <button key={m} className="pill" onClick={()=>setActiveMonth(a?null:mn)} style={{padding:"3px 11px",border:a?"1px solid #E84040":"1px solid #1a1a1a",borderRadius:2,background:a?"rgba(232,64,64,0.1)":"transparent",color:a?"#E84040":"#555",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:11,letterSpacing:"0.12em",textTransform:"uppercase",opacity:activeMonth!==null&&!a?0.35:1}}>
                {m}
              </button>
            );})}
          </div>

          {/* Row 3: types */}
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>
            {Object.entries(TYPE_META).map(([key,meta])=>{const a=activeTypes.includes(key);return(
              <button key={key} className="pill" onClick={()=>toggleType(key)} style={{padding:"3px 10px",border:`1px solid ${a?meta.color:"#1a1a1a"}`,borderRadius:2,background:a?meta.bg:"transparent",color:a?meta.color:"#555",fontFamily:"'Barlow',sans-serif",fontWeight:500,fontSize:11}}>
                {meta.label}
              </button>
            );})}
          </div>

          {/* Row 4: regions */}
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
                const past=isPast(event.date,event.dateEnd);
                const meta=TYPE_META[event.types[0]];
                return(
                  <div key={event.id} className={`ecard${past?" past":""}`} onClick={()=>setSelected(event)}
                    style={{display:"flex",alignItems:"stretch",background:"rgba(255,255,255,0.012)",borderLeft:`3px solid ${meta.color}`,borderRadius:2}}>
                    {/* Date */}
                    <div style={{width:56,minWidth:56,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"11px 0",borderRight:"1px solid #161616"}}>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,fontWeight:600,letterSpacing:"0.15em",color:"#3a3a3a"}}>{getDayOfWeek(event.date)}</div>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,lineHeight:1,color:"#B8A88A",marginTop:1}}>{getDay(event.date)}</div>
                      {event.dateEnd&&<div style={{fontFamily:"'Barlow',sans-serif",fontSize:8,color:"#333",marginTop:1}}>–{getDay(event.dateEnd)}</div>}
                    </div>
                    {/* Info */}
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
                          {event.types.map(t=>(
                            <span key={t} style={{padding:"2px 7px",background:TYPE_META[t].bg,color:TYPE_META[t].color,borderRadius:2,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:9,letterSpacing:"0.08em",whiteSpace:"nowrap",textTransform:"uppercase"}}>{TYPE_META[t].label}</span>
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
      </div>

      {/* Modal */}
      {selected&&(
        <div className="overlay" onClick={()=>setSelected(null)}>
          <div className="mbox" onClick={e=>e.stopPropagation()}>
            <div style={{height:3,background:TYPE_META[selected.types[0]].color,marginBottom:18,marginLeft:-30,marginRight:-30,marginTop:-30,borderRadius:"6px 6px 0 0"}}/>

            {/* Type tags */}
            <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
              {selected.types.map(t=>(
                <span key={t} style={{padding:"2px 9px",background:TYPE_META[t].bg,color:TYPE_META[t].color,borderRadius:2,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase"}}>{TYPE_META[t].label}</span>
              ))}
              {selected.recurring&&<span style={{padding:"2px 9px",border:"1px solid #222",color:"#444",borderRadius:2,fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase"}}>Recurring Series</span>}
            </div>

            <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:"0.04em",color:"#F0E8D8",lineHeight:1.1,marginBottom:16}}>{selected.name}</h2>

            {/* Flyer image */}
            {selected.image&&<img src={selected.image} alt="Event flyer" style={{width:"100%",borderRadius:3,marginBottom:16,border:"1px solid #1e1e1e"}}/>}

            {/* Details */}
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:20}}>
              <MRow label="Date" value={formatDate(selected.date,selected.dateEnd)}/>

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

            {/* Actions */}
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
      )}
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
