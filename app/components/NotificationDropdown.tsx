/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Bell, X, Loader2 } from "lucide-react";
import { useWebSocket } from "../contexts/use-web-socket";
import { axiosInstance } from "../utils/api";
import { useAuth } from "../contexts/authContext";
import { Notification } from '../interfaces/index';

interface NotificationDropdownProps {
  className?: string;
}

interface NotificationMeta {
  total: number;
  hasNextPage: boolean;
  page: number;
  limit: number;
  totalPage: number;
}

export default function NotificationDropdown({ className = "" }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [meta, setMeta] = useState<NotificationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const LIMIT = 5;

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Get notifications from API with pagination
  const fetchNotifications = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await axiosInstance.get(`/notifications?page=${page}&limit=${LIMIT}`);
      const apiData = response?.data?.data;
      
      if (!apiData) {
        throw new Error('Invalid response format');
      }

      const newNotifications: Notification[] = apiData.notification.map((n: any) => ({
        id: n.id,
        title: n.title || "📣 New notification.",
        content: n.content || "",
        created_at: new Date(n.seen_at !== "0001-01-01T00:00:00Z" ? n.seen_at : new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        seen: n.seen || false,
        updated_at: n.seen_at || new Date().toISOString(),
        link: n.link || "",
        user_id: ""
      }));

      setMeta(apiData.meta);

      if (append) {
        setNotifications(prev => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }

      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more notifications
  const loadMoreNotifications = useCallback(() => {
    if (meta && meta.hasNextPage && !loadingMore) {
      fetchNotifications(currentPage + 1, true);
    }
  }, [meta, currentPage, loadingMore]);

  // Handle scroll to detect when to load more
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const threshold = 50; // Load more when 50px from bottom
    
    if (scrollHeight - scrollTop <= clientHeight + threshold) {
      loadMoreNotifications();
    }
  }, [loadMoreNotifications]);

  // Mark notification as read or unread
  const toggleReadStatus = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, seen: true } : n))
    );

    // Update the server
    try {
      axiosInstance.post(`/notifications/${id}/mark-read`, {});
    } catch (error) {
      console.error("Error updating notification read status:", error);
      // Revert the local state change if the server update fails
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, seen: false } : n))
      );
    }
  };

  // Mark all notifications as read
  const markAsReadToggle = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, seen: true }))
    );

    // Update the server
    try {
      axiosInstance.post(`/notifications/mark-all-read`, {});
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      // Revert the local state change if the server update fails
      setNotifications(prev =>
        prev.map(n => ({ ...n, seen: false }))
      );
    }
  };

  const markAsRead = (id: number) => {
    toggleReadStatus(id);
  };

  const markAllAsRead = () => {
    markAsReadToggle();
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // Update meta total count
    if (meta) {
      setMeta(prev => prev ? { ...prev, total: prev.total - 1 } : null);
    }
  };

  const unreadCount = notifications.filter(n => !n.seen).length;

  // WebSocket: Listen for incoming notifications
  useWebSocket((message) => {
    if (message.event.split(":")[0] === "notification") {
      const payload = message.payload || {};
      let content = payload.content || "";
      
      // Check if content is UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (payload.content && uuidRegex.test(payload.content)) {
        content = "You have a new notification";
      }

      const newNoti: Notification = {
        title: `📣${payload.title}` || "📣 New notification.",
        content: content,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        seen: false,
        updated_at: new Date().toISOString(),
        id: payload.id || Date.now(),
        link: "",
        user_id: ""
      };

      setNotifications(prev => [newNoti, ...prev]);
      // Update meta total count
      if (meta) {
        setMeta(prev => prev ? { ...prev, total: prev.total + 1 } : null);
      }
    }
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch initial notifications on mount and when dropdown opens
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && isOpen && notifications.length === 0) {
      fetchNotifications(1);
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#fb923c] focus:ring-opacity-50"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="การแจ้งเตือน"
      >
        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">การแจ้งเตือน</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-[#fb923c] hover:text-[#ea580c]"
                >
                  อ่านทั้งหมด
                </button>
              )}
            </div>

            <div 
              ref={scrollRef}
              className="mt-3 max-h-96 overflow-y-auto space-y-2"
              onScroll={handleScroll}
            >
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                  <span className="ml-2 text-gray-500 dark:text-gray-400">กำลังโหลด...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>ไม่มีการแจ้งเตือน</p>
                </div>
              ) : (
                <>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`relative p-3 rounded-lg border cursor-pointer group transition-colors ${n.seen
                        ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                        }`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(n.id);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>

                      <div className="pr-6">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white">{n.title}</h4>
                          {!n.seen && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 normal-case">{n.content}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{n.created_at}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Loading more indicator */}
                  {loadingMore && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">กำลังโหลดเพิ่มเติม...</span>
                    </div>
                  )}
                  
                  {/* End of list indicator */}
                  {meta && !meta.hasNextPage && notifications.length > 0 && (
                    <div className="text-center py-2">
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        แสดงครบทั้งหมด {meta.total} รายการ
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}