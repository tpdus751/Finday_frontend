import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // ✅ axios 인스턴스
import useUserStore from '../store/userStore'; // ✅ zustand store

function AppInitializer() {
  const { setUser } = useUserStore();
  const navigate = useNavigate();
  console.log('AppInitializer 렌더링');

  useEffect(() => {
    console.log('[AppInitializer] useEffect 진입');
    const token = localStorage.getItem('token');
    console.log('[AppInitializer] token:', token);

    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('[AppInitializer] 토큰으로 인증 요청 시작');

        api.get('/user/me')
        .then((res) => {
            console.log('[AppInitializer] 유저 정보 성공', res.data);
            setUser(res.data);  
            navigate('/');
        })
        .catch((err) => {
            console.error('[AppInitializer] 유저 정보 실패', err);
            navigate('/login');
        });
    }
    }, [setUser, navigate]);

  return null; // 렌더링 안 함
}

export default AppInitializer;