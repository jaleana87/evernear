import { supabase } from "./supabase";
import type { Memory, MemType } from "./supabase";

function resolveImageUrl(
  path: string | null,
  bucket: string,
): string | undefined {
  if (!path) return undefined;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

function hydrate(mem: Memory): Memory {
  if (!mem.image_path) return mem;
  const bucket = mem.type === "voice" ? "memory-voice" : "memory-photos";
  return { ...mem, image_url: resolveImageUrl(mem.image_path, bucket) };
}

export async function loadMemories(spaceId: string): Promise<Memory[]> {
  const { data, error } = await supabase
    .from("memories")
    .select("*")
    .eq("space_id", spaceId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(hydrate);
}

export interface NewMemoryInput {
  spaceId: string;
  type: MemType;
  title: string;
  caption?: string;
  url?: string;
  imagePath?: string;
  sharedBy?: string;
}

export async function addMemory(input: NewMemoryInput): Promise<Memory> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");
  const { data, error } = await supabase
    .from("memories")
    .insert({
      space_id: input.spaceId,
      user_id: user.id,
      type: input.type,
      title: input.title,
      caption: input.caption ?? null,
      url: input.url ?? null,
      image_path: input.imagePath ?? null,
      shared_by: input.sharedBy ?? null,
      liked: false,
    })
    .select()
    .single();
  if (error) throw error;
  return hydrate(data);
}

export async function toggleLike(
  memoryId: string,
  currentLiked: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("memories")
    .update({ liked: !currentLiked })
    .eq("id", memoryId);
  if (error) throw error;
}

export async function deleteMemory(id: string): Promise<void> {
  const { error } = await supabase.from("memories").delete().eq("id", id);
  if (error) throw error;
}

export async function updateMemory(
  id: string,
  fields: {
    title?: string;
    caption?: string;
    url?: string;
    shared_by?: string;
  },
): Promise<void> {
  const { error } = await supabase.from("memories").update(fields).eq("id", id);
  if (error) throw error;
}
