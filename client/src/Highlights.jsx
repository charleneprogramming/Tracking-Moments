import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import Navbar from './components/Navbar';
import HighlightModal from './components/HighlightModal';
import './style/Highlights.css';

function Highlights() {
    const [highlightedNotes, setHighlightedNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    // Load highlighted notes from localStorage
    useEffect(() => {
        const loadHighlights = () => {
            try {
                const saved = localStorage.getItem('highlightedNotes');
                const highlights = saved ? JSON.parse(saved) : [];
                setHighlightedNotes(highlights);
            } catch (error) {
                console.error('Error loading highlights:', error);
            } finally {
                setLoading(false);
            }
        };

        loadHighlights();
        // Listen for storage events to sync across tabs
        window.addEventListener('storage', loadHighlights);
        return () => window.removeEventListener('storage', loadHighlights);
    }, []);

    const removeFromHighlights = (e, id) => {
        e.stopPropagation();
        const updatedHighlights = highlightedNotes.filter(note => note.id !== id);
        localStorage.setItem('highlightedNotes', JSON.stringify(updatedHighlights));
        setHighlightedNotes(updatedHighlights);
        
        // Trigger storage event to sync across tabs
        window.dispatchEvent(new Event('storage'));
    };

    const handleCardClick = (note) => {
        setSelectedNote(note);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedNote(null);
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="loading-highlights">Loading your highlights...</div>
            </div>
        );
    }

    return (
        <div className="highlights-container">
            <Navbar />
            <h1 className="highlights-title">HIGHLIGHTS</h1>
            
            {highlightedNotes.length === 0 ? (
                <div className="no-highlights">
                    <p>No highlights yet. Click the heart icon on any note to add it here!</p>
                </div>
            ) : (
                <div className="highlights-grid">
                    {highlightedNotes.map((note) => (
                        <div 
                            key={note.id} 
                            className="highlight-card"
                            onClick={() => handleCardClick(note)}
                        >
                            {note.image_url && (
                                <div className="highlight-image">
                                    <img 
                                        src={note.image_url.startsWith('http') 
                                            ? note.image_url 
                                            : `http://localhost:5000${note.image_url}`} 
                                        alt={note.title} 
                                    />
                                </div>
                            )}
                            <div className="highlight-content">
                                <h3>{note.title}</h3>
                                <p className="highlight-date">
                                    {new Date(note.post_date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                                <p className="highlight-description">
                                    {note.description ? 
                                        (note.description.length > 100 
                                            ? `${note.description.substring(0, 100)}...` 
                                            : note.description)
                                        : 'No description'}
                                </p>
                            </div>
                            <button 
                                className="remove-highlight-btn"
                                onClick={(e) => removeFromHighlights(e, note.id)}
                                title="Remove from highlights"
                            >
                                <FontAwesomeIcon icon={solidHeart} className="heart-icon filled" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {showModal && selectedNote && (
                <HighlightModal 
                    note={selectedNote} 
                    onClose={closeModal} 
                />
            )}
        </div>
    );
}

export default Highlights;
