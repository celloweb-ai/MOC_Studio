
export type MOCStatus = 'Draft' | 'Evaluation' | 'Approved' | 'Implementation' | 'Completed';
export type MOCPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ChangeType = 'Mechanical' | 'Process' | 'Procedure' | 'Personnel' | 'Electrical' | 'Instrumentation' | 'Civil';
export type TaskStatus = 'To Do' | 'In Progress' | 'Blocked' | 'Done';

export interface Attachment {
  name: string;
  type: string;
  size: number;
  data: string;
}

export interface MOCTask {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  completed: boolean;
  status: TaskStatus;
  type: 'Pre' | 'Post'; // Pre-implementation or Post-implementation
}

export interface AuditEntry {
  timestamp: number;
  user: string;
  action: string;
  details: string;
}

export interface RiskAssessment {
  probability: number;
  severity: number;
  score: number;
  rationale: string;
  assessedAt: number;
}

export interface RegulatoryStandard {
  id: string;
  code: string;
  title: string;
  status: 'Active' | 'Compliance' | 'Technical';
  desc: string;
  link?: string;
}

export interface UsefulLink {
  id: string;
  label: string;
  url: string;
  icon: string; // Key for the icon map
}

export interface MOCRequest {
  id: string;
  title: string;
  requester: string;
  status: MOCStatus;
  priority: MOCPriority;
  changeType: ChangeType;
  discipline: string; // New field as requested
  facility: string;
  createdAt: string;
  impacts: {
    safety: boolean;
    environmental: boolean;
    operational: boolean;
    regulatory: boolean;
    emergency: boolean;
  };
  description: string;
  riskScore: number;
  riskAssessment?: RiskAssessment;
  technicalSummary?: string;
  technicalAssessment?: string;
  attachments?: Attachment[];
  tasks?: MOCTask[];
  auditLog: AuditEntry[];
  relatedAssetTags?: string[];
}

export interface Facility {
  id: string;
  name: string;
  type: 'FPSO' | 'Fixed' | 'Onshore';
  coordinates: [number, number];
  status: 'Online' | 'Offline' | 'Maintenance';
}

export interface Asset {
  tag: string;
  name: string;
  facility: string;
  type: string;
  category: string; // New field
  material: string; // New field
  lastMaint: string;
  parameters: {
    temperature: number;
    pressure: number;
    flow: number;
  };
  attachments?: Attachment[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Engineer' | 'Manager' | 'Auditor';
  status?: 'Active' | 'Suspended';
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: number;
  read: boolean;
  link?: string;
}

export type Language = 'en-US' | 'pt-BR';
export type Theme = 'dark' | 'light';
