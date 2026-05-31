import { useState, useEffect } from "react"
import { DataGrid } from "../../shared/components/DataGrid"
import { apiCall } from "../shared/api.js"

// ── Columns ───────────────────────────────────────────────────────────────────
const COLUMNS = [
  {
    key:      "GroupID",
    title:    "ID",
    width:    70,
    sortable: true,
  },
  {
    key:        "GroupName",
    title:      "Group Name",
    width:      260,
    sortable:   true,
    filterable: true,
    pinned:     "left",
  },
  {
    key:      "CreatedBy",
    title:    "Created By",
    width:    160,
    sortable: true,
  },
  {
    key:    "CreatedDate",
    title:  "Created Date",
    width:  150,
    format: (v) => v ? new Date(v).toLocaleDateString() : "—",
  },
  {
    key:    "LastMaintBy",
    title:  "Last Updated By",
    width:  160,
  },
  {
    key:    "LastMaintDate",
    title:  "Last Updated",
    width:  150,
    format: (v) => v ? new Date(v).toLocaleDateString() : "—",
  },
  {
    key:      "actions",
    title:    "Actions",
    width:    180,
    sortable: false,
    render:   (_, row) => <RowActions row={row} />,
  },
]

// ── Row Actions (needs context — use global callbacks) ─────────────────────
let _openEdit    = null
let _openMembers = null
let _openDel     = null

