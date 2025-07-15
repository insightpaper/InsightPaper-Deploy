"use client";
import React, { useState } from "react";
import { TextField, Typography, Button } from "@mui/material";
import FiltersButton from "@/shared/components/table/FiltersButton";
import useQueryParams from "@/shared/hooks/useQueryParams";

export default function FilterBrandUser() {
  const { queryParams, deleteAllQueries, addQueries } = useQueryParams([
    "emailFilter",
  ]);

  // State for filter values
  const [emailFilter, setEmailFilter] = useState(queryParams.emailFilter || "");

  const countFilters = Object.values(queryParams).reduce(
    (count, filter) => (filter ? count + 1 : count),
    0
  );

  const handleDeleteAllFilters = () => {
    setEmailFilter("");
    deleteAllQueries();
  };

  const handleSearch = () => {
    addQueries({
      emailFilter: emailFilter,
    });
  };

  return (
    <>
      <FiltersButton
        countFilters={countFilters}
        handleDeleteAllFilters={handleDeleteAllFilters}
        onSubmit={handleSearch}
      >
        {" "}
        <Typography variant="subtitle2">Email:</Typography>
        <TextField
          label="Filter by Email"
          variant="outlined"
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
          className="w-64"
          size="small"
        />
        <Button variant="outlined" color="primary" type="submit">
          Search
        </Button>
      </FiltersButton>{" "}
    </>
  );
}
