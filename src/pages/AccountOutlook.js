// pages/AccountOutlook.js
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SideMenuDrawer from '../components/SideMenuDrawer';
import { FaWallet, FaRegCalendarAlt } from 'react-icons/fa';
import api from '../services/api';
import useUserStore from '../store/userStore';
import { useNavigate } from 'react-router-dom';
import FaceAuthModal from '../components/FaceAuthModal';

export default function AccountOutlook() {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState(null);
  const { user } = useUserStore();
  const userSpecificNo = user?.userSpecificNo;
  const navigate = useNavigate();
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState(null);

  useEffect(() => {
    const fetchConnectedAccounts = async () => {
      try {
        const res = await api.get('/bank/connected', {
          params: { 
            userNo: user?.userNo,
            userSpecificNo: userSpecificNo // ✅ 사용자 고유 번호 전달
           }
        }); // ✅ 은행 연결 여부 확인
        console.log('연결된 계좌:', res.data);
        setAccounts(res.data); // ✅ 연결된 은행명 배열 or 계좌 배열
      } catch (e) {
        console.error('연동된 계좌 조회 실패:', e);
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConnectedAccounts();
  }, []);

  useEffect(() => {
    if (accounts.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % accounts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [accounts]);

  return (
    <Wrapper>
      <Header onMenuClick={() => setDrawerOpen(true)} />
      {isDrawerOpen && <SideMenuDrawer visible onClose={() => setDrawerOpen(false)} />}

      <Content>
        <TitleWrapper>
          <Title>연결된 계좌</Title>
          <AddAccountButton onClick={() => navigate('/accounts/connect')}>
            + 계좌 연동
          </AddAccountButton>
        </TitleWrapper>

        {loading ? (
          <LoadingMsg>불러오는 중...</LoadingMsg>
        ) : accounts.length === 0 ? (
          <EmptyState>
            <EmptyMsg>아직 연동된 계좌가 없어요</EmptyMsg>
            <ConnectDescription>금융 계좌를 연동하고 자산을 한눈에 관리해보세요.</ConnectDescription>
            <ConnectButton onClick={() => navigate('/accounts/connect')}>
              계좌 연동하기
            </ConnectButton>
          </EmptyState>
        ) : (
          <CardListWrapper>
            {accounts.map((acc, index) => {
              const gap = 250;
              const offset = (index - activeIndex) * gap;
              const isActive = hoverIndex === null && index === activeIndex;
              const isHovered = hoverIndex === index;


              return (
                <AccountCard
                  key={acc.accountNumber}
                  offset={offset}
                  isActive={isActive}
                  isHovered={isHovered}
                  closed={acc.status === 'CLOSED'}
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  <IconWrapper><FaWallet size={22} /></IconWrapper>
                  <Info>
                    <BankNameWithLogo>
                      {acc.bankLogoImgUrl && <BankLogo src={acc.bankLogoImgUrl} alt="bank logo" />}
                      <AccountNameText>{acc.accountName}</AccountNameText>
                    </BankNameWithLogo>
                    <AccountNumber>{acc.accountNumber}</AccountNumber>
                    <Alias>{acc.alias}</Alias>

                    <Row small>
                      <DateWrapper>
                        <FaRegCalendarAlt size={12} />
                        <DateText>{acc.createdAt?.substring(0, 10)}</DateText>
                      </DateWrapper>
                      {acc.status === 'CLOSED' && <ClosedTag>해지됨</ClosedTag>}
                    </Row>

                    <Balance>{Number(acc.balance).toLocaleString()}원</Balance>

                    {acc.status !== 'CLOSED' && (
                      <Row>
                        <TransferButton
                          onClick={() => {
                            setPendingTransfer({ bank: acc.bankName, accountNumber: acc.accountNumber });
                            setAuthModalVisible(true);
                          }}
                        >
                          이체
                        </TransferButton>
                      </Row>
                    )}
                  </Info>
                </AccountCard>
              );
            })}
          </CardListWrapper>
        )}
      </Content>

      {authModalVisible && (
        <FaceAuthModal
          email={user?.email}
          faceImgUrl={user?.faceImgUrl}
          onSuccess={() => {
            setAuthModalVisible(false);
            if (pendingTransfer)
              navigate(`/accounts/transfer?bank=${pendingTransfer.bank}&accountNumber=${pendingTransfer.accountNumber}`);
          }}
          onClose={() => setAuthModalVisible(false)}
        />
      )}

      <Footer />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background: #0A0A0A;
  color: #fff;
  min-height: 100vh;
`;

const Content = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TitleWrapper = styled.div`
  width: 100%;
  position: relative;
  margin-bottom: 2.5rem;
`;

const Title = styled.h2`
  font-size: 1.4rem;
  text-align: center;
`;

const CreateButton = styled.button`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background-color: #00ffae;
  color: #0a0a0a;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background-color: #00e39a;
  }
`;

const LoadingMsg = styled.p`
  opacity: 0.6;
  font-style: italic;
  text-align: center;
`;

const EmptyMsg = styled.p`
  opacity: 0.7;
  text-align: center;
  font-style: italic;
  padding: 1rem;
`;

const CardListWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 350px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
`;

const AccountCard = styled.div`
  position: absolute;
  width: 280px;
  height: 280px;
  padding: 1.2rem;
  border-radius: 16px;
  background: ${({ closed }) => (closed ? '#1a1a1a' : '#141414')};
  border-left: 4px solid ${({ closed }) => (closed ? '#e74c3c' : '#00ffae')};
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;

  ${({ offset, isActive, isHovered }) => {
    const scale = isHovered ? 1.08 : isActive ? 1.05 : 1;
    const z = isHovered ? 1000 : isActive ? 100 : 1;
    const shadow = isHovered || isActive
      ? '0 12px 24px rgba(0, 255, 174, 0.3)'
      : '0 4px 10px rgba(0,0,0,0.2)';
    return `
      transform: translateX(${offset}px) scale(${scale});
      z-index: ${z};
      box-shadow: ${shadow};
    `;
  }}

  transition: transform 0.5s ease, box-shadow 0.3s ease, z-index 0.3s ease;
`;

const IconWrapper = styled.div`
  margin-top: 4px;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  height: 100%;
`;

const BankName = styled.div`
  text-align: center;
  font-size: 1.8rem;
  color: #ccc;
  font-weight: 500;
  margin-bottom: 0.3rem;
`;

const AccountNumber = styled.div`
  text-align: center;
  font-size: 1.1rem;
  font-weight: bold;
  color: #fff;
  margin-bottom: 0.4rem;
`;

const Alias = styled.div`
  text-align: center;
  font-size: 0.95rem;
  color: #00ffae;
  font-weight: 600;
  margin-bottom: 0.8rem;
`;

const Row = styled.div`
  display: flex;
  justify-content: ${({ small }) => (small ? 'center' : 'space-between')};
  align-items: center;
  gap: ${({ small }) => (small ? '0.6rem' : '0')};
  font-size: ${({ small }) => (small ? '0.75rem' : '0.85rem')};
  color: ${({ small }) => (small ? '#aaa' : '#ddd')};
  opacity: ${({ small }) => (small ? 0.7 : 1)};
  margin-bottom: ${({ small }) => (small ? '0.8rem' : '1rem')};
`;


const Balance = styled.div`
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #00ffae;
`;

const DateWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DateText = styled.span`
  font-size: 0.75rem;
`;

const ClosedTag = styled.span`
  background: #e74c3c;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 8px;
  margin-left: auto;
`;

const TransferButton = styled.button`
  margin: 0.8rem auto 1.2rem;  // 하단 여백 1.2rem 추가
  padding: 0.5rem 4rem;
  font-size: 0.85rem;
  font-weight: 600;
  background-color: #00ffae;
  color: #0a0a0a;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 255, 174, 0.15);

  &:hover {
    background-color: #00e3a0;
    transform: scale(1.05);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
  max-width: 400px;
`;

const ConnectDescription = styled.div`
  font-size: 0.85rem;
  opacity: 0.6;
  margin-top: 0.5rem;
  margin-bottom: 1.2rem;
`;

const ConnectButton = styled.button`
  background-color: #00ffae;
  color: #0a0a0a;
  padding: 0.6rem 1.5rem;
  font-size: 0.9rem;
  font-weight: bold;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 255, 174, 0.3);

  &:hover {
    background-color: #00e3a0;
    transform: scale(1.03);
  }
`;

const AddAccountButton = styled.button`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background-color: #00ffae;
  color: #0a0a0a;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 255, 174, 0.3);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #00e3a0;
  }
`;

const BankNameWithLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
`;

const BankLogo = styled.img`
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 50%;      // ✅ 동그랗게 만듦
  background-color: #fff;  // ✅ 이미지가 없을 경우 대비
`;

const AccountNameText = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #ccc;
`;