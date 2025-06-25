# Frontend – Project Manager App

This is the **frontend** part of the Project Management System, built using **Next.js 15**, **React 19**, and **TypeScript**.



## 💡 Features

- User-friendly Kanban board
- Add/edit/delete tasks via modals
- Drag-and-drop task handling (with state update)
- Task files, comments, and history view
- Profile, Teams, Time Tracking, Projects pages
- Responsive and clean UI with Tailwind CSS
- Integrated with backend API (via Axios)

## 🛠️ Tech Stack

- React 19
- Next.js 15
- TypeScript
- Tailwind CSS 4
- Zustand (state management)
- Axios (API communication)
- Recharts (data visualization)
- Lucide React (icons)

## 📁 Project Structure


frontend/

├── public/

├── src/

│      ├── app/# Next.js app pages

│      ├── components/     # Shared UI components

│      ├── lib/            # API utilities and types

│      └── styles/         # Global styles

├── .env.local

├── package.json

└── tailwind.config.ts

## 📦 Install & Run

1. Install dependencies:

```bash
npm install
npm run dev
