'use client';

import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Log performance metrics
        console.log(`${entry.name}: ${(entry as any).value}`);
        
        // Send to analytics (you can replace with your analytics service)
        if (entry.name === 'LCP') {
          // Largest Contentful Paint
          sendMetric('LCP', (entry as any).value);
        } else if (entry.name === 'FID') {
          // First Input Delay
          sendMetric('FID', (entry as any).value);
        } else if (entry.name === 'CLS') {
          // Cumulative Layout Shift
          sendMetric('CLS', (entry as any).value);
        } else if (entry.name === 'FCP') {
          // First Contentful Paint
          sendMetric('FCP', (entry as any).value);
        } else if (entry.name === 'TTFB') {
          // Time to First Byte
          sendMetric('TTFB', (entry as any).value);
        }
      }
    });

    // Observe different performance metrics
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'first-contentful-paint', 'navigation'] });

    // Monitor page load time
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        
        sendMetric('PageLoadTime', loadTime);
        sendMetric('DOMContentLoaded', domContentLoaded);
      }
    });

    // Monitor resource loading
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          if (resourceEntry.duration > 3000) { // Log slow resources (>3s)
            console.warn('Slow resource loaded:', resourceEntry.name, resourceEntry.duration);
          }
        }
      }
    });

    resourceObserver.observe({ entryTypes: ['resource'] });

    // Monitor errors
    window.addEventListener('error', (event) => {
      sendMetric('Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      sendMetric('UnhandledRejection', {
        reason: event.reason,
      });
    });

    return () => {
      observer.disconnect();
      resourceObserver.disconnect();
    };
  }, []);

  const sendMetric = (name: string, value: number | object) => {
    // Send to your analytics service
    // Example: Google Analytics, Mixpanel, etc.
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance', {
        event_category: 'Web Vitals',
        event_label: name,
        value: typeof value === 'number' ? Math.round(value) : undefined,
        custom_parameters: typeof value === 'object' ? value : undefined,
      });
    }
    
    // You can also send to your own API
    // fetch('/api/metrics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ name, value, timestamp: Date.now() })
    // });
  };

  return null; // This component doesn't render anything
} 