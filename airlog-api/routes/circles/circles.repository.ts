interface RepositorySuccess<T> {
  data: T;
}

interface RepositoryError {
  error: string;
}

type RepositoryResult<T> = RepositorySuccess<T> | RepositoryError;

export const createCircleStub = async (
  payload: Record<string, unknown>
): Promise<RepositoryResult<Record<string, unknown>>> => {
  return { data: payload };
};

export const listCirclesStub = async (): Promise<
  RepositoryResult<Array<Record<string, unknown>>>
> => {
  return { data: [] };
};

export const listCircleMembersStub = async (
  circleId: string
): Promise<RepositoryResult<Array<Record<string, unknown>>>> => {
  return { data: [{ circleId }] };
};
