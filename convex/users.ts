import { query, type MutationCtx } from "./_generated/server";
import { components } from "./_generated/api";
import { getViewer } from "./lib";
import { ACCESS_ROLE_META, can, type Permission } from "./permissions";

const ALL_PERMISSIONS: Permission[] = [
  "finance.view",
  "pipeline.view",
  "people.manage",
  "people.setAccess",
  "hr.manage",
  "announcements.send",
  "projects.manageAll",
  "reports.view",
];

/** The signed-in person, with what they're allowed to do. Null when signed out or unlinked. */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return null;
    const department = viewer.departmentId ? await ctx.db.get(viewer.departmentId) : null;
    const lineManager = viewer.lineManagerId ? await ctx.db.get(viewer.lineManagerId) : null;
    return {
      employeeId: viewer._id,
      name: viewer.name,
      email: viewer.email,
      jobTitle: viewer.jobTitle,
      department: department?.name ?? null,
      lineManager: lineManager ? { id: lineManager._id, name: lineManager.name } : null,
      accessRole: viewer.accessRole,
      accessLabel: ACCESS_ROLE_META[viewer.accessRole].label,
      permissions: ALL_PERMISSIONS.filter((p) => can(viewer.accessRole, p)),
    };
  },
});

type AuthUser = { _id: string; email: string };

async function findAuthUserByEmail(ctx: MutationCtx, email: string) {
  return (await ctx.runQuery(components.betterAuth.adapter.findOne, {
    model: "user",
    where: [{ field: "email", value: email }],
  })) as AuthUser | null;
}

/**
 * Makes sure a Better Auth user exists for `email` with an email/password account whose
 * password hash is `passwordHash`. Returns the auth user id.
 */
export async function upsertCredentialUser(
  ctx: MutationCtx,
  args: { email: string; name: string; passwordHash: string },
) {
  const email = args.email.trim().toLowerCase();
  const now = Date.now();

  let user = await findAuthUserByEmail(ctx, email);
  if (!user) {
    user = (await ctx.runMutation(components.betterAuth.adapter.create, {
      input: {
        model: "user",
        data: { name: args.name, email, emailVerified: true, createdAt: now, updatedAt: now },
      },
    })) as AuthUser;
  }

  const credentialWhere = [
    { field: "userId" as const, value: user._id },
    { field: "providerId" as const, value: "credential" },
  ];
  const account = await ctx.runQuery(components.betterAuth.adapter.findOne, {
    model: "account",
    where: credentialWhere,
  });
  if (account) {
    await ctx.runMutation(components.betterAuth.adapter.updateOne, {
      input: { model: "account", where: credentialWhere, update: { password: args.passwordHash, updatedAt: now } },
    });
  } else {
    await ctx.runMutation(components.betterAuth.adapter.create, {
      input: {
        model: "account",
        data: {
          accountId: user._id,
          providerId: "credential",
          userId: user._id,
          password: args.passwordHash,
          createdAt: now,
          updatedAt: now,
        },
      },
    });
  }
  return user._id;
}

/** Signs a user out everywhere by deleting their sessions. */
export async function revokeSessions(ctx: MutationCtx, userId: string) {
  await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
    input: { model: "session", where: [{ field: "userId", value: userId }] },
    paginationOpts: { cursor: null, numItems: 1000 },
  });
}
