export type ToastLevel = 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'dark' | 'light';

export interface ToastOptions {
  delay?: number;
  autohide?: boolean;
  header?: string;
  level?: ToastLevel;
}

export interface ToastItem extends Required<ToastOptions> {
  id: string;
  body: string;
}
