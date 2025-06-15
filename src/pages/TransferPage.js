// pages/TransferPage.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SideMenuDrawer from '../components/SideMenuDrawer';
import api from '../services/api';
import useUserStore from '../store/userStore';
import { FiArrowLeft } from 'react-icons/fi';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const accountPatterns = {
  "국민은행": /^\d{6}-\d{2}-\d{6}$/,
  "신한은행": /^\d{3}-\d{2}-\d{6}-\d{1}$/,
  "하나은행": /^\d{3}-\d{6}-\d{2}-\d{3}$/,
  "우리은행": /^\d{4}-\d{3}-\d{6}$/,
  "농협은행": /^\d{3}-\d{4}-\d{4}-\d{2}$/,
  "SC제일은행": /^\d{3}-\d{2}-\d{5}-\d{1}$/,
  "카카오뱅크": /^3333-\d{4}-\d{4}-\d{4}$/,
  "케이뱅크": /^\d{3}-\d{3}-\d{6}$/,
  "토스뱅크": /^\d{10}$/,
  "부산은행": /^\d{3}-\d{4}-\d{4}-\d{2}$/,
  "대구은행": /^\d{3}-\d{2}-\d{6}-\d{1}$/,
  "광주은행": /^\d{3}-\d{4}-\d{4}-\d{2}$/,
  "전북은행": /^\d{3}-\d{4}-\d{4}-\d{2}$/,
  "제주은행": /^\d{2}-\d{2}-\d{6}$/
};

const formatAccountNumber = (raw, bankName) => {
  const numeric = raw.replace(/\D/g, "");
  switch (bankName) {
    case "국민은행":
      return numeric.replace(/(\d{6})(\d{2})(\d{0,6})/, "$1-$2-$3").substring(0, 17);
    case "신한은행":
      return numeric.replace(/(\d{3})(\d{2})(\d{6})(\d{0,1})/, "$1-$2-$3-$4").substring(0, 15);
    case "하나은행":
      return numeric.replace(/(\d{3})(\d{6})(\d{2})(\d{0,3})/, "$1-$2-$3-$4").substring(0, 17);
    case "우리은행":
      return numeric.replace(/(\d{4})(\d{3})(\d{0,6})/, "$1-$2-$3").substring(0, 15);
    case "농협은행":
      return numeric.replace(/(\d{3})(\d{4})(\d{4})(\d{0,2})/, "$1-$2-$3-$4").substring(0, 19);
    case "SC제일은행":
      return numeric.replace(/(\d{3})(\d{2})(\d{5})(\d{0,1})/, "$1-$2-$3-$4").substring(0, 14);
    case "카카오뱅크":
      return numeric.replace(/(3333)(\d{4})(\d{4})(\d{0,4})/, "$1-$2-$3-$4").substring(0, 19);
    case "케이뱅크":
      return numeric.replace(/(\d{3})(\d{3})(\d{0,6})/, "$1-$2-$3").substring(0, 14);
    case "토스뱅크":
      return numeric.substring(0, 10);
    case "부산은행":
    case "광주은행":
    case "전북은행":
      return numeric.replace(/(\d{3})(\d{4})(\d{4})(\d{0,2})/, "$1-$2-$3-$4").substring(0, 16);
    case "대구은행":
      return numeric.replace(/(\d{3})(\d{2})(\d{6})(\d{0,1})/, "$1-$2-$3-$4").substring(0, 15);
    case "제주은행":
      return numeric.replace(/(\d{2})(\d{2})(\d{0,6})/, "$1-$2-$3").substring(0, 12);
    default:
      return numeric.replace(/(\d{3})(\d{0,8})/, "$1-$2").substring(0, 12);
  }
};



