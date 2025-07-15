export default function formatFileSize(fileSizeInBytes: number): string {
  if (fileSizeInBytes < 1024) {
    return fileSizeInBytes + " B"; // Bytes
  } else if (fileSizeInBytes < 1024 * 1024) {
    return (fileSizeInBytes / 1024).toFixed(2) + " KB"; // Kilobytes
  } else if (fileSizeInBytes < 1024 * 1024 * 1024) {
    return (fileSizeInBytes / (1024 * 1024)).toFixed(2) + " MB"; // Megabytes
  } else {
    return (fileSizeInBytes / (1024 * 1024 * 1024)).toFixed(2) + " GB"; // Gigabytes
  }
}
