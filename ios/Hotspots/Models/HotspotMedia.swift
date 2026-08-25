import Foundation

enum HotspotMediaType: String, Codable, Hashable {
    case image
    case audio
}

struct HotspotMedia: Codable, Hashable {
    var type: HotspotMediaType
    var url: String
    var storagePath: String
    var fileName: String
}
