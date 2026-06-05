import { useState } from "react";
import { CP_NAV, CP_PAGE_MAP } from "./nav.js";
import UserList      from "./pages/UserList.jsx";
import GroupMaster   from "./pages/GroupMaster.jsx";
import DatabaseMaster from "./pages/DatabaseMaster.jsx";
import PageMaster    from "./pages/PageMaster/index.jsx";
import GroupPages    from "./pages/GroupPages.jsx";

const API_URL = import.meta.env.VITE_API_URL || "https://sila.silasystem.com:7103/General/GeneralAPI/"
const BASE_BODY = {
  AppVersionWeb:"225", AppVersionAndroid:"225", AppVersionIos:"225",
  AppVersionDesktop:"225", FireBaseToken:"", PlatForm:"web", deviceID:"", IP:"192.168.1.3"
}

const CSS = `
  :root {
    --bg:#f8fafc; --surface:#fff; --soft:#f9fafb;
    --text:#111827; --muted:#64748b; --border:#e5e7eb;
    --primary:#f97316; --primary-dark:#ea580c; --primary-soft:#ffedd5;
    --navy:#1f2937; --shadow:0 16px 40px rgba(15,23,42,.08);
  }
  .cp-sidebar { width:260px; min-width:260px; height:100vh; background:var(--navy);
    display:flex; flex-direction:column; overflow-y:auto; flex-shrink:0;
    box-shadow:4px 0 20px rgba(0,0,0,.12); position:relative; z-index:10; }
  .cp-side-brand { padding:18px 16px; border-bottom:1px solid rgba(255,255,255,.1);
    display:flex; align-items:center; gap:12px; }
  .cp-side-logo { width:42px; height:42px; border-radius:13px; flex-shrink:0;
    background:linear-gradient(135deg,var(--primary),var(--primary-dark));
    display:grid; place-items:center; font-weight:900; font-size:15px; color:#fff; }
  .cp-side-brand h2 { font-size:18px; font-weight:900; color:#fff; }
  .cp-side-brand p { font-size:11px; color:#9ca3af; margin-top:1px; }
  .cp-side-user { padding:10px 16px; border-bottom:1px solid rgba(255,255,255,.08);
    display:flex; align-items:center; gap:10px; }
  .cp-side-avatar { width:32px; height:32px; border-radius:50%; flex-shrink:0;
    background:linear-gradient(135deg,var(--primary),var(--primary-dark));
    display:grid; place-items:center; font-weight:900; font-size:13px; color:#fff; }
  .cp-side-name { font-size:13px; font-weight:700; color:#fff; }
  .cp-side-role { font-size:11px; color:#9ca3af; }
  .cp-side-section { font-size:10px; font-weight:900; color:#6b7280;
    letter-spacing:.8px; padding:14px 16px 5px; text-transform:uppercase; }
  .cp-side-menu { list-style:none; padding:0 8px; display:flex; flex-direction:column; gap:2px; }
  .cp-side-link { display:flex; align-items:center; gap:10px; color:#d1d5db;
    text-decoration:none; padding:10px 12px; border-radius:12px; font-weight:700;
    font-size:13px; cursor:pointer; transition:all .15s; border:none; background:none;
    width:100%; text-align:left; font-family:inherit; }
  .cp-side-link:hover { background:#374151; color:#fff; }
  .cp-side-link.active { background:linear-gradient(135deg,var(--primary),var(--primary-dark));
    color:#fff; box-shadow:0 6px 18px rgba(249,115,22,.3); }
  .cp-side-icon { width:26px; height:26px; border-radius:8px; background:rgba(255,255,255,.08);
    display:grid; place-items:center; font-size:14px; flex-shrink:0; }
  .cp-side-link.active .cp-side-icon { background:rgba(255,255,255,.2); }
  .cp-side-footer { margin-top:auto; padding:12px; border-top:1px solid rgba(255,255,255,.08); }
  .cp-side-foot-inner { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
    border-radius:14px; padding:12px; }
  .cp-side-foot-actions { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:10px; }
  .cp-side-foot-btn { height:32px; border-radius:9px; border:1px solid rgba(255,255,255,.12);
    background:rgba(255,255,255,.07); color:#e5e7eb; font-weight:800; cursor:pointer;
    font-size:12px; font-family:inherit; }
  .cp-side-foot-btn:hover { background:rgba(255,255,255,.14); }
  .cp-topbar { height:52px; background:rgba(248,250,252,.95); backdrop-filter:blur(18px);
    border-bottom:1px solid var(--border); display:flex; align-items:flex-end;
    padding:0 20px; position:sticky; top:0; z-index:30; }
  .cp-tabs { display:flex; gap:5px; overflow-x:auto; align-items:flex-end; height:100%; }
  .cp-tab { height:36px; display:flex; align-items:center; gap:6px; padding:0 14px;
    border:1px solid var(--border); border-bottom:0; border-radius:12px 12px 0 0;
    background:var(--soft); color:var(--muted); font-size:13px; font-weight:700;
    white-space:nowrap; cursor:pointer; transition:all .15s; font-family:inherit;
    position:relative; }
  .cp-tab:hover { background:#f1f5f9; color:var(--text); }
  .cp-tab.active { background:var(--surface); color:var(--text); }
  .cp-tab.active::before { content:''; position:absolute; left:10px; right:10px; top:0;
    height:3px; border-radius:999px;
    background:linear-gradient(135deg,var(--primary),var(--primary-dark)); }
  .cp-tab-close { font-size:15px; color:#9ca3af; margin-left:2px; line-height:1;
    background:none; border:none; cursor:pointer; padding:0 2px; }
  .cp-tab-close:hover { color:#dc2626; }
  .cp-content { flex:1; overflow:auto; padding:22px; background:var(--bg); }
  .cp-overlay { display:none; position:fixed; inset:0; background:rgba(15,23,42,.45); z-index:9; }
  .cp-overlay.show { display:block; }
  .cp-mobile-toggle { display:none; height:36px; border:1px solid var(--border);
    background:var(--surface); border-radius:10px; padding:0 12px; font-weight:800;
    cursor:pointer; font-size:13px; font-family:inherit; margin-bottom:8px; }
  @media(max-width:1050px) {
    .cp-sidebar { position:fixed; left:0; top:0; bottom:0; transform:translateX(-100%);
      transition:.25s; z-index:50; }
    .cp-sidebar.show { transform:translateX(0); }
    .cp-main { margin-left:0 !important; width:100% !important; }
    .cp-mobile-toggle { display:flex; align-items:center; }
  }
  @media(max-width:600px) { .cp-content { padding:14px; } }
`

