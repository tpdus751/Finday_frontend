import React, { useRef, useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaMoneyBillWave, FaPiggyBank, FaChartPie, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Header from '../components/Header';
import SideMenuDrawer from '../components/SideMenuDrawer';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';
import api from '../services/api';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const HomePage = () => {
  const [centerIndex, setCenterIndex] = useState(0);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const carouselRef = useRef();
  const navigate = useNavigate();
  const cardRefs = useRef([]);
  const [zOrders, setZOrders] = useState([3, 2, 1, 0]);
  const [connectedBanks, setConnectedBanks] = useState([]);
  const [chartData, setChartData] = useState([]);
  const { user } = useUserStore();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });


  const COLORS = ['#00FFAE', '#00BFAE', '#00A0FF', '#875EFF', '#FF6F91', '#FFD166', '#06D6A0'];

  const ConsumptionPieChart = ({ data }) => (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          stroke="none" // ✅ 외곽선 제거
          outerRadius={70}
          innerRadius={20} // 도넛 형태로 시각적으로 더 깔끔
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#1e1e1e', border: 'none', borderRadius: 8 }}
          itemStyle={{ color: '#fff' }}
          formatter={(value, name) => [`${value.toLocaleString()}원`, name]}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          align="center"
          wrapperStyle={{
            paddingTop: 4,
            fontSize: 10,
            color: '#ccc',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );


  const fetchTransactionsForPie = async () => {
    try {
      const res = await api.get('/transaction/list', {
        params: {
          userNo: user?.userNo,
          userSpecificNo: user?.userSpecificNo,
          bankName: null,
          filterType: 'month',
          month: selectedMonth,
        },
      });

      const data = res.data || [];
      const categoryCount = {};
      data.forEach(tx => {
        const category = tx.transactionCategory || '기타';
        categoryCount[category] = (categoryCount[category] || 0) + tx.amount;
      });

      const formatted = Object.entries(categoryCount).map(([category, amount]) => ({
        name: category,
        value: amount,
      }));

      setChartData(formatted);
    } catch (err) {
      console.error('소비 분석 데이터 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    const fetchConnectedBanks = async () => {
      try {
        const res = await api.get('/bank/connected', {
          params: {
            userNo: user?.userNo,
            userSpecificNo: user?.userSpecificNo,
          },
        });
        setConnectedBanks(res.data);
      } catch (e) {
        console.error('연결된 은행 조회 실패:', e);
        setConnectedBanks([]);
      }
    };
    fetchConnectedBanks();
  }, []);

  useEffect(() => {
    fetchTransactionsForPie();
  }, [selectedMonth]);


  const isEmpty = connectedBanks.length === 0;

  const totalBalance = useMemo(() => {
    return Array.isArray(connectedBanks)
      ? connectedBanks.reduce((sum, acc) => sum + (acc.balance || 0), 0)
      : 0;
  }, [connectedBanks]);

  const currentMonthLabel = selectedMonth
    ? `${parseInt(selectedMonth.split('-')[1])}월 소비 분석`
    : '소비 분석';
  const cards = useMemo(() => [
    {
      title: '총 자산',
      content: isEmpty ? (
        <>
          <Amount>0원</Amount>
          <Subtitle>연결된 계좌가 없습니다</Subtitle>
          <ConnectButton onClick={() => navigate('/accounts/connect')}>계좌 연동하기</ConnectButton>
        </>
      ) : (
        <>
          <Amount>{totalBalance.toLocaleString()}원</Amount>
          <Subtitle>모든 계좌 합산</Subtitle>
        </>
      )
    },
    {
    title: (
      <TitleWithSelector>
        <span>{currentMonthLabel}</span>
        <MonthSelector value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
          {Array.from({ length: 12 }, (_, i) => {
            const monthStr = `2025-${String(i + 1).padStart(2, '0')}`;
            return <option key={monthStr} value={monthStr}>{monthStr}</option>;
          })}
        </MonthSelector>
      </TitleWithSelector>
    ),
    content: chartData.length > 0 ? (
      <ConsumptionPieChart data={chartData} />
    ) : (
      <Loading>거래 내역이 존재하지 않습니다...</Loading>
    )
  },
    {
      title: '최근 거래',
      content: (
        <>
          <FilterLabel>기간:</FilterLabel>
          <FilterSelect>
            <option>최근30일</option>
            <option>최근7일</option>
            <option>오늘</option>
          </FilterSelect>
          <TransList>
            <Trans>
              <span>2025-06-28</span>
              <span>샘플 상점</span>
              <span>12,000원</span>
            </Trans>
          </TransList>
        </>
      )
    }
  ], [isEmpty, navigate, chartData]); // ✅ chartData 추가!

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

  return (
    <Container>
      <Header onMenuClick={() => setDrawerOpen(true)} />
      {isDrawerOpen && <SideMenuDrawer visible={true} onClose={() => setDrawerOpen(false)} />}
      <Main>
        <CarouselWrapper>
          <Nav onClick={() => setCenterIndex((centerIndex - 1 + cards.length) % cards.length)}><FaChevronLeft /></Nav>
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
          <Nav onClick={() => setCenterIndex((centerIndex + 1) % cards.length)}><FaChevronRight /></Nav>
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
            <ActionLabel>내 카드</ActionLabel>
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
const ConnectButton = styled.button`
  margin-top: 0.6rem;
  background-color: #00ffae;
  color: #0a0a0a;
  font-size: 0.8rem;
  font-weight: bold;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  cursor: pointer;
  &:hover {
    background-color: #00e3a0;
  }
`;
const TitleWithSelector = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1rem;
  font-weight: bold;
`;

const MonthSelector = styled.select`
  margin-left: 0.5rem;
  background: #111;
  color: #fff;
  padding: 0.2rem 0.4rem;
  border-radius: 8px;
  border: 1px solid #333;
  font-size: 0.8rem;
`;
