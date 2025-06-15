import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

export default function CardPreviewItem({ card, isSelected, setSelectedCardId }) {
  const [isRotated, setIsRotated] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const isWide = img.width > img.height;
      setIsRotated(isWide);
    };
    img.src = card.cardImgUrl;
  }, [card.cardImgUrl]);

  return (
    <CardItem
      isSelected={isSelected}
      onClick={() => setSelectedCardId(card.cardNo)}
    >
      <CardImage>
        <CardImageInner
          src={card.cardImgUrl}
          alt={card.cardName}
          style={{
            transform: isRotated
              ? 'translate(-50%, -50%) rotate(90deg)'
              : 'translate(-50%, -50%)',
          }}
        />
      </CardImage>
      <CardName>{card.cardName.replace(/\\n/g, '\n')}</CardName>
      <CardIntro>{card.cardIntro}</CardIntro>
      <BenefitList>
        {card.benefits?.map((benefit, idx) => ( 
          <BenefitItem key={idx}>
            {benefit.benefitType} <strong>{benefit.percentage}%</strong> 할인
          </BenefitItem>
        ))}
      </BenefitList>
    </CardItem>
  );
}


// styled-components (당신 코드에 이미 있다면 중복 제거 가능)
const CardItem = styled.div`
  box-sizing: border-box; // ✅ 추가
  background: ${({ isSelected }) => (isSelected ? '#00ffae22' : '#1a1a1a')};
  border: 2px solid ${({ isSelected }) => (isSelected ? '#00ffae' : '#333')};
  cursor: pointer;
  transition: 0.2s;
  min-height: 320px;
  padding: 1rem; // 👉 여기에 이미 padding 있다면 유지
`;


const CardImage = styled.div`
  width: 100%;
  padding-top: 100%;
  position: relative;
  border-radius: 8px;
  background-color: #fff;
  overflow: hidden;
`;

const CardImageInner = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 90%;
  height: 80%;
  object-fit: contain;
  transform: translate(-50%, -50%);
  transition: transform 0.3s ease;
`;

const CardName = styled.h4`
  text-align: center;
  margin: 10;
  font-size: 1.10rem;
  color: #fff;
  white-space: pre-line;  // ← 이거 추가
`;

const CardIntro = styled.p`
  text-align: center;
  font-size: 0.85rem;
  color: #bbb;
  margin: 0.25rem 0 0.5rem;
`;

const BenefitList = styled.ul`
  text-align: center;
  list-style: none;
  padding: 0;
  margin: 10;
`;

const BenefitItem = styled.li`
  font-size: 0.9rem;
  color: #0f0;
  margin-top: 2rem;
`;
