import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nProvider } from './i18n';
import Upload from './pages/Upload';
import Preview from './pages/Preview';
import './App.css';

function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Upload />} />
          <Route path="/s/:id" element={<Preview />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}

export default App;
