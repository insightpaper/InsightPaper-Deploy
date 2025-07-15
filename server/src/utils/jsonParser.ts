import { IRecordSet } from "mssql";

export function recordSetToJsonString(recordset: IRecordSet<any>[]): string {
  const row = recordset[0][0];
  const jsonColumn = Object.keys(row)[0];
  const jsonString = row[jsonColumn];
  return jsonString;
}
