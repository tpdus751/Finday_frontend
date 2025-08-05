import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../services/api';
import useUserStore from '../store/userStore';
import { useNavigate } from 'react-router-dom';

export default function AccountConnectPage() {
  const { user } = useUserStore();
  const [availableBanks, setAvailableBanks] = useState([]);
  const [selectedBanks, setSelectedBanks] = useState([]);
  const navigate = useNavigate();

  const userNo = user?.userNo;
  const userSpecificNo = user?.userSpecificNo;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/bank/not_connected', { params: { userNo } });
        setAvailableBanks(res.data);
      } catch (err) {
        console.error('연동 가능 은행 목록 조회 실패:', err);
      }
    };
    fetchData();
  }, [userNo]);

  const toggleBank = (bank) => {
    if (selectedBanks.includes(bank)) {
      setSelectedBanks(selectedBanks.filter(b => b !== bank));
    } else {
      setSelectedBanks([...selectedBanks, bank]);
    }
  };

  const handleNext = () => {
    if (selectedBanks.length === 0) return;
    navigate('/accounts/connect/consent', {
      state: {
        selectedBanks,
        userSpecificNo
      }
    });
  };

  return (
    <PageWrapper>
      <Card>
        <Title>연동할 계좌 금융사 선택하기</Title>
        {availableBanks.length === 0 ? (
          <Notice>연동 가능한 금융사가 없습니다.</Notice>
        ) : (
          <>
            <BankGrid>
              {availableBanks.map(bank => (
                <BankCard
                  key={bank}
                  selected={selectedBanks.includes(bank)}
                  onClick={() => toggleBank(bank)}
                >
                  <BankText>{bank}</BankText>
                </BankCard>
              ))}
            </BankGrid>
            <SubmitButton onClick={handleNext} disabled={selectedBanks.length === 0}>
              다음
            </SubmitButton>
          </>
        )}
      </Card>
    </PageWrapper>
  );
}

// 스타일 컴포넌트
const PageWrapper = styled.div`
  background: #0a0a0a;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const Card = styled.div`
  background: #141414;
  padding: 2.5rem;
  border-radius: 18px;
  width: 100%;
  max-width: 560px;
  box-shadow: 0 0 20px rgba(0, 255, 174, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const Title = styled.h2`
  color: #fff;
  font-size: 1.6rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const Notice = styled.p`
  color: #888;
  font-style: italic;
  text-align: center;
`;

const BankGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BankCard = styled.div`
  background: ${({ selected }) => (selected ? '#00ffae' : '#1a1a1a')};
  color: ${({ selected }) => (selected ? '#000' : '#ccc')};
  padding: 1.2rem 1rem;
  border-radius: 14px;
  text-align: center;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ selected }) =>
    selected ? '0 0 12px rgba(0, 255, 174, 0.5)' : '0 0 8px rgba(0, 0, 0, 0.2)'};

  &:hover {
    transform: scale(1.04);
  }
`;

const BankText = styled.div`
  font-size: 1rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.9rem;
  font-size: 1rem;
  font-weight: bold;
  background: #00ffae;
  color: #0a0a0a;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #00e3a0;
    transform: scale(1.02);
  }

  &:disabled {
    background: #444;
    color: #999;
    cursor: not-allowed;
  }
`;
