export default function ChatPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 hidden md:flex">
      <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
        <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-300 mb-2">Your Messages</h2>
      <p className="text-slate-500 max-w-xs">
        Select a conversation from the sidebar or search for a user to start chatting.
      </p>
    </div>
  );
}
