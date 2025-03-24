import { toast } from "sonner";

interface ToastOptions {
  description?: string;
  duration?: number;
}

export const showToast = {
  success: (title: string, options?: ToastOptions) => {
    toast.success(title, {
      ...options,
      action: {
        label: "X",
        onClick: () => toast.dismiss()
      }
    });
  },
  error: (title: string, options?: ToastOptions) => {
    toast.error(title, {
      ...options,
      action: {
        label: "X",
        onClick: () => toast.dismiss()
      }
    });
  },
  warning: (title: string, options?: ToastOptions) => {
    toast.warning(title, {
      ...options,
      action: {
        label: "X",
        onClick: () => toast.dismiss()
      }
    });
  },
  info: (title: string, options?: ToastOptions) => {
    toast.info(title, {
      ...options,
      action: {
        label: "X",
        onClick: () => toast.dismiss()
      }
    });
  }
}; 
