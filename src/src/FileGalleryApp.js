import React, { useState } from 'react';
import Chatbot from './Chatbot';
import TenantFileGallery from './TenantFileGallery';

const FileGalleryApp = () => {
    const [filterCriteria, setFilterCriteria] = useState({});

    const handleSetFilterCriteria = (criteria) => {
        setFilterCriteria(criteria);
    };

    return (
        <div>
            <Chatbot setFilterCriteria={handleSetFilterCriteria} />
            <TenantFileGallery filterCriteria={filterCriteria} />
        </div>
    );
};

export default FileGalleryApp;
