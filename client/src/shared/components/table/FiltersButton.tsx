import React, { useState } from "react";
import { IconButton, Popover, Typography, Chip } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

interface FiltersButtonProps {
  children: React.ReactNode;
  countFilters: number;
  handleDeleteAllFilters: () => void;
  onSubmit: () => void;
}

export default function FiltersButton({
  children,
  countFilters,
  handleDeleteAllFilters,
  onSubmit,
}: Readonly<FiltersButtonProps>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="flex flex-col gap-2 z-20">
      <div className=" flex items-center gap-2 z-20">
        <Typography variant="subtitle1">Filtros: </Typography>
        <IconButton
          onClick={handlePopoverOpen}
          className="text-primary-200! hover:text-accent-500! "
        >
          <FilterListIcon />
        </IconButton>
        {Boolean(countFilters) && (
          <Chip label={countFilters} onDelete={handleDeleteAllFilters} />
        )}
      </div>

      {/* Popover for filters */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        className="shadow-lg"
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        {" "}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="p-4 flex flex-col gap-4 bg-primary-800"
        >
          {children}
        </form>
      </Popover>
    </div>
  );
}
