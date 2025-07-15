import React, { ElementType, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogProps,
} from "@mui/material";
interface ConfirmationDialogProps<T extends ElementType = "span">
  extends Pick<DialogProps, "sx"> {
  title: string;
  content: string;
  confirmText: string;
  cancelText: string;
  isPositiveAction?: boolean; // true for positive (e.g., save), false for negative (e.g., delete)
  disabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
  isOpen?: boolean | null; // THIS IS TO MAKE THIS COMPONENT TRIGGERABLE,
  as?: T;
  className?: string;
}

const ConfirmationDialog = <T extends ElementType = "span">({
  title,
  content,
  confirmText,
  cancelText,
  isPositiveAction = true,
  disabled = false,
  onConfirm,
  onCancel,
  children,
  isOpen = null,
  as, // Default to <span> if no as prop is provided
  className,
  sx,
}: ConfirmationDialogProps<T>) => {
  const Component = as ?? "span";
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isOpen !== null) return;

    e.stopPropagation();
    setOpen(true);
  };

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    e.stopPropagation();
    onCancel();
    if (isOpen !== null) return;
    setOpen(false);
  };

  const handleConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onConfirm();
    if (isOpen !== null) return;
    setOpen(false);
  };

  useEffect(() => {
    if (isOpen === null) return;

    setOpen(isOpen);
  }, [isOpen]);

  return (
    <>
      <Component className={className} onClick={handleClickOpen}>
        {children}
      </Component>

      <Dialog
        sx={{ ...sx }}
        open={open}
        onClose={handleClose}
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
        maxWidth="sm"
        PaperProps={{
          className: `!bg-primary-950 !shadow-2xl  border border-primary-800 `,
          elevation: 0,
        }}
      >
        <div
          className={`absolute -top-0 w-[100px] h-[50px] rounded-full  ${isPositiveAction ? "!bg-accent-500" : "!bg-red-800 "}  blur-3xl`}
        />
        <DialogTitle
          id="confirmation-dialog-title"
          className={` ${isPositiveAction ? "!text-accent-500" : "!text-red-500"}`}
        >
          {title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="confirmation-dialog-description"
            sx={{
              textAlign: "center",
              fontSize: "16px",
              color: "#ffffff",
            }}
          >
            {content}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", paddingBottom: "16px" }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color={isPositiveAction ? "primary" : "error"}
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={isPositiveAction ? "primary" : "error"}
          >
            {confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConfirmationDialog;
