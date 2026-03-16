***'npm install' hoặc 'yarn'***
    Để tải tập tin và thư viện cần thiết để chạy dự án

***'npm start' hoặc 'yarn start'***
    Để chạy dự án ở local port http://localhost:3000/

***Để sử dụng eslint và prettier để format code***
  - Tải extensions eslint, prettier ở vscode 
  - Thêm lệnh sau vào setting.json:

    "eslint.run": "onSave",
    "eslint.format.enable": true,
    "editor.codeActionsOnSave": {
        "source.fixAll": "explicit"
    },
    "[javascript]": {
        "editor.defaultFormatter": "dbaeumer.vscode-eslint"
    }
