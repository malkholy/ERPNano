import { useState, useEffect } from "react"

const API_URL   = "https://sila.silasystem.com:7103/General/GeneralAPI/"
const BASE_BODY = {
  AppVersionWeb:     "225",
  AppVersionAndroid: "225",
  AppVersionIos:     "225",
  AppVersionDesktop: "225",
  FireBaseToken:     "",
  PlatForm:          "web",
  deviceID:          "",
  IP:                "192.168.1.3"
}

export default function UserList() {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")
  const [search,  setSearch]  = useState("")

  const fetchUsers = async () => {
    setLoading(true); setError("")
    try {
      const res = await fetch(API_URL, {
        method:  "POST",
        headers: {
          "Accept":       "application/json",
          "content-type": "application/json",
          "Sp_Name":      "CP.APICPOperation"
        },
        body: JSON.stringify({ ...BASE_BODY, Operation: "Get Users" })
      })
      const d = await res.json()
      console.log("Get Users:", d)
      if (d.State !== 0) { setError(d.Message || "Failed to load users"); return }
      setRows(d.List0 ?? [])
    } catch (e) {
      setError("Cannot connect to server. " + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const filtered = rows.filter(r =>
    r.Name?.toLowerCase().includes(search.toLowerCase()) ||
    r.Username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, color:"#1e293b" }}>User List</div>
          <div style={{ fontSize:13, color:"#64748b", marginTop:2 }}>{rows.length} users total</div>
        </div>
        <button onClick={fetchUsers}
          style={{ padding:"7px 16px", background:"#204066", border:"none", borderRadius:8,
            color:"#fff", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
          🔄 Refresh
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom:16 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or username…"
          style={{ width:"320px", padding:"9px 14px",
            background:"rgba(0,0,0,.07)", border:"1px solid rgba(0,0,0,.1)",
            borderRadius:10, color:"#1e293b", fontSize:13, fontFamily:"inherit",
            outline:"none", boxSizing:"border-box" }}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.25)",
          borderRadius:10, padding:"10px 14px", color:"#dc2626", fontSize:13, marginBottom:16 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Table */}
      <div style={{ background:"#ffffff", borderRadius:12, border:"1px solid #e2e8f0", overflow:"hidden" }}>
        {/* Table header */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
          padding:"12px 20px", borderBottom:"1px solid #e2e8f0",
          background:"rgba(0,0,0,.03)" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:".8px" }}>NAME</div>
          <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:".8px" }}>USERNAME</div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ padding:48, textAlign:"center", color:"#64748b", fontSize:13 }}>
            ⏳ Loading users…
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && !error && (
          <div style={{ padding:48, textAlign:"center", color:"#64748b", fontSize:13 }}>
            No users found
          </div>
        )}

        {/* Rows */}
        {!loading && filtered.map((row, i) => (
          <div key={i}
            style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
              padding:"13px 20px", borderBottom:"1px solid #f1f5f9",
              transition:"background .1s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,.03)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", flexShrink:0,
                background:"rgba(32,64,102,.5)", border:"1px solid rgba(32,64,102,.6)",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"#818cf8", fontSize:12, fontWeight:700 }}>
                {row.Name?.[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize:13, color:"#1e293b", fontWeight:500 }}>{row.Name}</span>
            </div>
            <div style={{ fontSize:13, color:"#64748b", display:"flex", alignItems:"center" }}>
              {row.Username}
            </div>
          </div>
        ))}
      </div>

      {/* Count */}
      {!loading && filtered.length > 0 && (
        <div style={{ marginTop:12, fontSize:12, color:"#64748b" }}>
          Showing {filtered.length} of {rows.length} users
        </div>
      )}
    </div>
  )
}
