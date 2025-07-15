import ConfirmationDialog from "@/shared/components/dialogs/ConfirmationDialog";
import { useSystemLayout } from "@/shared/context/SystemLayoutProvider";
import {
  Card,
  CardActions,
  CardContent,
  Typography,
  Button,
  Link,
} from "@mui/material";
import { useDocuments } from "../../context/DocumentsProvider";
import DrawerDocument from "../drawer/DrawerDocument";

export default function DocumentCard({
  data,
  isStudentRoute = false,
}: {
  data: {
    documentId: string;
    title: string;
    description: string;
    size: string;
    url?: string;
    createdAt?: string;
  };
  isStudentRoute?: boolean;
}) {

  const { currentUserData } = useSystemLayout();
  const role = currentUserData?.roles?.[0].name;
  const isProfessor = role === "Professor" || role === "Admin";
  const { deleteDocument } = useDocuments();
  const handleDelete = () => {
    deleteDocument(data.documentId);
  }

  return (
    <Card className="w-full">
      {/** 
      <CardMedia
        image="https://imgv2-1-f.scribdassets.com/img/document/9856375/original/89803c5cc0/1?v=1"
        className="aspect-video"
      />
      */}
      <CardContent>
        <Link href={`/documents/${data.documentId}`} underline="none">
          <Typography
            variant="h5"
            className="!text-lg whitespace-nowrap text-ellipsis overflow-hidden"
          >
            {data.title}
          </Typography>
        </Link>
        <Typography
          variant="body2"
          className="!mt-2 line-clamp-1 !text-gray-400"
        >
          {data.description}
        </Typography>
      </CardContent>
      {(isProfessor || isStudentRoute) && (
        <CardActions className="flex justify-end mb-2 mr-2">
          <DrawerDocument
            documentId={data.documentId}
            readOnly={false}
            isTextButton={true}
          />
          <ConfirmationDialog
            cancelText="No"
            confirmText="Sí"
            content="¿Estás seguro de que quieres eliminar este documento?"
            title="Eliminar documento"
            isPositiveAction={false}
            onCancel={() => { }}
            onConfirm={handleDelete}
          >
            <Button variant="outlined" color="error" size="small">
              Eliminar
            </Button>
          </ConfirmationDialog>
        </CardActions>
      )}
    </Card>
  );
}
