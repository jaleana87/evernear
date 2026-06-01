import { supabase } from "./supabase";
import type { Space } from "./supabase";

export async function createSpace(name: string): Promise<Space> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");
  const { data, error } = await supabase
    .from("spaces")
    .insert({ name, owner_id: user.id })
    .select()
    .single();
  if (error) throw error;
  await supabase
    .from("space_members")
    .insert({ space_id: data.id, user_id: user.id });
  return data;
}

export async function loadMySpaces(): Promise<Space[]> {
  // Use getSession instead of getUser — faster, no extra network call
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return [];
  const userId = session.user.id;

  // Single query — get all spaces where user is owner
  const { data: owned } = await supabase
    .from("spaces")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  return owned ?? [];
}

export async function loadSpace(spaceId: string): Promise<Space | null> {
  const { data, error } = await supabase
    .from("spaces")
    .select("*")
    .eq("id", spaceId)
    .single();
  if (error) return null;
  return data;
}

export async function joinByInviteCode(inviteCode: string): Promise<Space> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Not logged in");
  const { data: space, error: spaceError } = await supabase
    .from("spaces")
    .select("*")
    .eq("invite_code", inviteCode)
    .single();
  if (spaceError || !space) throw new Error("Invalid invite link");
  await supabase
    .from("space_members")
    .upsert({ space_id: space.id, user_id: session.user.id });
  return space;
}

export function getInviteUrl(inviteCode: string): string {
  return `${window.location.origin}/join/${inviteCode}`;
}
