export const CP_NAV = [
  { key:'users', label:'USERS', icon:'👥', pages:[
    { key:'userlist',    label:'User List',          icon:'👤' },
    { key:'useradd',     label:'Add User',            icon:'➕' },
    { key:'roles',       label:'Roles & Permissions', icon:'🔑' },
  ]},
  { key:'system', label:'SYSTEM', icon:'⚙️', pages:[
    { key:'settings',    label:'System Settings',     icon:'⚙️' },
    { key:'appconfig',   label:'App Config',          icon:'🔧' },
  ]},
  { key:'groups', label:'GROUPS', icon:'🗂️', pages:[
    { key:'groups', label:'Group Master', icon:'🗂️' },
  ]},
  { key:'masterdata', label:'MASTER DATA', icon:'📋', pages:[
    { key:'pages', label:'Page Master', icon:'📄' },
    { key:'databases',   label:'Database Master',  icon:'🗄️' },
    { key:'lookups',     label:'Lookup Tables',       icon:'📋' },
    { key:'departments', label:'Departments',         icon:'🏢' },
    { key:'warehouses',  label:'Warehouses',          icon:'🏭' },
  ]},
  { key:'logs', label:'LOGS', icon:'📜', pages:[
    { key:'splogs',      label:'SP Logs',             icon:'📜' },
    { key:'audittrail',  label:'Audit Trail',         icon:'🔍' },
    { key:'loginhistory',label:'Login History',       icon:'🕐' },
  ]},
];

export const CP_PAGE_MAP = {};
CP_NAV.forEach(g => g.pages.forEach(p => { CP_PAGE_MAP[p.key] = p; }));
