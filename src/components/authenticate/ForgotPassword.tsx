import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showToast } from '@/config/toast.config';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import axios from 'axios';
import { ArrowLeft, Home, Mail, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object'
          ? String(
              (err.response.data as { message?: string; error?: string }).message ??
                (err.response.data as { error?: string }).error ??
                ''
            )
          : '';
      showToast.error('Không gửi được yêu cầu', {
        description: msg || 'Kiểm tra email hợp lệ và thử lại.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
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

      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-50 translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md mx-auto border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-black font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Quên mật khẩu
            </CardTitle>
            {!sent && (
              <CardDescription className="text-center">
                Nhập email đã đăng ký — chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-6">
                <p className="text-sm text-center text-foreground leading-relaxed">
                  Hướng dẫn đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư!
                </p>
                <Button asChild className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary">
                  <Link to="/login">Quay lại đăng nhập</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      placeholder="Nhập email"
                      className="pl-10 transition-all border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all"
                  disabled={isSubmitting}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Đang gửi…' : 'Gửi'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Quay lại đăng nhập
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
