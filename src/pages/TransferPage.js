import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SideMenuDrawer from '../components/SideMenuDrawer';
import { useLocation, useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';
import api from '../services/api';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function TransferPage() {
  const query = useQuery();
  const fromBankName = query.get('bank');
  const fromAccountNumber = query.get('accountNumber');

  const { user } = useUserStore();
  const navigate = useNavigate();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [toBankName, setToBankName] = useState('');
  const [toAccountNumber, setToAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bankList, setBankList] = useState([]);
  const [accountFormat, setAccountFormat] = useState([]);
  const [accountPattern, setAccountPattern] = useState(null);
  const [accountFormatError, setAccountFormatError] = useState('');
  const [senderDisplay, setSenderDisplay] = useState('');
  const [receiverDisplay, setReceiverDisplay] = useState('');

  const bankFormats = {
    "국민은행": { pattern: /^\d{6}-\d{2}-\d{6}$/, format: [6, 2, 6] },
    "신한은행": { pattern: /^\d{3}-\d{2}-\d{6}-\d{1}$/, format: [3, 2, 6, 1] },
    "하나은행": { pattern: /^\d{3}-\d{6}-\d{2}-\d{3}$/, format: [3, 6, 2, 3] },
    "우리은행": { pattern: /^\d{4}-\d{3}-\d{6}$/, format: [4, 3, 6] },
    "농협은행": { pattern: /^\d{3}-\d{4}-\d{4}-\d{2}$/, format: [3, 4, 4, 2] },
    "SC제일은행": { pattern: /^\d{3}-\d{2}-\d{5}-\d{1}$/, format: [3, 2, 5, 1] },
    "카카오뱅크": { pattern: /^3333-\d{4}-\d{4}-\d{4}$/, format: [4, 4, 4, 4] },
    "케이뱅크": { pattern: /^\d{3}-\d{3}-\d{6}$/, format: [3, 3, 6] },
    "토스뱅크": { pattern: /^\d{4}-\d{4}-\d{4}$/, format: [4, 4, 4] },
  };

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await api.get('/bank/list');
        setBankList(res.data);
      } catch (e) {
        console.error("은행 목록 불러오기 실패:", e);
      }
    };
    fetchBanks();
  }, []);

  const handleBankChange = (e) => {
    const selected = e.target.value;
    setToBankName(selected);
    setToAccountNumber('');
    setAccountFormat(bankFormats[selected]?.format || []);
    setAccountPattern(bankFormats[selected]?.pattern || null);
    setAccountFormatError('');
  };

  const formatAccountNumber = (value, formatArray) => {
    const digits = value.replace(/\D/g, '');
    let result = '';
    let idx = 0;
    for (let i = 0; i < formatArray.length; i++) {
      const part = digits.substr(idx, formatArray[i]);
      result += part;
      if (part.length === formatArray[i] && i < formatArray.length - 1) {
        result += '-';
      }
      idx += formatArray[i];
    }
    return result;
  };

  const handleAccountNumberChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    const maxLen = accountFormat.reduce((a, b) => a + b, 0);
    const trimmed = digitsOnly.slice(0, maxLen);
    const formatted = formatAccountNumber(trimmed, accountFormat);
    setToAccountNumber(formatted);

    if (accountPattern && accountPattern.test(formatted)) {
      setAccountFormatError('');
    } else {
      setAccountFormatError('계좌번호 형식에 맞지 않습니다.');
    }
  };

  const handleTransfer = async () => {
    if (!toBankName || !toAccountNumber || !amount) {
      setError('모든 항목을 입력해 주세요.');
      return;
    }
    if (accountPattern && !accountPattern.test(toAccountNumber)) {
      setError('계좌번호 형식을 다시 확인해 주세요.');
      return;
    }

    setError('');
    try {
      const res = await api.post('/account/transfer', {
        userName: user.name,
        fromBankName,
        fromAccountNumber,
        toBankName,
        toAccountNumber,
        amount: Number(amount),
        note,
        senderDisplay,
        receiverDisplay,
        userSpecificNo: user.userSpecificNo,
    });
      setSuccess('이체가 성공적으로 완료되었습니다.');
      setTimeout(() => navigate('/accounts'), 2000);
    } catch (e) {
      setError('이체에 실패했습니다. 정보를 다시 확인해 주세요.');
    }
  };

  return (
    <Wrapper>
      <Header onMenuClick={() => setDrawerOpen(true)} />
      {isDrawerOpen && <SideMenuDrawer visible onClose={() => setDrawerOpen(false)} />}
      <Content>
        <Title>계좌 이체</Title>
        <Section>
          <Label>출금 계좌</Label>
          <StaticInfo>{fromBankName} / {fromAccountNumber}</StaticInfo>

          <Label>입금 은행</Label>
          <Select value={toBankName} onChange={handleBankChange}>
            <option value="">은행 선택</option>
            {bankList.map((bankName, idx) => (
              <option key={idx} value={bankName}>{bankName}</option>
            ))}
          </Select>

          <Label>입금 계좌번호</Label>
          <Input
            value={toAccountNumber}
            onChange={handleAccountNumberChange}
            placeholder="계좌번호 형식에 맞게 입력"
            maxLength={30}
          />
          {accountFormatError && <ErrorMsg>{accountFormatError}</ErrorMsg>}

          <Label>이체 금액</Label>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={amount}
            onChange={(e) => {
                const numeric = e.target.value.replace(/\D/g, '');
                setAmount(numeric);
            }}
            placeholder="금액 (원)"
        />

          <Label>내 통장 표시 (선택)</Label>
            <Input
            value={senderDisplay}
            onChange={(e) => setSenderDisplay(e.target.value.slice(0, 100))}
            placeholder="(최대 100자)"
            maxLength={100}
            />

        <Label>받는 분 통장 표시 (선택)</Label>
            <Input
            value={receiverDisplay}
            onChange={(e) => setReceiverDisplay(e.target.value.slice(0, 100))}
            placeholder="(최대 100자)"
            maxLength={100}
            />

          {error && <ErrorMsg>{error}</ErrorMsg>}
          {success && <SuccessMsg>{success}</SuccessMsg>}

          <ButtonGroup>
            <BackButton onClick={() => navigate(-1)}>← 뒤로가기</BackButton>
            <TransferButton onClick={handleTransfer}>이체하기</TransferButton>
          </ButtonGroup>
        </Section>
      </Content>
      <Footer />
    </Wrapper>
  );
}

