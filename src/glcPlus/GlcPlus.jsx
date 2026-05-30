import { useState } from "react";
import { apiCall } from "../shared/hooks/useAPI.js";

const NAV = [
  { key:'costing', label:'COSTING', icon:'📦', pages:[
    { key:'bom',      label:'BOM',              icon:'📊' },
    { key:'raw',      label:'Raw Materials',     icon:'🧪' },
    { key:'fg',       label:'Finished Goods',    icon:'🏷️' },
    { key:'rawcost',  label:'RM Cost',           icon:'💎' },
  ]},
  { key:'sales', label:'SALES', icon:'💰', pages:[
    { key:'salesamt', label:'Sales Amount',      icon:'💰' },
    { key:'salesan',  label:'Sales Analysis',    icon:'📈' },
    { key:'coverage', label:'Customer Coverage', icon:'📊' },
    { key:'pricelab', label:'Price Lab',         icon:'🔬' },
  ]},
  { key:'finance', label:'FINANCE', icon:'💵', pages:[
    { key:'cashflow',  label:'Cash Flow',        icon:'💵' },
    { key:'expenses',  label:'Expenses',         icon:'💸' },
    { key:'pricelist', label:'Price List',       icon:'🏷️' },
  ]},
  { key:'stock', label:'STOCK', icon:'🏭', pages:[
    { key:'balance', label:'Item Balance', icon:'📦' },
  ]},
];
const PAGE_MAP = {};
NAV.forEach(g => g.pages.forEach(p => { PAGE_MAP[p.key] = p; }));

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
      background:'#0b1f3a', fontFamily:'system-ui,sans-serif', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'fixed', inset:0, background:'radial-gradient(ellipse 80% 60% at 20% 20%,rgba(29,78,216,.25) 0%,transparent 60%),radial-gradient(ellipse 60% 80% at 80% 80%,rgba(124,58,237,.2) 0%,transparent 60%)' }}/>
      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)', backgroundSize:'48px 48px' }}/>
      <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:420, margin:16,
        background:'rgba(15,45,90,.65)', backdropFilter:'blur(24px)',
        border:'1px solid rgba(255,255,255,.08)', borderRadius:24, padding:'44px 40px',
        boxShadow:'0 32px 64px rgba(0,0,0,.4)' }}>
        {success && (
          <div style={{ position:'absolute', inset:0, background:'rgba(15,45,90,.95)', borderRadius:24,
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, zIndex:20 }}>
            <div style={{ fontSize:52 }}>✅</div>
            <div style={{ color:'#fff', fontSize:18, fontWeight:700 }}>Welcome!</div>
            <div style={{ color:'#94a3b8', fontSize:13 }}>{success}</div>
          </div>
        )}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center',
            width:64, height:64, borderRadius:18, background:'linear-gradient(135deg,#1d4ed8,#7c3aed)',
            fontFamily:'monospace', fontSize:20, fontWeight:700, color:'#fff',
            marginBottom:16, boxShadow:'0 8px 32px rgba(29,78,216,.4)' }}>GLC</div>
          <div style={{ fontSize:22, fontWeight:800, color:'#fff' }}>GLC Plus</div>
        </div>
        {error && (
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(239,68,68,.1)',
            border:'1px solid rgba(239,68,68,.3)', borderRadius:10, padding:'10px 14px',
            marginBottom:16, color:'#fca5a5', fontSize:13 }}>⚠️ {error}</div>
        )}
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#94a3b8', letterSpacing:'.8px', textTransform:'uppercase', marginBottom:8 }}>Username</label>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:15, color:'#94a3b8', pointerEvents:'none' }}>👤</span>
            <input value={user} onChange={e=>{setUser(e.target.value);setError('');}} onKeyDown={e=>e.key==='Enter'&&doLogin()}
              placeholder="Enter your username" autoComplete="username"
              style={{ width:'100%', padding:'13px 14px 13px 42px', background:'rgba(255,255,255,.05)',
                border:'1px solid rgba(255,255,255,.1)', borderRadius:12, color:'#fff',
                fontSize:14, fontFamily:'inherit', outline:'none' }}/>
          </div>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#94a3b8', letterSpacing:'.8px', textTransform:'uppercase', marginBottom:8 }}>Password</label>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:15, color:'#94a3b8', pointerEvents:'none' }}>🔒</span>
            <input value={pass} onChange={e=>{setPass(e.target.value);setError('');}} onKeyDown={e=>e.key==='Enter'&&doLogin()}
              placeholder="Enter your password" type={showPw?'text':'password'} autoComplete="current-password"
              style={{ width:'100%', padding:'13px 42px 13px 42px', background:'rgba(255,255,255,.05)',
                border:'1px solid rgba(255,255,255,.1)', borderRadius:12, color:'#fff',
                fontSize:14, fontFamily:'inherit', outline:'none' }}/>
            <button onClick={()=>setShowPw(v=>!v)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
              background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:15, padding:4 }}>
              {showPw?'🙈':'👁'}
            </button>
          </div>
        </div>
        <button onClick={doLogin} disabled={loading}
          style={{ width:'100%', padding:14, background:'linear-gradient(135deg,#1d4ed8,#2563eb)',
            border:'none', borderRadius:12, color:'#fff', fontSize:15, fontWeight:700,
            fontFamily:'inherit', cursor:loading?'not-allowed':'pointer', opacity:loading?.6:1,
            boxShadow:'0 4px 24px rgba(29,78,216,.4)' }}>
          {loading?'⏳  Signing in...':'Sign In'}
        </button>
        <div style={{ textAlign:'center', marginTop:28, paddingTop:20, borderTop:'1px solid rgba(255,255,255,.06)', fontSize:11, color:'#94a3b8' }}>
          Sila System · Internal Use Only
          <div style={{ fontFamily:'monospace', fontSize:10, color:'rgba(148,163,184,.4)', marginTop:6, letterSpacing:1 }}>GLC-PLUS v1.0.0</div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ user, activePage, onNavigate, expanded, setExpanded, mobileOpen, onClose }) {
  const toggleGroup = key => setExpanded(prev => {
    const s = new Set(prev); s.has(key)?s.delete(key):s.add(key); return s;
  });
  const isMobile = window.innerWidth <= 768;
  return (
    <>
      {mobileOpen && <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:40 }}/>}
      <div style={{ width:240, minWidth:240, height:'100vh', background:'#0f2d5a',
        display:'flex', flexDirection:'column', overflowY:'auto', flexShrink:0,
        position:isMobile?'fixed':'relative',
        left:isMobile?(mobileOpen?0:-240):0, zIndex:50, transition:'left .3s' }}>
        <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#1d4ed8,#7c3aed)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'monospace', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>GLC</div>
          <div style={{ fontSize:16, fontWeight:800, color:'#fff' }}>GLC Plus</div>
        </div>
        <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:'50%', background:'rgba(99,102,241,.3)',
            display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13, fontWeight:700, flexShrink:0 }}>
            {user[0]?.toUpperCase()}
          </div>
          <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,.8)' }}>{user}</div>
        </div>
        {NAV.map(group => {
          const isOpen = expanded.has(group.key);
          return (
            <div key={group.key} style={{ paddingTop:4 }}>
              <div onClick={()=>toggleGroup(group.key)}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 16px', cursor:'pointer' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:14 }}>{group.icon}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.45)', letterSpacing:'.8px' }}>{group.label}</span>
                </div>
                <span style={{ fontSize:9, color:'rgba(255,255,255,.3)', display:'inline-block', transition:'transform .2s', transform:isOpen?'rotate(180deg)':'rotate(0deg)' }}>▼</span>
              </div>
              <div style={{ maxHeight:isOpen?group.pages.length*36+'px':'0', overflow:'hidden', transition:'max-height .25s ease' }}>
                {group.pages.map(p => {
                  const isActive = activePage===p.key;
                  return (
                    <div key={p.key} onClick={()=>{ onNavigate(p.key); onClose(); }}
                      style={{ display:'flex', alignItems:'center', padding:'7px 16px 7px 32px',
                        cursor:'pointer', fontSize:13, position:'relative',
                        color:isActive?'#fff':'rgba(255,255,255,.55)',
                        fontWeight:isActive?600:400,
                        background:isActive?'rgba(99,102,241,.2)':'transparent' }}
                      onMouseEnter={e=>{ if(!isActive){ e.currentTarget.style.background='rgba(255,255,255,.06)'; e.currentTarget.style.color='rgba(255,255,255,.9)'; }}}
                      onMouseLeave={e=>{ if(!isActive){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,.55)'; }}}>
                      {isActive && <span style={{ position:'absolute', left:18, top:'50%', transform:'translateY(-50%)', width:3, height:16, background:'#818cf8', borderRadius:2 }}/>}
                      {p.icon} <span style={{ marginLeft:8 }}>{p.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Shell({ user, onLogout }) {
  const [activePage, setActivePage] = useState('');
  const [tabs,       setTabs]       = useState([]);
  const [expanded,   setExpanded]   = useState(new Set(['costing','sales','finance','stock']));
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

  const page = PAGE_MAP[activePage];

  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:'system-ui,sans-serif', background:'#f1f5f9' }}>
      <Sidebar user={user} activePage={activePage} onNavigate={openPage}
        expanded={expanded} setExpanded={setExpanded}
        mobileOpen={mobileOpen} onClose={()=>setMobileOpen(false)}/>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        <div style={{ height:52, background:'#fff', borderBottom:'1px solid #e2e8f0',
          display:'flex', alignItems:'center', padding:'0 20px', gap:12, flexShrink:0 }}>
          <button onClick={()=>setMobileOpen(v=>!v)}
            style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#0f2d5a', padding:4 }}>☰</button>
          <div style={{ flex:1, fontSize:15, fontWeight:700, color:'#0f2d5a' }}>
            {page?`${page.icon} ${page.label}`:'GLC Plus'}
          </div>
          <span style={{ fontSize:12, color:'#64748b' }}>{user}</span>
          <button onClick={onLogout}
            style={{ padding:'5px 12px', borderRadius:6, border:'1px solid #e2e8f0',
              background:'#f8fafc', color:'#64748b', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
            Logout
          </button>
        </div>
        <div style={{ display:'flex', alignItems:'center', background:'#f8fafc',
          borderBottom:'1px solid #e2e8f0', padding:'0 12px', overflowX:'auto', minHeight:40, flexShrink:0 }}>
          {tabs.map(key => {
            const p = PAGE_MAP[key];
            const isActive = activePage===key;
            return (
              <div key={key} onClick={()=>setActivePage(key)}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'0 14px', height:40,
                  cursor:'pointer', fontSize:12, fontWeight:isActive?600:500, whiteSpace:'nowrap', flexShrink:0,
                  color:isActive?'#1d4ed8':'#64748b',
                  borderBottom:isActive?'2px solid #1d4ed8':'2px solid transparent',
                  background:isActive?'#fff':'transparent' }}>
                {p.icon} {p.label}
                <button onClick={e=>closeTab(key,e)}
                  style={{ width:16, height:16, borderRadius:'50%', border:'none', background:'none',
                    cursor:'pointer', color:'#94a3b8', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
              </div>
            );
          })}
        </div>
        <div style={{ flex:1, overflow:'auto', padding:28, background:'#f1f5f9' }}>
          {!page ? (
            <div style={{ background:'#fff', borderRadius:16, padding:48, border:'1px solid #e2e8f0', textAlign:'center' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>👈</div>
              <div style={{ fontSize:18, fontWeight:700, color:'#0f2d5a', marginBottom:8 }}>Select a page</div>
              <div style={{ fontSize:13, color:'#94a3b8' }}>Click any item in the sidebar to open it as a tab</div>
            </div>
          ) : (
            <div style={{ background:'#fff', borderRadius:16, padding:40, border:'1px solid #e2e8f0', textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>{page.icon}</div>
              <div style={{ fontSize:20, fontWeight:700, color:'#0f2d5a', marginBottom:8 }}>{page.label}</div>
              <div style={{ fontSize:13, color:'#94a3b8', marginBottom:24 }}>Page content coming soon</div>
              <button style={{ padding:'8px 24px', background:'#1d4ed8', color:'#fff', border:'none',
                borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                🔄 Refresh
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GlcPlus() {
  const [user, setUser] = useState(null);
  if (!user) return <Login onLogin={setUser} />;
  return <Shell user={user} onLogout={()=>setUser(null)} />;
}
