import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignupForm } from './components/forms/signup-form';
import { LoginForm } from './components/forms/login-form';
import Home from './components/pages/annonce/home';
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
import TermsOfUse from './components/pages/cgu';
import PrivacyPolicy from './components/pages/privacy';
import PageRemerciementPaiement from './components/pages/remerciements';
import Page404 from './components/pages/page404';
import ErrorBoundary from './components/dashboard/error-boundary';
function App() {
    return (
        <AuthProvider>
            <Router>
                <ErrorBoundary>
                    <Routes>
                    {/* Routes publiques */}
                    <Route path="/signup" element={<SignupForm />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/annonce" element={<Home />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/detail-annonce/:id" element={<DetailAnnonce />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/tombolas" element={<TombolaListing />} />
                    <Route path="/settings" element={<ProfileSettings />} />
                    <Route path="/parametres" element={<ParametresUtilisateur />} />
                    <Route path="/notifications" element={<NotificationPage />} />
                    <Route path="/messages" element={<Messagerie />} />
                    <Route path="/cgu" element={<TermsOfUse />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/merci" element={<PageRemerciementPaiement />} />
                    <Route path="*" element={<Page404 />} />


                    {/* Routes protégées */}
                    {/* <Route element={<ProtectedRoute allowedGroups={["utilisateur", "annonceur"]} />}>

                    </Route> */}

                    {/* Route réservée aux annonceurs */}
                    <Route element={<ProtectedRoute allowedGroups={["annonceur","moderateur"]} redirectPath="/annonce" />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        
                    </Route>

                    {/* Route 404 (optionnelle) */}
                    {/* <Route path="*" element={<NotFound />} /> */}
                </Routes> 
                </ErrorBoundary>
               
            </Router>
        </AuthProvider>
    );
}

export default App;