import React from "react";
import { useState } from "react";
import Navbar from "./components/Navbar";
import './style/AddNote.css';

function AddNote() {
    const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault(); // prevent page reload
    setIsSubmitting(true);

    // Simulate delay (e.g. 2 seconds)
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Form submitted!');
      // You can also navigate or reset form here
    }, 2000);
  };
    return (
        <div>
            <Navbar />
            <h1 className="tell-category">TELL YOUR STORY</h1>
            <form className="form-container" onSubmit={handleSubmit}>
                <div className="form-wrapper">
                    {/* Left Container */}
                    <div className="form-container-left">
                        <input
                            type="text"
                            placeholder="TITLE"
                            className="title-input"
                        />
                        <div className="underline"></div>
                        <textarea
                            placeholder="Description"
                            className="detail-input"
                            rows="20"
                        />
                    </div>

                    {/* Right Container */}
                    <div className="form-container">
                        <label className="input-label">Select Date</label>
                        <input type="date" className="calendar-input" />

                        <label className="input-label">Upload Image</label>
                        <input type="file" className="file-input" />

                        <button className="submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'SUBMIT'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
export default AddNote;