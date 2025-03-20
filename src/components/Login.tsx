import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Eye, EyeOff, Facebook, Home, Lock, LogIn, Mail, UserPlus } from "lucide-react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";

interface LoginProps {
  onLogin?: (email: string, password: string) => void;
  onSocialLogin?: (provider: "google" | "facebook") => void;
  onRegister?: (email: string, password: string, name: string) => void;
}

const Login = ({ onLogin, onSocialLogin, onRegister }: LoginProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin) {
      onLogin(loginEmail, loginPassword);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (onRegister) {
      onRegister(registerEmail, registerPassword, registerName);
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
              <span className="font-semibold text-lg">StockInsights</span>
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
            <Tabs defaultValue="login" className="w-full">
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
                    <Label htmlFor="email">Số điện thoại</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="" 
                        placeholder="name@example.com" 
                        className="pl-10 transition-all border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Mật khẩu</Label>
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
                    <Label htmlFor="name">Họ tên</Label>
                    <Input 
                      id="name" 
                      placeholder="Nguyễn Văn A" 
                      className="transition-all border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input 
                      id="register-email" 
                      type="email" 
                      placeholder="name@example.com" 
                      className="transition-all border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Mật khẩu</Label>
                    <div className="relative">
                      <Input 
                        id="register-password" 
                        type={showPassword ? "text" : "password"} 
                        className="pr-10 transition-all border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
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
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all"
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
