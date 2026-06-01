import { supabase } from "./supabase";

export async function uploadPhoto(file: File, userId: string): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  // Use "guests" folder for guest uploads
  const folder = userId.startsWith("guest_") ? "guests" : userId;
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("memory-photos")
    .upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

export async function uploadVoice(file: File, userId: string): Promise<string> {
  const ext = file.name.split(".").pop() || "webm";
  const folder = userId.startsWith("guest_") ? "guests" : userId;
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("memory-voice")
    .upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

export function getPublicUrl(
  path: string,
  bucket: "memory-photos" | "memory-voice",
): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(
  path: string,
  bucket: "memory-photos" | "memory-voice",
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}
