import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AddNote from './AddNote';
import ReadNote from './ReadNote';
// import Landing from './Landing';
import Home from './Home';
import Highlights from './Highlights';
import Login from './Login';
import Landing from './Landing';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Highlights" element={<Highlights />} />
        <Route path="/AddNote" element={<AddNote />} />
        <Route path="/ReadNote" element={<ReadNote />} />
        <Route path="/Login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;