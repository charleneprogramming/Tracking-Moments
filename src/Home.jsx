import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import category1 from './assets/images/add_notes.png';
import category2 from './assets/images/auto_stories.png';
import category3 from './assets/images/bookmark_check.png';
import Navbar from './components/Navbar';
import './style/Home.css';

function Home() {
  return (
    <div>
      <Navbar />
      <div className="wrapper">
        <div className="container">
          <a href="/AddNote">
            <img src={category1} alt="Item 1" />
            <p>Tell your story</p>
          </a>
        </div>
        <div className="container">
          <a href="/ReadNote">
            <img src={category2} alt="Item 2" />
            <p>Trace your journey</p>
          </a>
        </div>
        <div className="container">
          <a href="/Highlights">
            <img src={category3} alt="Item 3" />
            <p>Highlights</p>
          </a>
        </div>
      </div>

    </div>
  );
}

export default Home;
