import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

import "../../styles/adminPages.css";
import LoadingSpinner from "../LoadingSpinner";
import CustomSnackbar from "../CustomSnackbar";
import {
  AgreementDocument,
  AgreementSteps,
  EMPTY_SIGNATURE,
  EVENT_LABELS,
  FILE_KIND_LABELS,
  SignatureFields,
  SignatureSummary,
  StatusBadge,
  checkSignature,
  formatBytes,
  formatDate,
  formatDateTime,
} from "../admin/shared";
import {
  listAgreements,
  getAgreement,
  signAgreement,
  downloadAgreementFile,
  downloadAgreementPdf,
} from "../../../services/agreementService";
import { getHomeRoute } from "../../../const/roles";

const OPEN = ["sent", "submitted", "rejected"];

const MyAgreement = ({ role }) => {
  const [loading, setLoading] = useState(true);
  const [all, setAll] = useState([]);
  const [open, setOpen] = useState(null); // agreement waiting on someone
  const [current, setCurrent] = useState(null); // the active (or expired) one
  const [sig, setSig] = useState(EMPTY_SIGNATURE);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const showMessage = (message, severity = "success") => setSnackbar({ open: true, message, severity });
  const handleClose = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const load = useCallback(async () => {
    const res = await listAgreements({ limit: 50 });
    if (!res.success) {
      setLoading(false);
      return showMessage(res.message || "Could not load your agreement.", "error");
    }
    const list = res.data || [];
    setAll(list);

    const openOne = list.find((a) => OPEN.includes(a.status));
    const liveOne = list.find((a) => a.status === "active") || list.find((a) => a.status === "expired");
    const [o, c] = await Promise.all([
      openOne ? getAgreement(openOne.id) : null,
      liveOne ? getAgreement(liveOne.id) : null,
    ]);
    setOpen(o?.success ? o.data : null);
    setCurrent(c?.success ? c.data : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const downloadFinal = async (agreement) => {
    const file = agreement.files.find((f) => f.kind === "final");
    const res = file
      ? await downloadAgreementFile(agreement.id, file)
      : await downloadAgreementPdf(agreement.id, `${agreement.reference}.pdf`);
    if (!res.success && res.message) showMessage(res.message, "error");
  };

  const handleSign = async () => {
    const problems = checkSignature(sig);
    setErrors(problems);
    if (Object.keys(problems).length) return;

    setBusy(true);
    const res = await signAgreement(open.id, {
      signed_name: sig.name.trim(),
      signature_image: sig.image || undefined,
      accept: true,
    });
    setBusy(false);

    if (res.success) {
      setSig(EMPTY_SIGNATURE);
      showMessage("Thank you. You have signed. The college will countersign it soon.");
      load();
    } else {
      setErrors(res.errors || {});
      showMessage(res.message || "Could not save your signature.", "error");
    }
  };

  const stepStatus = open ? open.status : current?.status;
  const expiringSoon = current?.status === "active" && Number(current.days_left) <= 60;
  const needsSignature = open && ["sent", "rejected"].includes(open.status);
  const shown = open || current; // the agreement whose text is on screen
  const finished = current?.files.some((f) => f.kind === "final");

  return (
    <div className="admin-page">
      <Link to={getHomeRoute(role)} className="admin-back">
        <ArrowBack fontSize="small" /> Dashboard
      </Link>

      <div className="admin-head">
        <h1>My agreement</h1>
        <p>Read your agreement and sign it here. Everything stays in the portal.</p>
      </div>

      {loading && <div className="admin-panel admin-empty">Loading your agreement...</div>}

      {!loading && !open && !current && (
        <div className="admin-panel admin-empty">
          <strong style={{ display: "block", marginBottom: 6 }}>No agreement yet</strong>
          The college will send your agreement here. You will get an email when it arrives.
        </div>
      )}

      {!loading && shown && (
        <section className="admin-panel">
          <AgreementSteps status={stepStatus} />
          <h2>{shown.title}</h2>

          {open?.status === "rejected" && (
            <div className="admin-notice is-danger">
              <strong>The college asked for changes</strong>
              {open.rejection_reason}
              <br />
              Please read the agreement again and sign it again.
            </div>
          )}
          {open?.note && open.status === "sent" && (
            <div className="admin-notice">
              <strong>Message from the college</strong>
              {open.note}
            </div>
          )}
          {open?.status === "submitted" && (
            <div className="admin-notice is-warning">
              <strong>Waiting for the college to countersign</strong>
              You signed on {formatDateTime(open.agent_signed_at)}. You will get an email when it is finished.
            </div>
          )}
          {!open && current?.status === "active" && (
            <div className={`admin-notice ${expiringSoon ? "is-warning" : "is-success"}`}>
              <strong>{expiringSoon ? "Your agreement is expiring soon" : "Your agreement is active"}</strong>
              Valid until {formatDate(current.expires_at)} ({current.days_left} days left).
              {expiringSoon && " The college will send you a renewal to sign."}
            </div>
          )}
          {!open && current?.status === "expired" && (
            <div className="admin-notice is-danger">
              <strong>Your agreement has expired</strong>
              It ended on {formatDate(current.expires_at)}. You cannot submit new students until a renewal is
              signed. Please contact the college.
            </div>
          )}

          {finished && !open && (
            <div className="action-row" style={{ margin: "4px 0 16px" }}>
              <button type="button" className="admin-btn" onClick={() => downloadFinal(current)}>
                Download signed agreement (PDF)
              </button>
            </div>
          )}

          <AgreementDocument blocks={shown.document} />

          {(shown.agent_sig_name || shown.admin_sig_name) && <SignatureSummary data={shown} />}

          {/* ---------- sign here ---------- */}
          {needsSignature && (
            <div className="sign-panel">
              <h3>Sign this agreement</h3>
              <p className="admin-hint">
                Please read the whole agreement above first. Your typed name is your signature. We record your name,
                the date and time, and your network address.
              </p>
              <SignatureFields
                value={sig}
                onChange={(v) => {
                  setSig(v);
                  setErrors({});
                }}
                errors={errors}
                statement={`I have read and agree to this agreement, and I sign it for ${
                  open.agency_name || "my agency"
                }. I understand a typed or drawn signature has the same effect as a handwritten one.`}
              />
              <div className="action-row" style={{ marginTop: 14 }}>
                <button type="button" className="admin-btn" onClick={handleSign} disabled={busy}>
                  Sign agreement
                </button>
                <button
                  type="button"
                  className="admin-btn is-ghost"
                  onClick={async () => {
                    const r = await downloadAgreementPdf(open.id, `${open.reference}.pdf`);
                    if (!r.success && r.message) showMessage(r.message, "error");
                  }}
                >
                  Download a copy to read (PDF)
                </button>
              </div>
            </div>
          )}

          {/* an active agreement stays valid while a renewal is in progress */}
          {open && current && current.status === "active" && (
            <p className="admin-hint" style={{ marginTop: 14 }}>
              Your current agreement stays valid until {formatDate(current.expires_at)} while this one is processed.
            </p>
          )}
        </section>
      )}

      {/* ---------- finished documents ---------- */}
      {!loading && current?.files.length > 0 && (
        <section className="admin-panel">
          <h2>Signed documents</h2>
          <ul className="file-list">
            {current.files.map((f) => (
              <li key={f.id} className="file-row">
                <div className="file-row-info">
                  <strong>{FILE_KIND_LABELS[f.kind] || f.kind}</strong>
                  <span>
                    {f.original_name} · {formatBytes(f.size_bytes)} · {formatDateTime(f.created_at)}
                  </span>
                </div>
                <button type="button" className="row-btn" onClick={async () => {
                    const r = await downloadAgreementFile(current.id, f);
                    if (!r.success && r.message) showMessage(r.message, "error");
                  }}>
                  Download
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- history ---------- */}
      {!loading && all.length > 0 && (
        <section className="admin-panel">
          <h2>All agreements</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Agreement</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Expires</th>
                  <th aria-label="Download" />
                </tr>
              </thead>
              <tbody>
                {all.map((a) => (
                  <tr key={a.id}>
                    <td data-label="Agreement">{a.title}</td>
                    <td data-label="Status">
                      <StatusBadge status={a.status} view="agent" />
                    </td>
                    <td data-label="Sent">{formatDate(a.sent_at)}</td>
                    <td data-label="Expires">{a.expires_at ? formatDate(a.expires_at) : "-"}</td>
                    <td data-label="">
                      <div className="cell-actions">
                        {a.final_file_id && (
                          <button
                            type="button"
                            className="row-btn"
                            onClick={async () => {
                              const r = await downloadAgreementFile(a.id, {
                                id: a.final_file_id,
                                original_name: `AGR-${String(a.id).padStart(5, "0")} signed.pdf`,
                              });
                              if (!r.success && r.message) showMessage(r.message, "error");
                            }}
                          >
                            Download PDF
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {open && open.events.length > 0 && (
        <section className="admin-panel">
          <h2>Progress</h2>
          <ul className="timeline">
            {open.events.map((e) => (
              <li key={e.id}>
                <strong>{EVENT_LABELS[e.type] || e.type}</strong>
                <span>{formatDateTime(e.created_at)}</span>
                {e.note && <p>{e.note}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <CustomSnackbar {...snackbar} onClose={handleClose} />
      <LoadingSpinner open={busy} />
    </div>
  );
};

export default MyAgreement;
