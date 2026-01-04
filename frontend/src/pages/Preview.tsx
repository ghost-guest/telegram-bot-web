import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFileInfo, getDownloadUrl, getPreviewUrl } from '../api';
import type { FileInfo } from '../api';
import { useI18n } from '../i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './Preview.css';

const Preview: React.FC = () => {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const [file, setFile] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadFileInfo(id);
    }
  }, [id]);

  const loadFileInfo = async (fileId: string) => {
    try {
      const info = await getFileInfo(fileId);
      setFile(info);
    } catch {
      setError('File not found');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
    if (bytes >= 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    }
    return bytes + ' B';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const isImage = (type: string): boolean => {
    return type.startsWith('image/');
  };

  const isText = (type: string): boolean => {
    return type === 'text/plain';
  };

  if (loading) {
    return (
      <div className="preview-page">
        <div className="cyber-grid"></div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span className="loading-text">{t('loading')}</span>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="preview-page">
        <div className="cyber-grid"></div>
        <div className="error-card">
          <div className="error-icon">⚠</div>
          <h2>{t('fileNotFound')}</h2>
          <p>{t('fileNotFoundDesc')}</p>
          <a href="/" className="back-link">{t('backToUpload')}</a>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-page">
      <div className="cyber-grid"></div>
      <div className="particles"></div>

      <div className="preview-header">
        <a href="/" className="back-btn">
          <span>←</span> {t('backToUpload')}
        </a>
        <LanguageSwitcher />
      </div>

      <div className="preview-card">
        <div className="card-header">
          <div className="file-icon-large">
            {isImage(file.filetype) ? '🖼️' : isText(file.filetype) ? '📄' : '📁'}
          </div>
          <h1 className="file-title">{file.filename}</h1>
        </div>

        {isImage(file.filetype) && (
          <div className="image-preview">
            <img src={getPreviewUrl(file.id)} alt={file.filename} />
            <div className="image-overlay"></div>
          </div>
        )}

        {isText(file.filetype) && (
          <div className="text-preview">
            <iframe src={getPreviewUrl(file.id)} title="Text Preview" />
          </div>
        )}

        <div className="file-details">
          <div className="detail-row">
            <span className="detail-label">{t('fileType')}</span>
            <span className="detail-value">{file.filetype}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t('fileSize')}</span>
            <span className="detail-value">{formatFileSize(file.filesize)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t('uploadTime')}</span>
            <span className="detail-value">{formatDate(file.created_at)}</span>
          </div>
          {file.description && (
            <div className="detail-row description">
              <span className="detail-label">{t('description')}</span>
              <span className="detail-value">{file.description}</span>
            </div>
          )}
        </div>

        <a href={getDownloadUrl(file.id)} className="download-btn" download>
          <span className="btn-icon">↓</span>
          {t('downloadFile')}
        </a>

        <a href="/" className="upload-more">
          {t('uploadAnother')}
        </a>
      </div>
    </div>
  );
};

export default Preview;
