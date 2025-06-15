"use client";
import { useState, useRef, useEffect } from "react";
import { Bell, X } from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface NotificationDropdownProps {
  className?: string;
}

export default function NotificationDropdown({ className = "" }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "ยินดีต้อนรับสู่ BSO Space!",
      message: "ขอบคุณที่เข้าใช้งานเว็บไซต์ของเรา",
      time: "2 นาทีที่แล้ว",
      isRead: false
    },
    {
      id: 2,
      title: "อัปเดตฟีเจอร์ใหม่",
      message: "เราได้เพิ่มระบบแจ้งเตือนใหม่แล้ว",
      time: "1 ชั่วโมงที่แล้ว",
      isRead: false
    },
    {
      id: 3,
      title: "บทความใหม่ล่าสุด",
      message: "มีบทความใหม่น่าสนใจรออยู่",
      time: "3 ชั่วโมงที่แล้ว",
      isRead: true
    }
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Button */}
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
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 origin-top-right transition-all duration-200 ease-out">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                การแจ้งเตือน
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-[#fb923c] hover:text-[#ea580c] transition-colors"
                >
                  อ่านทั้งหมด
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="mt-3 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>ไม่มีการแจ้งเตือน</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`relative p-3 rounded-lg border transition-colors cursor-pointer group ${
                        notification.isRead
                          ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        aria-label="ลบการแจ้งเตือน"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>

                      <div className="pr-6">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}