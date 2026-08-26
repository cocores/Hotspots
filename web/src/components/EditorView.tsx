import { useEffect, useRef, useState } from "react";
import { saveProject } from "../lib/projectsApi";
import type { Hotspot, HotspotProject } from "../types";
import EditorCanvas from "./EditorCanvas";
import HotspotFormModal from "./HotspotFormModal";
import HotspotListPanel from "./HotspotListPanel";
import StylePanel from "./StylePanel";
import "./EditorView.css";

export type EditorMode = "add" | "preview";

export default function EditorView({
  project: initialProject,
  onBack,
}: {
  project: HotspotProject;
  onBack: () => void;
}) {
  const [project, setProject] = useState(initialProject);
  const [mode, setMode] = useState<EditorMode>("add");
  const [editingHotspot, setEditingHotspot] = useState<Hotspot | null>(null);
  const [pendingPoint, setPendingPoint] = useState<{ x: number; y: number } | null>(null);
  const [showingList, setShowingList] = useState(false);
  const [showingStyle, setShowingStyle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const projectRef = useRef(project);
  projectRef.current = project;
  const dirtyRef = useRef(hasUnsavedChanges);
  dirtyRef.current = hasUnsavedChanges;

  useEffect(() => {
    return () => {
      if (dirtyRef.current) {
        saveProject(projectRef.current).catch((err) => console.error("Autosave on exit failed:", err));
      }
    };
  }, []);

  function markDirty() {
    setHasUnsavedChanges(true);
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveProject(project);
      setHasUnsavedChanges(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Couldn't save.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleBack() {
    if (hasUnsavedChanges) {
      saveProject(project).catch((err) => console.error("Save on back failed:", err));
    }
    onBack();
  }

  function upsertHotspot(hotspot: Hotspot) {
    setProject((p) => {
      const idx = p.hotspots.findIndex((h) => h.id === hotspot.id);
      const hotspots = idx >= 0 ? p.hotspots.map((h, i) => (i === idx ? hotspot : h)) : [...p.hotspots, hotspot];
      return { ...p, hotspots };
    });
    markDirty();
  }

  function deleteHotspot(id: string) {
    setProject((p) => ({ ...p, hotspots: p.hotspots.filter((h) => h.id !== id) }));
    markDirty();
  }

  return (
    <div className="editor">
      <header className="editor__header">
        <button className="btn btn-ghost btn-sm" onClick={handleBack}>
          &#8592; Projects
        </button>
        <div className="editor__title">{project.name}</div>
        <button className="btn btn-primary btn-sm" disabled={isSaving} onClick={handleSave}>
          {isSaving ? "Saving…" : hasUnsavedChanges ? "Save" : "Saved"}
        </button>
      </header>

      <div className="editor__mode-pill">
        <button className={mode === "add" ? "active" : ""} onClick={() => setMode("add")}>
          + Add Hotspot
        </button>
        <button className={mode === "preview" ? "active" : ""} onClick={() => setMode("preview")}>
          Preview
        </button>
      </div>

      {saveError && <div className="editor__error">{saveError}</div>}

      <div className="editor__canvas-wrap">
        <EditorCanvas
          project={project}
          mode={mode}
          onPlaceHotspot={(x, y) => {
            setPendingPoint({ x, y });
            setEditingHotspot(null);
          }}
          onDragHotspot={(id, x, y) => {
            setProject((p) => ({
              ...p,
              hotspots: p.hotspots.map((h) => (h.id === id ? { ...h, x, y } : h)),
            }));
          }}
          onTapHotspot={(hotspot) => {
            if (mode === "add") setEditingHotspot(hotspot);
          }}
          onMarkDirty={markDirty}
        />
      </div>

      <div className="editor__bottom-bar">
        <button className="btn btn-secondary btn-sm" onClick={() => setShowingList(true)}>
          &#9711; {project.hotspots.length}
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowingStyle(true)}>
          &#127752; Style
        </button>
      </div>

      {(pendingPoint || editingHotspot) && (
        <HotspotFormModal
          projectId={project.id}
          existing={editingHotspot}
          point={pendingPoint}
          onCancel={() => {
            setPendingPoint(null);
            setEditingHotspot(null);
          }}
          onSave={(hotspot) => {
            upsertHotspot(hotspot);
            setPendingPoint(null);
            setEditingHotspot(null);
          }}
          onDelete={(id) => {
            deleteHotspot(id);
            setEditingHotspot(null);
          }}
        />
      )}

      {showingList && (
        <HotspotListPanel
          project={project}
          onClose={() => setShowingList(false)}
          onEdit={(hotspot) => {
            setShowingList(false);
            setEditingHotspot(hotspot);
          }}
          onDelete={deleteHotspot}
        />
      )}

      {showingStyle && (
        <StylePanel
          style={project.style}
          onChange={(style) => {
            setProject((p) => ({ ...p, style }));
            markDirty();
          }}
          onClose={() => setShowingStyle(false)}
        />
      )}
    </div>
  );
}
