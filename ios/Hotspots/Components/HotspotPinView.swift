import SwiftUI

struct HotspotPinView: View {
    let number: Int
    let hotspot: Hotspot
    let style: HotspotStyle
    let isExpanded: Bool
    let isDragging: Bool

    var body: some View {
        VStack(spacing: 0) {
            if isExpanded {
                HotspotTooltipView(hotspot: hotspot)
                    .offset(y: -8)
                    .transition(.opacity.combined(with: .move(edge: .bottom)))
            }
            PulsingPin(number: number, style: style, isAnimating: !isDragging)
        }
        .contentShape(Rectangle())
    }
}

private struct PulsingPin: View {
    let number: Int
    let style: HotspotStyle
    let isAnimating: Bool

    @State private var phase: CGFloat = 0

    var body: some View {
        ZStack {
            if isAnimating, style.animation == .pulse || style.animation == .ripple {
                Circle()
                    .stroke(style.color.opacity(0.5 * (1 - phase)), lineWidth: 2)
                    .frame(width: 32, height: 32)
                    .scaleEffect(1 + phase * (style.animation == .ripple ? 1.6 : 0.8))
            }
            Circle()
                .fill(style.color)
                .frame(width: 32, height: 32)
                .overlay(Circle().stroke(.white, lineWidth: 3))
                .shadow(color: style.color.opacity(0.5), radius: 8, y: 3)
                .offset(y: bounceOffset)
            Text("\(number)")
                .font(.system(size: 12, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
                .offset(y: bounceOffset)
        }
        .onAppear { startAnimation() }
        .onChange(of: style.animation) { _, _ in startAnimation() }
        .onChange(of: style.pulseSpeed) { _, _ in startAnimation() }
        .onChange(of: isAnimating) { _, _ in startAnimation() }
    }

    @State private var bounceOffset: CGFloat = 0

    private func startAnimation() {
        phase = 0
        bounceOffset = 0
        guard isAnimating else { return }
        let duration = 2.0 / style.pulseSpeed
        switch style.animation {
        case .pulse, .ripple:
            withAnimation(.linear(duration: duration).repeatForever(autoreverses: false)) {
                phase = 1
            }
        case .bounce:
            withAnimation(.easeInOut(duration: duration / 2).repeatForever(autoreverses: true)) {
                bounceOffset = -6
            }
        case .none:
            break
        }
    }
}
