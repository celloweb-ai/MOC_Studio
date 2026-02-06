
import { INITIAL_FACILITIES, INITIAL_USERS, INITIAL_WORK_ORDERS, INITIAL_ASSETS, INITIAL_MOCS } from '../constants';
import { Facility, Asset, MOCRequest, RiskAssessment, WorkOrder, User, StandardLink, AuditEntry } from '../types';

const STORAGE_KEYS = {
  FACILITIES: 'moc_facilities',
  ASSETS: 'moc_assets',
  MOCS: 'moc_requests',
  RISKS: 'moc_risks',
  WORK_ORDERS: 'moc_work_orders',
  USERS: 'moc_users',
  STANDARDS: 'moc_standards',
  THEME: 'moc_theme',
  AUDIT: 'moc_audit_trail'
};

export const storage = {
  get: <T,>(key: string, defaultValue: T): T => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },
  set: (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  },

  // Specialized methods
  getFacilities: () => storage.get<Facility[]>(STORAGE_KEYS.FACILITIES, INITIAL_FACILITIES),
  getUsers: () => storage.get<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS),
  getMOCs: () => storage.get<MOCRequest[]>(STORAGE_KEYS.MOCS, INITIAL_MOCS),
  getAssets: () => storage.get<Asset[]>(STORAGE_KEYS.ASSETS, INITIAL_ASSETS),
  getRisks: () => storage.get<RiskAssessment[]>(STORAGE_KEYS.RISKS, []),
  getWorkOrders: () => storage.get<WorkOrder[]>(STORAGE_KEYS.WORK_ORDERS, INITIAL_WORK_ORDERS),
  getStandards: () => storage.get<StandardLink[]>(STORAGE_KEYS.STANDARDS, []),
  getAuditTrail: () => storage.get<AuditEntry[]>(STORAGE_KEYS.AUDIT, []),

  addAuditEntry: (entry: AuditEntry) => {
    const logs = storage.getAuditTrail();
    logs.unshift(entry); 
    if (logs.length > 1000) logs.pop(); 
    storage.set(STORAGE_KEYS.AUDIT, logs);
  },

  saveMOC: (moc: MOCRequest) => {
    const mocs = storage.getMOCs();
    const index = mocs.findIndex(m => m.id === moc.id);
    if (index >= 0) mocs[index] = moc;
    else mocs.push(moc);
    storage.set(STORAGE_KEYS.MOCS, mocs);
  },
  
  saveRisk: (risk: RiskAssessment) => {
    const risks = storage.getRisks();
    const index = risks.findIndex(r => r.id === risk.id);
    if (index >= 0) risks[index] = risk;
    else risks.push(risk);
    storage.set(STORAGE_KEYS.RISKS, risks);
  },

  saveWorkOrder: (wo: WorkOrder) => {
    const wos = storage.getWorkOrders();
    const index = wos.findIndex(w => w.id === wo.id);
    if (index >= 0) wos[index] = wo;
    else wos.push(wo);
    storage.set(STORAGE_KEYS.WORK_ORDERS, wos);
  },

  saveFacility: (facility: Facility) => {
    const facilities = storage.getFacilities();
    const index = facilities.findIndex(f => f.id === facility.id);
    if (index >= 0) facilities[index] = facility;
    else facilities.push(facility);
    storage.set(STORAGE_KEYS.FACILITIES, facilities);
  },

  saveAsset: (asset: Asset) => {
    const assets = storage.getAssets();
    const index = assets.findIndex(a => a.id === asset.id);
    if (index >= 0) assets[index] = asset;
    else assets.push(asset);
    storage.set(STORAGE_KEYS.ASSETS, assets);
  },

  saveUser: (user: User) => {
    const users = storage.getUsers();
    const index = users.findIndex(u => u.id === user.id || u.email === user.email);
    if (index >= 0) users[index] = user;
    else users.push(user);
    storage.set(STORAGE_KEYS.USERS, users);
  }
};
