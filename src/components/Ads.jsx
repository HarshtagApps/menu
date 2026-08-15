import { useState, useEffect } from 'react';

const FADE_MS = 200;

const Ads = ({ bannerAdsUrls, showBannerAds, bannerAdsMap, screenKey }) => {
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [displayIndex, setDisplayIndex] = useState(0);
    const [visible, setVisible] = useState(true);
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
        filteredAds.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }, [filteredAds]);

    useEffect(() => {
        if (!filteredAds || filteredAds.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentBannerIndex((prevIndex) =>
                (prevIndex + 1) % filteredAds.length
            );
        }, 7500);
        return () => clearInterval(interval);
    }, [filteredAds]);

    useEffect(() => {
        if (currentBannerIndex === displayIndex) return;
        setVisible(false);
        const t = setTimeout(() => {
            setDisplayIndex(currentBannerIndex);
            setVisible(true);
        }, FADE_MS);
        return () => clearTimeout(t);
    }, [currentBannerIndex, displayIndex]);

    if (
        isDesktop ||
        !showBannerAds ||
        !filteredAds ||
        filteredAds.length === 0
    ) {
        return null;
    }

    const safeIndex = Math.min(displayIndex, filteredAds.length - 1);

    return (
        <div>
            <div style={styles.advertisementText}>
                Powered by HARSHTAG Ads
            </div>
            <div style={styles.adsContainer}>
                <img
                    src={filteredAds[safeIndex]}
                    alt="Banner Ad"
                    style={{
                        ...styles.bannerImage,
                        opacity: visible ? 1 : 0,
                    }}
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
        position: 'relative',
        aspectRatio: '41 / 7',
        overflow: 'hidden',
    },

    advertisementText: {
        textAlign: 'right',
        transform: 'translateX(-10px)',
        color: '#666666',
        fontSize: '12px',
        fontWeight: '500',
        fontFamily: "'Afacad', sans-serif",
        marginTop: '2px',
        lineHeight: 1.2
    },

    bannerImage: {
        width: '100%',
        height: 'auto',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        objectFit: 'contain',
        transition: `opacity ${FADE_MS}ms ease-in-out`,
        display: 'block',
    },
};
