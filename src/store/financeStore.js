import { create } from 'zustand';

export const useFinanceStore = create((set) => ({
  totalAssets: 12340000, // 총 자산 (예: 12,340,000원)

  spendingBreakdown: [
    { name: '식비', percent: 40 },
    { name: '쇼핑', percent: 25 },
    { name: '교통', percent: 15 },
    { name: '기타', percent: 20 }
  ],

  recommendedCard: {
    name: '신한 DeepOn 체크카드',
    benefit: '모든 간편결제 5% 캐시백, 대중교통 10% 할인'
  },

  recentTransactions: [
    { id: 1, date: '06/14', merchant: '스타벅스', amount: 5600 },
    { id: 2, date: '06/13', merchant: '배달의민족', amount: 15200 },
    { id: 3, date: '06/13', merchant: 'GS25', amount: 2100 }
  ],

  // 추후 실제 API로 대체 시 아래 메서드 활용 가능
  setTotalAssets: (amount) => set({ totalAssets: amount }),
  setSpendingBreakdown: (data) => set({ spendingBreakdown: data }),
  setRecommendedCard: (card) => set({ recommendedCard: card }),
  setRecentTransactions: (txs) => set({ recentTransactions: txs })
}));
