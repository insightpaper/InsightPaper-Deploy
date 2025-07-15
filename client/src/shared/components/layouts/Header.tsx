"use client";
import Image from "next/image";
import { AppBar, Toolbar, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import LogoImage from "../../../../public/Logo.png";

import MenuIcon from "@mui/icons-material/Menu";

export default function Header({
  handleOpenSideBar,
}: {
  handleOpenSideBar: () => void;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  return (
    <AppBar
      position="static"
      className={`!bg-black  block ${!isMobile && "!hidden"} `}
      sx={{
        borderBottom: "1px solid #262626", // Change color as needed
        boxShadow: "none", // Optional: Removes default shadow
      }}
      elevation={0}
    >
      {" "}
      <Toolbar className="justify-between overflow-clip">
        <div className="absolute left-0 w-1/3 h-[50px] rounded-r-full  bg-accent-700 blur-[80px]  " />
        <Image
          src={LogoImage}
          alt="insight logo"
          width={150}
          height={80}
          className=" z-10"
        />
        <IconButton onClick={handleOpenSideBar} color="inherit">
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
