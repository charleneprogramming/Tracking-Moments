import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from './components/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './style/ReadNote.css';
import './style/Archive.css';

function Archive() {
    const navigate = useNavigate();
    const [archivedNotes, setArchivedNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isToastVisible, setIsToastVisible] = useState(false);

    // Disable browser back button when toast is visible
    useEffect(() => {
        const handlePopState = (e) => {
            if (isToastVisible) {
                window.history.pushState(null, '', window.location.pathname);
                toast.info('Please close the notification first');
            }
        };

        if (isToastVisible) {
            // Push a new state to prevent back navigation
            window.history.pushState(null, '', window.location.pathname);
            window.addEventListener('popstate', handlePopState);
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isToastVisible]);

    // Fetch archived notes when component mounts
    useEffect(() => {
        const fetchArchivedNotes = async () => {
            try {
                // Get logged-in user from localStorage
                const storedUser = localStorage.getItem("user");
                if (!storedUser) {
                    console.error("⚠️ No logged-in user found in localStorage");
                    setLoading(false);
                    navigate('/login');
                    return;
                }

                const user = JSON.parse(storedUser);
                const token = localStorage.getItem('token');

                const response = await fetch(`http://localhost:5000/api/posts/user/${user.id}/archived`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch archived notes');
                }

                const data = await response.json();
                console.log('Fetched archived notes:', data);
                console.log('Response status:', response.status);
                setArchivedNotes(data);
            } catch (error) {
                console.error('Error fetching archived notes:', error);
                console.log('Error details:', {
                    message: error.message,
                    name: error.name,
                    stack: error.stack
                });
                if (error.message.includes('token') || error.message.includes('authenticate')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }
                toast.error('Failed to load archived notes', {
                    onClose: () => {
                        setIsToastVisible(false);
                    }
                });
            } finally {
                setLoading(false);
            }
        };

        fetchArchivedNotes();
    }, [navigate]);

    // Function to restore a note from archive
    const handleRestore = async (id) => {
        if (window.confirm('Are you sure you want to restore this note?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/posts/${id}/restore`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to restore note');
                }

                // Show success message and navigate back to ReadNote
                setIsToastVisible(true);
                toast.success('Note restored successfully!', {
                    onClose: () => {
                        setIsToastVisible(false);
                        // Add a small delay to ensure the toast is fully closed before navigation
                        setTimeout(() => {
                            navigate('/ReadNote');
                        }, 100);
                    }
                });

            } catch (error) {
                console.error('Error restoring note:', error);
                toast.error(error.message || 'Failed to restore note', {
                    onClose: () => {
                        setIsToastVisible(false);
                    }
                });
            }
        }
    };

    // Function to permanently delete a note
    const handlePermanentDelete = async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this note? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Authentication required. Please log in again.');
                    navigate('/login'); // ✅ better to redirect to login
                    return;
                }
    
                // Ensure ID is an integer
                const noteId = parseInt(id, 10);
    
                const response = await fetch(`http://localhost:5000/api/posts/${noteId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}` // ✅ no need for Content-Type on DELETE
                    }
                });
    
                let responseData = {};
                try {
                    responseData = await response.json();
                } catch (_) {
                    // if backend returns no JSON, keep it empty
                }
    
                if (!response.ok) {
                    throw new Error(responseData.error || `Failed to delete note permanently (status ${response.status})`);
                }
    
                // ✅ Update state correctly
                setArchivedNotes(prevNotes =>
                    prevNotes.filter(note => parseInt(note.id, 10) !== noteId)
                );
    
                toast.success('Note permanently deleted!');
            } catch (error) {
                console.error('Error deleting note:', error);
                toast.error(error.message || 'Failed to delete note');
            }
        }
    };
    


    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return <div className="loading">Loading archived notes...</div>;
    }

    return (
        <div className="archive-container">
            <Navbar />
            <div className="archive-content">
                <div className="archive-header">
                    <button
                        className="back-button"
                        onClick={() => navigate('/ReadNote')}
                        title={isToastVisible ? 'Please wait...' : 'Go back'}
                        disabled={isToastVisible}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} /> Back
                    </button>
                    <h1 className="archive-title">Archived Notes</h1>
                </div>

                {archivedNotes.length === 0 ? (
                    <div className="no-notes">
                        <p>No archived notes found.</p>
                    </div>
                ) : (
                    <div className="notes-grid">
                        {archivedNotes.map((note) => (
                            <div key={note.id} className="note-card">
                                {note.image_url && (
                                    <div className="note-image">
                                        <img
                                            src={`http://localhost:5000${note.image_url}`}
                                            alt={note.title}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                                            }}
                                        />
                                    </div>
                                )}
                                <div className="note-content">
                                    <h3 className="note-title">{note.title}</h3>
                                    <p className="note-date">{formatDate(note.post_date)}</p>
                                    <p className="note-description">
                                        {note.description.length > 150
                                            ? `${note.description.substring(0, 150)}...`
                                            : note.description}
                                    </p>
                                    <div className="note-actions">
                                        <button
                                            className="btn-restore"
                                            onClick={() => handleRestore(note.id)}
                                            title="Restore note"
                                        >
                                            Restore
                                        </button>
                                        <button
                                            className="btn-danger"
                                            onClick={() => handlePermanentDelete(note.id)}
                                            title="Delete permanently"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Archive;
