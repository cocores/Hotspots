import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { getDb, getStorageClient } from "../firebase";
import type { HotspotMedia, HotspotMediaType, HotspotProject } from "../types";
import { defaultStyle } from "../types";

const COLLECTION = "projects";

export function subscribeToProjects(
  ownerId: string,
  onChange: (projects: HotspotProject[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const q = query(collection(getDb(), COLLECTION), where("ownerId", "==", ownerId), orderBy("updatedAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      onChange(snapshot.docs.map((d) => ({ ...(d.data() as Omit<HotspotProject, "id">), id: d.id })));
    },
    (error) => onError(error)
  );
}

async function uploadFile(path: string, file: Blob, contentType: string): Promise<string> {
  const storageRef = ref(getStorageClient(), path);
  await uploadBytes(storageRef, file, { contentType });
  return getDownloadURL(storageRef);
}

function readImageDimensions(file: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read that image."));
    };
    img.src = url;
  });
}

export async function createProject(name: string, imageFile: File, ownerId: string): Promise<HotspotProject> {
  const { width, height } = await readImageDimensions(imageFile);
  const docRef = doc(collection(getDb(), COLLECTION));
  const projectId = docRef.id;
  const ext = imageFile.type === "image/png" ? "png" : imageFile.type === "image/webp" ? "webp" : imageFile.type === "image/gif" ? "gif" : "jpg";
  const storagePath = `projects/${projectId}/main.${ext}`;
  const url = await uploadFile(storagePath, imageFile, imageFile.type || "image/jpeg");

  const now = Date.now() / 1000;
  const project: HotspotProject = {
    id: projectId,
    name,
    ownerId,
    imageURL: url,
    imageStoragePath: storagePath,
    imageWidth: width,
    imageHeight: height,
    style: defaultStyle(),
    hotspots: [],
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(docRef, withoutId(project));
  return project;
}

export async function saveProject(project: HotspotProject): Promise<void> {
  const updated: HotspotProject = { ...project, updatedAt: Date.now() / 1000 };
  await setDoc(doc(getDb(), COLLECTION, project.id), withoutId(updated));
}

export async function deleteProject(project: HotspotProject): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTION, project.id));
  try {
    const folder = ref(getStorageClient(), `projects/${project.id}`);
    const listing = await listAll(folder);
    await Promise.all(listing.items.map((item) => deleteObject(item)));
    for (const prefix of listing.prefixes) {
      const nested = await listAll(prefix);
      await Promise.all(nested.items.map((item) => deleteObject(item)));
    }
  } catch {
    // best-effort cleanup; a failed delete here shouldn't block the UI
  }
}

export async function uploadHotspotMedia(
  projectId: string,
  hotspotId: string,
  file: File,
  type: HotspotMediaType
): Promise<HotspotMedia> {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : type === "image" ? "jpg" : "m4a";
  const storagePath = `projects/${projectId}/hotspots/${hotspotId}.${ext}`;
  const url = await uploadFile(storagePath, file, file.type || (type === "image" ? "image/jpeg" : "audio/mpeg"));
  return { type, url, storagePath, fileName: file.name };
}

function withoutId(project: HotspotProject): Omit<HotspotProject, "id"> {
  const { id, ...rest } = project;
  void id;
  return rest;
}
