import { toast } from 'sonner';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';
export type NotificationPriority = 'low' | 'medium' | 'high';

interface NotificationOptions {
  type?: NotificationType;
  priority?: NotificationPriority;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class NotificationService {
  private static instance: NotificationService;
  private enabled: boolean = true;
  private preferences: Record<string, boolean> = {
    weatherAlerts: true,
    taskReminders: true,
    agriculturalRecommendations: true,
    irrigationAlerts: true,
    supplierMessages: true,
  };

  private constructor() {
    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem('notificationPreferences');
    if (savedPreferences) {
      this.preferences = JSON.parse(savedPreferences);
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public setPreference(key: string, value: boolean): void {
    this.preferences[key] = value;
    localStorage.setItem('notificationPreferences', JSON.stringify(this.preferences));
  }

  public getPreference(key: string): boolean {
    return this.preferences[key] ?? true;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public show(
    message: string,
    title?: string,
    options: NotificationOptions = {}
  ): void {
    if (!this.enabled) return;

    const {
      type = 'info',
      priority = 'medium',
      duration = 3000,
      action,
    } = options;

    const toastOptions = {
      duration: priority === 'high' ? 5000 : duration,
      className: `notification-${type} notification-${priority}`,
      style: {
        background: this.getBackgroundColor(type),
        color: '#fff',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
      },
    };

    if (action) {
      toast[type](message, {
        ...toastOptions,
        action: {
          label: action.label,
          onClick: action.onClick,
        },
      });
    } else {
      toast[type](message, toastOptions);
    }
  }

  private getBackgroundColor(type: NotificationType): string {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'info':
      default:
        return '#3B82F6';
    }
  }
}

export const notificationService = NotificationService.getInstance(); 