import {
  createCircleStub,
  listCircleMembersStub,
  listCirclesStub,
} from "./circles.repository";

interface ServiceError {
  message: string;
  status: number;
}

type ServiceResult<T> = [T, null] | [null, ServiceError];

export const createCircle = async (
  payload: Record<string, unknown>
): Promise<ServiceResult<Record<string, unknown>>> => {
  const [data, error] = await createCircleStub(payload);

  if (error) {
    return [null, { message: error, status: 400 }];
  }

  if (!data) {
    return [null, { message: "Failed to create circle", status: 400 }];
  }

  return [data, null];
};

export const listCircles = async (): Promise<
  ServiceResult<Array<Record<string, unknown>>>
> => {
  const [data, error] = await listCirclesStub();

  if (error) {
    return [null, { message: error, status: 400 }];
  }

  if (!data) {
    return [null, { message: "Failed to fetch circles", status: 400 }];
  }

  return [data, null];
};

export const addCircleMember = async (
  circleId: string,
  payload: Record<string, unknown>
): Promise<ServiceResult<Record<string, unknown>>> => {
  return [{ circleId, ...payload }, null];
};

export const listCircleMembers = async (
  circleId: string
): Promise<ServiceResult<Array<Record<string, unknown>>>> => {
  const [data, error] = await listCircleMembersStub(circleId);

  if (error) {
    return [null, { message: error, status: 400 }];
  }

  if (!data) {
    return [null, { message: "Failed to fetch circle members", status: 400 }];
  }

  return [data, null];
};
