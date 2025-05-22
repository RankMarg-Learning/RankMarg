import { Role } from "@prisma/client";

export type Method = "GET" | "POST" | "PUT" | "DELETE" | "ALL";

type RouteAccess = {
  methods: Method[];
  role?: Role[] 
};

export const protectedApiRoutes: Record<string, RouteAccess[]> = {
  "/api/users": [
    { methods: ["GET"], role: [Role.ADMIN] },
  ],
  "/api/attempts": [
    { methods: ["POST"], role: [Role.USER, Role.ADMIN, Role.INSTRUCTOR] },
  ],
  "/api/question/:slug": [
    { methods: ["POST", "PUT", "DELETE"], role: [Role.ADMIN, Role.INSTRUCTOR] },
    { methods: ["GET"], role: [Role.USER, Role.ADMIN, Role.INSTRUCTOR] },
  ],
  
  "/api/question": [
    { methods: ["POST", "PUT", "DELETE"], role: [Role.ADMIN, Role.INSTRUCTOR] },
    { methods: ["GET"], role: [Role.USER, Role.ADMIN, Role.INSTRUCTOR] },
  ],
  "/api/test/:testId/details": [
    { methods: ["GET"], role: [Role.USER,Role.ADMIN,Role.INSTRUCTOR] },
  ],
  "/api/test/:testId": [
    { methods: ["GET"], role: [ Role.USER, Role.ADMIN, Role.INSTRUCTOR] },
    { methods: ["POST", "PUT", "DELETE"], role: [Role.ADMIN,Role.INSTRUCTOR] },
  ],
  "/api/test": [
    { methods: ["POST","PUT","DELETE"], role: [ Role.ADMIN] },
    {methods: ["GET"], role: [Role.USER, Role.ADMIN, Role.INSTRUCTOR]},
  ],
  "/api/admin": [
    { methods: ["ALL"], role: [Role.ADMIN] },
  ],
};

export const protectedPages: {
  path: string;
  roles: Role[];
}[] = [
  { path: "/onboarding", roles: [Role.USER, Role.ADMIN, Role.INSTRUCTOR] },
  { path: "/dashboard", roles: [Role.USER, Role.ADMIN, Role.INSTRUCTOR] },
  { path: "/ai-practice", roles: [Role.USER, Role.ADMIN, Role.INSTRUCTOR] },
  { path: "/tests", roles: [Role.USER, Role.ADMIN, Role.INSTRUCTOR] },
  { path: "/mastery", roles: [Role.USER, Role.ADMIN, Role.INSTRUCTOR] },
  { path: "/mistakes-tracker", roles: [Role.USER, Role.ADMIN, Role.INSTRUCTOR] },
  { path: "/analytics", roles: [Role.USER,Role.ADMIN,Role.INSTRUCTOR] },
  { path: "/leaderboard", roles: [Role.USER,Role.ADMIN,Role.INSTRUCTOR] },
  { path: "/admin", roles: [Role.ADMIN,Role.INSTRUCTOR] },
  { path:"/questions",roles:[Role.ADMIN]},
  { path:"/u/:username",roles:[Role.USER,Role.ADMIN]},
  { path:"/questionset",roles:[Role.ADMIN]},
];