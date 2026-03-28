import MainLayout from '@/layouts/MainLayout';
import { Info, TriangleAlert } from 'lucide-react';

const ORCA_BLUE = '#1a365d';

const TermsOfService = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50 pt-16 text-slate-800 sm:pt-20">
        <section className="py-14 md:py-16" style={{ backgroundColor: ORCA_BLUE }}>
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl">Terms of Service</h1>
            <p className="mx-auto max-w-2xl leading-relaxed text-blue-100">
              Vui lòng đọc kỹ các điều khoản dưới đây trước khi sử dụng nền tảng phân tích cổ phiếu Orca
              Việt Nam.
            </p>
          </div>
        </section>

        <main className="container mx-auto -mt-8 px-4 pb-16">
          <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] md:p-12">
            <div className="mb-10 flex items-center rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div
                className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: ORCA_BLUE }}
              >
                <Info className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: ORCA_BLUE }}>
                  Thỏa thuận người dùng
                </h2>
                <p className="text-sm text-slate-600">
                  Bằng việc truy cập, bạn đồng ý tuân thủ các quy định của chúng tôi.
                </p>
              </div>
            </div>

            <article className="max-w-none">
              <section className="mb-8">
                <h3 className="mb-4 flex items-center text-xl font-bold" style={{ color: ORCA_BLUE }}>
                  <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm text-blue-700">
                    01
                  </span>
                  Chấp nhận điều khoản
                </h3>
                <p className="pl-11 leading-relaxed text-slate-600">
                  Khi truy cập và sử dụng dịch vụ của Orca Việt Nam, bạn xác nhận rằng mình đã đọc, hiểu
                  và đồng ý bị ràng buộc bởi các điều khoản này. Nếu bạn không đồng ý với bất kỳ phần
                  nào, vui lòng ngừng sử dụng dịch vụ ngay lập tức.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="mb-4 flex items-center text-xl font-bold" style={{ color: ORCA_BLUE }}>
                  <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm text-blue-700">
                    02
                  </span>
                  Tài khoản và Bảo mật
                </h3>
                <p className="pl-11 leading-relaxed text-slate-600">
                  Dịch vụ yêu cầu đăng nhập qua Google để định danh. Bạn có trách nhiệm bảo mật thông tin
                  tài khoản của mình. Mọi hoạt động diễn ra dưới tài khoản của bạn sẽ được coi là trách
                  nhiệm cá nhân của bạn.
                </p>
              </section>

              <section className="mb-8 rounded-xl border-2 border-amber-100 bg-amber-50 p-6">
                <h3 className="mb-4 flex items-center text-xl font-bold text-amber-800">
                  <TriangleAlert className="mr-3 h-6 w-6 shrink-0" aria-hidden />
                  Miễn trừ trách nhiệm đầu tư
                </h3>
                <p className="leading-relaxed text-slate-700 italic">
                  Orca Việt Nam cung cấp thông tin và dữ liệu phân tích cổ phiếu chỉ với mục đích{' '}
                  <strong>tham khảo</strong>. Chúng tôi <strong>không</strong> cung cấp lời khuyên đầu tư
                  trực tiếp. Mọi quyết định giao dịch dựa trên thông tin từ hệ thống là trách nhiệm cuối
                  dùng của người dùng. Thị trường chứng khoán luôn có rủi ro, bạn nên cân nhắc kỹ trước
                  khi thực hiện.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="mb-4 flex items-center text-xl font-bold" style={{ color: ORCA_BLUE }}>
                  <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm text-blue-700">
                    03
                  </span>
                  Quyền sở hữu trí tuệ
                </h3>
                <p className="pl-11 leading-relaxed text-slate-600">
                  Toàn bộ nội dung, phân tích, thuật toán và giao diện trên hệ thống thuộc sở hữu độc
                  quyền của Orca Việt Nam. Nghiêm cấm mọi hành vi sao chép, trích xuất dữ liệu (scraping)
                  hoặc sử dụng nội dung cho mục đích thương mại khi chưa có sự đồng ý bằng văn bản.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="mb-4 flex items-center text-xl font-bold" style={{ color: ORCA_BLUE }}>
                  <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm text-blue-700">
                    04
                  </span>
                  Thay đổi điều khoản
                </h3>
                <p className="pl-11 leading-relaxed text-slate-600">
                  Chúng tôi có quyền cập nhật các điều khoản này bất kỳ lúc nào để phù hợp với sự phát
                  triển của dịch vụ. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên trang này.
                </p>
              </section>
            </article>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export default TermsOfService;
