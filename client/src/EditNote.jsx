import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import Navbar from "./components/Navbar";
import './style/AddNote.css';

function EditNote() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        image: null,
        imagePreview: ''
    });

    // Fetch the note data when the component mounts
    useEffect(() => {
        const fetchNote = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/posts/${id}`);
                if (!response.ok) throw new Error('Failed to fetch note');

                const note = await response.json();
                setFormData({
                    title: note.title || '',
                    description: note.description || '',
                    date: note.post_date || '',
                    image: null,
                    imagePreview: note.image_url ? `http://localhost:5000${note.image_url}` : ''
                });
            } catch (error) {
                console.error('Error fetching note:', error);
                toast.error('Failed to load note');
                navigate('/ReadNote');
            }
        };

        fetchNote();
    }, [id, navigate]);

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'image' && files && files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    image: files[0],
                    imagePreview: reader.result
                }));
            };
            reader.readAsDataURL(files[0]);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleRemoveImage = (e) => {
        e.stopPropagation();
        setFormData(prev => ({
            ...prev,
            image: null,
            imagePreview: ''
        }));
        document.getElementById('image-upload').value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            const user = JSON.parse(localStorage.getItem("user"));

            if (!user?.id) {
                toast.error("You must be logged in to edit a note.");
                setIsSubmitting(false);
                return;
            }

            formDataToSend.append("user_id", user.id);
            formDataToSend.append("title", formData.title);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("post_date", formData.date || new Date().toISOString().split("T")[0]);

            if (formData.image) {
                formDataToSend.append("image", formData.image);
            }

            const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
                method: "PUT",
                body: formDataToSend,
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to update note');
            }

            toast.success("Note updated successfully!");
            navigate("/ReadNote");
        } catch (error) {
            console.error("Error updating note:", error);
            toast.error(error.message || "Failed to update note");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <Navbar />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
                <h1 style={{
                    textAlign: 'center',
                    color: '#708A58',
                    margin: '2rem 0',
                    fontSize: '2rem',
                    fontWeight: '600'
                }}>
                    Edit Your Memory
                </h1>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        {/* Left Container */}
                        <div style={{ flex: '1', minWidth: '300px' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Title"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        fontSize: '1.5rem',
                                        fontWeight: '600',
                                        border: 'none',
                                        borderBottom: '2px solid rgb(151, 145, 145)',
                                        marginBottom: '1rem',
                                        outline: 'none',
                                        backgroundColor: 'transparent'
                                    }}
                                    required
                                />
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Tell your story..."
                                    style={{
                                        fontSize: '1rem',
                                        lineHeight: '1.6',
                                        border: 'none',
                                        outline: 'none',
                                        width: '100%',
                                        minHeight: '300px',
                                        borderRadius: '20px',
                                        resize: 'none',
                                        padding: '0.5rem 0.5rem',
                                        fontFamily: 'inherit'
                                    }}
                                    required
                                ></textarea>
                            </div>
                        </div>

                        {/* Right Container */}
                        <div style={{
                            width: '300px',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            height: 'fit-content'
                        }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                                    Select Date
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                                    Add Image (Optional)
                                </label>
                                <div style={{
                                    border: '2px dashed #e0e0e0',
                                    borderRadius: '8px',
                                    padding: '1.5rem',
                                    textAlign: 'center',
                                    cursor: 'pointer'
                                }}>
                                    <input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleInputChange}
                                        id="image-upload"
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="image-upload" style={{ cursor: 'pointer', display: 'block' }}>
                                        {formData.imagePreview ? (
                                            <div style={{ position: 'relative', width: '100%' }}>
                                                <img
                                                    src={formData.imagePreview}
                                                    alt="Preview"
                                                    style={{
                                                        width: '100%',
                                                        height: '200px',
                                                        objectFit: 'cover',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-10px',
                                                        right: '-10px',
                                                        background: 'white',
                                                        borderRadius: '50%',
                                                        width: '24px',
                                                        height: '24px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: '1px solid #e0e0e0',
                                                        cursor: 'pointer',
                                                        color: '#ff4d4f'
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faTimesCircle} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ color: '#666', fontSize: '0.9rem' }}>
                                                Click to upload an image
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    marginTop: '1.5rem',
                                    padding: '0.75rem 2rem',
                                    backgroundColor: isSubmitting ? '#cccccc' : '#708A58',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    width: '100%',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    transition: 'background-color 0.3s'
                                }}
                            >
                                {isSubmitting ? 'Updating...' : 'Confirm Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditNote;
