Column	Data type	Null	Description
Id	nvarchar(36)	No	Mã người dùng
Email	nvarchar(255)	No	Email người dùng
Phone	nvarchar(50)	Yes	Số điện thoại
password_hash	nvarchar(255)	Yes	Mật khẩu đã hash
Role	enum	No	Quyền người dùng (guest, customer…)
is_email_verified	bit	No	Trạng thái email đã xác thực
created_at	datetime	No	Thời gian tạo
updated_at	datetime	Yes	Thời gian cập nhật
deleted_at	datetime	Yes	Thời gian xóa bản ghi
Version	int	No	Phiên bản bản ghi

2.2.2.	AuthRefreshTokens: lưu các refresh token của người dùng, thông tin thiết bị, IP, thời gian phát hành và hết hạn, trạng thái token, và token thay thế nếu xoay vòng.
Column	Data type	Null	Description
Id	nvarchar(36)	No	ID token
user_id	nvarchar(36)	No	Người dùng sở hữu token
Token	nvarchar(255)	No	Refresh token
device_info	nvarchar(255)	Yes	Thông tin thiết bị / user agent
ip_address	nvarchar(50)	Yes	Địa chỉ IP
issued_at	datetime	No	Thời gian cấp token
expires_at	datetime	Yes	Thời gian hết hạn
status	enum	No	Trạng thái token (active, revoked…)
revoked_at	datetime	Yes	Thời gian bị thu hồi
replaced_by	nvarchar(36)	Yes	Token thay thế
created_at	datetime	No	Thời gian tạo bản ghi
updated_at	datetime	Yes	Thời gian cập nhật bản ghi

2.2.3.	Profiles: thông tin chi tiết của người dùng, bao gồm tên hiển thị, avatar, giới tính, chiều cao, cân nặng, đơn vị đo, tiểu sử và mục tiêu cá nhân.
Column	Data type	Null	Description
Id	nvarchar(36)	No	ID profile
user_id	nvarchar(36)	No	ID người dùng
display_name	nvarchar(255)	Yes	Tên hiển thị
avatar_url	nvarchar(512)	Yes	URL avatar
birth_date	date	Yes	Ngày sinh
Gender	nvarchar(50)	Yes	Giới tính
height_cm	int	Yes	Chiều cao (cm)
weight_kg	decimal(6,2)	Yes	Cân nặng (kg)
Unit	enum	Yes	Hệ đo lường (metric/imperial)
Bio	text	Yes	Tiểu sử / mô tả
Goals	json	Yes	Mục tiêu người dùng
created_at	datetime	No	Thời gian tạo
updated_at	datetime	Yes	Thời gian cập nhật
Version	int	No	Phiên bản bản ghi

2.2.4.	Bmi_Records: dùng để chứa thông số BMI của người dùng.
Column	Data type	Null	Description
Id	nvarchar(36)	No	ID bản ghi BMI
user_id	nvarchar(36)	No	Người dùng
height_cm	int	Yes	Chiều cao (cm)
weight_kg	decimal(6,2)	Yes	Cân nặng (kg)
Bmi	decimal(6,2)	Yes	Giá trị BMI
Assessment	nvarchar(255)	Yes	Đánh giá (Normal, Overweight…)
measured_at	datetime	No	Thời gian đo
created_at	datetime	No	Thời gian tạo bản ghi

2.2.5.	Food_Items: dùng để chứa thông tin các món ăn , cùng thông số.
Column	Data type	Null	Description
Id	nvarchar(36)	No	ID món ăn
Name	nvarchar(255)	Yes	Tên món ăn
serving_size	nvarchar(100)	Yes	Kích thước khẩu phần
serving_amount	int	Yes	Số lượng khẩu phần
calories_kcal	int	Yes	Lượng calo
protein_g	decimal(6,2)	Yes	Protein (g)
carbs_g	decimal(6,2)	Yes	Carbs (g)
fat_g	decimal(6,2)	Yes	Chất béo (g)
fiber_g	decimal(6,2)	Yes	Chất xơ (g)
sodium_mg	int	Yes	Natri (mg)
Micronutrients	json	Yes	Các vi chất
created_at	datetime	No	Thời gian tạo
updated_at	datetime	Yes	Thời gian cập nhật

