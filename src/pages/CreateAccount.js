// CreateAccount.js
import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SideMenuDrawer from '../components/SideMenuDrawer';
import { FaPiggyBank } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useUserStore from '../store/userStore';
import CardPreviewItem from '../components/CardPreviewItem';

export default function CreateAccount() {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [bankName, setBankName] = useState('');
  const [alias, setAlias] = useState('');
  const [cardRequested, setCardRequested] = useState(false);
  const [creating, setCreating] = useState(false);
  const [bankList, setBankList] = useState([]);
  const [accountLimit, setAccountLimit] = useState('');
  const [cardTab, setCardTab] = useState('credit');
  const [cardList, setCardList] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);

  const { user } = useUserStore();
  const navigate = useNavigate();

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

  const groupedBanks = useMemo(() => {
    const groups = {};
    for (const { bankName, bankType } of bankList) {
      if (!groups[bankType]) groups[bankType] = [];
      groups[bankType].push(bankName);
    }
    return groups;
  }, [bankList]);

  useEffect(() => {
    if (!cardRequested || !bankName) return;
    const fetchCards = async () => {
      try {
        const res = await api.get('/card/by-bank', { params: { bankName } });
        setCardList(res.data);
      } catch (err) {
        console.error('카드 정보 불러오기 실패:', err);
      }
    };
    fetchCards();
  }, [cardRequested, bankName]);

  const handleSubmit = async () => {
    const payload = {
      userNo: user.userNo,
      bankName,
      alias,
      cardRequested,
      cardNo: selectedCardId,
      accountLimit: accountLimit ? parseInt(accountLimit, 10) * 10000 : null,
    };

    console.log("계좌 개설 요청 데이터:", payload);
    
    if (!bankName || !alias) return alert('은행명과 별칭을 입력해주세요.');
    setCreating(true);
    try {
      await api.post('/account/create', payload);
      alert('계좌가 개설되었습니다!');
      navigate('/accounts');
    } catch (e) {
      console.error('계좌 개설 실패:', e);
      alert('계좌 개설에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Wrapper>
      <Header onMenuClick={() => setDrawerOpen(true)} />
      {isDrawerOpen && <SideMenuDrawer visible onClose={() => setDrawerOpen(false)} />}

      <Content>
        <Card>
          <FaPiggyBank size={30} />
          <Title>새 계좌 개설</Title>

          <Label>은행 선택</Label>
          {bankList.length === 0 ? (
            <Loading>은행 목록을 불러오는 중...</Loading>
          ) : (
            Object.entries(groupedBanks).map(([group, bankList]) => (
              <BankGroup key={group}>
                <GroupTitle>{group}</GroupTitle>
                <BankGrid>
                  {bankList.map((name) => (
                    <BankOption
                      key={name}
                      selected={bankName === name}
                      onClick={() => setBankName(name)}
                    >
                      {name}
                    </BankOption>
                  ))}
                </BankGrid>
              </BankGroup>
            ))
          )}

          <Label>계좌 별칭</Label>
          <Input
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="예: 월급통장"
          />

          <Label>
            월간 한도 설정 <span style={{ color: '#888', fontWeight: 'normal' }}>(선택)</span>
          </Label>

          <LimitCard>
            <LimitInputWrapper>
              <Currency>₩</Currency>
              <LimitInput
                type="number"
                min="0"
                value={accountLimit}
                onChange={(e) => setAccountLimit(e.target.value)}
                placeholder="예: 300"
              />
              <Unit>만원</Unit>
            </LimitInputWrapper>
            <Hint>한도를 설정하면 금융 피해를 예방할 수 있습니다.</Hint>
          </LimitCard>


          <CheckboxRow>
            <input
              type="checkbox"
              checked={cardRequested}
              onChange={(e) => setCardRequested(e.target.checked)}
            />
            <span>카드도 함께 신청할게요</span>
          </CheckboxRow>

          {cardRequested && cardList.length > 0 && (
            <CardSection>
              <TabRow>
                <Tab active={cardTab === 'credit'} onClick={() => setCardTab('credit')}>신용카드</Tab>
                <Tab active={cardTab === 'check'} onClick={() => setCardTab('check')}>체크카드</Tab>
              </TabRow>
              <CardGrid>
                {cardList
                  .filter((c) => {
                    const type = c.cardType?.includes('신용') ? 'credit' : 'check';
                    return type === cardTab;
                  })
                  .map((card) => (
                    <CardPreviewItem
                      key={card.cardNo}
                      card={card}
                      isSelected={selectedCardId === card.cardNo}
                      setSelectedCardId={setSelectedCardId}
                    />
                  ))}
              </CardGrid>
            </CardSection>
          )}

          <SubmitButton
            onClick={handleSubmit}
            disabled={creating || !bankName || !alias}
          >
            {creating ? '개설 중...' : '계좌 개설하기'}
          </SubmitButton>
        </Card>
      </Content>

      <Footer />
    </Wrapper>
  );
}

// ===== 스타일 컴포넌트 =====

const Wrapper = styled.div`
  background: #0a0a0a;
  color: #fff;
  min-height: 100vh;
`;

const Content = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
`;

const Card = styled.div`
  background: #1e1e1e;
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const Label = styled.label`
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const Input = styled.input`
  background: #111;
  color: #fff;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 0.5rem;
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
`;

const SubmitButton = styled.button`
  margin-top: 1.5rem;
  background-color: #00ffae;
  color: #0a0a0a;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 14px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.25s ease, transform 0.15s ease;

  &:hover {
    background-color: #00e39a;
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #444;
    color: #999;
    cursor: not-allowed;
  }
`;

const BankGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const GroupTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  margin: 1.5rem 0 0.5rem;
  color: #aaa;
  border-bottom: 1px solid #333;
  padding-bottom: 0.25rem;
`;

const BankGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const BankOption = styled.button`
  background: ${({ selected }) => (selected ? '#00ffae' : '#1b1b1b')};
  color: ${({ selected }) => (selected ? '#0a0a0a' : '#eee')};
  border: none;
  border-radius: 12px;
  padding: 0.6rem 1rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  min-width: 100px;
  box-shadow: ${({ selected }) =>
    selected ? '0 0 0 2px #00ffae80' : '0 0 4px rgba(0,0,0,0.2)'};

  &:hover {
    background: ${({ selected }) => (selected ? '#00e39a' : '#2a2a2a')};
    transform: scale(1.03);
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 1rem;
  color: #aaa;
  font-style: italic;
`;

const LimitCard = styled.div`
  background: #151515;
  border: 1px solid #2c2c2c;
  border-radius: 12px;
  padding: 1rem;
  margin-top: 0.25rem;
  box-shadow: inset 0 0 0 1px #2c2c2c;
`;

const LimitInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Currency = styled.span`
  font-size: 1rem;
  color: #ccc;
`;

const LimitInput = styled.input`
  background: #111;
  color: #fff;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 0.5rem;
  flex: 1;
  font-size: 1rem;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    appearance: textfield;
    -moz-appearance: textfield;
  }
`;

const Unit = styled.span`
  font-size: 0.95rem;
  color: #ccc;
`;

const Hint = styled.div`
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #888;
  text-align: right;
`;

const CardSection = styled.div`
  margin-top: 2rem;
`;

const TabRow = styled.div`
  display: flex;
  margin-bottom: 1rem;
`;

const Tab = styled.button`
  flex: 1;
  padding: 0.5rem;
  background: ${({ active }) => (active ? '#00ffae' : '#111')};
  color: ${({ active }) => (active ? '#000' : '#fff')};
  border: none;
  font-weight: bold;
  cursor: pointer;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
`;