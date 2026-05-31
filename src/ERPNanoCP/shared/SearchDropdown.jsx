import { useState } from "react"
export default function SearchDropdown({ label, value, options, labelKey, onChange, placeholder, disabled }) {
  const [open,   setOpen]   = useState(false)
  const [search, setSearch] = useState("")
  const selected = options.find(o => o[labelKey] === value) || (value ? { [labelKey]: value } : null)
  const filtered = options.filter(o => o[labelKey]?.toLowerCase().includes(search.toLowerCase()))
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6, position:"relative" }}>
      <div style={{ fontSize:10, fontWeight:500, color:"#94a3b8", letterSpacing:".6px" }}>{label}</div>
      <div onClick={() => !disabled && setOpen(v => !v)}
        style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 12px",
          background: disabled ? "rgba(0,0,0,.02)" : selected ? "rgba(99,102,241,.07)" : "rgba(0,0,0,.05)",
          border: `0.5px solid ${selected ? "rgba(129,140,248,.4)" : "rgba(0,0,0,.1)"}`,
          borderRadius:8, cursor: disabled ? "not-allowed" : "pointer" }}>
        <span style={{ fontSize:13, color: selected ? "#4f46e5" : "#94a3b8" }}>
          {selected ? selected[labelKey] : placeholder}
        </span>
        <span style={{ fontSize:10, color: selected ? "#818cf8" : "#94a3b8",
          display:"inline-block", transform: open ? "rotate(180deg)" : "none", transition:"transform .2s" }}>▼</span>
      </div>
      {open && !disabled && (
        <>
          <div onClick={() => setOpen(false)} style={{ position:"fixed", inset:0, zIndex:49 }}/>
          <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:50,
            background:"#f8fafc", border:"0.5px solid #e2e8f0", borderRadius:8, overflow:"hidden", maxHeight:220 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px",
              borderBottom:"0.5px solid #e2e8f0", background:"rgba(0,0,0,.03)" }}>
              <span style={{ fontSize:13, color:"#64748b" }}>🔍</span>
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                style={{ flex:1, background:"none", border:"none", outline:"none", fontSize:12, color:"#1e293b", fontFamily:"inherit" }}/>
            </div>
            <div style={{ overflowY:"auto", maxHeight:170 }}>
              {filtered.map((opt, i) => (
                <div key={i} onClick={() => { onChange(opt[labelKey]); setOpen(false); setSearch("") }}
                  style={{ padding:"9px 12px", fontSize:13, cursor:"pointer",
                    color: opt[labelKey] === value ? "#4f46e5" : "#1e293b",
                    background: opt[labelKey] === value ? "rgba(99,102,241,.1)" : "transparent",
                    display:"flex", alignItems:"center", justifyContent:"space-between" }}
                  onMouseEnter={e => { if (opt[labelKey] !== value) e.currentTarget.style.background = "rgba(0,0,0,.05)" }}
                  onMouseLeave={e => { if (opt[labelKey] !== value) e.currentTarget.style.background = "transparent" }}>
                  {opt[labelKey]}
                  {opt.TableType && <span style={{ fontSize:10, color:"#64748b" }}>{opt.TableType === "VIEW" ? "view" : "table"}</span>}
                </div>
              ))}
              {filtered.length === 0 && <div style={{ padding:"12px", fontSize:12, color:"#64748b", textAlign:"center" }}>No results</div>}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
