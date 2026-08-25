import AVKit
import SwiftUI

struct HotspotTooltipView: View {
    let hotspot: Hotspot

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(hotspot.title)
                .font(.system(size: 14, weight: .bold, design: .rounded))
                .foregroundStyle(.black)

            if hotspot.hasText {
                Text(hotspot.text)
                    .font(.system(size: 13))
                    .foregroundStyle(.black.opacity(0.7))
            }

            if let media = hotspot.media {
                if media.type == .image {
                    AsyncImage(url: URL(string: media.url)) { phase in
                        if let image = phase.image {
                            image.resizable().aspectRatio(contentMode: .fit)
                        } else {
                            Color.black.opacity(0.05)
                        }
                    }
                    .frame(maxHeight: 130)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                } else {
                    AudioPreviewRow(media: media)
                }
            }

            if hotspot.hasLink, let url = URL(string: hotspot.link ?? "") {
                Link(destination: url) {
                    HStack(spacing: 6) {
                        Text("Open Link")
                        Image(systemName: "arrow.up.right")
                    }
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Color.blue)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }
            }
        }
        .padding(14)
        .frame(width: 220)
        .background(.white)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .shadow(color: .black.opacity(0.25), radius: 20, y: 8)
    }
}

private struct AudioPreviewRow: View {
    let media: HotspotMedia
    @State private var player: AVPlayer?
    @State private var isPlaying = false

    var body: some View {
        HStack(spacing: 8) {
            Button {
                toggle()
            } label: {
                Image(systemName: isPlaying ? "pause.fill" : "play.fill")
                    .font(.system(size: 10))
                    .foregroundStyle(.white)
                    .frame(width: 28, height: 28)
                    .background(Circle().fill(Color.orange))
            }
            Text(media.fileName)
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(.black.opacity(0.7))
                .lineLimit(1)
        }
        .padding(8)
        .background(Color.black.opacity(0.05))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }

    private func toggle() {
        if player == nil, let url = URL(string: media.url) {
            player = AVPlayer(url: url)
        }
        if isPlaying {
            player?.pause()
        } else {
            player?.play()
        }
        isPlaying.toggle()
    }
}
