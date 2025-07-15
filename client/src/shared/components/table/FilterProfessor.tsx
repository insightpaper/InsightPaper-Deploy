"use client";
import React, { useState } from "react";
import { TextField, Typography, Button } from "@mui/material";
import FiltersButton from "@/shared/components/table/FiltersButton";
import useQueryParams from "@/shared/hooks/useQueryParams";

export default function FilterProfessor() {
  const { queryParams, addQueries, deleteAllQueries } = useQueryParams([
    "email",
  ]);

  // State for filter values
  const [companyFilter, setCompanyFilter] = useState(
    queryParams.email ?? ""
  );

  const countFilters = Object.values(queryParams).reduce(
    (count, filter) => (filter ? count + 1 : count),
    0
  );

  const handleSearch = () => {
    addQueries({ email: companyFilter });
  };

  const handleDeleteAllFilters = () => {
    setCompanyFilter("");
    deleteAllQueries();
  };

  return (
    <FiltersButton
      countFilters={countFilters}
      handleDeleteAllFilters={handleDeleteAllFilters}
      onSubmit={handleSearch}
    >
      {" "}
      <Typography variant="subtitle2">Email:</Typography>
      <TextField
        label="Filtrar por correo"
        variant="outlined"
        value={companyFilter}
        onChange={(e) => setCompanyFilter(e.target.value)}
        className="w-64"
        size="small"
      />
      <Button type="submit" variant="outlined" color="primary">
        Buscar
      </Button>
    </FiltersButton>
  );
}
