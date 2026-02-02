import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showToast } from "@/config/toast.config";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Eye, EyeOff, Home, Lock, LogIn, Mail, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import RegisterForm from "./RegisterForm";
import SocialLogin from "./SocialLogin";

interface LoginProps {
  onLogin?: (phoneNumber: string, password: string) => void;
  onSocialLogin?: (provider: "google" | "facebook") => void;
  onRegister?: (email: string, password: string, name: string) => void;
}

const Login = ({ onLogin, onSocialLogin, onRegister }: LoginProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: ""
  });

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    if (location.state?.prefillData) {
      setRegisterData(prev => ({
        ...prev,
        name: location.state.prefillData.name,
        email: location.state.prefillData.email
      }));
    }
  }, [location.state]);

  // Kiểm tra và redirect nếu đã đăng nhập
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

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
              <span className="font-semibold text-lg">ORCA</span>
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
                <TabsTrigger value="login" className="flex items-center gap-1 cursor-pointer">
                  <LogIn size={16} />
                  <span>Đăng nhập</span>
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-1 cursor-pointer">
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
                <RegisterForm 
                  onRegisterSuccess={() => setActiveTab("login")} 
                  initialData={registerData}
                />
              </TabsContent>
            </Tabs>

            <SocialLogin onSocialLogin={handleSocialLogin} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login; 
