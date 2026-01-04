import React from 'react';
import { useI18n } from '../i18n';
import './LanguageSwitcher.css';

const LanguageSwitcher: React.FC = () => {
  const { lang, setLang } = useI18n();

  return (
    <div className="lang-switcher">
      <button
        className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
        onClick={() => setLang('en')}
      >
        EN
      </button>
      <span className="lang-divider">/</span>
      <button
        className={`lang-btn ${lang === 'zh' ? 'active' : ''}`}
        onClick={() => setLang('zh')}
      >
        中文
      </button>
    </div>
  );
};

export default LanguageSwitcher;
