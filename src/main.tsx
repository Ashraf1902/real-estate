import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import './styles/funnel.css';
import './styles/checkout.css';
import './styles/upsell.css';
import './styles/admin.css';

import Landing from './pages/funnel/Landing';
import Checkout from './pages/funnel/Checkout';
import Upsell from './pages/funnel/Upsell';
import Downsell from './pages/funnel/Downsell';
import ThankYou from './pages/funnel/ThankYou';

import { AdminLayout } from './pages/admin/AdminLayout';
import Overview from './pages/admin/Overview';
import FunnelBuilder from './pages/admin/FunnelBuilder';
import Orders from './pages/admin/Orders';
import Leads from './pages/admin/Leads';
import Products from './pages/admin/Products';
import Settings from './pages/admin/Settings';
import { ChatWidget } from './components/ChatWidget';

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChatWidget />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/upsell" element={<Upsell />} />
        <Route path="/downsell" element={<Downsell />} />
        <Route path="/thankyou" element={<ThankYou />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="builder" element={<FunnelBuilder />} />
          <Route path="orders" element={<Orders />} />
          <Route path="leads" element={<Leads />} />
          <Route path="products" element={<Products />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
