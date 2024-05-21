import React from 'react';
import tooltipIcon from './file_baby_tooltip_20px.png'; // Ensure this is the correct path

const TooltipIcon = ({ title }) => (
    <img tabIndex="0" src={tooltipIcon} alt="Tooltip" title={title} className="tooltip-icon" />
);

export default TooltipIcon;
