import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import SideMenuDrawer from '../components/SideMenuDrawer';
import Footer from '../components/Footer';
import api from '../services/api';
import useUserStore from '../store/userStore';
import { useNavigate } from 'react-router-dom';

const CardManagePage = () => {
  const [cards, setCards] = useState([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [rotatedIndices, setRotatedIndices] = useState(new Set());

  const handleImageOrientation = (e) => {
    const img = e.target;
    const index = parseInt(img.dataset.index);
    if (img.naturalWidth > img.naturalHeight) {
      setRotatedIndices(prev => new Set(prev).add(index));
    }
  };

  useEffect(() => {
    const fetchConnectedCards = async () => {
      try {
        const res = await api.get('/card/connected', {
          params: {
            userNo: user?.userNo,
            userSpecificNo: user?.userSpecificNo,
          },
        });
        setCards(res.data || []);
        console.log('연결된 카드 목록:', res.data);
      } catch (error) {
        console.error('카드 조회 실패:', error);
        setCards([]);
      }
    };

    fetchConnectedCards();
  }, []);

  const isEmpty = cards.length === 0;

  return (
    <Container>
      <Header onMenuClick={() => setDrawerOpen(true)} />
      {isDrawerOpen && <SideMenuDrawer visible onClose={() => setDrawerOpen(false)} />}

      <Main>
        <TopBar>
          <Title>연결된 카드</Title>
          <ConnectBtn onClick={() => navigate('/cards/connect')}>
            + 카드 연동
          </ConnectBtn>
        </TopBar>

        {isEmpty ? (
          <EmptyState>
            <p>연결된 카드 정보가 없습니다.</p>
          </EmptyState>
        ) : (
          <CardGrid>
            {cards.map((card, idx) => (
              <CardBox key={idx}>
                <CardImageWrapper>
                  <CardImage
                    src={card.cardImgUrl}
                    alt={card.cardName}
                    onLoad={(e) => handleImageOrientation(e)}
                    data-index={idx}
                    style={{ transform: rotatedIndices.has(idx) ? 'rotate(90deg)' : 'none' }}
                  />
                </CardImageWrapper>
                <BankName>{card.bankName}</BankName>
                <CardName>{card.cardName}</CardName>
                <ConnectedDate>
                  발급일자 : {new Date(card.createdAt).toLocaleDateString()}
                </ConnectedDate>
              </CardBox>
            ))}
          </CardGrid>
        )}
      </Main>

      <Footer>©2025 Finday</Footer>
    </Container>
  );
};

export default CardManagePage;

// Styled Components
const Container = styled.div`background: #0A0A0A; color: #fff; min-height: 100vh;`;
const Main = styled.main`
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Title = styled.h2`
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  text-align: center;
  width: 100%;
`;
const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center; /* ✅ 항상 가운데 정렬 */
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
`;
const CardBox = styled.div`
  background: #1e1e1e;
  padding: 1rem;
  border-radius: 14px;
  border: 1px solid #444;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 240px; /* ✅ 카드 크기 고정 */
  flex: 0 0 auto; /* ✅ 줄바꿈 시 자동 줄 정렬 */
`;

const CardImageWrapper = styled.div`
  width: 100%;
  max-width: 180px;
  aspect-ratio: 3 / 4; /* ✅ 모든 카드를 세로 비율로 고정 */
  background: #000;
  margin-bottom: 0.6rem;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CardImage = styled.img`
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
  transition: transform 0.4s ease;

  ${CardBox}:hover & {
    transform: scale(1.05);
  }
`;
const BankName = styled.div`font-weight: bold; font-size: 1rem; margin-bottom: 0.3rem;`;
const CardName = styled.div`font-size: 0.95rem;`;
const ConnectedDate = styled.div`font-size: 0.75rem; opacity: 0.6; margin-top: 0.4rem;`;

const EmptyState = styled.div`
  text-align: center;
  margin-top: 3rem;
  font-size: 1rem;
  color: #bbb;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 1.5rem;
`;

const ConnectBtn = styled.button`
  background-color: #00ffae;
  color: #0a0a0a;
  padding: 0.5rem 1.2rem; /* ✅ 충분한 공간 확보 */
  font-size: 0.95rem;      /* ✅ 약간 줄임 */
  font-weight: bold;
  white-space: nowrap;     /* ✅ 줄바꿈 방지 */
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 255, 174, 0.3);

  &:hover {
    background-color: #00e3a0;
    transform: scale(1.03);
  }
`;