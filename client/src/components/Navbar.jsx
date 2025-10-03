import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear , faTrash } from '@fortawesome/free-solid-svg-icons';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../assets/images/logo-track.png';

function Navbar() {
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  const showDropdown = () => {
    timeoutRef.current = setTimeout(() => {
      if (dropdownRef.current) {
        dropdownRef.current.style.display = 'block';
      }
    }, 500); // 500ms delay
  };

  const navigate = useNavigate();

  const hideDropdown = () => {
    clearTimeout(timeoutRef.current);
    if (dropdownRef.current) {
      dropdownRef.current.style.display = 'none';
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    toast.success('Successfully logged out', {
      onClose: () => {
        navigate('/Login', { replace: true });
      }
    });
  };

  const handleArchive = (e) => {
    e.preventDefault();
    navigate('/Archive', { replace: true });
  };

  const styles = {
    nav: {
      background: '#708A58',
      padding: '1rem',
    },
    ul: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      listStyle: 'none',
      color: '#fff',
      margin: 0,
      padding: 0,
    },
    logo: {
      height: 40,
    },
    dropdown: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
    },
    gearIcon: {
      fontSize: '1.5rem',
      color: '#fff',
    },
    dropdownMenu: {
      display: 'none',
      position: 'absolute',
      top: '100%',
      right: 0,
      backgroundColor: '#fff',
      color: '#333',
      listStyle: 'none',
      padding: '1rem 2rem', // wider spacing
      borderRadius: '6px',
      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 100,
      minWidth: '150px',
    },
    dropdownMenuItem: {
      padding: '0.75rem 0',
    },

    dropdownMenuLink: {
      textDecoration: 'none',
      color: '#333',
      fontSize: '1rem',
    },
  };

  return (
    <nav style={styles.nav}>
      <ul style={styles.ul}>
        <li>
          <a href="/Home">
            <img src={logo} alt="Logo" style={styles.logo} />
          </a>
        </li>


        <li
          style={styles.dropdown}
          onMouseEnter={showDropdown}
          onMouseLeave={hideDropdown}
        >
          <div style={styles.gearIcon}>
            <FontAwesomeIcon icon={faGear} size="x" />
          </div>
          <ul className="dropdown-menu" ref={dropdownRef} style={styles.dropdownMenu}>
            <li style={styles.dropdownMenuItem}>
              <button
                style={{
                  ...styles.dropdownMenuLink,
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem 1rem',
                  font: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onClick={handleArchive}
              >
                <FontAwesomeIcon icon={faTrash} />
                <span>Archive</span>
              </button>
            </li>
            <li style={styles.dropdownMenuItem}>
              <button
                style={{
                  ...styles.dropdownMenuLink,
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem 1rem',
                  font: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onClick={handleLogout}
              >
                <FontAwesomeIcon icon={faRightFromBracket} />
                <span>Log Out</span>
              </button>
            </li>
            
            
          </ul>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
