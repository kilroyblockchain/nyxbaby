import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const NyxFileBabyModule = ({ userName }) => {
    const [savedPages, setSavedPages] = useState([]);
    const [error, setError] = useState('');

    const fetchSavedPages = useCallback(async () => {
        setError('');
        try {
            const response = await axios.get(`https://claimed.at.file.baby/filebabyblob?restype=container&comp=list&prefix=${encodeURIComponent(userName)}/NYX_Page`);
            if (response.status !== 200) throw new Error(`HTTP error! status: ${response.status}`);

            const parser = new DOMParser();
            const xml = parser.parseFromString(response.data, "application/xml");
            const blobs = Array.from(xml.querySelectorAll('Blob'));
            const pagesData = blobs.map(blob => {
                const fullPath = blob.querySelector('Name').textContent;
                const fileName = fullPath.split('/').pop();
                const url = `https://claimed.at.file.baby/filebabyblob/${encodeURIComponent(fullPath)}`;
                return { name: fileName, url };
            });

            setSavedPages(pagesData);
        } catch (e) {
            setError(`Failed to load saved pages. ${e.message}`);
        }
    }, [userName]);

    useEffect(() => {
        fetchSavedPages();
    }, [fetchSavedPages]);

    return (
        <div>
            <h1>Saved NYX Pages: Filter My Gallery for html</h1>
            {error && <p className="error">{error}</p>}
            <ul>
                {savedPages.map((page, index) => (
                    <li key={index}>
                        <a href={page.url} target="_blank" rel="noopener noreferrer">
                            {page.name}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NyxFileBabyModule;
