# Shopping List App 🛒

這是一個使用 **Next.js 16 (App Router)**、**Prisma 7** 和 **PostgreSQL** 構建的現代化、響應式購物清單應用程式。

## ✨ 主要功能

- **項目管理**：輕鬆新增、編輯和刪除購物清單項目。
- **行內編輯**：點擊項目標題即可直接進行編輯，並透過 Enter 鍵快速保存。
- **狀態追蹤**：快速切換項目的 `PENDING`（待辦）或 `DONE`（已完成）狀態。
- **搜尋與過濾**：單一輸入框結合「搜尋」與「新增」功能，輸入時自動執行實時過濾，避免重複添加。
- **智慧排序**：項目會依據狀態（Pending 優先）、標題（字母順序）及創建時間自動排序。
- **自動過期追蹤**：新項目預設會在 1 天後過期，方便追蹤新鮮度或時效。
- **響應式設計**：基於 **Tailwind CSS v4** 和 **Radix UI** 打造，支援行動端與桌面端無縫操作。
- **類型安全**：使用 TypeScript 與 Prisma 自動生成的類型，確保端到端開發的安全性。

## 🛠️ 技術棧

- **框架**: [Next.js 16](https://nextjs.org/) (App Router)
- **前端庫**: [React 19](https://react.dev/)
- **樣式**: [Tailwind CSS v4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/)
- **資料庫**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma 7](https://www.prisma.io/) (搭配 `@prisma/adapter-pg`)
- **圖標**: [Lucide React](https://lucide.dev/)

## 🚀 快速開始

### 必要條件

- Node.js (建議 v20 或以上)
- PostgreSQL 資料庫實例

### 安裝步驟

1. **複製專案**

    ```bash
    git clone <repository-url>
    cd todo-app
    ```

2. **安裝依賴**

    ```bash
    npm install
    ```

3. **環境變數設置**

    在根目錄創建 `.env` 文件，並添加你的 PostgreSQL 連接字串：

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/todo_app"
    ```

4. **資料庫初始化**

    將 Prisma 模型推送到資料庫：

    ```bash
    npx prisma db push
    ```

5. **啟動開發伺服器**

    ```bash
    npm run dev
    ```

    開啟 [http://localhost:3000](http://localhost:3000) 即可開始使用。

## 📂 專案結構

- `app/`: Next.js App Router 頁面與佈局。
- `components/`: 可重用的 UI 元件（如 `TodoList` 及 shadcn/ui 基礎元件）。
- `lib/`: 工具函式、Server Actions (`actions.ts`) 及 Prisma 客戶端配置。
- `prisma/`: 資料庫 Schema 定義。

## 📝 執照

本專案採用 MIT 執照。