function injectCSS() {
  if (!document.getElementById('cp-styles')) {
    const s = document.createElement('style')
    s.id = 'cp-styles'
    s.textContent = CSS
    document.head.appendChild(s)
  }
}

function Login({ onLogin }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")
  injectCSS()

  const doLogin = async () => {
    if (!username.trim()) { setError("Please enter your username"); return }
    if (!password)        { setError("Please enter your password"); return }
    setError(""); setLoading(true)
    try {
      const res = await fetch(API_URL, {
        method:"POST",
        headers:{"Accept":"application/json","content-type":"application/json","Sp_Name":"CP.APICPOperation"},
        body:JSON.stringify({...BASE_BODY,Operation:"CP Login",LineData:JSON.stringify({Username:username.trim(),Password:password})})
      })
      const d = await res.json()
      if (d.State !== 0) { setError(d.Message || "Invalid username or password"); return }
      const fullName = d.List0?.[0]?.FullName || username.trim()
      sessionStorage.setItem("FullName", fullName)
      onLogin(fullName)
    } catch(e) { setError("Cannot connect to server. " + e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
      background:"linear-gradient(135deg,#111827,#1f2937)",padding:24}}>
      <div style={{width:"100%",maxWidth:420,background:"#fff",borderRadius:24,
        padding:"36px 32px",boxShadow:"0 30px 80px rgba(0,0,0,.35)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:60,height:60,borderRadius:18,margin:"0 auto 14px",
            background:"linear-gradient(135deg,#f97316,#ea580c)",
            display:"grid",placeItems:"center",fontSize:22,fontWeight:900,color:"#fff"}}>CP</div>
          <div style={{fontSize:26,fontWeight:900,color:"#111827"}}>ERP Nano</div>
          <div style={{display:"inline-block",marginTop:6,fontSize:11,fontWeight:700,
            letterSpacing:"1px",color:"#f97316",background:"#ffedd5",
            padding:"3px 12px",borderRadius:20}}>CONTROL PANEL</div>
        </div>
        {error && (
          <div style={{background:"#fee2e2",border:"0.5px solid #fca5a5",borderRadius:10,
            padding:"9px 12px",color:"#dc2626",fontSize:13,marginBottom:16}}>⚠️ {error}</div>
        )}
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:11,fontWeight:900,color:"#64748b",
            letterSpacing:".5px",marginBottom:6}}>USERNAME</label>
          <input value={username} onChange={e=>{setUsername(e.target.value);setError("")}}
            onKeyDown={e=>e.key==="Enter"&&doLogin()} placeholder="Enter username" autoFocus
            style={{width:"100%",height:46,border:"1px solid #e5e7eb",borderRadius:12,
              background:"#f9fafb",padding:"0 14px",fontSize:14,fontWeight:700,
              outline:"none",fontFamily:"inherit"}}/>
        </div>
        <div style={{marginBottom:24}}>
          <label style={{display:"block",fontSize:11,fontWeight:900,color:"#64748b",
            letterSpacing:".5px",marginBottom:6}}>PASSWORD</label>
          <div style={{position:"relative"}}>
            <input value={password} onChange={e=>{setPassword(e.target.value);setError("")}}
              onKeyDown={e=>e.key==="Enter"&&doLogin()}
              placeholder="Enter password" type={showPass?"text":"password"}
              style={{width:"100%",height:46,border:"1px solid #e5e7eb",borderRadius:12,
                background:"#f9fafb",padding:"0 40px 0 14px",fontSize:14,fontWeight:700,
                outline:"none",fontFamily:"inherit"}}/>
            <button onClick={()=>setShowPass(v=>!v)}
              style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
                background:"none",border:"none",cursor:"pointer",fontSize:16}}>
              {showPass?"🙈":"👁"}
            </button>
          </div>
        </div>
        <button onClick={doLogin} disabled={loading}
          style={{width:"100%",height:48,border:0,borderRadius:14,fontFamily:"inherit",
            background:loading?"#94a3b8":"linear-gradient(135deg,#f97316,#ea580c)",
            color:"#fff",fontSize:15,fontWeight:900,cursor:loading?"not-allowed":"pointer"}}>
          {loading?"⏳ Signing in…":"Sign In →"}
        </button>
        <div style={{textAlign:"center",marginTop:20,fontSize:11,color:"#9ca3af"}}>
          ERPNano CP · v2.25 · Sila System
        </div>
      </div>
    </div>
  )
}

