interface IntRequestTable {
  [key: string]: string;
}

const Columns : IntRequestTable = {
    "applicationDate": "Fecha",
    "email": "Email",
    "name": "Nombre",
    "modifiedDate": "Fecha de Modificación",
    "status": "Estado",
    "createdDate": "Fecha de Creación",
    "actions": "Acciones"
};

export function getTableColumnName(nameColumn: string): string {
  return Columns[nameColumn] || "_";
}
