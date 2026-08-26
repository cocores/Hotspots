import { useRef, useState } from "react";
import { createProject, deleteProject } from "../lib/projectsApi";
import { useProjects } from "../hooks/useProjects";
import type { HotspotProject } from "../types";
import "./ProjectListView.css";

export default function ProjectListView({
  ownerId,
  onOpenProject,
}: {
  ownerId: string;
  onOpenProject: (project: HotspotProject) => void;
}) {
  const { projects, isLoading, error } = useProjects(ownerId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<HotspotProject | null>(null);

  function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPendingFile(file);
    setNameDraft("Untitled Project");
    setCreateError(null);
  }

  async function confirmCreate() {
    if (!pendingFile) return;
    const name = nameDraft.trim() || "Untitled Project";
    setIsCreating(true);
    setCreateError(null);
    try {
      const project = await createProject(name, pendingFile, ownerId);
      setPendingFile(null);
      onOpenProject(project);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Couldn't create the project.");
    } finally {
      setIsCreating(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    await deleteProject(target);
  }

  return (
    <div className="project-list">
      <header className="project-list__header">
        <div className="project-list__logo">
          <div className="project-list__logo-dot" />
          Hotspots
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => fileInputRef.current?.click()}>
          + New Project
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="visually-hidden"
          onChange={handleFilePicked}
        />
      </header>

      <div className="project-list__body">
        {isLoading && <p className="project-list__status">Loading…</p>}
        {error && <p className="project-list__status project-list__status--error">{error}</p>}
        {!isLoading && !error && projects.length === 0 && (
          <div className="project-list__empty">
            <div className="project-list__empty-icon">◎</div>
            <div className="project-list__empty-title">No projects yet</div>
            <p>Tap New Project to upload an image and start placing hotspots.</p>
          </div>
        )}
        <div className="project-list__grid">
          {projects.map((project) => (
            <button key={project.id} className="project-card" onClick={() => onOpenProject(project)}>
              <img src={project.imageURL} alt="" className="project-card__thumb" />
              <div className="project-card__info">
                <div className="project-card__name">{project.name}</div>
                <div className="project-card__count">
                  {project.hotspots.length} hotspot{project.hotspots.length === 1 ? "" : "s"}
                </div>
              </div>
              <span
                className="project-card__delete"
                role="button"
                aria-label="Delete project"
                onClick={(e) => {
                  e.stopPropagation();
                  setPendingDelete(project);
                }}
              >
                &#10005;
              </span>
            </button>
          ))}
        </div>
      </div>

      {pendingFile && (
        <div className="modal-overlay" onClick={() => !isCreating && setPendingFile(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">New Project</div>
            </div>
            <div className="modal-body">
              <label className="form-label" htmlFor="project-name">
                Project name
              </label>
              <input
                id="project-name"
                type="text"
                className="dark-input"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                autoFocus
              />
              {createError && <p className="form-error">{createError}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" disabled={isCreating} onClick={() => setPendingFile(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" disabled={isCreating || !nameDraft.trim()} onClick={confirmCreate}>
                {isCreating ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="modal-overlay" onClick={() => setPendingDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Delete “{pendingDelete.name}”?</div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setPendingDelete(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ background: "var(--accent)" }} onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
