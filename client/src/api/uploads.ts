import { api } from "./client";
import type { Attachment, UploadResponse } from "../types/api";

export async function uploadFiles(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const { data } = await api.post<UploadResponse>("/uploads", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data.files as Attachment[];
}
