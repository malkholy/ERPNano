import { useState, useEffect, useRef } from "react"
import { apiCall, TYPE_COLORS, guessFormat } from "../../shared/api.js"
import Toggle from "../../shared/Toggle.jsx"
import SearchDropdown from "../../shared/SearchDropdown.jsx"

// ── Views Tab ─────────────────────────────────────────────────────────────────
function NewViewModal({ pageID, fields, onClose, onSaved }) {
  const [viewName,    setViewName]    = useState("")
  const [isDefault,   setIsDefault]   = useState(false)
  const [leftFields,  setLeftFields]  = useState([...fields])
  const [rightFields, setRightFields] = useState([])
  const [leftSearch,  setLeftSearch]  = useState("")
  const [rightSearch, setRightSearch] = useState("")
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState("")
  const dragSrc  = useRef(null)
  const dragFrom = useRef(null)

  const filteredLeft  = leftFields.filter(f  => f.FieldName.toLowerCase().includes(leftSearch.toLowerCase()))
  const filteredRight = rightFields.filter(f => f.FieldName.toLowerCase().includes(rightSearch.toLowerCase()))

  const moveToRight = id => {
    const f = leftFields.find(x => x.FieldID === id || x.FieldName === id)
    if (!f) return
    setLeftFields(prev => prev.filter(x => (x.FieldID || x.FieldName) !== (f.FieldID || f.FieldName)))
    setRightFields(prev => [...prev, f])
  }

  const moveToLeft = id => {
    const f = rightFields.find(x => x.FieldID === id || x.FieldName === id)
    if (!f) return
    setRightFields(prev => prev.filter(x => (x.FieldID || x.FieldName) !== (f.FieldID || f.FieldName)))
    setLeftFields(prev => [...prev, f])
  }

  const addAll    = () => { setRightFields(prev => [...prev, ...leftFields]); setLeftFields([]) }
  const removeAll = () => { setLeftFields(prev => [...prev, ...rightFields]); setRightFields([]) }

  const dragStart = (e, id, from) => {
    dragSrc.current = id; dragFrom.current = from
    e.dataTransfer.effectAllowed = "move"
  }

  const dropOnPanel = (e, panel) => {
    e.preventDefault()
    const id   = dragSrc.current
    const from = dragFrom.current
    if (!id) return
    if (from === "left" && panel === "right") moveToRight(id)
    else if (from === "right" && panel === "left") moveToLeft(id)
    dragSrc.current = null; dragFrom.current = null
  }

  const dropOnItem = (e, targetId, panel) => {
    e.preventDefault(); e.stopPropagation()
    const id   = dragSrc.current
    const from = dragFrom.current
    if (!id) return
    if (from === "left" && panel === "right") {
      const f    = leftFields.find(x => (x.FieldID || x.FieldName) === id)
      if (!f) return
      setLeftFields(prev => prev.filter(x => (x.FieldID || x.FieldName) !== id))
      setRightFields(prev => {
        const idx = prev.findIndex(x => (x.FieldID || x.FieldName) === targetId)
        const arr = [...prev]; arr.splice(idx >= 0 ? idx : arr.length, 0, f); return arr
      })
    } else if (from === "right" && panel === "right") {
      setRightFields(prev => {
        const arr     = [...prev]
        const fromIdx = arr.findIndex(x => (x.FieldID || x.FieldName) === id)
        const toIdx   = arr.findIndex(x => (x.FieldID || x.FieldName) === targetId)
        if (fromIdx < 0 || toIdx < 0) return arr
        const [moved] = arr.splice(fromIdx, 1); arr.splice(toIdx, 0, moved); return arr
      })
    } else if (from === "right" && panel === "left") {
      moveToLeft(id)
    }
    dragSrc.current = null; dragFrom.current = null
  }

  const handleSave = async () => {
    if (!viewName.trim()) { setError("View name is required"); return }
    if (rightFields.length === 0) { setError("Add at least one field to the view"); return }
    setSaving(true); setError("")
    try {
      const d = await apiCall("Save View", {
        PageID:    pageID,
        ViewName:  viewName.trim(),
        IsDefault: isDefault,
        Fields:    rightFields.map((f, i) => ({
          FieldID:   f.FieldID,
          Label:     f.Label || f.FieldName,
          Visible:   true,
          SortOrder: i + 1
        }))
      })
      if (d.State !== 0) { setError(d.Message); return }
      onSaved()
    } catch(e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const panelStyle = { display:"flex", flexDirection:"column", overflow:"hidden", flex:1 }
  const panelHeadStyle = { padding:"10px 14px", background:"#f8fafc", borderBottom:"0.5px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }
  const fieldItemStyle = { display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:7, cursor:"grab", border:"0.5px solid #e2e8f0", background:"#fff", marginBottom:4, userSelect:"none" }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.4)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:14, width:760, maxHeight:"88vh", display:"flex", flexDirection:"column", border:"0.5px solid #e2e8f0", overflow:"hidden" }}>

        {/* Header */}
        <div style={{ padding:"16px 20px", borderBottom:"0.5px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ fontSize:15, fontWeight:600, color:"#1e293b" }}>Create new view</div>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:7, background:"#f1f5f9", border:"none", cursor:"pointer", color:"#64748b", fontSize:14 }}>✕</button>
        </div>

        {/* View name row */}
        <div style={{ padding:"14px 20px", borderBottom:"0.5px solid #e2e8f0", display:"flex", alignItems:"center", gap:16, flexShrink:0 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, fontWeight:500, color:"#94a3b8", letterSpacing:".6px", marginBottom:5 }}>VIEW NAME</div>
            <input value={viewName} onChange={e => { setViewName(e.target.value); setError("") }}
              placeholder="e.g. Sales view, Manager view..."
              style={{ width:"100%", padding:"8px 12px", border:"0.5px solid #e2e8f0", borderRadius:8, fontSize:13, color:"#1e293b", background:"#f8fafc", outline:"none", fontFamily:"inherit" }}/>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, paddingTop:18 }}>
            <input type="checkbox" id="isDefault" checked={isDefault} onChange={e => setIsDefault(e.target.checked)}
              style={{ width:16, height:16, cursor:"pointer", accentColor:"#204066" }}/>
            <label htmlFor="isDefault" style={{ fontSize:13, color:"#1e293b", cursor:"pointer", whiteSpace:"nowrap" }}>Set as default</label>
          </div>
        </div>

        {/* Hint */}
        <div style={{ padding:"8px 20px", background:"#f8fafc", borderBottom:"0.5px solid #e2e8f0", fontSize:11, color:"#94a3b8", flexShrink:0 }}>
          ⠿ Drag fields from <strong style={{ color:"#1e293b" }}>Available</strong> to <strong style={{ color:"#1e293b" }}>View fields</strong> — or use → button · Drag within View fields to reorder
        </div>

        {/* Two panels */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", flex:1, overflow:"hidden", minHeight:0 }}>

          {/* LEFT */}
          <div style={{ ...panelStyle, borderRight:"0.5px solid #e2e8f0" }}>
            <div style={panelHeadStyle}>
              <div style={{ fontSize:12, fontWeight:600, color:"#1e293b" }}>Available fields</div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:11, color:"#94a3b8", background:"#f1f5f9", padding:"2px 8px", borderRadius:20 }}>{leftFields.length}</span>
                <button onClick={addAll} style={{ fontSize:10, padding:"2px 8px", borderRadius:6, border:"0.5px solid rgba(32,64,102,.2)", background:"rgba(32,64,102,.06)", color:"#204066", cursor:"pointer", fontFamily:"inherit" }}>Add all →</button>
              </div>
            </div>
            <div style={{ padding:"8px 10px", borderBottom:"0.5px solid #e2e8f0", flexShrink:0 }}>
              <input value={leftSearch} onChange={e => setLeftSearch(e.target.value)} placeholder="🔍 Search..."
                style={{ width:"100%", padding:"6px 10px", border:"0.5px solid #e2e8f0", borderRadius:7, fontSize:12, color:"#1e293b", background:"#fff", outline:"none", fontFamily:"inherit" }}/>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:8 }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => dropOnPanel(e, "left")}>
              {leftFields.length === 0 ? (
                <div style={{ padding:32, textAlign:"center", color:"#94a3b8", fontSize:13 }}>
                  <div style={{ fontSize:32, marginBottom:8, opacity:.3 }}>✅</div>
                  All fields added
                </div>
              ) : filteredLeft.map(f => {
                const key = f.FieldID || f.FieldName
                const tc  = TYPE_COLORS[f.Format || guessFormat(f.DataType)] || TYPE_COLORS.text
                return (
                  <div key={key} draggable
                    onDragStart={e => dragStart(e, key, "left")}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => dropOnItem(e, key, "left")}
                    style={fieldItemStyle}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(32,64,102,.25)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}>
                    <div style={{ display:"flex", flexDirection:"column", gap:2, opacity:.3, flexShrink:0 }}>
                      {[0,1,2].map(r => <div key={r} style={{ display:"flex", gap:2 }}>{[0,1].map(c => <div key={c} style={{ width:3, height:3, borderRadius:"50%", background:"#64748b" }}/>)}</div>)}
                    </div>
                    <div style={{ fontSize:12, fontWeight:500, color:"#1e293b", fontFamily:"monospace", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.FieldName}</div>
                    <span style={{ fontSize:10, padding:"2px 7px", borderRadius:20, background:tc.bg, color:tc.color, flexShrink:0 }}>{f.Format || guessFormat(f.DataType)}</span>
                    <button onClick={() => moveToRight(key)} style={{ width:22, height:22, borderRadius:5, border:"0.5px solid #e2e8f0", background:"#f8fafc", color:"#64748b", fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>→</button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT */}
          <div style={panelStyle}>
            <div style={panelHeadStyle}>
              <div style={{ fontSize:12, fontWeight:600, color:"#1e293b" }}>View fields</div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:11, color:"#94a3b8", background:"#f1f5f9", padding:"2px 8px", borderRadius:20 }}>{rightFields.length}</span>
                <button onClick={removeAll} style={{ fontSize:10, padding:"2px 8px", borderRadius:6, border:"0.5px solid rgba(239,68,68,.2)", background:"rgba(239,68,68,.04)", color:"#dc2626", cursor:"pointer", fontFamily:"inherit" }}>← Remove all</button>
              </div>
            </div>
            <div style={{ padding:"8px 10px", borderBottom:"0.5px solid #e2e8f0", flexShrink:0 }}>
              <input value={rightSearch} onChange={e => setRightSearch(e.target.value)} placeholder="🔍 Search..."
                style={{ width:"100%", padding:"6px 10px", border:"0.5px solid #e2e8f0", borderRadius:7, fontSize:12, color:"#1e293b", background:"#fff", outline:"none", fontFamily:"inherit" }}/>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:8 }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => dropOnPanel(e, "right")}>
              {rightFields.length === 0 ? (
                <div style={{ padding:32, textAlign:"center", color:"#94a3b8", fontSize:13 }}>
                  <div style={{ fontSize:32, marginBottom:8, opacity:.3 }}>👈</div>
                  Drag fields here or click →
                </div>
              ) : filteredRight.map((f, i) => {
                const key = f.FieldID || f.FieldName
                const tc  = TYPE_COLORS[f.Format || guessFormat(f.DataType)] || TYPE_COLORS.text
                return (
                  <div key={key} draggable
                    onDragStart={e => dragStart(e, key, "right")}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => dropOnItem(e, key, "right")}
                    style={fieldItemStyle}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,.3)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}>
                    <span style={{ fontSize:11, color:"#94a3b8", background:"#f8fafc", border:"0.5px solid #e2e8f0", borderRadius:20, padding:"2px 7px", fontWeight:600, flexShrink:0 }}>#{i+1}</span>
                    <div style={{ display:"flex", flexDirection:"column", gap:2, opacity:.3, flexShrink:0 }}>
                      {[0,1,2].map(r => <div key={r} style={{ display:"flex", gap:2 }}>{[0,1].map(c => <div key={c} style={{ width:3, height:3, borderRadius:"50%", background:"#64748b" }}/>)}</div>)}
                    </div>
                    <div style={{ fontSize:12, fontWeight:500, color:"#1e293b", fontFamily:"monospace", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.FieldName}</div>
                    <span style={{ fontSize:10, padding:"2px 7px", borderRadius:20, background:tc.bg, color:tc.color, flexShrink:0 }}>{f.Format || guessFormat(f.DataType)}</span>
                    <button onClick={() => moveToLeft(key)} style={{ width:22, height:22, borderRadius:5, border:"0.5px solid rgba(239,68,68,.2)", background:"rgba(239,68,68,.04)", color:"#dc2626", fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>←</button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:"14px 20px", borderTop:"0.5px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ fontSize:12, color: error ? "#dc2626" : "#94a3b8" }}>{error ? `⚠️ ${error}` : `${rightFields.length} field${rightFields.length !== 1 ? "s" : ""} in view`}</div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onClose} style={{ padding:"8px 16px", borderRadius:8, border:"0.5px solid #e2e8f0", background:"#fff", color:"#64748b", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            <button onClick={handleSave} disabled={saving}
              style={{ padding:"8px 16px", borderRadius:8, border:"none",
                background: saving ? "rgba(32,64,102,.4)" : "#204066",
                color:"#fff", fontSize:13, fontWeight:500, cursor: saving ? "not-allowed" : "pointer", fontFamily:"inherit" }}>
              {saving ? "Saving..." : "💾 Save view"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ViewsTab({ pageID, fields }) {
  const [views,       setViews]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState("")
  const [showNew,     setShowNew]     = useState(false)
  const [expanded,    setExpanded]    = useState(null)
  const [viewFields,  setViewFields]  = useState({})

  const fetchViews = async () => {
    if (!pageID) return
    setLoading(true)
    try {
      const d = await apiCall("Get Page Views", { PageID: pageID })
      if (d.State === 0) setViews(d.List0 ?? [])
      else setError(d.Message)
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchViews() }, [pageID])

  const toggleExpand = async viewId => {
    if (expanded === viewId) { setExpanded(null); return }
    setExpanded(viewId)
    if (!viewFields[viewId]) {
      try {
        const d = await apiCall("Get View Fields", { ViewID: viewId })
        if (d.State === 0) setViewFields(prev => ({ ...prev, [viewId]: d.List0 ?? [] }))
      } catch(e) {}
    }
  }

  const setDefault = async (viewId) => {
    try {
      await apiCall("Set Default View", { PageID: pageID, ViewID: viewId })
      fetchViews()
    } catch(e) {}
  }

  const deleteView = async (viewId) => {
    try {
      await apiCall("Delete View", { ViewID: viewId })
      fetchViews()
    } catch(e) {}
  }

  if (!pageID) return (
    <div style={{ padding:32, textAlign:"center", color:"#94a3b8", fontSize:13 }}>
      Save the page first to manage views
    </div>
  )

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:500, color:"#1e293b" }}>Views</div>
          <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>Named column configurations — users can switch at runtime</div>
        </div>
        <button onClick={() => setShowNew(true)}
          style={{ padding:"6px 14px", background:"#204066", border:"none", borderRadius:8, color:"#fff", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
          + New view
        </button>
      </div>

      {error && <div style={{ background:"rgba(239,68,68,.1)", border:"0.5px solid rgba(239,68,68,.25)", borderRadius:8, padding:"8px 12px", color:"#dc2626", fontSize:12, marginBottom:12 }}>⚠️ {error}</div>}

      {loading ? (
        <div style={{ padding:24, textAlign:"center", fontSize:13, color:"#94a3b8" }}>Loading views...</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {views.length === 0 && (
            <div style={{ padding:32, textAlign:"center", color:"#94a3b8", fontSize:13, border:"1.5px dashed rgba(32,64,102,.2)", borderRadius:10, background:"rgba(32,64,102,.02)" }}>
              <div style={{ fontSize:28, marginBottom:8, opacity:.3 }}>👁</div>
              No views yet — create one to give users different column configurations
            </div>
          )}
          {views.map(v => (
            <div key={v.ViewID} style={{ background: v.IsDefault ? "rgba(32,64,102,.03)" : "#f8fafc", border:`0.5px solid ${v.IsDefault ? "rgba(32,64,102,.25)" : "#e2e8f0"}`, borderRadius:10, overflow:"hidden" }}>
              <div style={{ padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"#1e293b" }}>{v.ViewName}</div>
                    {v.IsDefault ? <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:"#204066", color:"#fff", fontWeight:500 }}>DEFAULT</span> : null}
                  </div>
                  <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{v.FieldCount || 0} fields · {v.CreatedBy} · {v.CreatedDate ? new Date(v.CreatedDate).toLocaleDateString() : ""}</div>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  {!v.IsDefault && <button onClick={() => setDefault(v.ViewID)} style={{ padding:"4px 10px", borderRadius:6, border:"0.5px solid #e2e8f0", background:"#fff", color:"#64748b", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>Set default</button>}
                  <button onClick={() => toggleExpand(v.ViewID)} style={{ padding:"4px 10px", borderRadius:6, border:"0.5px solid rgba(32,64,102,.2)", background:"rgba(32,64,102,.06)", color:"#204066", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
                    {expanded === v.ViewID ? "Hide ▲" : "Fields ▾"}
                  </button>
                  {!v.IsDefault && <button onClick={() => deleteView(v.ViewID)} style={{ padding:"4px 10px", borderRadius:6, border:"0.5px solid rgba(239,68,68,.25)", background:"rgba(239,68,68,.06)", color:"#dc2626", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>Delete</button>}
                </div>
              </div>
              {expanded === v.ViewID && (
                <div style={{ borderTop:"0.5px solid #e2e8f0", padding:"10px 16px" }}>
                  {!viewFields[v.ViewID] ? (
                    <div style={{ fontSize:12, color:"#94a3b8" }}>Loading...</div>
                  ) : viewFields[v.ViewID].map((f, i) => {
                    const tc = TYPE_COLORS[f.Format] || TYPE_COLORS.text
                    return (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 8px", borderRadius:6, marginBottom:3 }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,.02)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <span style={{ fontSize:11, color:"#94a3b8", width:24, textAlign:"right", flexShrink:0 }}>#{i+1}</span>
                        <div style={{ fontSize:12, color:"#64748b", fontFamily:"monospace", flex:1 }}>{f.FieldName}</div>
                        <span style={{ fontSize:10, padding:"2px 7px", borderRadius:20, background:tc.bg, color:tc.color }}>{f.Format || "text"}</span>
                        <div style={{ fontSize:12, color:"#1e293b", width:120 }}>{f.Label || f.FieldName}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}

          <div onClick={() => setShowNew(true)}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:14, border:"1.5px dashed rgba(32,64,102,.25)", borderRadius:10, cursor:"pointer", color:"#204066", fontSize:13, fontWeight:500, background:"rgba(32,64,102,.03)" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(32,64,102,.07)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(32,64,102,.03)"}>
            + Create new view
          </div>
        </div>
      )}

      {showNew && (
        <NewViewModal
          pageID={pageID}
          fields={fields}
          onClose={() => setShowNew(false)}
          onSaved={() => { setShowNew(false); fetchViews() }}
        />
      )}
    </div>
  )
}

// ── Main Form ─────────────────────────────────────────────────────────────────
export default function PageForm({ databases, onBack, onSaved, editData }) {
  const [activeTab,     setActiveTab]     = useState("fields")
  const [selDB,         setSelDB]         = useState(editData?.DatabaseName || "")
  const [selSchema,     setSelSchema]     = useState(editData?.SchemaName || "")
  const [selTable,      setSelTable]      = useState(editData?.TableName || "")
  const [schemas,       setSchemas]       = useState([])
  const [tables,        setTables]        = useState([])
  const [fields,        setFields]        = useState([])
  const [pageName,      setPageName]      = useState(editData?.PageName || "")
  const [pageIcon,      setPageIcon]      = useState(editData?.Icon || "📄")
  const [loadingDD,     setLoadingDD]     = useState("")
  const [saving,        setSaving]        = useState(false)
  const [error,         setError]         = useState("")
  const [aiLoading,     setAiLoading]     = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState([])

  useEffect(() => {
    if (!editData) return
    const loadAll = async () => {
      try {
        const pgRes = await apiCall("Get Page", { PageID: editData.PageID })
        const pg    = pgRes.List0?.[0] || editData
        const db     = pg.DatabaseName || ""
        const schema = pg.SchemaName   || ""
        const table  = pg.TableName    || ""
        setPageName(pg.PageName || "")
        setPageIcon(pg.Icon     || "📄")
        if (db) {
          const schRes = await apiCall("Get Schemas", { DatabaseName: db })
          if (schRes.State === 0) setSchemas(schRes.List0 ?? [])
        }
        if (db && schema) {
          const tblRes = await apiCall("Get Tables", { DatabaseName: db, SchemaName: schema })
          if (tblRes.State === 0) setTables(tblRes.List0 ?? [])
        }
        const fldRes = await apiCall("Get Page Fields", { PageID: editData.PageID })
        if (fldRes.State === 0) setFields(fldRes.List0 ?? [])
        else setError(fldRes.Message)
        setSelDB(db); setSelSchema(schema); setSelTable(table)
      } catch(e) { setError(e.message) }
    }
    loadAll()
  }, [editData?.PageID])

  const selectDB = async db => {
    setSelDB(db); setSelSchema(""); setSelTable(""); setFields([]); setAiSuggestions([])
    setLoadingDD("schemas"); setError("")
    try {
      const d = await apiCall("Get Schemas", { DatabaseName: db })
      if (d.State !== 0) { setError(d.Message); return }
      setSchemas(d.List0 ?? [])
    } catch(e) { setError(e.message) }
    finally { setLoadingDD("") }
  }

  const selectSchema = async schema => {
    setSelSchema(schema); setSelTable(""); setFields([]); setAiSuggestions([])
    setLoadingDD("tables"); setError("")
    try {
      const d = await apiCall("Get Tables", { DatabaseName: selDB, SchemaName: schema })
      if (d.State !== 0) { setError(d.Message); return }
      setTables(d.List0 ?? [])
    } catch(e) { setError(e.message) }
    finally { setLoadingDD("") }
  }

  const selectTable = async table => {
    setSelTable(table); setFields([]); setAiSuggestions([])
    setLoadingDD("fields"); setError("")
    try {
      const d = await apiCall("Get Fields", { DatabaseName: selDB, SchemaName: selSchema, TableName: table })
      if (d.State !== 0) { setError(d.Message); return }
      const enriched = (d.List0 ?? []).map(f => ({
        ...f, Label: f.FieldName, Format: guessFormat(f.DataType),
        Visible: true, Sortable: true, Filterable: false, ColorRules: null,
      }))
      setFields(enriched)
      if (!editData) setPageName(table)
    } catch(e) { setError(e.message) }
    finally { setLoadingDD("") }
  }

  const updateField = (idx, key, val) =>
    setFields(prev => prev.map((f, i) => i === idx ? { ...f, [key]: val } : f))

  const applyAiSuggestion = s => {
    setFields(prev => prev.map(f => {
      if (f.FieldName !== s.FieldName) return f
      return {
        ...f,
        Format:     s.Format  || f.Format,
        Label:      s.Label   || f.Label,
        Visible:    s.Visible !== undefined ? s.Visible : f.Visible,
        ColorRules: s.BadgeColors && Object.keys(s.BadgeColors).length > 0
          ? JSON.stringify(s.BadgeColors) : f.ColorRules,
      }
    }))
  }

  const applyAllSuggestions = () => { aiSuggestions.forEach(s => applyAiSuggestion(s)); setAiSuggestions([]) }

  const handleAiSuggest = async () => {
    setAiLoading(true); setAiSuggestions([]); setError("")
    try {
      const selectedFields = fields.filter(f => f.Visible !== false)
      const fieldsText = selectedFields.map(f => `- ${f.FieldName} (${f.DataType})`).join("\n")
      const res = await fetch("https://sila.silasystem.com:7300/api/claude/suggest", {
        method: "POST", headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ Fields: fieldsText, TableName: selTable })
      })
      const data = await res.json()
      if (data.state !== 0 && data.State !== 0) { setError(data.message || data.Message); return }
      const raw = data.suggestions || data.Suggestions || "[]"
      let suggestions = []
      try { suggestions = JSON.parse(raw) }
      catch { try { suggestions = JSON.parse(raw.substring(0, raw.lastIndexOf("}") + 1) + "]") } catch { setError("Could not parse AI response."); return } }
      setAiSuggestions(suggestions)
    } catch(e) { setError("AI suggest failed: " + e.message) }
    finally { setAiLoading(false) }
  }

  const handleSave = async () => {
    if (!pageName.trim()) { setError("Page name is required"); return }
    if (!selTable)        { setError("Please select a table"); return }
    setSaving(true); setError("")
    try {
      const lineData = {
        PageName: pageName.trim(), Icon: pageIcon,
        DatabaseName: selDB, SchemaName: selSchema, TableName: selTable,
        Fields: fields.filter(f => f.Visible !== false),
        ...(editData ? { PageID: editData.PageID } : {}),
      }
      const d = await apiCall(editData ? "Update Page Setup" : "Save Page Setup", lineData)
      if (d.State !== 0) { setError(d.Message); return }
      onSaved()
    } catch(e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const isEdit    = !!editData
  const saveLabel = isEdit ? "Update page" : "Save page"

  return (
    <div style={{ display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div style={{ fontSize:13, display:"flex", alignItems:"center", gap:8 }}>
          <span onClick={onBack} style={{ cursor:"pointer", color:"#204066", fontWeight:600 }}>📄 Page master</span>
          <span style={{ color:"#cbd5e1", fontSize:16 }}>›</span>
          <span style={{ color:"#1e293b", fontWeight:600 }}>{pageName || "New page"}</span>
          {isEdit && <><span style={{ color:"#cbd5e1", fontSize:16 }}>›</span><span style={{ color:"#64748b" }}>Edit</span></>}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={onBack} style={{ padding:"7px 16px", borderRadius:8, border:"0.5px solid rgba(0,0,0,.1)", background:"transparent", color:"#64748b", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || !fields.length}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 20px",
              background: saving || !fields.length ? "rgba(32,64,102,.4)" : "#204066",
              border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:500,
              cursor: saving || !fields.length ? "not-allowed" : "pointer", fontFamily:"inherit" }}>
            💾 {saving ? "Saving..." : saveLabel}
          </button>
        </div>
      </div>

      <div style={{ background:"#ffffff", border:"0.5px solid #e2e8f0", borderRadius:14 }}>

        {/* Page name + dropdowns */}
        <div style={{ padding:20, borderBottom:"0.5px solid #e2e8f0" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 60px", gap:10, marginBottom:16 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <div style={{ fontSize:10, fontWeight:500, color:"#94a3b8", letterSpacing:".6px" }}>PAGE NAME</div>
              <input value={pageName} onChange={e => setPageName(e.target.value)} placeholder="Enter page name"
                style={{ padding:"9px 12px", background:"rgba(0,0,0,.05)", border:"0.5px solid rgba(0,0,0,.1)", borderRadius:8, color:"#1e293b", fontSize:13, fontFamily:"inherit", outline:"none" }}/>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <div style={{ fontSize:10, fontWeight:500, color:"#94a3b8", letterSpacing:".6px" }}>ICON</div>
              <input value={pageIcon} onChange={e => setPageIcon(e.target.value)}
                style={{ padding:"9px 8px", background:"rgba(0,0,0,.05)", border:"0.5px solid rgba(0,0,0,.1)", borderRadius:8, color:"#1e293b", fontSize:18, textAlign:"center", fontFamily:"inherit", outline:"none" }}/>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, alignItems:"start" }}>
            <SearchDropdown label="DATABASE" value={selDB} options={databases} labelKey="DatabaseName" placeholder="Select database..." onChange={selectDB}/>
            <SearchDropdown label="SCHEMA" value={selSchema} options={schemas} labelKey="SchemaName"
              placeholder={loadingDD==="schemas" ? "Loading..." : selDB ? "Select schema..." : "Select database first..."}
              disabled={!selDB || loadingDD==="schemas"} onChange={selectSchema}/>
            <SearchDropdown label="TABLE / VIEW" value={selTable} options={tables} labelKey="TableName"
              placeholder={loadingDD==="tables" ? "Loading..." : selSchema ? "Select table..." : "Select schema first..."}
              disabled={!selSchema || loadingDD==="tables"} onChange={selectTable}/>
          </div>
        </div>

        {/* Inner tabs */}
        <div style={{ display:"flex", borderBottom:"0.5px solid #e2e8f0", padding:"0 20px" }}>
          {["fields","views"].map(tab => (
            <div key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding:"12px 18px", fontSize:13, cursor:"pointer",
                borderBottom: activeTab === tab ? "2px solid #4f46e5" : "2px solid transparent",
                color: activeTab === tab ? "#4f46e5" : "#94a3b8",
                fontWeight: activeTab === tab ? 500 : 400,
                textTransform:"capitalize" }}>
              {tab === "fields" ? "Fields" : "Views"}
            </div>
          ))}
        </div>

        {/* Fields tab */}
        {activeTab === "fields" && (
          <div style={{ padding:20 }}>
            {error && <div style={{ background:"rgba(239,68,68,.1)", border:"0.5px solid rgba(239,68,68,.25)", borderRadius:8, padding:"8px 12px", color:"#dc2626", fontSize:12, marginBottom:12 }}>⚠️ {error}</div>}
            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontSize:13, fontWeight:500, color:"#1e293b" }}>Fields</div>
                <div style={{ fontSize:11, color:"#64748b" }}>
                  {loadingDD==="fields" ? "⏳ Loading..." : fields.length > 0 ? `${fields.length} fields found` : "Select a table to load fields"}
                </div>
              </div>
              <div style={{ background:"#f8fafc", border:"0.5px solid #e2e8f0", borderRadius:10, overflow:"hidden" }}>
                <div style={{ display:"grid", gridTemplateColumns:"80px 160px 80px 60px 110px 130px 60px 60px 60px", padding:"9px 12px", alignItems:"center", background:"#f8fafc", borderBottom:"1px solid #e2e8f0" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div onClick={() => setFields(prev => prev.map(f => ({...f, Visible:true})))} style={{ fontSize:10, color:"#818cf8", cursor:"pointer", padding:"2px 6px", borderRadius:4, border:"0.5px solid rgba(129,140,248,.3)", background:"rgba(99,102,241,.08)" }}>All</div>
                    <div onClick={() => setFields(prev => prev.map(f => ({...f, Visible:false})))} style={{ fontSize:10, color:"#64748b", cursor:"pointer", padding:"2px 6px", borderRadius:4, border:"0.5px solid rgba(0,0,0,.1)", background:"rgba(0,0,0,.04)" }}>None</div>
                  </div>
                  {["FIELD","DATA TYPE","LENGTH","FORMAT","LABEL","VIS","SORT","FILTER"].map((h,i) => (
                    <div key={i} style={{ fontSize:11, fontWeight:600, color:"#64748b", letterSpacing:".5px" }}>{h}</div>
                  ))}
                </div>
                <div style={{ maxHeight:320, overflowY:"auto" }}>
                  {fields.length === 0 ? (
                    <div style={{ padding:"32px", textAlign:"center", fontSize:13, color:"#94a3b8" }}>
                      {loadingDD === "fields" ? "Loading fields..." : "No fields loaded yet"}
                    </div>
                  ) : fields.map((f, i) => {
                    const tc = TYPE_COLORS[f.Format] || TYPE_COLORS.text
                    return (
                      <div key={i} style={{ display:"grid", gridTemplateColumns:"28px 160px 80px 60px 110px 130px 60px 60px 60px", padding:"10px 12px", alignItems:"center", borderBottom:"0.5px solid #f1f5f9" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,.02)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <div onClick={() => updateField(i, "Visible", !f.Visible)}
                          style={{ width:14, height:14, borderRadius:3, cursor:"pointer",
                            border:`0.5px solid ${f.Visible ? "rgba(129,140,248,.4)" : "rgba(0,0,0,.12)"}`,
                            background: f.Visible ? "rgba(99,102,241,.12)" : "rgba(0,0,0,.04)",
                            display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {f.Visible && <span style={{ fontSize:9, color:"#818cf8" }}>✓</span>}
                        </div>
                        <div style={{ fontSize:13, color:"#1e293b", fontFamily:"monospace", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.FieldName}</div>
                        <div style={{ fontSize:12, color:"#64748b", fontFamily:"monospace" }}>{f.DataType || "—"}</div>
                        <div style={{ fontSize:12, color:"#94a3b8" }}>{f.MaxLength || "—"}</div>
                        <select value={f.Format} onChange={e => updateField(i, "Format", e.target.value)}
                          style={{ fontSize:12, padding:"3px 8px", borderRadius:20, background:tc.bg, color:tc.color, border:"none", outline:"none", cursor:"pointer", fontFamily:"inherit", width:"100%", fontWeight:500 }}>
                          {Object.keys(TYPE_COLORS).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input value={f.Label} onChange={e => updateField(i, "Label", e.target.value)}
                          style={{ fontSize:12, padding:"4px 8px", background:"#fff", border:"0.5px solid #e2e8f0", borderRadius:6, color:"#1e293b", fontFamily:"inherit", outline:"none", width:"100%", boxSizing:"border-box" }}/>
                        <Toggle on={f.Visible}    onChange={v => updateField(i, "Visible", v)}/>
                        <Toggle on={f.Sortable}   onChange={v => updateField(i, "Sortable", v)}/>
                        <Toggle on={f.Filterable} onChange={v => updateField(i, "Filterable", v)}/>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ marginTop:14, padding:"12px 16px", background:"rgba(99,102,241,.07)", border:"0.5px solid rgba(129,140,248,.2)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:"rgba(99,102,241,.12)", border:"0.5px solid rgba(129,140,248,.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>✦</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:500, color:"#1e293b" }}>AI field suggestions</div>
                    <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>Claude will analyze your fields and suggest types, labels and badge colors</div>
                  </div>
                </div>
                <button onClick={handleAiSuggest} disabled={aiLoading}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, background:"rgba(99,102,241,.12)", border:"0.5px solid rgba(129,140,248,.3)", color:"#818cf8", fontSize:12, fontWeight:500, cursor: aiLoading ? "not-allowed" : "pointer", whiteSpace:"nowrap", flexShrink:0, fontFamily:"inherit" }}>
                  {aiLoading ? "⏳ Thinking..." : "✦ Suggest"}
                </button>
              </div>

              {aiSuggestions.length > 0 && (
                <div style={{ marginTop:10, background:"rgba(129,140,248,.05)", border:"0.5px solid rgba(129,140,248,.15)", borderRadius:8, padding:"10px 14px" }}>
                  <div style={{ fontSize:11, color:"#818cf8", marginBottom:8, fontWeight:500 }}>✦ AI suggestions — click to apply</div>
                  {aiSuggestions.map((s, i) => {
                    const tc = TYPE_COLORS[s.Format] || TYPE_COLORS.text
                    return (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0", borderBottom:"0.5px solid #f1f5f9", flexWrap:"wrap" }}>
                        <div style={{ fontSize:12, color:"#64748b", fontFamily:"monospace", width:120, flexShrink:0 }}>{s.FieldName}</div>
                        <span style={{ fontSize:10, color:"#94a3b8" }}>→</span>
                        <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:tc.bg, color:tc.color }}>{s.Format}</span>
                        {s.BadgeColors && Object.keys(s.BadgeColors).length > 0 && (
                          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                            {Object.entries(s.BadgeColors).map(([k, v]) => (
                              <span key={k} style={{ fontSize:10, padding:"2px 8px", borderRadius:20,
                                background: v==="green" ? "rgba(29,78,56,.15)" : v==="red" ? "rgba(239,68,68,.1)" : v==="amber" ? "rgba(245,158,11,.1)" : "rgba(0,0,0,.07)",
                                color: v==="green" ? "#16a34a" : v==="red" ? "#dc2626" : v==="amber" ? "#d97706" : "#64748b" }}>
                                {k}={v}
                              </span>
                            ))}
                          </div>
                        )}
                        {s.Reason && <div style={{ fontSize:11, color:"#64748b", flex:1 }}>{s.Reason}</div>}
                        <button onClick={() => applyAiSuggestion(s)} style={{ marginLeft:"auto", padding:"2px 10px", borderRadius:6, fontSize:10, border:"0.5px solid rgba(129,140,248,.3)", background:"rgba(99,102,241,.1)", color:"#818cf8", cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>Apply</button>
                      </div>
                    )
                  })}
                  <div style={{ display:"flex", justifyContent:"flex-end", marginTop:10 }}>
                    <button onClick={applyAllSuggestions} style={{ padding:"5px 14px", borderRadius:7, fontSize:11, border:"none", background:"#204066", color:"#fff", cursor:"pointer", fontWeight:500, fontFamily:"inherit" }}>Apply all</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Views tab */}
        {activeTab === "views" && (
          <div style={{ padding:20 }}>
            {!editData?.PageID ? (
              <div style={{ padding:48, textAlign:"center", color:"#94a3b8", fontSize:13,
                border:"1.5px dashed rgba(32,64,102,.2)", borderRadius:10, background:"rgba(32,64,102,.02)" }}>
                <div style={{ fontSize:28, marginBottom:8, opacity:.3 }}>💾</div>
                Save the page first to manage views
              </div>
            ) : (
              <ViewsTab pageID={editData.PageID} fields={fields} />
            )}
          </div>
        )}

        <div style={{ padding:"14px 20px", borderTop:"0.5px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:12, color:"#64748b" }}>ℹ️ Label is editable after save</div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onBack} style={{ padding:"7px 16px", borderRadius:8, border:"0.5px solid rgba(0,0,0,.1)", background:"transparent", color:"#64748b", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            <button onClick={handleSave} disabled={saving || !fields.length}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 20px",
                background: saving || !fields.length ? "rgba(32,64,102,.4)" : "#204066",
                border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:500,
                cursor: saving || !fields.length ? "not-allowed" : "pointer", fontFamily:"inherit" }}>
              💾 {saving ? "Saving..." : saveLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
