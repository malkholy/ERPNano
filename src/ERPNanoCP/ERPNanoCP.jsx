import { useState } from "react";
import { CP_NAV, CP_PAGE_MAP } from "./nav.js";
import UserList    from "./pages/UserList.jsx";
import GroupMaster from "./pages/GroupMaster.jsx";
import DatabaseMaster from "./pages/DatabaseMaster.jsx";
import PageMaster  from "./pages/PageMaster/index.jsx";
import GroupPages  from "./pages/GroupPages.jsx";

const API_URL   = "https://sila.silasystem.com:7103/General/GeneralAPI/"
const BASE_BODY = {
  AppVersionWeb:"225", AppVersionAndroid:"225", AppVersionIos:"225",
  AppVersionDesktop:"225", FireBaseToken:"", PlatForm:"web", deviceID:"", IP:"192.168.1.3"
}

// ── Theme ─────────────────────────────────────────────────────────────────────
const T = {
  sidebar:            "#204066",
  sidebarBorder:      "rgba(255,255,255,.15)",
  sidebarText:        "rgba(255,255,255,.88)",
  sidebarGroupLabel:  "rgba(255,255,255,.75)",
  sidebarSubtext:     "rgba(255,255,255,.6)",
  sidebarChevron:     "rgba(255,255,255,.55)",
  sidebarActive:      "rgba(255,255,255,.14)",
  sidebarAccent:      "#CD9B6A",
  white:              "#ffffff",
  bg:                 "#f8fafc",
  bgCard:             "#ffffff",
  border:             "#e2e8f0",
  text:               "#1e293b",
  textMuted:          "#64748b",
  textHint:           "#94a3b8",
  navy:               "#204066",
  indigo:             "#4f46e5",
  indigoBg:           "#eef2ff",
  indigoTabBg:        "#f5f3ff",
}

