import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MainHome from './pages/MainHome';
import AccountOutlook from './pages/AccountOutlook';
import CreateAccount from './pages/CreateAccount';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainHome />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/accounts" element={<AccountOutlook />} />
        <Route path="/create_account" element={<CreateAccount />} />
      </Routes>
    </Router>
  );
}

export default App;