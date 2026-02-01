import { supabase } from "../../supabaseClient";

export interface CircleMembershipRecord {
  circle_id: string;
  member_role: string;
}

export interface CircleRecord {
  id: string;
  name: string;
  owner_id: string;
}

export interface CircleMemberRecord {
  circle_id: string;
  user_id: string;
  member_role: string;
}

export interface ProfileRecord {
  user_id: string;
  display_name: string | null;
}

interface RepositorySuccess<T> {
  data: T;
}

interface RepositoryError {
  error: string;
}

type RepositoryResult<T> = RepositorySuccess<T> | RepositoryError;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNotFoundError = (error: unknown): boolean => {
  if (!isRecord(error)) {
    return false;
  }
  return error.code === "PGRST116";
};

export const getUserByToken = async (
  token: string
): Promise<RepositoryResult<unknown>> => {
  const { data, error } = await supabase.auth.getUser(token);

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "User not found" };
  }

  return { data: data.user };
};

export const getProfileByUserId = async (
  userId: string
): Promise<RepositoryResult<ProfileRecord | null>> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, user_id")
    .eq("user_id", userId)
    .single();

  if (error && !isNotFoundError(error)) {
    return { error: "Failed to fetch user profile" };
  }

  if (error && isNotFoundError(error)) {
    return { data: null };
  }

  return { data: data || null };
};

export const getCircleMemberships = async (
  userId: string
): Promise<RepositoryResult<CircleMembershipRecord[]>> => {
  const { data, error } = await supabase
    .from("circle_members")
    .select("circle_id, member_role")
    .eq("user_id", userId);

  if (error) {
    return { error: "Failed to fetch circle memberships" };
  }

  return { data: data || [] };
};

export const getCirclesByIds = async (
  circleIds: string[]
): Promise<RepositoryResult<CircleRecord[]>> => {
  const { data, error } = await supabase
    .from("circles")
    .select("id, name, owner_id")
    .in("id", circleIds);

  if (error) {
    return { error: "Failed to fetch circles" };
  }

  return { data: data || [] };
};

export const getCircleMembersByCircleIds = async (
  circleIds: string[]
): Promise<RepositoryResult<CircleMemberRecord[]>> => {
  const { data, error } = await supabase
    .from("circle_members")
    .select("circle_id, user_id, member_role")
    .in("circle_id", circleIds);

  if (error) {
    return { error: "Failed to fetch circle members" };
  }

  return { data: data || [] };
};

export const getProfilesByUserIds = async (
  userIds: string[]
): Promise<RepositoryResult<ProfileRecord[]>> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, display_name")
    .in("user_id", userIds);

  if (error) {
    return { error: "Failed to fetch member profiles" };
  }

  return { data: data || [] };
};