2.2.6.	Nutrition_Plans: kế hoạch dinh dưỡng của người dùng hoặc do coach/admin tạo, bao gồm calo mục tiêu, phân bố macro, thời gian, và quyền truy cập.
Column	Data type	Null	Description
id	nvarchar(36)	No	ID kế hoạch
owner_user_id	nvarchar(36)	No	Người tạo kế hoạch
title	nvarchar(255)	Yes	Tiêu đề kế hoạch
description	Text	Yes	Mô tả kế hoạch
calories_target_kcal	Int	Yes	Lượng calo mục tiêu
macros	Json	Yes	Phân bố dinh dưỡng
start_date	Date	Yes	Ngày bắt đầu
end_date	Date	Yes	Ngày kết thúc
visibility	nvarchar(50)	Yes	Quyền truy cập (private/public…)
created_at	datetime	No	Thời gian tạo
updated_at	datetime	Yes	Thời gian cập nhật

2.2.7.	Nutrition_Plans_Items: các món ăn thuộc kế hoạch dinh dưỡng, thời gian bữa ăn, số khẩu phần, ghi chú.
Column	Data type	Null	Description
id	nvarchar(36)	No	ID món ăn trong kế hoạch
plan_id	nvarchar(36)	No	ID kế hoạch
meal_time	nvarchar(50)	Yes	Thời gian bữa ăn (breakfast/lunch…)
food_item_id	nvarchar(36)	No	ID món ăn
serving_count	decimal(6,2)	Yes	Số lượng khẩu phần
notes	text	Yes	Ghi chú
created_at	datetime	No	Thời gian tạo

2.2.8.	Exercise_Library: thư viện bài tập, thông tin cơ chính/phụ, thiết bị, độ khó, video, hình ảnh minh họa, người tạo.
Column	Data type	Null	Description
Column	Data type	Null	Description
id	nvarchar(36)	No	ID bài tập
title	nvarchar(255)	Yes	Tiêu đề bài tập
description	text	Yes	Mô tả bài tập
primary_muscle	nvarchar(100)	Yes	Cơ chính
secondary_muscles	nvarchar(255)	Yes	Các cơ phụ
equipment	nvarchar(255)	Yes	Thiết bị sử dụng
difficulty	nvarchar(50)	Yes	Độ khó
video_url	nvarchar(512)	Yes	Link video hướng dẫn
images	json	Yes	Hình ảnh minh họa
created_by	nvarchar(36)	No	Người tạo bài tập
created_at	datetime	No	Thời gian tạo
updated_at	datetime	Yes	Thời gian cập nhật

2.2.9.	Exercise_tags: các nhãn/tag liên kết với bài tập, phục vụ tìm kiếm và phân loại.
Column	Data type	Null	Description
id	nvarchar(36)	No	ID tag
exercise_id	nvarchar(36)	No	ID bài tập
tag	nvarchar(100)	Yes	Nhãn / từ khóa

2.2.10.	Workouts: bài tập do người dùng hoặc coach tạo, gồm tiêu đề, mô tả, thời lượng, cường độ, thời gian tạo/cập nhật.
Column	Data type	Null	Description
id	nvarchar(36)	No	ID workout
owner_user_id	nvarchar(36)	No	Người tạo workout
title	nvarchar(255)	Yes	Tiêu đề workout
description	text	Yes	Mô tả workout
duration_min	int	Yes	Thời lượng (phút)
intensity	nvarchar(50)	Yes	Cường độ
created_at	datetime	No	Thời gian tạo
updated_at	datetime	Yes	Thời gian cập nhật

