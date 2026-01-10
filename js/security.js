export function initSecurity() {
    const blockedKeys = [
        'F12', 'F1', 'F2', 'F3', 'F5', 'F7', 'F8', 'F9', 'F10'
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

    // Detect iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    function handleKeyDown(e) {
        if (blockedKeys.includes(e.key)) {
            e.preventDefault();
            e.returnValue = false;
            return false;
        }

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

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        return false;
    });

    // Only run dimension checks on non-iOS devices
    if (!isIOS) {
        setTimeout(() => {
            const devtools = /./;
            devtools.toString = function () {
                if (performance.now() > 1000) {
                    document.body.innerHTML = 'Developer Tools is not allowed';
                    document.body.style.display = 'block';
                }
                return '';
            };

            if (window.outerHeight - window.innerHeight > 100 || window.outerWidth - window.innerWidth > 100) {
                if (performance.now() > 1000) {
                    document.body.innerHTML = 'Developer Tools is not allowed';
                    document.body.style.display = 'block';
                }
            }

            setInterval(() => {
                if (window.outerHeight - window.innerHeight > 100 || window.outerWidth - window.innerWidth > 100) {
                    document.body.innerHTML = 'Developer Tools is not allowed';
                    document.body.style.display = 'block';
                }
            }, 1000);
        }, 1000);
    }
}
