"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

interface ChatWidgetProps {
  accentColor: string;
  fontBody: string;
  phone?: string | null;
  businessName: string;
}

export function ChatWidget({ accentColor, fontBody, phone, businessName }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: `Hi! Thanks for reaching out to ${businessName}. How can we help you today?`, isUser: false },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages([...messages, { text: message, isUser: true }]);
    setMessage("");

    // Simulate response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: phone
            ? `Thanks for your message! For fastest service, give us a call at ${phone}. We'll also get back to you here shortly.`
            : "Thanks for your message! We'll get back to you shortly.",
          isUser: false,
        },
      ]);
    }, 1000);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        style={{ backgroundColor: accentColor }}
      >
        {isOpen ? (
          <X className="w-6 h-6" style={{ color: "#0C1117" }} />
        ) : (
          <MessageCircle className="w-6 h-6" style={{ color: "#0C1117" }} />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 shadow-2xl overflow-hidden"
          style={{ backgroundColor: "#161B22", border: "1px solid #30363D" }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center gap-3"
            style={{ backgroundColor: accentColor }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
              style={{
                backgroundColor: "#0C1117",
                color: accentColor,
                fontFamily: `"${fontBody}", sans-serif`,
              }}
            >
              {businessName.charAt(0)}
            </div>
            <div>
              <p
                className="font-bold text-sm"
                style={{
                  color: "#0C1117",
                  fontFamily: `"${fontBody}", sans-serif`,
                }}
              >
                {businessName}
              </p>
              <p
                className="text-xs opacity-80"
                style={{
                  color: "#0C1117",
                  fontFamily: `"${fontBody}", sans-serif`,
                }}
              >
                Usually replies instantly
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: "#0C1117" }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[80%] px-4 py-2 text-sm"
                  style={{
                    backgroundColor: msg.isUser ? accentColor : "#161B22",
                    color: msg.isUser ? "#0C1117" : "#E6EDF3",
                    fontFamily: `"${fontBody}", sans-serif`,
                    borderRadius: msg.isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div
            className="p-3 flex gap-2"
            style={{ backgroundColor: "#161B22", borderTop: "1px solid #30363D" }}
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 text-sm outline-none"
              style={{
                backgroundColor: "#0C1117",
                color: "#E6EDF3",
                border: "1px solid #30363D",
                fontFamily: `"${fontBody}", sans-serif`,
              }}
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 transition-opacity hover:opacity-80"
              style={{ backgroundColor: accentColor }}
            >
              <Send className="w-4 h-4" style={{ color: "#0C1117" }} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
