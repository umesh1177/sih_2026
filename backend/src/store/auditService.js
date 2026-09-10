import { v4 as uuidv4 } from "uuid";

class AuditService {
  constructor() {
    this.logs = [];
  }

  log({ action, actorId, actorName, actorRole, targetEntity, targetId, details = {}, ipAddress = "127.0.0.1", organizationId, departmentId }) {
    const entry = {
      id: `aud_${uuidv4().substring(0, 8)}`,
      action,
      actorId: actorId || "system",
      actorName: actorName || "System Automated Process",
      actorRole: actorRole || "system",
      targetEntity,
      targetId: String(targetId),
      details: typeof details === "object" ? details : { raw: details },
      ipAddress,
      organizationId: organizationId || "org_imd_hq",
      departmentId: departmentId || null,
      createdAt: new Date().toISOString()
    };

    this.logs.unshift(entry);
    // Keep max 500 logs in memory/store
    if (this.logs.length > 500) {
      this.logs.pop();
    }
    return entry;
  }

  getLogs({ limit = 50, action, actorId, targetEntity, organizationId, departmentId } = {}) {
    let result = [...this.logs];
    if (action) result = result.filter(l => l.action === action);
    if (actorId) result = result.filter(l => l.actorId === actorId);
    if (targetEntity) result = result.filter(l => l.targetEntity === targetEntity);
    if (departmentId) result = result.filter(l => !l.departmentId || l.departmentId === departmentId);
    return result.slice(0, Number(limit) || 50);
  }
}

export const auditService = new AuditService();
