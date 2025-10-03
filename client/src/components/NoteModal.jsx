import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendarAlt, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import './NoteModal.css';

const NoteModal = ({ note, onClose, onEdit, onDelete }) => {
  if (!note) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        
        {note.image_url && (
          <div className="modal-image-container">
            <img 
              src={note.image_url.startsWith('http') ? note.image_url : `http://localhost:5000${note.image_url}`}
              alt={note.title || 'Note image'}
              className="modal-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          </div>
        )}

        <div className="modal-body">
          <h2 className="modal-title">{note.title || 'Untitled Note'}</h2>
          
          {note.post_date && (
            <div className="modal-date">
              <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
              <span>{new Date(note.post_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}</span>
            </div>
          )}
          
          <div className="modal-description">
            {note.description || 'No description provided.'}
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onEdit} className="edit-button">
            <FontAwesomeIcon icon={faEdit} /> Edit
          </button>
          <button onClick={onDelete} className="delete-button">
            <FontAwesomeIcon icon={faTrash} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
