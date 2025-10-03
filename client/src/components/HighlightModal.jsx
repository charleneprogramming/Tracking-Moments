import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const HighlightModal = ({ note, onClose }) => {
  if (!note) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="highlight-modal" onClick={e => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        
        <div className="modal-content">
          {note.image_url && (
            <div className="modal-image">
              <img 
                src={note.image_url.startsWith('http') 
                  ? note.image_url 
                  : `http://localhost:5000${note.image_url}`} 
                alt={note.title} 
              />
            </div>
          )}
          
          <div className="modal-details">
            <h2>{note.title}</h2>
            <p className="modal-date">
              {new Date(note.post_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <div className="modal-description">
              {note.description || 'No description available'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighlightModal;
