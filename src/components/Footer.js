// components/Footer.js
import React from 'react';
import styled from 'styled-components';

export default function Footer() {
  return (
    <Wrapper>
      <p>© 2025 Finday. All rights reserved.</p>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  text-align: center;
  padding: 12px;
  font-size: 14px;
  color: gray;
`;
