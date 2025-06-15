// components/Header.js
import React from 'react';
import styled from 'styled-components';
import { FiBell, FiMenu } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Finday_logo.png';

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();

  return (
    <Wrapper>
      <IconButton onClick={onMenuClick}>
        <FiMenu size={28} />
      </IconButton>

      <Logo onClick={() => navigate('/')}>
        <img src={logo} alt="Finday 로고" />
      </Logo>

      <IconButton>
        <FiBell size={24} />
      </IconButton>
    </Wrapper>
  );
}

const Wrapper = styled.header`
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #333; // ✅ 흰 배경에 어울리는 어두운 색상
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const Logo = styled.div`
  height: 115%;
  display: flex;
  align-items: center;
  cursor: pointer;

  img {
    height: 115%;         // ✅ 헤더 높이에 비례하게 표시
    max-height: 100px;     // 최대 크기 제한
    object-fit: contain;
  }
`;
