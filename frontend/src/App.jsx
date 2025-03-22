import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignupForm } from './components/forms/signup-form';
import { LoginForm } from './components/forms/login-form';
import Home from './components/pages/home';
import DetailAnnonce from './components/pages/detail-annoce';
import Dashboard from './components/dashboard/dashboard';
import { AuthProvider } from "@/context/AuthContext";
import FavoritesPage from '@/components/pages/favorites';
import ProfileSettings from './components/dashboard/settings';
import TombolaListing from './components/pages/tombola';
import { ProtectedRoute } from './components/others/protected-route';
import ParametresUtilisateur from './components/pages/parametres';
import NotificationPage from './components/pages/notifications';
import Messagerie from './components/pages/messages';
function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Routes publiques */}
                    <Route path="/" element={<SignupForm />} />
                    <Route path="/login" element={<LoginForm />} />
                       <Route path="/annonce" element={<Home />} />
                       <Route path="/detail-annonce/:id" element={<DetailAnnonce />} />
                       <Route path="/favorites" element={<FavoritesPage />} />
                      <Route path="/tombolas" element={<TombolaListing />} />
                      <Route path="/settings" element={<ProfileSettings />} />
                      <Route path="/parametres" element={<ParametresUtilisateur />} />
                      <Route path="/notifications" element={<NotificationPage />} />
                      <Route path="/messages" element={<Messagerie />} />

                    {/* Routes protégées */}
                    {/* <Route element={<ProtectedRoute allowedGroups={["utilisateur", "annonceur"]} />}>

                    </Route> */}

                    {/* Route réservée aux annonceurs */}
                    <Route element={<ProtectedRoute allowedGroups={["annonceur"]} redirectPath="/annonce" />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        
                    </Route>

                    {/* Route 404 (optionnelle) */}
                    {/* <Route path="*" element={<NotFound />} /> */}
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;