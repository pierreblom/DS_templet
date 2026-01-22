(function () {
    const DEBUG_STORAGE_KEY = 'beha_debug_enabled';
    let isDebugEnabled = localStorage.getItem(DEBUG_STORAGE_KEY) === 'true';

    // Create Debug UI
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.cssText = `
        position: fixed;
        bottom: 0;
        right: 0;
        width: 400px;
        height: 300px;
        background: rgba(0, 0, 0, 0.9);
        color: #00ff00;
        font-family: monospace;
        font-size: 12px;
        z-index: 99999;
        display: ${isDebugEnabled ? 'flex' : 'none'};
        flex-direction: column;
        border-top-left-radius: 8px;
        box-shadow: -2px -2px 10px rgba(0,0,0,0.5);
        overflow: hidden;
    `;

    const debugHeader = document.createElement('div');
    debugHeader.style.cssText = `
        padding: 8px;
        background: #333;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
    `;
    debugHeader.innerHTML = `
        <strong>DEBUG CONSOLE</strong>
        <div>
            <button id="clear-logs" style="background:none; border:1px solid #00ff00; color:#00ff00; cursor:pointer; font-size:10px; padding:2px 5px;">Clear</button>
            <button id="close-debug" style="background:none; border:1px solid #00ff00; color:#00ff00; cursor:pointer; font-size:10px; padding:2px 5px; margin-left:5px;">X</button>
        </div>
    `;

    const logContainer = document.createElement('div');
    logContainer.id = 'debug-logs';
    logContainer.style.cssText = `
        flex: 1;
        overflow-y: auto;
        padding: 10px;
    `;

    debugPanel.appendChild(debugHeader);
    debugPanel.appendChild(logContainer);
    document.body.appendChild(debugPanel);

    function addLogToUI(level, message, context = '') {
        const entry = document.createElement('div');
        entry.style.marginBottom = '5px';
        entry.style.borderBottom = '1px solid #222';
        entry.style.paddingBottom = '3px';

        const color = level === 'ERROR' ? '#ff4444' : (level === 'WARN' ? '#ffbb33' : '#00ff00');

        entry.innerHTML = `
            <span style="color: #888">[${new Date().toLocaleTimeString()}]</span>
            <span style="color: ${color}; font-weight: bold;">${level}:</span>
            <span>${message}</span>
            <div style="color: #aaa; font-size: 10px; padding-left: 10px;">${context}</div>
        `;

        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    function sendToServer(level, message, context = '') {
        const msg = encodeURIComponent(`${message} | ${context}`);
        fetch(`/log?level=${level}&msg=${msg}`).catch(() => { });
    }

    // Intercept Console
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;

    console.error = function (...args) {
        const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
        addLogToUI('ERROR', msg);
        sendToServer('ERROR', msg);
        originalError.apply(console, args);
    };

    console.warn = function (...args) {
        const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
        addLogToUI('WARN', msg);
        sendToServer('WARN', msg);
        originalWarn.apply(console, args);
    };

    // Global Error Handlers
    window.onerror = function (message, source, lineno, colno, error) {
        const context = `${source}:${lineno}:${colno}`;
        addLogToUI('ERROR', message, context);
        sendToServer('ERROR', message, context);
        return false;
    };

    window.onunhandledrejection = function (event) {
        const message = `Unhandled Rejection: ${event.reason}`;
        addLogToUI('ERROR', message);
        sendToServer('ERROR', message);
    };

    // UI Controls
    document.getElementById('clear-logs').onclick = () => {
        logContainer.innerHTML = '';
        fetch('/api/logs/clear', { method: 'POST' }).catch(() => { });
    };

    document.getElementById('close-debug').onclick = () => {
        debugPanel.style.display = 'none';
        isDebugEnabled = false;
        localStorage.setItem(DEBUG_STORAGE_KEY, 'false');
    };

    // Secret Key to toggle debug (Ctrl + Shift + D)
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            isDebugEnabled = !isDebugEnabled;
            debugPanel.style.display = isDebugEnabled ? 'flex' : 'none';
            localStorage.setItem(DEBUG_STORAGE_KEY, isDebugEnabled ? 'true' : 'false');
            if (isDebugEnabled) {
                console.log('Debug mode enabled');
                // Fetch existing logs from server
                fetch('/api/logs')
                    .then(r => r.json())
                    .then(logs => {
                        logContainer.innerHTML = '';
                        logs.forEach(l => addLogToUI(l.level, l.message, l.timestamp));
                    });
            }
        }
    });

    console.log('Debug system initialized. Press Ctrl+Shift+D to toggle.');
})();
