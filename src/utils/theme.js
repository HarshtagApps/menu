const DEFAULT_THEME = '#FA057B';

export function normalizeThemeColor(raw) {
    if (raw == null || raw === '') return null;
    const value = String(raw).trim().replace(/^#/, '');
    if (!/^[0-9A-Fa-f]{6}$/.test(value)) return null;
    return `#${value.toUpperCase()}`;
}

export function resolveThemeColor(raw) {
    return normalizeThemeColor(raw) || DEFAULT_THEME;
}

export function hexToRgb(hex) {
    const value = String(hex).replace(/^#/, '');
    return {
        r: parseInt(value.slice(0, 2), 16),
        g: parseInt(value.slice(2, 4), 16),
        b: parseInt(value.slice(4, 6), 16),
    };
}

function mixWithWhite(hex, amount) {
    const { r, g, b } = hexToRgb(hex);
    const mix = (channel) => Math.round(channel + (255 - channel) * amount);
    const toHex = (n) => n.toString(16).padStart(2, '0').toUpperCase();
    return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

function mixWithBlack(hex, amount) {
    const { r, g, b } = hexToRgb(hex);
    const mix = (channel) => Math.round(channel * (1 - amount));
    const toHex = (n) => n.toString(16).padStart(2, '0').toUpperCase();
    return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

export function applyThemeColor(raw) {
    const color = resolveThemeColor(raw);
    const { r, g, b } = hexToRgb(color);
    const root = document.documentElement;

    root.style.setProperty('--primary-color', color);
    root.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
    root.style.setProperty('--primary-light', `rgba(${r}, ${g}, ${b}, 0.1)`);
    root.style.setProperty('--primary-soft', mixWithWhite(color, 0.72));
    root.style.setProperty('--primary-border', color);
    root.style.setProperty('--primary-dark', mixWithBlack(color, 0.25));
    root.style.setProperty('--primary-tint', mixWithWhite(color, 0.55));
    root.style.setProperty('--primary-tint-strong', mixWithWhite(color, 0.35));

    return color;
}

export { DEFAULT_THEME };
