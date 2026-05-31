import { useState, useEffect } from "react"
import { DataGrid } from "../../shared/components/DataGrid"
import { apiCall } from "../shared/api.js"

let _openEdit = null
let _openDel  = null

function RowActions({ row }) {
  return (
    <div style={{ display:"flex", gap:6 }}>
      <button onClick={e => { e.stopPropagation(); _openEdit?.(row) }}
        style={{ padding:"4px 10px", borderRadius:6, border:"1px solid rgba(0,0,0,.1)",
          background:"rgba(0,0,0,.04)", color:"#64748b",
          fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
        Edit
      </button>
      <button onClick={e => { e.stopPropagation(); _openDel?.(row) }}
        style={{ padding:"4px 10px", borderRadius:6, border:"1px solid rgba(239,68,68,.2)",
          background:"rgba(239,68,68,.08)", color:"#f87171",
          fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
        Del
      </button>
    </div>
  )
}

const COLUMNS = [
  { key:"DatabaseID",   title:"ID",             width:70,  sortable:true },
  { key:"DatabaseName", title:"Database Name",  width:300, sortable:true, filterable:true, pinned:"left" },
  { key:"CreatedBy",    title:"Created By",     width:160, sortable:true },
  { key:"CreatedDate",  title:"Created Date",   width:150, format: v => v ? new Date(v).toLocaleDateString() : "—" },
  { key:"LastMaintBy",  title:"Last Updated By",width:160 },
  { key:"LastMaintDate",title:"Last Updated",   width:150, format: v => v ? new Date(v).toLocaleDateString() : "—" },
  { key:"actions",      title:"Actions",        width:140, sortable:false, render:(_, row) => <RowActions row={row}/> },
]

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:100,
      display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:"#f8fafc", border:"1px solid rgba(0,0,0,.1)",
        borderRadius:16, padding:"28px 32px", width:"100%", maxWidth:440 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <div style={{ fontSize:16, fontWeight:700, color:"#1e293b" }}>{title}</div>
          <button onClick={onClose}
            style={{ background:"none", border:"none", cursor:"pointer", color:"#64748b", fontSize:20 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function DatabaseMaster() {
  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState("")
  const [modal,      setModal]      = useState(null)
  const [activeDB,   setActiveDB]   = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [formName,   setFormName]   = useState("")
  const [formError,  setFormError]  = useState("")
  const [confirmDel, setConfirmDel] = useState(null)

  const fetchDatabases = async () => {
    setLoading(true); setError("")
    try {
      const d = await apiCall("Get Databases")
      if (d.State !== 0) { setError(d.Message); return }
      setRows(d.List0 ?? [])
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    _openEdit = db => { setActiveDB(db); setFormName(db.DatabaseName); setFormError(""); setModal("edit") }
    _openDel  = db => setConfirmDel(db)
    fetchDatabases()
  }, [])

  const handleSave = async () => {
    if (!formName.trim()) { setFormError("Database name is required"); return }
    setSaving(true); setFormError("")
    try {
      const op      = modal === "add" ? "Add Database" : "Edit Database"
      const payload = modal === "add"
        ? { DatabaseName: formName.trim() }
        : { DatabaseID: activeDB.DatabaseID, DatabaseName: formName.trim() }
      const d = await apiCall(op, payload)
      if (d.State !== 0) { setFormError(d.Message); return }
      setModal(null)
      fetchDatabases()
    } catch(e) { setFormError(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      const d = await apiCall("Delete Database", { DatabaseID: confirmDel.DatabaseID })
      if (d.State !== 0) { setError(d.Message); return }
      setConfirmDel(null)
      fetchDatabases()
    } catch(e) { setError(e.message) }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, color:"#1e293b" }}>Database Master</div>
          <div style={{ fontSize:13, color:"#64748b", marginTop:2 }}>{rows.length} databases total</div>
        </div>
        <button onClick={() => { setFormName(""); setFormError(""); setModal("add") }}
          style={{ padding:"8px 18px", background:"#204066", border:"none", borderRadius:8,
            color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
          + Add Database
        </button>
      </div>

      {error && (
        <div style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.25)",
          borderRadius:10, padding:"10px 14px", color:"#dc2626", fontSize:13, marginBottom:16 }}>
          ⚠️ {error}
        </div>
      )}

      <DataGrid
        columns={COLUMNS}
        data={rows}
        rowKey="DatabaseID"
        title="Database Master"
        loading={loading}
        darkMode={false}
        selectable={true}
        exportable={true}
        storageKey="cp_database_master"
        height={520}
        onDeleteRows={selected => { if (selected.length === 1) setConfirmDel(selected[0]) }}
      />

      {/* Add / Edit Modal */}
      {modal && (
        <Modal title={modal === "add" ? "Add Database" : "Edit Database"} onClose={() => setModal(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:20 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"#64748b", letterSpacing:".6px" }}>
              DATABASE NAME
            </label>
            <input value={formName}
              onChange={e => { setFormName(e.target.value); setFormError("") }}
              onKeyDown={e => e.key === "Enter" && handleSave()}
              placeholder="Enter database name" autoFocus
              style={{ padding:"11px 14px", background:"rgba(0,0,0,.07)",
                border:"1px solid rgba(0,0,0,.1)", borderRadius:10,
                color:"#1e293b", fontSize:14, fontFamily:"inherit", outline:"none" }}/>
            {formError && <div style={{ fontSize:12, color:"#dc2626", marginTop:4 }}>⚠️ {formError}</div>}
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={() => setModal(null)}
              style={{ padding:"8px 20px", borderRadius:8, border:"1px solid rgba(0,0,0,.1)",
                background:"transparent", color:"#64748b", fontSize:13,
                cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            <button onClick={handleSave} disabled={saving}
              style={{ padding:"8px 20px", borderRadius:8, border:"none",
                background:"#204066", color:"#fff", fontSize:13, fontWeight:600,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1, fontFamily:"inherit" }}>
              {saving ? "Saving…" : modal === "add" ? "Add Database" : "Save Changes"}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {confirmDel && (
        <Modal title="Delete Database" onClose={() => setConfirmDel(null)}>
          <p style={{ fontSize:14, color:"#64748b", marginBottom:24, lineHeight:1.6 }}>
            Are you sure you want to delete <strong style={{ color:"#1e293b" }}>{confirmDel.DatabaseName}</strong>?
            This action cannot be undone.
          </p>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={() => setConfirmDel(null)}
              style={{ padding:"8px 20px", borderRadius:8, border:"1px solid rgba(0,0,0,.1)",
                background:"transparent", color:"#64748b", fontSize:13,
                cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            <button onClick={handleDelete}
              style={{ padding:"8px 20px", borderRadius:8, border:"none",
                background:"#dc2626", color:"#fff", fontSize:13, fontWeight:600,
                cursor:"pointer", fontFamily:"inherit" }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
