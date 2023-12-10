import React, { useState } from 'react';
import './TenantFileGallery.css';
import caifoj from './cai-foj-800.png'; // Make sure the path is correct

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

    const containerUrl = `https://filebaby.blob.core.windows.net/dev-filebabyblob`;
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
        const verifyUrl = `https://contentcredentials.org/verify?source=${encodeURIComponent(url)}`;
        return { name: fileName, url, verifyUrl }; // Store the name, URL, and verify URL
      }).filter(file =>
          !file.name.endsWith('.c2pa') && // Filter out .c2pa files
          !file.name.endsWith('_thumbnail.png') // Filter out files ending with _thumbnail.png
      );

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
        <div className="tenant-input-container">
          <input
              type="text"
              value={tenant}
              onChange={handleTenantChange}
              placeholder="Enter Your Name"
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
                  <a href={file.verifyUrl} target="_blank" rel="noopener noreferrer">
                    Verify
                  </a>
                </a>
              </div>
          ))}
        </div>
        <footer className="footer">
          <p>
            <img src={caifoj} alt="Friends of Justin" className="responsive" />
          </p>
          <p>
            Powered by <a href="https://gpt.paybots.ai" target="_blank" rel="noopener noreferrer">Paybots.AI</a>
          </p>
          <p>
            To inspect your content, use <a href="https://contentcredentials.org/verify" target="_blank" rel="noopener noreferrer">contentcredentials.org/verify</a>
          </p>
          <p>
            &copy; 2023-2024, <a href="https://friendsofjustin.knowbots.org">Friends of Justin</a>
          </p>
        </footer>
      </div>
  );
}

export default TenantFileGallery;
