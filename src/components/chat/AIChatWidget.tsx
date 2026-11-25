// --- Libraries
import { useState, useRef, useEffect, type FormEvent } from "react";
import { Link } from "react-router";

// --- Icons
import { BsRobot } from "react-icons/bs";
import { IoClose, IoSend } from "react-icons/io5";
import { FiStar } from "react-icons/fi";

// --- Services & Types
import { sendChatMessage, type ChatMessage } from "@features/chat/chatApi";
import { formatCurrency } from "@utils/formatCurrency";

import { STORE_CONFIG } from "@/config/storeConfig";

/**
 * Simple inline markdown parser for chat messages.
 * Supports: **bold**, *italic*, `code`, and newlines.
 */
function parseMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const result: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) result.push(<br key={`br-${lineIdx}`} />);

    // Regex to match **bold**, *italic*, `code`
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let partIdx = 0;

    while ((match = regex.exec(line)) !== null) {
      // Push text before the match
      if (match.index > lastIndex) {
        result.push(line.slice(lastIndex, match.index));
      }

      if (match[2]) {
        // **bold**
        result.push(<strong key={`b-${lineIdx}-${partIdx}`}>{match[2]}</strong>);
      } else if (match[3]) {
        // *italic*
        result.push(<em key={`i-${lineIdx}-${partIdx}`}>{match[3]}</em>);
      } else if (match[4]) {
        // `code`
        result.push(
          <code key={`c-${lineIdx}-${partIdx}`} className="bg-gray-100 text-amber-700 px-1 py-0.5 rounded text-xs font-mono">
            {match[4]}
          </code>
        );
      }

      lastIndex = match.index + match[0].length;
      partIdx++;
    }

    // Push remaining text after last match
    if (lastIndex < line.length) {
      result.push(line.slice(lastIndex));
    }
  });

  return result;
}

const QUICK_CHIPS = [
  { label: "📦 Track Order", prompt: "Where is my order?" },
  { label: "📱 Mobiles", prompt: "Recommend top smartphones" },
  { label: "🎧 Headphones", prompt: "Show me best noise cancelling headphones" },
  { label: "🚚 Shipping Policy", prompt: "What is your shipping & return policy?" },
];

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "bot",
      text: `Hello! 👋 Welcome to **${STORE_CONFIG.shortName} AI Assistant**. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const limitReached = messages.filter(m => m.sender === "user").length >= 5;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMsg.trim();
    if (!text || loading) return;

    const userMessagesCount = messages.filter(m => m.sender === "user").length;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg("");
    setLoading(true);

    try {
      const res = await sendChatMessage(text, sessionId);
      if (res.sessionId) setSessionId(res.sessionId);

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedProducts: res.suggestedProducts,
      };

      setMessages((prev) => {
        const newMessages = [...prev, botMessage];
        // If they just hit the 5 limit, append the warning message.
        if (userMessagesCount + 1 >= 5) {
          newMessages.push({
            id: `bot-limit-${Date.now()}`,
            sender: "bot",
            text: "You have reached the limit of 5 messages per session. Please refresh the page to start a new chat.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          });
        }
        return newMessages;
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "bot",
          text: "I'm having trouble connecting to the server right now. Please try again shortly!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end font-sans">
      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="mb-4 flex h-[min(460px,calc(100dvh-6.5rem))] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                <BsRobot size={22} />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-orange-500 bg-emerald-400"></span>
              </div>
              <div>
                <h3 className="flex items-center gap-1.5 font-bold tracking-wide">
                  {STORE_CONFIG.shortName} AI Bot <FiStar size={14} className="animate-pulse text-amber-200" />
                </h3>
                <p className="text-xs font-medium text-amber-100">Powered by LangChain & Spring AI</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              title="Close chat"
            >
              <IoClose size={22} />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 space-y-4 text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-amber-500 text-white rounded-br-none"
                      : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-line text-sm">{parseMarkdown(msg.text)}</p>

                  {/* Product Cards Grid if Bot Returned Suggestions */}
                  {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-gray-100 pt-2.5">
                      <p className="text-xs font-semibold text-gray-500">Suggested Products:</p>
                      {msg.suggestedProducts.map((prod) => (
                        <Link
                          key={prod.id}
                          to={`/products/${prod.category}/${prod.id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-2 transition-all hover:bg-amber-50/70 hover:border-amber-300"
                        >
                          <img
                            src={prod.image || "https://placehold.co/100"}
                            alt={prod.title}
                            className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="truncate font-medium text-xs text-gray-900">{prod.title}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs font-bold text-amber-600">
                                {formatCurrency(Number(prod.price))}
                              </span>
                              <span className="text-[10px] capitalize text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">
                                {prod.category}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <span className="mt-1 text-[10px] text-gray-400 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-gray-400 text-xs italic bg-white border border-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-none w-fit shadow-sm">
                <BsRobot className="animate-spin text-amber-500" size={16} />
                Baghdad Bot is thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto bg-gray-100 px-3 py-2 border-t border-gray-200 no-scrollbar">
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.prompt)}
                disabled={loading || limitReached}
                className="whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm transition-all hover:bg-amber-500 hover:text-white border border-gray-200 disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-200 bg-white p-3">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={limitReached ? "Limit reached. Refresh to chat." : "Ask AI assistant..."}
              className="flex-1 min-w-0 rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none disabled:bg-gray-100 disabled:opacity-75"
              disabled={loading || limitReached}
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || loading || limitReached}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white transition-colors hover:bg-amber-600 disabled:opacity-40"
            >
              <IoSend size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        title="Open AI Customer Assistant"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
          AI
        </span>
        {isOpen ? <IoClose size={28} /> : <BsRobot size={28} className="transition-transform group-hover:rotate-12" />}
      </button>
    </div>
  );
}
