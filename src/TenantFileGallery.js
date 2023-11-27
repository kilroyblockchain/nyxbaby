import React, { useState } from 'react';
import './TenantFileGallery.css';

function TenantFileGallery() {
  const [tenant, setTenant] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
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
      const response = await fetch(`${containerUrl}?restype=container&comp=list&prefix=${encodeURIComponent(tenant)}/&${sasToken}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.text();

      const parser = new DOMParser();
      const xml = parser.parseFromString(data, "application/xml");
      const blobs = Array.from(xml.querySelectorAll('Blob'));
      const filesData = blobs.map(blob => {
        const fullPath = blob.querySelector('Name').textContent;
        const fileName = fullPath.split('/').pop(); // Extract the file name without the folder path
        const url = `${containerUrl}/${fullPath}?${sasToken}`;
        return { name: fileName, url }; // Store the file name without the folder and the URL
      });

      setFiles(filesData);
    } catch (e) {
      console.error('Error fetching files:', e);
      setError('Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  const handleTenantChange = (event) => {
    setTenant(event.target.value);
  };

  const handleSearchClick = () => {
    fetchFiles();
  };

  return (
      <div>
        <input
            type="text"
            value={tenant}
            onChange={handleTenantChange}
            placeholder="Enter Tenant Name"
        />
        <button onClick={handleSearchClick} disabled={loading}>
          {loading ? 'Loading...' : 'Load Tenant Files'}
        </button>
        {error && <p className="error">{error}</p>}
        <div className="file-gallery">
          {files.map((file, index) => (
              <div key={index} className="file-item">
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  <img src={file.url} alt={file.name} />
                  <p>{file.name}</p> {/* Display only the file name */}
                </a>
              </div>
          ))}
        </div>
      </div>
  );
}

export default TenantFileGallery;