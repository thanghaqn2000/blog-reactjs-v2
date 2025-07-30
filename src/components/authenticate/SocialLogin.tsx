import { Button } from "@/components/ui/button";
import { showToast } from "@/config/toast.config";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { FacebookAuthProvider, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Facebook } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

interface SocialLoginProps {
  onSocialLogin: (provider: "google" | "facebook") => void;
}

const SocialLogin = ({ onSocialLogin }: SocialLoginProps) => {
  const { verifySocialToken } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      // Tạo provider mới với custom parameters để force chọn tài khoản
      const googleProviderWithPrompt = new GoogleAuthProvider();
      googleProviderWithPrompt.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, googleProviderWithPrompt);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      // Lấy ID token chứa metadata của user
      const idToken = credential?.idToken;
      
      // Lấy thông tin user từ Firebase
      const user = result.user;
      const userInfo = {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
        id_token: idToken
      };
      
      if (idToken) {
        // Gửi ID token lên server để xác thực
        await verifySocialToken(userInfo);
        showToast.success("Đăng nhập thành công", {
          description: `Chào mừng ${user.displayName} quay trở lại!`
        });
      } else {
        throw new Error("Không thể lấy token từ Google");
      }
    } catch (error) {
      showToast.error("Đăng nhập thất bại", {
        description: "Có lỗi xảy ra khi đăng nhập với Google"
      });
    }
  };

  const handleFacebookLogin = async () => {
    try {
      // Tạo provider mới với custom parameters để force chọn tài khoản
      const facebookProviderWithPrompt = new FacebookAuthProvider();
      facebookProviderWithPrompt.setCustomParameters({
        auth_type: 'reauthenticate'
      });
      
      const result = await signInWithPopup(auth, facebookProviderWithPrompt);
      const credential = FacebookAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      const idToken = await result.user.getIdToken();
      // Lấy thông tin user từ Firebase
      const user = result.user;
      const userInfo = {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
        access_token: accessToken,
        id_token: idToken
      };
      
      if (accessToken) {
        // Gửi access token và thông tin user lên server
        await verifySocialToken(userInfo);
        showToast.success("Đăng nhập thành công", {
          description: `Chào mừng ${user.displayName} quay trở lại!`
        });
      } else {
        throw new Error("Không thể lấy token từ Facebook");
      }
    } catch (error) {
      showToast.error("Đăng nhập thất bại", {
        description: "Có lỗi xảy ra khi đăng nhập với Facebook"
      });
    }
  };

  return (
    <>
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
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-2 hover:bg-gray-50 transition-all border-primary/20"
        >
          <FcGoogle className="h-5 w-5" />
          <span>Google</span>
        </Button>
        <Button 
          variant="outline" 
          type="button" 
          onClick={handleFacebookLogin}
          className="flex items-center justify-center gap-2 bg-[#1877F2] text-white hover:bg-[#1877F2]/90 transition-all"
        >
          <Facebook className="h-5 w-5" />
          <span>Facebook</span>
        </Button>
      </div>
    </>
  );
};

export default SocialLogin;
