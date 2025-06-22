'use client';
/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageCircle, X, Minimize2, Maximize2, Minimize } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '../contexts/authContext';
import envConfig from '../configs/envConfig';
import { Post } from '../interfaces';
import { useRouter } from 'next/navigation'

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

// Markdown parser function
const parseMarkdown = (text: string): React.ReactNode => {
  if (!text) return null;

  // Split text by code blocks first (triple backticks)
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const parts: (string | { type: 'codeblock'; content: string })[] = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // Add code block
    parts.push({ type: 'codeblock', content: match[1] });
    lastIndex = match.index + match[0].length;
  }
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.map((part, index) => {
    if (typeof part === 'object' && part.type === 'codeblock') {
      return (
        <pre key={index} className="bg-gray-800 text-gray-100 p-3 rounded-md my-2 overflow-x-auto">
          <code>{part.content}</code>
        </pre>
      );
    }

    // Process inline markdown for text parts
    return parseInlineMarkdown(part as string, index);
  });
};

const parseInlineMarkdown = (text: string, keyPrefix: number): React.ReactNode => {
  const elements: React.ReactNode[] = [];
  let currentIndex = 0;

  // Define regex patterns for different markdown elements
  const patterns = [
    { regex: /\*\*(.*?)\*\*/g, component: 'strong' }, // **bold**
    { regex: /\*(.*?)\*/g, component: 'em' }, // *italic*
    { regex: /`(.*?)`/g, component: 'code' }, // `code`
    { regex: /~~(.*?)~~/g, component: 'del' }, // ~~strikethrough~~
    { regex: /\[(.*?)\]\((.*?)\)/g, component: 'link' }, // [text](url)
  ];

  // Find all matches and their positions
  const matches: Array<{
    start: number;
    end: number;
    content: string;
    component: string;
    url?: string;
  }> = [];

  patterns.forEach((pattern) => {
    let match;
    const regex = new RegExp(pattern.regex.source, 'g');
    
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        content: match[1],
        component: pattern.component,
        url: match[2] // for links
      });
    }
  });

  // Sort matches by start position
  matches.sort((a, b) => a.start - b.start);

  // Remove overlapping matches (keep the first one)
  const validMatches = matches.filter((match, index) => {
    return !matches.slice(0, index).some(prevMatch => 
      match.start < prevMatch.end && match.end > prevMatch.start
    );
  });

  // Build the result
  validMatches.forEach((match, index) => {
    // Add text before the match
    if (match.start > currentIndex) {
      const textBefore = text.slice(currentIndex, match.start);
      if (textBefore) {
        elements.push(textBefore);
      }
    }

    // Add the formatted element
    const key = `${keyPrefix}-${index}`;
    switch (match.component) {
      case 'strong':
        elements.push(<strong key={key} className="font-bold">{match.content}</strong>);
        break;
      case 'em':
        elements.push(<em key={key} className="italic">{match.content}</em>);
        break;
      case 'code':
        elements.push(
          <code key={key} className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono">
            {match.content}
          </code>
        );
        break;
      case 'del':
        elements.push(<del key={key} className="line-through">{match.content}</del>);
        break;
      case 'link':
        elements.push(
          <a key={key} href={match.url} target="_blank" rel="noopener noreferrer" 
             className="text-blue-500 hover:text-blue-700 underline">
            {match.content}
          </a>
        );
        break;
    }

    currentIndex = match.end;
  });

  // Add remaining text
  if (currentIndex < text.length) {
    const remainingText = text.slice(currentIndex);
    if (remainingText) {
      elements.push(remainingText);
    }
  }

  // Handle line breaks
  return elements.length > 0 ? elements.map((element, index) => {
    if (typeof element === 'string') {
      return element.split('\n').map((line, lineIndex, array) => (
        <React.Fragment key={`${keyPrefix}-line-${index}-${lineIndex}`}>
          {line}
          {lineIndex < array.length - 1 && <br />}
        </React.Fragment>
      ));
    }
    return element;
  }) : text.split('\n').map((line, lineIndex, array) => (
    <React.Fragment key={`${keyPrefix}-simple-${lineIndex}`}>
      {line}
      {lineIndex < array.length - 1 && <br />}
    </React.Fragment>
  ));
};

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
      content: 'สวัสดีครับ! ผมเป็น **AI Assistant** ของ blog นี้ ผมพร้อมตอบคำถามเกี่ยวกับเนื้อหา blog, การเขียน, หรือหัวข้อที่น่าสนใจ มีอะไรให้ช่วยไหมครับ?\n\nคุณสามารถใช้ markdown ได้ เช่น:\n- **ตัวหนา**\n- *ตัวเอียง*\n- `โค้ด`\n- [ลิงก์](https://example.com)',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Check if user is authenticated
    if (!user) {
      const currentUrl = window.location.pathname + window.location.search;
      const redirectUrl = encodeURIComponent(currentUrl);
      router.push(`/auth/login?redirect=${redirectUrl}`);
      return;
    }

    const userMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Add empty bot message for streaming
    const botMessageId = messages.length + 2;
    setMessages((prev) => [...prev, {
      id: botMessageId,
      type: 'bot' as const,
      content: '',
      timestamp: new Date(),
    }]);

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
                setMessages((prev) => prev.map(msg => 
                  msg.id === botMessageId 
                    ? { ...msg, content: botMessage }
                    : msg
                ));
              }
            } catch (e) {
              console.warn("Malformed chunk:", jsonText);
            }
          }
        }
      }
    } catch (err) {
      console.error('Streaming error:', err);
      // Show error message
      setMessages((prev) => prev.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, content: 'ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง' }
          : msg
      ));
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

  const handleClose = () => {
    setIsOpen(false);
    // Reset fullscreen when closing
    if (isFullscreen) {
      setIsFullscreen(false);
    }
  };

  function getUserAvatar() {
    if (user?.avatar) {
      return <img src={user.avatar} alt="User Avatar" className="h-6 w-6 rounded-full" />;
    }
    return <User className="h-3 w-3" />;
  }

  // Fixed positioning logic
  const getContainerClasses = () => {
    if (isFullscreen) {
      return 'fixed inset-0 z-50 p-4';
    }
    return 'fixed z-50 bottom-8 right-4';
  };

  const getChatWindowClasses = () => {
    if (isFullscreen) {
      return 'bg-background border border-border rounded-lg shadow-lg flex flex-col w-full h-full max-w-none max-h-none';
    }
    return 'bg-background border border-border rounded-lg shadow-lg flex flex-col w-80 h-96';
  };

  return (
    <div className={getContainerClasses()}>
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
        <div className={getChatWindowClasses()}>
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
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-ping absolute right-0 top-[7px]"></span>
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
                onClick={handleClose}
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
                    <div className={`text-sm ${message.type == "user" ? "text-white" : ""}`}>
                      {parseMarkdown(message.content)}
                    </div>
                    <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator - แสดงเฉพาะเมื่อกำลัง typing และไม่มี content ใน bot message ล่าสุด */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex mr-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
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
                placeholder={!user ? "กรุณาเข้าสู่ระบบเพื่อแชท..." : "พิมพ์ข้อความของคุณ..."}
                className={`flex-1 min-h-9 px-3 py-2 text-sm ${isFullscreen ? 'max-h-32' : 'max-h-20'
                  }`}
                rows={1}
                disabled={!user}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping || !user}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {!user ? "กรุณาเข้าสู่ระบบเพื่อใช้งาน AI Chat" : "Enter เพื่อส่ง • Shift+Enter บรรทัดใหม่"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogAIChat;