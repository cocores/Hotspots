import Foundation

/// x/y are percentages (0-100) of the image's width/height, matching the
/// web Hotspot Builder's coordinate system so pins stay correctly placed
/// at any render size.
struct Hotspot: Identifiable, Codable, Hashable {
    var id: String = UUID().uuidString
    var x: Double
    var y: Double
    var title: String
    var text: String = ""
    var link: String?
    var media: HotspotMedia?

    var hasText: Bool { !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }
    var hasMedia: Bool { media != nil }
    var hasLink: Bool { !(link ?? "").trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }
}
