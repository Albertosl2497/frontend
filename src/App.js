import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Navigate,
  Routes,
} from "react-router-dom";
import HomePage from "./Pages/HomePage";
import LoginPage from "./Pages/LoginPage";
import Dashboard from "./Pages/Dashboard";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lotteryNo, setLotteryNo] = useState(0);

  window.fbAsyncInit = function () {
  window.FB.init({
    appId: 'tu_app_id',
    autoLogAppEvents: true,
    xfbml: true,
    version: 'v11.0',
  });
};

(function (d, s, id) {
  var js,
    fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s);
  js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
})(document, 'script', 'facebook-jssdk');
  
  useEffect(() => {
    const getTickets = async () => {
      try {
        const response = await fetch(
          "https://rifasefectivocampotreinta.onrender.com/api/tickets/unsold-tickets"
        );
        const data = await response.json();
        setTickets(data.availableTickets);
        setLotteryNo(data.lotteryNo);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getTickets();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <>
      <Router>
        <Routes>
          <Route
            exact
            path="/"
            element={
              <HomePage
                tickets={tickets}
                loading={loading}
                lotteryNo={lotteryNo}
                setTickets={setTickets}
              />
            }
          />
          <Route
            exact
            path="/login"
            element={
              isLoggedIn ? (
                <Dashboard handleLogout={handleLogout} lotteryNo={lotteryNo} />
              ) : (
                <LoginPage setIsLoggedIn={setIsLoggedIn} />
              )
            }
          />

          <Route
            exact
            path="/dashboard"
            element={
              isLoggedIn ? (
                <Dashboard handleLogout={handleLogout} lotteryNo={lotteryNo} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;

// https://github.com/Albertosl2497/backend
