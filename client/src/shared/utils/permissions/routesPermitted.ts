// DESC: Constants for routes permitted by roles

import { Role } from "@/shared/interfaces/UserData";
interface RoutesByRolesPermitted {
  [url: string]: Role["name"][];
}

const rolesPermitted: RoutesByRolesPermitted = {
  "/": ["Admin", "Professor", "Student"],
  "/courses": ["Admin", "Professor", "Student"],
  "/documents": ["Admin", "Professor", "Student"],
  "/documents/student": ["Student"],
  "/dashboard": [],
  "/projects": [],
  "/projects/create-project": [],
  "/requests/creator": [],
  "/requests/brand": [],
  "/users": ["Admin"],
  "/users/create-user/brand": [],
  "/users/create-user/creator": [],
  "/change-default-password": [],
};

// Ensure "Admin" is included in all routes at the start
Object.keys(rolesPermitted).forEach((route) => {
  if (!rolesPermitted[route].includes("Admin") && route !== "/documents/student" && route !== "/courses") {
    rolesPermitted[route].unshift("Admin"); // Add "Admin" at the beginning
  }
});

export const routesByRolesPermitted: RoutesByRolesPermitted = rolesPermitted;

export function isRolePermited(url: string, roles: Role["name"][]) {
  const regex = /^(.*?)(?:\/[^/]+)?\/?$/; // Removes last segment + trailing slash
  const urlBase = url.match(regex)![1];
  const routeDynamic = routesByRolesPermitted[urlBase];
  return (routeDynamic ?? routesByRolesPermitted[url])?.some((role) =>
    roles.includes(role)
  );
}

export function isRouteExist(url: string) {
  return url in routesByRolesPermitted;
}
