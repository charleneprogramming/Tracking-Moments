import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import Navbar from "./components/Navbar";
import './style/AddNote.css';

function AddNote() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    image: null,
    imagePreview: ''
  });

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
    // Reset file input
    document.getElementById('image-upload').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // ✅ Get user from localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        toast.error("User not found. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      formDataToSend.append("user_id", user.id); // ✅ use user.id
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("post_date", formData.date || new Date().toISOString().split("T")[0]);

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const res = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Note added successfully!", {
          onClose: () => navigate("/ReadNote"),
        });
      } else {
        toast.error(data.error || "Failed to save note");
      }
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note. Please try again.");
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
          TELL YOUR STORY
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {/* Left Container */}
            <div style={{ flex: '1', minWidth: '300px', backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Title" style={{ fontSize: '1.75rem', fontWeight: 'bold', border: 'none', borderBottom: '2px solid #e0e0e0', outline: 'none', width: '100%', padding: '0.75rem 0', marginBottom: '1.5rem', transition: 'border-color 0.3s ease' }} required />
              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Tell your story..." style={{ fontSize: '1rem', lineHeight: '1.6', border: 'none', outline: 'none', width: '100%', minHeight: '300px', resize: 'none', padding: '0.5rem 0', fontFamily: 'inherit' }} required ></textarea>
            </div>
            {/* Right Container */}
            <div style={{ width: '300px', borderRadius: '12px', padding: '1.5rem', height: 'fit-content' }}> <div style={{ marginBottom: '1.5rem' }}> <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}> Select Date </label> <input type="date" name="date" value={formData.date} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '0.9rem' }} /> </div> <div> <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}> Upload Image </label> <div style={{ border: '2px dashed #e0e0e0', borderRadius: '6px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.3s', marginBottom: '1.5rem' }}> <input type="file" name="image" accept="image/*" onChange={handleInputChange} style={{ display: 'none' }} id="image-upload" /> <label htmlFor="image-upload" style={{ cursor: 'pointer', display: 'block', position: 'relative' }} > {formData.imagePreview ? (<div style={{ position: 'relative', display: 'inline-block', width: '100%' }} onMouseEnter={(e) => { e.currentTarget.querySelector('button').style.opacity = '1'; }} onMouseLeave={(e) => { e.currentTarget.querySelector('button').style.opacity = '0.9'; }} > <img src={formData.imagePreview} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #e0e0e0' }} /> <button type="button" onClick={handleRemoveImage} style={{ position: 'absolute', top: '15px', right: '15px', background: '#ff4d4f', color: 'white', border: '2px solid white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', opacity: 0.9, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', '&:hover': { background: '#ff7875', transform: 'scale(1.1)' } }} > <FontAwesomeIcon icon={faTimesCircle} /> </button> </div>) : (<div style={{ border: '2px dashed #e0e0e0', borderRadius: '6px', padding: '2rem', textAlign: 'center', transition: 'all 0.3s', marginBottom: '1rem', '&:hover': { borderColor: '#708A58', backgroundColor: 'rgba(112, 138, 88, 0.05)' } }}> <div style={{ marginBottom: '0.5rem' }}> <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#708A58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path> <polyline points="17 8 12 3 7 8"></polyline> <line x1="12" y1="3" x2="12" y2="15"></line> </svg> </div> <div style={{ color: '#666', fontSize: '0.9rem' }}> Click to upload an image </div> </div>)} </label> </div> {formData.imagePreview && (<div style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem', textAlign: 'center' }}> Click the image to change or remove it </div>)} </div> <button type="submit" disabled={isSubmitting} style={{ marginTop: '1.5rem', padding: '0.75rem 2rem', backgroundColor: isSubmitting ? '#cccccc' : '#708A58', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: '600', cursor: isSubmitting ? 'not-allowed' : 'pointer', width: '100%', transition: 'background-color 0.3s ease' }} > {isSubmitting ? 'Saving...' : 'Add to story'} </button> </div> </div> </form>
      </div>
    </div>
  );
}

export default AddNote;
