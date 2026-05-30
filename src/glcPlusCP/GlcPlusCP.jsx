import { useState } from "react";
import { apiCall } from "../shared/hooks/useAPI.js";
import { CP_NAV, CP_PAGE_MAP } from "./nav.js";

// ── Login ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [user,    setUser]    = useState('');
  const [pass,    setPass]    = useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const doLogin = async () => {
    if (!user.trim()) { setError('Please enter your username'); return; }
    if (!pass)        { setError('Please enter your password'); return; }
    setError(''); setLoading(true);
    try {
      const rows  = await apiCall('login', { LineData: pass }, user.trim());
      const row   = rows[0] || {};
      const state = row?.State ?? row?.state ?? 1;
      const msg   = row?.Message || row?.message || '';
      if (state === 0 || state === '0') {
        setSuccess(msg || `Welcome, ${user.trim()}!`);
        setTimeout(() => onLogin(user.trim()), 1200);
      } else {
        setError(msg || 'Username Or Password is not correct');
      }
    } catch(e) {
      setError('Cannot connect to server. ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'#0f1117', fontFamily:'system-ui,sans-serif', position:'relative', overflow:'hidden' }}>
      {/* Background */}
      <div style={{ position:'fixed', inset:0, background:
        'radial-gradient(ellipse 80% 60% at 20% 20%,rgba(220,38,38,.2) 0%,transparent 60%),' +
        'radial-gradient(ellipse 60% 80% at 80% 80%,rgba(124,58,237,.15) 0%,transparent 60%)' }}/>
      <div style={{ position:'fixed', inset:0,
        backgroundImage:'linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)',
        backgroundSize:'48px 48px' }}/>

      {/* Card */}
      <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:420, margin:16,
        background:'rgba(26,29,39,.8)', backdropFilter:'blur(24px)',
        border:'1px solid rgba(255,255,255,.06)', borderRadius:24, padding:'44px 40px',
        boxShadow:'0 32px 64px rgba(0,0,0,.6)' }}>

        {/* Success overlay */}
        {success && (
          <div style={{ position:'absolute', inset:0, background:'rgba(15,17,23,.95)', borderRadius:24,
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, zIndex:20 }}>
            <div style={{ fontSize:52 }}>✅</div>
            <div style={{ color:'#fff', fontSize:18, fontWeight:700 }}>Access Granted</div>
            <div style={{ color:'#94a3b8', fontSize:13 }}>{success}</div>
          </div>
        )}

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center',
            width:64, height:64, borderRadius:18,
            background:'linear-gradient(135deg,#dc2626,#7c3aed)',
            fontFamily:'monospace', fontSize:16, fontWeight:700, color:'#fff',
            marginBottom:16, boxShadow:'0 8px 32px rgba(220,38,38,.4)' }}>CP</div>
          <div style={{ fontSize:22, fontWeight:800, color:'#fff' }}>Control Panel</div>
          <div style={{ fontSize:12, color:'#64748b', marginTop:4 }}>System Administrators Only</div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(239,68,68,.1)',
            border:'1px solid rgba(239,68,68,.3)', borderRadius:10, padding:'10px 14px',
            marginBottom:16, color:'#fca5a5', fontSize:13 }}>⚠️ {error}</div>
        )}

        {/* Username */}
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#64748b',
            letterSpacing:'.8px', textTransform:'uppercase', marginBottom:8 }}>Username</label>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)',
              fontSize:15, color:'#64748b', pointerEvents:'none' }}>👤</span>
            <input value={user} onChange={e=>{setUser(e.target.value);setError('');}}
              onKeyDown={e=>e.key==='Enter'&&doLogin()}
              placeholder="Admin username" autoComplete="username"
              style={{ width:'100%', padding:'13px 14px 13px 42px',
                background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)',
                borderRadius:12, color:'#fff', fontSize:14, fontFamily:'inherit', outline:'none' }}/>
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#64748b',
            letterSpacing:'.8px', textTransform:'uppercase', marginBottom:8 }}>Password</label>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)',
              fontSize:15, color:'#64748b', pointerEvents:'none' }}>🔒</span>
            <input value={pass} onChange={e=>{setPass(e.target.value);setError('');}}
              onKeyDown={e=>e.key==='Enter'&&doLogin()}
              placeholder="Admin password" type={showPw?'text':'password'} autoComplete="current-password"
              style={{ width:'100%', padding:'13px 42px 13px 42px',
                background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)',
                borderRadius:12, color:'#fff', fontSize:14, fontFamily:'inherit', outline:'none' }}/>
            <button onClick={()=>setShowPw(v=>!v)}
              style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer', color:'#64748b', fontSize:15, padding:4 }}>
              {showPw?'🙈':'👁'}
            </button>
          </div>
        </div>

        {/* Button */}
        <button onClick={doLogin} disabled={loading}
          style={{ width:'100%', padding:14,
            background:'linear-gradient(135deg,#dc2626,#b91c1c)',
            border:'none', borderRadius:12, color:'#fff', fontSize:15, fontWeight:700,
            fontFamily:'inherit', cursor:loading?'not-allowed':'pointer', opacity:loading?.6:1,
            boxShadow:'0 4px 24px rgba(220,38,38,.4)' }}>
          {loading?'⏳  Verifying...':'Access Control Panel'}
        </button>

        {/* Footer */}
        <div style={{ textAlign:'center', marginTop:28, paddingTop:20,
          borderTop:'1px solid rgba(255,255,255,.06)', fontSize:11, color:'#475569' }}>
          Restricted Access · Sila System
          <div style={{ fontFamily:'monospace', fontSize:10, color:'rgba(148,163,184,.3)', marginTop:6, letterSpacing:1 }}>
            GLC-PLUS CP v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ user, activePage, onNavigate, expanded, setExpanded, mobileOpen, onClose }) {
  const toggleGroup = key => setExpanded(prev => {
    const s = new Set(prev); s.has(key)?s.delete(key):s.add(key); return s;
  });
  const isMobile = window.innerWidth <= 768;

  return (
    <>
      {mobileOpen && (
        <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:40 }}/>
      )}
      <div style={{ width:240, minWidth:240, height:'100vh',
        background:'#0f1117', borderRight:'1px solid rgba(255,255,255,.06)',
        display:'flex', flexDirection:'column', overflowY:'auto', flexShrink:0,
        position:isMobile?'fixed':'relative',
        left:isMobile?(mobileOpen?0:-240):0, zIndex:50, transition:'left .3s' }}>

        {/* Logo */}
        <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid rgba(255,255,255,.06)',
          display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10,
            background:'linear-gradient(135deg,#dc2626,#7c3aed)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'monospace', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>CP</div>
          <div>
            <div style={{ fontSize:14, fontWeight:800, color:'#fff' }}>Control Panel</div>
            <div style={{ fontSize:10, color:'#475569' }}>GLC Plus Admin</div>
          </div>
        </div>

        {/* User */}
        <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,.06)',
          display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:'50%',
            background:'rgba(220,38,38,.2)', border:'1px solid rgba(220,38,38,.3)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#f87171', fontSize:13, fontWeight:700, flexShrink:0 }}>
            {user[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,.8)' }}>{user}</div>
            <div style={{ fontSize:10, color:'#475569' }}>System Admin</div>
          </div>
        </div>

        {/* Nav */}
        {CP_NAV.map(group => {
          const isOpen = expanded.has(group.key);
          return (
            <div key={group.key} style={{ paddingTop:4 }}>
              <div onClick={()=>toggleGroup(group.key)}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'7px 16px', cursor:'pointer' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.04)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:14 }}>{group.icon}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.3)',
                    letterSpacing:'.8px' }}>{group.label}</span>
                </div>
                <span style={{ fontSize:9, color:'rgba(255,255,255,.2)', display:'inline-block',
                  transition:'transform .2s', transform:isOpen?'rotate(180deg)':'rotate(0deg)' }}>▼</span>
              </div>
              <div style={{ maxHeight:isOpen?group.pages.length*36+'px':'0',
                overflow:'hidden', transition:'max-height .25s ease' }}>
                {group.pages.map(p => {
                  const isActive = activePage===p.key;
                  return (
                    <div key={p.key} onClick={()=>{ onNavigate(p.key); onClose(); }}
                      style={{ display:'flex', alignItems:'center', padding:'7px 16px 7px 32px',
                        cursor:'pointer', fontSize:13, position:'relative',
                        color:isActive?'#fff':'rgba(255,255,255,.4)',
                        fontWeight:isActive?600:400,
                        background:isActive?'rgba(220,38,38,.15)':'transparent' }}
                      onMouseEnter={e=>{ if(!isActive){ e.currentTarget.style.background='rgba(255,255,255,.04)'; e.currentTarget.style.color='rgba(255,255,255,.8)'; }}}
                      onMouseLeave={e=>{ if(!isActive){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,.4)'; }}}>
                      {isActive && (
                        <span style={{ position:'absolute', left:18, top:'50%', transform:'translateY(-50%)',
                          width:3, height:16, background:'#f87171', borderRadius:2 }}/>
                      )}
                      {p.icon} <span style={{ marginLeft:8 }}>{p.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Back to GLC Plus */}
        <div style={{ marginTop:'auto', padding:'12px 16px',
          borderTop:'1px solid rgba(255,255,255,.06)' }}>
          <a href="/glcPlus/" style={{ display:'flex', alignItems:'center', gap:8,
            fontSize:12, color:'#475569', textDecoration:'none', padding:'8px 10px',
            borderRadius:8, transition:'all .15s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,.04)'; e.currentTarget.style.color='#94a3b8'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#475569'; }}>
            ← Back to GLC Plus
          </a>
        </div>
      </div>
    </>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────
function Shell({ user, onLogout }) {
  const [activePage, setActivePage] = useState('');
  const [tabs,       setTabs]       = useState([]);
  const [expanded,   setExpanded]   = useState(new Set(['users','system','masterdata','logs']));
  const [mobileOpen, setMobileOpen] = useState(false);

  const openPage = key => {
    setTabs(prev => prev.includes(key)?prev:prev.length>=6?[...prev.slice(1),key]:[...prev,key]);
    setActivePage(key);
  };

  const closeTab = (key, e) => {
    e.stopPropagation();
    setTabs(prev => {
      const idx  = prev.indexOf(key);
      const next = prev.filter(t=>t!==key);
      if (activePage===key) setActivePage(next[Math.max(0,idx-1)]??'');
      return next;
    });
  };

  const page = CP_PAGE_MAP[activePage];

  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:'system-ui,sans-serif', background:'#0f1117' }}>
      <Sidebar user={user} activePage={activePage} onNavigate={openPage}
        expanded={expanded} setExpanded={setExpanded}
        mobileOpen={mobileOpen} onClose={()=>setMobileOpen(false)}/>

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

        {/* Topbar */}
        <div style={{ height:52, background:'#1a1d27', borderBottom:'1px solid rgba(255,255,255,.06)',
          display:'flex', alignItems:'center', padding:'0 20px', gap:12, flexShrink:0 }}>
          <button onClick={()=>setMobileOpen(v=>!v)}
            style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#64748b', padding:4 }}>☰</button>
          <div style={{ flex:1, fontSize:15, fontWeight:700, color:'#fff' }}>
            {page ? `${page.icon} ${page.label}` : 'Control Panel'}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:11, color:'#475569',
              background:'rgba(220,38,38,.1)', border:'1px solid rgba(220,38,38,.2)',
              padding:'3px 10px', borderRadius:20, fontWeight:600, color:'#f87171' }}>
              ADMIN
            </span>
            <span style={{ fontSize:12, color:'#64748b' }}>{user}</span>
            <button onClick={onLogout}
              style={{ padding:'5px 12px', borderRadius:6,
                border:'1px solid rgba(255,255,255,.08)', background:'rgba(255,255,255,.04)',
                color:'#64748b', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
              Logout
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display:'flex', alignItems:'center', background:'#1a1d27',
          borderBottom:'1px solid rgba(255,255,255,.06)', padding:'0 12px',
          overflowX:'auto', minHeight:40, flexShrink:0 }}>
          {tabs.map(key => {
            const p        = CP_PAGE_MAP[key];
            const isActive = activePage===key;
            return (
              <div key={key} onClick={()=>setActivePage(key)}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'0 14px', height:40,
                  cursor:'pointer', fontSize:12, fontWeight:isActive?600:500,
                  whiteSpace:'nowrap', flexShrink:0,
                  color:isActive?'#f87171':'#475569',
                  borderBottom:isActive?'2px solid #f87171':'2px solid transparent',
                  background:isActive?'rgba(220,38,38,.05)':'transparent' }}>
                {p.icon} {p.label}
                <button onClick={e=>closeTab(key,e)}
                  style={{ width:16, height:16, borderRadius:'50%', border:'none',
                    background:'none', cursor:'pointer', color:'#475569', fontSize:11,
                    display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
              </div>
            );
          })}
        </div>

        {/* Page content */}
        <div style={{ flex:1, overflow:'auto', padding:28, background:'#0f1117' }}>
          {!page ? (
            <div style={{ background:'#1a1d27', borderRadius:16, padding:48,
              border:'1px solid rgba(255,255,255,.06)', textAlign:'center' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>👈</div>
              <div style={{ fontSize:18, fontWeight:700, color:'#fff', marginBottom:8 }}>Select a page</div>
              <div style={{ fontSize:13, color:'#475569' }}>Click any item in the sidebar to open it as a tab</div>
            </div>
          ) : (
            <div style={{ background:'#1a1d27', borderRadius:16, padding:40,
              border:'1px solid rgba(255,255,255,.06)', textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>{page.icon}</div>
              <div style={{ fontSize:20, fontWeight:700, color:'#fff', marginBottom:8 }}>{page.label}</div>
              <div style={{ fontSize:13, color:'#475569', marginBottom:24 }}>Page coming soon</div>
              <button style={{ padding:'8px 24px', background:'#dc2626', color:'#fff',
                border:'none', borderRadius:8, fontSize:13, fontWeight:600,
                cursor:'pointer', fontFamily:'inherit' }}>
                🔄 Refresh
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function GlcPlusCP() {
  const [user, setUser] = useState(null);
  if (!user) return <Login onLogin={setUser} />;
  return <Shell user={user} onLogout={()=>setUser(null)} />;
}
