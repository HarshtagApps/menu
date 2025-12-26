function createPrimaryAppBar(title, actions = []) {
  const appBar = document.createElement('div');
  appBar.className = 'primary-appbar';

  appBar.innerHTML = `
    <div class="appbar-content">
      <div class="appbar-title">${title}</div>
      <div class="appbar-actions">${actions.join('')}</div>
    </div>
    <div class="appbar-border"></div>
  `;

  return appBar;
}

function createSecondaryAppBar(title, actions = []) {
  const appBar = document.createElement('div');
  appBar.className = 'secondary-appbar';

  appBar.innerHTML = `
    <div class="appbar-content">
      <button class="back-button" onclick="history.back()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <div class="appbar-title">${title}</div>
      <div class="appbar-actions">${actions.join('')}</div>
    </div>
    <div class="appbar-border"></div>
  `;

  return appBar;
}

const appBarStyles = `
  .primary-appbar,
  .secondary-appbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: #FA057B;
    height: 40px;
    z-index: 1000;
  }

  .appbar-content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    padding: 0 12px;
    position: relative;
  }

  .back-button {
    position: absolute;
    left: 8px;
    background: none;
    border: none;
    color: #FFFFFF;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    touch-action: manipulation;
  }

  .back-button:active {
    opacity: 0.7;
  }

  .appbar-title {
    color: #FFFFFF;
    font-size: 16px;
    font-weight: 500;
    text-align: center;
    flex: 1;
  }

  .appbar-actions {
    position: absolute;
    right: 8px;
    display: flex;
    gap: 8px;
  }

  .appbar-border {
    height: 1px;
    background-color: #FFFFFF;
  }

  body.has-appbar {
    padding-top: 41px;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = appBarStyles;
document.head.appendChild(styleSheet);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createPrimaryAppBar, createSecondaryAppBar };
}