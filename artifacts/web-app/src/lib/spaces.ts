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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: owned } = await supabase
    .from("spaces")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const { data: memberships } = await supabase
    .from("space_members")
    .select("space_id, spaces(*)")
    .eq("user_id", user.id);

  const joined =
    memberships
      ?.map((m: any) => m.spaces)
      .filter(Boolean)
      .filter((s: Space) => s.owner_id !== user.id) ?? [];

  return [...(owned ?? []), ...joined];
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
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  const { data: space, error: spaceError } = await supabase
    .from("spaces")
    .select("*")
    .eq("invite_code", inviteCode)
    .single();

  if (spaceError || !space) throw new Error("Invalid invite link");

  await supabase
    .from("space_members")
    .upsert({ space_id: space.id, user_id: user.id });

  return space;
}

export function getInviteUrl(inviteCode: string): string {
  return `${window.location.origin}/join/${inviteCode}`;
}
