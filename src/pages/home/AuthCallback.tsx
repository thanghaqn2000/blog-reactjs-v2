import { showToast } from "@/config/toast.config";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { verifySocialToken, user } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session) {
          const access_token = session.access_token;
          if (access_token) {
            try {
              await verifySocialToken(access_token);
                showToast.success("Đăng nhập thành công", {
                  description: "Chào mừng bạn quay trở lại!"
                });
                navigate("/");
            } catch (error) {
              showToast.error("Đăng nhập thất bại", {
                description: "Xác thực token thất bại"
              });
              navigate("/login");
            }
          } else {
            showToast.error("Đăng nhập thất bại", {
              description: "Không thể lấy được token từ Google"
            });
            navigate("/login");
          }
        }
      } catch (error) {
        showToast.error("Đăng nhập thất bại", {
          description: "Có lỗi xảy ra khi xác thực"
        });
        navigate("/login");
      }
    };

    handleCallback();
  }, [navigate, verifySocialToken, user]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
};

export default AuthCallback; 
