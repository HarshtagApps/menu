import React from 'react';
import Lottie from 'lottie-react';
import { hexToCssFilter } from '../utils/menuData';
import { ERROR_CODES, getErrorCopy } from '../utils/errorCodes';
import siteUnderConst from '../assets/siteUnderConst.json';

function TextStatusView({ title, message, hint, code }) {
  return (
    <>
      <div
        className="error-title"
        style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px' }}
      >
        {title}
      </div>
      {message ? (
        <div className="error-subtitle" style={{ color: '#666' }}>
          {message}
        </div>
      ) : null}
      {hint ? (
        <div style={{ color: '#666', marginTop: '5px' }}>{hint}</div>
      ) : null}
      {code ? (
        <div
          style={{
            color: '#999',
            marginTop: '5px',
            fontSize: '0.85rem',
            letterSpacing: '0.04em',
          }}
        >
          Code: {code}
        </div>
      ) : null}
    </>
  );
}

function LottieStatusView({ animationData, message }) {
  return (
    <>
      <div style={{ width: 'min(320px, 86vw)', height: 'min(320px, 86vw)' }}>
        <Lottie animationData={animationData} loop />
      </div>
      {message ? (
        <div
          style={{
            color: '#666',
            fontSize: '18px',
            lineHeight: 1.45,
            whiteSpace: 'pre-line',
          }}
        >
          {message}
        </div>
      ) : null}
    </>
  );
}

const STATUS_VIEWS = {
  [ERROR_CODES.ACCESS_FALSE]: {
    kind: 'text',
    ...getErrorCopy(ERROR_CODES.ACCESS_FALSE),
  },
  [ERROR_CODES.ACCESS_UNDERCONST]: {
    kind: 'lottie',
    animationData: siteUnderConst,
    ...getErrorCopy(ERROR_CODES.ACCESS_UNDERCONST),
  },
  [ERROR_CODES.NOT_FOUND]: {
    kind: 'text',
    ...getErrorCopy(ERROR_CODES.NOT_FOUND),
  },
  [ERROR_CODES.NO_RESTAURANT]: {
    kind: 'text',
    ...getErrorCopy(ERROR_CODES.NO_RESTAURANT),
  },
};

export default function AccessStatusScreen({ code }) {
  const view = STATUS_VIEWS[code] || STATUS_VIEWS[ERROR_CODES.NOT_FOUND];
  const copy = getErrorCopy(code);

  return (
    <div
      className="error-state"
      style={{
        textAlign: 'center',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        position: 'relative',
        backgroundColor: '#FFFAEB',
      }}
    >
      {view.kind === 'lottie' ? (
        <LottieStatusView
          animationData={view.animationData}
          message={view.message || copy.message}
        />
      ) : (
        <TextStatusView
          title={view.title || copy.title}
          message={view.message || copy.message}
          hint={view.hint ?? copy.hint}
          code={code}
        />
      )}
      <div className="splash-footer">
        <div className="splash-developed">Powered by</div>
        <img
          src="assets/images/harshtag.png"
          alt="Harshtag"
          className="error-powered-logo"
          style={{ filter: hexToCssFilter('#333333') }}
        />
      </div>
    </div>
  );
}
