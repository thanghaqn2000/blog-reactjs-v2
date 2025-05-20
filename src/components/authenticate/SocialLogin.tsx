import { Button } from "@/components/ui/button";
import { showToast } from "@/config/toast.config";
import { supabase } from "@/lib/supabase";
import { Facebook } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

interface SocialLoginProps {
  onSocialLogin: (provider: "google" | "facebook") => void;
}
const domain_url = import.meta.env.VITE_DOMAIN;

const SocialLogin = ({ onSocialLogin }: SocialLoginProps) => {
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${domain_url}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      showToast.error("Đăng nhập thất bại", {
        description: "Có lỗi xảy ra khi đăng nhập với Google"
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
          onClick={() => onSocialLogin("facebook")}
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
