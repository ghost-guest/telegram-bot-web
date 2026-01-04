import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Upload from './pages/Upload';
import Preview from './pages/Preview';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Upload />} />
        <Route path="/s/:id" element={<Preview />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
