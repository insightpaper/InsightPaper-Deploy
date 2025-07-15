import React from "react";
import { Button } from "@mui/material";
import Link from "next/link";

export default function Unauthorized() {
  return (
    <>
      <div className="block animate-pulse absolute top-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] md:w-[800px] md:h-[300px] rounded-full bg-error opacity-30 blur-[75px] sm:blur-[150px]" />
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center px-4">
        <h1 className="text-6xl font-bold z-10">403</h1>
        <p className="text-xl mt-4 z-10">
          No tienes permiso para acceder a esta página!
        </p>
        <div className="mt-6 flex gap-4 z-10">
          <Link href="/">
            <Button variant="contained" color="error">
              Regresar al inicio
            </Button>
          </Link>
        </div>
        <div className="absolute bottom-8 text-sm text-gray-400">
          &copy; {new Date().getFullYear()} All rights reserved.
        </div>
      </div>
    </>
  );
}
