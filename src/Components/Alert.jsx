import React from 'react';
import './Alert.css';

const Alert = ({ onClose, content }) => {
  return (
    <div className="custom-alert">
      <span className="close-btn" onClick={onClose}>&times;</span>
      <div className="alert-content">
        {content}
      </div>
    </div>
  );
};

export default Alert;
