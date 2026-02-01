import {
  getCircleMembersByCircleIds,
  getCircleMemberships,
  getCirclesByIds,
  getProfileByUserId,
  getProfilesByUserIds,
  getUserByToken,
  type CircleMemberRecord,
  type CircleMembershipRecord,
  type CircleRecord,
  type ProfileRecord,
} from "./bootstrap.repository";

interface ServiceSuccess<T> {
  data: T;
}

interface ServiceError {
  error: string;
  status: number;
}

type ServiceResult<T> = ServiceSuccess<T> | ServiceError;

interface BootstrapMember {
  id: string;
  displayName: string;
}

interface BootstrapCircle {
  id: string;
  name: string;
  role: string;
  members: BootstrapMember[];
}

interface BootstrapResponse {
  user: { id: string; displayName: string };
  circles: BootstrapCircle[];
  defaults: { activeCircleId: string | null; canCreateFlights: boolean };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === "string";

const getUserId = (user: unknown): string | null => {
  if (!isRecord(user)) {
    return null;
  }
  const id = user.id;
  return isString(id) ? id : null;
};

const getUserEmail = (user: unknown): string | null => {
  if (!isRecord(user)) {
    return null;
  }
  const email = user.email;
  return isString(email) ? email : null;
};

const buildDisplayName = (
  profile: ProfileRecord | null,
  email: string | null
): string => {
  if (profile?.display_name) {
    return profile.display_name;
  }
  if (email) {
    return email.split("@")[0] || "User";
  }
  return "User";
};

const mapProfiles = (profiles: ProfileRecord[]): Map<string, string | null> =>
  new Map(profiles.map((profile) => [profile.user_id, profile.display_name]));

const buildMembers = (
  members: CircleMemberRecord[],
  profileMap: Map<string, string | null>
): BootstrapMember[] =>
  members.map((member) => ({
    id: member.user_id,
    displayName:
      profileMap.get(member.user_id) ||
      member.user_id.split("-")[0] ||
      "Unknown",
  }));

const buildCircles = (
  circles: CircleRecord[],
  memberships: CircleMembershipRecord[],
  members: CircleMemberRecord[],
  userId: string,
  profileMap: Map<string, string | null>
): BootstrapCircle[] =>
  circles.map((circle) => {
    const membership = memberships.find((cm) => cm.circle_id === circle.id);
    const role =
      circle.owner_id === userId ? "owner" : membership?.member_role || "member";
    const circleMembers = members.filter((m) => m.circle_id === circle.id);

    return {
      id: circle.id,
      name: circle.name,
      role,
      members: buildMembers(circleMembers, profileMap),
    };
  });

export const bootstrapUser = async (
  token: string
): Promise<ServiceResult<BootstrapResponse>> => {
  const userResult = await getUserByToken(token);

  if ("error" in userResult) {
    return { error: "Unauthorized", status: 401 };
  }

  const userId = getUserId(userResult.data);
  if (!userId) {
    return { error: "Unauthorized", status: 401 };
  }

  const profileResult = await getProfileByUserId(userId);
  if ("error" in profileResult) {
    return { error: profileResult.error, status: 500 };
  }

  const membershipsResult = await getCircleMemberships(userId);
  if ("error" in membershipsResult) {
    return { error: membershipsResult.error, status: 500 };
  }

  const circleIds = membershipsResult.data.map((cm) => cm.circle_id);

  const displayName = buildDisplayName(
    profileResult.data,
    getUserEmail(userResult.data)
  );

  if (circleIds.length === 0) {
    return {
      data: {
        user: {
          id: userId,
          displayName,
        },
        circles: [],
        defaults: {
          activeCircleId: null,
          canCreateFlights: true,
        },
      },
    };
  }

  const circlesResult = await getCirclesByIds(circleIds);
  if ("error" in circlesResult) {
    return { error: circlesResult.error, status: 500 };
  }

  const membersResult = await getCircleMembersByCircleIds(circleIds);
  if ("error" in membersResult) {
    return { error: membersResult.error, status: 500 };
  }

  const memberUserIds = [
    ...new Set(membersResult.data.map((member) => member.user_id)),
  ];

  const profilesResult = await getProfilesByUserIds(memberUserIds);
  if ("error" in profilesResult) {
    return { error: profilesResult.error, status: 500 };
  }

  const profileMap = mapProfiles(profilesResult.data);
  const circles = buildCircles(
    circlesResult.data,
    membershipsResult.data,
    membersResult.data,
    userId,
    profileMap
  );

  const activeCircleId = circles[0]?.id ?? null;

  return {
    data: {
      user: {
        id: userId,
        displayName,
      },
      circles,
      defaults: {
        activeCircleId,
        canCreateFlights: true,
      },
    },
  };
};
