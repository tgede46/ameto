import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense, useEffect } from "react";
import { useDispatch } from "react-redux";
import api from "./services/api";
import { setProfile } from "./store/userSlice";
import PageTransition from "./components/PageTransition";

// Lazy loading all pages for better build performance
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
const Maintenance = lazy(() => import("./pages/Maintenance"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dossier = lazy(() => import("./pages/Dossier"));
const Payment = lazy(() => import("./pages/Payment"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Messages = lazy(() => import("./pages/Messages"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Simple loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="w-12 h-12 border-4 border-[#FF385C] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function AnimatedRoutes() {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('auth/profile/');
          dispatch(setProfile(res.data));
        } catch (err) {
          localStorage.clear();
        }
      }
    };
    fetchProfile();
  }, [dispatch]);
  
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/property/:id" element={<PageTransition><PropertyDetails /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/maintenance" element={<PageTransition><Maintenance /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
          <Route path="/dossier" element={<PageTransition><Dossier /></PageTransition>} />
          <Route path="/payment" element={<PageTransition><Payment /></PageTransition>} />
          <Route path="/favorites" element={<PageTransition><Favorites /></PageTransition>} />
          <Route path="/messages" element={<PageTransition><Messages /></PageTransition>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
