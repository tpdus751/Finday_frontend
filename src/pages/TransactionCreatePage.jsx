// pages/TransactionCreatePage.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SideMenuDrawer from '../components/SideMenuDrawer';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['식비', '편의점 마트 잡화', '교통 자동차', '쇼핑', '생활', '기타'];

const TransactionCreatePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('식비');
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [merchantList, setMerchantList] = useState([]);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleConsume = (item) => {
    const convertedCategory = selectedCategory.replace(/\s/g, '_'); // 공백 → 밑줄
    navigate('/payment', {
      state: {
        item,
        category: convertedCategory, // ✅ 변환된 카테고리 사용
        merchant: selectedMerchant,
        imgUrl: item.imgUrl,
      },
    });
  };

  useEffect(() => {
    const fetchMerchants = async () => {
      if (!selectedCategory) return;
      console.log('선택된 카테고리:', selectedCategory);
      try {
        const res = await api.get('/item/merchants', {
          params: { category: selectedCategory.replace(/\s/g, '_') },
        });
        setMerchantList(res.data);
        console.log('상호명 로딩 성공:', res.data);
        setSelectedMerchant('');
        setItems([]); // 초기화
      } catch (err) {
        console.error('상호명 로딩 실패:', err);
        setMerchantList([]);
      }
    };
    fetchMerchants();
  }, [selectedCategory]);

  useEffect(() => {
    const fetchItems = async () => {
      if (!selectedCategory || !selectedMerchant) return;
      try {
        const res = await api.get('/item/list', {
          params: {
            category: selectedCategory.replace(/\s/g, '_'),
            merchant: selectedMerchant,
          },
        });
        setItems(res.data);
        console.log('아이템 로딩 성공:', res.data);
      } catch (err) {
        console.error('아이템 로딩 실패:', err);
        setItems([]);
      }
    };
    fetchItems();
  }, [selectedCategory, selectedMerchant]);

  const filteredItems = items.filter(item =>
    (item.itemName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Header onMenuClick={() => setDrawerOpen(true)} />
      {isDrawerOpen && <SideMenuDrawer visible onClose={() => setDrawerOpen(false)} />}

      <Content>
        <Title>거래 생성</Title>

        <CategoryTabs>
          {CATEGORIES.map(cat => (
            <Tab
              key={cat}
              active={cat === selectedCategory}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Tab>
          ))}
        </CategoryTabs>

        <MerchantRow>
          {merchantList.map(merchant => (
            <MerchantBtn
              key={merchant}
              active={merchant === selectedMerchant}
              onClick={() => setSelectedMerchant(merchant)}
            >
              {merchant}
            </MerchantBtn>
          ))}
        </MerchantRow>

        <SearchBar
          type="text"
          placeholder="항목 검색..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <ItemCardGrid>
          {filteredItems.length === 0 ? (
            <EmptyMsg>해당 항목이 없습니다.</EmptyMsg>
          ) : (
            filteredItems.map(item => ( 
              <ItemCard key={item.item_no}>
                <ItemImage
                  src={`${item.imgUrl}`}  // ✅ 백엔드 주소 빼고 public 기준으로 사용
                  alt={item.itemName}
                />
                <ItemName>{item.itemName}</ItemName>
                <ItemPrice>{item.price.toLocaleString()}원</ItemPrice>
                <ConsumeBtn onClick={() => handleConsume(item)}>소비</ConsumeBtn>
              </ItemCard>
            ))
          )}
        </ItemCardGrid>
      </Content>

      <Footer>©2025 Finday</Footer>
    </Container>
  );
};

export default TransactionCreatePage;

const Container = styled.div`
  background: #0a0a0a;
  color: #ffffff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Content = styled.main`
  padding: 2rem;
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 1.5rem;
  font-weight: bold;
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center; /* ✅ 항상 가운데 정렬 */
  margin-bottom: 1rem;
`;

const Tab = styled.button`
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  border: none;
  background: ${props => (props.active ? '#00ffae' : '#222')};
  color: ${props => (props.active ? '#000' : '#fff')};
  font-weight: bold;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: #2a2a2a;
  }
`;

const MerchantRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center; /* ✅ 항상 가운데 정렬 */
  gap: 0.6rem;
  margin: 1.2rem 0;
`;

const MerchantBtn = styled.button`
  padding: 0.5rem 1.1rem;
  font-size: 0.85rem;
  border-radius: 20px;
  background: ${props => (props.active ? '#00ffae' : '#1e1e1e')};
  color: ${props => (props.active ? '#000' : '#fff')};
  border: none;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    background: #2a2a2a;
  }
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  border: none;
  margin-bottom: 2rem;
  background: #1a1a1a;
  color: white;
  font-size: 1rem;
  outline: none;
`;

const ItemCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.8rem;
  justify-content: center;
`;

const ItemCard = styled.div`
  background: #151515;
  border-radius: 16px;
  padding: 1rem;
  height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  box-shadow: 0 3px 10px rgba(0,0,0,0.3);
  transition: 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  }
`;

const ItemImage = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 0.5rem;
`;

const ItemName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin-top: 0.5rem;
`;

const ItemPrice = styled.div`
  font-size: 0.95rem;
  color: #bbbbbb;
  margin: 0.4rem 0;
`;

const ConsumeBtn = styled.button`
  padding: 0.45rem 2.5rem;
  font-size: 0.85rem;
  border: none;
  border-radius: 12px;
  background: #00ffae;
  color: #000;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: #00e3a0;
  }
`;

const EmptyMsg = styled.p`
  opacity: 0.6;
  font-style: italic;
  text-align: center;
  font-size: 1rem;
  margin-top: 2rem;
`;
