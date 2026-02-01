import { HTTPMethods } from "../HTTPMethods";
import { supabase } from "../supabaseClient";

const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

const getAuthenticatedUser = async (req: Request) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
};

export const bootstrapRoutes = {
  // GET /v1/bootstrap → get all essential user data for app initialization
  "/v1/bootstrap": async (req: Request) => {
    if (req.method !== HTTPMethods.GET) {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      // Authenticate user
      const user = await getAuthenticatedUser(req);
      if (!user) {
        return Response.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        // PGRST116 is "not found" - we'll handle missing profile gracefully
        return Response.json(
          { error: "Failed to fetch user profile" },
          { status: 500 }
        );
      }

      // Get all circles where user is a member
      const { data: circleMemberships, error: membershipError } = await supabase
        .from("circle_members")
        .select("circle_id, member_role")
        .eq("user_id", user.id);

      if (membershipError) {
        return Response.json(
          { error: "Failed to fetch circle memberships" },
          { status: 500 }
        );
      }

      const circleIds = circleMemberships?.map((cm) => cm.circle_id) || [];

      // If user has no circles, return minimal bootstrap data
      if (circleIds.length === 0) {
        return Response.json({
          user: {
            id: user.id,
            displayName: profile?.display_name || user.email?.split("@")[0] || "User",
          },
          circles: [],
          defaults: {
            activeCircleId: null,
            canCreateFlights: true,
          },
        });
      }

      // Get circle details
      const { data: circles, error: circlesError } = await supabase
        .from("circles")
        .select("id, name, owner_id")
        .in("id", circleIds);

      if (circlesError) {
        return Response.json(
          { error: "Failed to fetch circles" },
          { status: 500 }
        );
      }

      // Get all members for all circles
      const { data: allMembers, error: membersError } = await supabase
        .from("circle_members")
        .select("circle_id, user_id, member_role")
        .in("circle_id", circleIds);

      if (membersError) {
        return Response.json(
          { error: "Failed to fetch circle members" },
          { status: 500 }
        );
      }

      // Get unique user IDs from members
      const memberUserIds = [
        ...new Set(allMembers?.map((m) => m.user_id) || []),
      ];

      // Get profiles for all members
      const { data: memberProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", memberUserIds);

      if (profilesError) {
        return Response.json(
          { error: "Failed to fetch member profiles" },
          { status: 500 }
        );
      }

      // Create a map of user_id to display_name
      const profileMap = new Map(
        memberProfiles?.map((p) => [p.user_id, p.display_name]) || []
      );

      // Build circles array with members
      const circlesWithMembers = (circles || []).map((circle) => {
        // Determine user's role in this circle
        const membership = circleMemberships?.find(
          (cm) => cm.circle_id === circle.id
        );
        const role = circle.owner_id === user.id ? "owner" : membership?.member_role || "member";

        // Get members for this circle
        const circleMemberData = allMembers?.filter(
          (m) => m.circle_id === circle.id
        ) || [];

        const members = circleMemberData.map((member) => ({
          id: member.user_id,
          displayName:
            profileMap.get(member.user_id) ||
            member.user_id.split("-")[0] ||
            "Unknown",
        }));

        return {
          id: circle.id,
          name: circle.name,
          role,
          members,
        };
      });

      // Determine defaults
      // Active circle: first circle (could be enhanced with user preferences)
      const activeCircleId = circlesWithMembers[0]?.id ?? null;

      // Can create flights: true for now (could be based on permissions)
      const canCreateFlights = true;

      return Response.json({
        user: {
          id: user.id,
          displayName: profile?.display_name || user.email?.split("@")[0] || "User",
        },
        circles: circlesWithMembers,
        defaults: {
          activeCircleId,
          canCreateFlights,
        },
      });
    } catch (error) {
      return Response.json(
        { error: "Failed to bootstrap user data" },
        { status: 500 }
      );
    }
  },
};
