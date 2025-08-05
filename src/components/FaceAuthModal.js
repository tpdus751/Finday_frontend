// components/FaceAuthModal.js
import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api';
import api from '../services/api';
import useUserStore from '../store/userStore';


export default function FaceAuthModal({ email, faceImgUrl, onSuccess, onClose }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const countdownRef = useRef(null);

  const { setUser } = useUserStore();

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [message, setMessage] = useState('얼굴을 정면으로 비춰주세요');
  const [timerStarted, setTimerStarted] = useState(false);
  const [lastDetectedBox, setLastDetectedBox] = useState(null);
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (!modelsLoaded) return;
    const interval = setInterval(async () => {
      const video = webcamRef.current?.video;
      const canvas = canvasRef.current;

      if (video) {
        const displaySize = { width: 360, height: 270 };
        faceapi.matchDimensions(canvas, displaySize);

        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions()
        );
        const resized = faceapi.resizeResults(detections, displaySize);

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resized);

        if (resized.length > 0) {
          const currentBox = resized[0].box;
          setLastDetectedBox(currentBox);
          if (!timerStarted && !requestSent) {
            setTimerStarted(true);
            let timeLeft = 3;
            setMessage(`얼굴 감지됨! ${timeLeft}초 후 캡처합니다.`);
            countdownRef.current = setInterval(() => {
              timeLeft--;
              if (timeLeft > 0) {
                setMessage(`얼굴 감지됨! ${timeLeft}초 후 캡처합니다.`);
              } else {
                clearInterval(countdownRef.current);
                setMessage('캡처되었습니다! 잠시만 기다려주세요.');
                handleCapture(currentBox);
              }
            }, 1000);
          }
        } else if (timerStarted && !requestSent) {
          clearInterval(countdownRef.current);
          setTimerStarted(false);
          setMessage('얼굴을 정면으로 비춰주세요');
        } 
      }
    }, 300);
    return () => clearInterval(interval);
  }, [modelsLoaded, timerStarted, requestSent]);

  const handleCapture = async (faceBox) => {
    if (requestSent) return;

    setRequestSent(true); // ✅ 이 위치가 핵심 (비동기 직전)

    try {
      const screenshot = webcamRef.current.getScreenshot();
      if (!screenshot) {
        setError('캡처 실패');
        setRequestSent(false);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = screenshot;

      // ✅ 중복 방지용 타이머 제거
      const blob = await new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = faceBox.width;
            canvas.height = faceBox.height;
            canvas.getContext('2d').drawImage(
              img,
              faceBox.x,
              faceBox.y,
              faceBox.width,
              faceBox.height,
              0,
              0,
              faceBox.width,
              faceBox.height
            );
            canvas.toBlob((b) => {
              if (b) resolve(b);
              else reject(new Error('Blob 변환 실패'));
            }, 'image/jpeg');
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error('이미지 로딩 실패'));
      });

      // 서버 요청
      const formData = new FormData();
      formData.append('face_image', blob, 'face.jpg');
      formData.append('email', email);
      formData.append('face_img_url', faceImgUrl);

      const res = await fetch('http://localhost:5000/verify-face', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (res.ok && result.result === 'success') {
        const loginRes = await api.post('/user/auth/final-login', { email });
        const jwt = loginRes.data;
        localStorage.setItem('token', jwt);
        api.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
        const userRes = await api.get('/user/me');
        setUser(userRes.data);
        onSuccess();
      } else {
        setError('얼굴 인증 실패: ' + result.reason);
        setRequestSent(false);
      }

    } catch (err) {
      console.error(err);
      setError('서버 오류 발생');
      setRequestSent(false);
    }
  };

  return (
    <ModalOverlay>
      <ModalBox>
        <h2>얼굴 인증</h2>
        <WebcamContainer>
          <Webcam
            ref={webcamRef}
            audio={false}
            mirrored={false}
            screenshotFormat="image/jpeg"
            width={360}
            height={270}
            videoConstraints={{ facingMode: 'user' }}
          />
          <CanvasOverlay ref={canvasRef} width={360} height={270} />
        </WebcamContainer>
        {error ? <ErrorMsg>{error}</ErrorMsg> : <Message>{message}</Message>}
        <CloseBtn onClick={onClose}>취소</CloseBtn>
      </ModalBox>
    </ModalOverlay>
  );
}

// styled-components 생략 — 요청 시 제공 가능
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4); /* 반투명 어두운 배경 */
  backdrop-filter: blur(4px);     /* ✅ 배경 흐림 효과 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

export const ModalBox = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeIn} 0.4s ease-in-out;
`;

export const WebcamContainer = styled.div`
  position: relative;
  width: 360px;
  height: 270px;
  margin-bottom: 1rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
`;

export const CanvasOverlay = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
`;

export const Message = styled.p`
  font-size: 0.95rem;
  color: #333;
  margin-top: 0.5rem;
  animation: ${fadeIn} 0.4s ease-in-out;
  text-align: center;
`;

export const ErrorMsg = styled.p`
  font-size: 0.9rem;
  color: #e74c3c;
  font-weight: 500;
  text-align: center;
  margin-top: 0.5rem;
`;

export const CloseBtn = styled.button`
  margin-top: 1.5rem;
  padding: 0.5rem 1.2rem;
  background-color: #ccc;
  color: #222;
  font-size: 0.85rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    background-color: #bbb;
    transform: scale(1.03);
  }
`;