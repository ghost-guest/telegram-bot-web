import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFileInfo, getDownloadUrl, getPreviewUrl, FileInfo } from '../api';
import './Preview.css';

const Preview: React.FC = () => {
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
    } catch (err) {
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
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="preview-page">
        <div className="error-card">
          <span className="error-icon">😕</span>
          <h2>File Not Found</h2>
          <p>The file you're looking for doesn't exist or has been removed.</p>
          <a href="/" className="back-link">Back to Upload</a>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-page">
      <div className="preview-card">
        <div className="file-header">
          <h1 className="file-title">{file.filename}</h1>
        </div>

        {isImage(file.filetype) && (
          <div className="image-preview">
            <img src={getPreviewUrl(file.id)} alt={file.filename} />
          </div>
        )}

        {isText(file.filetype) && (
          <div className="text-preview">
            <iframe src={getPreviewUrl(file.id)} title="Text Preview" />
          </div>
        )}

        <div className="file-details">
          <div className="detail-item">
            <span className="label">Type</span>
            <span className="value">{file.filetype}</span>
          </div>
          <div className="detail-item">
            <span className="label">Size</span>
            <span className="value">{formatFileSize(file.filesize)}</span>
          </div>
          <div className="detail-item">
            <span className="label">Uploaded</span>
            <span className="value">{formatDate(file.created_at)}</span>
          </div>
          {file.description && (
            <div className="detail-item description">
              <span className="label">Description</span>
              <span className="value">{file.description}</span>
            </div>
          )}
        </div>

        <a href={getDownloadUrl(file.id)} className="download-btn" download>
          Download File
        </a>

        <a href="/" className="upload-more">
          Upload Another File
        </a>
      </div>
    </div>
  );
};

export default Preview;
