// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MainHome from './pages/MainHome';
import AccountOutlook from './pages/AccountOutlook';
import ProtectedRoute from './components/ProtectedRoute';
import AccountConnectPage from './pages/AccountConnectPage';
import AccountConsentPage from './pages/AccountConsentPage';
import TransferPage from './pages/TransferPage'; 
import SignUpPage from './pages/SignUpPage';
import AppInitializer from './components/AppInitializer';
import TransactionCreatePage from './pages/TransactionCreatePage';
import CardManagePage from './pages/CardManagePage';
import CardConnectPage from './pages/CardConnectPage';
import CardConsentPage from './pages/CardConsentPage';
import PaymentPage from './pages/PaymentPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <>
            <AppInitializer />
            <LoginPage />
          </>
        } />

        <Route path="/" element={
          <ProtectedRoute>
            <MainHome />
          </ProtectedRoute>
        } />

        <Route path="/accounts" element={
          <ProtectedRoute>
            <AccountOutlook />
          </ProtectedRoute>
        } />

        <Route path="/accounts/connect" element={
          <ProtectedRoute>
            <AccountConnectPage />
          </ProtectedRoute>
        } />

        <Route path="/accounts/connect/consent" element={
          <ProtectedRoute>
            <AccountConsentPage />
          </ProtectedRoute>
        } />

        <Route path="/accounts/transfer" element={
          <ProtectedRoute>
            <TransferPage />
          </ProtectedRoute>
        } />

        <Route path="/transaction/create" element={
          <ProtectedRoute>
            <TransactionCreatePage  />
          </ProtectedRoute>
        } />

        <Route path="/cards" element={
          <ProtectedRoute>
            <CardManagePage  />
          </ProtectedRoute>
        } />

        <Route path="/cards/connect" element={
          <ProtectedRoute>
            <CardConnectPage  />
          </ProtectedRoute>
        } />

        <Route path="/cards/connect/consent" element={
          <ProtectedRoute>
            <CardConsentPage  />
          </ProtectedRoute>
        } />

        <Route path="/payment" element={
          <ProtectedRoute>
            <PaymentPage  />
          </ProtectedRoute>
        } />

        <Route path="/transaction/history" element={
          <ProtectedRoute>
            <TransactionHistoryPage  />
          </ProtectedRoute>
        } />

        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </Router>
  );
}

export default App;

