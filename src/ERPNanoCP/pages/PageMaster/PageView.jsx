import { useState, useEffect } from "react"
import { apiCall, TYPE_COLORS } from "../../shared/api.js"

export default function PageView({ page, onBack }) {
  const [fields,  setFields]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  useEffect(() => {
    apiCall("Get Page Fields", { PageID: page.PageID })
      .then(d => { if (d.State === 0) setFields(d.List0 ?? []); else setError(d.Message) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [page.PageID])

  const chk = val => ({
    display:"inline-flex", width:16, height:16, borderRadius:3,
    alignItems:"center", justifyContent:"center",
    background: val ? "rgba(32,64,102,.1)" : "rgba(0,0,0,.04)",
    border:`0.5px solid ${val ? "rgba(32,64,102,.25)" : "rgba(0,0,0,.1)"}`,
    fontSize:10, color: val ? "#204066" : "#94a3b8",
  })

  return (
    <div style={{ display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:13, marginBottom:8, display:"flex", alignItems:"center", gap:8 }}>
            <span onClick={onBack} style={{ cursor:"pointer", color:"#204066", fontWeight:600 }}>📄 Page master</span>
            <span style={{ color:"#cbd5e1", fontSize:16 }}>›</span>
            <span style={{ color:"#1e293b", fontWeight:600 }}>{page.PageName}</span>
          </div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>
            {[page.DatabaseName, page.SchemaName, page.TableName].filter(Boolean).join(" › ") || "—"}
          </div>
        </div>
        <button onClick={onBack} style={{ padding:"7px 16px", borderRadius:8, border:"0.5px solid rgba(0,0,0,.1)", background:"rgba(0,0,0,.04)", color:"#64748b", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>← Back</button>
      </div>

      <div style={{ background:"#ffffff", border:"0.5px solid #e2e8f0", borderRadius:14, overflow:"hidden" }}>
        <div style={{ padding:"14px 20px", borderBottom:"0.5px solid #e2e8f0", display:"flex", gap:32, flexWrap:"wrap" }}>
          {[
            { label:"PAGE ID",    value: page.PageID },
            { label:"CREATED BY", value: page.CreatedBy || "—" },
            { label:"CREATED",    value: page.CreatedDate ? new Date(page.CreatedDate).toLocaleDateString() : "—" },
            { label:"DATABASE",   value: page.DatabaseName || "—" },
            { label:"SCHEMA",     value: page.SchemaName || "—" },
            { label:"TABLE",      value: page.TableName || "—" },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize:10, fontWeight:500, color:"#94a3b8", letterSpacing:".6px", marginBottom:4 }}>{item.label}</div>
              <div style={{ fontSize:13, color:"#1e293b" }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:20 }}>
          <div style={{ fontSize:13, fontWeight:500, color:"#1e293b", marginBottom:12 }}>
            Fields {!loading && `(${fields.length})`}
          </div>
          {error && <div style={{ background:"rgba(239,68,68,.1)", border:"0.5px solid rgba(239,68,68,.25)", borderRadius:8, padding:"8px 12px", color:"#dc2626", fontSize:12, marginBottom:12 }}>⚠️ {error}</div>}
          <div style={{ background:"#f8fafc", border:"0.5px solid #e2e8f0", borderRadius:10, overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 140px 56px 56px 56px 1fr", padding:"7px 14px", background:"rgba(0,0,0,.03)", borderBottom:"0.5px solid #e2e8f0" }}>
              {["FIELD","FORMAT","LABEL","VIS","SORT","FILTER","COLOR RULES"].map((h,i) => (
                <div key={i} style={{ fontSize:10, fontWeight:500, color:"#94a3b8", letterSpacing:".6px" }}>{h}</div>
              ))}
            </div>
            <div style={{ maxHeight:400, overflowY:"auto" }}>
              {loading ? (
                <div style={{ padding:"24px", textAlign:"center", fontSize:13, color:"#94a3b8" }}>Loading fields…</div>
              ) : fields.length === 0 ? (
                <div style={{ padding:"24px", textAlign:"center", fontSize:13, color:"#94a3b8" }}>No fields found</div>
              ) : fields.map((f, i) => {
                const tc = TYPE_COLORS[f.Format] || TYPE_COLORS.text
                return (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 90px 140px 56px 56px 56px 1fr", padding:"8px 14px", alignItems:"center", borderBottom:"0.5px solid #f1f5f9" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,.02)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ fontSize:12, color:"#64748b", fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.FieldName}</div>
                    <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, width:"fit-content", background:tc.bg, color:tc.color }}>{f.Format || "text"}</span>
                    <div style={{ fontSize:12, color:"#1e293b" }}>{f.Label || f.FieldName}</div>
                    <div><span style={chk(f.Visible)}>{f.Visible ? "✓" : ""}</span></div>
                    <div><span style={chk(f.Sortable)}>{f.Sortable ? "✓" : ""}</span></div>
                    <div><span style={chk(f.Filterable)}>{f.Filterable ? "✓" : ""}</span></div>
                    <div style={{ fontSize:11, color:"#94a3b8", fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.ColorRules || "—"}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
