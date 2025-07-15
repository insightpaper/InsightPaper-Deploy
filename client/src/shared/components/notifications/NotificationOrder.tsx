import React, { useState } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import ImportExportIcon from "@mui/icons-material/ImportExport";

export default function NotificationOrder() {
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
        <ImportExportIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MenuItem onClick={handleClose}>Oldest</MenuItem>
        <MenuItem onClick={handleClose}>Recent</MenuItem>
      </Menu>
    </>
  );
}
