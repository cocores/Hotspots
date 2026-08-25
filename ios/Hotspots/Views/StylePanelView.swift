import SwiftUI

struct StylePanelView: View {
    @Binding var style: HotspotStyle
    let onChanged: () -> Void
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section("Color") {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 7), spacing: 12) {
                        ForEach(HotspotStyle.swatches, id: \.self) { hex in
                            swatch(hex)
                        }
                        ColorPicker("", selection: Binding(
                            get: { style.color },
                            set: { style.colorHex = $0.toHex(); onChanged() }
                        ))
                        .labelsHidden()
                    }
                    .padding(.vertical, 4)
                }

                Section("Animation") {
                    Picker("Animation", selection: Binding(
                        get: { style.animation },
                        set: { style.animation = $0; onChanged() }
                    )) {
                        ForEach(HotspotAnimation.allCases) { anim in
                            Text(anim.label).tag(anim)
                        }
                    }
                    .pickerStyle(.segmented)

                    if style.animation != .none {
                        HStack {
                            Text("Slow")
                            Slider(
                                value: Binding(
                                    get: { style.pulseSpeed },
                                    set: { style.pulseSpeed = $0; onChanged() }
                                ),
                                in: 0.5...4
                            )
                            Text("Fast")
                        }
                        .font(.caption)
                    }
                }

                Section("Preview") {
                    HStack {
                        Spacer()
                        HotspotPinView(
                            number: 1,
                            hotspot: Hotspot(x: 0, y: 0, title: "Preview"),
                            style: style,
                            isExpanded: false,
                            isDragging: false
                        )
                        Spacer()
                    }
                    .padding(.vertical, 12)
                }
            }
            .navigationTitle("Hotspot Style")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }

    private func swatch(_ hex: String) -> some View {
        Circle()
            .fill(Color(hex: hex))
            .frame(width: 28, height: 28)
            .overlay(
                Circle().stroke(.white, lineWidth: style.colorHex == hex ? 2 : 0)
            )
            .overlay(
                Circle().stroke(.white.opacity(0.15), lineWidth: 1)
            )
            .onTapGesture {
                style.colorHex = hex
                onChanged()
            }
    }
}
