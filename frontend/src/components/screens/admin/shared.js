import React, { useEffect, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";

// 12 Nov 2026
const toDate = (value) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(value);
};

export const formatDate = (value) => {
  if (!value) return "-";
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// 12 Nov 2026, 3:45 pm
export const formatDateTime = (value) => {
  if (!value) return "Never";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Never";
  return d.toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const ConfirmDialog = ({
  open,
  title,
  text,
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
  onCancel,
}) => (
  <Dialog
    open={open}
    onClose={onCancel}
    maxWidth="xs"
    fullWidth
    slotProps={{
      paper: {
        style: {
          background: "var(--card-color)",
          borderRadius: 14,
        },
      },
    }}
  >
    <DialogTitle className="admin-dialog-title">{title}</DialogTitle>
    <DialogContent>
      <p className="admin-dialog-text">{text}</p>
    </DialogContent>
    <div className="admin-dialog-actions">
      <button type="button" className="admin-btn is-ghost" onClick={onCancel}>
        Cancel
      </button>
      <button
        type="button"
        className={`admin-btn${danger ? " is-danger" : ""}`}
        onClick={onConfirm}
      >
        {confirmLabel}
      </button>
    </div>
  </Dialog>
);

export const Pager = ({ page, limit, total, onChange, disabled }) => {
  if (!total) return null;
  const pages = Math.max(1, Math.ceil(total / limit));
  const from = (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);

  return (
    <div className="admin-pager">
      <span>
        {from}-{to} of {total}
      </span>
      <div className="admin-pager-buttons">
        <button
          type="button"
          className="row-btn"
          disabled={disabled || page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className="row-btn"
          disabled={disabled || page >= pages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

// ===============================
// Agreements: shared pieces
// ===============================
const STATUS_LABELS = {
  admin: {
    none: "No agreement",
    sent: "Waiting for agent",
    submitted: "Needs countersigning",
    rejected: "Changes requested",
    active: "Active",
    expired: "Expired",
    cancelled: "Cancelled",
    superseded: "Replaced",
  },
  agent: {
    none: "No agreement",
    sent: "Ready to sign",
    submitted: "Awaiting college",
    rejected: "Changes needed",
    active: "Active",
    expired: "Expired",
    cancelled: "Withdrawn",
    superseded: "Replaced",
  },
};

export const StatusBadge = ({ status, view = "admin" }) => {
  const key = status || "none";
  return (
    <span className={`badge badge-${key}`}>
      {STATUS_LABELS[view][key] || key}
    </span>
  );
};

export const FILE_KIND_LABELS = {
  template: "Agreement from the college",
  signed_by_agent: "Signed by the agent",
  countersigned: "Countersigned by the college",
  final: "Final signed agreement",
};

export const EVENT_LABELS = {
  sent: "Agreement sent",
  submitted: "Signed by the agent",
  rejected: "Changes requested",
  approved: "Countersigned by the college",
  cancelled: "Cancelled",
};

export const formatBytes = (n) => {
  if (!n && n !== 0) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

// ===============================
// Reading and signing inside the portal
// ===============================
// Shows the agreement wording (blocks come from the API: h1, h2, p).
export const AgreementDocument = ({ blocks = [] }) => (
  <article className="agreement-doc" aria-label="Agreement text">
    {blocks.map((b, i) =>
      b.type === "h1" ? (
        <h2 key={i} className="agreement-doc-title">{b.text}</h2>
      ) : b.type === "h2" ? (
        <h3 key={i}>{b.text}</h3>
      ) : (
        <p key={i}>{b.text}</p>
      )
    )}
  </article>
);

// A small drawing box. Calls onChange with a PNG data URL, or "" when empty.
export const SignaturePad = ({ onChange, disabled = false }) => {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1b1f2a";
  }, []);

  const point = (e) => {
    const c = canvasRef.current;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };

  const down = (e) => {
    if (disabled) return;
    e.preventDefault();
    canvasRef.current.setPointerCapture?.(e.pointerId);
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.01, p.y + 0.01); // a tap leaves a dot
    ctx.stroke();
  };
  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const p = point(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    setHasInk(true);
    onChange(canvasRef.current.toDataURL("image/png"));
  };
  const clear = () => {
    const c = canvasRef.current;
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
    setHasInk(false);
    onChange("");
  };

  return (
    <div className="sig-pad">
      <canvas
        ref={canvasRef}
        width={560}
        height={160}
        aria-label="Draw your signature here"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
      />
      <div className="sig-pad-bar">
        <span>{hasInk ? "Looks good" : "Draw with your mouse, finger or pen (optional)"}</span>
        <button type="button" className="row-btn" onClick={clear} disabled={!hasInk}>
          Clear
        </button>
      </div>
    </div>
  );
};

// Typed name + optional drawing + the "I agree" tick box.
// value: { name, position, image, accepted }. errors: { signed_name, accept, position }
export const SignatureFields = ({ value, onChange, errors = {}, withPosition = false, statement }) => (
  <div className="sig-fields">
    <div className={`admin-field${errors.signed_name ? " has-error" : ""}`}>
      <label htmlFor="sig-name">Type your full name</label>
      <input
        id="sig-name"
        autoComplete="name"
        value={value.name}
        maxLength={120}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
      />
      {value.name.trim() && <div className="sig-preview" aria-hidden="true">{value.name}</div>}
      {errors.signed_name && <span className="admin-error">{errors.signed_name}</span>}
    </div>

    {withPosition && (
      <div className={`admin-field${errors.position ? " has-error" : ""}`}>
        <label htmlFor="sig-position">Your position</label>
        <input
          id="sig-position"
          placeholder="For example: Director"
          value={value.position}
          maxLength={120}
          onChange={(e) => onChange({ ...value, position: e.target.value })}
        />
        {errors.position && <span className="admin-error">{errors.position}</span>}
      </div>
    )}

    <div className="admin-field">
      <label>Draw your signature (optional)</label>
      <SignaturePad onChange={(image) => onChange({ ...value, image })} />
      {errors.signature_image && <span className="admin-error">{errors.signature_image}</span>}
    </div>

    <div className={`admin-field${errors.accept ? " has-error" : ""}`}>
      <label className="sig-accept">
        <input
          type="checkbox"
          checked={value.accepted}
          onChange={(e) => onChange({ ...value, accepted: e.target.checked })}
        />
        <span>{statement}</span>
      </label>
      {errors.accept && <span className="admin-error">{errors.accept}</span>}
    </div>
  </div>
);

export const EMPTY_SIGNATURE = { name: "", position: "", image: "", accepted: false };

// Checks the signing form before sending. Returns an errors object (empty when fine).
export const checkSignature = (value, withPosition = false) => {
  const e = {};
  if (value.name.trim().length < 2) e.signed_name = "Please type your full name";
  if (withPosition && value.position.trim().length < 2) e.position = "Please enter your position";
  if (!value.accepted) e.accept = "Please tick the box to confirm";
  return e;
};

// Shows who signed and when, for both parties.
export const SignatureSummary = ({ data }) => (
  <div className="sig-summary">
    {[
      { label: "Agent", name: data.agent_sig_name, at: data.agent_signed_at, extra: data.agency_name },
      { label: "College", name: data.admin_sig_name, at: data.admin_signed_at, extra: data.admin_sig_position },
    ].map((x) => (
      <div key={x.label} className={`sig-summary-item${x.name ? " is-signed" : ""}`}>
        <span>{x.label}</span>
        {x.name ? (
          <>
            <strong>{x.name}</strong>
            {x.extra && <em>{x.extra}</em>}
            <small>Signed {formatDateTime(x.at)}</small>
          </>
        ) : (
          <strong className="is-waiting">Not signed yet</strong>
        )}
      </div>
    ))}
  </div>
);

// A popup with a form. onSubmit runs when the button is pressed.
export const FormDialog = ({
  open,
  title,
  intro,
  children,
  submitLabel,
  danger = false,
  onSubmit,
  onCancel,
}) => (
  <Dialog
    open={open}
    onClose={onCancel}
    maxWidth="sm"
    fullWidth
    slotProps={{ paper: { style: { background: "var(--card-color)", borderRadius: 14 } } }}
  >
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <DialogTitle className="admin-dialog-title">{title}</DialogTitle>
      <DialogContent>
        {intro && <p className="admin-dialog-text" style={{ marginBottom: 14 }}>{intro}</p>}
        <div className="dialog-form">{children}</div>
      </DialogContent>
      <div className="admin-dialog-actions">
        <button type="button" className="admin-btn is-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={`admin-btn${danger ? " is-danger" : ""}`}>
          {submitLabel}
        </button>
      </div>
    </form>
  </Dialog>
);

// Progress line for the agent: Sent -> You sign -> College review -> Active
const STEPS = ["Sent to you", "You sign", "College signs", "Active"];
const STEP_INDEX = { sent: 1, rejected: 1, submitted: 2, active: 3, expired: 3 };

export const AgreementSteps = ({ status }) => {
  const current = STEP_INDEX[status] ?? 0;
  const finished = status === "active";
  return (
    <ol className="steps" aria-label="Agreement progress">
      {STEPS.map((label, i) => {
        const done = i < current || (finished && i === 3);
        const now = i === current && !finished;
        return (
          <li key={label} className={`step${done ? " is-done" : ""}${now ? " is-current" : ""}`}>
            <span className="step-dot">{done ? "\u2713" : i + 1}</span>
            <span className="step-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
};
