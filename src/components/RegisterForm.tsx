import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showToast } from "@/config/toast.config";
import { cn } from "@/lib/utils";
import { userService } from "@/services/v1/user.service";
import { zodResolver } from "@hookform/resolvers/zod";
import emailValidator from "email-validator";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
// Schema validation
import { registerSchema } from "@/schemas/user-validation";

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onRegisterSuccess: () => void;
  initialData?: {
    name: string;
    email: string;
    phone_number: string;
    password: string;
    confirm_password: string;
  };
}

const RegisterForm = ({ onRegisterSuccess, initialData }: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setError,
    clearErrors,
    setValue,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: initialData ? {
      name: initialData.name,
      email: initialData.email,
      phone_number: initialData.phone_number,
      password: initialData.password,
      confirmPassword: initialData.confirm_password,
    } : {
      name: "",
      email: "",
      phone_number: "",
      password: "",
      confirmPassword: "",
    }
  });

  const emailValue = watch("email");
  const phoneValue = watch("phone_number");

  // Check email uniqueness
  useEffect(() => {
    const checkEmail = async () => {
      if (!emailValue || !emailValidator.validate(emailValue)) {
        return;
      }

      setIsCheckingEmail(true);
      try {
        await userService.checkInfoUniqueness(emailValue);
        clearErrors("email");
      } catch (error: any) {
        if (error.response?.data?.code === 410) {
          setError("email", { 
            message: error.response.data.data.errors 
          });
        }
      } finally {
        setIsCheckingEmail(false);
      }
    };

    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [emailValue, setError, clearErrors]);

  // Check phone number uniqueness
  useEffect(() => {
    const checkPhone = async () => {
      if (!phoneValue || !/(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(phoneValue)) {
        return;
      }

      setIsCheckingPhone(true);
      try {
        await userService.checkInfoUniqueness(undefined, phoneValue);
        clearErrors("phone_number");
      } catch (error: any) {
        if (error.response?.data?.code === 410) {
          setError("phone_number", { 
            message: error.response.data.data.errors 
          });
        }
      } finally {
        setIsCheckingPhone(false);
      }
    };

    const timeoutId = setTimeout(checkPhone, 500);
    return () => clearTimeout(timeoutId);
  }, [phoneValue, setError, clearErrors]);

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await userService.registerUser({
        user: {
          email: data.email,
          password: data.password,
          phone_number: data.phone_number,
          name: data.name,
        }
      });

      showToast.success("Đăng ký thành công", {
        description: "Vui lòng đăng nhập để tiếp tục"
      });
      
      // Reset form
      setValue("name", "");
      setValue("email", "");
      setValue("password", "");
      setValue("confirmPassword", "");
      setValue("phone_number", "");

      // Chuyển sang tab đăng nhập
      onRegisterSuccess();
    } catch (error) {
      showToast.error("Đăng ký thất bại", {
        description: "Có lỗi xảy ra, vui lòng thử lại"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Họ tên <span className="text-red-500">*</span>
        </Label>
        <Input 
          id="name" 
          placeholder="Nguyễn Văn A" 
          className={cn(
            "transition-all border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary",
            errors.name && "border-red-500 focus:border-red-500 focus:ring-red-500"
          )}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input 
            id="email" 
            type="email" 
            placeholder="name@example.com" 
            className={cn(
              "transition-all border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary",
              errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500"
            )}
            {...register("email")}
            disabled={isCheckingEmail}
          />
          {isCheckingEmail && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone_number">
          Số điện thoại <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input 
            id="phone_number" 
            type="tel" 
            placeholder="0912345678" 
            className={cn(
              "transition-all border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary",
              errors.phone_number && "border-red-500 focus:border-red-500 focus:ring-red-500"
            )}
            {...register("phone_number")}
            disabled={isCheckingPhone}
          />
          {isCheckingPhone && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
        {errors.phone_number && (
          <p className="text-sm text-red-500">{errors.phone_number.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">
          Mật khẩu <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input 
            id="password" 
            type={showPassword ? "text" : "password"} 
            className={cn(
              "pr-10 transition-all border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary",
              errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500"
            )}
            {...register("password")}
          />
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          Nhập lại mật khẩu <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input 
            id="confirmPassword" 
            type={showPassword ? "text" : "password"} 
            className={cn(
              "pr-10 transition-all border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary",
              errors.confirmPassword && "border-red-500 focus:border-red-500 focus:ring-red-500"
            )}
            {...register("confirmPassword")}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all"
        disabled={!isValid || isCheckingEmail || isCheckingPhone}
      >
        Đăng ký
      </Button>
    </form>
  );
};

export default RegisterForm;
