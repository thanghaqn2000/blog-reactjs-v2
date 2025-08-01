import { auth } from '@/lib/firebase';
import { getRedirectResult } from 'firebase/auth';
import { useEffect } from "react";


const AuthHandler = () => {
    useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log('Login thành công:', result.user)
          // Lưu user vào context, store hoặc localStorage nếu cần
          window.location.href = '/'
        } else {
          console.log('Không có user từ getRedirectResult')
        }
      })
      .catch((error) => {
        console.error('Lỗi xử lý redirect:', error)
      })
  }, [])

  return <div>Đang xử lý đăng nhập Google...</div>
};

export default AuthHandler; 
