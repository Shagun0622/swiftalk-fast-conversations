# Tars Chat — Real-time Messaging App

Built with **Next.js 14**, **TypeScript**, **Convex**, and **Clerk**.

## Features
- ✅ Authentication (Clerk — email + social login)
- ✅ User list & real-time search
- ✅ One-on-one direct messages (Convex real-time subscriptions)
- ✅ Smart message timestamps
- ✅ Empty states for all screens
- ✅ Responsive layout (mobile + desktop)
- ✅ Online/offline presence indicators
- ✅ Typing indicator ("Alex is typing...")
- ✅ Unread message badges
- ✅ Smart auto-scroll with "↓ New messages" button
- ✅ Delete own messages (soft delete)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Convex
```bash
npx convex dev
```
This will prompt you to log in and create a project. It generates `NEXT_PUBLIC_CONVEX_URL` in `.env.local`.

### 3. Set up Clerk
1. Go to [clerk.com](https://clerk.com) and create an app
2. Choose Email + Google as sign-in options
3. Copy your keys to `.env.local`:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat
```

### 4. Configure Clerk + Convex JWT
In your Convex dashboard, go to **Settings → Authentication** and add Clerk as a provider. Copy the Clerk issuer URL (from Clerk Dashboard → API Keys → Advanced) and paste it into Convex.

### 5. Run the app
In two terminals:
```bash
# Terminal 1
npx convex dev

# Terminal 2  
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/app
  layout.tsx                  ← Clerk + Convex providers
  page.tsx                    ← Redirects to /chat
  /sign-in/[[...sign-in]]/    ← Clerk sign-in page
  /sign-up/[[...sign-up]]/    ← Clerk sign-up page
  /chat/
    layout.tsx                ← Chat shell + presence heartbeat
    page.tsx                  ← Empty state (desktop)
    /[conversationId]/
      page.tsx                ← Active conversation

/convex
  schema.ts                   ← DB tables: users, conversations, members, messages, presence, typing
  helpers.ts                  ← Auth helpers
  users.ts                    ← User queries/mutations
  conversations.ts            ← Conversation queries/mutations
  messages.ts                 ← Message queries/mutations
  presence.ts                 ← Online/offline status
  typing.ts                   ← Typing indicator

/components
  ConvexClientProvider.tsx    ← Connects Convex + Clerk
  UserSync.tsx                ← Syncs Clerk user → Convex on login
  /sidebar/
    Sidebar.tsx
    SidebarHeader.tsx
    ConversationList.tsx
    UserSearch.tsx
    OnlineDot.tsx
  /chat/
    ChatHeader.tsx
    MessageList.tsx
    MessageInput.tsx
    TypingIndicator.tsx

/lib
  formatTimestamp.ts          ← Smart timestamp formatting
```

## Deploy to Vercel

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add all env variables from `.env.local` in Vercel project settings
4. Deploy!
