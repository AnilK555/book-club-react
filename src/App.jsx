import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Navbar } from './components/Navbar.jsx';
import { useAuth } from './components/AuthProvider/index.jsx';
import { Signup } from './components/Signup.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { ReviewsPage } from './pages/ReviewsPage.jsx';
import { MyReadingList } from './pages/MyReadingList.jsx';

function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Signup />;
  }

  return (
    <div>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/MyReadingList" element={<MyReadingList />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
