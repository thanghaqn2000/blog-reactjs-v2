import { showToast } from "@/config/toast.config";
import { postService } from "@/services/admin/post.service";
import { useState } from "react";

export const useThumbnailUpload = () => {
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [presignKey, setPresignKey] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const processThumbnailFile = async (file: File) => {
    setThumbnailFile(file);
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.onerror = () => {
      showToast.error("Có lỗi khi đọc file ảnh");
      setThumbnailFile(null);
      setThumbnailPreview("");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);

    // Gọi API presignUrl và upload lên S3
    try {
      const response = await postService.presignUrl({
        filename: file.name,
        content_type: file.type,
      });

      const uploadResponse = await fetch(response.url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (uploadResponse.ok) {
        setPresignKey(response.key);
        showToast.success("Upload ảnh thành công!");
      } else {
        setPresignKey("");
        showToast.error("Có lỗi xảy ra khi upload ảnh lên S3");
      }
    } catch (error) {
      setPresignKey("");
      showToast.error("Có lỗi xảy ra khi tạo URL upload ảnh");
    } finally {
      setIsUploading(false);
    }
  };

  const handleThumbnailChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await processThumbnailFile(file);
    }
  };

  const handleThumbnailPaste = async (
    event: React.ClipboardEvent<HTMLDivElement>
  ) => {
    if (isUploading) return;
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          await processThumbnailFile(file);
        }
        break;
      }
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview("");
    setPresignKey("");
    setIsUploading(false);
    const fileInput = document.getElementById("thumbnail") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return {
    thumbnailPreview,
    thumbnailFile,
    presignKey,
    isUploading,
    handleThumbnailChange,
    handleThumbnailPaste,
    handleRemoveThumbnail,
    setThumbnailPreview,
  };
};

