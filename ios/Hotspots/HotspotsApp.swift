import FirebaseCore
import SwiftUI

@main
struct HotspotsApp: App {
    @State private var authService = AuthService()
    @State private var projectStore = ProjectStore()

    init() {
        FirebaseApp.configure()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(authService)
                .environment(projectStore)
                .preferredColorScheme(.dark)
        }
    }
}
