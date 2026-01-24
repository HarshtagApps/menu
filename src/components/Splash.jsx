import React, { useEffect } from 'react';
import '../styles/splash.css';

const Splash = ({ onFinish }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onFinish();
        }, 3500);
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div className="splash-screen">
            <img
                src="assets/images/logo.png"
                alt="Logo"
                className="splash-logo"
                onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="splash-footer">
                <div className="splash-developed">Powered by</div>
                <div className="splash-brand">HARSHTAG</div>
            </div>
        </div>
    );
};

export default Splash;
