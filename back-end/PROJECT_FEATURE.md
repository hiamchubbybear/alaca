# ===============================================
# AI Automation / Feature Testing Prompts
# Dựa trên PB01–PB23
# ===============================================

# -----------------------------------------------
# PB01 – Đăng ký
# -----------------------------------------------
# Prompt Claude:
"""
Hãy tạo một người dùng mới với thông tin:
- Email: testuser@example.com
- Password: Password123!
- Username: "testuser"
Mô phỏng quá trình đăng ký và trả về thông tin userId và token nếu thành công.
"""

# -----------------------------------------------
# PB02 – Đăng nhập
# -----------------------------------------------
"""
Đăng nhập bằng tài khoản đã tạo ở PB01:
- Email: testuser@example.com
- Password: Password123!
Trả về token xác thực và refresh token.
"""

# -----------------------------------------------
# PB03 – Đăng xuất
# -----------------------------------------------
"""
Sử dụng token của PB02, thực hiện logout.
Mô phỏng việc token bị vô hiệu hóa và không thể dùng để truy cập.
"""

# -----------------------------------------------
# PB04 – Quên mật khẩu
# -----------------------------------------------
"""
Mô phỏng yêu cầu reset mật khẩu cho user "testuser@example.com".
Trả về link hoặc mã xác thực tạm thời để đổi password.
"""

# -----------------------------------------------
# PB05 – Tính BMI & đánh giá
# -----------------------------------------------
"""
Nhập dữ liệu:
- Chiều cao: 180 cm
- Cân nặng: 75 kg
Tính BMI và phân loại tình trạng cơ thể theo chuẩn:
- Dưới 18.5: Gầy
- 18.5–24.9: Bình thường
- 25–29.9: Thừa cân
- >=30: Béo phì

Nâng cấp:
- Tính luôn tỷ lệ mỡ cơ thể giả lập dựa trên BMI và giới tính
- Trả về lời khuyên ngắn về chế độ tập luyện và dinh dưỡng phù hợp
"""

# -----------------------------------------------
# PB06 – Tra cứu nhóm cơ
# -----------------------------------------------
"""
Hiển thị sơ đồ các nhóm cơ chính trên cơ thể:
- Ngực, Lưng, Tay, Chân, Vai, Bụng
Mỗi nhóm có:
- Tên, vị trí trên sơ đồ
- Ví dụ bài tập liên quan
- Mức độ khó và lời khuyên khi tập luyện
"""

# -----------------------------------------------
# PB07 – Quản lý hồ sơ cá nhân
# -----------------------------------------------
"""
Hiển thị và cập nhật thông tin profile của user:
- DisplayName, Avatar, Ngày sinh, Giới tính, Bio
Nâng cấp:
- Cho phép thêm thông tin sức khỏe khác: cân nặng, chiều cao, mục tiêu tập luyện
- Trả về thông báo xác nhận khi update thành công
"""

# -----------------------------------------------
# PB08 – Quản lý kế hoạch tập luyện
# -----------------------------------------------
"""
Tạo hoặc gợi ý lịch tập luyện cá nhân hóa dựa trên:
- Tình trạng cơ thể (BMI, mỡ cơ thể)
- Mục tiêu (giảm cân, tăng cơ, duy trì)
- Thời gian rảnh mỗi ngày
Trả về:
- Lịch tập tuần (tên bài tập, số hiệp, số lần)
- Thời lượng ước tính mỗi buổi
- Mức độ khó tương ứng
"""

# -----------------------------------------------
# PB09 – Quản lý kế hoạch dinh dưỡng
# -----------------------------------------------
"""
Gợi ý khẩu phần ăn cá nhân hóa theo mục tiêu:
- Tổng calo hàng ngày
- Tỉ lệ protein / carb / fat
- Bữa ăn gợi ý cho 3 bữa chính + 2 bữa phụ
Trả về:
- Danh sách món ăn với lượng định lượng
- Lời khuyên thay thế nếu không có thực phẩm
"""

# -----------------------------------------------
# PB10 – Theo dõi tiến độ
# -----------------------------------------------
"""
Mô phỏng ghi nhận tiến độ tập luyện:
- Buổi tập: tên bài tập, ngày, cảm nhận, số lần / hiệp
- Cân nặng, số đo (ngực, eo, hông)
Trả về:
- Biểu đồ tiến độ (giả lập) BMI và cân nặng
- Đánh giá tổng quan sự cải thiện
"""

