import FirebaseFirestore
import Foundation

struct HotspotProject: Identifiable, Codable, Hashable {
    @DocumentID var id: String?
    var name: String
    var ownerId: String
    var imageURL: String
    var imageStoragePath: String
    var imageWidth: Double
    var imageHeight: Double
    var style: HotspotStyle = HotspotStyle()
    var hotspots: [Hotspot] = []
    var createdAt: Double
    var updatedAt: Double

    var mediaCount: Int { hotspots.filter(\.hasMedia).count }
    var textCount: Int { hotspots.filter(\.hasText).count }
    var linkCount: Int { hotspots.filter(\.hasLink).count }
}
