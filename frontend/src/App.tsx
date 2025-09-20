import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SharedStoryPage } from './components/SharedStoryPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/shared/:shareToken" element={<SharedStoryPage />} />
    </Routes>
  );
}

export default App;
