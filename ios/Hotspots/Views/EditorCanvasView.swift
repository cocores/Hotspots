import SwiftUI

/// The image canvas: places new pins (Add mode), lets existing pins be
/// dragged to reposition, and shows tap-activated tooltips in Preview mode
/// — mirrors the web tool's canvas but using SwiftUI gestures instead of
/// mouse/touch event listeners.
struct EditorCanvasView: View {
    @Binding var project: HotspotProject
    let mode: EditorMode
    let onPlaceHotspot: (Double, Double) -> Void
    let onTapHotspot: (Hotspot) -> Void
    let onMarkDirty: () -> Void

    /// How far a touch has to travel before it counts as a drag rather than a tap.
    private let tapTolerance: CGFloat = 6

    @State private var expandedHotspotId: String?
    @State private var draggingIndex: Int?
    @State private var dragStartPercent: (x: Double, y: Double) = (0, 0)

    var body: some View {
        GeometryReader { geo in
            let frame = imageFrame(containerSize: geo.size)
            ZStack(alignment: .topLeading) {
                Color.black.opacity(0.001) // full-size hit area for tap-to-place

                AsyncImage(url: URL(string: project.imageURL)) { phase in
                    if let image = phase.image {
                        image
                            .resizable()
                            .frame(width: frame.width, height: frame.height)
                            .position(x: frame.midX, y: frame.midY)
                    } else if phase.error != nil {
                        placeholder(in: geo.size, text: "Couldn't load image")
                    } else {
                        placeholder(in: geo.size, text: nil)
                    }
                }

                ForEach(project.hotspots.indices, id: \.self) { index in
                    pin(at: index, frame: frame)
                }
            }
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onEnded { value in
                        guard mode == .add else { return }
                        place(at: value.location, in: frame)
                    }
            )
            .clipped()
        }
        .background(Color(white: 0.09))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    @ViewBuilder
    private func pin(at index: Int, frame: CGRect) -> some View {
        let hotspot = project.hotspots[index]
        let pinView = HotspotPinView(
            number: index + 1,
            hotspot: hotspot,
            style: project.style,
            isExpanded: expandedHotspotId == hotspot.id,
            isDragging: draggingIndex == index
        )
        .position(
            x: frame.minX + hotspot.x / 100 * frame.width,
            y: frame.minY + hotspot.y / 100 * frame.height
        )

        if mode == .add {
            pinView.gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { value in
                        if draggingIndex != index {
                            dragStartPercent = (project.hotspots[index].x, project.hotspots[index].y)
                        }
                        draggingIndex = index
                        let newX = dragStartPercent.x / 100 * frame.width + value.translation.width
                        let newY = dragStartPercent.y / 100 * frame.height + value.translation.height
                        project.hotspots[index].x = min(100, max(0, newX / frame.width * 100))
                        project.hotspots[index].y = min(100, max(0, newY / frame.height * 100))
                    }
                    .onEnded { value in
                        draggingIndex = nil
                        let moved = hypot(value.translation.width, value.translation.height) > tapTolerance
                        if moved {
                            onMarkDirty()
                        } else {
                            project.hotspots[index].x = dragStartPercent.x
                            project.hotspots[index].y = dragStartPercent.y
                            onTapHotspot(hotspot)
                        }
                    }
            )
        } else {
            pinView.onTapGesture {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                    expandedHotspotId = expandedHotspotId == hotspot.id ? nil : hotspot.id
                }
            }
        }
    }

    private func place(at location: CGPoint, in frame: CGRect) {
        guard frame.contains(location) else { return }
        let xPct = (location.x - frame.minX) / frame.width * 100
        let yPct = (location.y - frame.minY) / frame.height * 100
        onPlaceHotspot(xPct, yPct)
    }

    private func imageFrame(containerSize: CGSize) -> CGRect {
        guard project.imageWidth > 0, project.imageHeight > 0, containerSize.width > 0, containerSize.height > 0 else {
            return CGRect(origin: .zero, size: containerSize)
        }
        let imageAspect = project.imageWidth / project.imageHeight
        let containerAspect = containerSize.width / containerSize.height
        var size = containerSize
        if imageAspect > containerAspect {
            size.height = containerSize.width / imageAspect
        } else {
            size.width = containerSize.height * imageAspect
        }
        let origin = CGPoint(x: (containerSize.width - size.width) / 2, y: (containerSize.height - size.height) / 2)
        return CGRect(origin: origin, size: size)
    }

    @ViewBuilder
    private func placeholder(in size: CGSize, text: String?) -> some View {
        ZStack {
            Color(white: 0.09)
            if let text {
                Text(text).foregroundStyle(.secondary).font(.footnote)
            } else {
                ProgressView().tint(.white)
            }
        }
        .frame(width: size.width, height: size.height)
    }
}
