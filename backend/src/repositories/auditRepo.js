const { query } = require("../config/db");

// Never throws: a failed audit write must not break the user's request.
async function log({ actorId = null, action, entityType = null, entityId = null, ip = null, userAgent = null, metadata = {} }, client) {
  try {
    await (client || { query }).query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, ip, user_agent, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [actorId, action, entityType, entityId == null ? null : String(entityId), ip, userAgent, JSON.stringify(metadata)],
    );
  } catch (err) {
    console.error("audit log failed:", err.message);
  }
}
module.exports = { log };
