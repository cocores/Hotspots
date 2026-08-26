import { useState } from "react";
import EditorView from "./components/EditorView";
import ProjectListView from "./components/ProjectListView";
import { useAuth } from "./hooks/useAuth";
import type { HotspotProject } from "./types";

export default function App() {
  const { uid, isReady, isConfigured } = useAuth();
  const [openProject, setOpenProject] = useState<HotspotProject | null>(null);

  if (!isConfigured) {
    return (
      <div className="center-message">
        <h1>Firebase isn't configured</h1>
        <p>
          Copy <code>.env.example</code> to <code>.env.local</code> and fill in your Firebase project's web config.
          See <code>web/README.md</code>.
        </p>
      </div>
    );
  }

  if (!isReady || !uid) {
    return (
      <div className="center-message">
        <p>Connecting…</p>
      </div>
    );
  }

  if (openProject) {
    return (
      <EditorView
        project={openProject}
        onBack={() => setOpenProject(null)}
      />
    );
  }

  return <ProjectListView ownerId={uid} onOpenProject={setOpenProject} />;
}
