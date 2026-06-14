import { useCallback, useEffect, useState } from 'react';
import '../styles/coachmark.css';

const CIRCLE_PADDING = 14;
const SNACKBAR_GAP = 10;

const Coachmark = ({ targetRef, headerRef, visible, onDismiss, message, duration = 5000 }) => {
    const [spotlightStyle, setSpotlightStyle] = useState(null);
    const [ringStyle, setRingStyle] = useState(null);
    const [snackbarStyle, setSnackbarStyle] = useState(null);

    const updatePosition = useCallback(() => {
        const target = targetRef?.current;
        if (!target) return;

        const wrapperRect = target.getBoundingClientRect();
        const rippleTarget = target.querySelector('.order-button') || target;
        const rippleRect = rippleTarget.getBoundingClientRect();

        const spotlightSize = Math.max(wrapperRect.width, wrapperRect.height) + CIRCLE_PADDING * 2;
        const spotlightCenterX = wrapperRect.left + wrapperRect.width / 2;
        const spotlightCenterY = wrapperRect.top + wrapperRect.height / 2;

        const rippleCenterX = rippleRect.left + rippleRect.width / 2;
        const rippleCenterY = rippleRect.top + rippleRect.height / 2;
        const rippleSize = Math.max(44, Math.max(rippleRect.width, rippleRect.height));

        setSpotlightStyle({
            top: spotlightCenterY - spotlightSize / 2,
            left: spotlightCenterX - spotlightSize / 2,
            width: spotlightSize,
            height: spotlightSize,
        });

        setRingStyle({
            top: rippleCenterY - rippleSize / 2,
            left: rippleCenterX - rippleSize / 2,
            width: rippleSize,
            height: rippleSize,
        });

        const header = headerRef?.current;
        const headerBottom = header
            ? header.getBoundingClientRect().bottom
            : wrapperRect.bottom;

        setSnackbarStyle({
            top: headerBottom + SNACKBAR_GAP,
        });
    }, [targetRef, headerRef]);

    useEffect(() => {
        if (!visible) return undefined;

        updatePosition();

        const handleLayoutChange = () => updatePosition();
        window.addEventListener('resize', handleLayoutChange);
        window.addEventListener('scroll', handleLayoutChange, true);

        const dismissTimer = setTimeout(() => {
            onDismiss();
        }, duration);

        return () => {
            clearTimeout(dismissTimer);
            window.removeEventListener('resize', handleLayoutChange);
            window.removeEventListener('scroll', handleLayoutChange, true);
        };
    }, [visible, duration, onDismiss, updatePosition]);

    if (!visible || !spotlightStyle) return null;

    return (
        <div className="coachmark-root show" role="status" aria-live="polite">
            <div className="coachmark-spotlight" style={spotlightStyle} aria-hidden="true" />
            <div className="coachmark-ripples" style={ringStyle} aria-hidden="true">
                <span className="coachmark-ripple-core" />
                <span className="coachmark-ripple coachmark-ripple--1" />
                <span className="coachmark-ripple coachmark-ripple--2" />
                <span className="coachmark-ripple coachmark-ripple--3" />
            </div>
            <div className="coachmark-snackbar-bar show" style={snackbarStyle}>
                <span className="coachmark-snackbar-pointer" aria-hidden="true" />
                <span className="coachmark-snackbar-message">{message}</span>
            </div>
        </div>
    );
};

export default Coachmark;