2.2.11.	Workout_Exercises: Các bài tập chi tiết trong workout, số set, reps, thứ tự, nghỉ, tempo, ghi chú.
Column	Data type	Null	Description
id	nvarchar(36)	No	ID chi tiết bài tập
workout_id	nvarchar(36)	No	ID workout
exercise_id	nvarchar(36)	No	ID bài tập
order_index	int	Yes	Thứ tự tập
sets	int	Yes	Số set
reps	nvarchar(50)	Yes	Số reps / kiểu reps
rest_seconds	int	Yes	Thời gian nghỉ (giây)
tempo	nvarchar(50)	Yes	Nhịp độ tập
notes	text	Yes	Ghi chú

2.2.12.	Workout_Schedules: lịch tập của người dùng, bao gồm workout, ngày/giờ, trạng thái (planned/completed/skipped), thời gian hoàn thành.
Column	Data type	Null	Description
id	nvarchar(36)	No	ID lịch tập
user_id	nvarchar(36)	No	Người dùng
workout_id	nvarchar(36)	No	ID workout
scheduled_date	date	Yes	Ngày lên lịch
scheduled_time	time	Yes	Thời gian lên lịch
status	nvarchar(50)	Yes	Trạng thái (planned/completed…)
completed_at	datetime	Yes	Thời gian hoàn thành
created_at	datetime	No	Thời gian tạo

2.2.13.	Progress_Entries: ghi nhận tiến trình người dùng, gồm loại (weight, bmi, photo…), giá trị số, văn bản, ảnh, thời gian ghi nhận.
Column	Data type	Null	Description
id	nvarchar(36)	No	ID bản ghi
user_id	nvarchar(36)	No	Người dùng
type	nvarchar(50)	Yes	Loại tiến trình (weight, bmi, photo…)
recorded_at	datetime	No	Thời gian ghi nhận
numeric_value	decimal(10,3)	Yes	Giá trị số
text_value	text	Yes	Giá trị chữ
photo_url	nvarchar(512)	Yes	URL ảnh
created_at	datetime	No	Thời gian tạo bản ghi

2.2.14.	Challenges: thử thách (challenge) do người dùng hoặc coach tạo, bao gồm tiêu đề, mô tả, thời gian, quy tắc, phần thưởng, strike, thời gian tạo/cập nhật.
Column	Data type	Null	Description
id	nvarchar(36)	No	ID thử thách
title	nvarchar(255)	Yes	Tiêu đề thử thách
description	text	Yes	Mô tả thử thách
start_date	date	Yes	Ngày bắt đầu
end_date	date	Yes	Ngày kết thúc
created_by	nvarchar(36)	No	Người tạo thử thách
strike	bigint	Yes	Số ngày/chuỗi cần hoàn thành
rules	json	Yes	Quy tắc thử thách
reward	json	Yes	Phần thưởng
created_at	datetime	No	Thời gian tạo
updated_at	datetime	Yes	Thời gian cập nhật

2.2.15.	Challenge_Participants: người dùng tham gia thử thách, trạng thái, tiến trình, kết quả cuối cùng, thời gian tham gia.
Column	Data type	Null	Description
id	nvarchar(36)	No	ID người tham gia
challenge_id	nvarchar(36)	No	ID thử thách
user_id	nvarchar(36)	No	Người dùng
joined_at	datetime	No	Thời gian tham gia
status	nvarchar(50)	Yes	Trạng thái (active/completed…)
progress	json	Yes	Tiến trình
final_result	json	Yes	Kết quả cuối cùng
created_at	datetime	No	Thời gian tạo

2.2.16.	Messages: lưu trữ tin nhắn giữa người dùng, bao gồm phòng chat/channel, người gửi, nội dung, loại nội dung (text/photo/video), tập tin đính kèm, thời gian tạo.
Column	Data type	Null	Description
Id	nvarchar(36)	No	ID tin nhắn
channel_id	nvarchar(36)	Yes	ID kênh / phòng chat
sender_id	nvarchar(36)	No	Người gửi
Content	text	Yes	Nội dung tin nhắn
content_type	nvarchar(50)	Yes	Loại nội dung (text/photo/video)
attachments	json	Yes	Tập tin đính kèm
created_at	datetime	No	Thời gian tạo

