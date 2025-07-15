import { NextResponse, NextRequest } from "next/server";
import axiosInstance from "./shared/services/axiosService";

//UTILS
import { jwtDecode } from "jwt-decode";
//INTERFACE
import { UserData } from "./shared/interfaces/UserData";
//UITILS
// import {
//   isRolePermited,
//   isRouteExist,
// } from "./shared/utils/permissions/routesPermitted";

import envConfig from "./config/env";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth")?.value;
  const pathname = req.nextUrl.pathname;
  const searchParams = req.nextUrl.searchParams;

  // Allow the user to access the reset password page without a token
  if (pathname === "/reset-password" && searchParams.get("token")) {
    return NextResponse.next();
  }

  let response: NextResponse<unknown>;

  const loginUrl = new URL("/login", req.url);

  try {
    // // Create a NextResponse
    response = NextResponse.next();
    const res = await axiosInstance.post(
      `${envConfig.apiBaseUrl}/api/users/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: req.cookies.toString(),
        },
        withCredentials: true,
      }
    );

    const setCookieHeader = res.headers["set-cookie"];

    if (setCookieHeader) {
      // Ensure setCookieHeader is an array
      const cookiesArray = Array.isArray(setCookieHeader)
        ? setCookieHeader
        : [setCookieHeader];

      // Parse the Set-Cookie header(s)
      cookiesArray.forEach((cookieString) => {
        const [cookiePart] = cookieString.split(";"); // Get the part before ';'
        const [key, value] = cookiePart.split("=");

        // Set the cookie in the response
        response.cookies.set(key, value);
      });
    }

    const authToken = response.cookies.get("auth")?.value;
    if (authToken) {
      const decodedJwt: UserData = jwtDecode(authToken);

      // CHECK IF THE USER HAS CHANGED THE DEFAULT PASSWORD and redirect accordingly
      const isPasswordChanged = decodedJwt?.passwordChanged;
      const isChangePasswordPage = pathname === "/change-default-password";

      if (!isPasswordChanged && !isChangePasswordPage) {
        // Redirect to the change password page if the user has not changed the default password
        return NextResponse.redirect(
          new URL("/change-default-password", req.url)
        );
      }

      if (isPasswordChanged && isChangePasswordPage) {
        // Redirect to the dashboard if the user has changed the default password
        return NextResponse.redirect(new URL("/", req.url));
      }

      // // Check if the user has the required role to access the route
      // const currentRoles = decodedJwt?.roles?.map((role) => role.name) || [];

      // if (isRouteExist(pathname) && !isRolePermited(pathname, currentRoles)) {
      //   return NextResponse.redirect(new URL("/unauthorized", req.url));
      // }

    } else {
      // Redirect to the login page if the user is not authenticated
      return NextResponse.redirect(loginUrl);
    }

    return response;
  } catch {
    // Redirect to the login page if the token is invalid
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    // Exclude _next/static,_next/image, favicon.ico, /login, /forgot-password,unauthorized  and everything under /api/*
    "/((?!_next/static|_next/image|favicon.ico|login|create-account|forgot-password|api/|Logo.png|unauthorized).*)",
  ],
};
