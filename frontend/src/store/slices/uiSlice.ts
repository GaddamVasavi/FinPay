import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  toasts: ToastNotification[];
}

const initialTheme = (localStorage.getItem('finpay_theme') as 'light' | 'dark') || 'dark';
if (initialTheme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

const initialState: UIState = {
  theme: initialTheme,
  sidebarOpen: true,
  toasts: [],
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('finpay_theme', state.theme);
      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    addToast: (state, action: PayloadAction<Omit<ToastNotification, 'id'>>) => {
      const id = Math.random().toString(36).substring(2, 9);
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { toggleTheme, toggleSidebar, setSidebarOpen, addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
