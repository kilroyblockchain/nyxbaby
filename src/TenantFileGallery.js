import React, { useState, useEffect, useCallback } from 'react';
import './TenantFileGallery.css';

function TenantFileGallery({ userName, filterCriteria = {} }) {
  const [tenant, setTenant] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [nameFilter, setNameFilter] = useState('');  // State for name filter

  const containerUrl = `https://claimed.at.file.baby/filebabyblob`;

  const fetchFiles = useCallback(async () => {
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
        return { name: fileName, url, type: fileExtension };
      });

      // Apply type filter from filterCriteria if specified
      if (filterCriteria.type) {
        const regex = filterCriteria.type === 'image' ? /\.(jpg|jpeg|png|gif)$/i :
            filterCriteria.type === 'audio' ? /\.(mp3|wav|aac)$/i :
                filterCriteria.type === 'video' ? /\.(mp4|mov|avi)$/i : null;
        if (regex) {
          filesData = filesData.filter(file => file.name.match(regex));
        }
      }

      // Apply name filter
      if (nameFilter) {
        filesData = filesData.filter(file => file.name.toLowerCase().includes(nameFilter.toLowerCase()));
      }

      setFiles(filesData);
    } catch (e) {
      setError(`Failed to load resources. ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [tenant, filterCriteria, nameFilter, containerUrl]);  // Include nameFilter in dependencies

  useEffect(() => {
    if (userName) {
      setTenant(userName);
    }
  }, [userName]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    setCurrentPage(1);  // Reset to the first page whenever itemsPerPage or nameFilter changes
  }, [itemsPerPage, nameFilter]);

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

  const getFileThumbnail = (file) => {
    // Placeholder image for audio files
    if (file.type === 'mp3' || file.type === 'wav' || file.type === 'aac') {
      return '/html/audio_placeholder.png';  // Adjust the path as needed
    }
    return file.url;
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
        {error && <p className="error">{error}</p>}
        <div className="tenant-input-container">
          <input
              type="text"
              value={tenant}
              onChange={handleTenantChange}
              placeholder="Enter Your Name"
              disabled={!!userName}
          />
          <input  // Name filter input
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Filter by filename"
          />
          <button onClick={handleSearchClick} disabled={loading}>
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
        <div className="pagination-controls">
          <div className="items-per-page-selector">
            <label htmlFor="itemsPerPage">Items per page:</label>
            <select id="itemsPerPage" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <button onClick={handlePreviousClick} disabled={isFirstPage}>
            Previous
          </button>
          <button onClick={handleNextClick} disabled={isLastPage}>
            Next
          </button>
        </div>

        <div className="file-gallery">
          {currentFiles.map((file, index) => (
              <div key={index} className="file-item">
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  <img src={getFileThumbnail(file)} alt={file.name} />
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
