"use client";
import UploadFilesDialog from "@/modules/documents/components/dialogs/UploadFilesDialog";
import { useEffect, useState } from "react";
import {
  IconButton,
  Tooltip,
  TextField,
  Typography,
  Button,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material";
import { GridView, List, FilterList, Sort } from "@mui/icons-material";
import DocumentCard from "@/modules/documents/components/cards/DocumentCard";
import DocumentTable from "@/modules/documents/components/table/DocumentTable";
import Dialog from "@/shared/components/dialogs/Dialog";

//import {DocumentItem} from "@/shared/interfaces/Documents";
import { useDocuments } from "@/modules/documents/context/DocumentsProvider";

export default function PersonalDocumentsPage() {
  const [view, setView] = useState("grid");
  const [sortAsc, setSortAsc] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    documents,
    isDataLoading,
    rowsPerPage,
    setRowsPerPage,
    page,
    setPage,
    totalPages,
    getDocuments
  } = useDocuments();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        await getDocuments();
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocuments();
  }, []);

  const toggleSort = () => setSortAsc(!sortAsc);

  const filteredDocs = documents
    ? documents
        .filter((doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          return sortAsc
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        })
    : [];

  return (
    <main className="flex flex-col w-full min-h-full px-3 lg:px-6 py-12!">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h1" className="!text-3xl">
          Documentos subidos
        </Typography>
        <div className="flex items-center gap-2">
          <Tooltip title="Filtrar">
            <IconButton
              color="primary"
              className="!bg-primary-800 !p-2 !rounded-xl text-white hover:!bg-primary-900 transition-colors"
              onClick={() => setFilterOpen(true)}
            >
              <FilterList />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ordenar por nombre">
            <IconButton
              onClick={toggleSort}
              color="primary"
              className="!bg-primary-800 !p-2 !rounded-xl text-white hover:!bg-primary-900 transition-colors"
            >
              <Sort />
            </IconButton>
          </Tooltip>
          <Tooltip title="Vista de grilla">
            <IconButton
              onClick={() => setView("grid")}
              color="primary"
              className="!bg-primary-800 !p-2 !rounded-xl text-white hover:!bg-primary-900 transition-colors"
            >
              <GridView />
            </IconButton>
          </Tooltip>
          <Tooltip title="Vista en tabla">
            <IconButton
              onClick={() => setView("list")}
              color="primary"
              className="!bg-primary-800 !p-2 !rounded-xl text-white hover:!bg-primary-900 transition-colors"
            >
              <List />
            </IconButton>
          </Tooltip>
          <UploadFilesDialog />
        </div>
      </div>

      {view === "grid" ? (
        <>
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`}
          >
            {filteredDocs.map((doc) => (
              <DocumentCard key={doc.documentId} data={doc} />
            ))}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Typography variant="body2">Filas por página:</Typography>
              <Select
                value={rowsPerPage}
                onChange={(e) =>
                  setRowsPerPage(parseInt(String(e.target.value), 10))
                }
                size="small"
              >
                {[5, 10, 20, 50].map((num) => (
                  <MenuItem key={num} value={num}>
                    {num}
                  </MenuItem>
                ))}
              </Select>
            </div>

            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, page) => setPage(page)}
              showFirstButton
              showLastButton
              color="primary"
            />
          </div>
        </>
      ) : (
        <DocumentTable
          data={documents}
          isLoading={isDataLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          setPage={setPage}
          setRowsPerPage={setRowsPerPage}
          totalPages={totalPages}
        />
      )}

      <Dialog
        open={filterOpen}
        setOpen={setFilterOpen}
        header="Buscar documento"
      >
        <div>
          <TextField
            fullWidth
            label="¿Qué estás buscando?"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            sx={{ mt: 1 }}
          />
          <div className="mt-5 w-full flex justify-end gap-3">
            <Button
              type="button"
              onClick={() => setFilterOpen(false)}
              variant="outlined"
              color="secondary"
            >
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Buscar
            </Button>
          </div>
        </div>
      </Dialog>
    </main>
  );
}
