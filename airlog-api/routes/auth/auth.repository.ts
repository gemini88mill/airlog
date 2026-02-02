import { supabase } from "../../supabaseClient";

export interface AuthSessionSummary {
  access_token: string;
  refresh_token: string;
  expires_at: number | null;
}

export interface AuthLoginResult {
  user: unknown;
  session: AuthSessionSummary;
}

export interface AuthSessionResult {
  user: unknown;
  session: { access_token: string } | null;
}

type RepositoryResult<T> = [T, null] | [null, string];

export const signInWithPassword = async (
  email: string,
  password: string
): Promise<RepositoryResult<AuthLoginResult>> => {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return [null, error.message];
  }

  if (!authData.session) {
    return [null, "No session created"];
  }

  return [
    {
      user: authData.user,
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at ?? null,
      },
    },
    null,
  ];
};

export const getUserByToken = async (
  token: string
): Promise<RepositoryResult<unknown>> => {
  const { data, error } = await supabase.auth.getUser(token);

  if (error) {
    return [null, error.message];
  }

  if (!data.user) {
    return [null, "User not found"];
  }

  return [data.user, null];
};
