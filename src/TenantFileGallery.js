import React, { useState, useEffect, useCallback } from 'react';
import './TenantFileGallery.css';

function TenantFileGallery({ userName, filterCriteria }) {
  const [tenant, setTenant] = useState(userName || '');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [nameFilter, setNameFilter] = useState('');

  const containerUrl = `https://claimed.at.file.baby/filebabyblob`;

  const fetchFiles = useCallback(async () => {
    setError('');
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
        return { name: fileName, url, verifyUrl, type: fileExtension };
      });

      if (nameFilter) {
        filesData = filesData.filter(file => file.name.toLowerCase().includes(nameFilter.toLowerCase()));
      }

      if (filterCriteria && filterCriteria.type) {
        const regex = new RegExp(`.(${filterCriteria.type})$`, 'i');
        filesData = filesData.filter(file => file.name.match(regex));
      }

      setFiles(filesData);
    } catch (e) {
      setError(`Failed to load resources. ${e.message}`);
    } finally {
    }
  }, [tenant, filterCriteria, nameFilter, containerUrl]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    setCurrentPage(1); // Reset to the first page whenever itemsPerPage or nameFilter changes
  }, [itemsPerPage, nameFilter]);

  const handleTenantChange = (event) => {
    setTenant(event.target.value);
  };

  const handleShareClick = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('URL Copied to Clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getFileThumbnail = (file) => {
    if (file.type.match(/(mp3|wav|aac)$/i)) {
      return '/html/audio_placeholder.png'; // Adjust the path as needed
    }
    return file.url;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFiles = files.slice(indexOfFirstItem, indexOfLastItem);

  const handlePreviousClick = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const handleNextClick = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, Math.ceil(files.length / itemsPerPage)));
  };

  return (
      <div>
        <h1>My Files</h1>
        {error && <p className="error">{error}</p>}
        <div className="tenant-input-container">
          <p>Logged in as:</p>
          <input
              type="text"
              value={tenant}
              onChange={handleTenantChange}
              placeholder="Enter Your Name"
              disabled={!!userName}
          />
        </div>
        <div className={"filter-container"}>
          <div className="pagination-controls">
            <input
                className={"file-search"}
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="Filter by filename"
            />
            <div className="items-per-page-selector">
              <label htmlFor="itemsPerPage">Items per page:</label>
              <select id="itemsPerPage" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                <option value="1">1</option>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            {/* Add the Reload Files button here */}
            <button onClick={fetchFiles}>
              Reload Files
            </button>
            <button onClick={handlePreviousClick} disabled={currentPage === 1}>
              Previous
            </button>
            <button onClick={handleNextClick} disabled={currentPage === Math.ceil(files.length / itemsPerPage)}>
              Next
            </button>
          </div>
        </div>

        <div className="file-gallery">
          {currentFiles.map((file, index) => (
              <div key={index} className="file-item">
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  <img src={getFileThumbnail(file)} alt={file.name} className="file-thumbnail" />
                  <p>{file.name}</p>
                </a>
                <p><a href={file.verifyUrl} target="_blank" rel="noopener noreferrer">Verify</a></p>
                <button onClick={() => handleShareClick(file.url)}>Share</button>
              </div>
          ))}
        </div>
        <div className={"filter-container"}>
        <div className="pagination-controls">
          <button onClick={fetchFiles}>
            Reload Files
          </button>
          <button onClick={handlePreviousClick} disabled={currentPage === 1}>
            Previous
          </button>
          <button onClick={handleNextClick} disabled={currentPage === Math.ceil(files.length / itemsPerPage)}>
            Next
          </button>
        </div>
        </div>
      </div>
  );
}

export default TenantFileGallery;
