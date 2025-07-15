"use client";
import { createContext, useContext } from "react";

//CONTEXT
import { useSystemLayout } from "./SystemLayoutProvider";

interface Actions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

type Modules = Record<
  "project",
  //Add more modules here
  Actions
>;

interface PermissionsContextType {
  hasPermissionTo: (id?: string) => Modules;
}
// List of actions [CRUD]
const actionList = ["create", "read", "update", "delete"] as const;

// DESC: Returns an object with the actions as keys and the values as the permission boolean
// [ true, true, true, false ] => { create: true, read: true, update: true, delete: false }
function actions(permBool?: boolean | boolean[]): Actions {
  return actionList.reduce((acc, action, index) => {
    acc[action] = Array.isArray(permBool)
      ? (permBool[index] ?? false)
      : (permBool ?? false);
    return acc;
  }, {} as Actions);
}

export const PermissionsContext = createContext<PermissionsContextType | null>(
  null
);

export const usePermissions = (id?: string): Modules => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context.hasPermissionTo(id);
};

function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const { currentUserData, isUserIs } = useSystemLayout();
  const userId = currentUserData?.userId;
  const isOwner = (id?: string) => userId === id;

  // THIS IS WHERE YOU DEFINE PERMISSIONS
  function hasPermissionTo(id?: string): Modules {
    switch (true) {
      case isUserIs.Admin:
        return {
          project: actions(true),
        };
      case isUserIs.Professor:
        return {
          project: actions([true, true, isOwner(id), false]),
        };
      case isUserIs.Student:
        return {
          project: actions([false, true, false, false]),
        };
      default:
        return {
          project: actions(false),
        };
    }
  }
  return (
    <PermissionsContext.Provider value={{ hasPermissionTo }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export default PermissionsProvider;
