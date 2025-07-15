"use client";
//THIS FUNCTION IS USED FOR AUTHENTICATED USERS
import axios, { AxiosProgressEvent } from "axios";
import axiosInstance from "@/shared/services/axiosService";

type HttpMethod = "get" | "post" | "put" | "delete" | "patch";

interface ApiRequestConfig<T = unknown> {
  method: HttpMethod;
  url: string;
  data?: T;
  params?: Record<string, string | number | boolean | undefined>;
  customHeaders?: Record<string, string>;
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
}

export async function apiRequest<T>({
  method,
  url,
  data,
  params,
  customHeaders,
  onUploadProgress,
}: ApiRequestConfig): Promise<T> {
  try {
    // Get JWT token
    const jwtResponse = await axios.get("/api/cookieAuth");
    const jwt = jwtResponse.data.jwt;

    if (!jwt) {
      throw new Error("JWT token not found in response");
    }

    // Make the request
    const response = await axiosInstance({
      method,
      url,
      data,
      params, // Pass params to the request
      headers: {
        Authorization: `Bearer ${jwt}`,
        ...customHeaders,
      },
      onUploadProgress,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverError =
        error.response?.data?.error || error.response?.data?.result;

      if (serverError) {
        throw new Error(serverError).message;
      }

      throw new Error("unexpected_error").message;
    }

    throw new Error("unexpected_error").message;
  }
}
