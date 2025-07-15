"use client";
import {
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next-nprogress-bar";

import { notifyError } from "../utils/toastNotify";

//UTILS
import { jwtDecode } from "jwt-decode";

//AXIOS
import axios from "axios";

//INTERFACE
import { UserData, Role } from "@/shared/interfaces/UserData";
import { apiRequest } from "../utils/request/apiRequest";

interface SystemLayoutContextInterface {
  currentUserData: UserData | null;
  setCurrentUserData: Dispatch<SetStateAction<UserData | null>>;
  isUserDataLoading: boolean;
  isUserIs: Record<Role["name"], boolean>;
  deleteUser: () => Promise<void>;
}

export const SystemLayoutContext =
  createContext<SystemLayoutContextInterface | null>(null);

export const useSystemLayout = () => {
  const context = useContext(SystemLayoutContext);
  if (!context) {
    throw new Error(
      "useSystemLayout must be used within a SystemLayoutProvider"
    );
  }
  return context;
};

function SystemLayoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);
  const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);
  // Define default roles
  const defaultRoles: Record<Role["name"], false> = {
    Admin: false,
    Student: false,
    Professor: false,
  };
  // this is get the role
  const isUserIs: Record<Role["name"], boolean> =
    currentUserData?.roles?.reduce<Record<Role["name"], boolean>>(
      (acc, role) => {
        acc[role.name] = true;
        return acc;
      },
      { ...defaultRoles }
    ) || { ...defaultRoles };

  const getUser = useCallback(async () => {
    setIsUserDataLoading(true);
    try {
      const res = await axios.get("/api/cookieAuth");
      const decodedJwt = jwtDecode(res.data?.jwt || "") as UserData;

      setCurrentUserData(decodedJwt);
    } catch {
      notifyError("You are not authenticated");
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } finally {
      setIsUserDataLoading(false);
    }
  }, [router]);

  const deleteUser = async () => {
    setIsUserDataLoading(true);
    try {
      await apiRequest<{
        result: {
          affectedEntityId: string;
        };
      }>({
        method: "delete",
        url: '/api/users/account/current',
      });
      setCurrentUserData(null);
      setTimeout(() => {
        router.push("/login");
      }, 1000);
      router.push("/login");
    } catch (error) {
      console.log(error);
      notifyError("Error deleting user data");
    } finally {
      setIsUserDataLoading(false);
    }
  }

  useEffect(() => {
    if (!currentUserData) {
      getUser();
    }
  }, [currentUserData, getUser]);
  return (
    <SystemLayoutContext.Provider
      value={{
        currentUserData,
        setCurrentUserData,
        isUserIs,
        isUserDataLoading,
        deleteUser
      }}
    >
      {children}
    </SystemLayoutContext.Provider>
  );
}

export default SystemLayoutProvider;
