"use client";
import { useState } from "react";
import Link from "next/link";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
} from "@mui/material";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import LoadingListItem from "../loading/LoadingListItem";
import { usePathname } from "next/navigation";

//UTILS
import { routesByRolesPermitted } from "@/shared/utils/permissions/routesPermitted";

//CONTEXT
import { useSystemLayout } from "@/shared/context/SystemLayoutProvider";

export interface Route {
  label: string;
  icon: React.ElementType;
  href?: string;
  dropdown?: boolean;
  children?: Route[];
  isChildren?: boolean;
  isDropdown?: boolean;
}

interface ListItemSidebarProps extends Route {
  defaultOpen?: boolean;
}

export default function ListItemSidebar({
  label,
  href,
  icon: Icon,
  children,
  defaultOpen = true,
  isDropdown = false,
  isChildren = false,
}: ListItemSidebarProps) {
  const { currentUserData, isUserDataLoading, isUserIs } = useSystemLayout();
  const rolesPermitted = routesByRolesPermitted[href || ""];
  const isPermited = rolesPermitted?.some((role) => isUserIs?.[role]);

  const [open, setOpen] = useState(defaultOpen);
  const pathname = usePathname();

  const handleClick = () => {
    setOpen(!open);
  };
  if (isUserDataLoading || !currentUserData)
    return <LoadingListItem numChildren={children?.length} />;

  if (!isDropdown && isPermited) {
    return (
      <ListItem
        component={Link}
        href={href || ""}
        className={`${pathname === href && `!bg-gradient-to-r from-accent-900  to-accent-800 !text-accent-300 ${isChildren && "!border-accent-300 "} `} 
        ${isChildren && "border-l !rounded-l-none"} group !px-3 !p-1 relative text-white hover:!text-accent-300 hover:opacity-80 transition-all duration-200 ease-in-out`}
        sx={{ borderRadius: 1 }}
      >
        {Icon && (
          <ListItemIcon sx={{ color: "inherit", minWidth: 30 }}>
            <Icon fontSize="small" className="!text-base" />
          </ListItemIcon>
        )}
        <ListItemText
          primary={
            <Typography
              variant="body2"
              className="text-nowrap !text-xs group-hover:!text-accent-300 transition-all duration-200 ease-in-out"
            >
              {label}
            </Typography>
          }
        />
      </ListItem>
    );
  }

  const hasAnyChildrenPermited = children?.some((child) =>
    routesByRolesPermitted[child.href || ""]?.some((role) => isUserIs?.[role])
  );

  if (isPermited || hasAnyChildrenPermited) {
    return (
      <div>
        <ListItem
          onClick={handleClick}
          className={`group !px-3 !p-1 relative text-white hover:!text-accent-300 hover:opacity-80 transition-all duration-200 ease-in-out  cursor-pointer`}
          sx={{ borderRadius: 1 }}
        >
          {Icon && (
            <ListItemIcon sx={{ color: "inherit", minWidth: 30 }}>
              <Icon fontSize="small" className="!text-base" />
            </ListItemIcon>
          )}
          <ListItemText
            primary={
              <Typography
                variant="body2"
                className=" !text-xs text-nowrap group-hover:!text-accent-300 transition-all duration-200 ease-in-out"
              >
                {label}
              </Typography>
            }
          />
          <ArrowLeftIcon
            className={`${open && "-rotate-90 !transition-all duration-200 ease-in-out"} !text-base`}
            fontSize="small"
          />
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding className="!ml-5 ">
            {children &&
              children.map((child, i) => {
                const rolesPermitted = routesByRolesPermitted[child.href || ""];
                const isPermited = rolesPermitted?.some(
                  (role) => isUserIs?.[role]
                );
                if (!isPermited) return null;
                return (
                  <ListItemSidebar
                    key={i}
                    {...child}
                    isChildren={Boolean(child)}
                  />
                );
              })}
          </List>
        </Collapse>
      </div>
    );
  }
}
