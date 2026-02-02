import type { BunRequest } from "bun";
import { HTTPMethods } from "../../HTTPMethods";
import {
  addCircleMember,
  createCircle,
  listCircleMembers,
  listCircles,
} from "./circles.service";

export const circlesRoutes = {
  // POST /v1/circles → create circle + add owner member
  "/v1/circles": async (req: Request) => {
    if (req.method === HTTPMethods.POST) {
      const data = await req.json().catch(() => ({}));
      const result = await createCircle(data as Record<string, unknown>);

      const [created, error] = result;
      if (error) {
        return Response.json(
          { error: error.message },
          { status: error.status }
        );
      }

      return Response.json(
        {
          message: "Circle created and owner member added",
          data: created,
        },
        { status: 201 }
      );
    }
    return new Response("Method not allowed", { status: 405 });
  },
  // GET /v1/circles/me → list circles I'm in
  "/v1/circles/me": async (req: Request) => {
    if (req.method === HTTPMethods.GET) {
      const result = await listCircles();

      const [circles, error] = result;
      if (error) {
        return Response.json(
          { error: error.message },
          { status: error.status }
        );
      }

      return Response.json({
        circles,
      });
    }
    return new Response("Method not allowed", { status: 405 });
  },
  // POST /v1/circles/:circleId/members → add member by userId
  // GET /v1/circles/:circleId/members
  "/v1/circles/:circleId/members": async (
    req: BunRequest<"/v1/circles/:circleId/members">
  ) => {
    const { circleId } = req.params;

    if (req.method === HTTPMethods.POST) {
      const data = await req.json().catch(() => ({}));
      const result = await addCircleMember(
        circleId,
        data as Record<string, unknown>
      );

      const [member, error] = result;
      if (error) {
        return Response.json(
          { error: error.message },
          { status: error.status }
        );
      }

      return Response.json(
        {
          message: `Member added to circle ${circleId}`,
          circleId,
          data: member,
        },
        { status: 201 }
      );
    }
    if (req.method === HTTPMethods.GET) {
      const result = await listCircleMembers(circleId);

      const [members, error] = result;
      if (error) {
        return Response.json(
          { error: error.message },
          { status: error.status }
        );
      }

      return Response.json({
        circleId,
        members,
      });
    }
    return new Response("Method not allowed", { status: 405 });
  },
};
