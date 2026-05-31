import { useState, useEffect, useRef } from "react"

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

export default function GroupPages() {
  const [groups,       setGroups]       = useState([])
  const [pages,        setPages]        = useState([])
  const [allPages,     setAllPages]     = useState([])
  const [activeGroup,  setActiveGroup]  = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [loadingPages, setLoadingPages] = useState(false)
  const [error,        setError]        = useState("")
  const [groupSearch,  setGroupSearch]  = useState("")
  const [showModal,    setShowModal]    = useState(false)
  const [modalSearch,  setModalSearch]  = useState("")
  const [modalSel,     setModalSel]     = useState(new Set())
  const [orderChanged, setOrderChanged] = useState(false)
  const [savingOrder,  setSavingOrder]  = useState(false)
  const [removing,     setRemoving]     = useState(null)
  const [adding,       setAdding]       = useState(false)
  const dragSrc = useRef(null)

  useEffect(() => {
    const loadInit = async () => {
      setLoading(true)
      try {
        const [gRes, pRes] = await Promise.all([
          apiCall("Get Groups"),
          apiCall("Get Pages")
        ])
        if (gRes.State === 0) setGroups(gRes.List0 ?? [])
        if (pRes.State === 0) setAllPages(pRes.List0 ?? [])
      } catch(e) { setError(e.message) }
      finally { setLoading(false) }
    }
    loadInit()
  }, [])

  const selectGroup = async group => {
    setActiveGroup(group)
    setOrderChanged(false)
    setError("")
    setLoadingPages(true)
    try {
      const d = await apiCall("Get Group Pages", { GroupID: group.GroupID })
      if (d.State === 0) setPages(d.List0 ?? [])
      else setError(d.Message)
    } catch(e) { setError(e.message) }
    finally { setLoadingPages(false) }
  }

  const removePage = async pageId => {
    setRemoving(pageId)
    try {
      const d = await apiCall("Remove Group Page", { GroupID: activeGroup.GroupID, PageID: pageId })
      if (d.State !== 0) { setError(d.Message); return }
      setPages(prev => prev.filter(p => p.PageID !== pageId))
      setOrderChanged(false)
    } catch(e) { setError(e.message) }
    finally { setRemoving(null) }
  }

  const saveOrder = async () => {
    setSavingOrder(true)
    try {
      const d = await apiCall("Update Group Pages Order", {
        GroupID: activeGroup.GroupID,
        Pages: pages.map((p, i) => ({ PageID: p.PageID, SortOrder: i + 1 }))
      })
      if (d.State !== 0) { setError(d.Message); return }
      setOrderChanged(false)
    } catch(e) { setError(e.message) }
    finally { setSavingOrder(false) }
  }

  // drag & drop
  const dragStart = (e, idx) => {
    dragSrc.current = idx
    e.dataTransfer.effectAllowed = "move"
    setTimeout(() => {
      const els = document.querySelectorAll(".gp-card")
      if (els[idx]) els[idx].style.opacity = "0.4"
    }, 0)
  }

  const dragOver = (e, idx) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const drop = (e, idx) => {
    e.preventDefault()
    const src = dragSrc.current
    if (src === null || src === idx) return
    const arr = [...pages]
    const [moved] = arr.splice(src, 1)
    arr.splice(idx, 0, moved)
    setPages(arr)
    setOrderChanged(true)
    dragSrc.current = null
  }

  const dragEnd = () => {
    dragSrc.current = null
    document.querySelectorAll(".gp-card").forEach(el => el.style.opacity = "1")
  }

  // modal
  const openModal = () => {
    setModalSel(new Set())
    setModalSearch("")
    setShowModal(true)
  }

  const toggleModalPage = id => {
    setModalSel(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  const addPages = async () => {
    if (!modalSel.size) return
    setAdding(true)
    try {
      const d = await apiCall("Add Group Pages", {
        GroupID: activeGroup.GroupID,
        PageIDs: [...modalSel]
      })
      if (d.State !== 0) { setError(d.Message); return }
      // Reload pages
      const r = await apiCall("Get Group Pages", { GroupID: activeGroup.GroupID })
      if (r.State === 0) setPages(r.List0 ?? [])
      setShowModal(false)
      setOrderChanged(false)
    } catch(e) { setError(e.message) }
    finally { setAdding(false) }
  }

  const assignedIds  = new Set(pages.map(p => p.PageID))
  const filteredGroups = groups.filter(g =>
    g.GroupName?.toLowerCase().includes(groupSearch.toLowerCase())
  )
  const filteredModalPages = allPages.filter(p =>
    p.PageName?.toLowerCase().includes(modalSearch.toLowerCase())
  )

  return (
    <div style={{ display:"flex", height:"calc(100vh - 100px)", borderRadius:12,
      overflow:"hidden", border:"0.5px solid #e2e8f0", background:"#f8fafc" }}>

      {/* ── LEFT: Groups ── */}
      <div style={{ width:260, flexShrink:0, background:"#fff",
        borderRight:"0.5px solid #e2e8f0", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:16, borderBottom:"0.5px solid #e2e8f0" }}>
          <div style={{ fontSize:14, fontWeight:600, color:"#1e293b" }}>🗂️ Group master</div>
          <div style={{ fontSize:11, color:"#94a3b8", marginTop:3 }}>Select a group to manage pages</div>
        </div>
        <div style={{ padding:"10px 12px", borderBottom:"0.5px solid #e2e8f0" }}>
          <input value={groupSearch} onChange={e => setGroupSearch(e.target.value)}
            placeholder="🔍  Search groups…"
            style={{ width:"100%", padding:"7px 10px", border:"0.5px solid #e2e8f0",
              borderRadius:7, fontSize:12, color:"#1e293b", background:"#f8fafc",
              outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
        </div>
        <div style={{ flex:1, overflowY:"auto" }}>
          {loading ? (
            <div style={{ padding:24, textAlign:"center", fontSize:13, color:"#94a3b8" }}>Loading…</div>
          ) : filteredGroups.map(g => {
            const isActive = activeGroup?.GroupID === g.GroupID
            const count    = isActive ? pages.length : "?"
            return (
              <div key={g.GroupID} onClick={() => selectGroup(g)}
                style={{ padding:"11px 16px", cursor:"pointer",
                  borderBottom:"0.5px solid #f1f5f9",
                  borderLeft:`3px solid ${isActive ? "#4f46e5" : "transparent"}`,
                  background: isActive ? "#eef2ff" : "transparent",
                  display:"flex", alignItems:"center", justifyContent:"space-between" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f8fafc" }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:28, height:28, borderRadius:7, flexShrink:0,
                    background: isActive ? "#eef2ff" : "#f1f5f9",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:700,
                    color: isActive ? "#4f46e5" : "#64748b" }}>
                    {g.GroupName?.substring(0,2).toUpperCase()}
                  </div>
                  <span style={{ fontSize:13, fontWeight:500,
                    color: isActive ? "#4f46e5" : "#1e293b" }}>{g.GroupName}</span>
                </div>
                {isActive && (
                  <span style={{ fontSize:11, color:"#4f46e5", background:"#eef2ff",
                    padding:"2px 8px", borderRadius:20, fontWeight:500 }}>
                    {loadingPages ? "…" : pages.length}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── RIGHT: Pages ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Header */}
        <div style={{ padding:"14px 20px", background:"#fff",
          borderBottom:"0.5px solid #e2e8f0",
          display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <div style={{ fontSize:13, display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
              <span style={{ color:"#204066", fontWeight:600 }}>📋 Group Pages</span>
              <span style={{ color:"#cbd5e1", fontSize:16 }}>›</span>
              <span style={{ color:"#1e293b", fontWeight:600 }}>
                {activeGroup?.GroupName || "—"}
              </span>
              {activeGroup && <>
                <span style={{ color:"#cbd5e1", fontSize:16 }}>›</span>
                <span style={{ color:"#64748b" }}>Pages</span>
              </>}
            </div>
            <div style={{ fontSize:11, color:"#94a3b8" }}>
              {activeGroup
                ? `${pages.length} page${pages.length !== 1 ? "s" : ""} assigned`
                : "Select a group to get started"}
            </div>
          </div>
          <button onClick={openModal} disabled={!activeGroup}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px",
              background: activeGroup ? "#204066" : "#94a3b8",
              border:"none", borderRadius:8, color:"#fff",
              fontSize:13, fontWeight:500,
              cursor: activeGroup ? "pointer" : "not-allowed",
              opacity: activeGroup ? 1 : .6,
              fontFamily:"inherit" }}>
            + Add page
          </button>
        </div>

        {/* Order changed banner */}
        {orderChanged && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"8px 20px", background:"#fffbeb",
            borderBottom:"0.5px solid #fcd34d", flexShrink:0 }}>
            <span style={{ fontSize:12, color:"#92400e" }}>
              ⚠️ Page order changed — save to apply
            </span>
            <button onClick={saveOrder} disabled={savingOrder}
              style={{ padding:"5px 14px", borderRadius:6, border:"none",
                background:"#d97706", color:"#fff", fontSize:12,
                fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
              {savingOrder ? "Saving…" : "💾 Save order"}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding:"8px 20px", background:"rgba(239,68,68,.08)",
            borderBottom:"0.5px solid rgba(239,68,68,.2)", fontSize:12,
            color:"#dc2626", flexShrink:0 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Pages area */}
        <div style={{ flex:1, overflowY:"auto", padding:20,
          display:"flex", flexDirection:"column", gap:8 }}>
          {!activeGroup ? (
            <div style={{ flex:1, display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:10, color:"#94a3b8" }}>
              <div style={{ fontSize:40, opacity:.4 }}>🗂️</div>
              <div style={{ fontSize:15, fontWeight:500, color:"#64748b" }}>Select a group</div>
              <div style={{ fontSize:12 }}>Click any group on the left to manage its pages</div>
            </div>
          ) : loadingPages ? (
            <div style={{ padding:48, textAlign:"center", fontSize:13, color:"#94a3b8" }}>
              ⏳ Loading pages…
            </div>
          ) : pages.length === 0 ? (
            <div style={{ flex:1, display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:10, color:"#94a3b8" }}>
              <div style={{ fontSize:40, opacity:.4 }}>📄</div>
              <div style={{ fontSize:15, fontWeight:500, color:"#64748b" }}>No pages assigned</div>
              <div style={{ fontSize:12 }}>Click "+ Add page" to assign pages to this group</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize:11, color:"#94a3b8", display:"flex",
                alignItems:"center", gap:6, paddingBottom:4 }}>
                ⠿ Drag rows to reorder pages within this group
              </div>
              {pages.map((p, i) => (
                <div key={p.PageID} className="gp-card"
                  draggable
                  onDragStart={e => dragStart(e, i)}
                  onDragOver={e => dragOver(e, i)}
                  onDrop={e => drop(e, i)}
                  onDragEnd={dragEnd}
                  style={{ background:"#fff", border:"0.5px solid #e2e8f0",
                    borderRadius:10, padding:"12px 14px",
                    display:"flex", alignItems:"center", gap:10,
                    transition:"border-color .15s, box-shadow .15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,.3)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}>

                  {/* Drag handle */}
                  <div style={{ display:"flex", flexDirection:"column", gap:3,
                    padding:4, cursor:"grab", opacity:.35,
                    flexShrink:0 }}
                    title="Drag to reorder">
                    {[0,1,2].map(r => (
                      <div key={r} style={{ display:"flex", gap:3 }}>
                        {[0,1].map(c => (
                          <div key={c} style={{ width:3, height:3, borderRadius:"50%",
                            background:"#64748b" }}/>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Order badge */}
                  <span style={{ fontSize:11, color:"#94a3b8", background:"#f8fafc",
                    border:"0.5px solid #e2e8f0", borderRadius:20,
                    padding:"2px 8px", fontWeight:600, flexShrink:0 }}>
                    #{i + 1}
                  </span>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:"#1e293b" }}>{p.PageName}</div>
                    <div style={{ fontSize:11, color:"#94a3b8", marginTop:2, fontFamily:"monospace" }}>
                      {[p.DatabaseName, p.SchemaName, p.TableName].filter(Boolean).join(" › ")}
                    </div>
                  </div>

                  {/* Remove */}
                  <button onClick={() => removePage(p.PageID)}
                    disabled={removing === p.PageID}
                    style={{ padding:"5px 12px", borderRadius:6,
                      border:"0.5px solid rgba(239,68,68,.25)",
                      background:"rgba(239,68,68,.06)", color:"#dc2626",
                      fontSize:11, cursor:"pointer", flexShrink:0,
                      fontFamily:"inherit", opacity: removing === p.PageID ? .5 : 1 }}>
                    {removing === p.PageID ? "…" : "Remove"}
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <div onClick={e => e.target === e.currentTarget && setShowModal(false)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.4)",
            zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:14, width:460,
            maxHeight:"80vh", display:"flex", flexDirection:"column",
            border:"0.5px solid #e2e8f0", overflow:"hidden" }}>

            {/* Modal header */}
            <div style={{ padding:"16px 20px", borderBottom:"0.5px solid #e2e8f0",
              display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
              <div style={{ fontSize:15, fontWeight:600, color:"#1e293b" }}>
                Add pages to {activeGroup?.GroupName}
              </div>
              <button onClick={() => setShowModal(false)}
                style={{ width:28, height:28, borderRadius:7, background:"#f1f5f9",
                  border:"none", cursor:"pointer", color:"#64748b", fontSize:14 }}>✕</button>
            </div>

            {/* Modal search */}
            <div style={{ padding:"12px 20px", borderBottom:"0.5px solid #e2e8f0", flexShrink:0 }}>
              <input value={modalSearch} onChange={e => setModalSearch(e.target.value)}
                placeholder="🔍  Search pages…" autoFocus
                style={{ width:"100%", padding:"8px 12px",
                  border:"0.5px solid #e2e8f0", borderRadius:8,
                  fontSize:13, color:"#1e293b", background:"#f8fafc",
                  outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
            </div>

            {/* Modal list */}
            <div style={{ flex:1, overflowY:"auto", padding:"8px 12px" }}>
              {filteredModalPages.length === 0 ? (
                <div style={{ padding:24, textAlign:"center", fontSize:13, color:"#94a3b8" }}>
                  No pages found
                </div>
              ) : filteredModalPages.map(p => {
                const isAlready = assignedIds.has(p.PageID)
                const isSel     = modalSel.has(p.PageID)
                return (
                  <div key={p.PageID}
                    onClick={() => !isAlready && toggleModalPage(p.PageID)}
                    style={{ display:"flex", alignItems:"center", gap:10,
                      padding:"9px 10px", borderRadius:8,
                      cursor: isAlready ? "not-allowed" : "pointer",
                      opacity: isAlready ? .5 : 1,
                      background: isSel ? "#eef2ff" : "transparent",
                      marginBottom:2 }}
                    onMouseEnter={e => { if (!isAlready && !isSel) e.currentTarget.style.background = "#f8fafc" }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = isAlready ? "transparent" : "transparent" }}>
                    <div style={{ width:18, height:18, borderRadius:5, flexShrink:0,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:11, border:"0.5px solid #e2e8f0",
                      background: isSel || isAlready ? "#204066" : "#fff",
                      borderColor: isSel || isAlready ? "#204066" : "#e2e8f0",
                      color:"#fff" }}>
                      {(isSel || isAlready) ? "✓" : ""}
                    </div>
                    <div style={{ width:30, height:30, borderRadius:7, background:"#f1f5f9",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:15, flexShrink:0 }}>
                      {p.Icon || "📄"}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:500, color:"#1e293b" }}>{p.PageName}</div>
                      <div style={{ fontSize:11, color:"#94a3b8" }}>
                        {[p.SchemaName, p.TableName].filter(Boolean).join(" › ")}
                      </div>
                    </div>
                    {isAlready && (
                      <span style={{ fontSize:10, color:"#4f46e5", background:"#eef2ff",
                        padding:"2px 7px", borderRadius:20 }}>Already added</span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Modal footer */}
            <div style={{ padding:"14px 20px", borderTop:"0.5px solid #e2e8f0",
              display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
              <div style={{ fontSize:12, color:"#64748b" }}>
                {modalSel.size === 0 ? "No pages selected"
                  : `${modalSel.size} page${modalSel.size !== 1 ? "s" : ""} selected`}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => setShowModal(false)}
                  style={{ padding:"8px 16px", borderRadius:8,
                    border:"0.5px solid #e2e8f0", background:"#fff",
                    color:"#64748b", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                  Cancel
                </button>
                <button onClick={addPages}
                  disabled={modalSel.size === 0 || adding}
                  style={{ padding:"8px 16px", borderRadius:8, border:"none",
                    background: modalSel.size === 0 ? "#94a3b8" : "#204066",
                    color:"#fff", fontSize:13, fontWeight:500,
                    cursor: modalSel.size === 0 ? "not-allowed" : "pointer",
                    fontFamily:"inherit" }}>
                  {adding ? "Adding…" : "Add selected"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
