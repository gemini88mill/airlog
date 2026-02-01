import {
  createCircleStub,
  listCircleMembersStub,
  listCirclesStub,
} from "./circles.repository";

interface ServiceSuccess<T> {
  data: T;
}

interface ServiceError {
  error: string;
  status: number;
}

type ServiceResult<T> = ServiceSuccess<T> | ServiceError;

export const createCircle = async (
  payload: Record<string, unknown>
): Promise<ServiceResult<Record<string, unknown>>> => {
  const result = await createCircleStub(payload);

  if ("error" in result) {
    return { error: result.error, status: 400 };
  }

  return { data: result.data };
};

export const listCircles = async (): Promise<
  ServiceResult<Array<Record<string, unknown>>>
> => {
  const result = await listCirclesStub();

  if ("error" in result) {
    return { error: result.error, status: 400 };
  }

  return { data: result.data };
};

export const addCircleMember = async (
  circleId: string,
  payload: Record<string, unknown>
): Promise<ServiceResult<Record<string, unknown>>> => {
  return { data: { circleId, ...payload } };
};

export const listCircleMembers = async (
  circleId: string
): Promise<ServiceResult<Array<Record<string, unknown>>>> => {
  const result = await listCircleMembersStub(circleId);

  if ("error" in result) {
    return { error: result.error, status: 400 };
  }

  return { data: result.data };
};
