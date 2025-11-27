import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, Smartphone, Monitor, Shield, CheckCircle2, AlertTriangle } from "lucide-react";

export default function WalletGuide() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/auth")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-fredoka font-bold text-primary">
              Hướng Dẫn Kết Nối Ví Crypto
            </h1>
            <p className="text-muted-foreground font-comic">
              Đăng nhập Fun Planet bằng ví crypto của bạn
            </p>
          </div>
        </div>

        {/* Chuẩn Bị */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-fredoka text-xl">
              <Wallet className="w-6 h-6 text-primary" />
              1. Chuẩn Bị - Cài Đặt Ví
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 font-comic">
            <p className="font-bold text-primary">Chọn và cài đặt một trong các ví sau:</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-2xl">🦊</div>
                  <h3 className="font-bold text-orange-900">MetaMask (Ưu tiên)</h3>
                </div>
                <ul className="text-sm space-y-1 ml-6 list-disc text-orange-800">
                  <li>Web: Cài extension từ <span className="font-mono bg-white px-1 rounded">metamask.io</span></li>
                  <li>Mobile: Tải app từ App Store / Play Store</li>
                  <li>Tạo ví mới hoặc import ví có sẵn</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-2xl">💙</div>
                  <h3 className="font-bold text-blue-900">Coinbase Wallet</h3>
                </div>
                <ul className="text-sm space-y-1 ml-6 list-disc text-blue-800">
                  <li>Web: Cài extension từ <span className="font-mono bg-white px-1 rounded">wallet.coinbase.com</span></li>
                  <li>Mobile: Tải app Coinbase Wallet</li>
                  <li>Dễ dùng cho người mới</li>
                </ul>
              </div>

              <div className="p-4 bg-cyan-50 border-2 border-cyan-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-2xl">💎</div>
                  <h3 className="font-bold text-cyan-900">Trust Wallet</h3>
                </div>
                <ul className="text-sm space-y-1 ml-6 list-disc text-cyan-800">
                  <li>Mobile-first: Tải app Trust Wallet</li>
                  <li>Có extension cho Chrome</li>
                  <li>Hỗ trợ nhiều blockchain</li>
                </ul>
              </div>

              <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-2xl">🔗</div>
                  <h3 className="font-bold text-purple-900">WalletConnect</h3>
                </div>
                <ul className="text-sm space-y-1 ml-6 list-disc text-purple-800">
                  <li>Kết nối bất kỳ ví nào hỗ trợ WalletConnect</li>
                  <li>Quét QR code để kết nối</li>
                  <li>Linh hoạt nhất</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trên Web */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-fredoka text-xl">
              <Monitor className="w-6 h-6 text-primary" />
              2. Kết Nối Trên Web (Desktop)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 font-comic">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <p className="font-bold">Mở trình duyệt và truy cập Fun Planet</p>
                  <p className="text-sm text-muted-foreground">Vào trang <span className="font-mono bg-muted px-1 rounded">{window.location.origin}</span></p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <p className="font-bold">Nhấn vào thẻ ví bạn muốn kết nối</p>
                  <p className="text-sm text-muted-foreground">Ví dụ: Nhấn vào thẻ "MetaMask" 🦊</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <p className="font-bold">Chọn ví từ popup hiện ra</p>
                  <p className="text-sm text-muted-foreground">Popup Web3Modal sẽ hiện danh sách các ví có thể kết nối</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">4</div>
                <div>
                  <p className="font-bold">Xác nhận kết nối trong ví</p>
                  <p className="text-sm text-muted-foreground">Extension ví sẽ bật lên, nhấn "Connect" hoặc "Kết nối"</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">5</div>
                <div>
                  <p className="font-bold">Nhập tên người dùng</p>
                  <p className="text-sm text-muted-foreground">Sau khi ví kết nối, nhập tên và nhấn "Đăng nhập / Đăng ký"</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-green-600">Hoàn tất!</p>
                  <p className="text-sm text-muted-foreground">Bạn đã vào được Fun Planet và có thể chơi game kiếm tiền!</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900 mb-2">Xử Lý Lỗi Thường Gặp:</p>
                  <ul className="text-sm space-y-1 text-amber-800 list-disc ml-4">
                    <li><span className="font-bold">Sai network:</span> Chuyển sang Ethereum hoặc Polygon trong ví của bạn</li>
                    <li><span className="font-bold">Ví không bật lên:</span> Reload trang, kiểm tra extension đã cài chưa</li>
                    <li><span className="font-bold">Từ chối kết nối:</span> Nhấn lại thẻ ví và Accept ở popup ví</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trên Mobile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-fredoka text-xl">
              <Smartphone className="w-6 h-6 text-primary" />
              3. Kết Nối Trên Mobile (iOS/Android)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 font-comic">
            <div className="p-4 bg-primary/5 border-2 border-primary/20 rounded-xl mb-4">
              <p className="font-bold text-primary mb-2">🎯 Có 2 cách kết nối trên mobile:</p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Cách 1: Dùng DApp Browser trong app ví (Dễ hơn, khuyên dùng)</li>
                <li>Cách 2: Mở web bằng trình duyệt thường và kết nối</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg text-primary">Cách 1: Dùng DApp Browser (Khuyên dùng) ⭐</h3>
              
              <div className="space-y-3 ml-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <p className="font-bold">Mở app ví trên điện thoại</p>
                    <p className="text-sm text-muted-foreground">Ví dụ: Mở app MetaMask hoặc Trust Wallet</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <p className="font-bold">Tìm Browser/DApp Browser</p>
                    <p className="text-sm text-muted-foreground">
                      • MetaMask: Nhấn nút 🧭 (Browser) ở thanh dưới<br />
                      • Trust Wallet: Nhấn tab "DApps" ở thanh dưới<br />
                      • Coinbase: Nhấn nút "Browser" hoặc "DApp"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <p className="font-bold">Nhập URL của Fun Planet</p>
                    <p className="text-sm text-muted-foreground">Gõ: <span className="font-mono bg-muted px-1 rounded">{window.location.origin}</span></p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div>
                    <p className="font-bold">Nhấn vào thẻ ví để kết nối</p>
                    <p className="text-sm text-muted-foreground">Ví sẽ tự động nhận diện và kết nối</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">5</div>
                  <div>
                    <p className="font-bold">Nhập tên và đăng nhập</p>
                    <p className="text-sm text-muted-foreground">Xong! Bắt đầu chơi game ngay!</p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border my-6"></div>

              <h3 className="font-bold text-lg text-primary">Cách 2: Dùng trình duyệt thường</h3>
              
              <div className="space-y-3 ml-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <p className="font-bold">Mở Safari (iOS) hoặc Chrome (Android)</p>
                    <p className="text-sm text-muted-foreground">Vào: <span className="font-mono bg-muted px-1 rounded">{window.location.origin}</span></p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <p className="font-bold">Nhấn vào thẻ ví bạn có</p>
                    <p className="text-sm text-muted-foreground">Ví dụ: Nhấn thẻ MetaMask</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <p className="font-bold">Popup sẽ hỏi mở app ví</p>
                    <p className="text-sm text-muted-foreground">Nhấn "Mở" hoặc "Open" để chuyển sang app ví</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div>
                    <p className="font-bold">Xác nhận kết nối trong app ví</p>
                    <p className="text-sm text-muted-foreground">Nhấn "Connect" khi ví hỏi</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold flex-shrink-0">5</div>
                  <div>
                    <p className="font-bold">Quay lại trình duyệt và nhập tên</p>
                    <p className="text-sm text-muted-foreground">Hoàn tất đăng nhập!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900 mb-2">Lỗi Trên Mobile:</p>
                  <ul className="text-sm space-y-1 text-amber-800 list-disc ml-4">
                    <li><span className="font-bold">Không mở được app ví:</span> Kiểm tra app ví đã cài chưa, thử cách 1 (DApp Browser)</li>
                    <li><span className="font-bold">Mất kết nối:</span> Dùng DApp Browser thay vì trình duyệt thường</li>
                    <li><span className="font-bold">Không nhấn được:</span> Zoom out trang web, hoặc xoay ngang màn hình</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quản Lý Nhiều Ví */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-fredoka text-xl">
              <Wallet className="w-6 h-6 text-primary" />
              4. Quản Lý Nhiều Ví
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 font-comic">
            <div className="space-y-3">
              <div>
                <p className="font-bold text-primary mb-2">Đổi ví đã kết nối:</p>
                <ul className="text-sm space-y-2 ml-4 list-disc">
                  <li>Sau khi ví kết nối, bạn sẽ thấy địa chỉ ví hiển thị</li>
                  <li>Nhấn nút "Đổi ví" để ngắt kết nối ví hiện tại</li>
                  <li>Chọn ví mới để kết nối</li>
                </ul>
              </div>

              <div>
                <p className="font-bold text-primary mb-2">Lưu session tự động:</p>
                <ul className="text-sm space-y-2 ml-4 list-disc">
                  <li>Sau lần đăng nhập đầu tiên, ví của bạn được nhớ</li>
                  <li>Lần sau mở Fun Planet, bạn tự động đăng nhập</li>
                  <li>Không cần kết nối ví lại mỗi lần</li>
                </ul>
              </div>

              <div>
                <p className="font-bold text-primary mb-2">Đăng xuất:</p>
                <ul className="text-sm space-y-2 ml-4 list-disc">
                  <li>Vào menu người dùng (góc trên bên phải)</li>
                  <li>Nhấn "Đăng xuất" để ngắt kết nối hoàn toàn</li>
                  <li>Hoặc ngắt kết nối trực tiếp trong app ví của bạn</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* An Toàn */}
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-fredoka text-xl text-red-700">
              <Shield className="w-6 h-6" />
              5. ⚠️ Lưu Ý An Toàn BẮT BUỘC
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 font-comic">
            <div className="space-y-3">
              <div className="p-3 bg-red-100 border-2 border-red-300 rounded-lg">
                <p className="font-bold text-red-900 mb-1">🔒 TUYỆT ĐỐI KHÔNG chia sẻ:</p>
                <ul className="text-sm space-y-1 text-red-800 ml-4 list-disc">
                  <li><span className="font-bold">Seed Phrase</span> (12-24 từ): Đây là chìa khóa ví, ai có = mất hết tiền!</li>
                  <li><span className="font-bold">Private Key</span>: Khóa riêng tư của ví</li>
                  <li><span className="font-bold">Mật khẩu ví</span>: Không nhập vào bất kỳ website nào trừ app ví</li>
                </ul>
              </div>

              <div className="p-3 bg-green-100 border-2 border-green-300 rounded-lg">
                <p className="font-bold text-green-900 mb-1">✅ An toàn khi kết nối:</p>
                <ul className="text-sm space-y-1 text-green-800 ml-4 list-disc">
                  <li>Kiểm tra URL: <span className="font-mono bg-white px-1 rounded">{window.location.origin}</span></li>
                  <li>Fun Planet chỉ xem địa chỉ ví, KHÔNG BAO GIỜ hỏi seed phrase</li>
                  <li>Bạn chỉ ký giao dịch khi rút tiền, không tự động mất tiền</li>
                </ul>
              </div>

              <div className="p-3 bg-blue-100 border-2 border-blue-300 rounded-lg">
                <p className="font-bold text-blue-900 mb-1">💡 Mẹo bảo mật:</p>
                <ul className="text-sm space-y-1 text-blue-800 ml-4 list-disc">
                  <li>Dùng ví riêng cho gaming (không chứa số tiền lớn)</li>
                  <li>Bookmark (đánh dấu) URL chính thức để tránh web giả</li>
                  <li>Luôn kiểm tra giao dịch trước khi ký trong ví</li>
                  <li>Bật 2FA và bảo mật ví bằng mật khẩu mạnh</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            onClick={() => navigate("/auth")}
            className="flex-1 text-lg py-6 font-bold gradient-animated text-white"
          >
            🚀 Bắt Đầu Kết Nối Ví Ngay
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="flex-1 text-lg py-6 font-bold"
          >
            🏠 Về Trang Chủ
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground font-comic pb-8">
          <p>Gặp vấn đề? Liên hệ hỗ trợ qua Discord hoặc Telegram của Fun Planet 💬</p>
        </div>
      </div>
    </div>
  );
}
