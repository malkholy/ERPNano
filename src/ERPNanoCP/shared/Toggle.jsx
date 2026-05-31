import React from "react"
export default function Toggle({ on, onChange }) {
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
