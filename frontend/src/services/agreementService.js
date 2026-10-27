import { API_ENDPOINTS } from "../const/const";
import { apiRequest, apiDownload, toQuery } from "./apiClient";

const A = API_ENDPOINTS.AGREEMENTS;
const T = API_ENDPOINTS.AGREEMENT_TEMPLATE;

// ---------- admin ----------
// params: { search?, agreement?: "none"|"sent"|"submitted"|"rejected"|"active"|"expiring"|"expired", page, limit }
export const listAgents = (params) =>
  apiRequest(`${API_ENDPOINTS.AGENTS.BASE}${toQuery(params)}`);

// body: { agent_id, title?, note?, validity_months? } - the wording comes from the template
export const sendAgreement = (body) => apiRequest(A.BASE, { method: "POST", body });

// body: { signed_name, position?, signature_image?, accept: true, effective_date?, validity_months? }
export const approveAgreement = (id, body) =>
  apiRequest(A.APPROVE(id), { method: "POST", body });

export const rejectAgreement = (id, reason) =>
  apiRequest(A.REJECT(id), { method: "POST", body: { reason } });

export const cancelAgreement = (id, reason) =>
  apiRequest(A.CANCEL(id), { method: "POST", body: reason ? { reason } : {} });

// the agreement wording the college edits once and every new agreement uses
export const getTemplate = () => apiRequest(T.BASE);
export const saveTemplate = (body) => apiRequest(T.BASE, { method: "PUT", body });
export const previewTemplate = (body) =>
  apiRequest(T.PREVIEW, { method: "POST", body: { body } });

// ---------- admin and agent (agents only ever see their own) ----------
// params: { status?, agent_id?, page, limit }
export const listAgreements = (params) =>
  apiRequest(`${A.BASE}${toQuery(params)}`);

export const getAgreement = (id) => apiRequest(A.BY_ID(id));

// the finished, fully signed file (or any stored file)
export const downloadAgreementFile = (agreementId, file) =>
  apiDownload(A.DOWNLOAD(agreementId, file.id), file.original_name);

// a PDF of the agreement as it stands now (the final one once both have signed)
export const downloadAgreementPdf = (id, fileName = "agreement.pdf") =>
  apiDownload(A.PDF(id), fileName);

// ---------- agent ----------
// body: { signed_name, signature_image?, accept: true }
export const signAgreement = (id, body) =>
  apiRequest(A.SIGN(id), { method: "POST", body });
