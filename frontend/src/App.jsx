import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignupForm } from './components/forms/signup-form';
import { LoginForm } from './components/forms/login-form';
import Home from './components/home';
import DetailAnnonce from './components/detail-annoce';
import Dashboard from './components/dashboard.jsx/dashboard';
import { AuthProvider } from "@/context/AuthContext";
// import { NotFound } from './components/NotFound';

function App() {
  return (
    <AuthProvider>
          <Router>
     
      <Routes>
        <Route path="/" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />}/>
        <Route path="/annonce" element={<Home />} />
        <Route path="/detail-annonce" element={<DetailAnnonce />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* 
        
        <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Router>
    </AuthProvider>

  );
}

export default App;