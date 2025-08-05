import React from 'react';
import styled from 'styled-components';

const PaymentMethodModal = ({ accounts, cards, selected, onSelect, onClose }) => {
  return (
    <Overlay>
      <ModalContainer>
        <Title>결제수단 선택</Title>

        <Section>
          <SectionTitle>계좌</SectionTitle>
          {accounts.length === 0 ? (
            <EmptyText>연동된 계좌가 없습니다.</EmptyText>
          ) : (
            accounts.map((account, idx) => (
              <OptionBox
                key={`account-${idx}`}
                active={
                    selected?.type === 'account' &&
                    selected?.data?.accountName === account.accountName
                    }
                onClick={() => onSelect({ type: 'account', data: account })}
              >
                <AccountItem>
                  {account.bankLogoImgUrl && (
                    <BankLogo src={account.bankLogoImgUrl} alt="bank logo" />
                  )}
                  <AccountTextBox>
                    <AccountName>{account.accountName}</AccountName>
                    <BankInfo>{account.bankName} {account.accountNumber}</BankInfo>
                  </AccountTextBox>
                </AccountItem>
              </OptionBox>
            ))
          )}
        </Section>

        <Section>
          <SectionTitle>카드</SectionTitle>
          {cards.length === 0 ? (
            <EmptyText>연결된 카드가 없습니다.</EmptyText>
          ) : (
            cards.map((card, idx) => (
              <OptionBox
                key={`card-${idx}`}
                active={
                    selected?.type === 'card' &&
                    selected?.data?.cardName === card.cardName
                    }
                onClick={() => onSelect({ type: 'card', data: card })}
              >
                <CardItem>
                  <CardImage src={card.cardImgUrl} alt="카드 이미지" />
                  <CardTextBox>
                    <CardName>{card.cardName}</CardName>
                    <CardNumber>{card.cardNumber}</CardNumber>
                  </CardTextBox>
                </CardItem>
              </OptionBox>
            ))
          )}
        </Section>

        <CloseButton onClick={onClose}>닫기</CloseButton>
      </ModalContainer>
    </Overlay>
  );
};

export default PaymentMethodModal;


const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContainer = styled.div`
  background: #1a1a1a;
  color: white;
  width: 90%;
  max-width: 500px;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const OptionBox = styled.div`
  background: ${({ active }) => (active ? '#00ffae' : '#2a2a2a')};
  color: ${({ active }) => (active ? '#000' : '#fff')};
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ active }) => (active ? '#00e39a' : '#3a3a3a')};
  }
`;


const EmptyText = styled.p`
  opacity: 0.6;
  font-style: italic;
  font-size: 0.9rem;
`;

const CloseButton = styled.button`
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 12px;
  background: #555;
  color: white;
  cursor: pointer;

  &:hover {
    background: #777;
  }
`;

const AccountTextBox = styled.div`
  display: flex;
  flex-direction: column;
`;

const AccountName = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.2rem;
`;

const BankInfo = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const CardItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const CardImage = styled.img`
  width: 60px;
  height: 50px;
  object-fit: contain;
  border-radius: 4px;
  background: #555

  &:hover {
    background: #3a3a3a;
  }
`;

const CardTextBox = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardName = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
`;

const CardNumber = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const AccountItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-height: unset; 
  margin-left: 0.85rem;     // ✅ 강제 높이 제거
`;

const BankLogo = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #fff;
  margin-right: 0.6rem;  // ✅ 불필요한 위아래 여백 제거
`;