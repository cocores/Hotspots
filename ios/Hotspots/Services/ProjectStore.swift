import FirebaseFirestore
import FirebaseStorage
import Observation
import UIKit

/// Firestore-backed replacement for the web tool's in-browser-memory
/// `hotspots` array — every signed-in device sees its own projects update
/// in real time (`addSnapshotListener`), and both the main image and any
/// per-hotspot media live in Firebase Storage rather than as inline
/// data URLs.
@Observable
final class ProjectStore {
    var projects: [HotspotProject] = []
    var isLoading = true
    var errorMessage: String?

    private let db = Firestore.firestore()
    private var listener: ListenerRegistration?
    private var listeningOwnerId: String?

    func start(ownerId: String) {
        guard listeningOwnerId != ownerId else { return }
        listeningOwnerId = ownerId
        listener?.remove()
        isLoading = true
        listener = db.collection("projects")
            .whereField("ownerId", isEqualTo: ownerId)
            .order(by: "updatedAt", descending: true)
            .addSnapshotListener { [weak self] snapshot, error in
                guard let self else { return }
                self.isLoading = false
                if let error {
                    self.errorMessage = error.localizedDescription
                    return
                }
                self.projects = snapshot?.documents.compactMap { try? $0.data(as: HotspotProject.self) } ?? []
            }
    }

    func stop() {
        listener?.remove()
        listener = nil
        listeningOwnerId = nil
    }

    // MARK: - Create

    func createProject(name: String, image: UIImage, ownerId: String) async throws -> HotspotProject {
        guard let jpegData = image.jpegData(compressionQuality: 0.85) else {
            throw ProjectStoreError.invalidImage
        }
        let docRef = db.collection("projects").document()
        let projectId = docRef.documentID
        let storagePath = "projects/\(projectId)/main.jpg"
        let url = try await uploadData(jpegData, to: storagePath, contentType: "image/jpeg")

        let now = Date().timeIntervalSince1970
        let project = HotspotProject(
            id: projectId,
            name: name,
            ownerId: ownerId,
            imageURL: url.absoluteString,
            imageStoragePath: storagePath,
            imageWidth: image.size.width,
            imageHeight: image.size.height,
            createdAt: now,
            updatedAt: now
        )
        try await docRef.setData(from: project)
        return project
    }

    // MARK: - Save / delete

    func save(_ project: HotspotProject) async throws {
        guard let id = project.id else { throw ProjectStoreError.missingId }
        var updated = project
        updated.updatedAt = Date().timeIntervalSince1970
        try await db.collection("projects").document(id).setData(from: updated)
    }

    func delete(_ project: HotspotProject) async throws {
        guard let id = project.id else { throw ProjectStoreError.missingId }
        try await db.collection("projects").document(id).delete()
        if let result = try? await Storage.storage().reference().child("projects/\(id)").listAll() {
            for item in result.items {
                try? await item.delete()
            }
        }
    }

    // MARK: - Hotspot media

    func uploadHotspotMedia(
        projectId: String,
        hotspotId: String,
        data: Data,
        type: HotspotMediaType,
        fileName: String,
        contentType: String
    ) async throws -> HotspotMedia {
        let ext = (fileName as NSString).pathExtension
        let safeExt = ext.isEmpty ? (type == .image ? "jpg" : "m4a") : ext
        let storagePath = "projects/\(projectId)/hotspots/\(hotspotId).\(safeExt)"
        let url = try await uploadData(data, to: storagePath, contentType: contentType)
        return HotspotMedia(type: type, url: url.absoluteString, storagePath: storagePath, fileName: fileName)
    }

    private func uploadData(_ data: Data, to path: String, contentType: String) async throws -> URL {
        let ref = Storage.storage().reference().child(path)
        let metadata = StorageMetadata()
        metadata.contentType = contentType
        _ = try await ref.putDataAsync(data, metadata: metadata)
        return try await ref.downloadURL()
    }
}

enum ProjectStoreError: LocalizedError {
    case invalidImage
    case missingId

    var errorDescription: String? {
        switch self {
        case .invalidImage: return "Couldn't read that image."
        case .missingId: return "This project hasn't been saved yet."
        }
    }
}
