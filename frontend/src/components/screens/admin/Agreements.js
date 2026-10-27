import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

import "../../styles/adminPages.css";
import CustomSnackbar from "../CustomSnackbar";
import { Pager, StatusBadge, formatDate } from "./shared";
import { listAgreements, downloadAgreementFile } from "../../../services/agreementService";
import { getHomeRoute } from "../../../const/roles";

const PAGE_SIZE = 10;

const TABS = [
  { key: "", label: "All" },
  { key: "submitted", label: "Needs countersigning" },
  { key: "sent", label: "Waiting for agent" },
  { key: "rejected", label: "Changes requested" },
  { key: "active", label: "Active" },
  { key: "expired", label: "Expired" },
  { key: "cancelled", label: "Cancelled" },
];

const Agreements = ({ role }) => {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadingList, setLoadingList] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });
  const handleClose = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const latest = useRef(0);
  const load = useCallback(async () => {
    const id = ++latest.current;
    setLoadingList(true);
    const res = await listAgreements({ status, page, limit: PAGE_SIZE });
    if (id !== latest.current) return;
    setLoadingList(false);
    if (res.success) {
      setRows(res.data || []);
      setTotal(res.pagination?.total || 0);
    } else {
      setSnackbar({ open: true, message: res.message || "Could not load agreements.", severity: "error" });
    }
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="admin-page">
      <Link to={getHomeRoute(role)} className="admin-back">
        <ArrowBack fontSize="small" /> Dashboard
      </Link>

      <div className="admin-head">
        <h1>Agreements</h1>
        <p>
          Agreements waiting for you to countersign are listed first.{" "}
          <Link className="admin-link" to="/admin/agreements/template">Edit agreement template</Link>
        </p>
      </div>

      <section className="admin-panel">
        <div className="admin-toolbar">
          <div className="filter-tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.key || "all"}
                type="button"
                role="tab"
                aria-selected={status === t.key}
                className={`filter-tab${status === t.key ? " is-active" : ""}`}
                onClick={() => {
                  setStatus(t.key);
                  setPage(1);
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Agreement</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Expires</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td data-label="Agent">
                    <div className="cell-main">
                      {a.agent_first_name} {a.agent_last_name}
                    </div>
                    <div className="cell-sub">{a.agency_name || a.agent_email}</div>
                  </td>
                  <td data-label="Agreement">{a.title}</td>
                  <td data-label="Status">
                    <StatusBadge status={a.status} />
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
                            if (!r.success)
                              setSnackbar({ open: true, message: r.message || "Could not download the file.", severity: "error" });
                          }}
                        >
                          Download PDF
                        </button>
                      )}
                      <Link className="row-btn" to={`/admin/agreements/${a.id}`} style={{ textDecoration: "none" }}>
                        {a.status === "submitted" ? "Countersign" : "View"}
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <div className="admin-empty">
              {loadingList ? "Loading agreements..." : "No agreements here yet. Send one from the Agents page."}
            </div>
          )}
        </div>

        <Pager page={page} limit={PAGE_SIZE} total={total} disabled={loadingList} onChange={setPage} />
      </section>

      <CustomSnackbar {...snackbar} onClose={handleClose} />
    </div>
  );
};

export default Agreements;
