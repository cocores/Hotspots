import FirebaseAuth
import Observation

/// Signs the device in anonymously so Firestore/Storage security rules can
/// key writes off a stable `request.auth.uid` — there's no account system,
/// just a per-device identity like the web app's anonymous id.
@Observable
final class AuthService {
    var userId: String?
    var isReady = false

    private var handle: AuthStateDidChangeListenerHandle?

    init() {
        handle = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            guard let self else { return }
            if let user {
                self.userId = user.uid
                self.isReady = true
            } else {
                self.signInAnonymously()
            }
        }
    }

    deinit {
        if let handle { Auth.auth().removeStateDidChangeListener(handle) }
    }

    private func signInAnonymously() {
        Auth.auth().signInAnonymously { [weak self] result, error in
            guard let self else { return }
            if let error {
                print("Anonymous sign-in failed: \(error.localizedDescription)")
                return
            }
            self.userId = result?.user.uid
            self.isReady = true
        }
    }
}
