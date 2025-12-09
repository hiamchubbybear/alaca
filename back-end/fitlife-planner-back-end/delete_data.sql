SET FOREIGN_KEY_CHECKS = 0;

-- Xóa dữ liệu các bảng con trước hoặc xóa ngang khi đã tắt check FK
DELETE FROM WorkoutExercises;
DELETE FROM ExerciseTags;
DELETE FROM Workouts;
DELETE FROM ExerciseLibrary;
-- Xóa thêm các bảng khác nếu cần reset sạch
DELETE FROM WorkoutSchedules;
DELETE FROM ScheduledExercises;

SET FOREIGN_KEY_CHECKS = 1;
