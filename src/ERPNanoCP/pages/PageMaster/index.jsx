import { useState, useEffect } from "react"
import { apiCall } from "../../shared/api.js"
import { DataGrid } from "../../../shared/components/DataGrid"
import PageForm from "./PageForm.jsx"
import PageView from "./PageView.jsx"

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
      const [pRes, dbRes] = await Promise.all([apiCall("Get Pages"), apiCall("Get Databases")])
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
              background:"rgba(0,0,0,.04)", color:"#64748b", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
            Edit
          </button>
          <button onClick={e => { e.stopPropagation(); setViewPage(row) }}
            style={{ padding:"4px 10px", borderRadius:6, border:"0.5px solid rgba(99,102,241,.25)",
              background:"rgba(99,102,241,.07)", color:"#818cf8", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
            View
          </button>
        </div>
      )
    },
  ]

  if (view === "add" || editPage) {
    return (
      <PageForm
        databases={databases}
        editData={editPage}
        onBack={() => { setView("list"); setEditPage(null) }}
        onSaved={() => { setView("list"); setEditPage(null); fetchData() }}
      />
    )
  }

  if (viewPage) {
    return <PageView page={viewPage} onBack={() => setViewPage(null)}/>
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
              background:"rgba(0,0,0,.04)", color:"#64748b", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
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
        columns={PAGE_COLUMNS} data={pages} rowKey="PageID" title="Page Master"
        loading={loading} darkMode={false} selectable={true} exportable={true}
        storageKey="cp_page_master" height={520}
      />
    </div>
  )
}