function RowActions({ row }) {
  return (
    <div style={{ display:"flex", gap:6 }}>
      <button onClick={e => { e.stopPropagation(); _openMembers?.(row) }}
        style={{ padding:"4px 10px", borderRadius:6, border:"1px solid rgba(129,140,248,.3)",
          background:"rgba(99,102,241,.1)", color:"#818cf8",
          fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
        Pages
      </button>
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

// ── Modal ─────────────────────────────────────────────────────────────────────
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

// ── Members Drawer ────────────────────────────────────────────────────────────
function MembersDrawer({ group, onClose }) {
  const [pages,   setPages]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  useEffect(() => {
    (async () => {
      setLoading(true); setError("")
      try {
        const d = await apiCall("Get Group Pages", { GroupID: group.GroupID })
        if (d.State !== 0) { setError(d.Message); return }
        setPages(d.List0 ?? [])
      } catch(e) { setError(e.message) }
      finally { setLoading(false) }
    })()
  }, [group.GroupID])

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:90 }}/>
      <div style={{ position:"fixed", top:0, right:0, width:360, height:"100vh",
        background:"#f8fafc", borderLeft:"1px solid rgba(0,0,0,.1)",
        zIndex:91, display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"20px 24px", borderBottom:"1px solid #e2e8f0",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:"#1e293b" }}>{group.GroupName}</div>
            <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>Assigned pages</div>
          </div>
          <button onClick={onClose}
            style={{ background:"none", border:"none", cursor:"pointer", color:"#64748b", fontSize:20 }}>✕</button>
        </div>
        <div style={{ padding:24, flex:1, overflowY:"auto" }}>
          {loading && <div style={{ color:"#64748b", fontSize:13 }}>⏳ Loading pages…</div>}
          {error   && <div style={{ color:"#dc2626", fontSize:13 }}>⚠️ {error}</div>}
          {!loading && pages.length === 0 && !error && (
            <div style={{ color:"#64748b", fontSize:13, textAlign:"center", marginTop:48 }}>
              No pages assigned to this group
            </div>
          )}
          {!loading && pages.map((p, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12,
              padding:"12px 14px", borderRadius:10, marginBottom:8,
              background:"rgba(0,0,0,.04)", border:"1px solid #e2e8f0" }}>
              <div style={{ width:32, height:32, borderRadius:8, flexShrink:0,
                background:"rgba(32,64,102,.5)", border:"1px solid rgba(32,64,102,.6)",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"#818cf8", fontSize:14 }}>📄</div>
              <div>
                <div style={{ fontSize:13, color:"#1e293b", fontWeight:500 }}>{p.PageName}</div>
                {p.Operation && <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{p.Operation}</div>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding:"16px 24px", borderTop:"1px solid #e2e8f0",
          fontSize:12, color:"#64748b" }}>
          {pages.length} page{pages.length !== 1 ? "s" : ""} assigned
        </div>
      </div>
    </>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function GroupMaster() {
  const [rows,        setRows]        = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState("")
  const [modal,       setModal]       = useState(null)
  const [activeGroup, setActiveGroup] = useState(null)
  const [drawer,      setDrawer]      = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [formName,    setFormName]    = useState("")
  const [formError,   setFormError]   = useState("")
  const [confirmDel,  setConfirmDel]  = useState(null)

  const fetchGroups = async () => {
    setLoading(true); setError("")
    try {
      const d = await apiCall("Get Groups")
      if (d.State !== 0) { setError(d.Message); return }
      setRows(d.List0 ?? [])
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    // wire global callbacks for RowActions
    _openEdit    = g => { setActiveGroup(g); setFormName(g.GroupName); setFormError(""); setModal("edit") }
    _openMembers = g => { setActiveGroup(g); setDrawer(true) }
    _openDel     = g => setConfirmDel(g)
    fetchGroups()
  }, [])

  const handleSave = async () => {
    if (!formName.trim()) { setFormError("Group name is required"); return }
    setSaving(true); setFormError("")
    try {
      const op      = modal === "add" ? "Add Group" : "Edit Group"
      const payload = modal === "add"
        ? { GroupName: formName.trim() }
        : { GroupID: activeGroup.GroupID, GroupName: formName.trim() }
      const d = await apiCall(op, payload)
      if (d.State !== 0) { setFormError(d.Message); return }
      setModal(null)
      fetchGroups()
    } catch(e) { setFormError(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      const d = await apiCall("Delete Group", { GroupID: confirmDel.GroupID })
      if (d.State !== 0) { setError(d.Message); return }
      setConfirmDel(null)
      fetchGroups()
    } catch(e) { setError(e.message) }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, color:"#1e293b" }}>Group Master</div>
          <div style={{ fontSize:13, color:"#64748b", marginTop:2 }}>{rows.length} groups total</div>
        </div>
        <button
          onClick={() => { setFormName(""); setFormError(""); setModal("add") }}
          style={{ padding:"8px 18px", background:"#204066", border:"none", borderRadius:8,
            color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
          + Add Group
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.25)",
          borderRadius:10, padding:"10px 14px", color:"#dc2626", fontSize:13, marginBottom:16 }}>
          ⚠️ {error}
        </div>
      )}

      {/* DataGrid */}
      <DataGrid
        columns={COLUMNS}
        data={rows}
        rowKey="GroupID"
        title="Group Master"
        loading={loading}
        darkMode={false}
        selectable={true}
        exportable={true}
        storageKey="cp_group_master"
        height={520}
        onDeleteRows={selected => {
          if (selected.length === 1) setConfirmDel(selected[0])
        }}
      />

      {/* Add / Edit Modal */}
      {modal && (
        <Modal title={modal === "add" ? "Add Group" : "Edit Group"} onClose={() => setModal(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:20 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"#64748b", letterSpacing:".6px" }}>
              GROUP NAME
            </label>
            <input
              value={formName}
              onChange={e => { setFormName(e.target.value); setFormError("") }}
              onKeyDown={e => e.key === "Enter" && handleSave()}
              placeholder="Enter group name"
              autoFocus
              style={{ padding:"11px 14px", background:"rgba(0,0,0,.07)",
                border:"1px solid rgba(0,0,0,.1)", borderRadius:10,
                color:"#1e293b", fontSize:14, fontFamily:"inherit", outline:"none" }}/>
            {formError && <div style={{ fontSize:12, color:"#dc2626", marginTop:4 }}>⚠️ {formError}</div>}
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={() => setModal(null)}
              style={{ padding:"8px 20px", borderRadius:8, border:"1px solid rgba(0,0,0,.1)",
                background:"transparent", color:"#64748b", fontSize:13,
                cursor:"pointer", fontFamily:"inherit" }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ padding:"8px 20px", borderRadius:8, border:"none",
                background:"#204066", color:"#fff", fontSize:13, fontWeight:600,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1, fontFamily:"inherit" }}>
              {saving ? "Saving…" : modal === "add" ? "Add Group" : "Save Changes"}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {confirmDel && (
        <Modal title="Delete Group" onClose={() => setConfirmDel(null)}>
          <p style={{ fontSize:14, color:"#64748b", marginBottom:24, lineHeight:1.6 }}>
            Are you sure you want to delete <strong style={{ color:"#1e293b" }}>{confirmDel.GroupName}</strong>?
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

      {/* Members Drawer */}
      {drawer && activeGroup && (
        <MembersDrawer group={activeGroup} onClose={() => setDrawer(false)}/>
      )}
    </div>
  )
}
