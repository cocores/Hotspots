import type { Hotspot, HotspotStyle } from "../types";
import HotspotTooltip from "./HotspotTooltip";
import "./HotspotPin.css";

export default function HotspotPin({
  number,
  hotspot,
  style,
  isExpanded,
  isDragging,
  onPointerDown,
  onClick,
}: {
  number: number;
  hotspot: Hotspot;
  style: HotspotStyle;
  isExpanded: boolean;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onClick: (e: React.MouseEvent) => void;
}) {
  const cssVars = {
    "--hs-color": style.colorHex,
    "--hs-duration": `${(2 / style.pulseSpeed).toFixed(2)}s`,
  } as React.CSSProperties;

  return (
    <div
      className="hotspot-pin"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, ...cssVars }}
      onPointerDown={onPointerDown}
      onClick={onClick}
    >
      {isExpanded && <HotspotTooltip hotspot={hotspot} />}
      <div className={`hotspot-pin__dot hotspot-pin__dot--${isDragging ? "none" : style.animation}`}>
        <span>{number}</span>
      </div>
    </div>
  );
}
