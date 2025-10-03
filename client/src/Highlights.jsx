import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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

    // Load favorited notes from the server
    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch('http://localhost:5000/api/favorites', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch favorites');
                }

                const favorites = await response.json();
                setHighlightedNotes(favorites);
            } catch (error) {
                console.error('Error loading favorites:', error);
                toast.error(error.message || 'Failed to load favorites');
            } finally {
                setLoading(false);
            }
        };

        loadFavorites();
    }, [navigate]);

    const removeFromHighlights = async (e, id) => {
        e.stopPropagation();
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please log in to manage favorites');
                navigate('/login');
                return;
            }

            const response = await fetch(`http://localhost:5000/api/favorites/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to remove from favorites');
            }

            setHighlightedNotes(prev => prev.filter(note => note.id !== id));
            toast.success('Removed from favorites');
        } catch (error) {
            console.error('Error removing favorite:', error);
            toast.error(error.message || 'Failed to remove from favorites');
        }
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
