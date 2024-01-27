import React, { useState, useEffect, useCallback } from 'react';
import './TenantFileGallery.css';

function TenantFileGallery({ userName, filterCriteria = {} }) {
  const [tenant, setTenant] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Adjust based on your preference

  const containerUrl = `https://claimed.at.file.baby/filebabyblob`;

  const fetchFiles = useCallback(async () => {
    if (!tenant) {
      setError('Please enter a tenant name.');
      return;
    }

    setError('');
    setLoading(true);
    setFiles([]);

    try {
      const response = await fetch(`${containerUrl}?restype=container&comp=list&prefix=${encodeURIComponent(tenant)}/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.text();

      const parser = new DOMParser();
      const xml = parser.parseFromString(data, "application/xml");
      const blobs = Array.from(xml.querySelectorAll('Blob'));
      let filesData = blobs.map(blob => {
        const fullPath = blob.querySelector('Name').textContent;
        const fileName = fullPath.split('/').pop();
        const fileExtension = fileName.split('.').pop();
        const encodedFilePath = encodeURIComponent(fullPath.split(`.${fileExtension}`)[0]);
        const url = `${containerUrl}/${encodedFilePath}.${fileExtension}`;
        const verifyUrl = `https://contentcredentials.org/verify?source=${encodeURIComponent(url)}`;
        return { name: fileName, url, verifyUrl };
      });

      // Apply filters based on filterCriteria
      if (filterCriteria.type) {
        const regex = filterCriteria.type === 'image' ? /\.(jpg|jpeg|png|gif)$/i :
            filterCriteria.type === 'audio' ? /\.(mp3|wav|aac)$/i :
                filterCriteria.type === 'video' ? /\.(mp4|mov|avi)$/i : null;
        if (regex) {
          filesData = filesData.filter(file => file.name.match(regex));
        }
      }

      setFiles(filesData);
    } catch (e) {
      console.error('Error fetching files:', e);
      setError('Failed to load resources.');
    } finally {
      setLoading(false);
    }
  }, [tenant, filterCriteria, containerUrl]);

  useEffect(() => {
    if (userName) {
      setTenant(userName);
    }
  }, [userName]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleTenantChange = (event) => {
    setTenant(event.target.value);
  };

  const handleSearchClick = () => {
    fetchFiles();
  };

  const handleShareClick = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('URL Copied to Clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFiles = files.slice(indexOfFirstItem, indexOfLastItem);

  const handlePreviousClick = () => {
    setCurrentPage(currentPage - 1);
  };

  const handleNextClick = () => {
    setCurrentPage(currentPage + 1);
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === Math.ceil(files.length / itemsPerPage);

  return (
      <div>
        <h1>My Files</h1>
        <div className="tenant-input-container">
          <input
              type="text"
              value={tenant}
              onChange={handleTenantChange}
              placeholder="Enter Your Name"
              disabled={!!userName}
          />
          <button onClick={handleSearchClick} disabled={loading}>
            {loading ? 'Loading...' : 'Load My Files'}
          </button>
          {error && <p className="error">{error}</p>}
        </div>
        <div className="file-gallery">
          {currentFiles.map((file, index) => (
              <div key={index} className="file-item">
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  <img src={file.url} alt={file.name} />
                  <p>{file.name}</p>
                </a>
                <button onClick={() => handleShareClick(file.url)}>Share</button>
              </div>
          ))}
        </div>
        <div className="pagination-controls">
          <button onClick={handlePreviousClick} disabled={isFirstPage}>
            Previous
          </button>
          <button onClick={handleNextClick} disabled={isLastPage}>
            Next
          </button>
        </div>
      </div>
  );
}

export default TenantFileGallery;
