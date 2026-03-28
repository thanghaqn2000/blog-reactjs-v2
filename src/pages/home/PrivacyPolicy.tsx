import MainLayout from '@/layouts/MainLayout';
import { Mail, ShieldCheck } from 'lucide-react';

const ORCA_BLUE = '#1a365d';
const ORCA_GOLD = '#d97706';

const PrivacyPolicy = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50 pt-16 text-slate-800 sm:pt-20">
        <section
          className="py-14 md:py-16"
          style={{ backgroundColor: ORCA_BLUE }}
        >
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Chính sách Bảo mật
            </h1>
            <p className="mx-auto max-w-2xl leading-relaxed text-blue-100">
              Chúng tôi cam kết bảo vệ dữ liệu cá nhân của bạn và minh bạch trong cách chúng tôi vận
              hành dịch vụ.
            </p>
          </div>
        </section>

        <main className="container mx-auto -mt-8 px-4 pb-16">
          <div
            className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] md:p-12"
          >
            <div className="mb-10 flex items-center rounded-xl border border-orange-100 bg-orange-50 p-4">
              <div
                className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: ORCA_GOLD }}
              >
                <ShieldCheck className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: ORCA_BLUE }}>
                  Cam kết quyền riêng tư
                </h2>
                <p className="text-sm text-slate-600">
                  Dữ liệu của bạn được bảo vệ theo tiêu chuẩn của Orca Viet Nam.
                </p>
              </div>
            </div>

            <article className="max-w-none">
              <section className="mb-8">
                <h3
                  className="mb-4 flex items-center text-xl font-bold"
                  style={{ color: ORCA_BLUE }}
                >
                  <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm text-blue-700">
                    01
                  </span>
                  Thông tin chúng tôi thu thập
                </h3>
                <p className="pl-11 leading-relaxed text-slate-600">
                  Khi bạn sử dụng hệ thống của chúng tôi, chúng tôi thu thập{' '}
                  <strong>họ tên</strong> và <strong>địa chỉ email</strong> của bạn thông qua hình thức
                  Đăng nhập bằng Google (Google Login). Việc này giúp chúng tôi định danh bạn một cách
                  chính xác trong hệ thống của Orca Việt Nam.
                </p>
              </section>

              <section className="mb-8">
                <h3
                  className="mb-4 flex items-center text-xl font-bold"
                  style={{ color: ORCA_BLUE }}
                >
                  <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm text-blue-700">
                    02
                  </span>
                  Cách chúng tôi sử dụng thông tin
                </h3>
                <p className="pl-11 leading-relaxed text-slate-600">
                  Thông tin của bạn được sử dụng duy nhất cho mục đích:
                </p>
                <ul className="mt-2 list-disc space-y-2 pl-16 text-slate-600">
                  <li>Cung cấp đầy đủ các tính năng và dịch vụ của nền tảng.</li>
                  <li>
                    Cá nhân hóa trải nghiệm của bạn (ví dụ: hiển thị thông tin phân tích cổ phiếu phù
                    hợp).
                  </li>
                  <li>Gửi các thông báo quan trọng về tài khoản và cập nhật thị trường.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h3
                  className="mb-4 flex items-center text-xl font-bold"
                  style={{ color: ORCA_BLUE }}
                >
                  <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm text-blue-700">
                    03
                  </span>
                  Bảo vệ dữ liệu
                </h3>
                <p className="pl-11 leading-relaxed text-slate-600">
                  Chúng tôi áp dụng các biện pháp bảo mật nghiêm ngặt nhất. Chúng tôi cam kết{' '}
                  <strong>không chia sẻ, bán hoặc cho thuê</strong> dữ liệu cá nhân của bạn cho bất kỳ
                  bên thứ ba nào. Quyền riêng tư của người dùng là ưu tiên hàng đầu của chúng tôi.
                </p>
              </section>

              <section className="mb-8">
                <h3
                  className="mb-4 flex items-center text-xl font-bold"
                  style={{ color: ORCA_BLUE }}
                >
                  <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm text-blue-700">
                    04
                  </span>
                  Liên hệ với chúng tôi
                </h3>
                <p className="pl-11 leading-relaxed text-slate-600">
                  Nếu bạn có bất kỳ câu hỏi hoặc thắc mắc nào về chính sách này, vui lòng gửi email
                  trực tiếp cho đội ngũ hỗ trợ của chúng tôi tại:
                </p>
                <div className="ml-11 mt-4">
                  <a
                    href="mailto:thangit189@gmail.com"
                    className="inline-flex items-center font-semibold text-blue-600 hover:underline"
                  >
                    <Mail className="mr-2 h-5 w-5 shrink-0" aria-hidden />
                    thangit189@gmail.com
                  </a>
                </div>
              </section>
            </article>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicy;
