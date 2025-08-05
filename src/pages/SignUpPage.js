import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    gender: '',
    birthDate: '',
    phoneNumber: '',
    address: '',
    faceImage: null,
  });
  const [error, setError] = useState('');
  const [passwordMatchMessage, setPasswordMatchMessage] = useState('');
  const [isPasswordMatch, setIsPasswordMatch] = useState(null);

  const handleChange = (e) => {
  const { name, value, files } = e.target;

  if (name === 'phoneNumber') {
    const onlyNums = value.replace(/\D/g, '');
    let formatted = onlyNums;

    if (onlyNums.length > 3 && onlyNums.length <= 7) {
      formatted = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
    } else if (onlyNums.length > 7) {
      formatted = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7)}`;
    }

    setForm((prev) => ({ ...prev, phoneNumber: formatted }));
    return;
  }

  if (name === 'faceImage') {
    setForm((prev) => ({ ...prev, faceImage: files[0] }));
    return;
  }

  // 일반 입력
  setForm((prev) => ({ ...prev, [name]: value }));

  // 비밀번호 일치 + 정규식 체크는 비밀번호 확인 시점에서만 함
  if (name === 'confirmPassword') {
    const pw = form.password;
    const confirm = value;
    const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!pwRegex.test(pw)) {
      setPasswordMatchMessage('비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다.');
      setIsPasswordMatch(false);
      return;
    }

    if (pw && confirm) {
      if (pw === confirm) {
        setPasswordMatchMessage('비밀번호가 일치합니다.');
        setIsPasswordMatch(true);
      } else {
        setPasswordMatchMessage('비밀번호가 일치하지 않습니다.');
        setIsPasswordMatch(false);
      }
    } else {
      setPasswordMatchMessage('');
      setIsPasswordMatch(null);
    }
  }
};



  const validateForm = () => {
  const {
    email, password, confirmPassword, name, phoneNumber
  } = form;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !password || !confirmPassword || !name || !phoneNumber) {
    return '모든 필수 항목을 입력해주세요.';
  }

  if (!emailRegex.test(email)) {
    return '올바른 이메일 형식을 입력해주세요.';
  }

  if (password !== confirmPassword) {
    return '비밀번호가 일치하지 않습니다.';
  }

  return null;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const {
      confirmPassword,
      faceImage,
      ...dataToSubmit
    } = form;

    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(dataToSubmit)], { type: "application/json" }));
    if (faceImage) {
      formData.append("faceImage", faceImage);
    }

    try {
      await api.post("/user/auth/signup", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("회원가입이 완료되었습니다.");
      navigate("/login");
    } catch (e) {
      setError(e.response?.data?.message || "회원가입에 실패했습니다.");
    }
  };

  return (
    <Wrapper>
      <SignUpCard onSubmit={handleSubmit}>
        <Title>Finday 회원가입</Title>

        <Input name="email" type="email" placeholder="이메일" onChange={handleChange} />
        <Input name="password" type="password" placeholder="비밀번호" onChange={handleChange} />
        <Input name="confirmPassword" type="password" placeholder="비밀번호 확인" onChange={handleChange} />
        {passwordMatchMessage && (
          <PasswordMessage match={isPasswordMatch}>
            {passwordMatchMessage}
          </PasswordMessage>
        )}

        <Input name="name" type="text" placeholder="이름" maxLength={50} onChange={handleChange} />
        <Select name="gender" onChange={handleChange} defaultValue="">
          <option value="" disabled>성별 선택</option>
          <option value="M">남성</option>
          <option value="F">여성</option>
        </Select>
        <Input name="birthDate" type="date" onChange={handleChange} />
        <Input
            name="phoneNumber"
            type="text"
            maxLength={13}
            placeholder="휴대폰 번호"
            value={form.phoneNumber}
            onChange={handleChange}
            />
        <TextArea name="address" placeholder="주소 입력" rows="2" onChange={handleChange} />
        <Label>얼굴 이미지 등록</Label>
        <Input name="faceImage" type="file" accept="image/*" onChange={handleChange} />

        {error && <ErrorMsg>{error}</ErrorMsg>}
        <SubmitButton type="submit">가입하기</SubmitButton>
      </SignUpCard>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f2f4f6;
`;

const SignUpCard = styled.form`
  background: white;
  padding: 40px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 420px;
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

const Select = styled.select`
  padding: 12px 14px;
  font-size: 15px;
  margin-bottom: 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const TextArea = styled.textarea`
  padding: 12px 14px;
  font-size: 15px;
  margin-bottom: 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  resize: none;
`;

const Label = styled.label`
  font-size: 14px;
  margin: 8px 0 4px;
`;

const SubmitButton = styled.button`
  background-color: #007aff;
  color: white;
  padding: 12px;
  font-size: 16px;
  border: none;
  border-radius: 10px;
  margin-top: 12px;
  cursor: pointer;

  &:hover {
    background-color: #005fc1;
  }
`;

const ErrorMsg = styled.div`
  color: #e74c3c;
  font-size: 14px;
  margin-top: 8px;
  text-align: center;
`;

const PasswordMessage = styled.div`
  font-size: 14px;
  margin-top: -12px;
  margin-bottom: 14px;
  color: ${(props) => (props.match ? '#2ecc71' : '#e74c3c')};
  text-align: left;
`;
