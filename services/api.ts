
import { storage } from './storage';
import { User, UserRole, AuthResponse, Facility, MOCRequest, RiskAssessment, Asset, WorkOrder, MOCHistoryEntry, AuditEntry, MOCStatus, AuditChange } from '../types';
import { GoogleGenAI } from "@google/genai";

const RBAC_RULES: Record<string, { read: UserRole[], write: UserRole[] }> = {
  FACILITIES: {
    read: [UserRole.ADMIN, UserRole.GERENTE_INSTALACAO, UserRole.ENG_PROCESSO],
    write: [UserRole.ADMIN, UserRole.GERENTE_INSTALACAO]
  },
  ASSETS: {
    read: [UserRole.ADMIN, UserRole.GERENTE_INSTALACAO, UserRole.TECNICO_MANUTENCAO],
    write: [UserRole.ADMIN, UserRole.GERENTE_INSTALACAO, UserRole.TECNICO_MANUTENCAO]
  },
  MOCS: {
    read: [UserRole.ADMIN, UserRole.GERENTE_INSTALACAO, UserRole.ENG_PROCESSO, UserRole.COORD_HSE, UserRole.COMITE_APROVACAO],
    write: [UserRole.ADMIN, UserRole.ENG_PROCESSO, UserRole.GERENTE_INSTALACAO, UserRole.COMITE_APROVACAO]
  },
  RISKS: {
    read: [UserRole.ADMIN, UserRole.ENG_PROCESSO, UserRole.COORD_HSE],
    write: [UserRole.ADMIN, UserRole.ENG_PROCESSO, UserRole.COORD_HSE]
  },
  WORK_ORDERS: {
    read: [UserRole.ADMIN, UserRole.TECNICO_MANUTENCAO, UserRole.GERENTE_INSTALACAO],
    write: [UserRole.ADMIN, UserRole.TECNICO_MANUTENCAO]
  },
  ADMIN_USERS: {
    read: [UserRole.ADMIN],
    write: [UserRole.ADMIN]
  },
  AUDIT_TRAIL: {
    read: [UserRole.ADMIN],
    write: [UserRole.ADMIN]
  }
};

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('moc_token');
  }

  public validateToken(token: string | null): User | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token));
      if (payload.exp < Date.now()) return null;
      return payload.user;
    } catch (e) {
      return null;
    }
  }

  private calculateDiff(oldObj: any, newObj: any): AuditChange[] {
    const changes: AuditChange[] = [];
    const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    keys.forEach(key => {
      if (['history', 'updatedAt', 'id'].includes(key)) return;

      const oldVal = oldObj[key];
      const newVal = newObj[key];

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          field: key,
          oldValue: oldVal,
          newValue: newVal
        });
      }
    });

    return changes;
  }

  private logAudit(user: User, action: AuditEntry['action'], resource: string, details?: string, changes?: AuditChange[]) {
    storage.addAuditEntry({
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      resource,
      timestamp: new Date().toLocaleString(),
      details,
      changes
    });
  }

  private async _secureRequest<T>(resource: string, action: 'read' | 'write', callback: () => T, customDetails?: string, changes?: AuditChange[]): Promise<T> {
    const token = this.getToken();
    const user = this.validateToken(token);

    if (!user) {
      this.logout();
      throw new Error('401: Sessão expirada ou não autenticada.');
    }

    const rules = RBAC_RULES[resource];
    const isAllowed = rules[action].includes(user.role) || user.role === UserRole.ADMIN;

    if (!isAllowed) {
      this.logAudit(user, 'SECURITY_VIOLATION', resource, `TENTATIVA NEGADA: ${user.name} (${user.role}) tentou realizar ${action} em ${resource}`);
      throw new Error(`403: Acesso negado. O perfil ${user.role} não tem permissão.`);
    }

    const result = callback();
    
    if (action === 'write') {
      this.logAudit(user, 'WRITE', resource, customDetails || 'Acesso Autorizado', changes);
    }

    await new Promise(resolve => setTimeout(resolve, 100));
    return result;
  }

  /**
   * Geocodificação inteligente de localização utilizando Gemini com Maps Grounding.
   * Agora extrai metadados contextuais para um dossier de localização mais rico.
   */
  async geocodeFacilityLocation(locationName: string): Promise<{ lat: number, lng: number, address?: string, mapUrl?: string, snippet?: string }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const prompt = `Analise tecnicamente a localização geográfica para esta instalação industrial: "${locationName}".
    Determine as coordenadas exatas de Latitude e Longitude (decimais). 
    Pense em campos de petróleo offshore se o contexto sugerir Bacias (Campos, Santos, etc).
    Retorne OBRIGATORIAMENTE um JSON com este formato:
    {
      "lat": -22.123,
      "lng": -40.123,
      "address": "Endereço formatado ou descrição da bacia",
      "snippet": "Breve contexto sobre a importância estratégica da área"
    }`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
        },
      });

      const text = response.text || "";
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const mapUrl = groundingChunks.find(chunk => chunk.maps?.uri)?.maps?.uri;

      // Extração resiliente de JSON
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return {
          lat: data.lat,
          lng: data.lng,
          address: data.address,
          snippet: data.snippet,
          mapUrl: mapUrl
        };
      }
    } catch (e) {
      console.warn("Falha na geocodificação Gemini:", e);
    }

    // Fallback padrão se houver falha na rede ou IA
    return { lat: -22.5000, lng: -40.5000, address: "Bacia de Campos (Aproximado)", snippet: "Localização baseada em histórico regional offshore." };
  }

  async login(email: string): Promise<AuthResponse> {
    const users = storage.getUsers();
    const user = users.find(u => u.email === email && u.active);
    if (!user) throw new Error('401: Credenciais inválidas.');
    
    const payload = { user, exp: Date.now() + (60 * 60 * 1000), iat: Date.now(), type: 'access' };
    const token = btoa(JSON.stringify(payload));
    const refreshToken = btoa(JSON.stringify({ userId: user.id, exp: Date.now() + (7 * 24 * 60 * 60 * 1000), iat: Date.now(), type: 'refresh' }));
    
    localStorage.setItem('moc_token', token);
    localStorage.setItem('moc_refresh_token', refreshToken);
    localStorage.setItem('moc_current_user', JSON.stringify(user));

    this.logAudit(user, 'LOGIN', 'AUTHENTICATION', `Login realizado com sucesso: ${email}`);
    
    return { user, token, refreshToken };
  }

  async refreshToken(rToken: string): Promise<AuthResponse> {
    try {
      const payload = JSON.parse(atob(rToken));
      const users = storage.getUsers();
      const user = users.find(u => u.id === payload.userId && u.active);
      if (!user) throw new Error('Usuário não encontrado.');
      const newToken = btoa(JSON.stringify({ user, exp: Date.now() + (60 * 60 * 1000), iat: Date.now(), type: 'access' }));
      localStorage.setItem('moc_token', newToken);
      return { user, token: newToken, refreshToken: rToken };
    } catch (e) {
      this.logout();
      throw new Error('401: Falha na renovação.');
    }
  }

  async resetPassword(email: string): Promise<void> {
    const users = storage.getUsers();
    const user = users.find(u => u.email === email);
    if (!user) throw new Error('404: E-mail não cadastrado.');
  }

  logout() {
    const userJson = localStorage.getItem('moc_current_user');
    if (userJson) {
        const user = JSON.parse(userJson);
        this.logAudit(user, 'LOGOUT', 'AUTHENTICATION', 'Logout realizado');
    }
    localStorage.removeItem('moc_token');
    localStorage.removeItem('moc_refresh_token');
    localStorage.removeItem('moc_current_user');
  }

  async getFacilities(): Promise<Facility[]> {
    return this._secureRequest('FACILITIES', 'read', () => storage.getFacilities());
  }

  async createFacility(facility: Facility): Promise<void> {
    return this._secureRequest('FACILITIES', 'write', () => {
      storage.saveFacility(facility);
    }, `Criação de Unidade: ${facility.name}`);
  }

  async updateFacility(facility: Facility): Promise<void> {
    const facilities = storage.getFacilities();
    const oldFacility = facilities.find(f => f.id === facility.id);
    if (!oldFacility) throw new Error('Unidade não encontrada para atualização.');
    
    const changes = this.calculateDiff(oldFacility, facility);

    return this._secureRequest('FACILITIES', 'write', () => {
      storage.saveFacility(facility);
    }, `Edição de Unidade: ${facility.name}`, changes);
  }

  async deleteFacility(id: string): Promise<void> {
    const facilities = storage.getFacilities();
    const facility = facilities.find(f => f.id === id);
    if (!facility) throw new Error('Unidade não encontrada para exclusão.');

    return this._secureRequest('FACILITIES', 'write', () => {
      const filtered = facilities.filter(f => f.id !== id);
      storage.set('moc_facilities', filtered);
    }, `Remoção de Unidade: ${facility.name} (ID: ${id})`);
  }

  async getAssets(): Promise<Asset[]> {
    return this._secureRequest('ASSETS', 'read', () => storage.getAssets());
  }

  async createAsset(asset: Asset): Promise<void> {
    return this._secureRequest('ASSETS', 'write', () => {
      storage.saveAsset(asset);
    }, `Criação de Equipamento: ${asset.name} (TAG: ${asset.tag})`);
  }

  async updateAsset(asset: Asset): Promise<void> {
    const assets = storage.getAssets();
    const oldAsset = assets.find(a => a.id === asset.id);
    if (!oldAsset) throw new Error('Equipamento não encontrado para atualização.');
    
    const changes = this.calculateDiff(oldAsset, asset);

    return this._secureRequest('ASSETS', 'write', () => {
      storage.saveAsset(asset);
    }, `Edição de Equipamento: ${asset.name} (TAG: ${asset.tag})`, changes);
  }

  async getMOCs(): Promise<MOCRequest[]> {
    return this._secureRequest('MOCS', 'read', () => storage.getMOCs());
  }

  async getMOCById(id: string): Promise<MOCRequest | null> {
    return this._secureRequest('MOCS', 'read', () => {
      const mocs = storage.getMOCs();
      return mocs.find(m => m.id === id) || null;
    });
  }

  async updateMOC(moc: MOCRequest): Promise<void> {
    const mocs = storage.getMOCs();
    const oldMoc = mocs.find(m => m.id === moc.id);
    if (!oldMoc) throw new Error('404: MOC não encontrada.');

    const changes = this.calculateDiff(oldMoc, moc);

    return this._secureRequest('MOCS', 'write', () => {
      if (moc.status === MOCStatus.REJEITADO) {
        const latestHistory = moc.history[0];
        if (!latestHistory || !latestHistory.details) {
            throw new Error('400: Para rejeitar uma MOC, é obrigatório fornecer uma justificativa técnica.');
        }
      }

      const index = mocs.findIndex(m => m.id === moc.id);
      if (index >= 0) {
        mocs[index] = { ...moc, updatedAt: new Date().toLocaleString() };
        storage.set('moc_requests', mocs);
      }

      if (oldMoc.status !== MOCStatus.APROVADO && moc.status === MOCStatus.APROVADO) {
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 7);
        const dueDateString = defaultDueDate.toISOString().split('T')[0];

        const autoWO: WorkOrder = {
          id: `WO-AUTO-${Date.now().toString().slice(-4)}`,
          mocId: moc.id,
          title: `IMPLEMENTAÇÃO: ${moc.title}`,
          assignedTo: 'Responsável Técnico (Pendente)',
          dueDate: dueDateString,
          status: 'Pendente',
          createdAt: new Date().toLocaleString()
        };

        storage.saveWorkOrder(autoWO);
        
        const autoHistory: MOCHistoryEntry = {
          id: `hist-auto-${Date.now()}`,
          userId: 'system',
          userName: 'AUTOMAÇÃO MOC',
          action: 'Ordem de Serviço Gerada Automaticamente',
          timestamp: new Date().toLocaleString(),
          type: 'system',
          details: `A aprovação disparou a criação da OS ${autoWO.id} para execução do escopo técnico.`
        };
        
        if (index >= 0) {
           mocs[index].history.unshift(autoHistory);
           storage.set('moc_requests', mocs);
        }
      }
    }, `Atualizando MOC ${moc.id} para ${moc.status}`, changes);
  }

  async createWorkOrder(wo: WorkOrder): Promise<void> {
    return this._secureRequest('WORK_ORDERS', 'write', () => {
      storage.saveWorkOrder(wo);
    }, `Criação de OS vinculada a MOC ${wo.mocId}`);
  }

  async linkMultipleWorkOrders(woIds: string[], mocId: string): Promise<void> {
    return this._secureRequest('WORK_ORDERS', 'write', () => {
      const wos = storage.getWorkOrders();
      woIds.forEach(woId => {
        const index = wos.findIndex(w => w.id === woId);
        if (index >= 0) {
          wos[index] = { ...wos[index], mocId };
        }
      });
      storage.set('moc_work_orders', wos);
    }, `Vínculo técnico de ${woIds.length} pendências operacionais à MOC ${mocId}`);
  }

  async createMOC(data: MOCRequest): Promise<void> {
    return this._secureRequest('MOCS', 'write', () => storage.saveMOC(data), `Criando MOC: ${data.title}`);
  }

  async getWorkOrdersByMOC(mocId: string): Promise<WorkOrder[]> {
    return this._secureRequest('WORK_ORDERS', 'read', () => {
      const all = storage.getWorkOrders();
      return all.filter(wo => wo.mocId === mocId);
    });
  }

  async getUnlinkedWorkOrders(): Promise<WorkOrder[]> {
    return this._secureRequest('WORK_ORDERS', 'read', () => {
      const all = storage.getWorkOrders();
      return all.filter(wo => !wo.mocId || wo.mocId === '');
    });
  }

  async getRisks(): Promise<RiskAssessment[]> {
    return this._secureRequest('RISKS', 'read', () => storage.getRisks());
  }

  async getWorkOrders(): Promise<WorkOrder[]> {
    return this._secureRequest('WORK_ORDERS', 'read', () => storage.getWorkOrders());
  }

  async getUsers(): Promise<User[]> {
    return this._secureRequest('ADMIN_USERS', 'read', () => storage.getUsers());
  }

  async createUser(user: User): Promise<void> {
    return this._secureRequest('ADMIN_USERS', 'write', () => {
      storage.saveUser(user);
    }, `Criação de novo usuário: ${user.email} (${user.role})`);
  }

  async getAuditTrail(): Promise<AuditEntry[]> {
    return this._secureRequest('AUDIT_TRAIL', 'read', () => storage.getAuditTrail());
  }
}

export const api = new ApiService();
