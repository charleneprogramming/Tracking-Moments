import React from "react";
import logo from './assets/images/logo-track.png';
import Image from './assets/images/Image.png';
import service1 from './assets/images/service-1.png';
import service2 from './assets/images/service-2.png';
import service3 from './assets/images/service-3.png';
import './style/Landing.css';


function Landing() {
    return (
        <div className="cover">
            <div className="landing-page">
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '20px' }}>
                        <img src={logo} alt="Logo" style={{ height: '40px' }} />
                        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>Tracking Moments</h1>
                    </div>

                    <a href="/Login">
                        <button className="sign-button" type="button">LOGIN</button>
                    </a>
                </div>
            </div>

            <div className="introduction">
                <div className="intro-content">
                    <div className="intro-text">
                        <p>
                            Track your journey. Celebrate your progress.
                        </p>
                        <p className="intro-description">
                            WITH THE USE OF OUR DIGITAL JOURNAL YOU TRACK MOMENTS ANYTIME.
                        </p>

                    </div>

                    <div>
                        <img src={Image} alt="Landing Visual" className="intro-image" />
                    </div>
                </div>
            </div>

            <div className="cover">
                <div className="page-center">
                    <div className="card">
                        <img src={service1} alt="Item 1" className="card-image" />
                        <p className="card-text">WRITE A MOMENT</p>
                    </div>
                    <div className="card">
                        <img src={service2} alt="Item 2" className="card-image image-medium" />
                        <p className="card-text">READ IT LATER</p>
                    </div>
                    <div className="card">
                        <img src={service3} alt="Item 3" className="card-image image-small" />
                        <p className="card-text">A GENTLE NUDGE, EVERYDAY</p>
                    </div>
                </div>
            </div>
            <div className="hero-section">
                <a href="/Login">
                    <button className="sign-button2" type="button">WRITE YOUR FIRST ENTRY</button>
                </a>
            </div>
            <p className="footer">Copywrite © trackingmoments.com. All Rights Reserved | Developers: Charlene Barrientos & Weah Jacinto</p>

        </div>

    );
}
export default Landing;