import { db } from "../store/dbStore.js";
import { auditService } from "../store/auditService.js";

export const getOrganizations = (req, res) => {
  try {
    const orgs = db.getOrganizations();
    return res.json({ success: true, count: orgs.length, organizations: orgs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartments = (req, res) => {
  try {
    const { organizationId } = req.query;
    const depts = db.getDepartments(organizationId);
    return res.json({ success: true, count: depts.length, departments: depts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartmentStructure = (req, res) => {
  try {
    const stats = db.getDepartmentStats(req.user);
    return res.json({
      success: true,
      count: stats.length,
      adminScope: req.user?.adminScope || "ORGANIZATION",
      structure: stats
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAuditLogs = (req, res) => {
  try {
    const { limit, action, targetEntity } = req.query;
    const logs = auditService.getLogs({
      limit,
      action,
      targetEntity,
      departmentId: req.user?.adminScope === "DEPARTMENT" ? req.user.departmentId : null
    });
    return res.json({ success: true, count: logs.length, auditLogs: logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
