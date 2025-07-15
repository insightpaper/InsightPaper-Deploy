const LOCALE = "es-CR";

// Función para formatear la fecha a un formato más legible y compacto
const formatDatetime = (
  isoDate: string,
  showSeconds = false,
  hour12 = true
): string => {
  const date = new Date(isoDate);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: showSeconds ? "2-digit" : undefined,
    hour12: hour12,
  };

  return date.toLocaleString(LOCALE, options);
};

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
  };

  return date.toLocaleString(LOCALE, options);
};

const formatSimpleDate = (isoDate: string): string => {
  const date = new Date(isoDate);

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  return date.toLocaleString(LOCALE, options);
};

const dateToIsoString = (date: string): string => {
  // ISO LOCAL DATE to ISO UTC
  if (!date) return "";
  const dateObj = new Date(date);

  return dateObj.toISOString();
};

const dateFromIsoString = (isoDate: string): string => {
  if (!isoDate) return "";
  // ISO format to "MM-DD-YYYY"
  const date = new Date(isoDate);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  return date.toLocaleString(LOCALE, options).split("T")[0].replace(/\//g, "-");
};

const inputDateToLocal = (date: string): string => {
  // ISO LOCAL DATE to ISO UTC and add 6 hours
  if (!date) return "";
  //This get the iso UTC MM-DD-YYYYT00:00:00.000Z
  //Then add 6 hours then return yyyy-MM-dd
  const dateObj = new Date(date);
  dateObj.setHours(dateObj.getHours() + 6);

  return dateObj
    .toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-");
};

const isoStringToDateWithTime = (
  isoDate: string
): { date: string; time: string } => {
  const date = new Date(isoDate);

  // Extract the date in yyyy-MM-dd format this is en-CA LOCALE
  const formattedDate = date
    .toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-"); // Replace "/" with "-"

  // Extract the time in HH:MM format (24-hour)
  const formattedTime = date.toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Ensures 24-hour format
  });

  return { date: formattedDate, time: formattedTime };
};

const timeAgo = (isoDate: string): string => {
  const now = new Date().getTime(); // Convert to timestamp
  const past = new Date(isoDate).getTime(); // Convert to timestamp (UTC)
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60)
    return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60)
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7)
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;

  // If more than 7 days, format the date as "Feb 4, 2024"
  return new Date(isoDate).toLocaleDateString(LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export {
  formatDatetime,
  formatDate,
  dateToIsoString,
  dateFromIsoString,
  timeAgo,
  formatSimpleDate,
  isoStringToDateWithTime,
  inputDateToLocal,
};
