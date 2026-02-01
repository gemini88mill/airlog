import {
  getUserByToken,
  signInWithPassword,
  type AuthLoginResult,
  type AuthSessionResult,
} from "./auth.repository";

interface ServiceSuccess<T> {
  data: T;
}

interface ServiceError {
  error: string;
  status: number;
}

type ServiceResult<T> = ServiceSuccess<T> | ServiceError;

export const loginWithPassword = async (
  email: string,
  password: string
): Promise<ServiceResult<AuthLoginResult>> => {
  const result = await signInWithPassword(email, password);

  if ("error" in result) {
    return { error: result.error, status: 401 };
  }

  return { data: result.data };
};

export const logoutWithToken = async (
  token: string
): Promise<ServiceResult<{ message: string }>> => {
  const result = await getUserByToken(token);

  if ("error" in result) {
    return { data: { message: "Logged out successfully" } };
  }

  return { data: { message: "Logged out successfully" } };
};

export const getSessionForToken = async (
  token: string
): Promise<ServiceResult<AuthSessionResult>> => {
  const result = await getUserByToken(token);

  if ("error" in result) {
    return { data: { user: null, session: null } };
  }

  return { data: { user: result.data, session: { access_token: token } } };
};
