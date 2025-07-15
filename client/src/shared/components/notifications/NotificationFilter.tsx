import React, { useState } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { FilterList as FilterListIcon } from "@mui/icons-material";

export default function NotificationFilter() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        size="small"
        className="hover:text-accent-500 transition-all duration-200 ease-in-out"
        onClick={handleClick}
      >
        <FilterListIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MenuItem onClick={handleClose}>Projects</MenuItem>
        <MenuItem onClick={handleClose}>Request</MenuItem>
      </Menu>
    </>
  );
}
