import { Toaster as HotToaster, toast as hotToast } from 'react-hot-toast';

const baseStyle = {
  background: '#141414',
  color: '#fafafa',
  border: '1px solid rgb(39 39 42)',
  fontSize: '0.875rem',
  maxWidth: 'min(100vw - 2rem, 28rem)',
};

/**
 * Toast chung cho app — dùng thay alert().
 */
export const toast = {
  message: (msg, options = {}) =>
    hotToast(msg, {
      duration: 4000,
      style: baseStyle,
      ...options,
    }),
  success: (msg, options = {}) =>
    hotToast.success(msg, {
      duration: 3500,
      style: baseStyle,
      ...options,
    }),
  error: (msg, options = {}) =>
    hotToast.error(msg, {
      duration: 5000,
      style: baseStyle,
      ...options,
    }),
};

export function AppToaster() {
  return (
    <HotToaster
      position="top-center"
      containerClassName="!z-[9999]"
      toastOptions={{
        duration: 4000,
        style: baseStyle,
      }}
    />
  );
}
