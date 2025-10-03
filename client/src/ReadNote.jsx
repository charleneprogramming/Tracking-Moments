import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from './components/Navbar';
import './style/ReadNote.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faSearch, faCalendarAlt, faTimes, faHeart as solidHeart, faHeart as regularHeart } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function ReadNote() {
    const navigate = useNavigate();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [highlights, setHighlights] = useState(() => {
        const saved = localStorage.getItem('highlightedNotes');
        return saved ? JSON.parse(saved) : [];
    });
    const location = useLocation();

    // Fetch notes and favorites when component mounts and when navigating
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Get logged-in user from localStorage
                const storedUser = localStorage.getItem("user");
                const token = localStorage.getItem("token");

                if (!storedUser || !token) {
                    console.error("⚠️ No logged-in user found in localStorage");
                    setLoading(false);
                    return;
                }

                const user = JSON.parse(storedUser);

                // Fetch user's notes
                const notesResponse = await fetch(`http://localhost:5000/api/posts/user/${user.id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!notesResponse.ok) {
                    throw new Error('Failed to fetch notes');
                }

                const notesData = await notesResponse.json();
                setNotes(notesData);

                // Fetch user's favorites
                const favoritesResponse = await fetch('http://localhost:5000/api/favorites', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (favoritesResponse.ok) {
                    const favoritesData = await favoritesResponse.json();
                    setHighlights(favoritesData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error(error.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [location.key]); // Add location.key as dependency to trigger on navigation

    // Toggle favorite status of a note
    const toggleHighlight = async (e, id) => {
        e.stopPropagation();
        const noteToFavorite = notes.find(note => note.id === id);
        if (!noteToFavorite) return;

        // Get current user
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (!user || !user.id || !token) {
            toast.error('Please log in to add to favorites');
            return;
        }

        const isFavorited = highlights.some(note => note.id === id);

        try {
            if (isFavorited) {
                // Remove from favorites
                const response = await fetch(`http://localhost:5000/api/favorites/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) throw new Error('Failed to remove from favorites');

                setHighlights(prev => prev.filter(note => note.id !== id));
                toast.info('Removed from favorites');
            } else {
                // Add to favorites
                const response = await fetch(`http://localhost:5000/api/favorites/${id}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) throw new Error('Failed to add to favorites');

                setHighlights(prev => [...prev, { ...noteToFavorite }]);
                toast.success('Added to favorites!');
            }
        } catch (error) {
            console.error('Error updating favorites:', error);
            toast.error(error.message || 'Failed to update favorites');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to move this note to archive? You can restore it later from the archive page.')) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Authentication required. Please log in again.');
                    navigate('/login');
                    return;
                }

                const noteId = parseInt(id, 10);

                // Use the correct endpoint for archiving
                const response = await fetch(`http://localhost:5000/api/posts/${noteId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ is_archived: true })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Failed to move note to archive');
                }

                // Remove the archived note from UI
                setNotes(prevNotes => prevNotes.filter(note => parseInt(note.id, 10) !== noteId));
                toast.success('Note moved to archive successfully!');
            } catch (error) {
                console.error('Error archiving note:', error);
                if (error.message.includes('token') || error.message.includes('authenticate')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }
                toast.error(error.message || 'Failed to move note to archive. Please try again.');
            }
        }
    };


    const handleEdit = (id) => {
        navigate(`/EditNote/${id}`);
    };

    // ✅ Filter notes based on search term and selected date
    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.description.toLowerCase().includes(searchTerm.toLowerCase());

        if (selectedDate) {
            const noteDate = new Date(note.post_date).setHours(0, 0, 0, 0);
            const filterDate = new Date(selectedDate).setHours(0, 0, 0, 0);
            return matchesSearch && noteDate === filterDate;
        }

        return matchesSearch;
    });

    // State for the modal
    const [selectedNote, setSelectedNote] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Open modal with the selected note
    const openModal = (note) => {
        setSelectedNote(note);
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    };

    // Handle image load to determine orientation
    const handleImageLoad = (e) => {
        const img = e.target;
        if (img.naturalWidth > img.naturalHeight) {
            img.parentElement.classList.add('landscape');
            img.parentElement.classList.remove('portrait');
        } else {
            img.parentElement.classList.add('portrait');
            img.parentElement.classList.remove('landscape');
        }
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        document.body.style.overflow = 'unset'; // Re-enable scrolling
    };

    // Close modal when clicking outside content
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    // Close modal on Escape key press
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // ✅ Shorten description for preview
    const truncateText = (text, maxLength = 150) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedDate(null);
    };

    return (
        <div>
            <Navbar />
            <div className="read-note-container">
                <h1>Your Journey</h1>

                {/* Search and Filter Section */}
                <div className={`search-filter-container ${notes.length === 0 ? 'disabled' : ''}`}>
                    <div className="search-box">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className={`search-icon ${notes.length === 0 ? 'disabled' : ''}`}
                        />
                        <input
                            type="text"
                            placeholder={notes.length === 0 ? "Add a note to enable search" : "Search notes..."}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className={`search-input ${notes.length === 0 ? 'disabled' : ''}`}
                            disabled={notes.length === 0}
                        />
                    </div>

                    <div className="date-picker-container">
                        <FontAwesomeIcon
                            icon={faCalendarAlt}
                            className={`calendar-icon ${notes.length === 0 ? 'disabled' : ''}`}
                        />
                        <DatePicker
                            selected={selectedDate}
                            onChange={handleDateChange}
                            placeholderText={notes.length === 0 ? "No notes to filter" : "Filter by date"}
                            className={`date-picker ${notes.length === 0 ? 'disabled' : ''}`}
                            dateFormat="yyyy-MM-dd"
                            isClearable
                            disabled={notes.length === 0}
                        />
                    </div>

                    {(searchTerm || selectedDate) && (
                        <button onClick={clearFilters} className="clear-filters-btn">
                            Clear Filters
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="loading">Loading your memories...</div>
                ) : notes.length === 0 ? (
                    <div className="no-notes">
                        <p>No memories yet. Capture your first moment to get started!</p>
                        <button
                            onClick={() => navigate('/AddNote')}
                            className="add-note-btn"
                            disabled={loading}
                        >
                            + Add Your First Memory
                        </button>
                    </div>
                ) : (
                    <div className="notes-grid">
                        {filteredNotes.length === 0 ? (
                            <div key="no-results" className="no-results">
                                <p>No notes found matching your search criteria.</p>
                                {(searchTerm || selectedDate) && (
                                    <button onClick={clearFilters} className="clear-filters-btn">
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            filteredNotes.map((note) => {
                                const firstSentence = note.description ?
                                    note.description.split('.')[0] + (note.description.includes('.') ? '.' : '') :
                                    'No description';

                                const hasImage = !!note.image_url;
                                return (
                                    <div
                                        key={note.id}
                                        className={`note-card ${hasImage ? 'has-image' : ''}`}
                                        onClick={() => openModal(note)}
                                    >
                                        {hasImage && (
                                            <div className="note-image-container">
                                                <img
                                                    src={note.image_url.startsWith('http') ?
                                                        note.image_url :
                                                        `http://localhost:5000${note.image_url}`}
                                                    alt={note.title}
                                                />
                                            </div>
                                        )}
                                        <div className="note-content">
                                            <h3>{note.title}</h3>
                                            <p className="note-date">
                                                {new Date(note.post_date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                            <p className="note-description">
                                                {truncateText(note.description)}
                                            </p>
                                        </div>
                                        <div className="note-actions">
                                            <button
                                                className={`action-btn ${highlights.some(h => h.id === note.id) ? 'highlighted' : ''}`}
                                                onClick={(e) => toggleHighlight(e, note.id)}
                                                title={highlights.some(h => h.id === note.id) ? 'Remove from Highlights' : 'Add to Highlights'}
                                            >
                                                <FontAwesomeIcon
                                                    icon={highlights.some(h => h.id === note.id) ? solidHeart : regularHeart}
                                                    className={highlights.some(h => h.id === note.id) ? 'highlight-icon active' : 'highlight-icon'}
                                                />
                                            </button>
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(note.id);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(note.id);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* View Note Modal */}
                {isModalOpen && selectedNote && (
                    <div className="view-modal-overlay" onClick={handleBackdropClick}>
                        <div className="view-modal-content">
                            <button className="view-modal-close" onClick={closeModal}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                            {selectedNote.image_url && (
                                <div className="view-modal-image">
                                    <img
                                        src={selectedNote.image_url.startsWith('http') ?
                                            selectedNote.image_url :
                                            `http://localhost:5000${selectedNote.image_url}`}
                                        alt={selectedNote.title}
                                        onLoad={handleImageLoad}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                        }}
                                        loading="lazy"
                                    />
                                </div>
                            )}
                            <div className="view-modal-body">
                                <div className="view-modal-header">
                                    <h2>{selectedNote.title || 'Untitled Note'}</h2>
                                    <div className="view-modal-date">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
                                        <span>
                                            {new Date(selectedNote.post_date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                weekday: 'long'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <div className="view-modal-description">
                                    {selectedNote.description || 'No description provided.'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReadNote;
