import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showToast } from '@/config/toast.config';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import axios from 'axios';
import { ArrowLeft, Eye, EyeOff, Home, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const MIN_PASSWORD_LENGTH = 6;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const { user } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (success) {
      const t = window.setTimeout(() => navigate('/login'), 3000);
      return () => window.clearTimeout(t);
    }
  }, [success, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!token) {
      setApiError('Thiếu mã xác thực trong liên kết. Vui lòng dùng đúng link trong email.');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      showToast.error('Mật khẩu không hợp lệ', {
        description: `Mật khẩu mới cần ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`,
      });
      return;
    }

    if (password !== confirm) {
      showToast.error('Mật khẩu không khớp', {
        description: 'Xác nhận mật khẩu phải trùng với mật khẩu mới.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword({ token, new_password: password });
      showToast.success('Đổi mật khẩu thành công', {
        description: 'Đang chuyển về trang đăng nhập…',
      });
      setSuccess(true);
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object'
          ? String(
              (err.response.data as { error?: string; message?: string }).error ??
                (err.response.data as { message?: string }).message ??
                ''
            )
          : '';
      setApiError(msg || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const shell = (
    <>
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
    </>
  );

  if (!token && !success) {
    return (
      <div className="relative min-h-screen flex flex-col">
        {shell}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md mx-auto border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl text-black font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Liên kết không hợp lệ
              </CardTitle>
              <CardDescription className="text-center">
                Không tìm thấy mã đặt lại mật khẩu. Hãy yêu cầu gửi email mới.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/forgot-password">Gửi lại yêu cầu mới</Link>
              </Button>
              <p className="text-center text-sm">
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Quay lại đăng nhập
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="relative min-h-screen flex flex-col">
        {shell}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md mx-auto border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl text-black font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Đổi mật khẩu thành công
              </CardTitle>
              <CardDescription className="text-center">
                Bạn sẽ được chuyển về trang đăng nhập sau vài giây.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/login">Đăng nhập ngay</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {shell}

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md mx-auto border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-black font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Đặt lại mật khẩu
            </CardTitle>
            <CardDescription className="text-center">
              Nhập mật khẩu mới cho tài khoản của bạn (tối thiểu {MIN_PASSWORD_LENGTH} ký tự).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {apiError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {apiError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reset-password-new">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-password-new"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="pl-10 pr-10 transition-all border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={MIN_PASSWORD_LENGTH}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-password-confirm">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-password-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="pl-10 pr-10 transition-all border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={MIN_PASSWORD_LENGTH}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang cập nhật…' : 'Cập nhật mật khẩu'}
              </Button>

              {apiError && (
                <Button type="button" variant="outline" className="w-full" asChild>
                  <Link to="/forgot-password">Gửi lại yêu cầu mới</Link>
                </Button>
              )}

              <p className="text-center text-sm text-muted-foreground">
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Quay lại đăng nhập
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
