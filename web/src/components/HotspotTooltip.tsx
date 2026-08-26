import { useRef, useState } from "react";
import { hasLink, hasMedia, hasText, type Hotspot } from "../types";
import "./HotspotTooltip.css";

export default function HotspotTooltip({ hotspot }: { hotspot: Hotspot }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  function toggleAudio(e: React.MouseEvent) {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }

  return (
    <div className="hs-tooltip" onClick={(e) => e.stopPropagation()}>
      <div className="hs-tooltip__title">{hotspot.title}</div>
      {hasText(hotspot) && <div className="hs-tooltip__text">{hotspot.text}</div>}
      {hasMedia(hotspot) &&
        (hotspot.media!.type === "image" ? (
          <div className="hs-tooltip__media">
            <img src={hotspot.media!.url} alt="" />
          </div>
        ) : (
          <div className="hs-tooltip__audio">
            <button className="hs-tooltip__audio-play" onClick={toggleAudio}>
              {isPlaying ? "❘❘" : "▶"}
            </button>
            <span>{hotspot.media!.fileName}</span>
            <audio
              ref={audioRef}
              src={hotspot.media!.url}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        ))}
      {hasLink(hotspot) && (
        <a
          className="hs-tooltip__link"
          href={hotspot.link!}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          Open Link &#8599;
        </a>
      )}
    </div>
  );
}
