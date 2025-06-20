/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageCircle, X, Minimize2, Maximize2, Minimize } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '../contexts/authContext';
import envConfig from '../configs/envConfig';
import { Post } from '../interfaces';

interface AIProps {
  isOpen?: boolean;
  messages?: { id: number; type: 'user' | 'bot'; content: string; timestamp: Date }[];
  onClose?: () => void;
  Post: Post;
  onSendMessage?: (message: string) => void;
  onToggle?: () => void;
  onInputChange?: (value: string) => void;
  inputText?: string;
  isTyping?: boolean;
  setIsTyping?: (isTyping: boolean) => void;
}

const BlogAIChat: React.FC<AIProps> = ({
  isOpen: initialIsOpen,
  messages: initialMessages,
  onClose,
  Post,
  onSendMessage,
  onToggle,
  onInputChange,
  inputText: initialInputText,
  isTyping: initialIsTyping,
  setIsTyping: externalSetIsTyping
}) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen || false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'สวัสดีครับ! ผมเป็น AI Assistant ของ blog นี้ ผมพร้อมตอบคำถามเกี่ยวกับเนื้อหา blog, การเขียน, หรือหัวข้อที่น่าสนใจ มีอะไรให้ช่วยไหมครับ?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string) => {
    const responses = {
      'สวัสดี': 'สวัสดีครับ! ยินดีที่ได้พูดคุยกับคุณ มีคำถามอะไรเกี่ยวกับ blog ไหมครับ?',
      'blog': 'blog นี้มีเนื้อหาหลากหลาย ตั้งแต่เทคโนโลยี การพัฒนาเว็บ ไปจนถึงเทคนิคการเขียน คุณสนใจหัวข้อไหนเป็นพิเศษครับ?',
      'เขียน': 'การเขียน blog ที่ดีควรมีโครงสร้างชัดเจน เนื้อหาที่มีประโยชน์ และการใช้ภาษาที่เข้าใจง่าย คุณต้องการคำแนะนำด้านไหนเป็นพิเศษครับ?',
      'เทคโนโลยี': 'เทคโนโลยีในปัจจุบันเปลี่ยนแปลงอย่างรวดเร็ว โดยเฉพาะ AI, Web Development, และ Mobile App คุณสนใจเทคโนโลยีด้านไหนครับ?',
      'react': 'React เป็น JavaScript library ที่ยอดเยี่ยมสำหรับการสร้าง UI คุณต้องการเรียนรู้เกี่ยวกับ hooks, components, หรือ state management ครับ?',
      'default': 'น่าสนใจมากครับ! ผมพร้อมช่วยตอบคำถามเกี่ยวกับ blog, การเขียน, เทคโนโลยี หรือหัวข้ออื่นๆ คุณมีคำถามเฉพาะเจาะจงไหมครับ?'
    };

    const lowerMessage = userMessage.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (key !== 'default' && lowerMessage.includes(key)) {
        return response;
      }
    }
    return responses.default;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch(`${envConfig.apiBaseUrl}/ai/${Post?.id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
        },
        body: JSON.stringify({ prompt: inputText }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let botMessage = '';

      if (!reader) throw new Error("No readable stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonText = line.slice(6).trim();
            if (!jsonText) continue;

            try {
              const parsed = JSON.parse(jsonText);
              const content = parsed.text || '';

              if (content) {
                botMessage += content;
                setMessages((prev) => [
                  ...prev.slice(0, -1),
                  {
                    id: prev.length + 1,
                    type: 'bot',
                    content: botMessage,
                    timestamp: new Date(),
                  },
                ]);
              }
            } catch (e) {
              console.warn("Malformed chunk:", jsonText);
            }
          }
        }
      }
    } catch (err) {
      console.error('Streaming error:', err);
    } finally {
      setIsTyping(false);
    }
  };



  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleMinimize = () => {
    if (isFullscreen) {
      setIsFullscreen(false);
    } else {
      setIsOpen(false);
    }
  };


  function getUserAvatar() {
    if (user?.avatar) {
      return <img src={user.avatar} alt="User Avatar" className="h-6 w-6 rounded-full" />;
    }
    return <User className="h-3 w-3" />;
  }

  return (
    <div className={`fixed z-50 ${isFullscreen
      ? 'inset-0 p-4'
      : 'bottom-8 right-4'
      }`}>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center rounded-full w-12 h-12 bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all duration-200 relative"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`bg-background border border-border rounded-lg shadow-lg flex flex-col ${isFullscreen
          ? 'w-full h-full max-w-none max-h-none'
          : 'w-80 h-96'
          }`}>
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <div className="flex items-center space-x-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted">
                <Bot className="w-3.5 h-3.5 text-muted-foreground" />
              </span>
              <div>
                <span className="flex items-center gap-1 text-sm">
                  <span className="font-medium">Blog AI Assistant</span>
                  <div className="relative">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-ping absolute right-0 top-[6px]"></span>
                  </div>
                </span>
              </div>
            </div>

            <div className="flex gap-0.5">
              <button
                onClick={toggleFullscreen}
                className="inline-flex items-center justify-center rounded-md w-8 h-8 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title={isFullscreen ? "ย่อหน้าต่าง" : "ขยายเต็มจอ"}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={handleMinimize}
                className="inline-flex items-center justify-center rounded-md w-8 h-8 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title={isFullscreen ? "ย่อหน้าต่าง" : "ย่อเก็บ"}
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center rounded-md w-8 h-8 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="ปิด"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${isFullscreen ? 'max-w-4xl mx-auto w-full' : ''
            }`}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[85%] ${isFullscreen ? 'max-w-2xl' : 'max-w-[85%]'
                  } ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-2' : 'mr-2'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                      }`}>
                      {message.type === 'user' ? getUserAvatar() : <Bot className="h-3 w-3" />}
                    </div>
                  </div>
                  <div className={`rounded-lg px-3 py-2 ${message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                    }`}>
                    <p className={`text-sm ${message.type == "user" ? "text-white" : ""}`}>{message.content}</p>
                    <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex mr-2">
                  <div className="w-6 h-6 rounded-full flex items center justify-center bg-muted text-muted-foreground">
                    <Bot className="h-3 w-3" />
                  </div>
                </div>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={`p-4 border-t border-border ${isFullscreen ? 'max-w-4xl mx-auto w-full' : ''
            }`}>
            <div className="flex space-x-2">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="พิมพ์ข้อความของคุณ..."
                className={`flex-1 min-h-9 px-3 py-2 text-sm ${isFullscreen ? 'max-h-32' : 'max-h-20'
                  }`}
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Enter เพื่อส่ง • Shift+Enter บรรทัดใหม่
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogAIChat;