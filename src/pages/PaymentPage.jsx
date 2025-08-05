import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SideMenuDrawer from '../components/SideMenuDrawer';
import api from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import PaymentMethodModal from '../components/PaymentMethodModal';
import useUserStore from '../store/userStore';
import FaceAuthModal from '../components/FaceAuthModal';

export default function PaymentPage() {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useUserStore();
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false); // ✅ 인증 여부

  const location = useLocation();
  const navigate = useNavigate();
  const { item, category, merchant, imgUrl } = location.state || {};
  const userNo = user?.userNo;
  const userSpecificNo = user?.userSpecificNo;

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const accountRes = await api.get('/bank/connected', {
          params: { 
            userNo: userNo,
            userSpecificNo: userSpecificNo // ✅ 사용자 고유 번호 전달
           }
        });  
        const cardRes = await api.get('/card/connected', {
          params: { 
            userNo: userNo,
            userSpecificNo: userSpecificNo // ✅ 사용자 고유 번호 전달
           }
        });
        setAccounts(accountRes.data || []);
        setCards(cardRes.data || []);
        if (accountRes.data.length > 0) {
          setSelectedMethod({ type: 'account', data: accountRes.data[0] });
        } else if (cardRes.data.length > 0) {
          setSelectedMethod({ type: 'card', data: cardRes.data[0] });
        }
      } catch (err) {
        console.error('결제수단 불러오기 실패:', err);
      }
    };
    fetchPaymentMethods();
  }, []);

  const handleConfirmPayment = () => {
    if (!selectedMethod) return alert('결제수단을 선택해주세요.');
    setAuthModalVisible(true); // 얼굴 인증 모달 열기
  };

  const handleFaceAuthSuccess = async () => {
    setAuthModalVisible(false);
    if (faceVerified) return; // ✅ 중복 방지

    setFaceVerified(true); // ✅ 얼굴 인증 완료 상태 설정

    console.log('얼굴 인증 성공, 결제 진행:', selectedMethod);
    // 결제 API 호출

    try {
      await api.post('/transaction/create', {
        merchant,
        amount: item.price,
        category,
        bankName: selectedMethod.data.bankName,
        methodType: selectedMethod.type,
        methodId: selectedMethod.type === 'account' ? selectedMethod.data.accountNumber : selectedMethod.data.cardNumber,
        userSpecificNo: userSpecificNo,
      });
      alert(`${item.itemName} 결제 완료!`);
      navigate('/');
    } catch (err) {
      console.error('결제 실패:', err);
      alert('결제 중 오류가 발생했습니다.');
    } finally {
      setFaceVerified(false); // ✅ 다음 결제를 위해 초기화
    }
  };


  return (
    <Container>
      <Header onMenuClick={() => setDrawerOpen(true)} />
      {isDrawerOpen && <SideMenuDrawer visible onClose={() => setDrawerOpen(false)} />}

      <Content>
        <Title>핀데이 결제</Title>

        <ItemSummary>
            {imgUrl && <ItemImage src={imgUrl} alt="item" />}
            <strong>{item?.itemName}</strong> - {item?.price?.toLocaleString()}원
        </ItemSummary>

        <PaymentSection>
          <SectionTitle>결제수단</SectionTitle>
          <SelectedMethod>
            {selectedMethod ? (
                <MethodContent>
                <MethodImage
                    src={
                        selectedMethod.type === 'account'
                        ? selectedMethod.data.bankLogoImgUrl
                        : selectedMethod.data.cardImgUrl
                    }
                    alt="결제수단 이미지"
                    $isCard={selectedMethod.type === 'card'}
                    />
                <MethodTextGroup>
                    <MethodMainText>
                    {selectedMethod.type === 'account'
                        ? selectedMethod.data.accountName
                        : selectedMethod.data.cardName}
                    </MethodMainText>
                    <MethodSubText>
                    {selectedMethod.type === 'account'
                        ? selectedMethod.data.accountNumber
                        : selectedMethod.data.cardNumber}
                    </MethodSubText>
                </MethodTextGroup>
                </MethodContent>
            ) : (
                <span>결제수단 없음</span>
            )}
            <ChangeButton onClick={() => setModalVisible(true)}>변경</ChangeButton>
            </SelectedMethod>
        </PaymentSection>

        <PayButton onClick={handleConfirmPayment}>결제하기</PayButton>
      </Content>

      {modalVisible && (
        <PaymentMethodModal
          accounts={accounts}
          cards={cards}
          selected={selectedMethod}
          onSelect={(method) => {
            setSelectedMethod(method);
            setModalVisible(false);
          }}
          onClose={() => setModalVisible(false)}
        />
      )}

      {authModalVisible && (
        <FaceAuthModal
          email={user?.email}
          faceImgUrl={user?.faceImgUrl}
          onSuccess={handleFaceAuthSuccess}
          onClose={() => setAuthModalVisible(false)}
        />
      )}

      <Footer />
    </Container>
  );
}

const Container = styled.div`
  background: #0a0a0a;
  color: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Content = styled.main`
  padding: 2rem;
  max-width: 600px;
  text-align: center;
  margin: auto;
  flex: 1;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1rem;
`;

const ItemSummary = styled.div`
  font-size: 1.2rem;
  margin-bottom: 2rem;
`;

const PaymentSection = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.8rem;
`;

const SelectedMethod = styled.div`
  background: #1e1e1e;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChangeButton = styled.button`
  background: #00ffae;
  color: #000;
  padding: 0.4rem 1rem;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  cursor: pointer;
`;

const PayButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #00ffae;
  color: #000;
  font-size: 1rem;
  border-radius: 12px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  margin-top: 2rem;
`;

const ItemImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: contain;
  object-position: center;
  border-radius: 20px;
  margin-bottom: 1rem;
  background-color: #121212; /* 이미지 비는 부분 배경 채우기 */
`;

const MethodTextGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const MethodMainText = styled.div`
  font-size: 1rem;
  font-weight: bold;
`;

const MethodSubText = styled.div`
  font-size: 0.9rem;
  opacity: 0.6;
  margin-top: 2px;
`;

const MethodContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const MethodImage = styled.img`
  width: ${({ $isCard }) => ($isCard ? '60px' : '40px')};
  height: ${({ $isCard }) => ($isCard ? '50px' : '40px')};
  margin: ${({ $isCard }) => ($isCard ? '0' : '0.8rem')};
  object-fit: ${({ $isCard }) => ($isCard ? 'contain' : 'cover')};
  border-radius: ${({ $isCard }) => ($isCard ? '4px' : '50%')};
  background: ${({ $isCard }) => ($isCard ? '#1e1e1e' : '#fff')};
`;
