import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { SYSTEM_PROMPT } from '../data/systemPrompt';
import '../styles/ChatWidget.css';


// Gemini API Configuration
const MODEL_NAME = "gemini-2.5-flash"; // Defined as requested
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: 'Xin chào! Tôi Alaca AI tôi thể giúp gì cho bạn hôm nay?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight > 120 ? '120px' : `${scrollHeight}px`;
    }
  }, [inputText]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userText = inputText.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText
    };

    // Update UI immediately
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = '44px';

    try {
      if (!API_KEY) {
        throw new Error('Chưa thiết lập API Key (VITE_GEMINI_API_KEY)');
      }

      // Prepare history for API (exclude welcome message and errors)
      const history = messages
        .filter(m => m.id !== 'welcome' && !m.isError)
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      // Add current message to payload
      const payload = {
        contents: [
          ...history,
          {
            role: 'user',
            parts: [{ text: userText }]
          }
        ],
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        }
      };

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`,
        payload
      );

      const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (aiText) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: aiText
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('No response from AI');
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      let errorText = 'Xin lỗi, đã có lỗi xảy ra.';

      if (axios.isAxiosError(error)) {
         if (error.response?.status === 404) {
             errorText = `Model ${MODEL_NAME} không tồn tại hoặc sai đường dẫn. Vui lòng kiểm tra lại cấu hình.`;
         } else if (error.response?.status === 400) {
             errorText = 'Yêu cầu không hợp lệ (Lỗi 400).';
         } else if (error.response?.status === 403) {
             errorText = 'API Key không hợp lệ hoặc bị từ chối.';
         }
      } else if (error.message) {
         errorText = error.message;
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: errorText,
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-widget-container">
      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-header-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Alaca AI
          </div>
          <button className="chat-close-btn" onClick={() => setIsOpen(false)} aria-label="Đóng chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.role} ${msg.isError ? 'error' : ''}`}>
              {msg.text}
            </div>
          ))}
          {isLoading && (
            <div className="message model">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder="Nhập tin nhắn..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button type="submit" className="chat-send-btn" disabled={isLoading || !inputText.trim()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Floating Button */}
      <button className={`chat-button ${isOpen ? 'active' : ''}`} onClick={toggleChat} aria-label="Chat với AI">
        {isOpen ? (
           <svg className="chat-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <line x1="18" y1="6" x2="6" y2="18"></line>
             <line x1="6" y1="6" x2="18" y2="18"></line>
           </svg>
        ) : (
           <svg className="chat-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
           </svg>
        )}
      </button>
    </div>
  );
}