function Shell({ user, onLogout }) {
  const [activePage,  setActivePage]  = useState(null)
  const [openTabs,    setOpenTabs]    = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  injectCSS()

  const openPage = key => {
    const page = CP_PAGE_MAP[key]
    if (!page) return
    setActivePage(key)
    setOpenTabs(prev => prev.find(t=>t.key===key) ? prev : [...prev,{key,label:page.label,icon:page.icon}])
    setSidebarOpen(false)
  }

  const closeTab = (key, e) => {
    e.stopPropagation()
    setOpenTabs(prev => {
      const next = prev.filter(t=>t.key!==key)
      if (activePage===key) setActivePage(next.length?next[next.length-1].key:null)
      return next
    })
  }

  const renderPage = () => {
    if (activePage==="userlist")   return <UserList/>
    if (activePage==="groups")     return <GroupMaster/>
    if (activePage==="databases")  return <DatabaseMaster/>
    if (activePage==="pages")      return <PageMaster/>
    if (activePage==="grouppages") return <GroupPages/>
    return (
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",
        justifyContent:"center",height:"60vh",color:"#64748b",gap:12,textAlign:"center"}}>
        <div style={{fontSize:56,opacity:.12}}>⚙</div>
        <div style={{fontSize:20,fontWeight:900,color:"#111827"}}>Welcome to ERP Nano CP</div>
        <div style={{fontSize:14}}>Select a section from the sidebar to get started</div>
      </div>
    )
  }

  return (
    <div style={{display:"flex",height:"100vh",fontFamily:"Inter,system-ui,sans-serif",
      background:"var(--bg)",overflow:"hidden"}}>
      <div className={`cp-overlay${sidebarOpen?" show":""}`} onClick={()=>setSidebarOpen(false)}/>
      <aside className={`cp-sidebar${sidebarOpen?" show":""}`}>
        <div className="cp-side-brand">
          <div className="cp-side-logo">CP</div>
          <div><h2>ERP Nano</h2><p>Control Panel</p></div>
        </div>
        <div className="cp-side-user">
          <div className="cp-side-avatar">{user[0]?.toUpperCase()}</div>
          <div>
            <div className="cp-side-name">{user}</div>
            <div className="cp-side-role">System Admin</div>
          </div>
        </div>
        {CP_NAV.map(group => (
          <div key={group.key}>
            <div className="cp-side-section">{group.label}</div>
            <ul className="cp-side-menu">
              {group.pages.map(p => (
                <li key={p.key}>
                  <button className={`cp-side-link${activePage===p.key?" active":""}`}
                    onClick={()=>openPage(p.key)}>
                    <span className="cp-side-icon">{p.icon}</span>{p.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="cp-side-footer">
          <div className="cp-side-foot-inner">
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div className="cp-side-avatar" style={{width:36,height:36,fontSize:14}}>
                {user[0]?.toUpperCase()}
              </div>
              <div>
                <div className="cp-side-name" style={{fontSize:13}}>{user}</div>
                <div className="cp-side-role">System Admin</div>
              </div>
            </div>
            <div className="cp-side-foot-actions">
              <button className="cp-side-foot-btn"
                onClick={()=>window.location.href="/ERPNano/"}>← ERP Nano</button>
              <button className="cp-side-foot-btn" onClick={onLogout}>Logout</button>
            </div>
          </div>
        </div>
      </aside>

      <div className="cp-main" style={{flex:1,display:"flex",flexDirection:"column",
        overflow:"hidden",minWidth:0}}>
        <div className="cp-topbar">
          <button className="cp-mobile-toggle" onClick={()=>setSidebarOpen(v=>!v)}>
            ☰ Menu
          </button>
          <div className="cp-tabs">
            {openTabs.map(t => (
              <div key={t.key} className={`cp-tab${activePage===t.key?" active":""}`}
                onClick={()=>setActivePage(t.key)}>
                {t.icon} {t.label}
                <button className="cp-tab-close" onClick={e=>closeTab(t.key,e)}>×</button>
              </div>
            ))}
          </div>
        </div>
        <div className="cp-content">{renderPage()}</div>
      </div>
    </div>
  )
}

export default function ERPNanoCP() {
  const [user, setUser] = useState(sessionStorage.getItem("FullName") || null)
  const handleLogin  = name => setUser(name)
  const handleLogout = () => { sessionStorage.removeItem("FullName"); setUser(null) }
  if (!user) return <Login onLogin={handleLogin}/>
  return <Shell user={user} onLogout={handleLogout}/>
}