// ── Login ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")

  const doLogin = async () => {
    if (!username.trim()) { setError("Please enter your username"); return; }
    if (!password)        { setError("Please enter your password"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Accept":"application/json","content-type":"application/json","Sp_Name":"CP.APICPOperation" },
        body: JSON.stringify({
          ...BASE_BODY, Operation:"CP Login",
          LineData: JSON.stringify({ Username: username.trim(), Password: password })
        })
      })
      const d = await res.json()
      console.log("API Response:", JSON.stringify(d, null, 2))
      if (d.State !== 0) { setError(d.Message || "Invalid username or password"); return }
      const fullName = d.List0?.[0]?.FullName || username.trim()
      sessionStorage.setItem("FullName", fullName)
      onLogin(fullName)
    } catch(e) { setError("Cannot connect to server. " + e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"#f0f4f8", fontFamily:"system-ui,sans-serif" }}>
      <div style={{ width:"100%", maxWidth:420, margin:16,
        background:T.white, border:`0.5px solid ${T.border}`,
        borderRadius:16, padding:"40px 36px",
        boxShadow:"0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06)" }}>

        <div style={{ textAlign:"center", marginBottom:32 }}>
          <img src="/ERPNano/logo.png" alt="ERP Nano"
            style={{ width:72, height:72, objectFit:"contain", marginBottom:14,
              borderRadius:16, boxShadow:"0 2px 8px rgba(0,0,0,.12)" }}
            onError={e => e.target.style.display="none"}/>
          <div style={{ fontSize:22, fontWeight:700, color:T.text }}>ERP Nano</div>
          <div style={{ display:"inline-block", marginTop:8, fontSize:11, fontWeight:600,
            letterSpacing:"1.2px", color:T.navy, background:T.indigoBg,
            padding:"3px 12px", borderRadius:20 }}>CONTROL PANEL</div>
        </div>

        {error && (
          <div style={{ background:"#fef2f2", border:"0.5px solid #fecaca",
            borderRadius:8, padding:"9px 12px", color:"#dc2626",
            fontSize:13, marginBottom:16 }}>⚠️ {error}</div>
        )}

        <div style={{ marginBottom:14 }}>
          <label style={{ display:"block", fontSize:12, fontWeight:600,
            color:T.textMuted, letterSpacing:".5px", marginBottom:6 }}>USERNAME</label>
          <input value={username}
            onChange={e => { setUsername(e.target.value); setError("") }}
            onKeyDown={e => e.key==="Enter" && doLogin()}
            placeholder="Enter username" autoFocus
            style={{ width:"100%", padding:"10px 12px",
              border:`0.5px solid ${T.border}`, borderRadius:8,
              fontSize:14, color:T.text, background:T.bg,
              outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}
            onFocus={e => e.target.style.borderColor = T.navy}
            onBlur={e  => e.target.style.borderColor = T.border}/>
        </div>

        <div style={{ marginBottom:28 }}>
          <label style={{ display:"block", fontSize:12, fontWeight:600,
            color:T.textMuted, letterSpacing:".5px", marginBottom:6 }}>PASSWORD</label>
          <div style={{ position:"relative" }}>
            <input value={password}
              onChange={e => { setPassword(e.target.value); setError("") }}
              onKeyDown={e => e.key==="Enter" && doLogin()}
              placeholder="Enter password"
              type={showPass ? "text" : "password"}
              style={{ width:"100%", padding:"10px 40px 10px 12px",
                border:`0.5px solid ${T.border}`, borderRadius:8,
                fontSize:14, color:T.text, background:T.bg,
                outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}
              onFocus={e => e.target.style.borderColor = T.navy}
              onBlur={e  => e.target.style.borderColor = T.border}/>
            <button onClick={() => setShowPass(v => !v)}
              style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", cursor:"pointer",
                color:T.textHint, fontSize:16, padding:4 }}>
              {showPass ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        <button onClick={doLogin} disabled={loading}
          style={{ width:"100%", padding:11, background: loading ? "#94a3b8" : T.navy,
            border:"none", borderRadius:8, color:"#fff",
            fontSize:14, fontWeight:600, cursor: loading ? "not-allowed" : "pointer",
            fontFamily:"inherit" }}>
          {loading ? "⏳ Signing in…" : "Sign in →"}
        </button>

        <div style={{ textAlign:"center", marginTop:24, fontSize:11, color:T.textHint }}>
          ERPNano CP · v2.25 · Sila System
        </div>
      </div>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ user, activePage, onNavigate, expanded, setExpanded }) {
  const toggleGroup = key => setExpanded(prev => {
    const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s;
  })

  return (
    <>
      <div style={{ width:240, minWidth:240, height:"100vh",
        background:T.sidebar, borderRight:`0.5px solid ${T.sidebarBorder}`,
        display:"flex", flexDirection:"column", overflowY:"auto", flexShrink:0 }}>

        {/* Logo */}
        <div style={{ padding:"16px", borderBottom:`0.5px solid ${T.sidebarBorder}`,
          display:"flex", alignItems:"center", gap:10 }}>
          <img src="/ERPNano/logo.png" alt="ERP Nano"
            style={{ width:34, height:34, objectFit:"contain", borderRadius:8 }}
            onError={e => e.target.style.display="none"}/>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:"#fff" }}>ERP Nano</div>
            <div style={{ fontSize:10, color:T.sidebarSubtext }}>Control Panel</div>
          </div>
        </div>

        {/* User */}
        <div style={{ padding:"10px 16px", borderBottom:`0.5px solid ${T.sidebarBorder}`,
          display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:"50%",
            background:"rgba(255,255,255,.15)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#fff", fontSize:13, fontWeight:700, flexShrink:0 }}>
            {user[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:"#fff" }}>{user}</div>
            <div style={{ fontSize:10, color:T.sidebarSubtext }}>System Admin</div>
          </div>
        </div>

        {/* Nav */}
        {CP_NAV.map(group => {
          const isOpen = expanded.has(group.key)
          return (
            <div key={group.key} style={{ paddingTop:4 }}>
              <div onClick={() => toggleGroup(group.key)}
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"7px 16px", cursor:"pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:14 }}>{group.icon}</span>
                  <span style={{ fontSize:11, fontWeight:700,
                    color:T.sidebarGroupLabel, letterSpacing:".8px" }}>{group.label}</span>
                </div>
                <span style={{ fontSize:9, color:T.sidebarChevron,
                  display:"inline-block", transition:"transform .2s",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
              </div>
              <div style={{ maxHeight: isOpen ? group.pages.length * 36 + "px" : "0",
                overflow:"hidden", transition:"max-height .25s ease" }}>
                {group.pages.map(p => {
                  const isActive = activePage === p.key
                  return (
                    <div key={p.key} onClick={() => onNavigate(p.key)}
                      style={{ display:"flex", alignItems:"center",
                        padding:"7px 16px 7px 32px",
                        cursor:"pointer", fontSize:13, position:"relative",
                        color: isActive ? "#fff" : T.sidebarText,
                        fontWeight: isActive ? 600 : 400,
                        background: isActive ? T.sidebarActive : "transparent" }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background="rgba(255,255,255,.08)"; e.currentTarget.style.color="#fff" }}}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color=T.sidebarText }}}>
                      {isActive && (
                        <span style={{ position:"absolute", left:0, top:0, bottom:0,
                          width:3, background:T.sidebarAccent }}/>
                      )}
                      {p.icon} <span style={{ marginLeft:8 }}>{p.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Bottom */}
        <div style={{ marginTop:"auto", padding:"12px 16px",
          borderTop:`0.5px solid ${T.sidebarBorder}` }}>
          <a href="/ERPNano/"
            style={{ display:"flex", alignItems:"center", gap:8, fontSize:12,
              color:T.sidebarSubtext, textDecoration:"none",
              padding:"8px 10px", borderRadius:8 }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,.08)"; e.currentTarget.style.color="#fff" }}
            onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color=T.sidebarSubtext }}>
            ← Back to ERP Nano
          </a>
        </div>
      </div>
    </>
  )
}

// ── Shell ─────────────────────────────────────────────────────────────────────
function Shell({ user, onLogout }) {
  const [activePage, setActivePage] = useState("")
  const [expanded,   setExpanded]   = useState(new Set(["users","system","masterdata","logs","groups","databases"]))

  const page = CP_PAGE_MAP[activePage]

  const renderPage = () => {
    if (activePage === "userlist")    return <UserList/>
    if (activePage === "groups")      return <GroupMaster/>
    if (activePage === "databases")   return <DatabaseMaster/>
    if (activePage === "pages")       return <PageMaster/>
    if (activePage === "grouppages")  return <GroupPages/>
    return (
      <div style={{ background:T.white, borderRadius:12, padding:48,
        border:`0.5px solid ${T.border}`, textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🚧</div>
        <div style={{ fontSize:18, fontWeight:600, color:T.text, marginBottom:8 }}>
          {page?.label || "Select a page"}
        </div>
        <div style={{ fontSize:13, color:T.textHint, marginBottom:20 }}>
          {page ? "Coming soon" : "Click any item in the sidebar to open it"}
        </div>
        {page && (
          <button style={{ padding:"8px 20px", background:T.navy, color:"#fff",
            border:"none", borderRadius:8, fontSize:13, fontWeight:500,
            cursor:"pointer", fontFamily:"inherit" }}>
            🔄 Refresh
          </button>
        )}
      </div>
    )
  }

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"system-ui,sans-serif", background:T.bg }}>
      <Sidebar user={user} activePage={activePage} onNavigate={setActivePage}
        expanded={expanded} setExpanded={setExpanded}/>

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>

        {/* Topbar */}
        <div style={{ height:52, background:T.white, borderBottom:`0.5px solid ${T.border}`,
          display:"flex", alignItems:"center", padding:"0 20px", gap:12, flexShrink:0 }}>
          <div style={{ flex:1, fontSize:15, fontWeight:600, color:T.text }}>
            {page ? `${page.icon} ${page.label}` : "Control Panel"}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:11, fontWeight:600, color:T.indigo,
              background:T.indigoBg, padding:"3px 10px", borderRadius:20 }}>ADMIN</span>
            <span style={{ fontSize:12, color:T.textMuted }}>{user}</span>
            <button onClick={onLogout}
              style={{ padding:"5px 12px", borderRadius:6,
                border:`0.5px solid ${T.border}`, background:T.bg,
                color:T.textMuted, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflow:"auto", padding:24, background:T.bg }}>
          {renderPage()}
        </div>
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function ERPNanoCP() {
  const [user, setUser] = useState(sessionStorage.getItem("FullName") || null)
  const handleLogin  = name => setUser(name)
  const handleLogout = () => { sessionStorage.removeItem("FullName"); setUser(null) }
  if (!user) return <Login onLogin={handleLogin}/>
  return <Shell user={user} onLogout={handleLogout}/>
}
