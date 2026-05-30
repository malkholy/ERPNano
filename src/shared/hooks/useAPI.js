const API_URL = "https://sila.silasystem.com:7103/General/GeneralAPI/";
const HEADERS = {
  "Accept":       "application/json",
  "content-type": "application/json",
  "Sp_Name":      "APIClaudeOperationV1"
};
const BASE_BODY = {
  AppVersionWeb:"225", AppVersionAndroid:"225", AppVersionIos:"225",
  AppVersionDesktop:"225", FireBaseToken:"", PlatForm:"web", deviceID:"", IP:"192.168.1.3"
};

export async function apiCall(operation, params = {}, user = '') {
  const res = await fetch(API_URL, {
    method:  'POST',
    headers: HEADERS,
    body:    JSON.stringify({ ...BASE_BODY, User: user, Operation: operation, ...params })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const d = await res.json();
  if (d?.List) return d.List;
  return Array.isArray(d) ? d : [d];
}

export function useAPI() {
  const call = (operation, params = {}, user = '') =>
    apiCall(operation, params, user);
  return { call };
}
