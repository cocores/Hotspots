import { useRef, useState } from "react";
import { uploadHotspotMedia } from "../lib/projectsApi";
import type { Hotspot, HotspotMedia } from "../types";
import "./HotspotFormModal.css";

export default function HotspotFormModal({
  projectId,
  existing,
  point,
  onCancel,
  onSave,
  onDelete,
}: {
  projectId: string;
  existing: Hotspot | null;
  point: { x: number; y: number } | null;
  onCancel: () => void;
  onSave: (hotspot: Hotspot) => void;
  onDelete: (id: string) => void;
}) {
  const hotspotIdRef = useRef(existing?.id ?? crypto.randomUUID());
  const [title, setTitle] = useState(existing?.title ?? "");
  const [text, setText] = useState(existing?.text ?? "");
  const [link, setLink] = useState(existing?.link ?? "");
  const [media, setMedia] = useState<HotspotMedia | null | undefined>(existing?.media);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const position = existing ? { x: existing.x, y: existing.y } : point!;

  async function handleFile(file: File | undefined, type: "image" | "audio") {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const uploaded = await uploadHotspotMedia(projectId, hotspotIdRef.current, file, type);
      setMedia(uploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleSave() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    const trimmedLink = link.trim();
    onSave({
      id: hotspotIdRef.current,
      x: position.x,
      y: position.y,
      title: trimmedTitle,
      text: text.trim(),
      link: trimmedLink || null,
      media: media ?? null,
    });
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{existing ? "Edit Hotspot" : "New Hotspot"}</div>
        </div>
        <div className="modal-body">
          <div>
            <label className="form-label" htmlFor="hs-title">
              Title
            </label>
            <input
              id="hs-title"
              type="text"
              className="dark-input"
              maxLength={80}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Main Entrance"
              autoFocus
            />
          </div>

          <div>
            <label className="form-label" htmlFor="hs-text">
              Description (optional)
            </label>
            <textarea
              id="hs-text"
              className="dark-input"
              maxLength={300}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a short description…"
            />
          </div>

          <div>
            <span className="form-label">Media (optional)</span>
            {media ? (
              <div className="hs-form__media">
                {media.type === "image" ? (
                  <img src={media.url} alt="" />
                ) : (
                  <div className="hs-form__media-audio">&#127925; {media.fileName}</div>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => setMedia(null)}>
                  Remove
                </button>
              </div>
            ) : isUploading ? (
              <p className="hs-form__uploading">Uploading…</p>
            ) : (
              <div className="hs-form__media-buttons">
                <button className="btn btn-secondary btn-sm" onClick={() => imageInputRef.current?.click()}>
                  &#128444; Image
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => audioInputRef.current?.click()}>
                  &#127925; Audio
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="visually-hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    void handleFile(file, "image");
                  }}
                />
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  className="visually-hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    void handleFile(file, "audio");
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="form-label" htmlFor="hs-link">
              Link (optional)
            </label>
            <input
              id="hs-link"
              type="url"
              className="dark-input"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://…"
            />
          </div>

          {error && <p className="form-error">{error}</p>}
        </div>
        <div className="modal-footer">
          {existing && (
            <button
              className="btn btn-ghost"
              style={{ color: "var(--accent-light)", marginRight: "auto" }}
              onClick={() => onDelete(existing.id)}
            >
              Delete
            </button>
          )}
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={!title.trim()} onClick={handleSave}>
            Save Hotspot &#8594;
          </button>
        </div>
      </div>
    </div>
  );
}
