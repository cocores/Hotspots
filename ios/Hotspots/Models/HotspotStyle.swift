import SwiftUI
import UIKit

enum HotspotAnimation: String, CaseIterable, Identifiable, Codable, Hashable {
    case pulse, ripple, bounce, none

    var id: String { rawValue }

    var label: String {
        switch self {
        case .pulse: return "Pulse"
        case .ripple: return "Ripple"
        case .bounce: return "Bounce"
        case .none: return "None"
        }
    }
}

struct HotspotStyle: Codable, Hashable {
    var colorHex: String = "#ff4d2e"
    var animation: HotspotAnimation = .pulse
    var pulseSpeed: Double = 2.0

    static let swatches = [
        "#ff4d2e", "#3b82f6", "#22c55e", "#a855f7",
        "#f59e0b", "#ec4899", "#0ea5e9",
    ]

    var color: Color { Color(hex: colorHex) }
}

extension Color {
    init(hex: String) {
        var s = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        s = s.replacingOccurrences(of: "#", with: "")
        var value: UInt64 = 0
        Scanner(string: s).scanHexInt64(&value)
        let r = Double((value & 0xFF0000) >> 16) / 255
        let g = Double((value & 0x00FF00) >> 8) / 255
        let b = Double(value & 0x0000FF) / 255
        self.init(red: r, green: g, blue: b)
    }

    func toHex() -> String {
        let resolved = UIColor(self).cgColor.components ?? [0, 0, 0]
        let r = Int((resolved.count > 0 ? resolved[0] : 0) * 255)
        let g = Int((resolved.count > 1 ? resolved[1] : 0) * 255)
        let b = Int((resolved.count > 2 ? resolved[2] : 0) * 255)
        return String(format: "#%02x%02x%02x", r, g, b)
    }
}
