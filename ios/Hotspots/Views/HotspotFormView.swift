import PhotosUI
import SwiftUI
import UniformTypeIdentifiers

struct HotspotFormView: View {
    @Environment(ProjectStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    @Binding var project: HotspotProject
    private let isEditing: Bool
    private let hotspotId: String
    private let x: Double
    private let y: Double
    let onSaved: () -> Void

    @State private var title: String
    @State private var text: String
    @State private var link: String
    @State private var media: HotspotMedia?

    @State private var photoItem: PhotosPickerItem?
    @State private var showingAudioImporter = false
    @State private var isUploadingMedia = false
    @State private var isSaving = false
    @State private var errorMessage: String?

    init(project: Binding<HotspotProject>, hotspot: Hotspot, onSaved: @escaping () -> Void) {
        self._project = project
        self.isEditing = true
        self.hotspotId = hotspot.id
        self.x = hotspot.x
        self.y = hotspot.y
        self.onSaved = onSaved
        _title = State(initialValue: hotspot.title)
        _text = State(initialValue: hotspot.text)
        _link = State(initialValue: hotspot.link ?? "")
        _media = State(initialValue: hotspot.media)
    }

    init(project: Binding<HotspotProject>, newHotspotAt point: PendingPoint, onSaved: @escaping () -> Void) {
        self._project = project
        self.isEditing = false
        self.hotspotId = UUID().uuidString
        self.x = point.x
        self.y = point.y
        self.onSaved = onSaved
        _title = State(initialValue: "")
        _text = State(initialValue: "")
        _link = State(initialValue: "")
        _media = State(initialValue: nil)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Title") {
                    TextField("e.g. Main Entrance", text: $title)
                }
                Section("Description") {
                    TextField("Optional details…", text: $text, axis: .vertical)
                        .lineLimit(3...6)
                }
                Section("Media") {
                    mediaContent
                }
                Section("Link") {
                    TextField("https://…", text: $link)
                        .keyboardType(.URL)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                }
                if isEditing {
                    Section {
                        Button("Delete Hotspot", role: .destructive) {
                            project.hotspots.removeAll { $0.id == hotspotId }
                            onSaved()
                            dismiss()
                        }
                    }
                }
            }
            .navigationTitle(isEditing ? "Edit Hotspot" : "New Hotspot")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    if isSaving {
                        ProgressView()
                    } else {
                        Button("Save") { save() }
                            .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    }
                }
            }
            .onChange(of: photoItem) { _, newValue in
                guard let newValue else { return }
                Task { await uploadPickedPhoto(newValue) }
            }
            .fileImporter(isPresented: $showingAudioImporter, allowedContentTypes: [.audio]) { result in
                if case .success(let url) = result {
                    Task { await uploadPickedAudio(url) }
                }
            }
            .alert("Something went wrong", isPresented: .constant(errorMessage != nil)) {
                Button("OK") { errorMessage = nil }
            } message: {
                Text(errorMessage ?? "")
            }
        }
    }

    @ViewBuilder
    private var mediaContent: some View {
        if let media {
            HStack {
                if media.type == .image {
                    AsyncImage(url: URL(string: media.url)) { phase in
                        (phase.image ?? Image(systemName: "photo")).resizable().aspectRatio(contentMode: .fill)
                    }
                    .frame(width: 44, height: 44)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                } else {
                    Image(systemName: "waveform")
                        .frame(width: 44, height: 44)
                        .background(Color.gray.opacity(0.2))
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                }
                Text(media.fileName).lineLimit(1)
                Spacer()
                Button(role: .destructive) { self.media = nil } label: {
                    Image(systemName: "xmark.circle.fill")
                }
            }
        } else if isUploadingMedia {
            HStack { ProgressView(); Text("Uploading…") }
        } else {
            HStack {
                PhotosPicker(selection: $photoItem, matching: .images) {
                    Label("Image", systemImage: "photo")
                }
                Spacer()
                Button {
                    showingAudioImporter = true
                } label: {
                    Label("Audio", systemImage: "waveform")
                }
            }
        }
    }

    private func save() {
        let trimmedTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedTitle.isEmpty else { return }
        let trimmedLink = link.trimmingCharacters(in: .whitespacesAndNewlines)
        let hotspot = Hotspot(
            id: hotspotId,
            x: x,
            y: y,
            title: trimmedTitle,
            text: text.trimmingCharacters(in: .whitespacesAndNewlines),
            link: trimmedLink.isEmpty ? nil : trimmedLink,
            media: media
        )
        if let index = project.hotspots.firstIndex(where: { $0.id == hotspotId }) {
            project.hotspots[index] = hotspot
        } else {
            project.hotspots.append(hotspot)
        }
        onSaved()
        dismiss()
    }

    private func uploadPickedPhoto(_ item: PhotosPickerItem) async {
        guard let data = try? await item.loadTransferable(type: Data.self), let projectId = project.id else { return }
        isUploadingMedia = true
        do {
            media = try await store.uploadHotspotMedia(
                projectId: projectId,
                hotspotId: hotspotId,
                data: data,
                type: .image,
                fileName: "photo.jpg",
                contentType: "image/jpeg"
            )
        } catch {
            errorMessage = error.localizedDescription
        }
        isUploadingMedia = false
        photoItem = nil
    }

    private func uploadPickedAudio(_ url: URL) async {
        guard url.startAccessingSecurityScopedResource() else { return }
        defer { url.stopAccessingSecurityScopedResource() }
        guard let data = try? Data(contentsOf: url), let projectId = project.id else { return }
        isUploadingMedia = true
        do {
            media = try await store.uploadHotspotMedia(
                projectId: projectId,
                hotspotId: hotspotId,
                data: data,
                type: .audio,
                fileName: url.lastPathComponent,
                contentType: "audio/mpeg"
            )
        } catch {
            errorMessage = error.localizedDescription
        }
        isUploadingMedia = false
    }
}
