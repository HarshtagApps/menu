import { useEffect, useState } from 'react';
import '../styles/aurora-border.css';

const SWATCHES = [0, 1, 2, 3];
const SPIN_CYCLES = Math.round(6 / 1.15);
const COLOR_CYCLE_SECONDS = 6;

const AuroraBorder = ({
  children,
  active = true,
  radius = 8,
  fill = '#ffffff',
  thickness = 1,
  borderWidth,
  speed = 1,
  loop = false,
  className = '',
  style,
  display = 'block',
  id,
}) => {
  const radiusValue = typeof radius === 'number' ? `${radius}px` : radius;
  const ringWidth = borderWidth ?? thickness;
  const safeSpeed = speed > 0 ? speed : 1;
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!active || loop) {
      setSettled(false);
      return;
    }
    setSettled(false);
    const timer = window.setTimeout(
      () => setSettled(true),
      (COLOR_CYCLE_SECONDS / safeSpeed) * 1000
    );
    return () => window.clearTimeout(timer);
  }, [active, loop, safeSpeed]);

  const showRing = active && !settled;
  const vars = {
    '--aurora-radius': radiusValue,
    '--aurora-fill': fill,
    '--aurora-thickness': `${ringWidth}px`,
    '--aurora-display': display,
    '--aurora-spin-duration': `${1.15 / safeSpeed}s`,
    '--aurora-crossfade-duration': `${COLOR_CYCLE_SECONDS / safeSpeed}s`,
    '--aurora-iteration': loop ? 'infinite' : '1',
    '--aurora-spin-iteration': loop ? 'infinite' : String(SPIN_CYCLES),
    '--aurora-fill-mode': loop ? 'none' : 'forwards',
    ...style,
  };

  return (
    <div
      id={id}
      className={`aurora-border${showRing ? ' is-active' : ''}${loop ? ' aurora-loop' : ''}${className ? ` ${className}` : ''}`}
      style={vars}
    >
      {showRing && (
        <div className="aurora-border__layers" aria-hidden="true">
          <div className="aurora-border__shell">
            <div className="aurora-border__blur">
              <div className="aurora-border__spin">
                {SWATCHES.map((i) => (
                  <div key={`b-${i}`} className="aurora-border__swatch" />
                ))}
              </div>
            </div>
            <div className="aurora-border__soft">
              <div className="aurora-border__spin">
                {SWATCHES.map((i) => (
                  <div key={`s-${i}`} className="aurora-border__swatch" />
                ))}
              </div>
            </div>
            <div className="aurora-border__fill" />
          </div>
        </div>
      )}
      <div className="aurora-border__content">{children}</div>
    </div>
  );
};

export default AuroraBorder;
