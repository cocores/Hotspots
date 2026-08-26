import { ANIMATIONS, SWATCHES, type HotspotStyle } from "../types";
import "./HotspotPin.css";
import "./StylePanel.css";

export default function StylePanel({
  style,
  onChange,
  onClose,
}: {
  style: HotspotStyle;
  onChange: (style: HotspotStyle) => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header hs-panel__header">
          <div className="modal-title">Hotspot Style</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Done
          </button>
        </div>
        <div className="modal-body">
          <div>
            <span className="form-label">Color</span>
            <div className="style-panel__swatches">
              {SWATCHES.map((hex) => (
                <button
                  key={hex}
                  className={`style-panel__swatch ${style.colorHex === hex ? "style-panel__swatch--active" : ""}`}
                  style={{ background: hex }}
                  onClick={() => onChange({ ...style, colorHex: hex })}
                />
              ))}
              <input
                type="color"
                className="style-panel__color-input"
                value={style.colorHex}
                onChange={(e) => onChange({ ...style, colorHex: e.target.value })}
              />
            </div>
          </div>

          <div>
            <span className="form-label">Animation</span>
            <div className="style-panel__anim-options">
              {ANIMATIONS.map((anim) => (
                <button
                  key={anim.value}
                  className={anim.value === style.animation ? "active" : ""}
                  onClick={() => onChange({ ...style, animation: anim.value })}
                >
                  {anim.label}
                </button>
              ))}
            </div>
          </div>

          {style.animation !== "none" && (
            <div>
              <span className="form-label">Speed</span>
              <div className="style-panel__speed">
                <span>Slow</span>
                <input
                  type="range"
                  min={0.5}
                  max={4}
                  step={0.1}
                  value={style.pulseSpeed}
                  onChange={(e) => onChange({ ...style, pulseSpeed: parseFloat(e.target.value) })}
                />
                <span>Fast</span>
              </div>
            </div>
          )}

          <div className="style-panel__preview">
            <div
              className="hotspot-pin"
              style={
                {
                  position: "static",
                  transform: "none",
                  "--hs-color": style.colorHex,
                  "--hs-duration": `${(2 / style.pulseSpeed).toFixed(2)}s`,
                } as React.CSSProperties
              }
            >
              <div className={`hotspot-pin__dot hotspot-pin__dot--${style.animation}`}>
                <span>1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
