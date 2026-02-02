import {
  getUserByToken,
  signInWithPassword,
  type AuthLoginResult,
  type AuthSessionResult,
} from "./auth.repository";

interface ServiceError {
  message: string;
  status: number;
}

type ServiceResult<T> = [T, null] | [null, ServiceError];

export const loginWithPassword = async (
  email: string,
  password: string
): Promise<ServiceResult<AuthLoginResult>> => {
  const [data, error] = await signInWithPassword(email, password);

  if (error) {
    return [null, { message: error, status: 401 }];
  }

  if (!data) {
    return [null, { message: "No session created", status: 401 }];
  }

  return [data, null];
};

export const logoutWithToken = async (
  token: string
): Promise<ServiceResult<{ message: string }>> => {
  const [, error] = await getUserByToken(token);

  if (error) {
    return [{ message: "Logged out successfully" }, null];
  }

  return [{ message: "Logged out successfully" }, null];
};

export const getSessionForToken = async (
  token: string
): Promise<ServiceResult<AuthSessionResult>> => {
  const [data, error] = await getUserByToken(token);

  if (error) {
    return [{ user: null, session: null }, null];
  }

  return [{ user: data, session: { access_token: token } }, null];
};