2.2.17.	Reviews: bảng lưu các lượt đánh giá.
Column	Data type	Null	Description
Id	nvarchar(36)	No	ID đánh giá
reviewer_id	nvarchar(36)	No	Người đánh giá
target_user_id	nvarchar(36)	No	Người được đánh giá
rating	int	Yes	Điểm đánh giá (1-5)
content	text	Yes	Nội dung đánh giá
created_at	datetime	No	Thời gian tạo
updated_at	datetime	Yes	Thời gian cập nhật

2.2.18.	Notifications: bảng lưu các thông báo.
Column	Data type	Null	Description
Id	nvarchar(36)	No	ID thông báo
user_id	nvarchar(36)	No	Người nhận thông báo
title	nvarchar(255)	Yes	Tiêu đề thông báo
body	text	Yes	Nội dung thông báo
data	json	Yes	Dữ liệu kèm theo (metadata)
type	nvarchar(50)	Yes	Loại thông báo
is_read	bit	Yes	Trạng thái đã đọc
created_at	datetime	No	Thời gian tạo
read_at	datetime	Yes	Thời gian đọc

2.2.19.	PostLikes: các lượt thích bài đăng
 
Column	Data type	Null	Description
Id	nvarchar(36)	No	ID lượt thích
post_id	nvarchar(36)	No	Bài viết liên quan
user_id	nvarchar(36)	No	Người thích
created_at	datetime	No	Thời gian thích

2.2.20.	PostComments: các bình luận của người dung trong bài đăng.
Column	Data type	Null	Description
Id	nvarchar(36)	No	ID bình luận
post_id	nvarchar(36)	No	Bài viết liên quan
user_id	nvarchar(36)	No	Người bình luận
content	text	Yes	Nội dung bình luận
created_at	datetime	No	Thời gian tạo

2.2.21.	Posts: thông tin của bài đăng trong hệ thống
Column	Data type	Null	Description
Id	nvarchar(36)	No	ID bài viết
user_id	nvarchar(36)	No	Người tạo bài viết
content	text	Yes	Nội dung bài viết
media	json	Yes	Hình ảnh, video hoặc file đính kèm
visibility	nvarchar(50)	Yes	Quyền hiển thị (public/private…)
like_count	int	Yes	Số lượt thích
comment_count	int	Yes	Số bình luận
created_at	datetime	No	Thời gian tạo
updated_at	datetime	Yes	Thời gian cập nhật cuối cùng

2.2.22.	User_Followers:  quan hệ theo dõi giữa người dùng, ai theo ai, thời gian tạo quan hệ.
Column	Data type	Null	Description
id	nvarchar(36)	No	ID quan hệ theo dõi
user_id	nvarchar(36)	No	Người được theo dõi
follower_id	nvarchar(36)	No	Người theo dõi
created_at	datetime	No	Thời gian tạo

2.2.23.	User_Settings: cài đặt cá nhân của người dùng, bao gồm sở thích, thông báo, thời gian tạo và cập nhật.
Column	Data type	Null	Description
id	nvarchar(36)	No	ID cài đặt người dùng
user_id	nvarchar(36)	No	Người dùng
preferences	json	Yes	Sở thích người dùng
notification_prefs	json	Yes	Cài đặt thông báo
created_at	datetime	No	Thời gian tạo
updated_at	datetime	Yes	Thời gian cập nhật

2.2.24.	Stats_User_Weekly: thống kê hàng tuần của người dùng, gồm số workout hoàn thành, calo ước tính, số bước đi, tuần bắt đầu, thời gian tạo.
Column	Data type	Null	Description
id	nvarchar(36)	No	ID thống kê tuần
user_id	nvarchar(36)	No	Người dùng
week_start	date	Yes	Ngày bắt đầu tuần
workouts_completed	int	Yes	Số bài tập đã hoàn thành
calories_burned_est	int	Yes	Calories tiêu thụ ước tính
steps	int	Yes	Số bước đi
created_at	datetime	No	Thời gian tạo
 