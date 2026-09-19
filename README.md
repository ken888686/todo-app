# Todo App 📝

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black.svg?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-19.3-blue.svg?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/) [![Prisma](https://img.shields.io/badge/Prisma-7.10-dark-green.svg?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-blue.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

This is a modern, responsive Todo application built with **Next.js 16 (App Router)**, **Prisma 7**, and **PostgreSQL**.

## ✨ Key Features

- **Authentication**: Secure user authentication powered by **Better Auth**.
- **Social Login**: Support for Google Login out of the box.
- **Personalized Data**: Each user's todo items are isolated and securely stored.
- **Item Management**: Easily add, edit, and delete todo items.
- **Inline Editing**: Click on an item's title to edit it directly, and save quickly with the `Enter` key.
- **Status Tracking**: Quickly switch an item's status between `PENDING` or `DONE`.
- **Smart Integrated Input**: A single input field serves both "Search" and "Add" functionalities. It filters items in real-time as you type, and allows direct addition of a new item if no matches are found, significantly enhancing operational efficiency.
- **Smart Sorting**: Items are automatically sorted by status (`PENDING` first), title (alphabetical order), and creation time.
- **Due-date Tracking**: New items receive a due date 1 day in the future by default, with overdue status shown for unfinished items.
- **Responsive Design**: Built with **Tailwind CSS v4** and **Radix UI**, ensuring seamless operation on mobile and desktop.
- **Type Safety**: Utilizes TypeScript and Prisma's auto-generated types to ensure end-to-end development safety.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16.3](https://nextjs.org/) (App Router)
- **Authentication**: [Better Auth 1.7](https://www.better-auth.com/)
- **Frontend Library**: [React 19.3](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma 7.10](https://www.prisma.io/) (with `@prisma/adapter-pg`)
- **Icons**: [@deemlol/next-icons](https://www.npmjs.com/package/@deemlol/next-icons)
- **Linting/Formatting**: [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)

## 🚀 Quick Start

### Prerequisites

- Node.js (v20 or above)
- PostgreSQL database instance

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd todo-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Variables Setup**
   Create a `.env` file in the root directory and add your PostgreSQL connection string:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/todo_app"

   # Better Auth Configuration
   BETTER_AUTH_SECRET="your_better_auth_secret_here"
   NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

   # Google OAuth
   GOOGLE_CLIENT_ID="your_google_client_id_here"
   GOOGLE_CLIENT_SECRET="your_google_client_secret_here"
   ```

4. **Database Initialization**
   Generate Prisma Client and apply versioned migrations:

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

   For a database that was originally created with `prisma db push`, do not
   run `migrate deploy` until you have verified that its schema matches the
   baseline. Mark the baseline as applied first:

   ```bash
   npx prisma migrate resolve --applied 20260919000100_baseline
   ```

   New databases can use `npx prisma migrate deploy` directly.

   The migrations enforce one case-insensitive todo title per user. If the
   existing database contains duplicate titles for the same user, resolve
   those duplicates before applying the latest migration.

5. **Start the Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to start using the app.

### Quality Checks

```bash
npm run test
npm run lint
npm run typecheck
npm run prisma:validate
npm run build
```

## 📂 Project Structure

```tree
/
├── app/                # Next.js App Router pages and routes
├── components/         # Reusable React components (including shadcn/ui)
├── lib/                # Utility functions, Server Actions (actions.ts), DB client
├── prisma/             # Database Schema definition (schema.prisma)
├── public/             # Static assets
└── ...                 # Configuration files
```

## 📝 License

This project is licensed under the MIT License.
