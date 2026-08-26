import { useCallback, useRef, useState } from "react";
import type { EditorMode } from "./EditorView";
import type { Hotspot, HotspotProject } from "../types";
import HotspotPin from "./HotspotPin";
import "./EditorCanvas.css";

interface Props {
  project: HotspotProject;
  mode: EditorMode;
  onPlaceHotspot: (x: number, y: number) => void;
  onDragHotspot: (id: string, x: number, y: number) => void;
  onTapHotspot: (hotspot: Hotspot) => void;
  onMarkDirty: () => void;
}

interface DragState {
  id: string;
  startClientX: number;
  startClientY: number;
  moved: boolean;
}

const TAP_TOLERANCE = 4;

export default function EditorCanvas({
  project,
  mode,
  onPlaceHotspot,
  onDragHotspot,
  onTapHotspot,
  onMarkDirty,
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Kept in refs (not closed over) so the same pointermove/pointerup
  // function identity survives re-renders that happen mid-drag, letting
  // add/removeEventListener target the exact same listener.
  const latest = useRef({ onDragHotspot, onMarkDirty, onTapHotspot, hotspots: project.hotspots });
  latest.current = { onDragHotspot, onMarkDirty, onTapHotspot, hotspots: project.hotspots };

  const pointFromEvent = useCallback((clientX: number, clientY: number): { x: number; y: number } | null => {
    const img = imgRef.current;
    if (!img) return null;
    const rect = img.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) };
  }, []);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = e.clientX - drag.startClientX;
      const dy = e.clientY - drag.startClientY;
      if (!drag.moved && Math.hypot(dx, dy) > TAP_TOLERANCE) drag.moved = true;
      if (drag.moved) {
        const point = pointFromEvent(e.clientX, e.clientY);
        if (point) latest.current.onDragHotspot(drag.id, point.x, point.y);
      }
    },
    [pointFromEvent]
  );

  const handlePointerUp = useCallback(() => {
    const drag = dragRef.current;
    dragRef.current = null;
    setDraggingId(null);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    if (!drag) return;
    if (drag.moved) {
      latest.current.onMarkDirty();
    } else {
      const hotspot = latest.current.hotspots.find((h) => h.id === drag.id);
      if (hotspot) latest.current.onTapHotspot(hotspot);
    }
  }, [handlePointerMove]);

  function handlePinPointerDown(e: React.PointerEvent, hotspot: Hotspot) {
    if (mode !== "add") return;
    e.stopPropagation();
    dragRef.current = { id: hotspot.id, startClientX: e.clientX, startClientY: e.clientY, moved: false };
    setDraggingId(hotspot.id);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  function handleCanvasClick(e: React.MouseEvent) {
    if (mode !== "add") return;
    if ((e.target as HTMLElement).closest(".hotspot-pin")) return;
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;
    const point = pointFromEvent(e.clientX, e.clientY);
    if (point) onPlaceHotspot(point.x, point.y);
  }

  function handlePinTap(hotspot: Hotspot) {
    if (mode !== "preview") return;
    setExpandedId((id) => (id === hotspot.id ? null : hotspot.id));
  }

  return (
    <div className="editor-canvas" onClick={handleCanvasClick}>
      {/* Shrink-wraps to the image's actual rendered box (not the viewport),
          so pins positioned by percentage line up correctly even when the
          viewport's aspect ratio differs from the image's. */}
      <div className="editor-canvas__frame">
        <img
          ref={imgRef}
          src={project.imageURL}
          alt=""
          className="editor-canvas__image"
          draggable={false}
          onLoad={() => setImageLoaded(true)}
        />
        {imageLoaded &&
          project.hotspots.map((hotspot, index) => (
            <HotspotPin
              key={hotspot.id}
              number={index + 1}
              hotspot={hotspot}
              style={project.style}
              isExpanded={expandedId === hotspot.id}
              isDragging={draggingId === hotspot.id}
              onPointerDown={(e) => handlePinPointerDown(e, hotspot)}
              onClick={(e) => {
                e.stopPropagation();
                handlePinTap(hotspot);
              }}
            />
          ))}
      </div>
    </div>
  );
}
