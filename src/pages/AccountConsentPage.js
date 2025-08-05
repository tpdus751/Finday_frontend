import React from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AccountConsentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedBanks, userSpecificNo } = location.state || {};

  const handleConsent = async () => {
    try {
      const response = await api.post('/account/selected', {
        userSpecificNo,
        bankNames: selectedBanks
      });
      const result = response.data;

      if (!result || result.length === 0) {
        alert('연동할 계좌가 존재하지 않습니다.');
      } else {
        const bankNames = result.map(account => account.bankName);
        alert(`연동 완료: ${bankNames.join(', ')} 은행 계좌`);
      }

      navigate('/accounts'); // 연동 완료 후 계좌 목록으로 이동
    } catch (error) {
      console.error('계좌 연동 실패:', error);
      alert('계좌 연동 중 오류가 발생했습니다.');
    }
  };

  return (
    <PageWrapper>
      <Card>
        <Title>핀데이(Finday)와 정보 연동 동의</Title>

        <Section>
          <Label>선택한 은행 목록</Label>
          <ItemList>
            {selectedBanks?.map(bank => <Item key={bank}>{bank}</Item>)}
          </ItemList>
        </Section>

        <Section>
          <Label>정보 수집·이용 목적</Label>
          <p>통합 자산 조회 및 관리 서비스 제공</p>
        </Section>

        <Section>
          <Label>보유 및 이용기간</Label>
          <p>서비스 이용 종료 시까지</p>
        </Section>

        <ConsentButton onClick={handleConsent}>
          위 항목에 모두 동의하고 연동하기
        </ConsentButton>
      </Card>
    </PageWrapper>
  );
}

// 스타일
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
  color: white;
  box-shadow: 0 0 20px rgba(0, 255, 174, 0.08);
`;

const Title = styled.h2`
  text-align: center;
  font-size: 1.6rem;
  margin-bottom: 2rem;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.h4`
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const ItemList = styled.ul`
  list-style: disc;
  padding-left: 1.5rem;
`;

const Item = styled.li`
  color: #ddd;
`;

const ConsentButton = styled.button`
  margin-top: 2rem;
  width: 100%;
  padding: 0.9rem;
  font-weight: bold;
  font-size: 1rem;
  border-radius: 12px;
  border: none;
  background: #00ffae;
  color: #0a0a0a;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: #00e3a0;
  }
`;
