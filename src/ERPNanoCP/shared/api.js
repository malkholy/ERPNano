export const API_URL   = "https://sila.silasystem.com:7103/General/GeneralAPI/"
export const BASE_BODY = {
  AppVersionWeb:"225", AppVersionAndroid:"225", AppVersionIos:"225",
  AppVersionDesktop:"225", FireBaseToken:"", PlatForm:"web", deviceID:"", IP:"192.168.1.3"
}

export async function apiCall(operation, lineData = null) {
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

export const TYPE_COLORS = {
  text:     { bg:"rgba(99,102,241,.15)",  color:"#818cf8" },
  number:   { bg:"rgba(16,185,129,.15)",  color:"#34d399" },
  date:     { bg:"rgba(245,158,11,.15)",  color:"#fbbf24" },
  badge:    { bg:"rgba(239,68,68,.15)",   color:"#f87171" },
  currency: { bg:"rgba(16,185,129,.15)",  color:"#34d399" },
  avatar:   { bg:"rgba(99,102,241,.12)",  color:"#a78bfa" },
  hidden:   { bg:"rgba(0,0,0,.07)",       color:"#64748b" },
}

export function guessFormat(type) {
  if (!type) return "text"
  const t = type.toLowerCase()
  if (["int","bigint","smallint","tinyint","decimal","float","numeric","money"].includes(t)) return "number"
  if (["date","datetime","datetime2","smalldatetime"].includes(t)) return "date"
  if (["bit"].includes(t)) return "badge"
  return "text"
}
