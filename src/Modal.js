import React from 'react';
import './Modal.css';

// Function to safely stringify an object with circular references
function safeStringify(obj, replacer = null, space = 2) {
    const seen = new WeakSet();
    return JSON.stringify(obj, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular Reference]';
            }
            seen.add(value);
        }
        if (replacer) {
            return replacer(key, value);
        }
        return value;
    }, space);
}

const Modal = ({ content, onClose }) => {
    const safelyStringifiedContent = safeStringify(content, null, 2);

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>File Manifest</h2>
                <pre>{safelyStringifiedContent}</pre>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default Modal;
