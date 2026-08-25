import SwiftUI

enum EditorMode: String, CaseIterable, Identifiable {
    case add = "Add Hotspot"
    case preview = "Preview"
    var id: String { rawValue }
}

struct EditorView: View {
    @Environment(ProjectStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    @State private var project: HotspotProject
    @State private var mode: EditorMode = .add
    @State private var editingHotspot: Hotspot?
    @State private var pendingPoint: PendingPoint?
    @State private var showingHotspotList = false
    @State private var showingStylePanel = false
    @State private var isSaving = false
    @State private var hasUnsavedChanges = false
    @State private var saveError: String?

    init(project: HotspotProject) {
        _project = State(initialValue: project)
    }

    var body: some View {
        VStack(spacing: 0) {
            Picker("Mode", selection: $mode) {
                ForEach(EditorMode.allCases) { m in
                    Text(m.rawValue).tag(m)
                }
            }
            .pickerStyle(.segmented)
            .padding(.horizontal)
            .padding(.top, 8)

            EditorCanvasView(
                project: $project,
                mode: mode,
                onPlaceHotspot: { x, y in
                    pendingPoint = PendingPoint(x: x, y: y)
                    editingHotspot = nil
                },
                onTapHotspot: { hotspot in
                    if mode == .add {
                        editingHotspot = hotspot
                    }
                },
                onMarkDirty: { hasUnsavedChanges = true }
            )
            .padding(.horizontal)
            .padding(.vertical, 8)

            bottomBar
        }
        .navigationTitle(project.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    Task { await save() }
                } label: {
                    if isSaving {
                        ProgressView()
                    } else {
                        Label("Save", systemImage: hasUnsavedChanges ? "arrow.down.circle.fill" : "checkmark.circle")
                    }
                }
                .disabled(isSaving)
            }
        }
        .sheet(item: $editingHotspot) { hotspot in
            HotspotFormView(project: $project, hotspot: hotspot) {
                hasUnsavedChanges = true
            }
        }
        .sheet(item: $pendingPoint) { point in
            HotspotFormView(project: $project, newHotspotAt: point) {
                hasUnsavedChanges = true
            }
        }
        .sheet(isPresented: $showingHotspotList) {
            HotspotListSheet(project: $project, onEdit: { hotspot in
                showingHotspotList = false
                editingHotspot = hotspot
            }, onDelete: {
                hasUnsavedChanges = true
            })
        }
        .sheet(isPresented: $showingStylePanel) {
            StylePanelView(style: $project.style) {
                hasUnsavedChanges = true
            }
        }
        .alert("Couldn't save", isPresented: .constant(saveError != nil)) {
            Button("OK") { saveError = nil }
        } message: {
            Text(saveError ?? "")
        }
        .onDisappear {
            if hasUnsavedChanges { Task { try? await store.save(project) } }
        }
    }

    private var bottomBar: some View {
        HStack {
            Button {
                showingHotspotList = true
            } label: {
                Label("\(project.hotspots.count)", systemImage: "list.bullet.circle")
            }
            Spacer()
            Button {
                showingStylePanel = true
            } label: {
                Label("Style", systemImage: "paintpalette")
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
        .background(.bar)
    }

    private func save() async {
        isSaving = true
        do {
            try await store.save(project)
            hasUnsavedChanges = false
        } catch {
            saveError = error.localizedDescription
        }
        isSaving = false
    }
}

struct PendingPoint: Identifiable {
    let id = UUID()
    let x: Double
    let y: Double
}
