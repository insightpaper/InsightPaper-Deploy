import {
  IconButton,
  Drawer as MuiDrawer,
  Typography,
  DrawerProps as MuiDrawerProps,
  Tooltip,
  Button,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

//ICONS
// import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import CloseIcon from "@mui/icons-material/Close";

interface DrawerProps extends MuiDrawerProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title?: string;
  header?: React.ReactNode;
  onClose?: () => void;
  tooltip?: string;
}

export default function DrawerTextButton({
  // icon,
  children,
  isOpen,
  setIsOpen,
  title,
  header,
  onClose,
  tooltip,
  ...drawerProps
}: Readonly<DrawerProps>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };
  return (
    <>
      <Tooltip title={tooltip} disableHoverListener={!tooltip}>
        <Button
        onClick={handleOpen}
        variant="outlined"
        size="small"
        >
          Detalles
        </Button>
      </Tooltip>
      {/* Drawer */}
      <MuiDrawer
        {...drawerProps}
        sx={{
          ...drawerProps.sx,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isMobile ? "100%" : "50%",
            boxSizing: "border-box",
            borderLeft: "1px solid #404040",
          },
        }}
        PaperProps={{
          className: "bg-black! text-white",
        }}
        elevation={4}
        anchor="right"
        open={isOpen}
        onClose={handleClose}
      >
        {header ? (
          <div className="flex items-center justify-between px-4 py-3 border-b border-primary-700">
            {header}
          </div>
        ) : (
          title && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary-700">
              <IconButton onClick={handleClose} className="text-secondary!">
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" className="grow text-center">
                {title}
              </Typography>
            </div>
          )
        )}
        {/* Drawer Content */}
        {children}
      </MuiDrawer>
    </>
  );
}
