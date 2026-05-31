import { useState, useEffect } from "react"
import { DataGrid } from "../../shared/components/DataGrid"

const API_URL   = "https://sila.silasystem.com:7103/General/GeneralAPI/"
const BASE_BODY = {
  AppVersionWeb:"225", AppVersionAndroid:"225", AppVersionIos:"225",
  AppVersionDesktop:"225", FireBaseToken:"", PlatForm:"web", deviceID:"", IP:"192.168.1.3"
}

async function apiCall(operation, lineData = null) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Accept":"application/json","content-type":"application/json","Sp_Name":"CP.APICPOperation" },
    body: JSON.stringify({
      ...BASE_BODY,
      Operation: operation,
      LineData:  lineData ? JSON.stringify(lineData) : null,
      User:      sessionStorage.getItem("FullName") || ""
    })
  })
  const d = await res.json()
  console.log(operation, d)
  return d
}

const TYPE_COLORS = {
  text:     { bg:"rgba(99,102,241,.15)",  color:"#818cf8" },
  number:   { bg:"rgba(16,185,129,.15)",  color:"#34d399" },
  date:     { bg:"rgba(245,158,11,.15)",  color:"#fbbf24" },
  badge:    { bg:"rgba(239,68,68,.15)",   color:"#f87171" },
  currency: { bg:"rgba(16,185,129,.15)",  color:"#34d399" },
  avatar:   { bg:"rgba(99,102,241,.12)",  color:"#a78bfa" },
  hidden:   { bg:"rgba(0,0,0,.07)",       color:"#64748b" },
}

function guessFormat(type) {
  if (!type) return "text"
  const t = type.toLowerCase()
  if (["int","bigint","smallint","tinyint","decimal","float","numeric","money"].includes(t)) return "number"
  if (["date","datetime","datetime2","smalldatetime"].includes(t)) return "date"
  if (["bit"].includes(t)) return "badge"
  return "text"
}

function Toggle({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)}
      style={{ width:26, height:14, borderRadius:20, padding:2, cursor:"pointer",
        display:"flex", alignItems:"center",
        justifyContent: on ? "flex-end" : "flex-start",
        background: on ? "#204066" : "rgba(0,0,0,.1)",
        transition:"all .2s", flexShrink:0 }}>
      <div style={{ width:10, height:10, borderRadius:"50%", background:"#fff" }}/>
    </div>
  )
}

