import PhotosUI
import SwiftUI

struct ProjectListView: View {
    @Environment(AuthService.self) private var auth
    @Environment(ProjectStore.self) private var store

    @State private var photoItem: PhotosPickerItem?
    @State private var pendingImage: UIImage?
    @State private var newProjectName = ""
    @State private var showingNamePrompt = false
    @State private var isCreating = false
    @State private var createError: String?
    @State private var path = NavigationPath()
    @State private var pendingDelete: HotspotProject?

    var body: some View {
        NavigationStack(path: $path) {
            content
                .navigationTitle("Hotspots")
                .navigationDestination(for: HotspotProject.self) { project in
                    EditorView(project: project)
                }
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        PhotosPicker(selection: $photoItem, matching: .images) {
                            Label("New Project", systemImage: "plus.circle.fill")
                        }
                        .disabled(isCreating)
                    }
                }
                .onChange(of: photoItem) { _, newValue in
                    guard let newValue else { return }
                    Task { await loadPickedImage(newValue) }
                }
                .sheet(isPresented: $showingNamePrompt) {
                    NewProjectNameSheet(
                        name: $newProjectName,
                        isCreating: isCreating,
                        onCancel: {
                            showingNamePrompt = false
                            pendingImage = nil
                        },
                        onCreate: { Task { await createProject() } }
                    )
                }
                .alert("Couldn't create project", isPresented: .constant(createError != nil), actions: {
                    Button("OK") { createError = nil }
                }, message: {
                    Text(createError ?? "")
                })
                .confirmationDialog(
                    "Delete this project?",
                    isPresented: .constant(pendingDelete != nil),
                    titleVisibility: .visible
                ) {
                    Button("Delete", role: .destructive) {
                        if let project = pendingDelete { Task { await delete(project) } }
                    }
                    Button("Cancel", role: .cancel) { pendingDelete = nil }
                }
        }
    }

    @ViewBuilder
    private var content: some View {
        if store.isLoading {
            ProgressView().tint(.white)
        } else if store.projects.isEmpty {
            emptyState
        } else {
            List {
                ForEach(store.projects) { project in
                    NavigationLink(value: project) {
                        ProjectRow(project: project)
                    }
                    .swipeActions {
                        Button("Delete", role: .destructive) { pendingDelete = project }
                    }
                }
            }
            .listStyle(.plain)
        }
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "mappin.and.ellipse")
                .font(.system(size: 40))
                .foregroundStyle(.secondary)
            Text("No projects yet")
                .font(.headline)
            Text("Tap New Project to upload an image and start placing hotspots.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func loadPickedImage(_ item: PhotosPickerItem) async {
        defer { photoItem = nil }
        guard let data = try? await item.loadTransferable(type: Data.self),
              let image = UIImage(data: data) else { return }
        pendingImage = image
        newProjectName = "Untitled Project"
        showingNamePrompt = true
    }

    private func createProject() async {
        guard let uid = auth.userId, let image = pendingImage else { return }
        let name = newProjectName.trimmingCharacters(in: .whitespacesAndNewlines)
        isCreating = true
        do {
            let project = try await store.createProject(
                name: name.isEmpty ? "Untitled Project" : name,
                image: image,
                ownerId: uid
            )
            isCreating = false
            showingNamePrompt = false
            pendingImage = nil
            path.append(project)
        } catch {
            isCreating = false
            createError = error.localizedDescription
        }
    }

    private func delete(_ project: HotspotProject) async {
        pendingDelete = nil
        try? await store.delete(project)
    }
}

private struct ProjectRow: View {
    let project: HotspotProject

    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: URL(string: project.imageURL)) { phase in
                if let image = phase.image {
                    image.resizable().aspectRatio(contentMode: .fill)
                } else {
                    Color.gray.opacity(0.2)
                }
            }
            .frame(width: 56, height: 56)
            .clipShape(RoundedRectangle(cornerRadius: 10))

            VStack(alignment: .leading, spacing: 4) {
                Text(project.name).font(.headline)
                Text("\(project.hotspots.count) hotspot\(project.hotspots.count == 1 ? "" : "s")")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

private struct NewProjectNameSheet: View {
    @Binding var name: String
    let isCreating: Bool
    let onCancel: () -> Void
    let onCreate: () -> Void

    var body: some View {
        NavigationStack {
            Form {
                Section("Project name") {
                    TextField("e.g. Store Layout", text: $name)
                }
            }
            .navigationTitle("New Project")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel", action: onCancel).disabled(isCreating)
                }
                ToolbarItem(placement: .confirmationAction) {
                    if isCreating {
                        ProgressView()
                    } else {
                        Button("Create", action: onCreate)
                            .disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    }
                }
            }
        }
        .presentationDetents([.height(180)])
    }
}
