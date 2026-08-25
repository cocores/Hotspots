import SwiftUI

struct HotspotListSheet: View {
    @Binding var project: HotspotProject
    let onEdit: (Hotspot) -> Void
    let onDelete: () -> Void
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Group {
                if project.hotspots.isEmpty {
                    emptyState
                } else {
                    List {
                        Section {
                            statsRow
                        }
                        Section {
                            ForEach(Array(project.hotspots.enumerated()), id: \.element.id) { index, hotspot in
                                Button {
                                    onEdit(hotspot)
                                } label: {
                                    HotspotRow(index: index, hotspot: hotspot)
                                }
                                .buttonStyle(.plain)
                            }
                            .onDelete { offsets in
                                project.hotspots.remove(atOffsets: offsets)
                                onDelete()
                            }
                        }
                    }
                }
            }
            .navigationTitle("Hotspots")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }

    private var statsRow: some View {
        HStack {
            statBox("Total", "\(project.hotspots.count)")
            Divider()
            statBox("Media", "\(project.mediaCount)")
            Divider()
            statBox("Text", "\(project.textCount)")
            Divider()
            statBox("Links", "\(project.linkCount)")
        }
    }

    private func statBox(_ label: String, _ value: String) -> some View {
        VStack(spacing: 2) {
            Text(value).font(.headline)
            Text(label).font(.caption2).foregroundStyle(.secondary).textCase(.uppercase)
        }
        .frame(maxWidth: .infinity)
    }

    private var emptyState: some View {
        VStack(spacing: 10) {
            Image(systemName: "circle.dashed")
                .font(.system(size: 32))
                .foregroundStyle(.secondary)
            Text("No hotspots yet")
                .font(.headline)
            Text("Switch to Add Hotspot mode and tap the image.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

private struct HotspotRow: View {
    let index: Int
    let hotspot: Hotspot

    var body: some View {
        HStack(spacing: 10) {
            Text("\(index + 1)")
                .font(.system(size: 11, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
                .frame(width: 24, height: 24)
                .background(Circle().fill(Color.orange))

            VStack(alignment: .leading, spacing: 4) {
                Text(hotspot.title).font(.subheadline.weight(.medium))
                HStack(spacing: 4) {
                    if hotspot.hasText { badge("Text", .blue) }
                    if hotspot.hasMedia {
                        badge(hotspot.media?.type == .image ? "Image" : "Audio", .green)
                    }
                    if hotspot.hasLink { badge("Link", .orange) }
                    if !hotspot.hasText && !hotspot.hasMedia && !hotspot.hasLink {
                        badge("No content yet", .gray)
                    }
                }
            }
            Spacer()
            Image(systemName: "chevron.right").font(.caption).foregroundStyle(.tertiary)
        }
        .padding(.vertical, 2)
    }

    private func badge(_ text: String, _ color: Color) -> some View {
        Text(text)
            .font(.system(size: 10, weight: .semibold))
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(color.opacity(0.15))
            .foregroundStyle(color)
            .clipShape(Capsule())
    }
}
