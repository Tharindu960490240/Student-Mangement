import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

import "../../styles/adminPages.css";
import LoadingSpinner from "../LoadingSpinner";
import CustomSnackbar from "../CustomSnackbar";
import { AgreementDocument, formatDateTime } from "./shared";
import { getTemplate, saveTemplate, previewTemplate } from "../../../services/agreementService";

// The wording every new agreement is made from. Saving creates a new version;
// agreements that were already sent keep the wording they were sent with.
const AgreementTemplate = () => {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [meta, setMeta] = useState(null); // version, placeholders, who saved it
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState({ name: "", body: "" });
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const textRef = useRef(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const showMessage = (message, severity = "success") => setSnackbar({ open: true, message, severity });
  const handleClose = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const apply = (t) => {
    setMeta(t);
    setName(t.name);
    setBody(t.body);
    setSaved({ name: t.name, body: t.body });
  };

  const load = useCallback(async () => {
    const res = await getTemplate();
    setLoading(false);
    if (res.success) apply(res.data);
    else showMessage(res.message || "Could not load the template.", "error");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changed = name !== saved.name || body !== saved.body;

  // puts {{placeholder}} where the cursor is
  const insert = (key) => {
    const el = textRef.current;
    const text = `{{${key}}}`;
    const start = el ? el.selectionStart : body.length;
    const end = el ? el.selectionEnd : body.length;
    setBody(body.slice(0, start) + text + body.slice(end));
    setPreview(null);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(start + text.length, start + text.length);
    });
  };

  const handlePreview = async () => {
    setBusy(true);
    const res = await previewTemplate(body);
    setBusy(false);
    if (res.success) {
      setErrors({});
      setPreview(res.data.blocks);
    } else {
      setErrors(res.errors || {});
      showMessage(res.message || "Could not build the preview.", "error");
    }
  };

  const handleSave = async () => {
    const e = {};
    if (name.trim().length < 3) e.name = "Enter a name";
    if (body.trim().length < 100) e.body = "The agreement text is too short";
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    const res = await saveTemplate({ name: name.trim(), body });
    setBusy(false);
    if (res.success) {
      apply(res.data);
      setPreview(null);
      showMessage("Template saved. New agreements will use it.");
    } else {
      setErrors(res.errors || {});
      showMessage(res.message || "Could not save the template.", "error");
    }
  };

  return (
    <div className="admin-page">
      <Link to="/admin/agreements" className="admin-back">
        <ArrowBack fontSize="small" /> Agreements
      </Link>

      <div className="admin-head">
        <h1>Agreement template</h1>
        <p>
          Every new agreement is written from this text, with the agent's details filled in. Agreements already sent
          keep the wording they were sent with.
        </p>
      </div>

      {loading && <div className="admin-panel admin-empty">Loading template...</div>}

      {!loading && meta && (
        <>
          <section className="admin-panel">
            <p className="admin-hint" style={{ marginTop: 0 }}>
              Version {meta.version}
              {meta.created_at ? ` · saved ${formatDateTime(meta.created_at)}` : ""}
              {meta.updated_by_first_name ? ` by ${meta.updated_by_first_name} ${meta.updated_by_last_name}` : ""}
            </p>

            <div className={`admin-field${errors.name ? " has-error" : ""}`}>
              <label htmlFor="tpl-name">Agreement name</label>
              <input id="tpl-name" value={name} maxLength={160} onChange={(e) => setName(e.target.value)} />
              {errors.name && <span className="admin-error">{errors.name}</span>}
            </div>

            <div className={`admin-field${errors.body ? " has-error" : ""}`}>
              <label htmlFor="tpl-body">Agreement text</label>
              <textarea
                id="tpl-body"
                ref={textRef}
                className="template-text"
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  setPreview(null);
                }}
              />
              {errors.body && <span className="admin-error">{errors.body}</span>}
              <span className="admin-hint">
                Start a line with # for the title and ## for a clause heading. Leave a blank line between paragraphs.
              </span>
            </div>

            <div className="admin-field">
              <label>Insert agent details (click to add at the cursor)</label>
              <div className="placeholder-chips">
                {Object.entries(meta.placeholders).map(([key, label]) => (
                  <button key={key} type="button" className="chip" title={label} onClick={() => insert(key)}>
                    {`{{${key}}}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="action-row">
              <button type="button" className="admin-btn" onClick={handleSave} disabled={busy || !changed}>
                Save new version
              </button>
              <button type="button" className="admin-btn is-ghost" onClick={handlePreview} disabled={busy}>
                Preview with an example agent
              </button>
              {changed && (
                <button
                  type="button"
                  className="admin-btn is-ghost"
                  onClick={() => {
                    setName(saved.name);
                    setBody(saved.body);
                    setPreview(null);
                    setErrors({});
                  }}
                >
                  Discard changes
                </button>
              )}
            </div>
          </section>

          {preview && (
            <section className="admin-panel">
              <h2>Preview</h2>
              <AgreementDocument blocks={preview} />
            </section>
          )}
        </>
      )}

      <CustomSnackbar {...snackbar} onClose={handleClose} />
      <LoadingSpinner open={busy} />
    </div>
  );
};

export default AgreementTemplate;
