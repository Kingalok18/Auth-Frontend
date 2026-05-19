import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route,  Routes } from 'react-router'
import './index.css'
import App from './App.tsx'
import Login from "./pages/Login.tsx";
import About from "./pages/About.tsx";
import Services from "./pages/Services.tsx";
import Signup from "./pages/Signup.tsx";
import RootLayout from "./pages/RootLayout.tsx";
import Userhome from './pages/users/Userhome.tsx'
import Userlayout from './pages/users/Userlayout.tsx'
import Userprofile from './pages/users/Userprofile.tsx'
import OAuthSuccess from './pages/OAuthSuccess.tsx'
import OAuthFailure from './pages/OAuthFailure.tsx'

createRoot(document.getElementById('root')!).render(
  
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<RootLayout />}>             {/* This is the root route that will render all component (parent) */}
            <Route index element={<App />} />                   {/* This will render the App component when the user visits the root URL (default child route) */}
            <Route path="/login" element={<Login />} />         {/* This will render the Login component when the user visits /login (child route) */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/dashboard" element={<Userlayout />}>
              <Route index element={<Userhome />} />
              <Route path="profile" element={<Userprofile />} />
            </Route>
            <Route path="auth/success" element={<OAuthSuccess />} />
            <Route path="auth/failure" element={<OAuthFailure />} />
          </Route>
      </Routes>
    </BrowserRouter>
)
