import {
  IconButton,
  Dialog as MuiDialog,
  DialogContent,
  DialogTitle,
  DialogProps as MuiDialogProps,
} from "@mui/material";

//ICONS
import CloseIcon from "@mui/icons-material/Close";

interface DialogProps extends MuiDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  header?: string | React.ReactNode;
  children: React.ReactNode;
}

export default function Dialog({
  open,
  setOpen,
  header,
  children,
  ...MuiDialogProps
}: DialogProps) {
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <MuiDialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        className: `!bg-primary-950 !shadow-2xl !p-0  border border-primary-800 w-full !m-3`,
        elevation: 0,
      }}
      {...MuiDialogProps}
    >
      {/* BLUR */}
      <div
        className={`absolute -top-0 translate-x-1/2 w-[100px] h-[150px] rounded-full  bg-primary-500 blur-[80px]`}
      />
      <DialogTitle className="!border-b border-primary-800">
        <div
          className={`flex flex-grow items-center w-full ${header ? "justify-between" : "justify-end"} relative`}
        >
          {header ?? " "}
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon />
          </IconButton>{" "}
        </div>
      </DialogTitle>
      <DialogContent className="z-10 !p-2 lg:!p-4">{children}</DialogContent>
    </MuiDialog>
  );
}
