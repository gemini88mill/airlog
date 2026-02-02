type RepositoryResult<T> = [T, null] | [null, string];

export const createCircleStub = async (
  payload: Record<string, unknown>
): Promise<RepositoryResult<Record<string, unknown>>> => {
  return [payload, null];
};

export const listCirclesStub = async (): Promise<
  RepositoryResult<Array<Record<string, unknown>>>
> => {
  return [[], null];
};

export const listCircleMembersStub = async (
  circleId: string
): Promise<RepositoryResult<Array<Record<string, unknown>>>> => {
  return [[{ circleId }], null];
};
