"use client";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export default function LoadingBarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProgressBar
        color={"#7244eb"}
        height="4px"
        options={{ showSpinner: false }}
        shallowRouting
      />
      {children}
    </>
  );
}
