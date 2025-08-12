import { toast as sonnerToast } from 'sonner';

// Enhanced toast with better UX
export const toast = {
  success: (message: string, options?: any) => {
    sonnerToast.success(message, {
      duration: 4000,
      style: {
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        padding: '16px 20px',
        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
      },
      ...options
    });
  },
  
  error: (message: string, options?: any) => {
    sonnerToast.error(message, {
      duration: 6000,
      style: {
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        padding: '16px 20px',
        boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
      },
      ...options
    });
  },
  
  info: (message: string, options?: any) => {
    sonnerToast.info(message, {
      duration: 4000,
      style: {
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        padding: '16px 20px',
        boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
      },
      ...options
    });
  },
  
  warning: (message: string, options?: any) => {
    sonnerToast.warning(message, {
      duration: 5000,
      style: {
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        padding: '16px 20px',
        boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
      },
      ...options
    });
  },
  
  loading: (message: string, options?: any) => {
    return sonnerToast.loading(message, {
      style: {
        background: 'linear-gradient(135deg, #6b7280, #4b5563)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        padding: '16px 20px',
        boxShadow: '0 10px 25px rgba(107, 114, 128, 0.3)',
      },
      ...options
    });
  }
};