import { useState } from "react";

const P = {
  pink:"#FF8FAB", pinkL:"#FFD6E4",
  purple:"#B39DDB", purpleL:"#EDE7F6",
  mint:"#69C9A0", mintL:"#D0F5E8",
  peach:"#FFB07C", peachL:"#FFE5CC",
  sky:"#64B5F6", skyL:"#DCEEFB",
  // sunflower palette
  sun:"#F9C22E", sunL:"#FEF3C7",
  sunDark:"#D97706", sunMid:"#FCD34D",
  leaf:"#4CAF7D", leafL:"#D1FAE5",
  brown:"#92400E", brownL:"#FEF3C7",
};

const DEFAULT_CATS = [
  {id:"evento",  name:"Eventos",  emoji:"🎉", color:P.pink,   bg:P.pinkL  },
  {id:"facultad",name:"Facultad", emoji:"📚", color:P.purple, bg:P.purpleL},
  {id:"trabajo", name:"Trabajo",  emoji:"💼", color:P.peach,  bg:P.peachL },
  {id:"personal",name:"Personal", emoji:"🌸", color:P.mint,   bg:P.mintL  },
];

const MOODS = [
  {emoji:"😄", label:"Increíble", val:5, color:"#FFD700"},
  {emoji:"😊", label:"Bien",      val:4, color:"#98E898"},
  {emoji:"😐", label:"Normal",    val:3, color:"#90CAF9"},
  {emoji:"😔", label:"Bajón",     val:2, color:"#CE93D8"},
  {emoji:"😢", label:"Difícil",   val:1, color:"#F48FB1"},
];

const DAYS_ES   = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                   "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const uid      = () => Math.random().toString(36).substr(2,8);
const pad      = n  => String(n).padStart(2,"0");
const toKey    = d  => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const todayKey = toKey(new Date());

function fmtDay(key) {
  if (!key) return "";
  const d = new Date(key + "T12:00:00");
  return d.toLocaleDateString("es-AR", {weekday:"long", day:"numeric", month:"long"});
}

function buildMonthCells(year, month) {
  const firstDow  = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  return cells;
}

function stepMonth(year, month, dir) {
  let m = month + dir, y = year;
  if (m > 11) { m = 0; y++; }
  if (m < 0)  { m = 11; y--; }
  return { y, m };
}

// Get monday of the current week
function getWeekRange(offset = 0) {
  const d = new Date();
  const dow = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1) + offset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: toKey(monday), end: toKey(sunday), monday, sunday };
}

function getMonthRange(year, month) {
  const start = `${year}-${pad(month+1)}-01`;
  const lastDay = new Date(year, month+1, 0).getDate();
  const end = `${year}-${pad(month+1)}-${pad(lastDay)}`;
  return { start, end };
}

function keyInRange(key, start, end) {
  return key >= start && key <= end;
}

// ── Sunflower SVG decoration ──────────────────────────────────────────────────
function Sunflower({ size = 40, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
      {/* petals */}
      {Array.from({length:8}).map((_,i) => {
        const angle = (i * 45) * Math.PI / 180;
        const cx = 20 + Math.cos(angle) * 10;
        const cy = 20 + Math.sin(angle) * 10;
        return <ellipse key={i} cx={cx} cy={cy} rx={5} ry={3}
          transform={`rotate(${i*45} ${cx} ${cy})`}
          fill="#F9C22E" opacity="0.9"/>;
      })}
      {/* center */}
      <circle cx="20" cy="20" r="8" fill="#92400E"/>
      <circle cx="20" cy="20" r="5" fill="#78350F" opacity="0.6"/>
      {/* seeds dots */}
      {[[-1.5,-1.5],[1.5,-1.5],[0,1.5],[-1.5,1.5],[1.5,1.5]].map(([dx,dy],i)=>
        <circle key={i} cx={20+dx} cy={20+dy} r={0.8} fill="#FCD34D" opacity="0.8"/>
      )}
    </svg>
  );
}