# -----------------------------------------------
# PB11 – Tham gia thử thách
# -----------------------------------------------
"""
Tham gia thử thách như:
- Số buổi tập / tuần
- Số bước / ngày
- Calo tiêu thụ
Trả về:
- Trạng thái hoàn thành, phần thưởng ảo
- Xếp hạng người tham gia
"""

# -----------------------------------------------
# PB12 – Chat / chia sẻ cộng đồng
# -----------------------------------------------
"""
Mô phỏng chức năng chat cộng đồng:
- Post một cập nhật tiến độ
- Bình luận, hỏi đáp người dùng khác
Trả về:
- Danh sách bài viết gần đây
- Thông báo phản hồi từ người dùng khác
"""

# -----------------------------------------------
# PB13 – Tư vấn chatbot AI
# -----------------------------------------------
"""
Chat với AI về:
- Lịch tập, dinh dưỡng
- BMI và tình trạng sức khỏe
- Hướng dẫn sử dụng hệ thống
Trả về:
- Câu trả lời chi tiết, có gợi ý cá nhân hóa
"""

# -----------------------------------------------
# PB14 – Quản lý bài đăng cá nhân
# -----------------------------------------------
"""
Hiển thị bài viết cá nhân:
- Danh sách bài đăng đã tạo
- Chỉnh sửa / xóa bài đăng
Trả về:
- Trạng thái thành công khi thay đổi
- Danh sách cập nhật
"""

# -----------------------------------------------
# PB15 – Đánh giá bài tập
# -----------------------------------------------
"""
Đánh giá bài tập:
- Điểm / số sao
- Bình luận
Trả về:
- Thống kê điểm trung bình
- Gợi ý bài tập tương tự dựa trên sở thích
"""

# -----------------------------------------------
# PB16 – Quản lý người dùng (Admin)
# -----------------------------------------------
"""
Xem/sửa/khoá/mở tài khoản:
- Danh sách user hiện có
- Thay đổi quyền: User/Admin
- Khóa / mở tài khoản
Trả về: xác nhận trạng thái sau mỗi thao tác
"""

# -----------------------------------------------
# PB17 – Quản lý thư viện bài tập (Admin)
# -----------------------------------------------
"""
Thêm/sửa/xóa bài tập, nhóm cơ, cấp độ, hình ảnh/video hướng dẫn
Trả về:
- Danh sách cập nhật bài tập
- Xác nhận thành công thao tác
"""

# -----------------------------------------------
# PB18 – Quản lý dữ liệu dinh dưỡng (Admin)
# -----------------------------------------------
"""
Thêm/sửa/xóa thực phẩm:
- Thông tin calo, protein, carb, fat
- Gợi ý khẩu phần
Trả về:
- Danh sách thực phẩm cập nhật
- Xác nhận thao tác thành công
"""

# -----------------------------------------------
# PB19 – Quản lý thử thách (Admin)
# -----------------------------------------------
"""
Tạo/sửa/xóa challenge:
- Tên thử thách, loại, điều kiện hoàn thành
- Kiểm soát nội dung cộng đồng
Trả về:
- Danh sách challenge
- Xác nhận thành công thao tác
"""

# -----------------------------------------------
# PB20 – Quản lý thông báo (Admin)
# -----------------------------------------------
"""
Tạo thông báo hệ thống:
- Nội dung, nhóm người nhận, thời gian
Trả về:
- Xác nhận gửi thông báo thành công
- Danh sách thông báo đã tạo
"""

# -----------------------------------------------
# PB21 – Quản lý bài đăng (Admin)
# -----------------------------------------------
"""
Xét duyệt bài đăng user:
- Xem nội dung, ảnh/video
- Duyệt / từ chối
Trả về:
- Trạng thái duyệt bài
- Lý do nếu từ chối
"""

# -----------------------------------------------
# PB22 – Quản lý đánh giá (Admin)
# -----------------------------------------------
"""
Xem xét, duyệt đánh giá user:
- Nội dung, điểm, bình luận
Trả về:
- Trạng thái duyệt / từ chối
- Thống kê tổng hợp
"""

# -----------------------------------------------
# PB23 – Thống kê & báo cáo (Admin)
# -----------------------------------------------
"""
Xem thống kê người dùng:
- Số user active, tương tác
- Hiệu quả sử dụng tính năng
Trả về:
- Biểu đồ, báo cáo tóm tắt
- Gợi ý cải tiến tính năng / AI / nội dung
"""
