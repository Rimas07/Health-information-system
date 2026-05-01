export interface Patient {
  _id: string
  name: string
  dateOfBirth: string
  gender: string
  phone?: string
  email?: string
  address?: string
  createdAt: string
}

export interface AuditEvent {
  _id: string
  eventType: string
  tenantId: string
  userId?: string
  details?: string
  timestamp: string
}

export interface DashboardStats {
  totalTenants: number
  totalPatients: number
  totalAuditEvents: number
  systemStatus: 'online' | 'error'
  recentEvents: AuditEvent[]
  lastUpdated: string
}

export interface AuthResponse {
  accessToken: string
  tenantId: string
}

export interface Tenant {
  _id: string
  name: string
  domain: string
  isActive: boolean
  createdAt: string
}

export interface RateLimit {
  _id: string
  tenantId: string
  endpoint: string
  maxRequests: number
  windowMs: number
  createdAt: string
}