export default function TransferPage() {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [account, setAccount] = useState(null);
  const [toAccount, setToAccount] = useState('');
  const [toBank, setToBank] = useState('');
  const [bankList, setBankList] = useState([]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [recipientName, setRecipientName] = useState('');

  const query = useQuery();
  const accountNo = query.get('accountNo');
  const { user } = useUserStore();
  const userNo = user?.userNo;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await api.get(`/account/one`, { params: { accountNo } });
        setAccount({ ...res.data });
      } catch (err) {
        console.error(err);
        setError('계좌 정보를 불러올 수 없습니다.');
      }
    };

    fetchAccount();
    const interval = setInterval(fetchAccount, 5000);
    return () => clearInterval(interval);
  }, [accountNo]);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await api.get('/bank/list');
        setBankList(res.data);
      } catch (err) {
        console.error('은행 목록 불러오기 실패:', err);
      }
    };
    fetchBanks();
  }, []);

  const handleAccountInput = (e) => {
    const raw = e.target.value;
    const formatted = formatAccountNumber(raw, toBank);
    setToAccount(formatted);

    if (toBank && accountPatterns[toBank]) {
      const regex = accountPatterns[toBank];
      setError(!regex.test(formatted) ? '해당 은행의 계좌번호 형식에 맞지 않습니다.' : '');
    }
  };

  const handleBankChange = (e) => {
    const newBank = e.target.value;
    const numeric = toAccount.replace(/\D/g, "");
    const formatted = formatAccountNumber(numeric, newBank);
    setError(accountPatterns[newBank] && !accountPatterns[newBank].test(formatted)
      ? '현재 입력된 계좌번호는 선택한 은행의 형식과 맞지 않아 자동 초기화됩니다.'
      : '');
    setToAccount(accountPatterns[newBank]?.test(formatted) ? formatted : '');
    setToBank(newBank);
  };

  const handleAccountKeyDown = (e) => {
    const pos = e.target.selectionStart;
    if (e.key === 'Backspace' && pos > 0 && toAccount[pos - 1] === '-') {
      const newVal = toAccount.slice(0, pos - 2) + toAccount.slice(pos);
      setToAccount(newVal.replace(/\D/g, ''));
      e.preventDefault();
    }
  };

  const openConfirmModal = async () => {
  if (!toAccount || !toBank || !amount || parseFloat(amount) <= 0) {
    setError('은행, 계좌번호, 금액을 모두 올바르게 입력해주세요.');
    return;
  }

  try {
    // 수취인 이름 확인
    const res = await api.get('/account/owner', {
      params: {
        accountNumber: toAccount,
        bankName: toBank,
      },
    });

    // 최신 잔액 불러오기
    const resAcc = await api.get(`/account/one`, { params: { accountNo } });
    const latestBalance = resAcc.data.balance;
    const enteredAmount = parseFloat(amount);

    // 잔액 비교
    if (enteredAmount > latestBalance) {
      setError('잔액이 부족합니다.');
      return;
    } else {
      setError(''); // ✅ 조건을 통과했으니 잔액 부족 에러 제거
    }

    setRecipientName(res.data.name);
    setShowConfirmModal(true);

  } catch (err) {
    console.error(err);
    setError('수취 계좌를 찾을 수 없습니다.');
  }
};

  const confirmTransfer = async () => {
    try {
      setLoading(true);
      const resAcc = await api.get(`/account/one`, { params: { accountNo } });
      const latestBalance = resAcc.data.balance;
      if (latestBalance < parseFloat(amount)) {
        setError('잔액이 부족합니다.');
        setShowConfirmModal(false);
        return;
      }

      await api.post('/account/transfer', {
        fromAccountNo: accountNo,
        toAccountNumber: toAccount,
        toBank,
        amount: parseFloat(amount),
        userNo,
      });

      setSuccess('이체가 완료되었습니다.');
      setToAccount('');
      setToBank('');
      setAmount('');
      setShowConfirmModal(false);
    } catch (e) {
      setError(e.response?.data || '이체 중 오류 발생');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Header onMenuClick={() => setDrawerOpen(true)} />
      {isDrawerOpen && <SideMenuDrawer visible onClose={() => setDrawerOpen(false)} />}
      <Content>
        <Title>계좌 이체</Title>
        {account ? (
          <Card>
            <BackRow>
              <BackIcon onClick={() => navigate(-1)}><FiArrowLeft size={18} /></BackIcon>
              <BackText onClick={() => navigate(-1)}>이전으로</BackText>
            </BackRow>
            <InfoRow><strong>출금 계좌:</strong> {account.bankName} {account.accountNumber}</InfoRow>
            <InfoRow><strong>현재 잔액:</strong> {Number(account.balance).toLocaleString()}원</InfoRow>

            <SectionTitle>수취 정보 입력</SectionTitle>
            <Label>수취 은행 선택</Label>
            <Select value={toBank} onChange={handleBankChange}>
              <option value="">-- 은행 선택 --</option>
              {bankList.map((bank) => (
                <option key={bank.bankNo} value={bank.bankName}>{bank.bankName}</option>
              ))}
            </Select>
            <Label>수취 계좌번호</Label>
            <Input
              value={formatAccountNumber(toAccount, toBank)}
              onChange={handleAccountInput}
              onKeyDown={handleAccountKeyDown}
              placeholder="계좌번호 입력"
            />
            <Label>이체 금액</Label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="예: 10000" />
            {error && <Error>{error}</Error>}
            {success && <Success>{success}</Success>}
            <TransferBtn onClick={openConfirmModal} disabled={loading}>
              {loading ? '이체 중...' : '이체하기'}
            </TransferBtn>
          </Card>
        ) : <p>계좌 정보를 불러오는 중...</p>}
      </Content>
      {showConfirmModal && (
        <ModalOverlay>
          <ModalBox>
            <ModalTitle>{recipientName} 님께 {Number(amount).toLocaleString()}원 이체합니다</ModalTitle>
            <ModalSub>{toBank} {toAccount}</ModalSub>
            <ModalBtnGroup>
              <ModalCancel onClick={() => setShowConfirmModal(false)}>취소</ModalCancel>
              <ModalConfirm onClick={confirmTransfer}>확인</ModalConfirm>
            </ModalBtnGroup>
          </ModalBox>
        </ModalOverlay>
      )}
      <Footer />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background: #0a0a0a;
  color: white;
  min-height: 100vh;
`;

const Content = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 1.6rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background: #1c1c1c;
  padding: 1.8rem;
  border-radius: 16px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 8px 24px rgba(0, 255, 174, 0.1);
`;

const InfoRow = styled.p`
  margin-bottom: 0.6rem;
  font-size: 0.95rem;
  color: #ccc;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  margin: 1.6rem 0 1rem;
  color: #00ffae;
`;

const Label = styled.label`
  display: block;
  margin-top: 1.2rem;
  font-size: 0.85rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-top: 0.4rem;
  background: #2a2a2a;
  border: 1px solid #444;
  color: white;
  border-radius: 8px;

  &:focus {
    outline: none;
    border-color: #00ffae;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin-top: 0.4rem;
  background: #2a2a2a;
  border: 1px solid #444;
  color: white;
  border-radius: 8px;

  &:focus {
    outline: none;
    border-color: #00ffae;
  }
`;

const TransferBtn = styled.button`
  margin-top: 2rem;
  width: 100%;
  padding: 0.8rem;
  background-color: #00ffae;
  border: none;
  border-radius: 9999px;
  color: black;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #00e39a;
  }

  &:disabled {
    background-color: #888;
    cursor: not-allowed;
  }
`;

const Error = styled.p`
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 1rem;
`;

const Success = styled.p`
  color: #00ffae;
  font-size: 0.85rem;
  margin-top: 1rem;
`;

const BackRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.2rem;
  cursor: pointer;
  color: #00ffae;
`;

const BackIcon = styled.div`
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
`;

const BackText = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;

// Modal 관련 styled-components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalBox = styled.div`
  background: #1e1e1e;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 6px 20px rgba(0, 255, 174, 0.3);
`;

const ModalTitle = styled.h4`
  font-size: 1.1rem;
  margin-bottom: 1rem;
`;

const ModalSub = styled.p`
  font-size: 0.9rem;
  color: #bbb;
  margin-bottom: 1.5rem;
`;

const ModalBtnGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

const ModalCancel = styled.button`
  flex: 1;
  background: #444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem;
  cursor: pointer;
`;

const ModalConfirm = styled.button`
  flex: 1;
  background: #00ffae;
  color: black;
  border: none;
  border-radius: 8px;
  padding: 0.6rem;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background: #00e39a;
  }
`;