// 스타일 컴포넌트 생략 없이 동일하게 유지
const Wrapper = styled.div`
  background: #0a0a0a;
  color: #fff;
  min-height: 100vh;
`;

const Content = styled.div`
  padding: 2rem 1.5rem;
  max-width: 480px;
  margin: 0 auto;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.6rem;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
`;

const Input = styled.input`
  padding: 0.6rem 1rem;
  border-radius: 10px;
  border: none;
  background: #1a1a1a;
  color: #fff;
  font-size: 1rem;
  outline: none;
`;

const Select = styled.select`
  padding: 0.6rem 1rem;
  border-radius: 10px;
  border: none;
  background: #1a1a1a;
  color: #fff;
  font-size: 1rem;
  outline: none;
  appearance: none;
`;

const StaticInfo = styled.div`
  padding: 0.6rem 1rem;
  background: #1a1a1a;
  border-radius: 10px;
  color: #ccc;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  gap: 1rem;
`;

const BackButton = styled.button`
  flex: 1;
  background: none;
  border: 1px solid #00ffae;
  color: #00ffae;
  font-size: 0.95rem;
  font-weight: bold;
  padding: 0.7rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    background: rgba(0, 255, 174, 0.1);
  }
`;

const TransferButton = styled.button`
  flex: 1;
  background-color: #00ffae;
  color: #0a0a0a;
  padding: 0.7rem;
  font-size: 0.95rem;
  font-weight: bold;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    background-color: #00e3a0;
    transform: scale(1.05);
  }
`;

const ErrorMsg = styled.p`
  color: #ff5555;
  font-size: 0.85rem;
  margin-top: -0.5rem;
`;

const SuccessMsg = styled.p`
  color: #00ffae;
  font-size: 0.85rem;
  margin-top: -0.5rem;
`;
