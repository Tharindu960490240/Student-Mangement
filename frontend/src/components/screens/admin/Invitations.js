import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

import "../../styles/adminPages.css";
import LoadingSpinner from "../LoadingSpinner";
import CustomSnackbar from "../CustomSnackbar";
import { ConfirmDialog, Pager, formatDate } from "./shared";
import {
  listInvitations,
  createInvitation,
  resendInvitation,
  revokeInvitation,
} from "../../../services/adminService";
import { ROLES, ROLE_LABELS, getHomeRoute } from "../../../const/roles";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[\p{L}][\p{L}\s'’.-]*$/u;
const PAGE_SIZE = 10;

const TABS = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "expired", label: "Expired" },
  { key: "revoked", label: "Revoked" },
];

// Admins can invite anyone. Agents can only invite students.
const INVITABLE = {
  [ROLES.ADMIN]: [ROLES.AGENT, ROLES.TEACHER, ROLES.STUDENT, ROLES.ADMIN],
  [ROLES.AGENT]: [ROLES.STUDENT],
};

const Invitations = ({ role }) => {
  const roles = INVITABLE[role] || [];

  const [form, setForm] = useState({
    email: "",
    first_name: "",
    role: roles[0] || "",
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadingList, setLoadingList] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [confirm, setConfirm] = useState(null); // invitation to revoke

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const showMessage = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });
  const handleClose = () => setSnackbar((prev) => ({ ...prev, open: false }));

  // ---------- load list (ignores out-of-date answers) ----------
  const latest = useRef(0);
  const load = useCallback(async () => {
    const id = ++latest.current;
    setLoadingList(true);
    const res = await listInvitations({ status, page, limit: PAGE_SIZE });
    if (id !== latest.current) return;
    setLoadingList(false);
    if (res.success) {
      setRows(res.data || []);
      setTotal(res.pagination?.total || 0);
    } else {
      showMessage(res.message || "Could not load invitations.", "error");
    }
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  // ---------- send ----------
  const validate = () => {
    const e = {};
    const email = form.email.trim();
    if (!EMAIL_REGEX.test(email)) e.email = "Enter a valid email address";
    const name = form.first_name.trim();
    if (name && (name.length > 50 || !NAME_REGEX.test(name)))
      e.first_name = "Enter a valid first name";
    if (!roles.includes(form.role)) e.role = "Choose a role";
    return e;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    const payload = { email: form.email.trim(), role: form.role };
    if (form.first_name.trim()) payload.first_name = form.first_name.trim();

    setSending(true);
    const res = await createInvitation(payload);
    setSending(false);

    if (res.success) {
      showMessage(`Invitation sent to ${payload.email}`);
      setForm((prev) => ({ ...prev, email: "", first_name: "" }));
      if (page !== 1 || status !== "") {
        setPage(1);
        setStatus("");
      } else {
        load();
      }
    } else {
      if (res.errors) setErrors(res.errors);
      showMessage(res.message || "Could not send the invitation.", "error");
    }
  };

  // ---------- resend / revoke ----------
  const handleResend = async (item) => {
    setBusyId(item.id);
    const res = await resendInvitation(item.id);
    setBusyId(null);
    if (res.success) {
      showMessage(`New invitation sent to ${item.email}`);
      load();
    } else {
      showMessage(res.message || "Could not resend the invitation.", "error");
    }
  };

  const handleRevoke = async () => {
    const item = confirm;
    setConfirm(null);
    if (!item) return;
    setBusyId(item.id);
    const res = await revokeInvitation(item.id);
    setBusyId(null);
    if (res.success) {
      showMessage("Invitation revoked");
      load();
    } else {
      showMessage(res.message || "Could not revoke the invitation.", "error");
    }
  };

  const setField = (name) => (e) => {
    setForm((prev) => ({ ...prev, [name]: e.target.value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  return (
    <div className="admin-page">
      <Link to={getHomeRoute(role)} className="admin-back">
        <ArrowBack fontSize="small" /> Dashboard
      </Link>

      <div className="admin-head">
        <h1>Invitations</h1>
        <p>
          People can only join by invitation. Each link works once and expires
          after 7 days.
        </p>
      </div>

      {/* ---------- send ---------- */}
      <form className="admin-panel" onSubmit={handleSubmit} noValidate>
        <h2>Invite someone</h2>
        <div className="invite-form">
          <div className={`admin-field${errors.email ? " has-error" : ""}`}>
            <label htmlFor="inv-email">Email address</label>
            <input
              id="inv-email"
              type="email"
              autoComplete="off"
              placeholder="name@example.com"
              value={form.email}
              onChange={setField("email")}
            />
            {errors.email && <span className="admin-error">{errors.email}</span>}
          </div>

          <div className={`admin-field${errors.first_name ? " has-error" : ""}`}>
            <label htmlFor="inv-name">First name (optional)</label>
            <input
              id="inv-name"
              type="text"
              autoComplete="off"
              value={form.first_name}
              onChange={setField("first_name")}
            />
            {errors.first_name && (
              <span className="admin-error">{errors.first_name}</span>
            )}
          </div>

          <div className={`admin-field${errors.role ? " has-error" : ""}`}>
            <label htmlFor="inv-role">Role</label>
            <select id="inv-role" value={form.role} onChange={setField("role")}>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            {errors.role && <span className="admin-error">{errors.role}</span>}
          </div>

          <button type="submit" className="admin-btn" disabled={sending}>
            Send invitation
          </button>
        </div>
      </form>

      {/* ---------- list ---------- */}
      <section className="admin-panel">
        <div className="admin-toolbar">
          <h2 style={{ margin: 0 }}>Sent invitations</h2>
          <div className="filter-tabs" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.key || "all"}
                type="button"
                role="tab"
                aria-selected={status === tab.key}
                className={`filter-tab${status === tab.key ? " is-active" : ""}`}
                onClick={() => {
                  setStatus(tab.key);
                  setPage(1);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Expires</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const open = item.status === "pending";
                const canResend = item.status !== "accepted";
                const busy = busyId === item.id;
                return (
                  <tr key={item.id}>
                    <td data-label="Email">
                      <div className="cell-main">{item.email}</div>
                      {item.first_name && (
                        <div className="cell-sub">{item.first_name}</div>
                      )}
                    </td>
                    <td data-label="Role">{ROLE_LABELS[item.role] || item.role}</td>
                    <td data-label="Status">
                      <span className={`badge badge-${item.status}`}>
                        {item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)}
                      </span>
                    </td>
                    <td data-label="Sent">{formatDate(item.created_at)}</td>
                    <td data-label="Expires">{item.status === "accepted" ? "-" : formatDate(item.expires_at)}</td>
                    <td data-label="">
                      <div className="cell-actions">
                        {canResend && (
                          <button
                            type="button"
                            className="row-btn"
                            disabled={busy}
                            onClick={() => handleResend(item)}
                          >
                            Resend
                          </button>
                        )}
                        {open && (
                          <button
                            type="button"
                            className="row-btn is-danger"
                            disabled={busy}
                            onClick={() => setConfirm(item)}
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!rows.length && (
            <div className="admin-empty">
              {loadingList
                ? "Loading invitations..."
                : status
                  ? "No invitations with this status."
                  : "No invitations yet. Send the first one above."}
            </div>
          )}
        </div>

        <Pager
          page={page}
          limit={PAGE_SIZE}
          total={total}
          disabled={loadingList}
          onChange={setPage}
        />
      </section>

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Revoke invitation?"
        text={
          confirm
            ? `The link sent to ${confirm.email} will stop working straight away. You can send a new one later.`
            : ""
        }
        confirmLabel="Revoke"
        danger
        onConfirm={handleRevoke}
        onCancel={() => setConfirm(null)}
      />

      <CustomSnackbar {...snackbar} onClose={handleClose} />
      <LoadingSpinner open={sending} />
    </div>
  );
};

export default Invitations;
