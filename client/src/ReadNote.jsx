import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from './components/Navbar';
import './style/ReadNote.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faSearch, faCalendarAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function ReadNote() {
    const navigate = useNavigate();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const location = useLocation();

    // Fetch notes when component mounts and when navigating from AddNote
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                // Get logged-in user from localStorage
                const storedUser = localStorage.getItem("user");
                if (!storedUser) {
                    console.error("⚠️ No logged-in user found in localStorage");
                    setLoading(false);
                    return;
                }

                const user = JSON.parse(storedUser);
                const response = await fetch(`http://localhost:5000/api/posts/user/${user.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch notes');
                }

                const data = await response.json();
                setNotes(data);
            } catch (error) {
                console.error('Error fetching notes:', error);
                toast.error('Failed to load notes');
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, [location.key]); // Add location.key as dependency to trigger on navigation

    // ✅ Delete note
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
            try {
                // Get the token from localStorage
                const token = localStorage.getItem('token');
                console.log('Token from localStorage:', token);
                
                if (!token) {
                    console.error('No token found in localStorage');
                    toast.error('Authentication required. Please log in again.');
                    navigate('/login');
                    return;
                }

                // Make sure ID is a number
                const noteId = parseInt(id, 10);
                console.log('Deleting note with ID:', noteId);

                const response = await fetch(`http://localhost:5000/api/posts/${noteId}`, {
                    method: 'DELETE',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    },
                    credentials: 'include',
                    mode: 'cors'
                });

                const responseData = await response.json().catch(() => ({}));
                console.log('Delete response:', response.status, responseData); // Debug log

                if (!response.ok) {
                    throw new Error(responseData.error || 'Failed to delete note');
                }

                // Update UI by removing the deleted note
                setNotes(prevNotes => prevNotes.filter(note => parseInt(note.id, 10) !== noteId));
                toast.success('Note deleted successfully!');
            } catch (error) {
                console.error('Error deleting note:', error);
                if (error.message.includes('token') || error.message.includes('authenticate')) {
                    // If token is invalid, clear it and redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }
                toast.error(error.message || 'Failed to delete note. Please try again.');
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
                <div className="search-filter-container">
                    <div className="search-box">
                        <FontAwesomeIcon icon={faSearch} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                    </div>

                    <div className="date-picker-container">
                        <FontAwesomeIcon icon={faCalendarAlt} className="calendar-icon" />
                        <DatePicker
                            selected={selectedDate}
                            onChange={handleDateChange}
                            placeholderText="Filter by date"
                            className="date-picker"
                            dateFormat="yyyy-MM-dd"
                            isClearable
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
                    <div className="modal-overlay" onClick={handleBackdropClick}>
                        <div className="modal-content">
                            <button className="modal-close" onClick={closeModal}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                            <div className="modal-header">
                                <h2>{selectedNote.title}</h2>
                                <p className="note-date">
                                    {new Date(selectedNote.post_date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                            <div className="modal-body">
                                <p className="note-description">
                                    {selectedNote.description}
                                </p>
                                {selectedNote.image_url && (
                                    <div className="modal-image-container">
                                        <img 
                                            src={selectedNote.image_url.startsWith('http') ? 
                                                selectedNote.image_url : 
                                                `http://localhost:5000${selectedNote.image_url}`} 
                                            alt={selectedNote.title}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReadNote;
