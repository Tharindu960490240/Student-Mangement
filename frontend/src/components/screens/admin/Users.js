import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

import "../../styles/adminPages.css";
import LoadingSpinner from "../LoadingSpinner";
import CustomSnackbar from "../CustomSnackbar";
import { ConfirmDialog, Pager, formatDate, formatDateTime } from "./shared";
import { listUsers, setUserStatus } from "../../../services/adminService";
import { ROLES, ROLE_LABELS, getHomeRoute } from "../../../const/roles";

const PAGE_SIZE = 10;

const Users = ({ role, user }) => {
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadingList, setLoadingList] = useState(true);
  const [working, setWorking] = useState(false);
  const [confirm, setConfirm] = useState(null); // { user, status }

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const showMessage = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });
  const handleClose = () => setSnackbar((prev) => ({ ...prev, open: false }));

  // wait until the person stops typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchText]);

  const latest = useRef(0);
  const load = useCallback(async () => {
    const id = ++latest.current;
    setLoadingList(true);
    const res = await listUsers({
      role: roleFilter,
      status: statusFilter,
      search,
      page,
      limit: PAGE_SIZE,
    });
    if (id !== latest.current) return;
    setLoadingList(false);
    if (res.success) {
      setRows(res.data || []);
      setTotal(res.pagination?.total || 0);
    } else {
      showMessage(res.message || "Could not load users.", "error");
    }
  }, [roleFilter, statusFilter, search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleConfirm = async () => {
    const { user: target, status } = confirm;
    setConfirm(null);
    setWorking(true);
    const res = await setUserStatus(target.id, status);
    setWorking(false);
    if (res.success) {
      showMessage(
        status === "suspended"
          ? `${target.first_name} ${target.last_name} was suspended`
          : `${target.first_name} ${target.last_name} was reactivated`,
      );
      load();
    } else {
      showMessage(res.message || "Could not update this user.", "error");
    }
  };

  const suspending = confirm?.status === "suspended";

  return (
    <div className="admin-page">
      <Link to={getHomeRoute(role)} className="admin-back">
        <ArrowBack fontSize="small" /> Dashboard
      </Link>

      <div className="admin-head">
        <h1>Users</h1>
        <p>Everyone who has an account. Suspended people cannot sign in.</p>
      </div>

      <section className="admin-panel">
        <div className="admin-toolbar">
          <div className="filter-controls">
            <input
              className="admin-input is-search"
              type="search"
              placeholder="Search name or email"
              aria-label="Search users"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <select
              className="admin-input"
              aria-label="Filter by role"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All roles</option>
              {Object.values(ROLES).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            <select
              className="admin-input"
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last sign-in</th>
                <th>Joined</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const isSelf = user && u.id === user.id;
                const isActive = u.status === "active";
                return (
                  <tr key={u.id}>
                    <td data-label="Name">
                      <div className="cell-main">
                        {u.first_name} {u.last_name}
                        {isSelf ? " (you)" : ""}
                      </div>
                      <div className="cell-sub">{u.email}</div>
                    </td>
                    <td data-label="Role">{ROLE_LABELS[u.role] || u.role}</td>
                    <td data-label="Status">
                      <span className={`badge badge-${u.status}`}>
                        {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                      </span>
                    </td>
                    <td data-label="Last sign-in">{formatDateTime(u.last_login_at)}</td>
                    <td data-label="Joined">{formatDate(u.created_at)}</td>
                    <td data-label="">
                      <div className="cell-actions">
                        <button
                          type="button"
                          className={`row-btn${isActive ? " is-danger" : ""}`}
                          disabled={isSelf || working}
                          title={isSelf ? "You cannot change your own status" : ""}
                          onClick={() =>
                            setConfirm({
                              user: u,
                              status: isActive ? "suspended" : "active",
                            })
                          }
                        >
                          {isActive ? "Suspend" : "Reactivate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!rows.length && (
            <div className="admin-empty">
              {loadingList ? "Loading users..." : "No users match these filters."}
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
        title={suspending ? "Suspend this user?" : "Reactivate this user?"}
        text={
          confirm
            ? suspending
              ? `${confirm.user.first_name} ${confirm.user.last_name} will be signed out everywhere and will not be able to sign in until you reactivate them.`
              : `${confirm.user.first_name} ${confirm.user.last_name} will be able to sign in again.`
            : ""
        }
        confirmLabel={suspending ? "Suspend" : "Reactivate"}
        danger={suspending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />

      <CustomSnackbar {...snackbar} onClose={handleClose} />
      <LoadingSpinner open={working} />
    </div>
  );
};

export default Users;
