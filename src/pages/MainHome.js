import React, { useRef, useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useFinanceStore } from '../store/financeStore';
import { FaMoneyBillWave, FaPiggyBank, FaChartPie, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Header from '../components/Header';
import SideMenuDrawer from '../components/SideMenuDrawer';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const totalAssets = useFinanceStore(s => s.totalAssets);
  const spendingByCategory = useFinanceStore(s => s.spendingBreakdown);
  const recommendedCard = useFinanceStore(s => s.recommendedCard);
  const recentTransactions = useFinanceStore(s => s.recentTransactions);
  const display = totalAssets !== undefined ? totalAssets.toLocaleString() : '...';

  const [centerIndex, setCenterIndex] = useState(0);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const carouselRef = useRef();
  const navigate = useNavigate();

  const cards = useMemo(() => [
    { title:'총 자산', content: (<><Amount>{display}</Amount><Subtitle>모든 계좌 합산</Subtitle></>) },
    { title:'소비 분석', content: spendingByCategory ?
        (<><ul>{spendingByCategory.slice(0,3).map(c=><li key={c.name}>{c.name}: <strong>{c.percent}%</strong></li>)}</ul><Subtitle>이번 달 지출 요약</Subtitle></>) :
        <Loading>분석 중...</Loading>
    },
    { title:'추천 카드', content: recommendedCard ?
        (<><Recommendation>{recommendedCard.name}</Recommendation><p>{recommendedCard.benefit}</p><LearnBtn>자세히 보기</LearnBtn></>) :
        <Loading>추천 중...</Loading>
    },
    { title:'최근 거래', content: (<><FilterLabel>기간:</FilterLabel><FilterSelect><option>최근30일</option><option>최근7일</option><option>오늘</option></FilterSelect><TransList>{recentTransactions ? recentTransactions.slice(0,3).map(t=><Trans key={t.id}><span>{t.date}</span><span>{t.merchant}</span><span>{t.amount}</span></Trans>) : <Loading>로딩중...</Loading>}</TransList></>) }
  ], [display, spendingByCategory, recommendedCard, recentTransactions]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCenterIndex(prev => (prev + 1) % cards.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [cards.length]);

  useEffect(() => {
    scrollTo(centerIndex);
  }, [centerIndex]);

  const scrollTo = (idx) => {
    requestAnimationFrame(() => {
      const container = carouselRef.current;
      const card = cardRefs.current[idx];
      if (!container || !card) return;
      const offset = card.offsetLeft - (container.offsetWidth - card.offsetWidth) / 2;
      container.scrollTo({ left: offset, behavior: 'smooth' });
    });
  };

  const cardRefs = useRef([]);
  const [zOrders, setZOrders] = useState([3, 2, 1, 0]);

  return (
    <Container>
      <Header onMenuClick={() => setDrawerOpen(true)} />
      {isDrawerOpen && <SideMenuDrawer visible={true} onClose={() => setDrawerOpen(false)} />}

      <Main>
        <CarouselWrapper>
          <Nav onClick={() => setCenterIndex((centerIndex - 1 + cards.length) % cards.length)}><FaChevronLeft/></Nav>
          <Carousel ref={carouselRef}>
            {cards.map((c, i) => (
              <Card
                key={i}
                ref={el => cardRefs.current[i] = el}
                onMouseEnter={() => {
                  const newZ = [...zOrders];
                  const maxZ = Math.max(...zOrders);
                  newZ[i] = maxZ + 1;
                  setZOrders(newZ);
                  setCenterIndex(i);
                  scrollTo(i);
                }}
                style={{ zIndex: zOrders[i] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                whileTap={{ cursor: 'grabbing' }}
                animate={{
                  scale: i === centerIndex ? 1 : 0.9,
                  opacity: i === centerIndex ? 1 : 0.5
                }}
                transition={{ duration: 0.15, type: 'spring', stiffness: 500, damping: 30 }}
              >
                <CardTitle>{c.title}</CardTitle>
                <CardContent>{c.content}</CardContent>
              </Card>
            ))}
          </Carousel>
          <Nav onClick={() => setCenterIndex((centerIndex + 1) % cards.length)}><FaChevronRight/></Nav>
        </CarouselWrapper>

        <QuickActions>
          <ActionCard onClick={() => navigate('/accounts')}>
            <FaPiggyBank size={20} />
            <ActionLabel>계좌 조회 및 이체</ActionLabel>
          </ActionCard>
          <ActionCard onClick={() => navigate('/transaction/create')}>
            <FaMoneyBillWave size={20} />
            <ActionLabel>거래 생성</ActionLabel>
          </ActionCard>
          <ActionCard onClick={() => navigate('/transaction/history')}>
            <FaChartPie size={20} />
            <ActionLabel>거래 내역</ActionLabel>
          </ActionCard>
          <ActionCard onClick={() => navigate('/cards')}>
            <FaStar size={20} />
            <ActionLabel>카드 관리</ActionLabel>
          </ActionCard>
        </QuickActions>
      </Main>
      <Footer>©2025 Finday</Footer>
    </Container>
  );
};

export default HomePage;

// Styled Components
const Container = styled.div`background: #0A0A0A; color: #fff; min-height: 100vh;`;
const Main = styled.main`padding:1rem;`;
const CarouselWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  min-height: 300px;
`;
const Carousel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: visible;
  padding: 4rem 0;
`;
const Card = styled(motion.div)`
  scroll-snap-align: center;
  width: 220px;
  min-width: 220px;
  height: 240px;
  margin: 0 0px;
  padding: 1rem;
  border-radius: 16px;
  background: #1e1e1e;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  transition: transform 0.3s ease, opacity 0.3s ease;
  cursor: pointer;
`;
const CardTitle = styled.h3`margin-bottom: 0.5rem;`;
const CardContent = styled.div``;
const Amount = styled.div`font-size: 1.3rem; font-weight: bold;`;
const Subtitle = styled.div`font-size: 0.9rem; opacity: 0.7;`;
const Recommendation = styled.h4`margin: 0.3rem 0;`;
const LearnBtn = styled.button`font-size: 0.8rem; background: none; color: #ccc; border: 1px solid #444; padding: 0.3rem 0.5rem; border-radius: 8px;`;
const Loading = styled.p`font-style: italic; opacity: 0.6;`;
const FilterLabel = styled.label`font-size: 0.8rem;`;
const FilterSelect = styled.select`background:#111; color:#fff; margin-left: 0.5rem;`;
const TransList = styled.ul`padding: 0; margin: 0; list-style: none;`;
const Trans = styled.li`display: flex; justify-content: space-between; font-size: 0.85rem; padding: 0.25rem 0;`;
const Nav = styled.button`background: transparent; color: #fff; border: none; font-size: 1.5rem; padding: 0.5rem; cursor: pointer;`;
const Footer = styled.footer`text-align: center; font-size: 0.8rem; padding: 1rem 0; color: #888;`;
const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-top: 2rem;
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;
const ActionCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255,255,255,0.2);
  backdrop-filter: blur(6px);
  border-radius: 12px;
  padding: 1rem;
  color: #FFFFFF;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s ease;
  &:hover, &:focus {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    outline: none;
  }
`;
const ActionLabel = styled.span`margin-top: 0.5rem; font-size: 0.85rem;`;