import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Hourglass, Lock } from 'lucide-react';
import '../styles/styles.css';
import '../styles/More.css';
import { ProjectImages, hexToCssFilter } from '../utils/menuData';
import Ads from '../components/Ads';

const SettingTileItem = ({ icon, label, onTap, onDisabledTap, trailing, isEnabled = true, comingSoon = false }) => {
    const handleClick = () => {
        if (comingSoon || !isEnabled) {
            onDisabledTap && onDisabledTap();
        } else {
            onTap();
        }
    };

    const textColor = (!comingSoon && isEnabled) ? '#333333' : 'rgba(51, 51, 51, 0.4)';
    const arrowColor = (!comingSoon && isEnabled) ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)';

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <div
                onClick={handleClick}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 8px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    WebkitTapHighlightColor: 'transparent'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {typeof icon === 'string' ? (
                            <img src={icon} alt={label} style={{ height: '100%', objectFit: 'contain' }} />
                        ) : (
                            icon
                        )}
                    </div>
                    <div style={{ width: '15px' }}></div>
                    <span style={{
                        fontSize: '16px',
                        color: textColor,
                        fontWeight: '400',
                        fontFamily: 'Afacad, sans-serif',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {label}
                    </span>
                </div>

                {trailing || (
                    <div style={{
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                    }}>
                        <ChevronRight size={24} color={arrowColor} />
                    </div>
                )}
            </div>

            {(comingSoon || !isEnabled) && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    zIndex: 5
                }}>
                    {comingSoon ? (
                        <Hourglass size={26} color="rgba(51, 51, 51, 0.75)" />
                    ) : (
                        <Lock size={26} color="rgba(51, 51, 51, 0.75)" />
                    )}
                </div>
            )}
        </div>
    );
};

