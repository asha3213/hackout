import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import VerifierPanel from './components/VerifierPanel';
import ProducerPanel from './components/ProducerPanel';
import MarketPanel from './components/MarketPanel';
import AccountSelector from './components/AccountSelector';
import EnhancedThreeBackground from './components/EnhancedThreeBackground';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen gradient-bg">
          <EnhancedThreeBackground />
          <AccountSelector />
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/verifier" element={<VerifierPanel />} />
              <Route path="/producer" element={<ProducerPanel />} />
              <Route path="/market" element={<MarketPanel />} />
            </Routes>
          </Layout>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;