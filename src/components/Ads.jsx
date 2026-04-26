import { useState, useEffect } from 'react';

const Ads = ({ bannerAdsUrls, showBannerAds, bannerAdsMap, screenKey }) => {
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [isDesktop, setIsDesktop] = useState(false);
    useEffect(() => {
        const checkScreen = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);
    const getScreenAds = () => {
        if (!screenKey || !bannerAdsMap) {
            return bannerAdsUrls || [];
        }
        return bannerAdsMap[screenKey] || [];
    };
    const filteredAds = getScreenAds();
    useEffect(() => {
        if (!filteredAds || filteredAds.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentBannerIndex((prevIndex) =>
                (prevIndex + 1) % filteredAds.length
            );
        }, 7500);
        return () => clearInterval(interval);
    }, [filteredAds]);
    if (
        isDesktop ||
        !showBannerAds ||
        !filteredAds ||
        filteredAds.length === 0
    ) {
        return null;
    }

    return (
        <div>
            <style>{styles.fadeIn}</style>
            <div style={styles.advertisementText}>
                Powered by HARSHTAG Ads
            </div>
            <div style={styles.adsContainer}>
                <img
                    key={currentBannerIndex}
                    src={filteredAds[currentBannerIndex]}
                    alt="Banner Ad"
                    style={styles.bannerImage}
                    onError={(e) => {
                        e.target.style.display = 'none';
                    }}
                />
            </div>
        </div>
    );
};

export default Ads;

const styles = {
    adsContainer: {
        width: '100%',
        margin: '1px 0',
        padding: '0 5px',
        position: 'relative'
    },

    advertisementText: {
        textAlign: 'right',
        transform: 'translateX(-10px)',
        color: '#666666',
        fontSize: '12px',
        fontWeight: '500',
        fontFamily: "'Afacad', sans-serif"
    },

    bannerImage: {
        width: '100%',
        height: 'auto',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        objectFit: 'contain',
        transition: 'transform 0.2s ease',
        animation: 'fadeIn 0.5s ease-in-out'
    },

    fadeIn: `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `
};