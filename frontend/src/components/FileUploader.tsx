import React, { useState, useCallback } from 'react';
import { uploadFile, uploadText } from '../api';
import type { UploadResponse } from '../api';
import { useI18n } from '../i18n';
import './FileUploader.css';

interface FileUploaderProps {
  onUploadSuccess: (response: UploadResponse) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadSuccess }) => {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [textContent, setTextContent] = useState('');
  const [uploadType, setUploadType] = useState<'file' | 'text'>('file');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setUploadType('file');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    setProgress(0);

    try {
      let response: UploadResponse;

      if (uploadType === 'file' && file) {
        response = await uploadFile(file, description, setProgress);
      } else if (uploadType === 'text' && textContent) {
        response = await uploadText(textContent, description);
      } else {
        throw new Error('No content to upload');
      }

      onUploadSuccess(response);
      setFile(null);
      setTextContent('');
      setDescription('');
      setProgress(0);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
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

  return (
    <div className="uploader">
      <div className="upload-tabs">
        <button
          className={`tab ${uploadType === 'file' ? 'active' : ''}`}
          onClick={() => setUploadType('file')}
        >
          <span className="tab-icon">📁</span>
          {t('fileUpload')}
        </button>
        <button
          className={`tab ${uploadType === 'text' ? 'active' : ''}`}
          onClick={() => setUploadType('text')}
        >
          <span className="tab-icon">📝</span>
          {t('textUpload')}
        </button>
      </div>

      {uploadType === 'file' ? (
        <div
          className={`drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-input"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-input" className="drop-label">
            {file ? (
              <div className="file-info">
                <div className="file-icon">📄</div>
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
              </div>
            ) : (
              <div className="drop-message">
                <div className="upload-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 16V4m0 0L8 8m4-4l4 4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 20h18" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="drop-text">{t('dropMessage')}</span>
                <span className="drop-subtext">{t('orClick')}</span>
              </div>
            )}
          </label>
          <div className="scan-line"></div>
        </div>
      ) : (
        <div className="text-input-wrapper">
          <textarea
            className="text-input"
            placeholder={t('textPlaceholder')}
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            rows={8}
          />
          <div className="text-counter">{textContent.length} chars</div>
        </div>
      )}

      <input
        type="text"
        className="description-input"
        placeholder={t('descriptionPlaceholder')}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {uploading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }}>
              <div className="progress-glow"></div>
            </div>
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
      )}

      <button
        className="upload-btn"
        onClick={handleUpload}
        disabled={uploading || (uploadType === 'file' ? !file : !textContent)}
      >
        <span className="btn-text">{uploading ? t('uploading') : t('uploadBtn')}</span>
        <span className="btn-icon">→</span>
      </button>
    </div>
  );
};

export default FileUploader;
