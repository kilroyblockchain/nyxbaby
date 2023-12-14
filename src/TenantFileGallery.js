import React, { useState, useEffect, useCallback } from 'react';
import './TenantFileGallery.css';

function TenantFileGallery({ userName }) {
  const [tenant, setTenant] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!tenant) {
      setError('Please enter a tenant name.');
      return;
    }

    setError('');
    setLoading(true);
    setFiles([]); // Clear current files

    const containerUrl = `https://filebaby.blob.core.windows.net/filebabyblob`;
    const sasToken = process.env.REACT_APP_SAS_TOKEN;

    try {
      const response = await fetch(`${containerUrl}?restype=container&comp=list&prefix=${encodeURIComponent(tenant)}/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.text();

      const parser = new DOMParser();
      const xml = parser.parseFromString(data, "application/xml");
      const blobs = Array.from(xml.querySelectorAll('Blob'));
      const filesData = blobs.map(blob => {
        const fullPath = blob.querySelector('Name').textContent;
        const fileName = fullPath.split('/').pop(); // Extract the file name without the folder path
        const url = `${containerUrl}/${fullPath}?${sasToken}`;
        // Double encode the URL for the verify link
        const encodedUrl = encodeURIComponent(url);
        const doubleEncodedUrl = encodeURIComponent(encodedUrl);
        const verifyUrl = `https://contentcredentials.org/verify?source=${doubleEncodedUrl}`;
        return { name: fileName, url, verifyUrl }; // Store the name, URL, and verify URL
      }).filter(file =>
          !file.name.endsWith('.c2pa') && // Filter out .c2pa files
          !file.name.endsWith('_thumbnail.png') // Filter out thumbnail files
      );

      setFiles(filesData);
    } catch (e) {
      console.error('Error fetching files:', e);
      setError('Failed to load resources.');
    } finally {
      setLoading(false);
    }
  }, [tenant]); // Dependency array for useCallback

  useEffect(() => {
    if (userName) {
      setTenant(userName);
      fetchFiles();
    }
  }, [userName, fetchFiles]); // Updated useEffect dependencies

  const handleTenantChange = (event) => {
    setTenant(event.target.value);
  };

  const handleSearchClick = () => {
    fetchFiles();
  };

  return (
      <div>
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
          {files.map((file, index) => (
              <div key={index} className="file-item">
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  <img src={file.url} alt={file.name} />
                  <p>{file.name}</p>
                </a> {/* Close the image link anchor tag */}
                <a href={file.verifyUrl} target="_blank" rel="noopener noreferrer">
                  Verify
                </a> {/* Separate anchor tag for the Verify link */}
              </div>
          ))}
        </div>
      </div>
  );
}

export default TenantFileGallery;
