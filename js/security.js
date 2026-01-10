// Developer Tools Protection
export function initSecurity() {
    // Block keyboard shortcuts
    const blockedKeys = [
        'F12',
        'F1',
        'F2',
        'F3',
        'F5',
        'F7',
        'F8',
        'F9',
        'F10'
    ];

    const blockedCombinations = [
        { ctrl: true, shift: true, key: 'I', code: 'KeyI' },
        { ctrl: true, shift: true, key: 'J', code: 'KeyJ' },
        { ctrl: true, shift: true, key: 'C', code: 'KeyC' },
        { ctrl: true, key: 'U', code: 'KeyU' },
        { ctrl: true, key: 'S', code: 'KeyS' },
        { ctrl: true, key: 'P', code: 'KeyP' },
        { meta: true, alt: true, key: 'I', code: 'KeyI' },
        { meta: true, alt: true, key: 'J', code: 'KeyJ' },
        { meta: true, alt: true, key: 'C', code: 'KeyC' }
    ];

    function handleKeyDown(e) {
        // Block function keys
        if (blockedKeys.includes(e.key)) {
            e.preventDefault();
            e.returnValue = false;
            return false;
        }

        // Check for blocked key combinations
        const isBlocked = blockedCombinations.some(combo => {
            const keyMatch = e.key === combo.key || e.code === combo.code;
            const ctrlMatch = combo.ctrl ? e.ctrlKey : !e.ctrlKey;
            const shiftMatch = combo.shift ? e.shiftKey : !e.shiftKey;
            const altMatch = combo.alt ? e.altKey : !e.altKey;
            const metaMatch = combo.meta ? e.metaKey : !e.metaKey;
            
            return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch;
        });

        if (isBlocked) {
            e.preventDefault();
            e.returnValue = false;
            return false;
        }
    }

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    
    // Disable right-click context menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // Only enable devtools detection after a short delay
    // This prevents the initial page load from being blocked
    setTimeout(() => {
        // Detect if dev tools is open
        const devtools = /./;
        devtools.toString = function() {
            // Only show the message if dev tools are opened after page load
            if (performance.now() > 1000) { // 1 second after page load
                document.body.innerHTML = 'Developer Tools is not allowed';
                document.body.style.display = 'block';
            }
            return '';
        };
        
        // Check if dev tools are already open
        if (window.outerHeight - window.innerHeight > 100 || window.outerWidth - window.innerWidth > 100) {
            // Don't block immediately on page load
            if (performance.now() > 1000) {
                document.body.innerHTML = 'Developer Tools is not allowed';
                document.body.style.display = 'block';
            }
        }

        // Check periodically for dev tools
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > 100 || window.outerWidth - window.innerWidth > 100) {
                document.body.innerHTML = 'Developer Tools is not allowed';
                document.body.style.display = 'block';
            }
        }, 1000);
    }, 1000); // Wait 1 second before enabling devtools detection

    // Prevent F12, Ctrl+Shift+I, etc. from opening dev tools
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'J') ||
            (e.ctrlKey && e.shiftKey && e.key === 'C') ||
            (e.ctrlKey && e.key === 'U') ||
            (e.metaKey && e.altKey && e.key === 'I') ||
            (e.metaKey && e.altKey && e.key === 'J') ||
            (e.metaKey && e.altKey && e.key === 'C')) {
            e.preventDefault();
            e.returnValue = false;
            return false;
        }
    });
}