const DynamicSettingCard = ({ items }) => {
    return (
        <div style={{
            width: '100%',
            padding: '2px 12px',
            backgroundColor: 'rgba(var(--primary-rgb), 0.25)',
            borderRadius: '12px',
            border: '2px solid rgba(var(--primary-rgb), 0.75)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <SettingTileItem {...item} />
                    {index !== items.length - 1 && (
                        <div style={{ height: '1px', backgroundColor: '#333333', opacity: 0.15, width: '100%' }}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

const More = ({ restaurantData }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [snackbar, setSnackbar] = React.useState({ show: false, title: '', message: '' });
    const restaurantId = searchParams.get('r');

    if (!restaurantData) return null;

    const { restoDetails } = restaurantData;

    const showMessage = (title, message) => {
        setSnackbar({ show: true, title, message });
        setTimeout(() => setSnackbar({ show: false, title: '', message: '' }), 5000);
    };

    const getStatusProps = (value, type) => {
        const upperValue = String(value).toUpperCase();

        if (!value || upperValue === 'COMING_SOON') {
            return {
                comingSoon: true,
                isEnabled: false,
                value: '',
                onDisabledTap: () => showMessage("Feature Coming Soon", "This feature is in progress and will be available soon.")
            };
        }

        if (upperValue === 'FALSE' || upperValue === 'UNAVAILABLE') {
            return {
                comingSoon: false,
                isEnabled: false,
                value: '',
                onDisabledTap: () => showMessage("Feature Unavailable", "This feature is currently disabled by the restaurant.")
            };
        }

        return { comingSoon: false, isEnabled: true, value };
    };

    const buildTelHref = (contact) => {
        const digits = String(contact || '').replace(/\D/g, '');
        if (!digits) return '';
        if (digits.length === 10) return `tel:+91${digits}`;
        if (digits.startsWith('91') && digits.length >= 12) return `tel:+${digits}`;
        return `tel:+${digits}`;
    };

    const instaProps = getStatusProps(restoDetails.instagram, 'instagram');
    const locationProps = getStatusProps(restoDetails.location, 'location');
    const reviewProps = getStatusProps(restoDetails.reviewUrl, 'review');
    const galleryProps = getStatusProps(restoDetails.gallery, 'gallery');
    const tableReserveProps = getStatusProps(restoDetails.tableReserve, 'tableReserve');

    const handleShare = async () => {
        const appRoot = new URL(import.meta.env.BASE_URL, window.location.origin).href.replace(
            /\/+$/,
            ''
        );
        const shareUrl = `${appRoot}/?r=${encodeURIComponent(restaurantId)}`;
        const shareData = {
            title: restoDetails.restoName,
            text: `Hey! Check out the menu for ${restoDetails.restoName}`,
            url: shareUrl
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                return;
            }
        } catch (err) {
            console.error('Error sharing:', err);
            if (err.name === 'AbortError') return;
        }

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(shareUrl);
                showMessage("Link Copied!", "The menu link has been copied to your clipboard. You can now paste and share it anywhere.");
            } else {
                throw new Error('Clipboard API unavailable');
            }
        } catch (err) {
            console.error('Clipboard fallback failed:', err);
            showMessage("Sharing not supported", "Please copy the link from your browser address bar to share.");
        }
    };

    const socialSection = [
        {
            icon: ProjectImages.call,
            label: 'Call Us Now',
            onTap: () => {
                const href = buildTelHref(restoDetails.contact);
                if (href) window.location.href = href;
            },
            isEnabled: !!restoDetails.contact,
            comingSoon: !restoDetails.contact
        },
        {
            icon: ProjectImages.whatsapp,
            label: 'Chat on Whatsapp',
            onTap: () => window.open(`https://wa.me/91${String(restoDetails.contact).replace(/\D/g, '')}`, '_blank'),
            isEnabled: !!restoDetails.contact,
            comingSoon: !restoDetails.contact
        },
        {
            icon: ProjectImages.instagram,
            label: 'See our Instagram',
            onTap: () => {
                const url = instaProps.value.startsWith('http')
                    ? instaProps.value
                    : `https://instagram.com/${instaProps.value}`;
                window.open(url, '_blank');
            },
            ...instaProps
        }
    ];

    const reviewSection = [
        {
            icon: ProjectImages.google,
            label: 'Give us a Google Review',
            onTap: () => {
                const url = reviewProps.value.startsWith('http')
                    ? reviewProps.value
                    : `https://search.google.com/local/writereview?placeid=${reviewProps.value}`;
                window.open(url, '_blank');
            },
            ...reviewProps
        },
        {
            icon: ProjectImages.location,
            label: 'See our Location',
            onTap: () => {
                let destination;
                if (locationProps.value.startsWith('http')) {
                    try {
                        const url = new URL(locationProps.value);
                        if (url.searchParams.has('q')) {
                            destination = url.searchParams.get('q');
                        } else if (url.searchParams.has('placeid')) {
                            destination = url.searchParams.get('placeid');
                        } else {
                            destination = locationProps.value;
                        }
                    } catch {
                        destination = locationProps.value;
                    }
                } else {
                    destination = locationProps.value;
                }
                const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
                window.open(directionsUrl, '_blank');
            },
            ...locationProps
        }
    ];

    const utilitySection = [
        {
            icon: ProjectImages.share,
            label: 'Share with Friends',
            onTap: handleShare,
            isEnabled: true
        },
        {
            icon: ProjectImages.gallery,
            label: "Restaurant's Gallery",
            onTap: () => navigate(`/gallery?r=${restaurantId}`),
            ...galleryProps
        },
        {
            icon: ProjectImages.table,
            label: 'Reserve a Table',
            onTap: () => navigate(`/reserve?r=${restaurantId}`),
            ...tableReserveProps
        },
        {
            icon: ProjectImages.threeD,
            label: 'Floor Plan Map',
            onTap: () => navigate(`/floor-plan?r=${restaurantId}`),
            ...tableReserveProps
        },
    ];

    return (
        <div className="more-page">
            <div className="secondary-appbar">
                <div className="appbar-content">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <ChevronLeft size={30} strokeWidth={2} />
                    </button>
                    <div className="appbar-title">More</div>
                </div>
                <div className="appbar-border"></div>
            </div>

            <div className="more-container">
                <Ads
                    bannerAdsUrls={restoDetails?.bannerAdsUrls}
                    showBannerAds={restoDetails?.showBannerAds}
                    bannerAdsMap={restoDetails?.bannerAdsMap}
                    screenKey="MoreAds"
                />

                <div className="more-content">
                    <DynamicSettingCard items={socialSection} />

                    <DynamicSettingCard items={reviewSection} />

                    <DynamicSettingCard items={utilitySection} />

                    <div style={{
                        marginTop: 'auto',
                        paddingBottom: '60px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <div style={{ color: '#888', fontSize: '12px' }}>
                            Powered by
                        </div>
                        <img
                            src={ProjectImages.harshtag}
                            alt="Harshtag Logo"
                            style={{ height: '35px', objectFit: 'contain', filter: hexToCssFilter('#00A9FE') }}
                        />
                    </div>
                </div>
            </div>

            {snackbar.show && (
                <div className="snackbar show">
                    <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '2px' }}>{snackbar.title}</div>
                    <div style={{ fontSize: '13px', opacity: 0.9 }}>{snackbar.message}</div>
                </div>
            )}
        </div>
    );
};

export default More;
