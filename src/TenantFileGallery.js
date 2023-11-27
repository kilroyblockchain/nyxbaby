import React, { useState } from 'react';
import './TenantFileGallery.css'; // Ensure this CSS file exists in your src directory

const githubToken = process.env.REACT_APP_GITHUB_TOKEN; // Make sure you've added your GitHub token to your .env file

async function fetchFilesFromDirectory(apiUrl, token) {
  let filesList = [];

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `token ${token}` // Add the token to the request headers
      },
    });
    const data = await response.json();

    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.type === 'file' && (item.name.endsWith('.jpg') || item.name.endsWith('.png'))) {
          filesList.push(item);
        } else if (item.type === 'dir') {
          const subDirFiles = await fetchFilesFromDirectory(item.url, token);
          filesList = filesList.concat(subDirFiles);
        }
      }
    } else {
      console.error('GitHub API error:', data.message);
    }
  } catch (error) {
    console.error('Error fetching directory:', error);
  }

  return filesList;
}

function TenantFileGallery() {
  const [tenant, setTenant] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);

  const handleTenantChange = (event) => {
    setTenant(event.target.value);
  };

  const handleSearch = async () => {
    setError(null);
    if (tenant) {
      const apiUrl = `https://api.github.com/repos/PaybotsAI/paybotsai.github.io/contents/vip/${tenant}`;
      const fetchedFiles = await fetchFilesFromDirectory(apiUrl, githubToken);
      setFiles(fetchedFiles);
    } else {
      setError('Please enter a tenant name.');
    }
  };

  const getThumbnailUrl = (fileUrl) => {
    return fileUrl.includes('_thumbnail') ? fileUrl : fileUrl.replace('.jpg', '_thumbnail.png').replace('.png', '_thumbnail.png');
  };
  return (
      <div>
        <input
            type="text"
            value={tenant}
            onChange={handleTenantChange}
            placeholder="Enter Tenant Name"
        />
        <button onClick={handleSearch}>Load Tenant Files</button>
        {error && <p className="error-message">{error}</p>}
        <div className="file-gallery">
          {files.map((file, index) => (
              <div key={index} className="file-item">
                <img
                    src={getThumbnailUrl(file.download_url)}
                    alt={`Thumbnail for ${file.name}`}
                />
                <p>{file.name}</p>
                <a href={file.download_url} target="_blank" rel="noopener noreferrer">
                  View
                </a>
              </div>
          ))}
        </div>
      </div>
  );
}
export default TenantFileGallery;
