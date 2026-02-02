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

interface ServiceError {
  message: string;
  status: number;
}

type ServiceResult<T> = [T, null] | [null, ServiceError];

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
  const [userData, userError] = await getUserByToken(token);

  if (userError) {
    return [null, { message: "Unauthorized", status: 401 }];
  }

  const userId = getUserId(userData);
  if (!userId) {
    return [null, { message: "Unauthorized", status: 401 }];
  }

  const [profileData, profileError] = await getProfileByUserId(userId);
  if (profileError && profileError !== "not_found") {
    return [null, { message: profileError, status: 500 }];
  }
  if (!profileData && profileError !== "not_found") {
    return [null, { message: "Failed to fetch user profile", status: 500 }];
  }

  const [membershipsData, membershipsError] = await getCircleMemberships(
    userId
  );
  if (membershipsError) {
    return [null, { message: membershipsError, status: 500 }];
  }
  if (!membershipsData) {
    return [
      null,
      { message: "Failed to fetch circle memberships", status: 500 },
    ];
  }

  const circleIds = membershipsData.map((cm) => cm.circle_id);

  const displayName = buildDisplayName(
    profileError === "not_found" ? null : profileData,
    getUserEmail(userData)
  );

  if (circleIds.length === 0) {
    return [
      {
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
      null,
    ];
  }

  const [circlesData, circlesError] = await getCirclesByIds(circleIds);
  if (circlesError) {
    return [null, { message: circlesError, status: 500 }];
  }
  if (!circlesData) {
    return [null, { message: "Failed to fetch circles", status: 500 }];
  }

  const [membersData, membersError] = await getCircleMembersByCircleIds(
    circleIds
  );
  if (membersError) {
    return [null, { message: membersError, status: 500 }];
  }
  if (!membersData) {
    return [null, { message: "Failed to fetch circle members", status: 500 }];
  }

  const memberUserIds = [
    ...new Set(membersData.map((member) => member.user_id)),
  ];

  const [profilesData, profilesError] = await getProfilesByUserIds(
    memberUserIds
  );
  if (profilesError) {
    return [null, { message: profilesError, status: 500 }];
  }
  if (!profilesData) {
    return [null, { message: "Failed to fetch member profiles", status: 500 }];
  }

  const profileMap = mapProfiles(profilesData);
  const circles = buildCircles(
    circlesData,
    membershipsData,
    membersData,
    userId,
    profileMap
  );

  const activeCircleId = circles[0]?.id ?? null;

  return [
    {
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
    null,
  ];
};
