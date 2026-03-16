import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showToast } from "@/config/toast.config";
import MainLayout from "@/layouts/MainLayout";
import { cn } from "@/lib/utils";
import { feedbackServiceV1 } from "@/services/v1/feedback.service";
import axios from "axios";
import { Send, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";

const MAX_FILE_SIZE_MB = 5;
const ACCEPT_IMAGE = "image/png,image/jpeg,image/jpg";

const Feedback = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [phone, setPhone] = useState("");
  const [pageIssue, setPageIssue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsUploading(true);
    try {
      const preview = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("FileReader error"));
        reader.readAsDataURL(selectedFile);
      });
      setImagePreview(preview);

      const { url, key } = await feedbackServiceV1.presign({
        filename: selectedFile.name,
        content_type: selectedFile.type,
      });

      const uploadRes = await fetch(url, {
        method: "PUT",
        body: selectedFile,
        headers: {
          "Content-Type": selectedFile.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      setImageKey(key);
      showToast.success("Upload ảnh thành công!");
    } catch (err) {
      setFile(null);
      setImageKey(null);
      setImagePreview("");
      if (err instanceof Error && err.message === "FileReader error") {
        showToast.error("Có lỗi khi đọc file ảnh");
      } else {
        showToast.error("Có lỗi khi upload ảnh. Vui lòng thử lại.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/") && f.size <= MAX_FILE_SIZE_MB * 1024 * 1024) {
      void uploadImage(f);
    } else if (f) {
      showToast.warning(`Chỉ chấp nhận PNG, JPG tối đa ${MAX_FILE_SIZE_MB}MB`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.size <= MAX_FILE_SIZE_MB * 1024 * 1024) {
      void uploadImage(f);
    } else if (f)
      showToast.warning(`Kích thước ảnh tối đa ${MAX_FILE_SIZE_MB}MB`);
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setFile(null);
    setImageKey(null);
    setImagePreview("");
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast.error("Vui lòng nhập tiêu đề phản hồi");
      return;
    }
    if (!content.trim()) {
      showToast.error("Vui lòng nhập nội dung chi tiết");
      return;
    }
    if (isUploading || (file && !imageKey)) {
      showToast.error("Vui lòng chờ upload ảnh hoàn tất trước khi gửi.");
      return;
    }
    const trimmedPhone = phone.trim();
    if (trimmedPhone) {
      const vnPhoneRegex = /^(\+84|0)\d{8,9}$/;
      if (!vnPhoneRegex.test(trimmedPhone)) {
        showToast.error("Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.");
        return;
      }
    }
    setIsSubmitting(true);
    try {
      await feedbackServiceV1.create({
        feedback: {
          title: title.trim(),
          content: content.trim(),
          page_issue: pageIssue.trim() || null,
          image_url: null,
          image_key: imageKey,
          phone_number: trimmedPhone || null,
        },
      });
      showToast.success(
        "Gửi phản hồi thành công. Cảm ơn bạn đã đóng góp ý kiến!"
      );
      setTitle("");
      setContent("");
      setPhone("");
      setPageIssue("");
      setFile(null);
      setImageKey(null);
      setImagePreview("");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const errors = (err.response?.data as { errors?: string[] })?.errors;
        if (Array.isArray(errors) && errors.length > 0) {
          errors.forEach((msg) => showToast.error(msg));
          return;
        }
        showToast.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
      } else if (axios.isAxiosError(err) && err.response?.status === 401) {
        showToast.error("Vui lòng đăng nhập để gửi phản hồi.");
      } else {
        showToast.error("Gửi phản hồi thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container-page max-w-2xl mx-auto py-10 sm:py-14 mt-20">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Gửi phản hồi của bạn
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Ý kiến của bạn giúp ORCA ngày càng hoàn thiện hơn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-700 font-medium">
              Tiêu đề
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề phản hồi..."
              className="rounded-xl bg-gray-100/80 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-700 font-medium">
              Số điện thoại <span className="text-gray-400 font-normal">(Không bắt buộc)</span>
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="VD: 0912345678 hoặc +84912345678"
              className="rounded-xl bg-gray-100/80 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-gray-700 font-medium">
              Nội dung chi tiết
            </Label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Hãy chia sẻ trải nghiệm hoặc góp ý của bạn tại đây..."
              rows={5}
              className="flex w-full rounded-xl bg-gray-100/80 border-0 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 resize-y min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pageIssue" className="text-gray-700 font-medium">
              Trang đang bị vấn đề <span className="text-gray-400 font-normal">(Không bắt buộc)</span>
            </Label>
            <Input
              id="pageIssue"
              value={pageIssue}
              onChange={(e) => setPageIssue(e.target.value)}
              placeholder="VD: /articles, /exchange-rate, /chat..."
              className="rounded-xl bg-gray-100/80 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">
              Ảnh đính kèm <span className="text-gray-400 font-normal">(Không bắt buộc)</span>
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_IMAGE}
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              role="button"
              tabIndex={0}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              className={cn(
                "rounded-xl border-2 border-dashed bg-white py-10 px-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors",
                isDragging ? "border-primary bg-primary/5" : "border-primary/30 hover:border-primary/50 hover:bg-gray-50/50"
              )}
            >
              <Upload className="h-10 w-10 text-primary/60" />
              <p className="text-gray-700 text-sm font-medium">
                Nhấn để tải ảnh lên hoặc kéo thả
              </p>
              <p className="text-gray-400 text-xs">PNG, JPG tối đa {MAX_FILE_SIZE_MB}MB</p>
              {file && (
                <span className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  {isUploading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Đang upload ảnh...
                    </>
                  ) : (
                    file.name
                  )}
                </span>
              )}
            </div>
            {imagePreview && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Xem trước:</p>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-8"
                    onClick={handleRemoveImage}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Xóa
                  </Button>
                </div>
                <img
                  src={imagePreview}
                  alt="Ảnh đính kèm"
                  className="max-h-[200px] max-w-full object-contain border rounded"
                />
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto rounded-xl px-6 py-3 font-semibold gap-2"
            >
              <Send className="h-4 w-4" />
              Gửi phản hồi ngay
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default Feedback;
