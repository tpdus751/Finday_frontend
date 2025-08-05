// store/userStore.js
import { create } from 'zustand';
import api from '../services/api'; // ✅ axios 인스턴스 import

const useUserStore = create((set) => ({
  user: undefined,
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization']; // ✅ axios에서 토큰 제거
    set({ user: undefined  });
  },
}));

export default useUserStore;
