import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local",
  );
}

export const supabase = createClient(url, key);

export type MemType = "photo" | "note" | "voice" | "meme" | "link";

export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
}

export interface Space {
  id: string;
  owner_id: string;
  name: string;
  invite_code: string;
  created_at: string;
}

export interface SpaceMember {
  id: string;
  space_id: string;
  user_id: string;
  joined_at: string;
}

export interface Memory {
  id: string;
  space_id: string;
  user_id: string;
  type: MemType;
  title: string;
  caption: string | null;
  url: string | null;
  image_path: string | null;
  liked: boolean;
  shared_by: string | null;
  created_at: string;
  image_url?: string;
}
