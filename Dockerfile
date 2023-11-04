# 使用官方 Node.js 基礎映像
FROM node:18.17.1

# 設定工作目錄
WORKDIR /app

# 複製應用程式依賴文件並安裝
COPY package.json ./
RUN npm install

# 複製應用程式文件到工作目錄
COPY . .

# 暴露端口
EXPOSE 3000

# 定義啟動命令
CMD ["node", "server.js"]
