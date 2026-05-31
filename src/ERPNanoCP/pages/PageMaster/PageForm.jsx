import { useState, useEffect } from "react"
import { apiCall, TYPE_COLORS, guessFormat } from "../../shared/api.js"
import Toggle from "../../shared/Toggle.jsx"
import SearchDropdown from "../../shared/SearchDropdown.jsx"

export default function PageForm({ databases, onBack, onSaved, editData }) {
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
        <div style={{ padding:20 }}>
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

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:18, alignItems:"start" }}>
            <SearchDropdown label="DATABASE" value={selDB} options={databases} labelKey="DatabaseName" placeholder="Select database..." onChange={selectDB}/>
            <SearchDropdown label="SCHEMA" value={selSchema} options={schemas} labelKey="SchemaName"
              placeholder={loadingDD==="schemas" ? "Loading..." : selDB ? "Select schema..." : "Select database first..."}
              disabled={!selDB || loadingDD==="schemas"} onChange={selectSchema}/>
            <SearchDropdown label="TABLE / VIEW" value={selTable} options={tables} labelKey="TableName"
              placeholder={loadingDD==="tables" ? "Loading..." : selSchema ? "Select table..." : "Select schema first..."}
              disabled={!selSchema || loadingDD==="tables"} onChange={selectTable}/>
          </div>

          {error && <div style={{ background:"rgba(239,68,68,.1)", border:"0.5px solid rgba(239,68,68,.25)", borderRadius:8, padding:"8px 12px", color:"#dc2626", fontSize:12, marginBottom:12 }}>⚠️ {error}</div>}

          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div style={{ fontSize:13, fontWeight:500, color:"#1e293b" }}>Fields</div>
              <div style={{ fontSize:11, color:"#64748b" }}>
                {loadingDD==="fields" ? "⏳ Loading..." : fields.length > 0 ? `${fields.length} fields found` : "Select a table to load fields"}
              </div>
            </div>
            <div style={{ background:"#f8fafc", border:"0.5px solid #e2e8f0", borderRadius:10, overflow:"hidden" }}>
              <div style={{ display:"grid", gridTemplateColumns:"80px 180px 110px 140px 72px 72px 72px", padding:"9px 12px", alignItems:"center", background:"#f8fafc", borderBottom:"1px solid #e2e8f0" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div onClick={() => setFields(prev => prev.map(f => ({...f, Visible:true})))} style={{ fontSize:10, color:"#818cf8", cursor:"pointer", padding:"2px 6px", borderRadius:4, border:"0.5px solid rgba(129,140,248,.3)", background:"rgba(99,102,241,.08)" }}>All</div>
                  <div onClick={() => setFields(prev => prev.map(f => ({...f, Visible:false})))} style={{ fontSize:10, color:"#64748b", cursor:"pointer", padding:"2px 6px", borderRadius:4, border:"0.5px solid rgba(0,0,0,.1)", background:"rgba(0,0,0,.04)" }}>None</div>
                </div>
                {["FIELD","TYPE","LABEL","VIS","SORT","FILTER"].map((h,i) => (
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
                    <div key={i} style={{ display:"grid", gridTemplateColumns:"28px 180px 110px 140px 72px 72px 72px", padding:"10px 12px", alignItems:"center", borderBottom:"0.5px solid #f1f5f9" }}
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
