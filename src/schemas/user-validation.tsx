import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Họ tên không được để trống"),
  email: z.string()
    .min(1, "Email không được để trống")
    .email("Email không đúng định dạng"),
  phone_number: z.string()
    .min(1, "Số điện thoại không được để trống")
    .refine(
      (phone) => /(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(phone),
      "Số điện thoại không đúng định dạng Việt Nam"
    ),
  password: z.string()
    .min(1, "Mật khẩu không được để trống")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

const validatePhoneNumber = (phone: string) => {
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  return phoneRegex.test(phone);
};

const profileFormSchema = z
  .object({
    name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự." }),
    email: z.string().email({ message: "Vui lòng nhập địa chỉ email hợp lệ." }),
    phone: z
      .string()
      .min(1, { message: "Số điện thoại không được để trống." })
      .refine(validatePhoneNumber, {
        message: "Số điện thoại không đúng định dạng Việt Nam.",
      }),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const { currentPassword, newPassword } = data;

    const hasCurrent = !!currentPassword;
    const hasNew = !!newPassword;

    if (hasCurrent && !hasNew) {
      ctx.addIssue({
        path: ["newPassword"],
        message: "Vui lòng nhập mật khẩu mới.",
        code: z.ZodIssueCode.custom,
      });
    }

    if (hasNew && !hasCurrent) {
      ctx.addIssue({
        path: ["currentPassword"],
        message: "Vui lòng nhập mật khẩu hiện tại.",
        code: z.ZodIssueCode.custom,
      });
    }

    if (hasCurrent && currentPassword.length < 6) {
      ctx.addIssue({
        path: ["currentPassword"],
        message: "Mật khẩu hiện tại phải có ít nhất 6 ký tự.",
        code: z.ZodIssueCode.too_small,
        minimum: 6,
        type: "string",
        inclusive: true,
      });
    }

    if (hasNew && newPassword.length < 6) {
      ctx.addIssue({
        path: ["newPassword"],
        message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
        code: z.ZodIssueCode.too_small,
        minimum: 6,
        type: "string",
        inclusive: true,
      });
    }
  });

const createPostSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc'),
  description: z.string().min(1, 'Mô tả là bắt buộc'),
  content: z.string().min(1, 'Nội dung là bắt buộc'),
  category: z.string().min(1, 'Danh mục là bắt buộc'),
  status: z.enum(['pending', 'publish']),
});

const createNotificationSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc'),
  content: z.string().min(1, 'Nội dung là bắt buộc'),
  link: z.string().url('Link không đúng định dạng').optional().or(z.literal('')),
  type: z.enum(['sent_now', 'scheduled']),
  scheduled_at: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'scheduled' && !data.scheduled_at) {
    ctx.addIssue({
      path: ['scheduled_at'],
      message: 'Thời gian gửi là bắt buộc khi lên lịch',
      code: z.ZodIssueCode.custom,
    });
  }
  
  if (data.type === 'scheduled' && data.scheduled_at) {
    const scheduledDate = new Date(data.scheduled_at);
    const now = new Date();
    
    if (scheduledDate <= now) {
      ctx.addIssue({
        path: ['scheduled_at'],
        message: 'Thời gian gửi phải ở tương lai',
        code: z.ZodIssueCode.custom,
      });
    }
  }
});

export { createNotificationSchema, createPostSchema, profileFormSchema, registerSchema };

