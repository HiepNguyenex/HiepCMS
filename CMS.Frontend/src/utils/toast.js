export const toast = {
  show: (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  },
  success: (message) => toast.show(message, 'success'),
  error: (message) => toast.show(message, 'error'),
  warning: (message) => toast.show(message, 'warning'),
  info: (message) => toast.show(message, 'info')
};
