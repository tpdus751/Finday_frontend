// pages/LoginPage.js
import { useState } from 'react';
import styled from 'styled-components';
import api from '../services/api';
import useUserStore from '../store/userStore';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useUserStore();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !pw) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/user/auth/login', {
        email,
        password: pw,
      }, { 
        headers: {
          'Content-Type': 'application/json' // ✅ 이걸 명시해야 함
        }
      });
      console.log('로그인 성공:', res.data);
      setUser(res.data); // user 객체 저장
      navigate('/');
    } catch (e) {
      const msg =
        e.response?.data || '로그인에 실패했습니다. 정보를 다시 확인해주세요.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <LoginCard>
        <Title>Finday 뱅킹 로그인</Title>

        <Input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <LoginButton onClick={handleLogin} disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </LoginButton>

        <Divider />
        <OptionRow>
          <button>회원가입</button>
          <button>비밀번호 찾기</button>
        </OptionRow>
      </LoginCard>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
  background: #f2f4f6;
`;

const LoginCard = styled.div`
  background: white;
  padding: 40px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 24px;
  font-size: 22px;
  font-weight: 700;
`;

const Input = styled.input`
  padding: 12px 14px;
  font-size: 15px;
  margin-bottom: 14px;
  border: 1px solid #ccc;
  border-radius: 8px;

  &:focus {
    outline: none;
    border-color: #007aff;
  }
`;

const LoginButton = styled.button`
  background-color: #007aff;
  color: white;
  padding: 12px;
  font-size: 16px;
  border: none;
  border-radius: 10px;
  margin-top: 8px;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background-color: #005fc1;
  }

  &:disabled {
    background-color: #a2c6f7;
    cursor: not-allowed;
  }
`;

const ErrorMsg = styled.div`
  color: #e74c3c;
  font-size: 14px;
  margin-bottom: 8px;
  text-align: center;
`;

const Divider = styled.hr`
  margin: 24px 0;
  border: none;
  border-top: 1px solid #eee;
`;

const OptionRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;

  button {
    background: none;
    border: none;
    color: #007aff;
    cursor: pointer;
    padding: 0;

    &:hover {
      text-decoration: underline;
    }
  }
`;
