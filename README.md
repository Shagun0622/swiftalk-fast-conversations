# 💬 Tars Chat — Real-time Messaging App

Tars Chat is a full-stack real-time messaging web application built with Next.js 14, TypeScript, Convex, and Clerk. It supports one-on-one direct messages and group chats with live message delivery using Convex WebSocket subscriptions. Features include Clerk authentication, online/offline presence indicators, typing indicators, unread message badges, message reactions, soft delete, smart auto-scroll, and a fully responsive mobile layout — 14 features total across both required and optional tracks.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Convex](https://img.shields.io/badge/Convex-realtime-orange?style=flat-square)
![Clerk](https://img.shields.io/badge/Clerk-auth-purple?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss)

---

## ✨ Features

### Core (Required)
| # | Feature | Description |
|---|---------|-------------|
| 1 | 🔐 **Authentication** | Sign up / login / logout via Clerk (email + Google) |
| 2 | 🔍 **User Search** | Search all users by name in real time |
| 3 | 💬 **Direct Messages** | Real-time 1-on-1 DMs using Convex subscriptions |
| 4 | 🕐 **Timestamps** | Smart formatting — time today, date+time older |
| 5 | 🌌 **Empty States** | Helpful messages when no conversations/messages/results |
| 6 | 📱 **Responsive Layout** | Desktop: sidebar + chat. Mobile: full-screen with back button |
| 7 | 🟢 **Online Status** | Live green dot indicator, updates every 10 seconds |
| 8 | ✍️ **Typing Indicator** | "Alex is typing..." with animated dots, auto-clears after 2s |
| 9 | 🔴 **Unread Badges** | Message count badge per conversation, clears on open |
| 10 | ⬇️ **Smart Auto-Scroll** | Auto-scrolls to latest message, shows "↓ New messages" button |

### Optional (Bonus)
| # | Feature | Description |
|---|---------|-------------|
| 11 | 🗑️ **Delete Messages** | Soft delete — shows "This message was deleted" |
| 12 | 😍 **Reactions** | React with 👍 ❤️ 😂 😮 😢, click again to remove |
| 13 | ⏳ **Loading States** | Skeleton loaders, spinners, error handling with retry |
| 14 | 👥 **Group Chat** | Create named group conversations with multiple members |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org) (App Router) |
| Language | [TypeScript](https://typescriptlang.org) |
| Backend / DB / Realtime | [Convex](https://convex.dev) |
| Authentication | [Clerk](https://clerk.com) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Deployment | [Vercel](https://vercel.com) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Convex](https://convex.dev) account (free)
- A [Clerk](https://clerk.com) account (free)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/tars-chat.git
cd tars-chat
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Convex
```bash
npx convex dev
```
This will prompt you to log in and create a project. It auto-generates `NEXT_PUBLIC_CONVEX_URL` in `.env.local`.

### 4. Set up Clerk
1. Go to [clerk.com](https://clerk.com) → Create application
2. Enable **Email** and **Google** sign-in
3. Go to **JWT Templates** → New template → Select **Convex** → Save
4. Copy your keys into `.env.local`:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat
CLERK_JWT_ISSUER_DOMAIN=https://clerk.your-app.clerk.accounts.dev
```

### 5. Connect Clerk to Convex
Create `convex/auth.config.ts`:
```ts
import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
```

### 6. Run the app
Open two terminals:
```bash
# Terminal 1 — Convex backend
npx convex dev

# Terminal 2 — Next.js frontend
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
tars-chat/
├── app/
│   ├── layout.tsx                  # Root layout with Clerk + Convex providers
│   ├── page.tsx                    # Redirects to /chat
│   ├── globals.css                 # Global styles + animations
│   ├── sign-in/[[...sign-in]]/     # Clerk sign-in page
│   ├── sign-up/[[...sign-up]]/     # Clerk sign-up page
│   └── chat/
│       ├── layout.tsx              # Chat shell + presence heartbeat
│       ├── page.tsx                # Empty state (desktop)
│       └── [conversationId]/
│           └── page.tsx            # Active conversation view
│
├── convex/
│   ├── schema.ts                   # DB schema — 7 tables
│   ├── auth.config.ts              # Clerk JWT config
│   ├── helpers.ts                  # Shared auth helpers
│   ├── users.ts                    # User queries/mutations
│   ├── conversations.ts            # Conversation queries/mutations
│   ├── messages.ts                 # Message queries/mutations
│   ├── reactions.ts                # Reaction toggle/query
│   ├── presence.ts                 # Online/offline status
│   └── typing.ts                   # Typing indicator
│
├── components/
│   ├── ConvexClientProvider.tsx    # Convex + Clerk integration
│   ├── UserSync.tsx                # Syncs Clerk user → Convex on login
│   ├── sidebar/
│   │   ├── Sidebar.tsx
│   │   ├── SidebarHeader.tsx       # User avatar + group/logout buttons
│   │   ├── ConversationList.tsx    # DM + group list with unread badges
│   │   ├── UserSearch.tsx          # Real-time user search
│   │   ├── OnlineDot.tsx           # Green presence dot
│   │   └── CreateGroupModal.tsx    # Group chat creation modal
│   └── chat/
│       ├── ChatHeader.tsx          # Conversation header + online status
│       ├── MessageList.tsx         # Message feed with auto-scroll
│       ├── MessageInput.tsx        # Textarea + send button + typing
│       ├── MessageReactions.tsx    # Reaction pills below messages
│       ├── EmojiPicker.tsx         # Portal-based emoji picker
│       └── TypingIndicator.tsx     # Animated typing dots
│
└── lib/
    └── formatTimestamp.ts          # Smart timestamp formatting
```

---

## 🗄 Database Schema

```
users               — clerkId, name, email, imageUrl
conversations       — isGroup, groupName
conversationMembers — conversationId, userId, lastSeenMessageId
messages            — conversationId, senderId, content, isDeleted
reactions           — messageId, userId, emoji
presence            — userId, updatedAt
typing              — conversationId, userId, updatedAt
```

---

## 🌐 Deployment

The app is deployed on **Vercel** with Convex as the backend.

1. Push code to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add all `.env.local` variables in Vercel project settings
4. Deploy!

> **Note:** Make sure `convex/_generated/` is **not** in `.gitignore` so Vercel can build successfully.

---

## 🤖 AI Tools Used

This project was built with assistance from **Claude (claude.ai)** as part of the AI-assisted submission track.

---

## 📄 License

MIT
