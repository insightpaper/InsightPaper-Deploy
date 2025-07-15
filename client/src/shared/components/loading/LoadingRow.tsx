import { TableCell, TableRow, Skeleton } from "@mui/material";

interface LoadingRowProps {
  cellCount: number;
}

export default function LoadingRow({ cellCount }: LoadingRowProps) {
  return (
    <TableRow>
      {Array.from({ length: cellCount }).map((_, index) => (
        <TableCell key={index}>
          <Skeleton variant="rounded" width="100%" height={25} />
        </TableCell>
      ))}
    </TableRow>
  );
}
