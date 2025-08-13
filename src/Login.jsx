import React from 'react';
import './style/Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import logo from './assets/images/logo-track.png';


function Login() {
  // const validate = (event) => {
  //   event.preventDefault();

  //   const email = document.getElementById('name').value;
  //   const password = document.getElementById('pass').value;

  //   if (!email || !password) {
  //     alert('Please fill in both fields.');
  //     return false;
  //   }


  // };

  return (
    <div className='cover'>
      <div className="title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '12px', paddingLeft: '15px' }}>
          <img src={logo} alt="Logo" style={{ height: '40px' }} />
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>Tracking Moments</h1>
        </div>
      </div>

      <div className="border">
        <div className="border-title">
          <div className="login">
            <h2 style={{ color: "black" }}>LOGIN</h2>
          </div>

          {/* <form onSubmit={validate}> */}
          <div className="input-info">
            <FontAwesomeIcon icon={faEnvelope} style={{ color: "black" }} size="2x" />
            <input id="name" type="text" placeholder="Enter email address" />
          </div>

          <div className="input-info">
            <FontAwesomeIcon icon={faLock} style={{ color: "black" }} size="2x" />
            <input id="pass" type="password" placeholder="Enter password" />
          </div>

          <div className="submit">
            <a href="/Home">
              <button type="">LOGIN</button><br />
            </a>
            <a href="">Create Account?</a>
          </div>
          {/* </form> */}
        </div>
      </div>

    </div>

  );
}

export default Login;
