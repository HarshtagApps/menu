import React, { useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '../assets/loading.json';

const Loading = () => {
    const lottieRef = useRef();

    useEffect(() => {
        if (lottieRef.current) {
            lottieRef.current.setSpeed(2.0);
        }
    }, []);

    return (
        <div className="loading-overlay">
            <div style={{ width: 250, height: 250 }}>
                <Lottie
                    lottieRef={lottieRef}
                    animationData={loadingAnimation}
                    loop
                />
            </div>
        </div>
    );
};

export default Loading;
