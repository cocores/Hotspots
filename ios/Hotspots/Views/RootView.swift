import SwiftUI

struct RootView: View {
    @Environment(AuthService.self) private var auth
    @Environment(ProjectStore.self) private var store

    var body: some View {
        Group {
            if auth.isReady, let uid = auth.userId {
                ProjectListView()
                    .onAppear { store.start(ownerId: uid) }
            } else {
                ProgressView("Connecting…")
                    .tint(.white)
            }
        }
    }
}
