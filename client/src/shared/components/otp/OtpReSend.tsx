"use client";
import { useState, useEffect } from "react";
import { notifyError, notifySuccess } from "@/shared/utils/toastNotify";
import { CircularProgress, Typography } from "@mui/material";

//AXIOS
import axios from "axios";
import axiosInstance from "@/shared/services/axiosService";

export default function OtpReSend({ email }: { email: string }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [dots, setDots] = useState("");
  const COOL_DOWN = 59;

  const startCountDown = () => {
    setTimeLeft(COOL_DOWN);
  };

  const resendOTP = async () => {
    setIsLoading(true);

    try {
      await axiosInstance.post("/api/users/send-otp", { email });

      notifySuccess("OTP resent successfully");
    } catch (error) {
      let errorMessage = "unexpected_error";
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.result;
        const serverError = error.response?.data?.error;

        if (serverError === "jwt malformed") {
          errorMessage = "session_error";
        } else if (serverMessage) {
          errorMessage = serverMessage;
        }
      }
      console.log(errorMessage)
      notifyError("Fallo al enviar el OTP");
    } finally {
      setIsLoading(false);
    }

    startCountDown();
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer); // Cleanup the interval
  }, [timeLeft]);

  useEffect(() => {
    const maxDots = 3;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < maxDots ? prev + "." : ""));
    }, 1000 / 3);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  if (timeLeft > 0)
    return (
      <Typography
        component={"span"}
        variant="caption"
        className="  !text-accent-500 italic"
      >
        Solicitar nuevamente en {timeLeft}
        {dots}
      </Typography>
    );

  return isLoading ? (
    <CircularProgress size={15} color="primary" />
  ) : (
    <Typography
      onClick={resendOTP}
      component={"span"}
      variant="caption"
      className=" underline !text-accent-500 italic cursor-pointer hover:opacity-80 transition-all duration-200"
    >
      Reenviar
    </Typography>
  );
}
