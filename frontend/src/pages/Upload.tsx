import React, { useState } from 'react';
import FileUploader from '../components/FileUploader';
import LanguageSwitcher from '../components/LanguageSwitcher';
import type { UploadResponse } from '../api';
import { useI18n } from '../i18n';
import './Upload.css';

const Upload: React.FC = () => {
  const { t } = useI18n();
  const [lastUpload, setLastUpload] = useState<UploadResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleUploadSuccess = (response: UploadResponse) => {
    setLastUpload(response);
    setCopied(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="upload-page">
      <div className="cyber-grid"></div>
      <div className="particles"></div>

      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">⬡</div>
            <h1 className="title">{t('title')}</h1>
          </div>
          <LanguageSwitcher />
        </div>
        <p className="subtitle">{t('subtitle')}</p>
        <div className="header-line"></div>
      </header>

      <FileUploader onUploadSuccess={handleUploadSuccess} />

      {lastUpload && (
        <div className="upload-result">
          <div className="result-header">
            <span className="success-icon">✓</span>
            <h3>{t('uploadSuccess')}</h3>
          </div>
          <div className="result-info">
            <span className="filename">{lastUpload.filename}</span>
            <div className="share-link">
              <input
                type="text"
                readOnly
                value={lastUpload.share_url}
                className="link-input"
              />
              <button
                className="copy-btn"
                onClick={() => copyToClipboard(lastUpload.share_url)}
              >
                {copied ? t('copied') : t('copyLink')}
              </button>
            </div>
            <a
              href={lastUpload.share_url}
              target="_blank"
              rel="noopener noreferrer"
              className="view-link"
            >
              {t('openPreview')}
              <span className="arrow">→</span>
            </a>
          </div>
        </div>
      )}

      <footer className="footer">
        <span className="footer-text">// POWERED BY TELEGRAM BOT API</span>
      </footer>
    </div>
  );
};

export default Upload;
