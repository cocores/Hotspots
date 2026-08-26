import { useEffect, useState } from "react";
import { subscribeToProjects } from "../lib/projectsApi";
import type { HotspotProject } from "../types";

export function useProjects(ownerId: string | null) {
  const [projects, setProjects] = useState<HotspotProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ownerId) return;
    setIsLoading(true);
    const unsubscribe = subscribeToProjects(
      ownerId,
      (next) => {
        setProjects(next);
        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, [ownerId]);

  return { projects, isLoading, error };
}
