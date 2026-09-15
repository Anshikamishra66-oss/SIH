import { useState, useEffect, useRef } from 'react';
import {
  Sparkles, X, Send, Bot, User, RotateCcw, AlertCircle,
  Copy, Check, ExternalLink, HelpCircle
} from 'lucide-react';
import { aiService } from '../../services';
import { extractError } from '../../utils/constants';

const SUGGESTED_QUESTIONS = [
  '🌾 What are the latest 2026 MSP rates for Wheat and Paddy?',
  '📋 How do I book a procurement slot at a mandi?',
  '📄 What documents are required when visiting the mandi?',
  '🎫 How does the token and live queue tracking work?',
  '💰 When and how will I receive the payment for my crops?',
];

export default function AiAssistantModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: 'Namaste! 🙏 I am your Kisan AI Assistant powered by Google Gemini.\n\nI can help you with crop MSP rates, procurement slot booking, token queue tracking, mandi locations, and government guidelines in Hindi or English. How can I help you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSend = async (userText) => {
    const textToSend = typeof userText === 'string' ? userText : input;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError('');

    try {
      // Build conversation history for context
      const history = newMessages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          text: m.text,
        }));

      const res = await aiService.chat(textToSend.trim(), history);
      const replyText = res.data?.data?.reply || 'I could not generate a response. Please try asking again.';

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        source: res.data?.data?.source || 'gemini',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(extractError(err) || 'Could not connect to AI service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        text: 'Chat cleared. How else can I assist you with your procurement queries?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setError('');
  };

  // Simple Markdown text renderer for bold and linebreaks
  const renderFormattedText = (text) => {
    return text.split('\n').map((line, lineIdx) => {
      // Process bold syntax **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={lineIdx} className={line.trim().startsWith('•') || line.trim().startsWith('-') ? 'ml-2 my-0.5' : 'my-1'}>
          {parts.map((part, partIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={partIdx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] max-h-[680px] flex flex-col overflow-hidden border border-gray-100">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-primary-600 to-teal-700 text-white flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg leading-tight">Kisan AI Sahayak</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                  Gemini AI
                </span>
              </div>
              <p className="text-xs text-emerald-100">24/7 Procurement &amp; MSP Assistant for Farmers &amp; Officers</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleClear}
              title="Clear Chat"
              className="p-2 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Message Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
                    ${isUser
                      ? 'bg-primary-600 text-white'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm relative group
                    ${isUser
                      ? 'bg-primary-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                    }`}
                >
                  <div className="leading-relaxed whitespace-pre-wrap">
                    {renderFormattedText(m.text)}
                  </div>

                  {/* Message timestamp & copy action */}
                  <div
                    className={`mt-1.5 flex items-center gap-2 text-[10px] ${
                      isUser ? 'text-primary-200 justify-end' : 'text-gray-400 justify-between'
                    }`}
                  >
                    <span>{m.time}</span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopy(m.id, m.text)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-gray-600 text-gray-400 flex items-center gap-1"
                        title="Copy message"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-green-600" />
                            <span className="text-green-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Typing Indicator */}
          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-gray-500 font-medium ml-1">Gemini AI is thinking...</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => handleSend(messages[messages.length - 1]?.text)}
                className="text-xs font-semibold text-red-800 underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Question Chips */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-2 overflow-x-auto text-xs whitespace-nowrap scrollbar-thin">
          <span className="text-gray-400 font-medium flex items-center gap-1 flex-shrink-0">
            <HelpCircle className="w-3.5 h-3.5" /> Suggestions:
          </span>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              disabled={loading}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-gray-600 border border-gray-200 transition-colors flex-shrink-0 font-medium disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 bg-white border-t border-gray-200 flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask anything about MSP, slots, documents, mandi..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all disabled:bg-gray-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white transition-colors shadow-sm flex items-center justify-center flex-shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
