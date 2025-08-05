import { Navigate } from 'react-router-dom';
import useUserStore from '../store/userStore';

export default function ProtectedRoute({ children }) {
  const { user } = useUserStore();
  const token = sessionStorage.getItem('token');

  // 복원 시도 중
  if (user === undefined && token) {
    return <div>자동 로그인 중...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />; // replace 옵션도 사용하면 히스토리 루프 제거
  }

  return children;
}
