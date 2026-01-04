import React, { useState } from 'react';
import FileUploader from '../components/FileUploader';
import { UploadResponse } from '../api';
import './Upload.css';

const Upload: React.FC = () => {
  const [lastUpload, setLastUpload] = useState<UploadResponse | null>(null);

  const handleUploadSuccess = (response: UploadResponse) => {
    setLastUpload(response);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="upload-page">
      <header className="header">
        <h1>File Share</h1>
        <p>Upload files, images, or text and share via Telegram</p>
      </header>

      <FileUploader onUploadSuccess={handleUploadSuccess} />

      {lastUpload && (
        <div className="upload-result">
          <h3>Upload Successful!</h3>
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
                Copy
              </button>
            </div>
            <a
              href={lastUpload.share_url}
              target="_blank"
              rel="noopener noreferrer"
              className="view-link"
            >
              Open Preview
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
