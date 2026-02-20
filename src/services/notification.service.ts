type Notification = {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: Date;
};

const notifications: Map<string, Notification[]> = new Map();

export function addNotification(
  userId: string,
  type: string,
  message: string
): Notification {
  const list = notifications.get(userId) ?? [];
  const notification: Notification = {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    userId,
    type,
    message,
    read: false,
    createdAt: new Date(),
  };
  list.push(notification);
  notifications.set(userId, list);
  return notification;
}

export function getNotifications(userId: string): Notification[] {
  return (notifications.get(userId) ?? []).slice().reverse();
}

export function markAsRead(userId: string, notificationId: string): boolean {
  const list = notifications.get(userId) ?? [];
  const n = list.find((x) => x.id === notificationId);
  if (n) {
    n.read = true;
    return true;
  }
  return false;
}
