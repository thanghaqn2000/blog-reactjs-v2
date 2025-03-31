import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showToast } from "@/config/toast.config";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { userService } from "@/services/v1/user.service";
import emailValidator from "email-validator";
import { ArrowLeft, Eye, EyeOff, Facebook, Home, Lock, LogIn, Mail, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

// Schema validation
const registerSchema = z.object({
  name: z.string().min(1, "Họ tên không được để trống"),
  email: z.string().min(1, "Email không được để trống"),
  phone_number: z.string().min(1, "Số điện thoại không được để trống"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

// Validate phone number format
const validatePhoneNumber = (phone: string) => {
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  return phoneRegex.test(phone);
};

// Tách các message lỗi ra constant
const ERROR_MESSAGES = {
  required: {
    name: "Họ tên không được để trống",
    email: "Email không được để trống",
    phone_number: "Số điện thoại không được để trống",
    password: "Mật khẩu không được để trống",
    confirmPassword: "Vui lòng nhập lại mật khẩu"
  },
  format: {
    email: "Email không đúng định dạng",
    phone_number: "Số điện thoại không đúng định dạng Việt Nam",
    password: "Mật khẩu phải có ít nhất 6 ký tự"
  },
  match: {
    confirmPassword: "Mật khẩu không khớp"
  }
};

interface LoginProps {
  onLogin?: (phoneNumber: string, password: string) => void;
  onSocialLogin?: (provider: "google" | "facebook") => void;
  onRegister?: (email: string, password: string, name: string) => void;
}

const Login = ({ onLogin, onSocialLogin, onRegister }: LoginProps) => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPhoneNumber, setRegisterPhoneNumber] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Debounce values for email and phone number
  const debouncedEmail = useDebounce(registerEmail, 500);
  const debouncedPhone = useDebounce(registerPhoneNumber, 500);

  // Kiểm tra và redirect nếu đã đăng nhập
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Check email uniqueness
  useEffect(() => {
    const checkEmail = async () => {
      if (!debouncedEmail || !emailValidator.validate(debouncedEmail)) {
        return;
      }

      setIsCheckingEmail(true);
      try {
        const response = await userService.checkInfoUniqueness(debouncedEmail);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.email;
          setIsFormValid(Object.keys(newErrors).length === 0);
          return newErrors;
        });
      } catch (error: any) {
        if (error.response?.data?.code === 410) {
          setErrors(prev => {
            const newErrors = { ...prev, email: error.response.data.data.errors };
            setIsFormValid(false);
            return newErrors;
          });
        }
      } finally {
        setIsCheckingEmail(false);
      }
    };

    checkEmail();
  }, [debouncedEmail]);

  // Check phone number uniqueness
  useEffect(() => {
    const checkPhone = async () => {
      if (!debouncedPhone || !validatePhoneNumber(debouncedPhone)) {
        return;
      }

      setIsCheckingPhone(true);
      try {
        const response = await userService.checkInfoUniqueness(undefined, debouncedPhone);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.phone_number;
          setIsFormValid(Object.keys(newErrors).length === 0);
          return newErrors;
        });
      } catch (error: any) {
        if (error.response?.data?.code === 410) {
          setErrors(prev => {
            const newErrors = { ...prev, phone_number: error.response.data.data.errors };
            setIsFormValid(false);
            return newErrors;
          });
        }
      } finally {
        setIsCheckingPhone(false);
      }
    };

    checkPhone();
  }, [debouncedPhone]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(phoneNumber, loginPassword);
      showToast.success("Đăng nhập thành công", {
        description: "Chào mừng bạn quay trở lại!"
      });
      navigate("/");
    } catch (error) {
      showToast.error("Đăng nhập thất bại", {
        description: "Tài khoản hoặc mật khẩu không chính xác"
      });
    }
  };

  // Tách logic validate từng field
  const validateField = (field: string, value: string, confirmValue?: string) => {
    const newErrors: Record<string, string> = {};

    // Validate required
    if (!value) {
      newErrors[field] = ERROR_MESSAGES.required[field as keyof typeof ERROR_MESSAGES.required];
      return newErrors;
    }

    // Validate format
    switch (field) {
      case 'email':
        if (!emailValidator.validate(value)) {
          newErrors.email = ERROR_MESSAGES.format.email;
        }
        break;
      case 'phone_number':
        if (!validatePhoneNumber(value)) {
          newErrors.phone_number = ERROR_MESSAGES.format.phone_number;
        }
        break;
      case 'password':
        if (value.length < 6) {
          newErrors.password = ERROR_MESSAGES.format.password;
        }
        break;
    }

    // Validate match
    if (field === 'confirmPassword' && value !== confirmValue) {
      newErrors.confirmPassword = ERROR_MESSAGES.match.confirmPassword;
    }

    return newErrors;
  };

  const handleFieldBlur = (field: string, value: string) => {
    const fieldErrors = validateField(field, value, field === 'confirmPassword' ? registerPassword : undefined);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (Object.keys(fieldErrors).length > 0) {
        newErrors[field] = fieldErrors[field];
      } else {
        delete newErrors[field];
      }
      setIsFormValid(Object.keys(newErrors).length === 0);
      return newErrors;
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      return;
    }

    try {
      await userService.registerUser({
        user: {
          email: registerEmail,
          password: registerPassword,
          phone_number: registerPhoneNumber,
          name: registerName,
        }
      });

      showToast.success("Đăng ký thành công", {
        description: "Vui lòng đăng nhập để tiếp tục"
      });
      
      // Reset form
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setConfirmPassword("");
      setRegisterPhoneNumber("");
      setErrors({});

      // Chuyển sang tab đăng nhập
      setActiveTab("login");
    } catch (error) {
      showToast.error("Đăng ký thất bại", {
        description: "Có lỗi xảy ra, vui lòng thử lại"
      });
    }
  };

  const handleSocialLogin = (provider: "google" | "facebook") => {
    if (onSocialLogin) {
      onSocialLogin(provider);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Header with back button */}
      <header className="w-full bg-gradient-to-r from-purple-600/90 to-purple-400/70 text-white shadow-md py-4 mb-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="inline-flex items-center text-sm font-medium text-white hover:text-white/90 transition-colors bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm"
            >
              <ArrowLeft size={16} className="mr-2" />
              <span>Quay về trang chủ</span>
            </Link>
            <div className="flex items-center space-x-1">
              <Home size={20} />
              <span className="font-semibold text-lg">Stock Insights</span>
            </div>
          </div>
        </div>
      </header>

      {/* Background gradient and shapes */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-50 translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md mx-auto border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-black font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Đăng nhập
            </CardTitle>
            <CardDescription className="text-center">
              Đăng nhập để truy cập tài khoản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-2">
                <TabsTrigger value="login" className="flex items-center gap-1">
                  <LogIn size={16} />
                  <span>Đăng nhập</span>
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-1">
                  <UserPlus size={16} />
                  <span>Đăng ký</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Số điện thoại <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        type="tel"
                        placeholder="Nhập số điện thoại" 
                        className="pl-10 transition-all border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">
                        Mật khẩu <span className="text-red-500">*</span>
                      </Label>
                      <a href="#" className="text-sm text-primary hover:underline">
                        Quên mật khẩu?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        className="pl-10 pr-10 transition-all border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Ghi nhớ đăng nhập
                    </label>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all"
                  >
                    Đăng nhập
                  </Button>
                </form>
              </TabsContent>
              
              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
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
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      onBlur={() => handleFieldBlur('name', registerName)}
                      required
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input 
                        id="register-email" 
                        type="email" 
                        placeholder="name@example.com" 
                        className={cn(
                          "transition-all border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary",
                          errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        onBlur={() => handleFieldBlur('email', registerEmail)}
                        required
                        disabled={isCheckingEmail}
                      />
                      {isCheckingEmail && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-phone">
                      Số điện thoại <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input 
                        id="register-phone" 
                        type="tel" 
                        placeholder="0912345678" 
                        className={cn(
                          "transition-all border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary",
                          errors.phone_number && "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                        value={registerPhoneNumber}
                        onChange={(e) => setRegisterPhoneNumber(e.target.value)}
                        onBlur={() => handleFieldBlur('phone_number', registerPhoneNumber)}
                        required
                        disabled={isCheckingPhone}
                      />
                      {isCheckingPhone && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </div>
                    {errors.phone_number && (
                      <p className="text-sm text-red-500">{errors.phone_number}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">
                      Mật khẩu <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input 
                        id="register-password" 
                        type={showPassword ? "text" : "password"} 
                        className={cn(
                          "pr-10 transition-all border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary",
                          errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        onBlur={() => handleFieldBlur('password', registerPassword)}
                        required
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      Nhập lại mật khẩu <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input 
                        id="confirm-password" 
                        type={showPassword ? "text" : "password"} 
                        className={cn(
                          "pr-10 transition-all border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary",
                          errors.confirmPassword && "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={() => handleFieldBlur('confirmPassword', confirmPassword)}
                        required
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all"
                    disabled={!isFormValid}
                  >
                    Đăng ký
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-primary/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => handleSocialLogin("google")}
                className="flex items-center justify-center gap-2 hover:bg-gray-50 transition-all border-primary/20"
              >
                <FcGoogle className="h-5 w-5" />
                <span>Google</span>
              </Button>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => handleSocialLogin("facebook")}
                className="flex items-center justify-center gap-2 bg-[#1877F2] text-white hover:bg-[#1877F2]/90 transition-all"
              >
                <Facebook className="h-5 w-5" />
                <span>Facebook</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login; 
