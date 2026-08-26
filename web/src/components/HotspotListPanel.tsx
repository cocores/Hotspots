import { hasLink, hasMedia, hasText, type Hotspot, type HotspotProject } from "../types";
import "./HotspotListPanel.css";

export default function HotspotListPanel({
  project,
  onClose,
  onEdit,
  onDelete,
}: {
  project: HotspotProject;
  onClose: () => void;
  onEdit: (hotspot: Hotspot) => void;
  onDelete: (id: string) => void;
}) {
  const mediaCount = project.hotspots.filter(hasMedia).length;
  const textCount = project.hotspots.filter(hasText).length;
  const linkCount = project.hotspots.filter(hasLink).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal hs-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header hs-panel__header">
          <div className="modal-title">Hotspots</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Done
          </button>
        </div>
        <div className="hs-panel__stats">
          <div>
            <div className="hs-panel__stat-num">{project.hotspots.length}</div>
            <div className="hs-panel__stat-label">Total</div>
          </div>
          <div>
            <div className="hs-panel__stat-num">{mediaCount}</div>
            <div className="hs-panel__stat-label">Media</div>
          </div>
          <div>
            <div className="hs-panel__stat-num">{textCount}</div>
            <div className="hs-panel__stat-label">Text</div>
          </div>
          <div>
            <div className="hs-panel__stat-num">{linkCount}</div>
            <div className="hs-panel__stat-label">Links</div>
          </div>
        </div>

        <div className="hs-panel__list">
          {project.hotspots.length === 0 ? (
            <p className="hs-panel__empty">No hotspots yet. Switch to Add Hotspot mode and tap the image.</p>
          ) : (
            project.hotspots.map((hotspot, index) => (
              <div key={hotspot.id} className="hs-panel__card" onClick={() => onEdit(hotspot)}>
                <div className="hs-panel__num">{index + 1}</div>
                <div className="hs-panel__info">
                  <div className="hs-panel__title">{hotspot.title}</div>
                  <div className="hs-panel__badges">
                    {hasText(hotspot) && <span className="hs-panel__badge hs-panel__badge--text">Text</span>}
                    {hasMedia(hotspot) && (
                      <span className="hs-panel__badge hs-panel__badge--media">
                        {hotspot.media?.type === "image" ? "Image" : "Audio"}
                      </span>
                    )}
                    {hasLink(hotspot) && <span className="hs-panel__badge hs-panel__badge--link">Link</span>}
                    {!hasText(hotspot) && !hasMedia(hotspot) && !hasLink(hotspot) && (
                      <span className="hs-panel__badge hs-panel__badge--empty">No content yet</span>
                    )}
                  </div>
                </div>
                <button
                  className="hs-panel__delete"
                  aria-label="Delete hotspot"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(hotspot.id);
                  }}
                >
                  &#128465;
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