function SunflowerBg() {
  // Decorative corner sunflowers for the dashboard
  const positions = [
    {x:-10,y:-10,size:60,opacity:0.12,rot:0},
    {x:"calc(100% - 30px)",y:-15,size:50,opacity:0.1,rot:30},
    {x:-5,y:"calc(100% - 40px)",size:45,opacity:0.08,rot:-15},
  ];
  return (
    <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",borderRadius:18}}>
      {positions.map((p,i)=>(
        <div key={i} style={{position:"absolute",left:p.x,top:p.y,opacity:p.opacity,transform:`rotate(${p.rot}deg)`}}>
          <Sunflower size={p.size}/>
        </div>
      ))}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const inputSt    = {width:"100%",padding:"10px 14px",borderRadius:12,border:"1.5px solid #E8E0FF",fontSize:14,color:"#666",background:"#FAFAFF",outline:"none",marginBottom:10,boxSizing:"border-box",fontFamily:"Georgia,serif"};
const btnP       = {flex:1,padding:"11px 0",borderRadius:14,border:"none",background:"linear-gradient(135deg,#FF8FAB,#B39DDB)",color:"#fff",fontWeight:"bold",fontSize:14,cursor:"pointer",boxShadow:"0 4px 14px #B39DDB40"};
const btnS       = {flex:1,padding:"11px 0",borderRadius:14,border:"1.5px solid #E8E0FF",background:"#fff",color:"#bbb",fontWeight:"bold",fontSize:14,cursor:"pointer"};
const btnDanger  = {flex:1,padding:"11px 0",borderRadius:14,border:"1.5px solid #FFB3C6",background:"#fff",color:"#FF8FAB",fontWeight:"bold",fontSize:14,cursor:"pointer"};
const labelSt    = {margin:"0 0 8px",fontSize:11,color:"#bbb",fontWeight:"bold",textTransform:"uppercase",letterSpacing:0.8};
const sheetTitle = {margin:"0 0 16px",fontSize:18,color:"#B39DDB",fontWeight:"bold"};
const navBtnSt   = {width:36,height:36,borderRadius:"50%",border:"none",cursor:"pointer",background:"#fff",boxShadow:"0 2px 8px #0001",fontSize:22,color:"#B39DDB",display:"flex",alignItems:"center",justifyContent:"center"};

function SheetHandle() {
  return <div style={{width:36,height:4,borderRadius:2,background:"#E0E0E0",margin:"0 auto 18px"}}/>;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LeilitaApp() {
  const now = new Date();
  const [tab,     setTab]     = useState("cal");
  const [calView, setCalView] = useState("month");
  const [cats,    setCats]    = useState(DEFAULT_CATS);
  const [tasks,   setTasks]   = useState([]);
  const [moods,   setMoods]   = useState([]);

  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selDate,   setSelDate]   = useState(todayKey);

  // Dashboard filter state
  const [dashPeriod, setDashPeriod] = useState("week");   // "week" | "month"
  const [dashWeekOff, setDashWeekOff] = useState(0);      // 0=current, -1=last…
  const [dashYear,  setDashYear]  = useState(now.getFullYear());
  const [dashMonth, setDashMonth] = useState(now.getMonth());

  const [modal,      setModal]      = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [editNote,   setEditNote]   = useState({id:null, text:""});

  const [tf, setTf] = useState({title:"", catId:"facultad", date:todayKey, note:""});
  const [mf, setMf] = useState({date:todayKey, val:null, rating:0, note:""});
  const [cf, setCf] = useState({name:"", color:P.sky});

  const tasksByDate = tasks.reduce((a,t) => { (a[t.date]=a[t.date]||[]).push(t); return a; }, {});
  const moodByDate  = moods.reduce((a,m) => { a[m.date]=m; return a; }, {});
  const dayTasks    = tasksByDate[selDate] || [];
  const dayMood     = moodByDate[selDate];

  const prevMonth = () => { const {y,m} = stepMonth(viewYear, viewMonth, -1); setViewYear(y); setViewMonth(m); };
  const nextMonth = () => { const {y,m} = stepMonth(viewYear, viewMonth,  1); setViewYear(y); setViewMonth(m); };

  // ── Dashboard range computation ───────────────────────────────────────────
  const weekRange  = getWeekRange(dashWeekOff);
  const monthRange = getMonthRange(dashYear, dashMonth);
  const range      = dashPeriod === "week" ? weekRange : monthRange;

  const filteredTasks = tasks.filter(t => keyInRange(t.date, range.start, range.end));
  const filteredMoods = moods.filter(m => keyInRange(m.date, range.start, range.end));

  const totalTasks   = filteredTasks.length;
  const doneTasks    = filteredTasks.filter(t=>t.done).length;
  const pendingTasks = totalTasks - doneTasks;
  const avgRating    = filteredMoods.length
    ? (filteredMoods.reduce((s,m)=>s+m.rating,0)/filteredMoods.length).toFixed(1) : "—";
  const avgMoodVal   = filteredMoods.length
    ? Math.round(filteredMoods.reduce((s,m)=>s+m.val,0)/filteredMoods.length) : null;
  const moodCounts   = MOODS.map(m => ({...m, count: filteredMoods.filter(e=>e.val===m.val).length}));
  const maxMoodCount = Math.max(1, ...moodCounts.map(m=>m.count));
  const catStats     = cats.map(c => ({
    ...c,
    total: filteredTasks.filter(t=>t.catId===c.id).length,
    done:  filteredTasks.filter(t=>t.catId===c.id && t.done).length,
  })).filter(c=>c.total>0);

  // Days strip for the period
  const periodDays = (() => {
    const days = [];
    const cur = new Date(range.start + "T12:00:00");
    const end = new Date(range.end   + "T12:00:00");
    while (cur <= end) {
      const key = toKey(cur);
      days.push({key, label: DAYS_ES[cur.getDay()], date: cur.getDate(), mood: moodByDate[key]});
      cur.setDate(cur.getDate()+1);
    }
    return days;
  })();

  // Dash period label
  const dashLabel = dashPeriod === "week"
    ? (() => {
        const {monday, sunday} = weekRange;
        const sameMonth = monday.getMonth()===sunday.getMonth();
        if (sameMonth) return `${monday.getDate()}–${sunday.getDate()} ${MONTHS_ES[monday.getMonth()]}`;
        return `${monday.getDate()} ${MONTHS_ES[monday.getMonth()].slice(0,3)} – ${sunday.getDate()} ${MONTHS_ES[sunday.getMonth()].slice(0,3)}`;
      })()
    : `${MONTHS_ES[dashMonth]} ${dashYear}`;

  // ── Actions ───────────────────────────────────────────────────────────────
  const addTask = () => {
    if (!tf.title.trim()) return;
    const cat = cats.find(c => c.id===tf.catId);
    setTasks([...tasks, {id:uid(), ...tf, catName:cat.name, catEmoji:cat.emoji, catColor:cat.color, catBg:cat.bg, done:false}]);
    setTf({title:"", catId:"facultad", date:selDate, note:""});
    setModal(null);
  };

  const toggleTask = id => setTasks(tasks.map(t => t.id===id ? {...t, done:!t.done} : t));
  const deleteTask = id => { setTasks(tasks.filter(t => t.id!==id)); setModal(null); };

  const saveNote = () => {
    setTasks(tasks.map(t => t.id===editNote.id ? {...t, note:editNote.text} : t));
    setEditNote({id:null, text:""});
  };

  const saveMood = () => {
    if (!mf.val || !mf.rating) return;
    const entry = {id:uid(), ...mf};
    setMoods(prev => {
      const ex = prev.find(m => m.date===mf.date);
      return ex ? prev.map(m => m.date===mf.date ? {...entry, id:m.id} : m) : [...prev, entry];
    });
    setMf({date:todayKey, val:null, rating:0, note:""});
    setModal(null);
  };

  const deleteMood = (date) => {
    setMoods(prev => prev.filter(m => m.date!==date));
    setModal(null);
  };

  const addCat = () => {
    if (!cf.name.trim()) return;
    const id = cf.name.toLowerCase().replace(/\s+/g,"-") + "-" + uid();
    setCats([...cats, {id, name:cf.name, emoji:"✨", color:cf.color, bg:cf.color+"44"}]);
    setCf({name:"", color:P.sky}); setModal(null);
  };

  const selectDay = key => {
    setSelDate(key);
    const [y,m] = key.split("-").map(Number);
    setViewYear(y); setViewMonth(m-1);
    setCalView("day");
  };

  const openMoodEdit = (date) => {
    const ex = moodByDate[date];
    setMf({date, val:ex?.val||null, rating:ex?.rating||0, note:ex?.note||""});
    setModal("mood");
  };

  const cells = buildMonthCells(viewYear, viewMonth);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh", background:"linear-gradient(145deg,#FFF0F5 0%,#F3EEFF 50%,#E8F4FF 100%)", fontFamily:"Georgia,serif", paddingBottom:90}}>

      {/* ── HEADER ── */}
      <div style={{background:"linear-gradient(90deg,#FF8FAB,#B39DDB,#64B5F6)", padding:"16px 18px 14px", position:"sticky", top:0, zIndex:200, boxShadow:"0 4px 20px #B39DDB30"}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12}}>
          <div>
            <h1 style={{margin:0, fontSize:26, color:"#fff", fontWeight:"bold", letterSpacing:-0.5}}>🌸 leilitaapp</h1>
            <p style={{margin:0, fontSize:11, color:"#fff9"}}>hecha con amor 💕</p>
          </div>
          {moodByDate[todayKey] && (
            <div style={{background:"#fff4", borderRadius:14, padding:"6px 12px", display:"flex", alignItems:"center", gap:6}}>
              <span style={{fontSize:22}}>{MOODS.find(m=>m.val===moodByDate[todayKey].val)?.emoji}</span>
              <span style={{color:"#fff", fontSize:11, fontStyle:"italic"}}>hoy</span>
            </div>
          )}
        </div>
        <div style={{display:"flex", gap:6}}>
          {[{id:"cal",label:"📅 Cal"},{id:"diary",label:"🌙 Día"},{id:"dash",label:"🌻 Estadísticas"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:1, padding:"8px 0", borderRadius:16, border:"none", cursor:"pointer",
              fontSize:11, fontWeight:"bold",
              background:tab===t.id?"#fff":"#ffffff30",
              color:tab===t.id?"#B39DDB":"#fff",
              boxShadow:tab===t.id?"0 2px 10px #00000015":"none",
              transition:"all 0.2s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ══ CALENDAR TAB ══ */}
      {tab==="cal" && (
        <div>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px 8px"}}>
            {calView==="day"
              ? <button onClick={()=>setCalView("month")} style={{background:"#EDE7F6",border:"none",cursor:"pointer",fontSize:13,color:"#B39DDB",fontWeight:"bold",padding:"7px 14px",borderRadius:12}}>← Mes</button>
              : <button onClick={prevMonth} style={navBtnSt}>‹</button>}
            <p style={{margin:0, fontSize:16, fontWeight:"bold", color:"#7E5BAF"}}>
              {calView==="day" ? fmtDay(selDate) : `${MONTHS_ES[viewMonth]} ${viewYear}`}
            </p>
            {calView==="day"
              ? <button onClick={()=>openMoodEdit(selDate)} style={{background:"#EDE7F6",border:"none",cursor:"pointer",fontSize:13,color:"#B39DDB",fontWeight:"bold",padding:"7px 14px",borderRadius:12}}>{dayMood?"✏️ Mood":"🌙 Mood"}</button>
              : <button onClick={nextMonth} style={navBtnSt}>›</button>}
          </div>

          {/* MONTH GRID */}
          {calView==="month" && (
            <div style={{padding:"0 10px"}}>
              <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:4}}>
                {DAYS_ES.map(d=><div key={d} style={{textAlign:"center",fontSize:11,color:"#C4AADE",fontWeight:"bold",padding:"2px 0"}}>{d}</div>)}
              </div>
              <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3}}>
                {cells.map((d,i) => {
                  if (!d) return <div key={`e${i}`} style={{height:72}}/>;
                  const key = `${viewYear}-${pad(viewMonth+1)}-${pad(d)}`;
                  const dtl = tasksByDate[key]||[];
                  const dm  = moodByDate[key];
                  const isToday = key===todayKey;
                  return (
                    <div key={key} onClick={()=>selectDay(key)} style={{
                      borderRadius:10, cursor:"pointer", height:72, overflow:"hidden",
                      background:isToday?"#FFF5F8":"#fff",
                      border:isToday?"2px solid #FF8FAB":"2px solid #F0EBF8",
                      boxShadow:"0 2px 8px #0001", transition:"all 0.15s",
                      display:"flex", flexDirection:"column",
                      padding:"4px 3px 3px", boxSizing:"border-box",
                    }}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,marginBottom:2}}>
                        <span style={{fontSize:12,fontWeight:isToday?"bold":"normal",color:isToday?"#FF8FAB":"#888",lineHeight:1}}>{d}</span>
                        {dm&&<span style={{fontSize:11,lineHeight:1}}>{MOODS.find(m=>m.val===dm.val)?.emoji}</span>}
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:2,overflow:"hidden",flex:1}}>
                        {dtl.slice(0,2).map(t=>(
                          <div key={t.id} style={{background:t.done?"#EBEBEB":t.catColor,borderRadius:3,padding:"0 3px",fontSize:8,color:t.done?"#bbb":"#fff",fontWeight:"bold",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textDecoration:t.done?"line-through":"none",lineHeight:"14px",flexShrink:0}}>
                            {t.catEmoji} {t.title}
                          </div>
                        ))}
                        {dtl.length>2&&<span style={{fontSize:8,color:"#bbb",lineHeight:"12px",flexShrink:0}}>+{dtl.length-2} más</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,padding:"12px 2px 0"}}>
                {cats.map(c=>(
                  <div key={c.id} style={{display:"flex",alignItems:"center",gap:5,background:"#fff",borderRadius:10,padding:"4px 10px",boxShadow:"0 1px 6px #0001"}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:c.color}}/>
                    <span style={{fontSize:11,color:"#aaa"}}>{c.emoji} {c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DAY VIEW */}
          {calView==="day" && (
            <div style={{padding:"4px 14px 0"}}>
              {dayMood ? (
                <div style={{background:"#fff",borderRadius:16,padding:"12px 16px",marginBottom:12,boxShadow:"0 3px 14px #0001",border:`2px solid ${MOODS.find(m=>m.val===dayMood.val)?.color}40`}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontSize:34}}>{MOODS.find(m=>m.val===dayMood.val)?.emoji}</span>
                    <div style={{flex:1}}>
                      <p style={{margin:0,fontWeight:"bold",color:"#888",fontSize:14}}>{MOODS.find(m=>m.val===dayMood.val)?.label}</p>
                      {dayMood.note&&<p style={{margin:"3px 0 0",fontSize:12,color:"#bbb",fontStyle:"italic"}}>"{dayMood.note}"</p>}
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:13}}>{"⭐".repeat(dayMood.rating)}{"✩".repeat(5-dayMood.rating)}</div>
                      <p style={{margin:0,fontSize:11,color:"#bbb"}}>{dayMood.rating}/5</p>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:10}}>
                    <button onClick={()=>openMoodEdit(selDate)} style={{flex:1,padding:"6px 0",borderRadius:10,border:"1.5px solid #E8E0FF",background:"#fff",color:"#B39DDB",fontSize:12,cursor:"pointer",fontWeight:"bold"}}>✏️ Editar</button>
                    <button onClick={()=>deleteMood(selDate)} style={{flex:1,padding:"6px 0",borderRadius:10,border:"1.5px solid #FFD6E4",background:"#fff",color:"#FF8FAB",fontSize:12,cursor:"pointer",fontWeight:"bold"}}>🗑 Eliminar</button>
                  </div>
                </div>
              ) : (
                <button onClick={()=>openMoodEdit(selDate)} style={{width:"100%",padding:"12px",borderRadius:16,border:"2px dashed #E8E0FF",background:"transparent",color:"#C9B8FF",cursor:"pointer",fontSize:13,marginBottom:12,fontFamily:"Georgia,serif"}}>
                  🌙 ¿Cómo te sentiste este día?
                </button>
              )}
              {dayTasks.length===0
                ? <div style={{textAlign:"center",padding:"36px 0",color:"#ddd"}}><div style={{fontSize:44,marginBottom:8}}>📭</div><p style={{fontSize:14}}>Sin tareas este día</p></div>
                : dayTasks.map(t=>(
                  <div key={t.id} onClick={()=>{setDetailTask(t);setModal("detail");}} style={{display:"flex",alignItems:"center",gap:12,background:"#fff",borderRadius:14,padding:"12px 14px",marginBottom:8,boxShadow:"0 2px 10px #0001",cursor:"pointer",borderLeft:`4px solid ${t.done?"#ddd":t.catColor}`,opacity:t.done?0.65:1,transition:"all 0.15s"}}>
                    <button onClick={e=>{e.stopPropagation();toggleTask(t.id);}} style={{width:24,height:24,borderRadius:"50%",border:`2.5px solid ${t.catColor}`,background:t.done?t.catColor:"transparent",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>
                      {t.done&&<span style={{color:"#fff"}}>✓</span>}
                    </button>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{margin:0,fontWeight:"bold",fontSize:14,color:t.done?"#ccc":"#555",textDecoration:t.done?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</p>
                      <span style={{background:t.catBg,color:t.catColor,borderRadius:8,padding:"2px 8px",fontSize:11,fontWeight:"bold"}}>{t.catEmoji} {t.catName}</span>
                    </div>
                    {t.note&&<span style={{fontSize:15}}>📝</span>}
                    <span style={{color:"#ddd",fontSize:16}}>›</span>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      )}

      {/* ══ DIARY TAB ══ */}
      {tab==="diary" && (
        <div style={{padding:"14px 14px 0"}}>
          <button onClick={()=>openMoodEdit(todayKey)} style={{...btnP,width:"100%",marginBottom:14,fontSize:14,padding:"13px 0"}}>
            {moodByDate[todayKey]?"✏️ Editar cómo me siento hoy":"🌙 ¿Cómo fue tu día hoy?"}
          </button>
          {moods.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:"#ddd"}}><div style={{fontSize:48,marginBottom:8}}>🌙</div><p>Todavía no registraste ningún día</p></div>}
          {[...moods].sort((a,b)=>b.date.localeCompare(a.date)).map(entry=>{
            const mood=MOODS.find(m=>m.val===entry.val);
            const dtl=tasksByDate[entry.date]||[];
            return(
              <div key={entry.id} style={{background:"#fff",borderRadius:18,padding:"14px 16px",marginBottom:10,boxShadow:"0 3px 14px #0001",border:`2px solid ${mood?.color}40`}}>
                <div style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={()=>{selectDay(entry.date);setTab("cal");}}>
                  <span style={{fontSize:34}}>{mood?.emoji}</span>
                  <div style={{flex:1}}>
                    <p style={{margin:0,fontSize:12,color:"#bbb"}}>{fmtDay(entry.date)}</p>
                    <p style={{margin:"2px 0 0",fontWeight:"bold",color:"#888",fontSize:14}}>{mood?.label}</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13}}>{"⭐".repeat(entry.rating)}</div>
                    <p style={{margin:0,fontSize:11,color:"#bbb"}}>{entry.rating}/5</p>
                  </div>
                </div>
                {entry.note&&<div style={{marginTop:8,background:"#FAFAFA",borderRadius:10,padding:"8px 12px",fontSize:12,color:"#aaa",fontStyle:"italic",borderLeft:`3px solid ${mood?.color}`}}>"{entry.note}"</div>}
                {dtl.length>0&&<div style={{marginTop:8,display:"flex",gap:5,flexWrap:"wrap"}}>{dtl.map(t=><span key={t.id} style={{background:t.catBg,color:t.catColor,borderRadius:8,padding:"2px 8px",fontSize:11,textDecoration:t.done?"line-through":"none"}}>{t.catEmoji} {t.title.length>15?t.title.slice(0,15)+"…":t.title}</span>)}</div>}
                <div style={{display:"flex",gap:8,marginTop:10}}>
                  <button onClick={()=>openMoodEdit(entry.date)} style={{flex:1,padding:"5px 0",borderRadius:10,border:"1.5px solid #E8E0FF",background:"#fff",color:"#B39DDB",fontSize:12,cursor:"pointer",fontWeight:"bold"}}>✏️ Editar</button>
                  <button onClick={()=>deleteMood(entry.date)} style={{flex:1,padding:"5px 0",borderRadius:10,border:"1.5px solid #FFD6E4",background:"#fff",color:"#FF8FAB",fontSize:12,cursor:"pointer",fontWeight:"bold"}}>🗑 Eliminar</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ DASHBOARD / ESTADÍSTICAS TAB ══ */}
      {tab==="dash" && (
        <div style={{padding:"14px 14px 0"}}>

          {/* ── Sunflower header banner ── */}
          <div style={{
            background:"linear-gradient(135deg,#FEF3C7,#FCD34D,#F9C22E)",
            borderRadius:20, padding:"18px 20px 14px",
            marginBottom:16, position:"relative", overflow:"hidden",
            boxShadow:"0 4px 20px #F9C22E40",
          }}>
            <SunflowerBg/>
            <div style={{position:"relative",zIndex:1,display:"flex",alignItems:"center",gap:12}}>
              <Sunflower size={48}/>
              <div>
                <h2 style={{margin:0,fontSize:20,fontWeight:"bold",color:"#92400E",lineHeight:1}}>Estadísticas</h2>
                <p style={{margin:"3px 0 0",fontSize:12,color:"#B45309"}}>Tu resumen personal 🌻</p>
              </div>
            </div>

            {/* Period toggle */}
            <div style={{display:"flex",gap:6,marginTop:14,position:"relative",zIndex:1}}>
              {[{id:"week",label:"Semana"},{id:"month",label:"Mes"}].map(p=>(
                <button key={p.id} onClick={()=>setDashPeriod(p.id)} style={{
                  flex:1, padding:"7px 0", borderRadius:12, border:"none", cursor:"pointer",
                  fontSize:13, fontWeight:"bold",
                  background:dashPeriod===p.id?"#92400E":"#fff8",
                  color:dashPeriod===p.id?"#FEF3C7":"#92400E",
                  transition:"all 0.2s",
                }}>{p.label}</button>
              ))}
            </div>
          </div>

          {/* ── Period navigator ── */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#fff",borderRadius:14,padding:"10px 14px",marginBottom:14,boxShadow:"0 2px 10px #0001"}}>
            <button onClick={()=> dashPeriod==="week" ? setDashWeekOff(o=>o-1) : (() => { const {y,m}=stepMonth(dashYear,dashMonth,-1); setDashYear(y); setDashMonth(m); })()} style={{background:"#FEF3C7",border:"none",cursor:"pointer",width:32,height:32,borderRadius:"50%",fontSize:18,color:"#D97706",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
            <div style={{textAlign:"center"}}>
              <p style={{margin:0,fontSize:14,fontWeight:"bold",color:"#92400E"}}>{dashLabel}</p>
              {dashPeriod==="week" && dashWeekOff===0 && <p style={{margin:0,fontSize:10,color:"#D97706"}}>semana actual</p>}
              {dashPeriod==="month" && dashMonth===now.getMonth() && dashYear===now.getFullYear() && <p style={{margin:0,fontSize:10,color:"#D97706"}}>mes actual</p>}
            </div>
            <button onClick={()=> dashPeriod==="week" ? setDashWeekOff(o=>o+1) : (() => { const {y,m}=stepMonth(dashYear,dashMonth,1); setDashYear(y); setDashMonth(m); })()} style={{background:"#FEF3C7",border:"none",cursor:"pointer",width:32,height:32,borderRadius:"50%",fontSize:18,color:"#D97706",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
          </div>

          {/* ── Summary cards ── */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {[
              {label:"Tareas totales",  value:totalTasks,   emoji:"📋", color:"#D97706", bg:"#FEF3C7", border:"#FCD34D"},
              {label:"Completadas",     value:doneTasks,    emoji:"✅", color:P.leaf,   bg:P.leafL,   border:P.mint   },
              {label:"Pendientes",      value:pendingTasks, emoji:"⏳", color:P.peach,  bg:P.peachL,  border:P.peach  },
              {label:"Días con mood",   value:filteredMoods.length, emoji:"🌻", color:"#92400E", bg:"#FEF9EE", border:"#FCD34D"},
            ].map(s=>(
              <div key={s.label} style={{background:s.bg,borderRadius:16,padding:"14px 12px",border:`1.5px solid ${s.border}40`,position:"relative",overflow:"hidden"}}>
                <div style={{fontSize:22,marginBottom:4}}>{s.emoji}</div>
                <div style={{fontSize:28,fontWeight:"bold",color:s.color,lineHeight:1}}>{s.value}</div>
                <div style={{fontSize:11,color:s.color,opacity:0.75,marginTop:3}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Progress bar ── */}
          {totalTasks>0 && (
            <div style={{background:"#fff",borderRadius:16,padding:"16px",marginBottom:12,boxShadow:"0 2px 10px #0001",border:"1.5px solid #FEF3C7"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:"bold",color:"#92400E"}}>🌻 Progreso del período</span>
                <span style={{fontSize:14,color:P.leaf,fontWeight:"bold"}}>{Math.round(doneTasks/totalTasks*100)}%</span>
              </div>
              <div style={{height:12,background:"#FEF3C7",borderRadius:8,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${doneTasks/totalTasks*100}%`,background:`linear-gradient(90deg,#F9C22E,${P.leaf})`,borderRadius:8,transition:"width 0.5s"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
                <span style={{fontSize:10,color:"#bbb"}}>{doneTasks} hechas</span>
                <span style={{fontSize:10,color:"#bbb"}}>{pendingTasks} pendientes</span>
              </div>
            </div>
          )}

          {/* ── Avg mood ── */}
          {filteredMoods.length>0 && (
            <div style={{background:"linear-gradient(135deg,#FFFBEB,#FEF3C7)",borderRadius:16,padding:"16px",marginBottom:12,boxShadow:"0 2px 10px #0001",border:"1.5px solid #FCD34D",display:"flex",alignItems:"center",gap:14}}>
              <div style={{fontSize:42}}>{MOODS.find(m=>m.val===avgMoodVal)?.emoji||"😐"}</div>
              <div style={{flex:1}}>
                <p style={{margin:0,fontSize:11,color:"#B45309",fontWeight:"bold",textTransform:"uppercase",letterSpacing:0.8}}>Ánimo promedio</p>
                <p style={{margin:"4px 0 0",fontSize:22,fontWeight:"bold",color:"#92400E"}}>{avgRating} ⭐</p>
                <p style={{margin:"2px 0 0",fontSize:12,color:"#D97706"}}>{MOODS.find(m=>m.val===avgMoodVal)?.label||""}</p>
              </div>
              <Sunflower size={36} style={{opacity:0.6}}/>
            </div>
          )}

          {/* ── Days strip ── */}
          {filteredMoods.length>0 && (
            <div style={{background:"#fff",borderRadius:16,padding:"16px",marginBottom:12,boxShadow:"0 2px 10px #0001",border:"1.5px solid #FEF3C7"}}>
              <p style={{margin:"0 0 12px",fontSize:13,fontWeight:"bold",color:"#92400E"}}>🌻 Días del período</p>
              <div style={{overflowX:"auto"}}>
                <div style={{display:"flex",gap:6,minWidth:"max-content"}}>
                  {periodDays.map(day=>{
                    const mood=day.mood?MOODS.find(m=>m.val===day.mood.val):null;
                    const isToday=day.key===todayKey;
                    return(
                      <div key={day.key} onClick={()=>{selectDay(day.key);setTab("cal");}} style={{textAlign:"center",cursor:"pointer",minWidth:36}}>
                        <div style={{fontSize:18,marginBottom:2}}>{mood?.emoji||"·"}</div>
                        <div style={{
                          width:28, height:Math.max(6, (day.mood?.rating||0)*5),
                          background:mood?.color||"#F0F0F0",
                          borderRadius:4, margin:"0 auto 4px",
                          minHeight:6,
                        }}/>
                        <div style={{fontSize:9,color:isToday?"#D97706":"#bbb",fontWeight:isToday?"bold":"normal"}}>{day.label}</div>
                        <div style={{fontSize:9,color:"#ddd"}}>{day.date}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Mood frequency ── */}
          {filteredMoods.length>0 && (
            <div style={{background:"#fff",borderRadius:16,padding:"16px",marginBottom:12,boxShadow:"0 2px 10px #0001",border:"1.5px solid #FEF3C7"}}>
              <p style={{margin:"0 0 12px",fontSize:13,fontWeight:"bold",color:"#92400E"}}>😊 Frecuencia de estados</p>
              {moodCounts.map(m=>(
                <div key={m.val} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <span style={{fontSize:18,width:24,textAlign:"center"}}>{m.emoji}</span>
                  <div style={{flex:1,height:10,background:"#FEF9EE",borderRadius:8,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${m.count/maxMoodCount*100}%`,background:m.color,borderRadius:8,transition:"width 0.4s"}}/>
                  </div>
                  <span style={{fontSize:12,color:"#bbb",width:16,textAlign:"right"}}>{m.count}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Tasks by category ── */}
          {catStats.length>0 && (
            <div style={{background:"#fff",borderRadius:16,padding:"16px",marginBottom:12,boxShadow:"0 2px 10px #0001",border:"1.5px solid #FEF3C7"}}>
              <p style={{margin:"0 0 12px",fontSize:13,fontWeight:"bold",color:"#92400E"}}>📂 Por categoría</p>
              {catStats.map(c=>(
                <div key={c.id} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:13,color:"#777"}}>{c.emoji} {c.name}</span>
                    <span style={{fontSize:12,color:c.color,fontWeight:"bold"}}>{c.done}/{c.total}</span>
                  </div>
                  <div style={{height:8,background:"#FEF9EE",borderRadius:8,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${c.total?c.done/c.total*100:0}%`,background:c.color,borderRadius:8}}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {totalTasks===0 && filteredMoods.length===0 && (
            <div style={{textAlign:"center",padding:"40px 20px",color:"#D97706"}}>
              <Sunflower size={64} style={{margin:"0 auto 12px",display:"block"}}/>
              <p style={{fontSize:15,color:"#92400E",fontWeight:"bold"}}>¡Sin datos para este período!</p>
              <p style={{fontSize:13,color:"#D97706",margin:0}}>Agregá tareas o registrá tu mood 🌻</p>
            </div>
          )}
        </div>
      )}

      {/* ── FABs ── */}
      {tab==="cal" && (
        <div style={{position:"fixed",bottom:24,right:18,display:"flex",flexDirection:"column",gap:10,zIndex:300}}>
          <button onClick={()=>{setCf({name:"",color:P.sky});setModal("cat");}} style={{width:44,height:44,borderRadius:"50%",border:"none",cursor:"pointer",fontSize:16,background:"#fff",boxShadow:"0 4px 16px #B39DDB40",color:"#B39DDB"}}>+📂</button>
          <button onClick={()=>{setTf({title:"",catId:"facultad",date:selDate,note:""});setModal("task");}} style={{width:56,height:56,borderRadius:"50%",border:"none",cursor:"pointer",fontSize:26,background:"linear-gradient(135deg,#FF8FAB,#B39DDB)",boxShadow:"0 6px 22px #B39DDB60",color:"#fff"}}>+</button>
        </div>
      )}

      {/* ══ MODALS ══ */}
      {modal && (
        <div onClick={()=>{setModal(null);setEditNote({id:null,text:""}); }} style={{position:"fixed",inset:0,background:"#00000035",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"24px 24px 0 0",padding:"20px 20px 36px",width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 -8px 40px #B39DDB25"}}>

            {modal==="task" && (
              <>
                <SheetHandle/>
                <h3 style={sheetTitle}>✨ Nueva tarea</h3>
                <input value={tf.title} onChange={e=>setTf({...tf,title:e.target.value})} placeholder="¿Qué tenés que hacer?" style={inputSt}/>
                <p style={labelSt}>Categoría</p>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                  {cats.map(c=><button key={c.id} onClick={()=>setTf({...tf,catId:c.id})} style={{padding:"6px 14px",borderRadius:12,border:"none",cursor:"pointer",background:tf.catId===c.id?c.color:c.bg,color:tf.catId===c.id?"#fff":c.color,fontSize:13,fontWeight:"bold",transition:"all 0.15s"}}>{c.emoji} {c.name}</button>)}
                </div>
                <p style={labelSt}>Fecha</p>
                <input type="date" value={tf.date} onChange={e=>setTf({...tf,date:e.target.value})} style={inputSt}/>
                <textarea value={tf.note} onChange={e=>setTf({...tf,note:e.target.value})} placeholder="Notas opcionales 📝" rows={2} style={{...inputSt,resize:"none"}}/>
                <div style={{display:"flex",gap:8,marginTop:4}}>
                  <button onClick={addTask} style={btnP}>Agregar 🌸</button>
                  <button onClick={()=>setModal(null)} style={btnS}>Cancelar</button>
                </div>
              </>
            )}

            {modal==="mood" && (
              <>
                <SheetHandle/>
                <h3 style={sheetTitle}>{moodByDate[mf.date]?"✏️ Editar mood":"🌙 ¿Cómo estás?"}</h3>
                <input type="date" value={mf.date} onChange={e=>setMf({...mf,date:e.target.value})} style={inputSt}/>
                <p style={labelSt}>¿Cómo te sentiste?</p>
                <div style={{display:"flex",justifyContent:"space-around",marginBottom:18}}>
                  {MOODS.map(m=>(
                    <button key={m.val} onClick={()=>setMf({...mf,val:m.val})} style={{background:mf.val===m.val?m.color+"33":"transparent",border:mf.val===m.val?`2px solid ${m.color}`:"2px solid transparent",borderRadius:14,padding:"8px 5px",cursor:"pointer",textAlign:"center",transition:"all 0.15s"}}>
                      <div style={{fontSize:28}}>{m.emoji}</div>
                      <div style={{fontSize:10,color:"#aaa",marginTop:3}}>{m.label}</div>
                    </button>
                  ))}
                </div>
                <p style={labelSt}>Puntaje del día ⭐</p>
                <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:16}}>
                  {[1,2,3,4,5].map(n=>(
                    <button key={n} onClick={()=>setMf({...mf,rating:n})} style={{fontSize:26,background:"none",border:"none",cursor:"pointer",filter:mf.rating>=n?"none":"grayscale(1) opacity(0.3)",transform:mf.rating>=n?"scale(1.12)":"scale(1)",transition:"all 0.15s"}}>⭐</button>
                  ))}
                </div>
                <textarea value={mf.note} onChange={e=>setMf({...mf,note:e.target.value})} placeholder="¿Qué pasó hoy? Anotaciones libres 📖" rows={3} style={{...inputSt,resize:"none"}}/>
                <div style={{display:"flex",gap:8,marginTop:4}}>
                  <button onClick={saveMood} disabled={!mf.val||!mf.rating} style={{...btnP,opacity:(!mf.val||!mf.rating)?0.5:1}}>Guardar 💕</button>
                  {moodByDate[mf.date]&&<button onClick={()=>deleteMood(mf.date)} style={btnDanger}>🗑 Eliminar</button>}
                  <button onClick={()=>setModal(null)} style={btnS}>Cancelar</button>
                </div>
              </>
            )}

            {modal==="cat" && (
              <>
                <SheetHandle/>
                <h3 style={sheetTitle}>🎨 Nueva categoría</h3>
                <input value={cf.name} onChange={e=>setCf({...cf,name:e.target.value})} placeholder="Nombre de la categoría" style={inputSt}/>
                <p style={labelSt}>Color</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:16}}>
                  {Object.values(P).filter((_,i)=>i%2===0).map((c,i)=>(
                    <div key={i} onClick={()=>setCf({...cf,color:c})} style={{width:34,height:34,borderRadius:"50%",background:c,cursor:"pointer",border:cf.color===c?"3px solid #B39DDB":"3px solid transparent",boxShadow:"0 2px 8px #0002",transition:"all 0.15s"}}/>
                  ))}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={addCat} style={btnP}>Crear ✨</button>
                  <button onClick={()=>setModal(null)} style={btnS}>Cancelar</button>
                </div>
              </>
            )}

            {modal==="detail" && detailTask && (()=>{
              const t=tasks.find(x=>x.id===detailTask.id)||detailTask;
              return(
                <>
                  <SheetHandle/>
                  <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:14}}>
                    <button onClick={()=>toggleTask(t.id)} style={{width:28,height:28,borderRadius:"50%",border:`2.5px solid ${t.catColor}`,background:t.done?t.catColor:"transparent",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
                      {t.done&&<span style={{color:"#fff"}}>✓</span>}
                    </button>
                    <h3 style={{margin:0,fontSize:18,color:t.done?"#ccc":"#555",textDecoration:t.done?"line-through":"none",flex:1,lineHeight:1.3}}>{t.title}</h3>
                  </div>
                  <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                    <span style={{background:t.catBg,color:t.catColor,borderRadius:10,padding:"4px 12px",fontSize:12,fontWeight:"bold"}}>{t.catEmoji} {t.catName}</span>
                    <span style={{background:"#F5F5F5",color:"#aaa",borderRadius:10,padding:"4px 12px",fontSize:12}}>📅 {fmtDay(t.date)}</span>
                  </div>
                  <p style={labelSt}>Notas 📝</p>
                  {editNote.id===t.id?(
                    <>
                      <textarea value={editNote.text} onChange={e=>setEditNote({...editNote,text:e.target.value})} rows={3} style={{...inputSt,resize:"none"}}/>
                      <div style={{display:"flex",gap:8,marginBottom:12}}>
                        <button onClick={saveNote} style={{...btnP,fontSize:13,padding:"9px 0"}}>Guardar</button>
                        <button onClick={()=>setEditNote({id:null,text:""})} style={{...btnS,fontSize:13,padding:"9px 0"}}>Cancelar</button>
                      </div>
                    </>
                  ):(
                    <div onClick={()=>setEditNote({id:t.id,text:t.note||""})} style={{background:"#FAFAFA",borderRadius:12,padding:"12px 14px",marginBottom:14,fontSize:13,color:t.note?"#777":"#ccc",cursor:"pointer",borderLeft:`3px solid ${t.catColor}`,fontStyle:t.note?"italic":"normal"}}>
                      {t.note||"Tocá para agregar una nota..."}
                    </div>
                  )}
                  <button onClick={()=>deleteTask(t.id)} style={{background:"none",border:"none",color:"#FFB3C6",cursor:"pointer",fontSize:13,padding:0}}>🗑 Eliminar tarea</button>
                </>
              );
            })()}

          </div>
        </div>
      )}
    </div>
  );
}