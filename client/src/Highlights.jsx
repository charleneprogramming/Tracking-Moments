import React from 'react';
import { useState, useEffect } from 'react';
// import axios from 'axios';
import Navbar from './components/Navbar';
import './style/Highlights.css';

function Highlights() {
    const [items, setItems] = useState([
        { id: 1, title: 'TITLE', description: 'Description', image: '' },
        { id: 2, title: 'Trace your journey', image: 'image.png' },
        { id: 3, title: 'Highlights', image: 'image.png' }
    ]);

    const addItem = () => {

        const newItem = {
            id: items.length + 1,
            title: `New Item ${items.length + 1}`,
            description: 'New Description',
            image: 'image.png'
        };

        setItems([...items, newItem]);
    };

    const removeItem = () => {
      
        const updatedItems = items.slice(0, items.length - 1);
        setItems(updatedItems);
      };

    return (
        <>
            <div>
                <Navbar />
                <h1 className="tell-category">HIGHLIGHTS</h1>
                <div className="wrapper">
                    {items.map((item) => (
                        <div className="container" key={item.id}>
                            <img src={item.image} alt={`Item ${item.id}`} />
                            <p>{item.title}</p>
                            {item.description && <p>{item.description}</p>}
                        </div>
                    ))}
                </div>

                {/* <button onClick={addItem}>Add Container</button>
                <button onClick={removeItem}>remove Container</button> */}

            </div>
        </>
    );
}
export default Highlights;
