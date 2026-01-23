"use client";

import { useState } from "react";
import { MessageSquare, Search, Filter, MoreVertical, Phone, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConversationThread } from "./conversation-thread";

interface Contact {
  id: string;
  name: string;
  phone: string;
  tags: string[];
}

interface Conversation {
  id: string;
  contact_id: string;
  status: string;
  unread_count: number;
  last_message_at: string | null;
  last_message_preview: string | null;
  contact: Contact | null;
}

interface InboxViewProps {
  conversations: Conversation[];
}

export function InboxView({ conversations }: InboxViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    conversations[0]?.id || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.contact?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.contact?.phone?.includes(searchQuery);
    const matchesFilter = filter === "all" || conv.unread_count > 0;
    return matchesSearch && matchesFilter;
  });

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  return (
    <div className="flex h-full bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Conversation List */}
      <div
        className={cn(
          "w-full lg:w-96 border-r border-slate-200 flex flex-col",
          selectedId ? "hidden lg:flex" : "flex"
        )}
      >
        {/* List Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-900">Inbox</h1>
            <div className="flex items-center gap-2">
              <button className="btn-ghost btn-sm">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-sm pl-10"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                filter === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                filter === "unread"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              Unread
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedId(conversation.id)}
                className={cn(
                  "w-full text-left",
                  selectedId === conversation.id ? "list-item-active" : "list-item"
                )}
              >
                <div className="avatar">
                  {conversation.contact?.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "font-medium truncate",
                      conversation.unread_count > 0 ? "text-slate-900" : "text-slate-700"
                    )}>
                      {conversation.contact?.name || "Unknown"}
                    </span>
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {conversation.last_message_at
                        ? formatTime(conversation.last_message_at)
                        : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className={cn(
                      "text-sm truncate",
                      conversation.unread_count > 0 ? "text-slate-700 font-medium" : "text-slate-500"
                    )}>
                      {conversation.last_message_preview || "No messages"}
                    </p>
                    {conversation.unread_count > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 bg-amber-500 text-slate-900 text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="empty-state">
              <MessageSquare className="empty-state-icon" />
              <p className="empty-state-title">No conversations</p>
              <p className="empty-state-text">
                {searchQuery
                  ? "No conversations match your search."
                  : "Conversations will appear here when customers reach out."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Conversation Detail */}
      <div
        className={cn(
          "flex-1 flex flex-col",
          selectedId ? "flex" : "hidden lg:flex"
        )}
      >
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b border-slate-200 flex items-center gap-4">
              <button
                onClick={() => setSelectedId(null)}
                className="lg:hidden btn-ghost btn-sm p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="avatar">
                {selectedConversation.contact?.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-slate-900">
                  {selectedConversation.contact?.name || "Unknown"}
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedConversation.contact?.phone}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-ghost btn-sm">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="btn-ghost btn-sm">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message Thread */}
            <ConversationThread
              conversationId={selectedConversation.id}
              contactId={selectedConversation.contact_id}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
