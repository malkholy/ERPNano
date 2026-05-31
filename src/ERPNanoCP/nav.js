export const CP_NAV = [
  { key:'users', label:'USERS', icon:'👥', pages:[
    { key:'userlist', label:'User List', icon:'👤' },
  ]},
  { key:'groups', label:'GROUPS', icon:'🗂️', pages:[
    { key:'groups',     label:'Group Master', icon:'🗂️' },
    { key:'grouppages', label:'Group Pages',  icon:'📋' },
  ]},
  { key:'masterdata', label:'MASTER DATA', icon:'📋', pages:[
    { key:'pages',     label:'Page Master',     icon:'📄' },
    { key:'databases', label:'Database Master', icon:'🗄️' },
  ]},
];

export const CP_PAGE_MAP = {};
CP_NAV.forEach(g => g.pages.forEach(p => { CP_PAGE_MAP[p.key] = p; }));
