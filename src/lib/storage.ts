import { supabase } from "@/integrations/supabase/client";

/**
 * Uploads a file to Supabase Storage using XMLHttpRequest to track upload progress.
 * @param bucket Name of the storage bucket
 * @param path Path to save the file
 * @param file The File object to upload
 * @param onProgress Callback function that receives the progress percentage (0-100)
 */
export const uploadFileWithProgress = async (
  bucket: string,
  path: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    // We get the session to pass the Bearer token (if user is authenticated)
    // For this app, it might be using public/anon access, so we fallback to the anon key.
    supabase.auth.getSession().then(({ data: { session } }) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(xhr.responseText));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error occurred during upload"));
      };

      const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;
      xhr.open("POST", url, true);

      // Set headers required by Supabase Storage REST API
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.setRequestHeader("apikey", import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      // We explicitly don't set Content-Type so it infers correctly, or we set it to the file type
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.setRequestHeader("x-upsert", "true");

      xhr.send(file);
    });
  });
};
