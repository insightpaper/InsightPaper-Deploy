"use client";
import React, { useState } from "react";
import { TextField, Typography, Button } from "@mui/material";
import FiltersButton from "@/shared/components/table/FiltersButton";
import useQueryParams from "@/shared/hooks/useQueryParams";

export default function FilterStudent() {
  const { queryParams, deleteAllQueries, addQueries } = useQueryParams([
    "email",
  ]);

  // State for filter values
  const [emailFilter, setEmailFilter] = useState(queryParams.email || "");

  const countFilters = Object.values(queryParams).reduce(
    (count, filter) => (filter ? count + 1 : count),
    0
  );

  const handleSearch = () => {
    addQueries({ email: emailFilter });
  };

  const handleDeleteAllFilters = () => {
    setEmailFilter("");
    deleteAllQueries();
  };

  return (
    <>
      <FiltersButton
        countFilters={countFilters}
        handleDeleteAllFilters={handleDeleteAllFilters}
        onSubmit={handleSearch}
      >
        {" "}
        <Typography variant="subtitle2">Correo:</Typography>
        <TextField
          label="Filtrar por correo"
          variant="outlined"
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
          className="w-64"
          size="small"
        />
        <Button variant="outlined" color="primary" type="submit">
          Buscar
        </Button>
      </FiltersButton>{" "}
    </>
  );
}
