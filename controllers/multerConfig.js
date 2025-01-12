const multer = require('multer');
const path = require('path');

module.exports = function (uploadPath) {
  // Cấu hình Multer để lưu ảnh vào thư mục chỉ định
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath); // Đường dẫn lưu ảnh do người dùng chỉ định
    },
    filename: function (req, file, cb) {
      // Đặt tên file theo thời gian để tránh trùng lặp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  // Khởi tạo Multer với cấu hình trên
  return multer({ storage: storage });
};
