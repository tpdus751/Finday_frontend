import React from 'react';
import styled from 'styled-components';
import {
  FiX, FiUser, FiCreditCard, FiBarChart2,
  FiTrendingUp, FiLogOut, FiSettings, FiHome, FiList, FiLogIn
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore'; // 사용자 상태

export default function SideMenuDrawer({ visible, onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const isLoggedIn = !!user;
  const userName = user?.name || '사용자';

  if (!visible) return null;

  return (
    <Overlay onClick={onClose}>
      <DrawerContent onClick={(e) => e.stopPropagation()}>
        <TopBar>
          <FiX size={20} onClick={onClose} />
          <strong>메뉴</strong>
        </TopBar>

        {!isLoggedIn ? (
          <UnauthSection>
            <FiLogIn size={20} />
            <span onClick={() => {
              onClose();
              navigate('/login');
            }}>로그인하기</span>
          </UnauthSection>
        ) : (
          <>
            <UserSection>
              <FiUser size={20} />
              <span>{userName} 님</span>
            </UserSection>

            <NavSection>
              <MenuItem onClick={() => { onClose(); navigate('/'); }}><FiHome /> 홈</MenuItem>
              <MenuItem onClick={() => { onClose(); navigate('/accounts'); }}><FiList /> 계좌 조회</MenuItem>
              <MenuItem onClick={() => { onClose(); navigate('/cards'); }}><FiCreditCard /> 카드 관리</MenuItem>
              <MenuItem><FiTrendingUp /> 자산 종합 조회</MenuItem>
              <MenuItem><FiBarChart2 /> 소비 분석</MenuItem>
            </NavSection>

            <Divider />

            <NavSection>
              <MenuItem><FiSettings /> 관리자 기능</MenuItem>
              <MenuItem danger onClick={() => {
                logout();
                onClose();
                navigate('/');
              }}><FiLogOut /> 로그아웃</MenuItem>
            </NavSection>
          </>
        )}
      </DrawerContent>
    </Overlay>
  );
}



const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.3);
  z-index: 999;
  display: flex;
`;

const DrawerContent = styled.div`
  width: 280px;
  height: 100%;
  background-color: #ffffff;
  box-shadow: 2px 0 8px rgba(0,0,0,0.08);
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;

  svg {
    cursor: pointer;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #333;
  gap: 8px;
  margin-bottom: 24px;
`;

const NavSection = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const MenuItem = styled.li`
  display: flex;
  align-items: center;
  font-size: 16px;
  color: ${({ danger }) => (danger ? '#e74c3c' : '#222')};
  gap: 10px;
  cursor: pointer;
  padding: 10px 12px;
  border-radius: 8px;
  transition: 0.2s ease;

  &:hover {
    background-color: ${({ danger }) => (danger ? '#fdecea' : '#f1f4f7')};
  }
`;

const Divider = styled.hr`
  margin: 20px 0;
  border: none;
  border-top: 1px solid #e0e0e0;
`;

const UnauthSection = styled.div`
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #007aff;
  gap: 10px;
  cursor: pointer;
  margin: 20px 0;
  padding: 10px 12px;
  border-radius: 8px;

  &:hover {
    background-color: #f1f4f7;
  }

  span {
    font-weight: 500;
  }
`;
