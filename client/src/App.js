import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddNote from './AddNote';
import ReadNote from './ReadNote';
import EditNote from './EditNote';
import Landing from './Landing';
import Home from './Home';
import Highlights from './Highlights';
import Login from './Login';
import Sign from './Sign';


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/Highlights" element={<Highlights />} />
          <Route path="/AddNote" element={<AddNote />} />
          <Route path="/ReadNote" element={<ReadNote />} />
          <Route path="/EditNote/:id" element={<EditNote />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Sign" element={<Sign />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;