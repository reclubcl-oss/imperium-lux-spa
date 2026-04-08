import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Admin from './pages/Admin';
import './index.css';

function Layout() {
  const { pathname } = useLocation();
  const isAdmin = pathname === '/admin';
  return (
    <>
      {!isAdmin && <Navbar />}
      <main>
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/reservar" element={<Booking />} />
          <Route path="/admin"   element={<Admin />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
