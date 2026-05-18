## Yêu cầu hệ thống (Prerequisites)
Đảm bảo máy tính của bạn đã cài đặt:
* Git
* Node.js (phiên bản 18.x trở lên) hoặc [Môi trường chạy code của bạn]

## `npm install` hoặc `yarn`
* Tải tập tin và thư viện cần thiết để chạy dự án

## `npm start` hoặc `yarn start`
* chạy dự án ở local port http://localhost:3000/

## Để sử dụng eslint và prettier để format code
* Tải extensions eslint, prettier ở vscode 
* Thêm lệnh sau vào setting.json trong vscode studio:
```
    "eslint.run": "onSave",
    "eslint.format.enable": true,
    "editor.codeActionsOnSave": {
        "source.fixAll": "explicit"
    },
    "[javascript]": {
        "editor.defaultFormatter": "dbaeumer.vscode-eslint"
    }
```

## Đặt tên branch
* Cấu trúc phổ biến:
* `mục-đích/mô-tả-ngắn-gọn` hoặc `mục-đích/mã-lỗi-mô-tả`
* VD: `feature/add-student-list`

## Đặt tên commit
* `<loại>(<phạm vi - không bắt buộc>): <mô tả ngắn gọn>`
* VD: `fix(ui): resolve overlapping buttons on mobile`