function SearchDropdown({ label, value, options, labelKey, onChange, placeholder, disabled, loading }) {
  const [open,   setOpen]   = useState(false)
  const [search, setSearch] = useState("")
  const selected = options.find(o => o[labelKey] === value) || (value ? { [labelKey]: value } : null)
  const filtered = options.filter(o =>
    o[labelKey]?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6, position:"relative" }}>
      <div style={{ fontSize:10, fontWeight:500, color:"#94a3b8", letterSpacing:".6px" }}>
        {label}
      </div>
      <div onClick={() => !disabled && setOpen(v => !v)}
        style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"9px 12px",
          background: disabled ? "rgba(0,0,0,.02)" : selected ? "rgba(99,102,241,.07)" : "rgba(0,0,0,.05)",
          border: `0.5px solid ${selected ? "rgba(129,140,248,.4)" : "rgba(0,0,0,.1)"}`,
          borderRadius:8, cursor: disabled ? "not-allowed" : "pointer" }}>
        <span style={{ fontSize:13, color: selected ? "#4f46e5" : "#94a3b8" }}>
          {loading ? "Loading…" : selected ? selected[labelKey] : placeholder}
        </span>
        <span style={{ fontSize:10, color: selected ? "#818cf8" : "#94a3b8",
          display:"inline-block", transform: open ? "rotate(180deg)" : "none",
          transition:"transform .2s" }}>▼</span>
      </div>

      {open && !disabled && (
        <>
          <div onClick={() => setOpen(false)}
            style={{ position:"fixed", inset:0, zIndex:49 }}/>
          <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:50,
            background:"#f8fafc", border:"0.5px solid #e2e8f0",
            borderRadius:8, overflow:"hidden", maxHeight:220 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8,
              padding:"8px 10px", borderBottom:"0.5px solid #e2e8f0",
              background:"rgba(0,0,0,.03)" }}>
              <span style={{ fontSize:13, color:"#64748b" }}>🔍</span>
              <input autoFocus value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}…`}
                style={{ flex:1, background:"none", border:"none", outline:"none",
                  fontSize:12, color:"#1e293b", fontFamily:"inherit" }}/>
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
                  {opt.TableType && (
                    <span style={{ fontSize:10, color:"#64748b" }}>
                      {opt.TableType === "VIEW" ? "view" : "table"}
                    </span>
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ padding:"12px", fontSize:12, color:"#64748b", textAlign:"center" }}>
                  No results
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function AddPageView({ databases, onBack, onSaved, editData }) {
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
        setSelDB(db)
        setSelSchema(schema)
        setSelTable(table)
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
      const res  = await fetch("https://sila.silasystem.com:7300/api/claude/suggest", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ Fields: fieldsText, TableName: selTable })
      })
      const data = await res.json()
      if (data.state !== 0 && data.State !== 0) { setError(data.message || data.Message); return }
      const raw  = data.suggestions || data.Suggestions || "[]"
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
        PageName:     pageName.trim(),
        Icon:         pageIcon,
        DatabaseName: selDB,
        SchemaName:   selSchema,
        TableName:    selTable,
        Fields:       fields.filter(f => f.Visible !== false),
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
        <div>
          <div style={{ fontSize:13, marginBottom:8, display:"flex", alignItems:"center", gap:8 }}>
            <span onClick={onBack} style={{ cursor:"pointer", color:"#204066", fontWeight:600 }}>
              📄 Page master
            </span>
            <span style={{ color:"#cbd5e1", fontSize:16 }}>›</span>
            <span style={{ color:"#1e293b", fontWeight:600 }}>{pageName || "New page"}</span>
            {isEdit && <>
              <span style={{ color:"#cbd5e1", fontSize:16 }}>›</span>
              <span style={{ color:"#64748b" }}>Edit</span>
            </>}
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={onBack}
            style={{ padding:"7px 16px", borderRadius:8, border:"0.5px solid rgba(0,0,0,.1)",
              background:"transparent", color:"#64748b", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !fields.length}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 20px",
              background: saving || !fields.length ? "rgba(32,64,102,.4)" : "#204066",
              border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:500,
              cursor: saving || !fields.length ? "not-allowed" : "pointer", fontFamily:"inherit" }}>
            💾 {saving ? "Saving…" : saveLabel}
          </button>
        </div>
      </div>

      <div style={{ background:"#ffffff", border:"0.5px solid #e2e8f0", borderRadius:14 }}>
        <div style={{ padding:20 }}>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 60px", gap:10, marginBottom:16 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <div style={{ fontSize:10, fontWeight:500, color:"#94a3b8", letterSpacing:".6px" }}>PAGE NAME</div>
              <input value={pageName} onChange={e => setPageName(e.target.value)}
                placeholder="Enter page name"
                style={{ padding:"9px 12px", background:"rgba(0,0,0,.05)",
                  border:"0.5px solid rgba(0,0,0,.1)", borderRadius:8,
                  color:"#1e293b", fontSize:13, fontFamily:"inherit", outline:"none" }}/>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <div style={{ fontSize:10, fontWeight:500, color:"#94a3b8", letterSpacing:".6px" }}>ICON</div>
              <input value={pageIcon} onChange={e => setPageIcon(e.target.value)}
                style={{ padding:"9px 8px", background:"rgba(0,0,0,.05)",
                  border:"0.5px solid rgba(0,0,0,.1)", borderRadius:8,
                  color:"#1e293b", fontSize:18, textAlign:"center",
                  fontFamily:"inherit", outline:"none" }}/>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:18, alignItems:"start" }}>
            <SearchDropdown label="DATABASE" value={selDB} options={databases} labelKey="DatabaseName"
              placeholder="Select database…" onChange={selectDB}/>
            <SearchDropdown label="SCHEMA" value={selSchema} options={schemas} labelKey="SchemaName"
              placeholder={loadingDD==="schemas" ? "Loading…" : selDB ? "Select schema…" : "Select database first…"}
              disabled={!selDB || loadingDD==="schemas"} onChange={selectSchema}/>
            <SearchDropdown label="TABLE / VIEW" value={selTable} options={tables} labelKey="TableName"
              placeholder={loadingDD==="tables" ? "Loading…" : selSchema ? "Select table…" : "Select schema first…"}
              disabled={!selSchema || loadingDD==="tables"} onChange={selectTable}/>
          </div>

          {error && (
            <div style={{ background:"rgba(239,68,68,.1)", border:"0.5px solid rgba(239,68,68,.25)",
              borderRadius:8, padding:"8px 12px", color:"#dc2626", fontSize:12, marginBottom:12 }}>
              ⚠️ {error}
            </div>
          )}

          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div style={{ fontSize:13, fontWeight:500, color:"#1e293b" }}>Fields</div>
              <div style={{ fontSize:11, color:"#64748b" }}>
                {loadingDD==="fields" ? "⏳ Loading…" : fields.length > 0 ? `${fields.length} fields found` : "Select a table to load fields"}
              </div>
            </div>

            <div style={{ background:"#f8fafc", border:"0.5px solid #e2e8f0", borderRadius:10, overflow:"hidden" }}>
              <div style={{ display:"grid", gridTemplateColumns:"80px 180px 110px 140px 72px 72px 72px",
                padding:"9px 12px", alignItems:"center", background:"#f8fafc",
                borderBottom:"1px solid #e2e8f0" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div onClick={() => setFields(prev => prev.map(f => ({...f, Visible:true})))}
                    style={{ fontSize:10, color:"#818cf8", cursor:"pointer", padding:"2px 6px",
                      borderRadius:4, border:"0.5px solid rgba(129,140,248,.3)",
                      background:"rgba(99,102,241,.08)" }}>All</div>
                  <div onClick={() => setFields(prev => prev.map(f => ({...f, Visible:false})))}
                    style={{ fontSize:10, color:"#64748b", cursor:"pointer", padding:"2px 6px",
                      borderRadius:4, border:"0.5px solid rgba(0,0,0,.1)",
                      background:"rgba(0,0,0,.04)" }}>None</div>
                </div>
                {["FIELD","TYPE","LABEL","VIS","SORT","FILTER"].map((h,i) => (
                  <div key={i} style={{ fontSize:11, fontWeight:600, color:"#64748b", letterSpacing:".5px" }}>{h}</div>
                ))}
              </div>
              <div style={{ maxHeight:320, overflowY:"auto" }}>
                {fields.length === 0 ? (
                  <div style={{ padding:"32px", textAlign:"center", fontSize:13, color:"#94a3b8" }}>
                    {loadingDD === "fields" ? "Loading fields…" : "No fields loaded yet"}
                  </div>
                ) : fields.map((f, i) => {
                  const tc = TYPE_COLORS[f.Format] || TYPE_COLORS.text
                  return (
                    <div key={i} style={{ display:"grid", gridTemplateColumns:"28px 180px 110px 140px 72px 72px 72px",
                      padding:"10px 12px", alignItems:"center", borderBottom:"0.5px solid #f1f5f9" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,.02)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div onClick={() => updateField(i, "Visible", !f.Visible)}
                        style={{ width:14, height:14, borderRadius:3, cursor:"pointer",
                          border:`0.5px solid ${f.Visible ? "rgba(129,140,248,.4)" : "rgba(0,0,0,.12)"}`,
                          background: f.Visible ? "rgba(99,102,241,.12)" : "rgba(0,0,0,.04)",
                          display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {f.Visible && <span style={{ fontSize:9, color:"#818cf8" }}>✓</span>}
                      </div>
                      <div style={{ fontSize:13, color:"#1e293b", fontFamily:"monospace", fontWeight:500,
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.FieldName}</div>
                      <select value={f.Format} onChange={e => updateField(i, "Format", e.target.value)}
                        style={{ fontSize:12, padding:"3px 8px", borderRadius:20,
                          background:tc.bg, color:tc.color, border:"none", outline:"none",
                          cursor:"pointer", fontFamily:"inherit", width:"100%",
                          fontWeight:500 }}>
                        {Object.keys(TYPE_COLORS).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input value={f.Label} onChange={e => updateField(i, "Label", e.target.value)}
                        style={{ fontSize:12, padding:"4px 8px", background:"#fff",
                          border:"0.5px solid #e2e8f0", borderRadius:6, color:"#1e293b",
                          fontFamily:"inherit", outline:"none", width:"100%", boxSizing:"border-box",
                          boxShadow:"0 1px 2px rgba(0,0,0,.04)" }}/>
                      <Toggle on={f.Visible}    onChange={v => updateField(i, "Visible", v)}/>
                      <Toggle on={f.Sortable}   onChange={v => updateField(i, "Sortable", v)}/>
                      <Toggle on={f.Filterable} onChange={v => updateField(i, "Filterable", v)}/>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ marginTop:14, padding:"12px 16px",
              background:"rgba(99,102,241,.07)", border:"0.5px solid rgba(129,140,248,.2)",
              borderRadius:10, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:"rgba(99,102,241,.12)",
                  border:"0.5px solid rgba(129,140,248,.25)", display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:16, flexShrink:0 }}>✦</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:"#1e293b" }}>AI field suggestions</div>
                  <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>
                    Claude will analyze your fields and suggest types, labels and badge colors
                  </div>
                </div>
              </div>
              <button onClick={handleAiSuggest} disabled={aiLoading}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8,
                  background:"rgba(99,102,241,.12)", border:"0.5px solid rgba(129,140,248,.3)",
                  color:"#818cf8", fontSize:12, fontWeight:500,
                  cursor: aiLoading ? "not-allowed" : "pointer",
                  whiteSpace:"nowrap", flexShrink:0, fontFamily:"inherit" }}>
                {aiLoading ? "⏳ Thinking…" : "✦ Suggest"}
              </button>
            </div>

            {aiSuggestions.length > 0 && (
              <div style={{ marginTop:10, background:"rgba(129,140,248,.05)",
                border:"0.5px solid rgba(129,140,248,.15)", borderRadius:8, padding:"10px 14px" }}>
                <div style={{ fontSize:11, color:"#818cf8", marginBottom:8, fontWeight:500 }}>
                  ✦ AI suggestions — click to apply
                </div>
                {aiSuggestions.map((s, i) => {
                  const tc = TYPE_COLORS[s.Format] || TYPE_COLORS.text
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8,
                      padding:"6px 0", borderBottom:"0.5px solid #f1f5f9", flexWrap:"wrap" }}>
                      <div style={{ fontSize:12, color:"#64748b", fontFamily:"monospace",
                        width:120, flexShrink:0 }}>{s.FieldName}</div>
                      <span style={{ fontSize:10, color:"#94a3b8" }}>→</span>
                      <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20,
                        background:tc.bg, color:tc.color }}>{s.Format}</span>
                      {s.BadgeColors && Object.keys(s.BadgeColors).length > 0 && (
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                          {Object.entries(s.BadgeColors).map(([k, v]) => (
                            <span key={k} style={{ fontSize:10, padding:"2px 8px", borderRadius:20,
                              background: v==="green" ? "rgba(29,78,56,.15)" : v==="red" ? "rgba(239,68,68,.1)" : v==="amber" ? "rgba(245,158,11,.1)" : "rgba(0,0,0,.07)",
                              color:      v==="green" ? "#16a34a" : v==="red" ? "#dc2626" : v==="amber" ? "#d97706" : "#64748b" }}>
                              {k}={v}
                            </span>
                          ))}
                        </div>
                      )}
                      {s.Reason && <div style={{ fontSize:11, color:"#64748b", flex:1 }}>{s.Reason}</div>}
                      <button onClick={() => applyAiSuggestion(s)}
                        style={{ marginLeft:"auto", padding:"2px 10px", borderRadius:6, fontSize:10,
                          border:"0.5px solid rgba(129,140,248,.3)", background:"rgba(99,102,241,.1)",
                          color:"#818cf8", cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>
                        Apply
                      </button>
                    </div>
                  )
                })}
                <div style={{ display:"flex", justifyContent:"flex-end", marginTop:10 }}>
                  <button onClick={applyAllSuggestions}
                    style={{ padding:"5px 14px", borderRadius:7, fontSize:11, border:"none",
                      background:"#204066", color:"#fff", cursor:"pointer", fontWeight:500, fontFamily:"inherit" }}>
                    Apply all
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding:"14px 20px", borderTop:"0.5px solid #e2e8f0",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:12, color:"#64748b" }}>ℹ️ Label is editable after save</div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onBack}
              style={{ padding:"7px 16px", borderRadius:8, border:"0.5px solid rgba(0,0,0,.1)",
                background:"transparent", color:"#64748b", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || !fields.length}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 20px",
                background: saving || !fields.length ? "rgba(32,64,102,.4)" : "#204066",
                border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:500,
                cursor: saving || !fields.length ? "not-allowed" : "pointer", fontFamily:"inherit" }}>
              💾 {saving ? "Saving…" : saveLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ViewPage({ page, onBack }) {
  const [fields,  setFields]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  useEffect(() => {
    apiCall("Get Page Fields", { PageID: page.PageID })
      .then(d => { if (d.State === 0) setFields(d.List0 ?? []); else setError(d.Message) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [page.PageID])

  return (
    <div style={{ display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:13, marginBottom:8, display:"flex", alignItems:"center", gap:8 }}>
            <span onClick={onBack} style={{ cursor:"pointer", color:"#204066", fontWeight:600 }}>
              📄 Page master
            </span>
            <span style={{ color:"#cbd5e1", fontSize:16 }}>›</span>
            <span style={{ color:"#1e293b", fontWeight:600 }}>{page.PageName}</span>
          </div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>
            {[page.DatabaseName, page.SchemaName, page.TableName].filter(Boolean).join(" › ") || "—"}
          </div>
        </div>
        <button onClick={onBack}
          style={{ padding:"7px 16px", borderRadius:8, border:"0.5px solid rgba(0,0,0,.1)",
            background:"rgba(0,0,0,.04)", color:"#64748b", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
          ← Back
        </button>
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

          {error && (
            <div style={{ background:"rgba(239,68,68,.1)", border:"0.5px solid rgba(239,68,68,.25)",
              borderRadius:8, padding:"8px 12px", color:"#dc2626", fontSize:12, marginBottom:12 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ background:"#f8fafc", border:"0.5px solid #e2e8f0", borderRadius:10, overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 140px 56px 56px 56px 1fr",
              padding:"7px 14px", background:"rgba(0,0,0,.03)", borderBottom:"0.5px solid #e2e8f0" }}>
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
                const tc  = TYPE_COLORS[f.Format] || TYPE_COLORS.text
                const chk = val => ({
                  display:"inline-flex", width:16, height:16, borderRadius:3,
                  alignItems:"center", justifyContent:"center",
                  background: val ? "rgba(32,64,102,.1)" : "rgba(0,0,0,.04)",
                  border:`0.5px solid ${val ? "rgba(32,64,102,.25)" : "rgba(0,0,0,.1)"}`,
                  fontSize:10, color: val ? "#204066" : "#94a3b8",
                })
                return (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 90px 140px 56px 56px 56px 1fr",
                    padding:"8px 14px", alignItems:"center", borderBottom:"0.5px solid #f1f5f9" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,.02)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ fontSize:12, color:"#64748b", fontFamily:"monospace",
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.FieldName}</div>
                    <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, width:"fit-content",
                      background:tc.bg, color:tc.color }}>{f.Format || "text"}</span>
                    <div style={{ fontSize:12, color:"#1e293b" }}>{f.Label || f.FieldName}</div>
                    <div><span style={chk(f.Visible)}>{f.Visible ? "✓" : ""}</span></div>
                    <div><span style={chk(f.Sortable)}>{f.Sortable ? "✓" : ""}</span></div>
                    <div><span style={chk(f.Filterable)}>{f.Filterable ? "✓" : ""}</span></div>
                    <div style={{ fontSize:11, color:"#94a3b8", fontFamily:"monospace",
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {f.ColorRules || "—"}
                    </div>
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

export default function PageMaster() {
  const [view,      setView]      = useState("list")
  const [editPage,  setEditPage]  = useState(null)
  const [viewPage,  setViewPage]  = useState(null)
  const [pages,     setPages]     = useState([])
  const [databases, setDatabases] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState("")

  const fetchData = async () => {
    setLoading(true); setError("")
    try {
      const [pRes, dbRes] = await Promise.all([
        apiCall("Get Pages"),
        apiCall("Get Databases")
      ])
      if (pRes.State  === 0) setPages(pRes.List0 ?? [])
      if (dbRes.State === 0) setDatabases(dbRes.List0 ?? [])
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const PAGE_COLUMNS = [
    { key:"PageID",       title:"ID",         width:70,  sortable:true },
    { key:"Icon",         title:"Icon",       width:60,  sortable:false,
      render: v => <span style={{fontSize:18}}>{v || "📄"}</span> },
    { key:"PageName",     title:"Page Name",  width:200, sortable:true, filterable:true, pinned:"left" },
    { key:"DatabaseName", title:"Database",   width:140, sortable:true, filterable:true },
    { key:"SchemaName",   title:"Schema",     width:110, sortable:true },
    { key:"TableName",    title:"Table",      width:200, sortable:true, filterable:true },
    { key:"CreatedBy",    title:"Created By", width:130 },
    { key:"CreatedDate",  title:"Created",    width:120,
      format: v => v ? new Date(v).toLocaleDateString() : "—" },
    { key:"actions", title:"Actions", width:140, sortable:false,
      render: (_, row) => (
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={e => { e.stopPropagation(); setEditPage(row) }}
            style={{ padding:"4px 10px", borderRadius:6, border:"0.5px solid rgba(0,0,0,.1)",
              background:"rgba(0,0,0,.04)", color:"#64748b",
              fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
            Edit
          </button>
          <button onClick={e => { e.stopPropagation(); setViewPage(row) }}
            style={{ padding:"4px 10px", borderRadius:6, border:"0.5px solid rgba(99,102,241,.25)",
              background:"rgba(99,102,241,.07)", color:"#818cf8",
              fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
            View
          </button>
        </div>
      )
    },
  ]

  if (view === "add" || editPage) {
    return (
      <AddPageView
        databases={databases}
        editData={editPage}
        onBack={() => { setView("list"); setEditPage(null) }}
        onSaved={() => { setView("list"); setEditPage(null); fetchData() }}
      />
    )
  }

  if (viewPage) {
    return <ViewPage page={viewPage} onBack={() => setViewPage(null)}/>
  }

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:500, color:"#1e293b" }}>Page master</div>
          <div style={{ fontSize:13, color:"#64748b", marginTop:2 }}>{pages.length} pages configured</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={fetchData}
            style={{ padding:"7px 14px", borderRadius:8, border:"0.5px solid rgba(0,0,0,.1)",
              background:"rgba(0,0,0,.04)", color:"#64748b",
              fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
            🔄 Refresh
          </button>
          <button onClick={() => setView("add")}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 16px",
              background:"#204066", border:"none", borderRadius:8, color:"#fff",
              fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
            + Add page
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background:"rgba(239,68,68,.1)", border:"0.5px solid rgba(239,68,68,.25)",
          borderRadius:10, padding:"10px 14px", color:"#dc2626", fontSize:13, marginBottom:16 }}>
          ⚠️ {error}
        </div>
      )}

      <DataGrid
        columns={PAGE_COLUMNS}
        data={pages}
        rowKey="PageID"
        title="Page Master"
        loading={loading}
        darkMode={false}
        selectable={true}
        exportable={true}
        storageKey="cp_page_master"
        height={520}
      />
    </div>
  )
}
