import React, { useState} from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';
import Loginform from './pages/LoginPage/LoginForm/Loginform.js';
import Home from './pages/HomePage/home.js';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (isLoggedIn) {
    // Render the logged-in UI normally — global font-size reduction is now
    // applied at the root level (html/body) so no wrapper is necessary.
    return <Home setIsLoggedIn={setIsLoggedIn} />;
  }

  return (
    <div>
      <Loginform setIsLoggedIn={setIsLoggedIn} /> 
    </div>
  );
}

export default App;

