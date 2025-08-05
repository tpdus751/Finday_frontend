// 업데이트된 TransactionHistoryPage.jsx
// 감성적이면서 UX 개선된 UI 반영 + 응답 DTO 기반 필드 매핑

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SideMenuDrawer from '../components/SideMenuDrawer';
import useUserStore from '../store/userStore';
import api from '../services/api';
import { FaCreditCard } from 'react-icons/fa';

export default function TransactionHistoryPage() {
  const { user } = useUserStore();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState('통합');
  const [transactions, setTransactions] = useState([]);
  const [dateFilter, setDateFilter] = useState('30days');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [bankList, setBankList] = useState([{ bankName: '통합', bankLogoImgUrl: null }]);

  useEffect(() => {
    const fetchBankList = async () => {
        try {
        const res = await api.get('/bank/connected_bankNames', {
            params: { userNo: user?.userNo },
        });
        const dataWithLogo = res.data.map(bank => ({
            bankName: bank.bankName,
            bankLogoImgUrl: bank.bankLogoImgUrl
        }));
        setBankList([{ bankName: '통합', bankLogoImgUrl: null }, ...dataWithLogo]);
        } catch (e) {
        console.error('은행 목록 조회 실패:', e);
        }
    };
    fetchBankList();
    }, []);

  useEffect(() => {
    if (bankList.length > 1) {
        fetchTransactions();
    }
    }, [selectedBank, dateFilter, selectedMonth, bankList]);  // ✅ bankList도 의존성에 추가

  const fetchTransactions = async () => {
    try {
        const res = await api.get('/transaction/list', {
        params: {
            userNo: user?.userNo,
            userSpecificNo: user?.userSpecificNo,
            bankName: selectedBank === '통합' ? null : selectedBank,
            filterType: dateFilter,
            month: selectedMonth || null,
        },
        });

        const enriched = (res.data || []).map(tx => {
        const matchedBank = bankList.find(b => b.bankName === tx.bankName);
        return {
            ...tx,
            bankLogoImgUrl: matchedBank?.bankLogoImgUrl || null
        };
        });

        setTransactions(enriched);
    } catch (e) {
        console.error('거래내역 조회 실패:', e);
    }
    };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setDateFilter('month');
  };

  return (
    <Container>
      <Header onMenuClick={() => setDrawerOpen(true)} />
      {isDrawerOpen && <SideMenuDrawer visible={true} onClose={() => setDrawerOpen(false)} />}

      <Main>
        <Title>거래 내역 조회</Title>

        <BankTabs>
            {bankList.map(bank => (
                <BankTab
                key={bank.bankName}
                active={selectedBank === bank.bankName}
                onClick={() => setSelectedBank(bank.bankName)}
                >
                {bank.bankLogoImgUrl && (
                    <BankTabLogo src={bank.bankLogoImgUrl} alt={`${bank.bankName} 로고`} />
                )}
                {bank.bankName}
                </BankTab>
            ))}
        </BankTabs>

        <FilterRow>
          <FilterButton active={dateFilter === '30days'} onClick={() => {
            setDateFilter('30days');
            setSelectedMonth('');
          }}>
            최근 30일
          </FilterButton>
          <MonthSelector value={selectedMonth} onChange={handleMonthChange}>
            <option value="">월 선택</option>
            {Array.from({ length: 12 }, (_, i) => {
              const monthStr = `2025-${String(i + 1).padStart(2, '0')}`;
              return <option key={monthStr} value={monthStr}>{monthStr}</option>;
            })}
          </MonthSelector>
        </FilterRow>

        {transactions.length === 0 ? (
          <EmptyMsg>거래 내역이 없습니다.</EmptyMsg>
        ) : (
          <TransactionList>
            {transactions.map((tx, idx) => (
              <TransactionItem key={idx}>
                <TopRow>
                  <TxType>{tx.transactionType}</TxType>
                  <TxDate>{tx.createdAt}</TxDate>
                </TopRow>
                <TxName>{tx.transactionName}</TxName>
                <TxDetailRow>
                    <TxAmount isMinus={tx.transactionType === '출금'}>
                        {tx.transactionType === '출금' ? '-' : '+'}{tx.amount.toLocaleString()}원
                    </TxAmount>
                    <BankInfo>
                        {tx.bankLogoImgUrl && (
                        <BankLogo src={tx.bankLogoImgUrl} alt={`${tx.bankName} 로고`} />
                        )}
                        {tx.bankName} / {tx.accountName}
                    </BankInfo>
                </TxDetailRow>
                {tx.cardNumber && (
                  <CardRow>
                    <FaCreditCard size={12} style={{ marginRight: '4px' }} />
                    {tx.paidCardName} 결제 ({tx.cardNumber})
                  </CardRow>
                )}
                <TxCategory>카테고리: {tx.transactionCategory}</TxCategory>
              </TransactionItem>
            ))}
          </TransactionList>
        )}
      </Main>

      <Footer>©2025 Finday</Footer>
    </Container>
  );
}

const Container = styled.div`background: #0A0A0A; color: #fff; min-height: 100vh;`;
const Main = styled.main`
  padding: 1.5rem;
  max-width: 700px;
  margin: 0 auto; /* 가운데 정렬 */
`;
const Title = styled.h2`font-size: 1.4rem; margin-bottom: 1.2rem;`;

const BankTabs = styled.div`display: flex; overflow-x: auto; margin-bottom: 1rem; gap: 0.5rem;`;
const BankTab = styled.button`
  background: ${({ active }) => (active ? '#00ffae' : '#1e1e1e')};
  color: ${({ active }) => (active ? '#0a0a0a' : '#fff')};
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
`;

const FilterRow = styled.div`display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1rem;`;
const FilterButton = styled.button`
  background: ${({ active }) => (active ? '#00ffae' : '#1e1e1e')};
  color: ${({ active }) => (active ? '#0a0a0a' : '#fff')};
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
`;
const MonthSelector = styled.select`
  background: #111;
  color: #fff;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  border: 1px solid #333;
  font-size: 0.85rem;
`;

const EmptyMsg = styled.div`opacity: 0.7; font-style: italic; margin-top: 2rem;`;
const TransactionList = styled.ul`list-style: none; padding: 0; margin: 0;`;
const TransactionItem = styled.li`
  background: #1e1e1e;
  border-radius: 12px;
  padding: 1rem 1.2rem;
  margin-bottom: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;


const TopRow = styled.div`display: flex; justify-content: space-between; color: #bbb; font-size: 0.8rem;`;
const TxName = styled.div`font-weight: bold; font-size: 1rem; color: #fff;`;
const TxDetailRow = styled.div`display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;`;
const TxAmount = styled.div`
  color: ${({ isMinus }) => (isMinus ? '#ff7070' : '#00ffae')};
  font-weight: bold;
`;
const BankInfo = styled.div`color: #aaa; font-size: 0.8rem;`;
const TxCategory = styled.div`color: #ccc; font-size: 0.75rem; font-style: italic;`;
const CardRow = styled.div`color: #ffdd88; font-size: 0.75rem; display: flex; align-items: center;`;
const TxType = styled.div`
  font-size: 0.8rem;
  color: #bbb;
`;

const TxDate = styled.div`
  font-size: 0.8rem;
  color: #bbb;
`;
const BankLogo = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 6px;
  vertical-align: middle;
  border-radius: 4px;
`;
const BankTabLogo = styled.img`
  width: 14px;
  height: 14px;
  margin-right: 6px;
  vertical-align: middle;
  border-radius: 4px;
`;