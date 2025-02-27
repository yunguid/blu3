# Wizard Arena Game Code Files

## File: WizardArena/client/admin.css

```
/* Admin Panel CSS */
:root {
    --admin-bg: #0F172A;       /* Dark navy */
    --admin-text: #F0E6D2;     /* Parchment */
    --admin-primary: #1E3A8A;  /* Deep blue */
    --admin-accent: #DAA520;   /* Golden accent */
    --error: #EF4444;          /* Error red */
    --warning: #F59E0B;        /* Warning amber */
    --success: #10B981;        /* Success emerald */
}

body {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #0E1128, #0F172A);
    color: var(--admin-text);
    margin: 0;
    padding: 0;
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 20px auto;
    padding: 20px;
    background: rgba(15, 23, 42, 0.9);
    border-radius: 10px;
    box-shadow: 0 0 15px rgba(30, 58, 138, 0.5);
}

h1, h2 {
    color: var(--admin-text);
    text-shadow: 0 0 5px rgba(218, 165, 32, 0.5);
}

.tabs {
    display: flex;
    margin-bottom: 20px;
    border-bottom: 2px solid var(--admin-accent);
}

.tab {
    padding: 10px 20px;
    cursor: pointer;
    background: linear-gradient(135deg, var(--admin-primary), #3B82F6);
    border: 1px solid var(--admin-accent);
    border-bottom: none;
    margin-right: 5px;
    border-radius: 5px 5px 0 0;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.tab:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 10px rgba(218, 165, 32, 0.4);
}

.tab.active {
    background: var(--admin-bg);
    border-bottom: 2px solid var(--admin-bg);
    transform: translateY(0);
}

.tab-content {
    display: none;
    background: rgba(255, 255, 255, 0.05);
    padding: 20px;
    border: 1px solid var(--admin-accent);
    border-top: none;
    border-radius: 0 0 10px 10px;
}

.tab-content.active {
    display: block;
}

.log-entry {
    padding: 10px;
    margin-bottom: 10px;
    border-left: 4px solid var(--admin-accent);
    background: rgba(255, 255, 255, 0.1);
    font-family: monospace;
    white-space: pre-wrap;
    word-break: break-all;
    border-radius: 5px;
    transition: transform 0.2s ease;
}

.log-entry:hover {
    transform: scale(1.02);
}

.log-entry.error {
    border-left-color: var(--error);
}

.log-entry.warning {
    border-left-color: var(--warning);
}

.controls {
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.controls button {
    padding: 8px 15px;
    background: linear-gradient(135deg, var(--admin-primary), #0F172A);
    color: var(--admin-text);
    border: 1px solid var(--admin-accent);
    border-radius: 5px;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.controls button:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(218, 165, 32, 0.4);
}

.controls select {
    padding: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid var(--admin-accent);
    color: var(--admin-text);
    border-radius: 5px;
}

.search {
    flex-grow: 1;
    padding: 8px;
    border: 1px solid var(--admin-accent);
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.1);
    color: var(--admin-text);
    transition: box-shadow 0.3s ease;
}

.search:focus {
    outline: none;
    box-shadow: 0 0 10px rgba(218, 165, 32, 0.5);
}

.stack-trace {
    max-height: 200px;
    overflow-y: auto;
    padding: 10px;
    background: rgba(15, 23, 42, 0.7);
    margin-top: 10px;
    display: none;
    border-radius: 5px;
}

.timestamp {
    color: #F1C232;
    font-size: 0.8em;
}

.expand-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--admin-accent);
    margin-left: 10px;
    transition: color 0.2s ease;
}

.expand-btn:hover {
    color: #F1C232;
}

.meta {
    font-size: 0.85em;
    margin-top: 10px;
    color: #3B82F6;
}

.loading {
    text-align: center;
    padding: 20px;
    color: var(--admin-accent);
    font-style: italic;
}
```

## File: WizardArena/client/admin.html

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WizardArena Admin - Client Logs</title>
    <link rel="stylesheet" href="css/admin.css">
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2 {
            color: #333;
        }
        .tabs {
            display: flex;
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
        }
        .tab {
            padding: 10px 20px;
            cursor: pointer;
            background-color: #eee;
            border: 1px solid #ddd;
            border-bottom: none;
            margin-right: 5px;
            border-radius: 5px 5px 0 0;
        }
        .tab.active {
            background-color: #fff;
            border-bottom: 1px solid #fff;
            margin-bottom: -1px;
        }
        .tab-content {
            display: none;
            background: #fff;
            padding: 20px;
            border: 1px solid #ddd;
            border-top: none;
        }
        .tab-content.active {
            display: block;
        }
        .log-entry {
            padding: 10px;
            margin-bottom: 10px;
            border-left: 4px solid #ddd;
            background-color: #f9f9f9;
            font-family: monospace;
            white-space: pre-wrap;
            word-break: break-all;
        }
        .log-entry.error {
            border-left-color: #ff3860;
        }
        .log-entry.warning {
            border-left-color: #ffdd57;
        }
        .controls {
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        .controls button {
            margin-right: 10px;
            padding: 8px 15px;
            background-color: #4a4a4a;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        .controls select {
            padding: 8px;
            margin-right: 10px;
        }
        .search {
            flex-grow: 1;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 3px;
        }
        .stack-trace {
            max-height: 200px;
            overflow-y: auto;
            padding: 10px;
            background-color: #f1f1f1;
            margin-top: 10px;
            display: none;
        }
        .timestamp {
            color: #7a7a7a;
            font-size: 0.8em;
        }
        .expand-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: #3273dc;
            margin-left: 10px;
        }
        .meta {
            font-size: 0.85em;
            margin-top: 10px;
            color: #666;
        }
        .loading {
            text-align: center;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>WizardArena Admin - Client Logs</h1>
        
        <div class="tabs">
            <div class="tab active" data-tab="errors">Client Errors</div>
            <div class="tab" data-tab="console">Console Logs</div>
        </div>
        
        <div class="tab-content active" id="errors-content">
            <div class="controls">
                <button id="refresh-errors">Refresh</button>
                <select id="error-limit">
                    <option value="20">Last 20</option>
                    <option value="50">Last 50</option>
                    <option value="100" selected>Last 100</option>
                    <option value="200">Last 200</option>
                </select>
                <input type="text" id="error-search" class="search" placeholder="Search errors...">
            </div>
            <div id="error-logs">
                <div class="loading">Loading errors...</div>
            </div>
        </div>
        
        <div class="tab-content" id="console-content">
            <div class="controls">
                <button id="refresh-console">Refresh</button>
                <select id="console-limit">
                    <option value="20">Last 20</option>
                    <option value="50">Last 50</option>
                    <option value="100" selected>Last 100</option>
                    <option value="200">Last 200</option>
                </select>
                <input type="text" id="console-search" class="search" placeholder="Search console logs...">
            </div>
            <div id="console-logs">
                <div class="loading">Loading console logs...</div>
            </div>
        </div>
    </div>
    
    <script>
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(`${tab.dataset.tab}-content`).classList.add('active');
            });
        });
        
        // Helper function to format error logs
        function formatError(errorData) {
            const data = errorData.data;
            const clientInfo = errorData.clientInfo;
            
            let html = `<div class="log-entry error">`;
            html += `<strong>${data.type}</strong>: ${data.message}`;
            html += `<button class="expand-btn">Show details</button>`;
            html += `<div class="stack-trace">`;
            
            if (data.filename && data.lineno) {
                html += `<div>Location: ${data.filename}:${data.lineno}:${data.colno || 0}</div>`;
            }
            
            if (data.stack) {
                html += `<pre>${data.stack}</pre>`;
            }
            
            html += `</div>`;
            html += `<div class="meta">`;
            html += `<div class="timestamp">Timestamp: ${data.timestamp}</div>`;
            html += `<div>Client: ${clientInfo.name || 'Unknown'} (${clientInfo.id}) - ${clientInfo.ip}</div>`;
            html += `<div>User Agent: ${clientInfo.userAgent}</div>`;
            html += `</div>`;
            html += `</div>`;
            
            return html;
        }
        
        // Helper function to format console logs
        function formatConsoleLog(logData) {
            const data = logData.data;
            const clientInfo = logData.clientInfo;
            const isWarning = data.type === 'console_warn';
            
            let html = `<div class="log-entry ${isWarning ? 'warning' : ''}">`;
            html += `<strong>${data.type}</strong>: ${data.message}`;
            html += `<div class="meta">`;
            html += `<div class="timestamp">Timestamp: ${data.timestamp}</div>`;
            html += `<div>Client: ${clientInfo.name || 'Unknown'} (${clientInfo.id}) - ${clientInfo.ip}</div>`;
            html += `</div>`;
            html += `</div>`;
            
            return html;
        }
        
        // Fetch and display error logs
        function fetchErrorLogs() {
            const limit = document.getElementById('error-limit').value;
            const errorLogsDiv = document.getElementById('error-logs');
            errorLogsDiv.innerHTML = '<div class="loading">Loading errors...</div>';
            
            fetch(`/api/logs/errors?limit=${limit}`)
                .then(response => response.json())
                .then(data => {
                    if (data.length === 0) {
                        errorLogsDiv.innerHTML = '<p>No error logs found.</p>';
                        return;
                    }
                    
                    errorLogsDiv.innerHTML = '';
                    data.reverse().forEach(errorData => {
                        errorLogsDiv.innerHTML += formatError(errorData);
                    });
                    
                    // Add event listeners to expand buttons
                    document.querySelectorAll('#error-logs .expand-btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const stackTrace = btn.nextElementSibling;
                            stackTrace.style.display = stackTrace.style.display === 'block' ? 'none' : 'block';
                            btn.textContent = stackTrace.style.display === 'block' ? 'Hide details' : 'Show details';
                        });
                    });
                })
                .catch(error => {
                    errorLogsDiv.innerHTML = `<p>Error fetching logs: ${error.message}</p>`;
                });
        }
        
        // Fetch and display console logs
        function fetchConsoleLogs() {
            const limit = document.getElementById('console-limit').value;
            const consoleLogsDiv = document.getElementById('console-logs');
            consoleLogsDiv.innerHTML = '<div class="loading">Loading console logs...</div>';
            
            fetch(`/api/logs/console?limit=${limit}`)
                .then(response => response.json())
                .then(data => {
                    if (data.length === 0) {
                        consoleLogsDiv.innerHTML = '<p>No console logs found.</p>';
                        return;
                    }
                    
                    consoleLogsDiv.innerHTML = '';
                    data.reverse().forEach(logData => {
                        consoleLogsDiv.innerHTML += formatConsoleLog(logData);
                    });
                })
                .catch(error => {
                    consoleLogsDiv.innerHTML = `<p>Error fetching logs: ${error.message}</p>`;
                });
        }
        
        // Search functionality
        function setupSearch(inputId, logsContainerId, fetchFunction) {
            const input = document.getElementById(inputId);
            input.addEventListener('input', () => {
                const searchTerm = input.value.toLowerCase();
                const logEntries = document.querySelectorAll(`#${logsContainerId} .log-entry`);
                
                logEntries.forEach(entry => {
                    const text = entry.textContent.toLowerCase();
                    entry.style.display = text.includes(searchTerm) ? 'block' : 'none';
                });
            });
        }
        
        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            // Fetch initial data
            fetchErrorLogs();
            fetchConsoleLogs();
            
            // Setup refresh buttons
            document.getElementById('refresh-errors').addEventListener('click', fetchErrorLogs);
            document.getElementById('refresh-console').addEventListener('click', fetchConsoleLogs);
            
            // Setup limit dropdowns
            document.getElementById('error-limit').addEventListener('change', fetchErrorLogs);
            document.getElementById('console-limit').addEventListener('change', fetchConsoleLogs);
            
            // Setup search
            setupSearch('error-search', 'error-logs', fetchErrorLogs);
            setupSearch('console-search', 'console-logs', fetchConsoleLogs);
            
            // Auto-refresh every 30 seconds
            setInterval(() => {
                if (document.getElementById('errors-content').classList.contains('active')) {
                    fetchErrorLogs();
                } else {
                    fetchConsoleLogs();
                }
            }, 30000);
        });
    </script>
</body>
</html> 
```

## File: WizardArena/client/css/style.css

```
/* Modern Game CSS */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Roboto:wght@300;400;700&display=swap');

:root {
    --primary: #1E3A8A;       /* Deep blue */
    --primary-light: #3B82F6; /* Bright blue */
    --secondary: #0F172A;     /* Dark navy */
    --background: #0E1128;    /* Midnight blue */
    --text: #F0E6D2;          /* Parchment */
    --accent: #DAA520;        /* Golden accent */
    --accent-light: #F1C232;  /* Light gold */
    --success: #10B981;       /* Emerald */
    --danger: #EF4444;        /* Bright red */
    --warning: #F59E0B;       /* Amber */
    --info: #3B82F6;          /* Azure blue */
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Roboto', sans-serif;
    background: 
        radial-gradient(circle at 10% 20%, rgba(255,255,255,0.1) 0%, transparent 1%),
        radial-gradient(circle at 90% 80%, rgba(255,255,255,0.1) 0%, transparent 1%),
        radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 1%),
        radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 1%),
        radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 1%),
        linear-gradient(135deg, #0E1128 0%, #1A1F44 50%, #2A1E5C 100%);
    background-size: 100% 100%;
    color: var(--text);
    overflow: hidden;
    height: 100vh;
    user-select: none;
    position: relative;
    animation: twinkle 4s infinite;
}

@keyframes twinkle {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
}

/* Game Container */
#gameContainer {
    display: flex;
    width: 100vw;
    height: 100vh;
    transition: opacity 0.5s ease;
}

#gameContainer.hidden {
    display: none;
}

/* Canvas */
#gameCanvas {
    flex: 1;
    background-color: transparent;
    cursor: crosshair;
    border: 2px solid rgba(255, 215, 0, 0.5);
    box-shadow: 0 0 20px rgba(138, 43, 226, 0.3);
}

/* Sidebar */
.sidebar {
    width: 350px;
    height: 100vh;
    background: linear-gradient(135deg, var(--secondary), var(--primary));
    box-shadow: inset 0 0 20px rgba(0,0,0,0.5), 0 0 10px rgba(30,58,138,0.5);
    border-left: 1px solid rgba(218, 165, 32, 0.3);
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease;
}

/* Leaderboard */
.leaderboard {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.leaderboard h2, .chat h2 {
    text-align: center;
    margin-bottom: 20px;
    font-family: 'Press Start 2P', cursive;
    font-size: 1.2rem;
    color: var(--accent);
    text-shadow: 0 0 10px rgba(218, 165, 32, 0.6);
    position: relative;
}

.leaderboard h2::after, .chat h2::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -5px;
    transform: translateX(-50%);
    width: 50px;
    height: 2px;
    background: linear-gradient(to right, transparent, var(--accent), transparent);
}

.leaderboardItem {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    margin-bottom: 10px;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    transition: all 0.3s ease;
}

.leaderboardItem:hover {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(157, 78, 221, 0.5);
}

.leaderboardName {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.leaderboardScore {
    font-weight: bold;
    color: var(--warning);
    margin-left: 10px;
}

/* Chat */
.chat {
    height: 40%;
    padding: 20px;
    display: flex;
    flex-direction: column;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 10px;
    padding: 10px;
    background-color: rgba(15, 23, 42, 0.7);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border: 1px solid rgba(218, 165, 32, 0.3);
}

.message {
    padding: 8px 12px;
    border-radius: 8px;
    background: rgba(30, 58, 138, 0.4);
    max-width: 80%;
    align-self: flex-start;
    transition: transform 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.message:hover {
    transform: translateX(5px);
}

.own-message {
    align-self: flex-end;
    background: rgba(15, 23, 42, 0.7);
    border-left: 3px solid var(--accent);
}

.message .sender {
    font-weight: bold;
    margin-right: 5px;
    color: var(--accent-light);
}

.system-message {
    color: var(--accent-light);
    font-style: italic;
    text-align: center;
    background: transparent;
    box-shadow: none;
}

#chatInput {
    padding: 10px;
    background-color: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(218, 165, 32, 0.3);
    border-radius: 8px;
    color: white;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

#chatInput:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 10px rgba(218, 165, 32, 0.4);
}

/* Name Entry Modal */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    z-index: 100;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.5s ease;
    overflow: hidden;
}

.modal.active {
    display: flex;
    animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.modal-content {
    background: linear-gradient(135deg, var(--secondary) 0%, rgba(30, 58, 138, 0.9) 100%);
    border: 2px solid var(--accent);
    border-radius: 15px;
    padding: 35px;
    width: 450px;
    max-width: 90%;
    box-shadow: 
        0 0 30px rgba(30, 58, 138, 0.6),
        0 0 60px rgba(0, 0, 0, 0.4),
        inset 0 0 15px rgba(218, 165, 32, 0.3);
    text-align: center;
    animation: modalSlideIn 0.5s forwards, modalScaleIn 0.5s forwards;
    position: relative;
    overflow: hidden;
}

/* Decorative stars */
.modal-content::before,
.modal-content::after {
    content: '';
    position: absolute;
    background-repeat: no-repeat;
    background-size: contain;
    opacity: 0.2;
    z-index: -1;
}

.modal-content::before {
    width: 100px;
    height: 100px;
    background-image: radial-gradient(circle, var(--accent-light) 20%, transparent 60%);
    top: -20px;
    right: -20px;
    filter: blur(2px);
    animation: twinkleStars 3s infinite alternate;
}

.modal-content::after {
    width: 80px;
    height: 80px;
    background-image: radial-gradient(circle, var(--accent-light) 20%, transparent 60%);
    bottom: -15px;
    left: -15px;
    filter: blur(1px);
    animation: twinkleStars 4s infinite alternate-reverse;
}

@keyframes twinkleStars {
    0%, 100% { opacity: 0.1; }
    50% { opacity: 0.3; }
}

@keyframes modalSlideIn {
    from { transform: translateY(-50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes modalScaleIn {
    from { transform: scale(0.8); }
    to { transform: scale(1); }
}

.modal h2 {
    margin-bottom: 20px;
    color: var(--accent);
    font-family: 'Press Start 2P', cursive;
    text-shadow: 0 0 15px rgba(218, 165, 32, 0.7);
    position: relative;
    display: inline-block;
}

.modal h2::before, 
.modal h2::after {
    content: '✦';
    color: var(--accent-light);
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1rem;
    opacity: 0.8;
}

.modal h2::before {
    left: -25px;
}

.modal h2::after {
    right: -25px;
}

.modal p {
    margin-bottom: 25px;
    line-height: 1.6;
    font-size: 1.1em;
    color: rgba(240, 230, 210, 0.9);
}

.modal input {
    width: 100%;
    padding: 14px 16px;
    margin-bottom: 25px;
    border-radius: 10px;
    border: 1px solid rgba(218, 165, 32, 0.4);
    background-color: rgba(15, 23, 42, 0.7);
    color: white;
    font-size: 16px;
    transition: all 0.3s ease;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
}

.modal input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 
        0 0 0 3px rgba(218, 165, 32, 0.2),
        inset 0 0 10px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
}

.modal button {
    padding: 14px 28px;
    background: linear-gradient(135deg, var(--accent) 0%, #B8860B 100%);
    color: var(--secondary);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.5px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.modal button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: all 0.6s ease;
}

.modal button:hover {
    transform: translateY(-3px);
    box-shadow: 
        0 7px 15px rgba(0, 0, 0, 0.3),
        0 0 15px rgba(218, 165, 32, 0.4);
    filter: brightness(1.1);
    color: #000;
}

.modal button:active {
    transform: translateY(0);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}

.modal button:hover::before {
    left: 100%;
}

/* Progress Bar */
.progress-container {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 300px;
    height: 20px;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 10px;
    overflow: hidden;
    border: 2px solid rgba(255, 215, 0, 0.5);
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #7b2cbf, #9d4edd, #7b2cbf);
    background-size: 200% 100%;
    animation: shimmer 2s infinite linear;
    transition: width 0.3s ease;
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: 0 0; }
}

/* Animations */
.special-orb {
    animation: pulse 1s infinite, rotate 4s linear infinite;
}

/* Notifications */
.system-notification {
    position: fixed;
    top: 50px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
    color: #333;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2), inset 0 0 10px rgba(255,255,255,0.5);
    font-family: 'Press Start 2P', cursive;
    font-size: 16px;
    text-align: center;
    z-index: 1000;
    border: 2px solid #8A2BE2;
    opacity: 1;
    transition: opacity 1s ease;
}

.system-notification::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 10px;
    background: radial-gradient(circle, #8A2BE2, transparent);
    z-index: -1;
}

.system-notification.fade-out {
    opacity: 0;
}

/* Victory and Death Modals */
.victory-modal .modal-content {
    background-color: rgba(26, 26, 46, 0.95);
    border: 2px solid gold;
    text-shadow: 0 0 10px gold;
}

.victory-modal h2 {
    color: gold;
    font-size: 32px;
}

.death-modal .modal-content {
    background-color: rgba(46, 26, 26, 0.95);
    border: 2px solid #e74c3c;
}

.death-modal h2 {
    color: #e74c3c;
}

.modal.fade-out {
    opacity: 0;
}

/* Fireworks */
.fireworks {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
}

.spark {
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    animation: spark 1s forwards;
    opacity: 0;
}

@keyframes spark {
    0% { transform: scale(0); opacity: 1; }
    30% { opacity: 1; transform: scale(10) rotate(20deg); }
    70% { opacity: 0.8; transform: scale(15) rotate(35deg); }
    100% { transform: scale(25) rotate(45deg); opacity: 0; }
}

/* Mini-Map */
.mini-map {
    position: absolute;
    bottom: 20px;
    right: 370px;
    width: 150px;
    height: 150px;
    border: 3px solid #FFD700;
    border-radius: 50%;
    box-shadow: 0 0 15px rgba(255,215,0,0.5), inset 0 0 10px rgba(255,215,0,0.3);
    background: radial-gradient(circle, #1A1F44, #0E1128);
    overflow: hidden;
}

/* Responsive Styles */
@media (max-width: 768px) {
    .sidebar {
        width: 280px;
    }
    
    .modal-content {
        width: 320px;
        padding: 20px;
    }
    
    .progress-container {
        width: 250px;
    }
    
    .mini-map {
        right: 300px;
    }
}
```

## File: WizardArena/client/index.html

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wizard Arena</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="icon" href="assets/favicon.ico" type="image/x-icon">
</head>
<body>
    <!-- Name Entry Modal -->
    <div id="nameModal" class="modal">
        <div class="modal-content">
            <h2>Enter The Wizard Arena</h2>
            <p>Enter your wizard name to join the magical battle arena!</p>
            <input type="text" id="nameInput" placeholder="Your Wizard Name" maxlength="15">
            <button id="submitName">Join Battle</button>
        </div>
    </div>
    
    <!-- Game Container -->
    <div id="gameContainer" class="hidden">
        <!-- Game Canvas -->
        <canvas id="gameCanvas"></canvas>
        
        <!-- Sidebar with Leaderboard and Chat -->
        <div class="sidebar">
            <!-- Leaderboard -->
            <div class="leaderboard">
                <h2>Top Wizards</h2>
                <ul id="leaderboardList"></ul>
            </div>
            
            <!-- Chat -->
            <div class="chat">
                <h2>Wizard Chat</h2>
                <div id="chatMessages" class="chat-messages"></div>
                <input type="text" id="chatInput" placeholder="Cast a message...">
            </div>
        </div>
    </div>
    
    <!-- Audio Elements ( placeholders to avoid missing file errors ) -->
    <audio id="collectSound"></audio>
    <audio id="specialCollectSound"></audio>
    <audio id="victorySound"></audio>
    <audio id="absorptionSound"></audio>
    
    <!-- Scripts -->
    <script src="js/renderer.js" type="module"></script>
    <script src="js/main.js" type="module"></script>
</body>
</html>
```

## File: WizardArena/client/js/chat.js

```
// Handles chat functionality
import { sendToServer } from './network.js';

let playerName = '';
const maxMessages = 50;
let messages = [];

export function initChat() {
    // Add chat event listeners
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    
    sendButton.addEventListener('click', sendChatMessage);
    
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendChatMessage();
        }
    });
    
    // Add system message
    addMessage({
        type: 'system',
        content: 'Welcome to Wizard Arena! Type to chat with other players.'
    });
}

export function setPlayerName(name) {
    playerName = name;
    
    // Send initial name to server
    sendToServer({ type: 'setName', name: playerName });
    
    // Add system message acknowledging player's name
    addMessage({
        type: 'system',
        content: `You've joined as ${playerName}!`
    });
}

function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (message) {
        sendToServer({
            type: 'chatMessage',
            name: playerName,
            message: message
        });
        chatInput.value = '';
    }
}

export function receiveMessage(data) {
    addMessage(data);
}

function addMessage(data) {
    messages.push(data);
    
    // Trim messages if we have too many
    if (messages.length > maxMessages) {
        messages = messages.slice(messages.length - maxMessages);
    }
    
    // Update the display
    renderMessages();
}

function renderMessages() {
    const chatMessages = document.getElementById('chatMessages');
    
    // Create HTML for messages
    let messagesHTML = '';
    
    messages.forEach(msg => {
        if (msg.type === 'system') {
            messagesHTML += `<div class="chatMessage system"><em>${msg.content}</em></div>`;
        } else {
            messagesHTML += `<div class="chatMessage"><span class="chatName" style="color: ${msg.color || '#FFFFFF'}">${msg.name}:</span> ${msg.message}</div>`;
        }
    });
    
    chatMessages.innerHTML = messagesHTML;
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to get all current messages (for new players)
export function getChatHistory() {
    return messages;
} 
```

## File: WizardArena/client/js/errorTracker.js

```
/**
 * Error Tracking Module
 * Captures client-side errors and logs them to the server
 */

class ErrorTracker {
    constructor(socket) {
        this.socket = socket;
        this.init();
        this.consoleOverrides = {};
    }

    init() {
        this.captureGlobalErrors();
        this.interceptConsole();
    }

    captureGlobalErrors() {
        window.addEventListener('error', (event) => {
            const { message, filename, lineno, colno, error } = event;
            this.sendError({
                type: 'uncaught_exception',
                message,
                filename,
                lineno,
                colno,
                stack: error?.stack || 'No stack trace',
                timestamp: new Date().toISOString()
            });
            
            // Don't prevent default error handling
            return false;
        });

        window.addEventListener('unhandledrejection', (event) => {
            const error = event.reason;
            this.sendError({
                type: 'unhandled_promise_rejection',
                message: error?.message || String(error),
                stack: error?.stack || 'No stack trace',
                timestamp: new Date().toISOString()
            });
        });
    }

    interceptConsole() {
        // Store original methods
        const originalMethods = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info
        };
        
        // Override console methods to capture logs
        Object.keys(originalMethods).forEach(method => {
            this.consoleOverrides[method] = originalMethods[method];
            
            console[method] = (...args) => {
                // Call the original method
                originalMethods[method](...args);
                
                // Only send error and warn logs to server
                if (method === 'error' || method === 'warn') {
                    this.sendLog({
                        type: `console_${method}`,
                        message: args.map(arg => this.stringifyArg(arg)).join(' '),
                        timestamp: new Date().toISOString()
                    });
                }
            };
        });
    }

    stringifyArg(arg) {
        try {
            if (arg instanceof Error) {
                return `${arg.message}\n${arg.stack}`;
            } else if (typeof arg === 'object') {
                return JSON.stringify(arg);
            }
            return String(arg);
        } catch (e) {
            return '[Unstringifiable Object]';
        }
    }

    sendError(errorData) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'client_error',
                data: errorData
            }));
        } else {
            // Queue errors when socket isn't available
            this.queueErrorForSending(errorData);
        }
    }

    sendLog(logData) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'client_log',
                data: logData
            }));
        }
    }

    queueErrorForSending(errorData) {
        // Store error in localStorage for retry later
        try {
            const errorQueue = JSON.parse(localStorage.getItem('errorQueue') || '[]');
            errorQueue.push(errorData);
            // Limit queue size
            if (errorQueue.length > 50) errorQueue.shift();
            localStorage.setItem('errorQueue', JSON.stringify(errorQueue));
        } catch (e) {
            // Silent fail if localStorage isn't available
        }
    }

    retryQueuedErrors() {
        try {
            const errorQueue = JSON.parse(localStorage.getItem('errorQueue') || '[]');
            if (errorQueue.length > 0 && this.socket && this.socket.readyState === WebSocket.OPEN) {
                errorQueue.forEach(error => this.sendError(error));
                localStorage.setItem('errorQueue', '[]');
            }
        } catch (e) {
            // Silent fail
        }
    }

    // Call this when socket connection established
    setSocket(newSocket) {
        this.socket = newSocket;
        this.retryQueuedErrors();
    }
}

// Export as a singleton
const errorTracker = {
    instance: null,
    
    init(socket) {
        this.instance = new ErrorTracker(socket);
        return this.instance;
    },
    
    getInstance() {
        return this.instance;
    }
};

export default errorTracker; 
```

## File: WizardArena/client/js/game.js

```
// Manages client-side game state and game loop
import { render } from './renderer.js';
import { handleInput } from './player.js';
import { checkPlayerAlive } from './playerState.js';

let gameState = {
    players: {},
    orbs: []
};

function startGame() {
    const gameLoop = () => {
        handleInput();
        render(gameState);
        requestAnimationFrame(gameLoop);
    };
    gameLoop();
}

export function updateGameState(newState) {
    gameState = newState;
    // Check if our player is still alive
    checkPlayerAlive(newState.players);
}

export { startGame }; 
```

## File: WizardArena/client/js/main.js

```
// Client entry point: initializes the game and connects to the server
import { initNameModal } from './nameModal.js';
import { initRenderer, render, createOrbCollectEffect, createVictoryEffect, updateLeaderboard } from './renderer.js';

// Main game initialization and loop
let socket = null;
let playerId = null;
let playerName = '';
let gameData = {
    players: {},
    orbs: []
};

// Game elements
const gameContainer = document.getElementById('gameContainer');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const nameModal = document.getElementById('nameModal');
const nameInput = document.getElementById('nameInput');
const submitNameBtn = document.getElementById('submitName');
const leaderboardEl = document.getElementById('leaderboardList');

// Audio elements
let bgMusic;
let collectSound;
let specialCollectSound;
let victorySound;
let absorptionSound;

// Initialize game
function init() {
    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize audio
    initAudio();
    
    // Show name modal first
    nameModal.classList.add('active');
    gameContainer.classList.add('hidden');
    
    // Handle name submission
    nameInput.focus();
    submitNameBtn.addEventListener('click', submitName);
    nameInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') submitName();
    });
    
    // Chat input handling
    chatInput.addEventListener('keypress', e => {
        if (e.key === 'Enter' && chatInput.value.trim()) {
            sendChatMessage(chatInput.value);
            chatInput.value = '';
        }
    });
    
    // Initialize renderer with canvas
    initRenderer();
    
    // Add game UI styles
    addGameStyles();
    
    // Connect to server
    connectToServer();
}

function resizeCanvas() {
    canvas.width = window.innerWidth - 350; // Leave space for sidebar
    canvas.height = window.innerHeight;
}

function initAudio() {
    // Create audio elements with empty URLs to avoid missing file errors
    bgMusic = new Audio();
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    
    collectSound = new Audio();
    collectSound.volume = 0.2;
    
    specialCollectSound = new Audio();
    specialCollectSound.volume = 0.3;
    
    victorySound = new Audio();
    victorySound.volume = 0.4;
    
    absorptionSound = new Audio();
    absorptionSound.volume = 0.3;
    
    console.log("Audio initialized (placeholders)");
}

function addGameStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .system-notification {
            position: fixed;
            top: 50px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: #fff;
            padding: 15px 25px;
            border-radius: 8px;
            font-family: 'Press Start 2P', cursive;
            font-size: 16px;
            text-align: center;
            z-index: 1000;
            opacity: 1;
            transition: opacity 1s ease;
        }
        
        .system-notification.fade-out {
            opacity: 0;
        }
        
        .victory-modal .modal-content {
            background-color: rgba(26, 26, 46, 0.95);
            border: 2px solid gold;
            text-shadow: 0 0 10px gold;
        }
        
        .victory-modal h2 {
            color: gold;
            font-size: 32px;
        }
        
        .fireworks {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
        }
        
        .spark {
            position: absolute;
            width: 5px;
            height: 5px;
            border-radius: 50%;
            animation: spark 1s forwards;
            opacity: 0;
        }
        
        @keyframes spark {
            0% {
                transform: scale(0);
                opacity: 1;
            }
            50% {
                opacity: 1;
            }
            100% {
                transform: scale(20) rotate(45deg);
                opacity: 0;
            }
        }
        
        .death-modal .modal-content {
            background-color: rgba(46, 26, 26, 0.95);
            border: 2px solid #e74c3c;
        }
        
        .death-modal h2 {
            color: #e74c3c;
        }
        
        .modal.fade-out {
            opacity: 0;
        }
        
        .mini-map {
            position: absolute;
            bottom: 20px;
            right: 370px;
            width: 150px;
            height: 150px;
            background-color: rgba(0, 0, 0, 0.5);
            border: 2px solid rgba(255, 255, 255, 0.5);
            border-radius: 5px;
        }
    `;
    document.head.appendChild(style);
}

function connectToServer() {
    // Connect to WebSocket server
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const port = window.location.port || '3000';
    socket = new WebSocket(`${protocol}//${host}:${port}`);
    
    // Setup socket event handlers
    socket.onopen = () => {
        console.log('Connected to server');
    };
    
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
            case 'init':
                playerId = data.id;
                break;
                
            case 'update':
                gameData = data.state;
                break;
                
            case 'chat':
                addChatMessage(data);
                break;
                
            case 'chatHistory':
                // Load chat history
                data.messages.forEach(msg => addChatMessage(msg));
                break;
                
            case 'collectOrb':
                // Create a visual effect when collecting an orb
                if (data.position) {
                    createOrbCollectEffect(data.position.x, data.position.y, data.isSpecial);
                    
                    // Play sound effect (with try/catch for safety)
                    try {
                        if (data.isSpecial) {
                            specialCollectSound.currentTime = 0;
                            specialCollectSound.play().catch(e => console.log('Audio play prevented:', e));
                            
                            // Show speed boost notification
                            showSystemMessage('Speed boost activated! (5 seconds)');
                        } else {
                            collectSound.currentTime = 0;
                            collectSound.play().catch(e => console.log('Audio play prevented:', e));
                        }
                    } catch (e) {
                        console.log("Sound error:", e);
                    }
                }
                break;
                
            case 'speedBoostEnded':
                // Speed boost has ended
                showSystemMessage('Speed boost ended');
                break;
                
            case 'victory':
                // Player won the game
                victorySound.currentTime = 0;
                victorySound.play().catch(e => console.log('Audio play prevented:', e));
                
                // Create victory visual effect
                if (gameData.players && gameData.players[playerId]) {
                    const player = gameData.players[playerId];
                    createVictoryEffect(player.position.x, player.position.y);
                }
                
                // Show victory message
                showVictoryModal();
                break;
                
            case 'hit':
                // Player was hit by a projectile
                showSystemMessage(`You were hit! Lost ${Math.floor(data.damage)} size`);
                // Play hit sound
                try {
                    absorptionSound.currentTime = 0;
                    absorptionSound.play().catch(e => console.log('Audio play prevented:', e));
                } catch (e) {}
                break;
                
            case 'hitConfirmed':
                // Player hit someone with their projectile
                showSystemMessage(`Hit confirmed! Damaged player by ${Math.floor(data.damage)} size`);
                break;
                
            case 'projectileCreated':
                // Show successful shoot message
                showSystemMessage("Projectile fired!");
                break;
                
            case 'absorbed':
                // Player was absorbed by another player
                absorptionSound.currentTime = 0;
                absorptionSound.play().catch(e => console.log('Audio play prevented:', e));
                showDeathModal(data.by);
                break;
                
            case 'gameReset':
                // Game was reset after a victory
                showSystemMessage('The game has been reset! A new battle begins!');
                break;
                
            case 'systemMessage':
                // Display system message
                showSystemMessage(data.message);
                break;
        }
    };
    
    socket.onclose = () => {
        console.log('Disconnected from server');
        setTimeout(connectToServer, 2000); // Try to reconnect after 2 seconds
    };
}

// Show system message
function showSystemMessage(message) {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'system-notification';
    messageContainer.textContent = message;
    
    document.body.appendChild(messageContainer);
    
    // Fade out after a few seconds
    setTimeout(() => {
        messageContainer.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(messageContainer);
        }, 1000);
    }, 4000);
}

// Show victory modal
function showVictoryModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active victory-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Victory!</h2>
            <p>You have won this magical battle!</p>
            <p>The game will reset for a new battle.</p>
            <div class="fireworks"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add fireworks animation
    const fireworks = modal.querySelector('.fireworks');
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const spark = document.createElement('div');
            spark.className = 'spark';
            spark.style.left = Math.random() * 100 + '%';
            spark.style.top = Math.random() * 100 + '%';
            spark.style.backgroundColor = ['#FFD700', '#FF6347', '#00FFFF', '#FF00FF', '#7FFF00'][Math.floor(Math.random() * 5)];
            fireworks.appendChild(spark);
            
            // Remove spark after animation
            setTimeout(() => {
                fireworks.removeChild(spark);
            }, 1000);
        }, i * 300);
    }
    
    // Remove modal after a few seconds
    setTimeout(() => {
        modal.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 1000);
    }, 5000);
}

// Show death modal when player is absorbed
function showDeathModal(killerName) {
    const modal = document.createElement('div');
    modal.className = 'modal active death-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>You were absorbed!</h2>
            <p>${killerName} has absorbed your magical power.</p>
            <p>Click anywhere to respawn.</p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Remove modal on click
    document.addEventListener('click', () => {
        modal.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 1000);
    }, { once: true });
}

function submitName() {
    const name = nameInput.value.trim();
    if (name) {
        playerName = name;
        nameModal.classList.remove('active');
        gameContainer.classList.remove('hidden');
        
        // Send name to server
        socket.send(JSON.stringify({
            type: 'setName',
            name: playerName
        }));
        
        // Start game loop
        requestAnimationFrame(gameLoop);
        
        // Setup controls after name is submitted
        setupControls();
    }
}

function setupControls() {
    // Mouse movement
    canvas.addEventListener('mousemove', handleMouseMove);
    
    // Mobile touch controls
    canvas.addEventListener('touchmove', handleTouchMove);
    
    // Mouse up and down
    canvas.addEventListener('mousedown', () => isMoving = true);
    canvas.addEventListener('mouseup', () => isMoving = false);
    canvas.addEventListener('mouseout', () => isMoving = false);
    
    // Touch start and end
    canvas.addEventListener('touchstart', () => isMoving = true);
    canvas.addEventListener('touchend', () => isMoving = false);
    
    // Add zoom controls (mousewheel)
    canvas.addEventListener('wheel', handleZoom);
    
    // Add keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    
    // Start continuous movement loop
    startContinuousMovement();
}

// Store last cursor position to allow continuous movement
let lastCursorX = 0;
let lastCursorY = 0;
let isMoving = false;

function handleMouseMove(e) {
    if (!socket || !playerId || !gameData.players || !gameData.players[playerId]) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Always store the last cursor position
    lastCursorX = mouseX;
    lastCursorY = mouseY;
    
    // Calculate direction vector (from center of screen)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Direction from center of screen
    const dirX = mouseX - centerX;
    const dirY = mouseY - centerY;
    
    // Calculate distance from center
    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    
    // Smaller deadzone for responsiveness
    const deadzone = 10;
    
    // Update movement state
    if (length > deadzone) {
        if (!isMoving) {
            isMoving = true;
            // Start continuous movement
            startContinuousMovement();
        }
    } else {
        isMoving = false;
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!socket || !playerId || !e.touches[0] || !gameData.players || !gameData.players[playerId]) return;
    
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const touchY = e.touches[0].clientY - rect.top;
    
    // Store the last touch position for continuous movement
    lastCursorX = touchX;
    lastCursorY = touchY;
    
    // Calculate direction vector from center
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Direction from center of screen
    const dirX = touchX - centerX;
    const dirY = touchY - centerY;
    
    // Calculate distance from center
    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    
    // Smaller deadzone for responsiveness
    const deadzone = 10;
    
    // Update movement state
    if (length > deadzone) {
        if (!isMoving) {
            isMoving = true;
            // Start continuous movement
            startContinuousMovement();
        }
    } else {
        isMoving = false;
    }
}

// Movement and camera control variables
let targetZoom = 1;
const zoomSmoothness = 0.1; // Lower value = smoother but slower
window.cameraZoom = 1; // Initialize global zoom
const movementUpdateInterval = 33; // ~30fps for movement updates

// Continuous movement function that sends updates at a fixed rate
function startContinuousMovement() {
    // Clear any existing intervals
    if (window.movementInterval) {
        clearInterval(window.movementInterval);
    }
    
    // Set up interval for movement updates
    window.movementInterval = setInterval(() => {
        if (!isMoving || !socket || !playerId || !gameData.players || !gameData.players[playerId]) return;
        
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate direction based on last cursor position
        const dirX = lastCursorX - centerX;
        const dirY = lastCursorY - centerY;
        
        // Calculate distance from center
        const length = Math.sqrt(dirX * dirX + dirY * dirY);
        
        // Only move if we have a direction
        if (length > 0) {
            // Normalized direction
            const normalizedDirX = dirX / length;
            const normalizedDirY = dirY / length;
            
            // Increased base speed for faster movement
            let baseSpeed = 2.0;
            
            // Speed proportional to distance from center with a softer curve
            // min: baseSpeed, max: baseSpeed + 5
            let speedFactor = Math.min(length / 200, 1);
            let speed = baseSpeed + (speedFactor * 5);
            
            // We'll let the server handle the speed boost now
            // by not applying it client-side to avoid conflicts
            
            // Send direction to server
            socket.send(JSON.stringify({
                type: 'direction',
                dirX: normalizedDirX,
                dirY: normalizedDirY,
                speed: speed
            }));
        }
    }, movementUpdateInterval);
}

function handleZoom(e) {
    // Zoom is handled client-side for better performance
    e.preventDefault();
    const zoomFactor = 0.05; // Reduced from 0.1 for finer control
    
    // Initialize if not set
    if (typeof window.cameraZoom === 'undefined') {
        window.cameraZoom = 1;
        targetZoom = 1;
    }
    
    if (e.deltaY < 0) {
        // Zoom in - update target but not actual zoom
        targetZoom = Math.min(2, targetZoom + zoomFactor);
    } else {
        // Zoom out - update target but not actual zoom
        targetZoom = Math.max(0.5, targetZoom - zoomFactor);
    }
    
    // Actual zoom update happens in the animation loop
    if (!window.zoomAnimationActive) {
        window.zoomAnimationActive = true;
        requestAnimationFrame(updateZoom);
    }
}

function updateZoom() {
    // Smoothly interpolate towards target zoom
    if (Math.abs(window.cameraZoom - targetZoom) > 0.001) {
        window.cameraZoom += (targetZoom - window.cameraZoom) * zoomSmoothness;
        requestAnimationFrame(updateZoom);
    } else {
        window.cameraZoom = targetZoom; // Snap to exact value when close enough
        window.zoomAnimationActive = false;
    }
}

function handleKeyDown(e) {
    // Add keyboard shortcuts
    if (e.key === 'c' || e.key === 'C') {
        // Focus chat input
        chatInput.focus();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        // Shoot projectile when space is pressed
        shootProjectile();
    }
}

// Shooting mechanism
let lastShootTime = 0;
const SHOOT_COOLDOWN = 2000; // 2 seconds cooldown

function shootProjectile() {
    if (!socket || !playerId || !gameData.players || !gameData.players[playerId]) return;
    
    // Check cooldown
    const now = Date.now();
    if (now - lastShootTime < SHOOT_COOLDOWN) {
        // Still on cooldown
        const remainingCooldown = Math.ceil((SHOOT_COOLDOWN - (now - lastShootTime)) / 1000);
        showSystemMessage(`Shooting on cooldown (${remainingCooldown}s)`);
        return;
    }
    
    const player = gameData.players[playerId];
    
    // Minimum size check - can't shoot if too small
    if (player.size < 15) {
        showSystemMessage("You're too small to shoot!");
        return;
    }
    
    // Get current cursor direction
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const dirX = lastCursorX - centerX;
    const dirY = lastCursorY - centerY;
    
    // Normalize direction
    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    if (length === 0) return; // No direction
    
    const normalizedDirX = dirX / length;
    const normalizedDirY = dirY / length;
    
    // Update cooldown
    lastShootTime = now;
    window.lastShootTime = now; // Share with renderer
    
    // Send shoot command to server
    socket.send(JSON.stringify({
        type: 'shoot',
        dirX: normalizedDirX,
        dirY: normalizedDirY
    }));
    
    // Show visual feedback
    showSystemMessage("Shooting!");
}

function sendChatMessage(message) {
    if (!socket || !playerId) return;
    
    // Send chat message to server
    socket.send(JSON.stringify({
        type: 'chat',
        message,
        sender: playerName,
        color: gameData.players && gameData.players[playerId] ? gameData.players[playerId].color : '#ffffff'
    }));
}

function addChatMessage(data) {
    console.log("Received chat message:", data);
    
    const messageEl = document.createElement('div');
    messageEl.classList.add('message');
    
    if (data.isSystem) {
        messageEl.classList.add('system-message');
        messageEl.textContent = data.text;
    } else {
        messageEl.innerHTML = `<span class="sender" style="color: ${data.color || '#ffffff'}">${data.sender || 'Unknown'}: </span>${data.text}`;
    }
    
    // Add to chat container with a slide-in animation
    messageEl.style.opacity = '0';
    messageEl.style.transform = 'translateY(20px)';
    chatMessages.appendChild(messageEl);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Animate in
    setTimeout(() => {
        messageEl.style.opacity = '1';
        messageEl.style.transform = 'translateY(0)';
    }, 10);
    
    // Limit chat messages
    while (chatMessages.children.length > 100) {
        chatMessages.removeChild(chatMessages.firstChild);
    }
}

function updateGameLeaderboard() {
    if (!gameData || !gameData.players) return;
    
    // Update leaderboard using the imported function
    updateLeaderboard(gameData.players);
}

function gameLoop() {
    // Update leaderboard
    updateGameLeaderboard();
    
    // Render game
    render(gameData, playerId);
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Start the game
document.addEventListener('DOMContentLoaded', init);
```

## File: WizardArena/client/js/nameModal.js

```
// Handles the name entry modal
import { connectToServer } from './network.js';
import { setPlayerName } from './chat.js';
import { startGame } from './game.js';
import { initChat } from './chat.js';
import { initPlayerState } from './playerState.js';

let playerName = '';

export function initNameModal() {
    const modal = document.getElementById('nameModal');
    const nameInput = document.getElementById('playerNameInput');
    const joinButton = document.getElementById('joinGameButton');
    
    // Focus the input field
    nameInput.focus();
    
    // Handle button click
    joinButton.addEventListener('click', handleJoin);
    
    // Handle enter key
    nameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleJoin();
        }
    });
    
    // Prevent closing by clicking outside
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            nameInput.focus();
        }
    });
}

function handleJoin() {
    const nameInput = document.getElementById('playerNameInput');
    const name = nameInput.value.trim();
    
    if (name.length < 2) {
        // Name too short, show error
        nameInput.style.border = '2px solid #e74c3c';
        nameInput.placeholder = 'Name must be at least 2 characters';
        nameInput.value = '';
        nameInput.focus();
        
        // Reset after 2 seconds
        setTimeout(() => {
            nameInput.style.border = 'none';
            nameInput.placeholder = 'Your Wizard Name';
        }, 2000);
        
        return;
    }
    
    // Store the name and hide modal
    playerName = name;
    hideModal();
    showGameContainer();
    
    // Start the game with this name
    initGame(playerName);
}

function hideModal() {
    const modal = document.getElementById('nameModal');
    modal.classList.add('hidden');
}

function showGameContainer() {
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.classList.remove('hidden');
}

export function getPlayerName() {
    return playerName;
}

function initGame(name) {
    // Connect to server first to ensure we don't miss any messages
    connectToServer('ws://10.0.0.78:8080');
    
    // Initialize the chat
    initChat();
    
    // Set the player name
    setPlayerName(name);
    
    // Initialize player state
    initPlayerState();
    
    // Start the game
    startGame();
} 
```

## File: WizardArena/client/js/network.js

```
// Handles WebSocket communication
import { setPlayerId } from './player.js';
import { updateGameState } from './game.js';
import { receiveMessage } from './chat.js';

let socket;

export function connectToServer(url) {
    socket = new WebSocket(url);
    socket.onopen = () => console.log('Connected to server');
    socket.onmessage = (message) => {
        const data = JSON.parse(message.data);
        if (data.type === 'init') {
            setPlayerId(data.id);
        } else if (data.type === 'update') {
            updateGameState(data.state);
        } else if (data.type === 'chatMessage' || data.type === 'system') {
            receiveMessage(data);
        } else if (data.type === 'resetConfirm') {
            setPlayerId(data.id);
            receiveMessage({
                type: 'system',
                content: 'You have been respawned! Good luck!'
            });
        }
    };
    socket.onerror = (err) => console.error('WebSocket error:', err);
}

export function sendToServer(data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
    }
} 
```

## File: WizardArena/client/js/orb.js

```
// Represents collectible orbs
export class Orb {
    constructor(id, position) {
        this.id = id;
        this.position = position;
    }
} 
```

## File: WizardArena/client/js/player.js

```
// Handles player input
import { sendToServer } from './network.js';
import { setCurrentPlayerId } from './playerState.js';

let playerId = null;

export function setPlayerId(id) {
    playerId = id;
    setCurrentPlayerId(id);
}

export function handleInput() {
    document.onmousemove = (event) => {
        if (playerId) {
            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            const position = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
            sendToServer({ type: 'move', position });
        }
    };
} 
```

## File: WizardArena/client/js/playerState.js

```
// Manages player state and reset functionality
import { sendToServer } from './network.js';
import { setPlayerId } from './player.js';

let isAlive = true;
let currentPlayerId = null;

export function setCurrentPlayerId(id) {
    currentPlayerId = id;
    isAlive = true;
}

export function checkPlayerAlive(players) {
    // If we had an ID but now we don't exist in the players list, we're dead
    if (currentPlayerId && isAlive && !players[currentPlayerId]) {
        handlePlayerDeath();
    }
}

function handlePlayerDeath() {
    isAlive = false;
    showResetButton();
}

function showResetButton() {
    const resetButton = document.getElementById('resetButton');
    resetButton.classList.remove('hidden');
    
    resetButton.addEventListener('click', resetGame);
}

function resetGame() {
    // Hide the reset button
    const resetButton = document.getElementById('resetButton');
    resetButton.classList.add('hidden');
    
    // Reset player ID
    currentPlayerId = null;
    
    // Tell the server to reset this player
    sendToServer({ type: 'reset' });
}

// Initialize the reset button event listener
export function initPlayerState() {
    const resetButton = document.getElementById('resetButton');
    resetButton.addEventListener('click', resetGame);
} 
```

## File: WizardArena/client/js/renderer.js

```
// Renders game objects to the canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Camera and view variables
let cameraX = 0;
let cameraY = 0;
let cameraZoom = 1;
const MAP_WIDTH = 5000;  // Should match server value
const MAP_HEIGHT = 5000; // Should match server value

// Load and create background
const backgroundGradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width / 1.5
);
backgroundGradient.addColorStop(0, '#162447');
backgroundGradient.addColorStop(1, '#0f111a');

// Grid patterns
const gridSpacing = 100;
const gridOpacity = 0.1;

// Particle system for visual effects
const particles = [];
const MAX_PARTICLES = 200; // Increased particle count

// Cached images for wizards and orbs
const imageCache = {
    wizard: null,
    orb: null,
    specialOrb: null,
    crown: null
};

// Last positions for interpolation
let lastGameData = null;

// Smooth camera movement
let targetCameraX = 0;
let targetCameraY = 0;
const CAMERA_SMOOTHING = 0.1;

function createParticle(x, y, color, size = null, life = null) {
    const particle = {
        x,
        y,
        size: size || Math.random() * 5 + 2,
        color: color || '#FFD700',
        speedX: (Math.random() - 0.5) * 5,
        speedY: (Math.random() - 0.5) * 5,
        life: life || 100,
        maxLife: life || 100,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2
    };
    
    particles.push(particle);
    
    // Remove oldest particles if we have too many
    if (particles.length > MAX_PARTICLES) {
        particles.shift();
    }
}

function createOrbCollectEffect(x, y, isSpecial = false) {
    const particleCount = isSpecial ? 30 : 15;
    const color = isSpecial ? 
        ['#ff1493', '#00ffff', '#7fff00', '#ff00ff'][Math.floor(Math.random() * 4)] : 
        'gold';
        
    for (let i = 0; i < particleCount; i++) {
        createParticle(x, y, color, isSpecial ? Math.random() * 8 + 3 : null, isSpecial ? 150 : null);
    }
}

function createVictoryEffect(x, y) {
    const colors = ['#FFD700', '#FFA500', '#FF4500', '#FF6347', '#FF7F50'];
    
    for (let i = 0; i < 100; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 8 + 2;
        const life = 100 + Math.random() * 100;
        
        // Create particle with more controlled movement for fireworks effect
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        const particle = {
            x, y,
            size,
            color,
            speedX: Math.cos(angle) * speed,
            speedY: Math.sin(angle) * speed,
            life,
            maxLife: life,
            gravity: 0.05,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2
        };
        
        particles.push(particle);
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.life--;
        
        // Apply gravity if specified
        if (p.gravity) {
            p.speedY += p.gravity;
        }
        
        // Update rotation
        if (p.rotationSpeed) {
            p.rotation += p.rotationSpeed;
        }
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function renderParticles() {
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life / p.maxLife;
        
        // Position at particle center
        ctx.translate(p.x, p.y);
        
        if (p.rotation) {
            ctx.rotate(p.rotation);
        }
        
        // Draw particle - star shape for special effects
        if (p.color === '#FFD700' && p.size > 4) {
            // Draw star
            ctx.beginPath();
            const spikes = 5;
            const outerRadius = p.size;
            const innerRadius = p.size / 2;
            
            for (let i = 0; i < spikes * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (Math.PI * 2 * i) / (spikes * 2);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.fill();
        } else {
            // Standard circular particle
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }
        
        ctx.restore();
    });
    ctx.globalAlpha = 1;
}

// Track last frame's orb positions to detect collection
let lastOrbPositions = {};

// Initialize renderer
function initRenderer() {
    // We don't actually need to preload images for this version
    // since we're drawing everything with canvas primitives
    imageCache.wizard = true;
    imageCache.orb = true;
    imageCache.specialOrb = true;
    imageCache.crown = true;
    
    // Set canvas to full window size
    canvas.width = window.innerWidth - 350; // Sidebar width
    canvas.height = window.innerHeight;
    
    // Set high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth - 350;
        canvas.height = window.innerHeight;
        
        // Maintain high-quality rendering after resize
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
    });
    
    // Create initial particle burst for visual flair
    createStartupEffect();
}

// Create a visual flourish when the game starts
function createStartupEffect() {
    // Create particles in a circular burst from the center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Generate particles in spiral pattern inspired by golden ratio
    const particleCount = 50;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians
    
    for (let i = 0; i < particleCount; i++) {
        // Use golden angle to create aesthetic spiral pattern
        const distance = 5 * Math.sqrt(i);
        const angle = i * goldenAngle;
        
        // Calculate position based on spiral
        const x = centerX + Math.cos(angle) * distance * 5;
        const y = centerY + Math.sin(angle) * distance * 5;
        
        // Create particle with Renaissance-inspired colors
        const colors = [
            '#8A2BE2', // Deep violet-blue
            '#DAA520', // Golden ochre
            '#B22222', // Venetian red
            '#4B0082', // Deep indigo
            '#00A86B'  // Viridian green
        ];
        
        const color = colors[i % colors.length];
        const size = 3 + Math.random() * 5;
        const life = 100 + Math.random() * 150;
        
        // Create particle with rotation and outward velocity
        const particle = {
            x, y,
            size,
            color,
            speedX: (x - centerX) * 0.02,
            speedY: (y - centerY) * 0.02,
            life,
            maxLife: life,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        };
        
        particles.push(particle);
    }
}

// Main render function
function render(gameData, playerId) {
    if (!gameData) return; // Don't render if no game data
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Store game data for interpolation
    if (!lastGameData) {
        lastGameData = JSON.parse(JSON.stringify(gameData));
    }
    
    // Update camera to follow current player
    updateCamera(gameData, playerId);
    
    // Apply camera transformation
    ctx.save();
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background (fixed position relative to camera)
    drawBackground(ctx, width, height);
    
    // Apply camera transform for game world
    ctx.translate(-cameraX + width/2, -cameraY + height/2);
    ctx.scale(cameraZoom, cameraZoom);
    
    // Draw grid
    drawGrid(ctx, width, height);
    
    // Draw map bounds
    drawMapBounds(ctx);
    
    // Draw decorative elements - Renaissance-inspired geometric patterns
    drawDecorations(ctx, MAP_WIDTH, MAP_HEIGHT);
    
    // Draw a function that adds Renaissance-inspired decorative elements to the game map
    function drawDecorations(ctx, mapWidth, mapHeight) {
        // Add golden ratio spiral at each corner
        drawGoldenSpiral(ctx, 200, 200, 100, 0.8);
        drawGoldenSpiral(ctx, mapWidth - 200, 200, 100, 0.8);
        drawGoldenSpiral(ctx, 200, mapHeight - 200, 100, 0.8);
        drawGoldenSpiral(ctx, mapWidth - 200, mapHeight - 200, 100, 0.8);
        
        // Draw Vitruvian-inspired circle and square in center
        drawVitruvianElements(ctx, mapWidth/2, mapHeight/2, 400);
    }
    
    // Draw golden ratio spiral (Fibonacci spiral)
    function drawGoldenSpiral(ctx, x, y, size, opacity) {
        ctx.save();
        ctx.translate(x, y);
        
        // Draw spiral with subtle opacity
        ctx.beginPath();
        ctx.strokeStyle = `rgba(218, 165, 32, ${opacity * 0.3})`; // Gold
        ctx.lineWidth = size * 0.03;
        
        // Draw golden spiral
        let a = 0;
        let b = size;
        const goldenRatio = 1.618033988749895;
        
        ctx.moveTo(0, 0);
        for (let i = 0; i < 10; i++) {
            const angle = i * 0.5 * Math.PI;
            a = b * Math.cos(angle);
            b = b / goldenRatio;
            ctx.lineTo(a, b);
        }
        
        ctx.stroke();
        
        // Draw subtle fibonacci rectangles
        ctx.lineWidth = size * 0.01;
        let currentSize = size;
        let prevSize = size / goldenRatio;
        let currentX = 0;
        let currentY = 0;
        
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(218, 165, 32, ${opacity * 0.15})`;
            
            // Draw rectangle based on fibonacci sequence proportions
            if (i % 4 === 0) {
                ctx.strokeRect(currentX, currentY - prevSize, currentSize, prevSize);
                currentX += currentSize;
            } else if (i % 4 === 1) {
                ctx.strokeRect(currentX - prevSize, currentY - prevSize, prevSize, -currentSize);
                currentY -= currentSize;
            } else if (i % 4 === 2) {
                ctx.strokeRect(currentX - prevSize - currentSize, currentY - prevSize, currentSize, -prevSize);
                currentX -= currentSize;
            } else {
                ctx.strokeRect(currentX - prevSize, currentY, prevSize, currentSize);
                currentY += currentSize;
            }
            
            // Update sizes for next rectangle
            const temp = currentSize;
            currentSize = prevSize;
            prevSize = temp - prevSize;
        }
        
        ctx.restore();
    }
    
    // Draw elements inspired by Da Vinci's Vitruvian Man
    function drawVitruvianElements(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        
        // Draw circle (representing heaven/spiritual realm in Da Vinci's work)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.arc(0, 0, size/2, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw square (representing earth/physical realm)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(218, 165, 32, 0.08)';
        ctx.lineWidth = 1;
        const squareSize = size/2 * 0.9; // Slightly smaller than circle
        ctx.strokeRect(-squareSize/2, -squareSize/2, squareSize, squareSize);
        
        // Add diagonal lines through square (representing divine proportions)
        ctx.beginPath();
        ctx.moveTo(-squareSize/2, -squareSize/2);
        ctx.lineTo(squareSize/2, squareSize/2);
        ctx.moveTo(squareSize/2, -squareSize/2);
        ctx.lineTo(-squareSize/2, squareSize/2);
        ctx.stroke();
        
        // Add subtle measurement points along circle (like in Vitruvian Man)
        ctx.fillStyle = 'rgba(218, 165, 32, 0.15)';
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const markX = Math.cos(angle) * (size/2);
            const markY = Math.sin(angle) * (size/2);
            
            ctx.beginPath();
            ctx.arc(markX, markY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    // Draw orbs
    drawOrbs(ctx, gameData.orbs);
    
    // Check for collected orbs and create effects
    detectOrbCollections(gameData.orbs);
    
    // Draw projectiles
    if (gameData.projectiles) {
        drawProjectiles(ctx, gameData.projectiles, playerId);
    }
    
    // Draw players
    drawPlayers(ctx, gameData.players, playerId);
    
    // Update and draw particles
    updateParticles();
    renderParticles();
    
    // Restore original transform
    ctx.restore();
    
    // Draw UI elements (not affected by camera)
    drawUI(ctx, gameData, playerId, width, height);
    
    // Update last game data for next frame
    lastGameData = JSON.parse(JSON.stringify(gameData));
}

// Draw colorful nebula clouds inspired by Dali's dreamlike atmospheres
function drawNebulaClouds(ctx, width, height) {
    // Nebula parameters - richer Renaissance color palette
    const nebulaColors = [
        'rgba(138, 43, 226, 0.08)',  // Deep violet (from Byzantine icons)
        'rgba(65, 105, 225, 0.08)',  // Royal blue (like Renaissance ultramarine)
        'rgba(178, 34, 34, 0.06)',   // Venetian red (Renaissance favorite)
        'rgba(218, 165, 32, 0.05)',  // Golden ochre (from illuminated manuscripts)
        'rgba(95, 158, 160, 0.07)',  // Verdigris (Renaissance copper pigment)
        'rgba(147, 112, 219, 0.06)', // Medium purple (Michelangelo's drapery)
    ];
    const cloudCount = 15; // More clouds for richness
    
    ctx.save();
    
    // Apply very slow parallax effect
    const parallaxFactor = 0.03;
    const offsetX = -cameraX * parallaxFactor;
    const offsetY = -cameraY * parallaxFactor;
    
    // Draw each nebula cloud with a seeded position
    for (let i = 0; i < cloudCount; i++) {
        // Use a consistent seed for reproducible clouds
        const seed = i * 1000;
        const seedRandom = function(n) {
            return ((Math.sin(seed + (n || 0)) * 10000) % 1 + 1) % 1;
        };
        
        // Cloud position and size
        const x = offsetX + width * (seedRandom(1) * 2 - 0.5);
        const y = offsetY + height * (seedRandom(2) * 2 - 0.5);
        const size = Math.min(width, height) * (0.6 + seedRandom(3));
        
        // Create a colorful cloud
        const colorIndex = Math.floor(seedRandom(4) * nebulaColors.length);
        const color = nebulaColors[colorIndex];
        
        // Draw surrealist-inspired cloud shapes using Bezier curves
        if (i % 3 === 0) {
            // Dali-esque melting/flowing shapes
            const flowPathCount = Math.floor(seedRandom(5) * 5) + 3;
            
            for (let f = 0; f < flowPathCount; f++) {
                ctx.beginPath();
                
                // Start point
                const startX = x + size * (seedRandom(f*7) * 0.5 - 0.25);
                const startY = y + size * (seedRandom(f*7+1) * 0.5 - 0.25);
                
                ctx.moveTo(startX, startY);
                
                // Create flowing Bezier curve
                const cp1x = startX + size * (seedRandom(f*7+2) * 0.7 - 0.35);
                const cp1y = startY + size * (seedRandom(f*7+3) * 0.7 - 0.35);
                const cp2x = startX + size * (seedRandom(f*7+4) * 0.9 - 0.45);
                const cp2y = startY + size * (seedRandom(f*7+5) * 0.9 - 0.45);
                const endX = startX + size * (seedRandom(f*7+6) * 0.4 - 0.2);
                const endY = startY + size * (seedRandom(f*7+7) * 0.4 - 0.2);
                
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
                
                // Vary line width for more organic feel
                ctx.lineWidth = size * (0.01 + seedRandom(f*7+8) * 0.04);
                ctx.strokeStyle = color.replace('rgba', 'rgba').replace(', 0.', ', 0.3');
                ctx.stroke();
            }
        } 
        
        // Draw the cloud using multiple overlapping circles with varying opacity
        for (let j = 0; j < 18; j++) {
            const cloudX = x + size * (seedRandom(j*5) * 0.7 - 0.35);
            const cloudY = y + size * (seedRandom(j*5+1) * 0.7 - 0.35);
            const cloudSize = size * (0.15 + seedRandom(j*5+2) * 0.85);
            
            // Vary opacity for depth
            const opacity = 0.05 + seedRandom(j*5+3) * 0.08;
            const cloudColor = color.replace(', 0.', ', ' + opacity.toFixed(2) + ')');
            
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(
                cloudX, cloudY, 0,
                cloudX, cloudY, cloudSize
            );
            gradient.addColorStop(0, cloudColor);
            gradient.addColorStop(0.5, cloudColor.replace(', 0.', ', ' + (opacity * 0.8).toFixed(2) + ')'));
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    ctx.restore();
}

// Update camera to follow player
function updateCamera(gameData, playerId) {
    if (gameData.players && gameData.players[playerId]) {
        const player = gameData.players[playerId];
        
        // Always center camera exactly on player position - no smoothing needed
        // This ensures player is always centered regardless of zoom level
        cameraX = player.position.x;
        cameraY = player.position.y;
    }
    
    // Safety check - if camera zoom not set, initialize it
    if (typeof window.cameraZoom === 'undefined') {
        window.cameraZoom = 1;
    }
    
    // Update local cameraZoom from window object
    cameraZoom = window.cameraZoom;
}

// Draw game background with stars and nebula
function drawBackground(ctx, width, height) {
    // Create deeper space gradient inspired by Renaissance night skies and Dali's cosmic scenes
    const gradient = ctx.createRadialGradient(
        width/2, height/2, 0,
        width/2, height/2, Math.max(width, height)
    );
    gradient.addColorStop(0, '#1A237E'); // Ultramarine (Renaissance favorite)
    gradient.addColorStop(0.3, '#24348F'); // Lapis lazuli tones (precious Renaissance pigment)
    gradient.addColorStop(0.6, '#0D1A4A'); // Deep midnight blue (Da Vinci night scenes)
    gradient.addColorStop(0.8, '#0E1035'); // Prussian blue (Dali sky tones)
    gradient.addColorStop(1, '#000428'); // Almost black blue with subtle purple
    
    // Fill background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle vignette effect for heightened drama
    const vignette = ctx.createRadialGradient(
        width/2, height/2, Math.min(width, height) * 0.4,
        width/2, height/2, Math.max(width, height) * 0.9
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    
    // Draw distant stars with parallax effect (slower movement)
    drawStars(ctx, width, height, 0.2);
    
    // Draw nebula clouds
    drawNebulaClouds(ctx, width, height);
}

// Draw twinkling stars with parallax effect
function drawStars(ctx, width, height, parallaxFactor) {
    // Save the current time for twinkling effect
    const time = Date.now() / 1000;
    
    // Generate random stars
    ctx.save();
    
    // Apply parallax effect based on camera position
    const offsetX = -cameraX * parallaxFactor;
    const offsetY = -cameraY * parallaxFactor;
    
    // Create a pattern that repeats
    const starPatternSize = 1000;
    const starsPerPattern = 100;
    
    for (let patternX = Math.floor((cameraX - width) / starPatternSize) - 1; 
         patternX <= Math.floor((cameraX + width) / starPatternSize) + 1; 
         patternX++) {
        
        for (let patternY = Math.floor((cameraY - height) / starPatternSize) - 1; 
             patternY <= Math.floor((cameraY + height) / starPatternSize) + 1; 
             patternY++) {
            
            // Use a seeded random based on pattern position
            const patternSeed = (patternX * 10000 + patternY);
            let seedRandom = function(offset = 0) {
                const x = Math.sin(patternSeed + offset) * 10000;
                return x - Math.floor(x);
            };
            
            // Draw stars for this pattern
            for (let i = 0; i < starsPerPattern; i++) {
                // Position within pattern
                const x = seedRandom(i * 2) * starPatternSize;
                const y = seedRandom(i * 2 + 1) * starPatternSize;
                
                // Absolute position
                const starX = patternX * starPatternSize + x + offsetX;
                const starY = patternY * starPatternSize + y + offsetY;
                
                // Star properties
                const size = seedRandom(i * 2 + 2) * 2 + 0.5;
                
                // Twinkling effect
                const twinkle = (Math.sin(time * 3 + i) + 1) / 2;
                const alpha = 0.3 + twinkle * 0.7;
                
                // Star color
                const colorSeed = seedRandom(i * 2 + 3);
                let color;
                if (colorSeed < 0.6) {
                    // White or blue-white
                    color = `rgba(255, 255, ${200 + Math.floor(55 * colorSeed)}, ${alpha})`;
                } else if (colorSeed < 0.8) {
                    // Yellow
                    color = `rgba(255, ${200 + Math.floor(55 * colorSeed)}, 100, ${alpha})`;
                } else {
                    // Red or orange
                    color = `rgba(255, ${100 + Math.floor(155 * colorSeed)}, 50, ${alpha})`;
                }
                
                // Draw the star
                ctx.beginPath();
                ctx.fillStyle = color;
                ctx.arc(starX, starY, size, 0, Math.PI * 2);
                ctx.fill();
                
                // Add glow to some stars
                if (seedRandom(i * 2 + 4) > 0.7) {
                    ctx.beginPath();
                    const glow = ctx.createRadialGradient(
                        starX, starY, 0,
                        starX, starY, size * 3
                    );
                    glow.addColorStop(0, color.replace(`, ${alpha})`, ', 0.3)'));
                    glow.addColorStop(1, color.replace(`, ${alpha})`, ', 0)'));
                    ctx.fillStyle = glow;
                    ctx.arc(starX, starY, size * 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
    
    ctx.restore();
}

// Draw grid pattern with camera offset
function drawGrid(ctx, width, height) {
    const gridSize = 100; // Larger grid size for the infinite feel
    
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(80, 100, 255, 0.1)'; // Blue grid lines
    ctx.lineWidth = 1;
    
    // Calculate grid bounds based on camera position
    const viewportWidth = width / cameraZoom;
    const viewportHeight = height / cameraZoom;
    
    const startX = Math.floor((cameraX - viewportWidth/2) / gridSize) * gridSize;
    const endX = Math.ceil((cameraX + viewportWidth/2) / gridSize) * gridSize;
    const startY = Math.floor((cameraY - viewportHeight/2) / gridSize) * gridSize;
    const endY = Math.ceil((cameraY + viewportHeight/2) / gridSize) * gridSize;
    
    // Vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
    }
    
    // Horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
    }
    
    ctx.stroke();
}

// Draw map bounds - subtle boundary indicator
function drawMapBounds(ctx) {
    // Get map dimensions from game data if available
    const mapWidth = MAP_WIDTH;
    const mapHeight = MAP_HEIGHT;
    
    ctx.strokeStyle = 'rgba(100, 100, 255, 0.3)';
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, mapWidth, mapHeight);
    
    // Add decorative elements at corners
    const cornerSize = 50;
    ctx.fillStyle = 'rgba(100, 100, 255, 0.2)';
    
    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(cornerSize, 0);
    ctx.lineTo(0, cornerSize);
    ctx.fill();
    
    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(mapWidth, 0);
    ctx.lineTo(mapWidth - cornerSize, 0);
    ctx.lineTo(mapWidth, cornerSize);
    ctx.fill();
    
    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(0, mapHeight);
    ctx.lineTo(cornerSize, mapHeight);
    ctx.lineTo(0, mapHeight - cornerSize);
    ctx.fill();
    
    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(mapWidth, mapHeight);
    ctx.lineTo(mapWidth - cornerSize, mapHeight);
    ctx.lineTo(mapWidth, mapHeight - cornerSize);
    ctx.fill();
}

// Draw orbs with Renaissance-inspired visual elements
function drawOrbs(ctx, orbs) {
    orbs.forEach(orb => {
        // Draw glow effect
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
            orb.position.x, orb.position.y, 1,
            orb.position.x, orb.position.y, orb.size * 3
        );
        
        // Special orbs have more intense glow
        if (orb.isSpecial) {
            // Save context for rotation
            ctx.save();
            
            // Translate to orb position
            ctx.translate(orb.position.x, orb.position.y);
            
            // Rotate continuously
            const rotationSpeed = Date.now() / 1000;
            ctx.rotate(rotationSpeed);
            
            // Enhanced glow with multiple layers - inspired by Dali's "Christ of Saint John of the Cross"
            gradient.addColorStop(0, orb.color);
            gradient.addColorStop(0.3, orb.color + 'CC');
            gradient.addColorStop(0.7, orb.color + '80');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            // Create outer glow
            ctx.fillStyle = gradient;
            ctx.fillRect(-orb.size * 5, -orb.size * 5, orb.size * 10, orb.size * 10);
            
            // Add pulsing animation to special orbs
            const pulseSize = orb.size * (1 + Math.sin(Date.now() / 200) * 0.3);
            const secondaryPulse = orb.size * (1 + Math.cos(Date.now() / 300) * 0.2);
            
            // Draw golden ratio spiral for special orbs - inspired by Fibonacci patterns in Renaissance art
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)'; // Gold
            ctx.lineWidth = orb.size * 0.2;
            
            // Draw golden spiral
            let a = 0;
            let b = pulseSize * 2;
            const goldenRatio = 1.618033988749895;
            
            ctx.moveTo(0, 0);
            for (let i = 0; i < 8; i++) {
                const angle = i * 0.5 * Math.PI;
                a = b * Math.cos(angle);
                b = b / goldenRatio;
                ctx.lineTo(a, b);
            }
            
            ctx.stroke();
            
            // Draw halo effect (Renaissance divine light)
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = orb.size * 0.1;
            ctx.arc(0, 0, secondaryPulse * 2, 0, Math.PI * 2);
            ctx.stroke();
            
            // Sacred geometry - Vitruvian-inspired star pattern
            const spikes = 5;
            ctx.beginPath();
            for (let i = 0; i < spikes * 2; i++) {
                const radius = i % 2 === 0 ? pulseSize * 1.8 : pulseSize * 0.9;
                const angle = (Math.PI * 2 * i) / (spikes * 2);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            
            // Create multi-toned gradient fill like a Renaissance painting
            const starGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize * 1.8);
            starGradient.addColorStop(0, '#FFFFFF');
            starGradient.addColorStop(0.5, orb.color);
            starGradient.addColorStop(0.8, darkenColor(orb.color, 20));
            starGradient.addColorStop(1, '#000000');
            
            ctx.fillStyle = starGradient;
            ctx.fill();
            
            // Restore context
            ctx.restore();
        } else {
            // Regular orbs - inspired by the perfect, illuminated spheres in Renaissance paintings
            
            // Draw orb glow
            gradient.addColorStop(0, orb.color);
            gradient.addColorStop(0.5, orb.color + '70');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.arc(orb.position.x, orb.position.y, orb.size * 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw orb body with more dimension
            ctx.beginPath();
            
            // Create spherical gradient like Renaissance painted spheres
            const sphereGradient = ctx.createRadialGradient(
                orb.position.x - orb.size * 0.3, 
                orb.position.y - orb.size * 0.3, 
                0,
                orb.position.x, 
                orb.position.y, 
                orb.size * 1.2
            );
            
            // Color transitions to create the illusion of a perfect sphere
            sphereGradient.addColorStop(0, lightenColor(orb.color, 50));
            sphereGradient.addColorStop(0.5, orb.color);
            sphereGradient.addColorStop(1, darkenColor(orb.color, 30));
            
            ctx.fillStyle = sphereGradient;
            ctx.arc(orb.position.x, orb.position.y, orb.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw shine highlight (chiaroscuro technique from Renaissance)
            ctx.beginPath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.arc(
                orb.position.x - orb.size * 0.4, 
                orb.position.y - orb.size * 0.4, 
                orb.size * 0.4, 
                0, Math.PI * 2
            );
            ctx.fill();
            
            // Draw subtle shadow
            ctx.beginPath();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.arc(
                orb.position.x + orb.size * 0.4, 
                orb.position.y + orb.size * 0.4, 
                orb.size * 0.3, 
                0, Math.PI * 2
            );
            ctx.fill();
        }
    });
}

// Draw players with Renaissance artistic influences
function drawPlayers(ctx, players, currentPlayerId) {
    // Sort players by size for proper z-index (smaller on top)
    const sortedPlayers = Object.values(players).sort((a, b) => b.size - a.size);
    
    sortedPlayers.forEach(player => {
        // Draw dramatic shadow (chiaroscuro technique from Renaissance painting)
        ctx.beginPath();
        const shadowGradient = ctx.createRadialGradient(
            player.position.x + 5, player.position.y + 5, 0,
            player.position.x + 5, player.position.y + 5, player.size * 1.5
        );
        shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
        shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = shadowGradient;
        ctx.arc(
            player.position.x + 5,
            player.position.y + 5,
            player.size * 1.2,
            0, Math.PI * 2
        );
        ctx.fill();
        
        // Draw player body with magical effect
        ctx.beginPath();
        
        // Create gradient for player body inspired by Renaissance painting techniques
        // with sfumato (subtle blending of colors) and chiaroscuro (dramatic light/dark contrast)
        const gradient = ctx.createRadialGradient(
            player.position.x - player.size * 0.3, 
            player.position.y - player.size * 0.3, 
            0,
            player.position.x, 
            player.position.y, 
            player.size * 1.2
        );
        
        // Add pulsing effect to player if they are victorious
        let pulseEffect = 0;
        if (player.victorious) {
            pulseEffect = Math.sin(Date.now() / 200) * 5;
        }
        
        // Create rich color gradients inspired by Renaissance oil painting techniques
        gradient.addColorStop(0, lightenColor(player.color, 70)); // Highlight
        gradient.addColorStop(0.3, lightenColor(player.color, 40)); // Light area
        gradient.addColorStop(0.7, player.color); // Mid tone
        gradient.addColorStop(0.9, darkenColor(player.color, 20)); // Shadow edge
        gradient.addColorStop(1, darkenColor(player.color, 40)); // Deep shadow
        
        ctx.fillStyle = gradient;
        ctx.arc(
            player.position.x,
            player.position.y,
            player.size + pulseEffect,
            0, Math.PI * 2
        );
        ctx.fill();
        
        // Draw golden ratio spiral pattern within the player (Leonardo Da Vinci's geometric studies)
        if (player.size > 20) {
            ctx.save();
            ctx.translate(player.position.x, player.position.y);
            
            // Draw spiral with opacity based on player size
            const spiralOpacity = Math.min(0.3, player.size / 100);
            
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 215, 0, ${spiralOpacity})`; // Gold
            ctx.lineWidth = player.size * 0.05;
            
            // Draw golden spiral
            let a = 0;
            let b = player.size * 0.7;
            const goldenRatio = 1.618033988749895;
            
            ctx.moveTo(0, 0);
            for (let i = 0; i < 7; i++) {
                const angle = i * 0.5 * Math.PI;
                a = b * Math.cos(angle);
                b = b / goldenRatio;
                ctx.lineTo(a, b);
            }
            
            ctx.stroke();
            ctx.restore();
        }
        
        // Draw magical aura around player (inspired by divine auras in Renaissance religious paintings)
        ctx.beginPath();
        const auraGradient = ctx.createRadialGradient(
            player.position.x, player.position.y, player.size,
            player.position.x, player.position.y, player.size * 2
        );
        
        // Give the aura a golden/divine quality for larger players
        if (player.size > 30) {
            auraGradient.addColorStop(0, player.color + '60'); // Semi-transparent base color
            auraGradient.addColorStop(0.5, player.color + '30'); // Fading base color
            auraGradient.addColorStop(0.7, 'rgba(255, 215, 0, 0.2)'); // Gold accent
            auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');  // Transparent
        } else {
            auraGradient.addColorStop(0, player.color + '50'); // Semi-transparent
            auraGradient.addColorStop(0.7, player.color + '20'); // More transparent
            auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');  // Transparent
        }
        
        ctx.fillStyle = auraGradient;
        ctx.arc(
            player.position.x,
            player.position.y,
            player.size * 2,
            0, Math.PI * 2
        );
        ctx.fill();
        
        // Draw magical particles and embellishments around victorious players
        if (player.victorious) {
            // Create a golden Renaissance-style crown
            drawCrown(ctx, player.position.x, player.position.y - player.size - 15, player.size * 0.6);
            
            // Draw rays of divine light (inspired by religious Renaissance paintings)
            const rayCount = 12;
            ctx.save();
            ctx.translate(player.position.x, player.position.y);
            
            // Draw beams of light
            for (let i = 0; i < rayCount; i++) {
                const angle = (Math.PI * 2 * i) / rayCount;
                const innerRadius = player.size * 1.5;
                const outerRadius = player.size * (2.5 + Math.sin(Date.now() / 1000 + i) * 0.5);
                
                const gradient = ctx.createLinearGradient(
                    Math.cos(angle) * innerRadius, 
                    Math.sin(angle) * innerRadius,
                    Math.cos(angle) * outerRadius, 
                    Math.sin(angle) * outerRadius
                );
                
                gradient.addColorStop(0, 'rgba(255, 215, 0, 0.7)'); // Gold
                gradient.addColorStop(1, 'rgba(255, 215, 0, 0)'); // Transparent
                
                ctx.beginPath();
                ctx.moveTo(
                    Math.cos(angle - 0.04) * innerRadius, 
                    Math.sin(angle - 0.04) * innerRadius
                );
                ctx.lineTo(
                    Math.cos(angle + 0.04) * innerRadius, 
                    Math.sin(angle + 0.04) * innerRadius
                );
                ctx.lineTo(
                    Math.cos(angle + 0.1) * outerRadius, 
                    Math.sin(angle + 0.1) * outerRadius
                );
                ctx.lineTo(
                    Math.cos(angle - 0.1) * outerRadius, 
                    Math.sin(angle - 0.1) * outerRadius
                );
                ctx.closePath();
                
                ctx.fillStyle = gradient;
                ctx.fill();
            }
            
            ctx.restore();
            
            // Add flowing magical particles - inspired by Dali's flowing forms
            if (Math.random() < 0.5) {
                const angle = Math.random() * Math.PI * 2;
                const distance = player.size * 1.2;
                createParticle(
                    player.position.x + Math.cos(angle) * distance,
                    player.position.y + Math.sin(angle) * distance,
                    player.color,
                    Math.random() * 4 + 2,
                    70
                );
                
                // Also create gold particles
                if (Math.random() < 0.3) {
                    createParticle(
                        player.position.x + Math.cos(angle) * distance,
                        player.position.y + Math.sin(angle) * distance,
                        '#FFD700', // Gold
                        Math.random() * 3 + 1,
                        50
                    );
                }
            }
        }
        
        // Draw player name and score with Renaissance-style illuminated text
        if (player.name) {
            // Style the text like Renaissance illuminated manuscript
            const nameY = player.position.y - player.size - 15;
            const scoreY = player.position.y - player.size - 35;
            
            // Draw illuminated background for name
            ctx.beginPath();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.roundRect(
                player.position.x - player.name.length * 5,
                nameY - 12,
                player.name.length * 10,
                20,
                5
            );
            ctx.fill();
            
            // Set font style
            ctx.font = '14px "Press Start 2P", cursive';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            
            // Draw name with glow for victorious players
            if (player.victorious) {
                ctx.shadowColor = 'gold';
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#FFD700'; // Gold text for victors
            }
            
            // Illuminated first letter (like a medieval manuscript)
            const firstName = player.name.charAt(0);
            const restName = player.name.slice(1);
            
            // Draw the first letter slightly larger and with a special color
            ctx.strokeText(firstName, player.position.x - player.name.length * 3, nameY);
            ctx.fillStyle = player.victorious ? '#FFD700' : '#FF9900'; // Gold or orange
            ctx.fillText(firstName, player.position.x - player.name.length * 3, nameY);
            
            // Draw the rest of the name
            ctx.fillStyle = player.victorious ? '#FFD700' : 'white';
            ctx.strokeText(restName, player.position.x + restName.length * 2, nameY);
            ctx.fillText(restName, player.position.x + restName.length * 2, nameY);
            
            // Draw score with decorative elements
            ctx.strokeText(player.score.toString(), player.position.x, scoreY);
            ctx.fillText(player.score.toString(), player.position.x, scoreY);
            
            // Add small decorative flourishes on either side of score (like manuscript illuminations)
            const scoreWidth = player.score.toString().length * 10;
            ctx.beginPath();
            ctx.strokeStyle = player.victorious ? '#FFD700' : '#FF9900';
            ctx.lineWidth = 1;
            
            // Left flourish
            ctx.moveTo(player.position.x - scoreWidth - 10, scoreY);
            ctx.bezierCurveTo(
                player.position.x - scoreWidth - 5, scoreY - 5,
                player.position.x - scoreWidth - 5, scoreY + 5,
                player.position.x - scoreWidth, scoreY
            );
            
            // Right flourish
            ctx.moveTo(player.position.x + scoreWidth + 10, scoreY);
            ctx.bezierCurveTo(
                player.position.x + scoreWidth + 5, scoreY - 5,
                player.position.x + scoreWidth + 5, scoreY + 5,
                player.position.x + scoreWidth, scoreY
            );
            
            ctx.stroke();
            
            // Reset shadow
            ctx.shadowBlur = 0;
        }
        
        // Highlight current player with a Vitruvian Man-inspired circle and square
        if (player.id === currentPlayerId) {
            ctx.save();
            ctx.translate(player.position.x, player.position.y);
            
            // Animate rotation for square
            const rotationAngle = Date.now() / 5000;
            ctx.rotate(rotationAngle);
            
            // Animate the highlight with pulsing effect
            const pulseSize = 5 + Math.sin(Date.now() / 200) * 2;
            const size = player.size + pulseSize;
            
            // Draw square (representing earth/physical realm in Da Vinci's work)
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(218, 165, 32, 0.4)'; // Gold, semi-transparent
            ctx.lineWidth = 2;
            const squareSize = size * 1.414; // Square that would circumscribe the circle
            ctx.rect(-squareSize/2, -squareSize/2, squareSize, squareSize);
            ctx.stroke();
            
            // Reset rotation for circle
            ctx.restore();
            
            // Draw circle (representing heaven/spiritual realm in Da Vinci's work)
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 2;
            ctx.arc(
                player.position.x,
                player.position.y,
                size,
                0, Math.PI * 2
            );
            ctx.stroke();
            
            // Add pulsing dots at cardinal points (like measurements in Vitruvian Man)
            const dotPositions = [
                {x: player.position.x, y: player.position.y - size}, // Top
                {x: player.position.x + size, y: player.position.y}, // Right
                {x: player.position.x, y: player.position.y + size}, // Bottom
                {x: player.position.x - size, y: player.position.y}  // Left
            ];
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            dotPositions.forEach(pos => {
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    });
}

// Draw an ornate Renaissance-inspired crown for the victorious player
function drawCrown(ctx, x, y, size) {
    const crownHeight = size * 0.8;
    const crownWidth = size * 1.2;
    
    ctx.save();
    ctx.translate(x, y - crownHeight/2);
    
    // Add subtle glow behind crown
    const glowGradient = ctx.createRadialGradient(
        0, 0, 0,
        0, 0, crownWidth
    );
    glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.5)'); // Gold glow
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = glowGradient;
    ctx.fillRect(-crownWidth, -crownHeight, crownWidth * 2, crownHeight * 2);
    
    // Crown base with rich golden gradient (chiaroscuro technique)
    const baseGradient = ctx.createLinearGradient(
        0, -crownHeight * 0.4,
        0, crownHeight * 0.4
    );
    baseGradient.addColorStop(0, '#FFF2B2'); // Light gold highlight
    baseGradient.addColorStop(0.3, '#FFD700'); // Pure gold
    baseGradient.addColorStop(0.7, '#E6BC00'); // Slightly darker
    baseGradient.addColorStop(1, '#9A7D0A'); // Dark gold shadow
    
    ctx.fillStyle = baseGradient;
    ctx.beginPath();
    
    // More elaborate crown base with curved bottom edge
    ctx.moveTo(-crownWidth/2, 0);
    ctx.lineTo(crownWidth/2, 0);
    ctx.lineTo(crownWidth/2, crownHeight * 0.3);
    
    // Decorative curved bottom
    ctx.bezierCurveTo(
        crownWidth/3, crownHeight * 0.4,
        crownWidth/6, crownHeight * 0.5,
        0, crownHeight * 0.45
    );
    ctx.bezierCurveTo(
        -crownWidth/6, crownHeight * 0.5,
        -crownWidth/3, crownHeight * 0.4,
        -crownWidth/2, crownHeight * 0.3
    );
    
    ctx.closePath();
    ctx.fill();
    
    // Add decorative line pattern to crown base
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(154, 125, 10, 0.5)'; // Dark gold
    ctx.lineWidth = 1;
    
    // Horizontal decorative lines
    for (let i = 1; i <= 3; i++) {
        const y = crownHeight * (0.1 * i);
        ctx.moveTo(-crownWidth/2 + 3, y);
        ctx.lineTo(crownWidth/2 - 3, y);
    }
    ctx.stroke();
    
    // Crown points with more elegant, flowing shapes
    ctx.beginPath();
    
    // Left decorative fleur-de-lis inspired point
    ctx.moveTo(-crownWidth/2, 0);
    ctx.bezierCurveTo(
        -crownWidth/2.2, -crownHeight/6,
        -crownWidth/2.5, -crownHeight/4,
        -crownWidth/3, -crownHeight/2
    );
    ctx.bezierCurveTo(
        -crownWidth/3.5, -crownHeight/3,
        -crownWidth/4, -crownHeight/6,
        -crownWidth/6, 0
    );
    
    // Middle taller ornate point
    ctx.moveTo(-crownWidth/6, 0);
    ctx.bezierCurveTo(
        -crownWidth/10, -crownHeight/3,
        -crownWidth/20, -crownHeight/2,
        0, -crownHeight
    );
    ctx.bezierCurveTo(
        crownWidth/20, -crownHeight/2,
        crownWidth/10, -crownHeight/3,
        crownWidth/6, 0
    );
    
    // Right decorative fleur-de-lis inspired point
    ctx.moveTo(crownWidth/6, 0);
    ctx.bezierCurveTo(
        crownWidth/4, -crownHeight/6,
        crownWidth/3.5, -crownHeight/3,
        crownWidth/3, -crownHeight/2
    );
    ctx.bezierCurveTo(
        crownWidth/2.5, -crownHeight/4,
        crownWidth/2.2, -crownHeight/6,
        crownWidth/2, 0
    );
    
    // Fill points with gradient
    const pointsGradient = ctx.createLinearGradient(
        0, -crownHeight,
        0, 0
    );
    pointsGradient.addColorStop(0, '#FFF2B2'); // Light gold at tips
    pointsGradient.addColorStop(0.4, '#FFD700');
    pointsGradient.addColorStop(1, '#E6BC00');
    
    ctx.fillStyle = pointsGradient;
    ctx.fill();
    
    // Add fine details with darker lines
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(154, 125, 10, 0.7)';
    ctx.lineWidth = 0.5;
    
    // Left point details
    ctx.moveTo(-crownWidth/3, -crownHeight/2);
    ctx.bezierCurveTo(
        -crownWidth/3.2, -crownHeight/2.5,
        -crownWidth/3.3, -crownHeight/3,
        -crownWidth/3.5, -crownHeight/3.5
    );
    
    // Middle point details
    ctx.moveTo(0, -crownHeight);
    ctx.bezierCurveTo(
        -crownWidth/30, -crownHeight * 0.8,
        crownWidth/30, -crownHeight * 0.8,
        0, -crownHeight * 0.6
    );
    
    // Right point details
    ctx.moveTo(crownWidth/3, -crownHeight/2);
    ctx.bezierCurveTo(
        crownWidth/3.2, -crownHeight/2.5,
        crownWidth/3.3, -crownHeight/3,
        crownWidth/3.5, -crownHeight/3.5
    );
    
    ctx.stroke();
    
    // Crown jewels with renaissance color palette and realistic shine
    // Red ruby jewel (center)
    const rubyGradient = ctx.createRadialGradient(
        0, -crownHeight * 0.6, 0,
        0, -crownHeight * 0.6, size * 0.2
    );
    rubyGradient.addColorStop(0, '#FF5252'); // Light center
    rubyGradient.addColorStop(0.5, '#B22222'); // Medium red
    rubyGradient.addColorStop(1, '#800000'); // Dark red edge
    
    ctx.fillStyle = rubyGradient;
    ctx.beginPath();
    ctx.arc(0, -crownHeight * 0.6, size * 0.16, 0, Math.PI * 2);
    ctx.fill();
    
    // Add shine to ruby
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.arc(
        -size * 0.05, 
        -crownHeight * 0.6 - size * 0.05, 
        size * 0.05, 
        0, Math.PI * 2
    );
    ctx.fill();
    
    // Blue sapphire (left)
    const sapphireGradient = ctx.createRadialGradient(
        -crownWidth/3, -crownHeight * 0.25, 0,
        -crownWidth/3, -crownHeight * 0.25, size * 0.12
    );
    sapphireGradient.addColorStop(0, '#6495ED'); // Light center
    sapphireGradient.addColorStop(0.6, '#0000CD'); // Medium blue
    sapphireGradient.addColorStop(1, '#000080'); // Dark blue edge
    
    ctx.fillStyle = sapphireGradient;
    ctx.beginPath();
    ctx.arc(-crownWidth/3, -crownHeight * 0.25, size * 0.11, 0, Math.PI * 2);
    ctx.fill();
    
    // Add shine to sapphire
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.arc(
        -crownWidth/3 - size * 0.04, 
        -crownHeight * 0.25 - size * 0.04, 
        size * 0.04, 
        0, Math.PI * 2
    );
    ctx.fill();
    
    // Green emerald (right)
    const emeraldGradient = ctx.createRadialGradient(
        crownWidth/3, -crownHeight * 0.25, 0,
        crownWidth/3, -crownHeight * 0.25, size * 0.12
    );
    emeraldGradient.addColorStop(0, '#00FF7F'); // Light center
    emeraldGradient.addColorStop(0.6, '#00A86B'); // Medium green
    emeraldGradient.addColorStop(1, '#006400'); // Dark green edge
    
    ctx.fillStyle = emeraldGradient;
    ctx.beginPath();
    ctx.arc(crownWidth/3, -crownHeight * 0.25, size * 0.11, 0, Math.PI * 2);
    ctx.fill();
    
    // Add shine to emerald
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.arc(
        crownWidth/3 - size * 0.04, 
        -crownHeight * 0.25 - size * 0.04, 
        size * 0.04, 
        0, Math.PI * 2
    );
    ctx.fill();
    
    // Add small diamond accents along the crown base
    const diamondCount = 5;
    const diamondSize = size * 0.05;
    
    for (let i = 1; i < diamondCount; i++) {
        const diamondX = -crownWidth/2 + (crownWidth * i / diamondCount);
        const diamondY = crownHeight * 0.2;
        
        // Diamond gradient
        const diamondGradient = ctx.createRadialGradient(
            diamondX, diamondY, 0,
            diamondX, diamondY, diamondSize
        );
        diamondGradient.addColorStop(0, 'white');
        diamondGradient.addColorStop(0.5, 'rgba(200, 200, 255, 0.8)');
        diamondGradient.addColorStop(1, 'rgba(150, 150, 220, 0.6)');
        
        ctx.fillStyle = diamondGradient;
        ctx.beginPath();
        ctx.arc(diamondX, diamondY, diamondSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add gold trim around the jewels
    ctx.strokeStyle = '#9A7D0A';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.arc(0, -crownHeight * 0.6, size * 0.17, 0, Math.PI * 2); // Ruby border
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(-crownWidth/3, -crownHeight * 0.25, size * 0.12, 0, Math.PI * 2); // Sapphire border
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(crownWidth/3, -crownHeight * 0.25, size * 0.12, 0, Math.PI * 2); // Emerald border
    ctx.stroke();
    
    ctx.restore();
}

// Draw player projectiles
function drawProjectiles(ctx, projectiles, playerId) {
    projectiles.forEach(projectile => {
        const isPlayerProjectile = projectile.playerId === playerId;
        
        // Add trailing particle effects
        if (Math.random() < 0.3) {
            const trailColor = isPlayerProjectile ? 
                projectile.playerColor || '#ffffff' :
                darkenColor(projectile.playerColor || '#ffffff', 20);
                
            createParticle(
                projectile.position.x - (projectile.velocity.x * 0.5), 
                projectile.position.y - (projectile.velocity.y * 0.5), 
                trailColor,
                projectile.size * 0.4,
                20
            );
        }
        
        // Save context for rotation
        ctx.save();
        
        // Move origin to projectile position
        ctx.translate(projectile.position.x, projectile.position.y);
        
        // Rotate based on projectile direction
        if (projectile.velocity) {
            const angle = Math.atan2(projectile.velocity.y, projectile.velocity.x);
            ctx.rotate(angle);
        }
        
        // Draw magical flame-like trail
        const trailLength = projectile.size * 5;
        const trailWidth = projectile.size * 2;
        
        // Create gradient for trail
        const trailGradient = ctx.createLinearGradient(0, 0, -trailLength, 0);
        
        // Gradient colors based on if it's the current player's projectile
        if (isPlayerProjectile) {
            // Player's own projectile - more vibrant trail with golden touches
            trailGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            trailGradient.addColorStop(0.2, `${projectile.playerColor}EE`);
            trailGradient.addColorStop(0.6, `${projectile.playerColor}99`);
            trailGradient.addColorStop(0.8, `${darkenColor(projectile.playerColor, 20)}50`);
            trailGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
            // Other player's projectile
            trailGradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
            trailGradient.addColorStop(0.3, `${projectile.playerColor}AA`);
            trailGradient.addColorStop(0.7, `${projectile.playerColor}55`);
            trailGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }
        
        // Draw flame-like trail using bezier curves
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-trailLength * 0.2, trailWidth * 0.5);
        ctx.bezierCurveTo(
            -trailLength * 0.5, trailWidth * 0.7,
            -trailLength * 0.7, trailWidth * 0.5,
            -trailLength, 0
        );
        ctx.bezierCurveTo(
            -trailLength * 0.7, -trailWidth * 0.5,
            -trailLength * 0.5, -trailWidth * 0.7,
            -trailLength * 0.2, -trailWidth * 0.5
        );
        ctx.closePath();
        
        ctx.fillStyle = trailGradient;
        ctx.fill();
        
        // Draw geometric projectile head - inspired by Renaissance sacred geometry
        // If current player's projectile, add pulsing effect
        const pulseEffect = isPlayerProjectile ? 
            Math.sin(Date.now() / 100) * 0.1 + 1 : 1;
            
        const size = projectile.size * pulseEffect;
        
        // Draw a diamond/rhombus shape for the projectile head
        ctx.beginPath();
        ctx.moveTo(size * 1.5, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.lineTo(0, -size);
        ctx.closePath();
        
        // Create gradient fill for projectile head
        const headGradient = ctx.createRadialGradient(
            0, 0, 0,
            0, 0, size * 1.5
        );
        
        headGradient.addColorStop(0, 'white');
        headGradient.addColorStop(0.5, projectile.playerColor || '#ffffff');
        headGradient.addColorStop(1, darkenColor(projectile.playerColor || '#ffffff', 20));
        
        ctx.fillStyle = headGradient;
        ctx.fill();
        
        // Add golden ratio spiral pattern to projectile (if player's)
        if (isPlayerProjectile) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)'; // Gold
            ctx.lineWidth = size * 0.15;
            
            // Draw a small golden spiral
            let a = 0;
            let b = 1;
            const goldenRatio = 1.618033988749895;
            
            ctx.moveTo(0, 0);
            for (let i = 0; i < 4; i++) {
                a = b * Math.cos(i * 0.5 * Math.PI);
                b = b / goldenRatio;
                ctx.lineTo(a * size * 0.4, b * size * 0.4);
            }
            
            ctx.stroke();
        }
        
        // Draw glow effect
        ctx.beginPath();
        const glowGradient = ctx.createRadialGradient(
            0, 0, 0,
            0, 0, size * 2
        );
        
        glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = glowGradient;
        ctx.arc(0, 0, size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Restore context
        ctx.restore();
    });
}

// Draw UI elements with Renaissance-inspired design elements
function drawUI(ctx, gameData, playerId, width, height) {
    // Draw mini-map
    drawMiniMap(ctx, gameData, playerId, width, height);
    
    // Draw score indicator
    if (gameData.players && gameData.players[playerId]) {
        const player = gameData.players[playerId];
        const progress = player.size / 100; // Assuming 100 is max size
        
        // Draw ornate progress frame with golden ratio proportions
        const barWidth = 240;
        const barHeight = 28;
        const barX = width/2 - barWidth/2;
        const barY = height - 35;
        
        // Draw decorative background with subtle texture
        ctx.fillStyle = 'rgba(14, 17, 40, 0.8)'; // Deep blue background
        
        // Draw rounded rectangle with subtle corner decorations
        ctx.beginPath();
        ctx.moveTo(barX + 10, barY);
        ctx.lineTo(barX + barWidth - 10, barY);
        ctx.quadraticCurveTo(barX + barWidth, barY, barX + barWidth, barY + 10);
        ctx.lineTo(barX + barWidth, barY + barHeight - 10);
        ctx.quadraticCurveTo(barX + barWidth, barY + barHeight, barX + barWidth - 10, barY + barHeight);
        ctx.lineTo(barX + 10, barY + barHeight);
        ctx.quadraticCurveTo(barX, barY + barHeight, barX, barY + barHeight - 10);
        ctx.lineTo(barX, barY + 10);
        ctx.quadraticCurveTo(barX, barY, barX + 10, barY);
        ctx.fill();
        
        // Add decorative golden corners (reminiscent of illuminated manuscripts)
        ctx.strokeStyle = 'rgba(218, 165, 32, 0.8)';
        ctx.lineWidth = 1.5;
        
        // Top-left corner flourish
        ctx.beginPath();
        ctx.moveTo(barX, barY + 10);
        ctx.quadraticCurveTo(barX - 5, barY + 5, barX - 8, barY);
        ctx.stroke();
        
        // Top-right corner flourish
        ctx.beginPath();
        ctx.moveTo(barX + barWidth, barY + 10);
        ctx.quadraticCurveTo(barX + barWidth + 5, barY + 5, barX + barWidth + 8, barY);
        ctx.stroke();
        
        // Bottom-left corner flourish
        ctx.beginPath();
        ctx.moveTo(barX, barY + barHeight - 10);
        ctx.quadraticCurveTo(barX - 5, barY + barHeight - 5, barX - 8, barY + barHeight);
        ctx.stroke();
        
        // Bottom-right corner flourish
        ctx.beginPath();
        ctx.moveTo(barX + barWidth, barY + barHeight - 10);
        ctx.quadraticCurveTo(barX + barWidth + 5, barY + barHeight - 5, barX + barWidth + 8, barY + barHeight);
        ctx.stroke();
        
        // Progress fill with gradient inspired by Renaissance paintings
        const progressGradient = ctx.createLinearGradient(
            barX + 4, barY + 4,
            barX + 4 + (barWidth - 8) * progress, barY + barHeight - 8
        );
        
        // Use player's color but with Renaissance-inspired gradient
        const baseColor = player.color;
        progressGradient.addColorStop(0, lightenColor(baseColor, 30)); // Lighter shade
        progressGradient.addColorStop(0.5, baseColor); // Original color
        progressGradient.addColorStop(1, darkenColor(baseColor, 20)); // Darker shade
        
        // Fill progress bar with rounded corners
        ctx.fillStyle = progressGradient;
        
        // Draw rounded progress fill
        const fillWidth = Math.max(8, (barWidth - 8) * progress); // Ensure minimum width for small values
        
        ctx.beginPath();
        ctx.moveTo(barX + 4, barY + 4 + 4);
        ctx.lineTo(barX + 4 + fillWidth - 4, barY + 4 + 4);
        ctx.quadraticCurveTo(barX + 4 + fillWidth, barY + 4 + 4, barX + 4 + fillWidth, barY + 4 + 8);
        ctx.lineTo(barX + 4 + fillWidth, barY + 4 + (barHeight - 8) - 4);
        ctx.quadraticCurveTo(barX + 4 + fillWidth, barY + 4 + (barHeight - 8), barX + 4 + fillWidth - 4, barY + 4 + (barHeight - 8));
        ctx.lineTo(barX + 4 + 4, barY + 4 + (barHeight - 8));
        ctx.quadraticCurveTo(barX + 4, barY + 4 + (barHeight - 8), barX + 4, barY + 4 + (barHeight - 8) - 4);
        ctx.lineTo(barX + 4, barY + 4 + 8);
        ctx.quadraticCurveTo(barX + 4, barY + 4 + 4, barX + 4 + 4, barY + 4 + 4);
        ctx.fill();
        
        // Add subtle inner stroke
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw ornate border
        ctx.strokeStyle = 'rgba(218, 165, 32, 0.7)'; // Gold color
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(barX + 2, barY + 2, barWidth - 4, barHeight - 4);
        ctx.stroke();
        
        // Add decorative line pattern
        ctx.strokeStyle = 'rgba(218, 165, 32, 0.3)';
        ctx.lineWidth = 1;
        
        // Vertical decorative lines
        const lineCount = 8;
        for (let i = 1; i < lineCount; i++) {
            const lineX = barX + (barWidth * i / lineCount);
            ctx.beginPath();
            ctx.moveTo(lineX, barY + 4);
            ctx.lineTo(lineX, barY + barHeight - 4);
            ctx.stroke();
        }
        
        // Use Renaissance-inspired font style
        ctx.font = '14px "Press Start 2P", cursive';
        ctx.fillStyle = '#F0E6D2'; // Warm parchment color
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.floor(player.size)} / 100`, width/2, barY + barHeight / 2 + 5);
        
        // Draw golden ratio spiral icon at the start of the bar
        ctx.save();
        ctx.translate(barX - 15, barY + barHeight/2);
        
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(218, 165, 32, 0.8)';
        ctx.lineWidth = 1.5;
        
        // Draw golden spiral
        let a = 0;
        let b = 8;
        const goldenRatio = 1.618033988749895;
        
        ctx.moveTo(0, 0);
        for (let i = 0; i < 6; i++) {
            const angle = i * 0.5 * Math.PI;
            a = b * Math.cos(angle);
            b = b / goldenRatio;
            ctx.lineTo(a, b);
        }
        
        ctx.stroke();
        ctx.restore();
        
        // Draw shoot cooldown indicator if recently shot
        const now = Date.now();
        if (window.lastShootTime && now - window.lastShootTime < 2000) {
            const cooldownProgress = Math.min(1, (now - window.lastShootTime) / 2000);
            
            // Draw an ornate cooldown indicator
            const cdBarWidth = 220;
            const cdBarHeight = 14;
            const cdBarX = width/2 - cdBarWidth/2;
            const cdBarY = height - 65;
            
            // Draw decorative background
            ctx.fillStyle = 'rgba(14, 17, 40, 0.7)';
            ctx.beginPath();
            ctx.roundRect(cdBarX, cdBarY, cdBarWidth, cdBarHeight, 4);
            ctx.fill();
            
            // Fill based on cooldown
            const cooldownColor = cooldownProgress >= 1 ? 
                'rgba(0, 168, 107, 0.8)' : // Renaissance viridian green
                'rgba(178, 34, 34, 0.8)';  // Venetian red
                
            // Create gradient
            const cdGradient = ctx.createLinearGradient(
                cdBarX, cdBarY,
                cdBarX + cdBarWidth * cooldownProgress, cdBarY
            );
            
            cdGradient.addColorStop(0, lightenColor(cooldownColor, 30));
            cdGradient.addColorStop(1, cooldownColor);
            
            ctx.fillStyle = cdGradient;
            ctx.beginPath();
            ctx.roundRect(
                cdBarX + 2, 
                cdBarY + 2, 
                Math.max(4, (cdBarWidth - 4) * cooldownProgress), 
                cdBarHeight - 4, 
                3
            );
            ctx.fill();
            
            // Border
            ctx.strokeStyle = cooldownProgress >= 1 ? 
                'rgba(0, 168, 107, 0.9)' : 
                'rgba(178, 34, 34, 0.9)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(cdBarX, cdBarY, cdBarWidth, cdBarHeight, 4);
            ctx.stroke();
            
            // Add decorative elements at the ends of the bar
            if (cooldownProgress >= 1) {
                // Add small decorative flourishes for ready state
                ctx.strokeStyle = 'rgba(218, 165, 32, 0.8)';
                ctx.lineWidth = 1;
                
                // Left flourish
                ctx.beginPath();
                ctx.moveTo(cdBarX - 10, cdBarY + cdBarHeight/2);
                ctx.lineTo(cdBarX - 5, cdBarY + cdBarHeight/2);
                ctx.stroke();
                
                // Right flourish
                ctx.beginPath();
                ctx.moveTo(cdBarX + cdBarWidth + 5, cdBarY + cdBarHeight/2);
                ctx.lineTo(cdBarX + cdBarWidth + 10, cdBarY + cdBarHeight/2);
                ctx.stroke();
            }
            
            // Text with illuminated manuscript style
            ctx.font = '10px "Press Start 2P", cursive';
            ctx.textAlign = 'center';
            
            // Set text color based on state
            ctx.fillStyle = cooldownProgress >= 1 ? '#F0E6D2' : 'rgba(240, 230, 210, 0.8)';
            
            if (cooldownProgress < 1) {
                ctx.fillText('PREPARING SPELL', width/2, cdBarY - 5);
            } else {
                ctx.fillText('SPELL READY', width/2, cdBarY - 5);
            }
        }
    }
}

// Draw mini-map in corner with Renaissance-style design
function drawMiniMap(ctx, gameData, playerId, width, height) {
    const mapSize = 160;
    const margin = 20;
    const mapX = width - mapSize - margin;
    const mapY = height - mapSize - margin;
    
    // Draw an ornate frame with rounded corners
    // Create a decorative background with Renaissance-inspired elements
    const frameWidth = mapSize + 12;
    const frameHeight = mapSize + 12;
    const frameX = mapX - 6;
    const frameY = mapY - 6;
    
    // Draw ornate background frame
    ctx.beginPath();
    ctx.fillStyle = 'rgba(14, 17, 40, 0.8)';
    ctx.roundRect(frameX, frameY, frameWidth, frameHeight, 8);
    ctx.fill();
    
    // Add decorative border inspired by Renaissance manuscript illuminations
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(218, 165, 32, 0.7)'; // Gold
    ctx.lineWidth = 2;
    ctx.roundRect(frameX + 2, frameY + 2, frameWidth - 4, frameHeight - 4, 6);
    ctx.stroke();
    
    // Draw map background with subtle texture
    // Create a gradient background reminiscent of aged parchment maps
    const mapGradient = ctx.createRadialGradient(
        mapX + mapSize/2, mapY + mapSize/2, 0,
        mapX + mapSize/2, mapY + mapSize/2, mapSize
    );
    
    mapGradient.addColorStop(0, 'rgba(26, 35, 126, 0.7)'); // Center - richer blue
    mapGradient.addColorStop(0.7, 'rgba(21, 27, 84, 0.7)'); // Middle - deep blue
    mapGradient.addColorStop(1, 'rgba(10, 12, 37, 0.7)'); // Edge - dark blue
    
    ctx.fillStyle = mapGradient;
    ctx.fillRect(mapX, mapY, mapSize, mapSize);
    
    // Add subtle grid lines reminiscent of Renaissance cartography
    ctx.strokeStyle = 'rgba(218, 165, 32, 0.15)'; // Gold
    ctx.lineWidth = 0.5;
    
    // Grid lines
    const gridSpacing = mapSize / 8;
    
    // Vertical grid lines
    for (let i = 1; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(mapX + gridSpacing * i, mapY);
        ctx.lineTo(mapX + gridSpacing * i, mapY + mapSize);
        ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = 1; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(mapX, mapY + gridSpacing * i);
        ctx.lineTo(mapX + mapSize, mapY + gridSpacing * i);
        ctx.stroke();
    }
    
    // Draw decorative compass rose in bottom right corner
    const compassSize = 20;
    const compassX = mapX + mapSize - compassSize - 5;
    const compassY = mapY + mapSize - compassSize - 5;
    
    ctx.save();
    ctx.translate(compassX, compassY);
    
    // Draw compass circle
    ctx.beginPath();
    ctx.fillStyle = 'rgba(218, 165, 32, 0.2)';
    ctx.arc(0, 0, compassSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw compass points
    ctx.strokeStyle = 'rgba(218, 165, 32, 0.6)';
    ctx.lineWidth = 1;
    
    // North-South line
    ctx.beginPath();
    ctx.moveTo(0, -compassSize * 0.8);
    ctx.lineTo(0, compassSize * 0.8);
    ctx.stroke();
    
    // East-West line
    ctx.beginPath();
    ctx.moveTo(-compassSize * 0.8, 0);
    ctx.lineTo(compassSize * 0.8, 0);
    ctx.stroke();
    
    // Diagonal lines
    ctx.beginPath();
    ctx.moveTo(-compassSize * 0.6, -compassSize * 0.6);
    ctx.lineTo(compassSize * 0.6, compassSize * 0.6);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(-compassSize * 0.6, compassSize * 0.6);
    ctx.lineTo(compassSize * 0.6, -compassSize * 0.6);
    ctx.stroke();
    
    // North pointer
    ctx.beginPath();
    ctx.fillStyle = 'rgba(218, 165, 32, 0.9)';
    ctx.moveTo(0, -compassSize * 0.8);
    ctx.lineTo(-compassSize * 0.2, -compassSize * 0.5);
    ctx.lineTo(0, -compassSize * 0.6);
    ctx.lineTo(compassSize * 0.2, -compassSize * 0.5);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    
    // Draw "MAPPA MUNDI" in Renaissance-style text at the top
    ctx.font = 'italic 8px serif';
    ctx.fillStyle = 'rgba(218, 165, 32, 0.8)';
    ctx.textAlign = 'center';
    ctx.fillText('MAPPA MUNDI', mapX + mapSize/2, mapY - 8);
    
    // Scale factor
    const scale = mapSize / MAP_WIDTH;
    
    // Draw all players on mini-map
    if (gameData.players) {
        Object.values(gameData.players).forEach(player => {
            // Calculate position on mini-map
            const miniX = mapX + player.position.x * scale;
            const miniY = mapY + player.position.y * scale;
            
            // For victorious players, draw a special icon reminiscent of Renaissance royal symbols
            if (player.victorious) {
                // Draw star symbol for victorious player
                ctx.save();
                ctx.translate(miniX, miniY);
                
                // Draw ornate star
                const starSize = Math.max(3, player.size * scale * 0.6);
                const spikes = 5;
                
                ctx.beginPath();
                for (let i = 0; i < spikes * 2; i++) {
                    const radius = i % 2 === 0 ? starSize : starSize * 0.5;
                    const angle = (Math.PI * 2 * i) / (spikes * 2) - Math.PI / 2;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                
                ctx.fillStyle = 'rgba(218, 165, 32, 0.9)'; // Gold for victorious players
                ctx.fill();
                
                ctx.restore();
            } else {
                // Draw player dot with a more ornate style
                ctx.beginPath();
                
                // Create a gradient for the dot
                const dotGradient = ctx.createRadialGradient(
                    miniX, miniY, 0,
                    miniX, miniY, Math.max(3, player.size * scale * 0.6)
                );
                
                if (player.id === playerId) {
                    // Current player gets a white dot with gold edge
                    dotGradient.addColorStop(0, 'white');
                    dotGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.7)');
                    dotGradient.addColorStop(1, 'rgba(218, 165, 32, 0.7)');
                } else {
                    // Other players get colored dots with darker edges
                    dotGradient.addColorStop(0, player.color);
                    dotGradient.addColorStop(0.7, player.color);
                    dotGradient.addColorStop(1, darkenColor(player.color, 30));
                }
                
                ctx.fillStyle = dotGradient;
                ctx.arc(miniX, miniY, Math.max(3, player.size * scale * 0.6), 0, Math.PI * 2);
                ctx.fill();
                
                // Add a small highlight to create a 3D effect
                if (player.size * scale > 3) {
                    ctx.beginPath();
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.arc(
                        miniX - Math.max(1, player.size * scale * 0.2), 
                        miniY - Math.max(1, player.size * scale * 0.2), 
                        Math.max(1, player.size * scale * 0.2), 
                        0, Math.PI * 2
                    );
                    ctx.fill();
                }
            }
        });
    }
    
    // Draw special orbs as small gems on the map
    if (gameData.orbs) {
        gameData.orbs.forEach(orb => {
            if (orb.isSpecial) {
                const orbX = mapX + orb.position.x * scale;
                const orbY = mapY + orb.position.y * scale;
                
                // Draw special orb as a sparkling gem
                ctx.beginPath();
                ctx.fillStyle = 'rgba(218, 165, 32, 0.8)'; // Gold
                
                // Diamond shape
                ctx.moveTo(orbX, orbY - 3);
                ctx.lineTo(orbX + 2, orbY);
                ctx.lineTo(orbX, orbY + 3);
                ctx.lineTo(orbX - 2, orbY);
                ctx.closePath();
                
                ctx.fill();
                
                // Add sparkle
                ctx.beginPath();
                ctx.fillStyle = 'white';
                ctx.arc(orbX - 0.5, orbY - 0.5, 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
    
    // Draw current viewport with a more ornate frame reminiscent of Renaissance map viewports
    const viewportWidth = (width / cameraZoom) * scale;
    const viewportHeight = (height / cameraZoom) * scale;
    const viewportX = mapX + cameraX * scale - viewportWidth/2;
    const viewportY = mapY + cameraY * scale - viewportHeight/2;
    
    // Draw viewport frame with double-line style common in Renaissance maps
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);
    
    // Add inner stroke for decorative effect
    ctx.strokeStyle = 'rgba(218, 165, 32, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(viewportX + 2, viewportY + 2, viewportWidth - 4, viewportHeight - 4);
    
    // Add small corner decorations
    const cornerSize = 3;
    ctx.fillStyle = 'rgba(218, 165, 32, 0.8)';
    
    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(viewportX, viewportY);
    ctx.lineTo(viewportX + cornerSize * 2, viewportY);
    ctx.lineTo(viewportX, viewportY + cornerSize * 2);
    ctx.closePath();
    ctx.fill();
    
    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(viewportX + viewportWidth, viewportY);
    ctx.lineTo(viewportX + viewportWidth - cornerSize * 2, viewportY);
    ctx.lineTo(viewportX + viewportWidth, viewportY + cornerSize * 2);
    ctx.closePath();
    ctx.fill();
    
    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(viewportX, viewportY + viewportHeight);
    ctx.lineTo(viewportX + cornerSize * 2, viewportY + viewportHeight);
    ctx.lineTo(viewportX, viewportY + viewportHeight - cornerSize * 2);
    ctx.closePath();
    ctx.fill();
    
    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(viewportX + viewportWidth, viewportY + viewportHeight);
    ctx.lineTo(viewportX + viewportWidth - cornerSize * 2, viewportY + viewportHeight);
    ctx.lineTo(viewportX + viewportWidth, viewportY + viewportHeight - cornerSize * 2);
    ctx.closePath();
    ctx.fill();
}

function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (
        0x1000000 + 
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + 
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 + 
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
}

function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    
    return '#' + (
        0x1000000 + 
        (R > 0 ? R : 0) * 0x10000 + 
        (G > 0 ? G : 0) * 0x100 + 
        (B > 0 ? B : 0)
    ).toString(16).slice(1);
}

function detectOrbCollections(orbs) {
    // Create a set of current orb IDs
    const currentOrbIds = new Set(orbs.map(orb => orb.id));
    
    // Check for missing orbs (collected)
    for (const id in lastOrbPositions) {
        if (!currentOrbIds.has(id)) {
            // This orb was collected, create particle effect
            const pos = lastOrbPositions[id];
            createOrbCollectEffect(pos.x, pos.y, pos.isSpecial);
            delete lastOrbPositions[id];
        }
    }
    
    // Update last positions
    orbs.forEach(orb => {
        lastOrbPositions[orb.id] = { 
            x: orb.position.x, 
            y: orb.position.y,
            isSpecial: orb.isSpecial 
        };
    });
}

function updateLeaderboard(players) {
    const leaderboardList = document.getElementById('leaderboardList');
    
    // Sort players by size (larger first)
    const sortedPlayers = Object.values(players).sort((a, b) => b.size - a.size);
    
    // Create HTML
    let html = '';
    sortedPlayers.slice(0, 10).forEach((player, index) => {
        html += `
            <div class="leaderboardItem">
                <span class="leaderboardName" style="color: ${player.color}">${index + 1}. ${player.name || 'Wizard ' + player.id.slice(-4)}</span>
                <span class="leaderboardScore">${Math.floor(player.size)}</span>
            </div>
        `;
    });
    
    leaderboardList.innerHTML = html;
}

// Export functions as ES modules
export { 
    initRenderer, 
    render, 
    createOrbCollectEffect, 
    createVictoryEffect, 
    updateLeaderboard 
};
```

## File: WizardArena/server/chatManager.js

```
// Manage chat and notifications
const WebSocket = require('ws');
const { players } = require('./playerManager');

// Store chat history to send to new players
const chatHistory = [];
const MAX_CHAT_HISTORY = 50;

function sendToAll(message) {
    const messageObj = {
        type: 'chat',
        ...message
    };
    
    // Add message to history
    chatHistory.push(messageObj);
    
    // Trim history if needed
    if (chatHistory.length > MAX_CHAT_HISTORY) {
        chatHistory.shift();
    }
    
    // Broadcast to all connected clients
    for (const playerId in players) {
        const player = players[playerId];
        if (player.ws && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(messageObj));
        }
    }
}

function sendChatHistoryToPlayer(ws) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'chatHistory',
            messages: chatHistory
        }));
    }
}

function handleChatMessage(playerId, message) {
    const player = players[playerId];
    if (!player || !player.name) return;
    
    sendToAll({
        sender: player.name,
        text: message,
        color: player.color,
        timestamp: Date.now()
    });
}

function broadcastSystemMessage(text) {
    sendToAll({
        sender: 'System',
        text,
        color: '#9b59b6', // Purple for system messages
        timestamp: Date.now(),
        isSystem: true
    });
}

function handleNameSet(playerId, name) {
    const player = players[playerId];
    if (!player) return;
    
    // Announce the player's arrival
    broadcastSystemMessage(`${name} has entered the Wizard Arena`);
}

module.exports = {
    handleChatMessage,
    broadcastSystemMessage,
    handleNameSet,
    sendChatHistoryToPlayer
}; 
```

## File: WizardArena/server/errorLogger.js

```
/**
 * Server-side Error Logger
 * Receives and logs client-side errors
 */

// Use in-memory logging if file system is not available
// This allows the game to work without needing file system access
const fs = {
    existsSync: () => false,
    mkdirSync: () => {},
    appendFileSync: () => {},
    statSync: () => ({ size: 0 }),
    renameSync: () => {},
    readFileSync: () => ''
};
const path = {
    join: (...args) => args.join('/'),
};

class ErrorLogger {
    constructor(options = {}) {
        this.options = {
            logDir: path.join(__dirname, '../logs'),
            errorLogFile: 'client-errors.log',
            consoleLogFile: 'client-console.log',
            maxLogSize: 10 * 1024 * 1024, // 10MB
            ...options
        };
        
        this.ensureLogDirectory();
    }
    
    ensureLogDirectory() {
        if (!fs.existsSync(this.options.logDir)) {
            fs.mkdirSync(this.options.logDir, { recursive: true });
        }
    }
    
    handleClientError(errorData, clientInfo) {
        // Add client info to error data
        const enrichedData = {
            ...errorData,
            clientInfo,
            serverTimestamp: new Date().toISOString()
        };
        
        // Log to file
        this.appendToLog(
            path.join(this.options.logDir, this.options.errorLogFile),
            JSON.stringify(enrichedData) + '\n'
        );
        
        // Also log to console for immediate visibility
        console.error(`CLIENT ERROR [${enrichedData.clientInfo.ip}]: ${enrichedData.data.type} - ${enrichedData.data.message}`);
        
        return true;
    }
    
    handleClientLog(logData, clientInfo) {
        // Add client info to log data
        const enrichedData = {
            ...logData,
            clientInfo,
            serverTimestamp: new Date().toISOString()
        };
        
        // Log to file
        this.appendToLog(
            path.join(this.options.logDir, this.options.consoleLogFile),
            JSON.stringify(enrichedData) + '\n'
        );
        
        // Also log to console for important logs
        if (logData.data.type === 'console_error' || logData.data.type === 'console_warn') {
            console.log(`CLIENT ${logData.data.type.toUpperCase()} [${clientInfo.ip}]: ${logData.data.message}`);
        }
        
        return true;
    }
    
    appendToLog(logFile, data) {
        try {
            // Check file size and rotate if needed
            this.rotateLogIfNeeded(logFile);
            
            // Append to log
            fs.appendFileSync(logFile, data, 'utf8');
        } catch (err) {
            console.error('Error writing to log file:', err);
        }
    }
    
    rotateLogIfNeeded(logFile) {
        try {
            if (fs.existsSync(logFile)) {
                const stats = fs.statSync(logFile);
                
                if (stats.size >= this.options.maxLogSize) {
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const rotatedFile = `${logFile}.${timestamp}`;
                    fs.renameSync(logFile, rotatedFile);
                }
            }
        } catch (err) {
            console.error('Error rotating log file:', err);
        }
    }
    
    // Get the logs to display in an admin panel
    getClientErrorLogs(limit = 100) {
        return this.getLogEntries(path.join(this.options.logDir, this.options.errorLogFile), limit);
    }
    
    getClientConsoleLogs(limit = 100) {
        return this.getLogEntries(path.join(this.options.logDir, this.options.consoleLogFile), limit);
    }
    
    getLogEntries(logFile, limit) {
        try {
            if (!fs.existsSync(logFile)) {
                return [];
            }
            
            // Read the last 'limit' lines from the log file
            const data = fs.readFileSync(logFile, 'utf8');
            const lines = data.split('\n').filter(line => line.trim() !== '');
            
            // Parse each line as JSON
            return lines.slice(-limit).map(line => {
                try {
                    return JSON.parse(line);
                } catch (e) {
                    return { error: 'Invalid log entry', raw: line };
                }
            });
        } catch (err) {
            console.error('Error reading log file:', err);
            return [];
        }
    }
}

// Export as singleton
const errorLogger = new ErrorLogger();
module.exports = errorLogger; 
```

## File: WizardArena/server/gameManager.js

```
// Manages game state
const { players, increasePlayerScore, getPlayersForBroadcast, removePlayer } = require('./playerManager');
const chatManager = require('./chatManager');
const orbs = [];
const MAP_WIDTH = 5000;  // Much larger map
const MAP_HEIGHT = 5000; // Much larger map
const ORB_COUNT = 300;   // More orbs
const ORB_POINTS = 10;
const VICTORY_SIZE = 100; // Size at which player wins
const SPECIAL_ORB_CHANCE = 0.1; // 10% chance for special orbs

// Initialize orbs
function initOrbs() {
    for (let i = 0; i < ORB_COUNT; i++) {
        addOrb();
    }
}

function addOrb() {
    // Special orbs are larger, worth more points, and have special colors
    const isSpecial = Math.random() < SPECIAL_ORB_CHANCE;
    
    const orb = {
        id: Date.now().toString() + Math.random().toString().slice(2, 8),
        position: {
            x: Math.random() * MAP_WIDTH,
            y: Math.random() * MAP_HEIGHT
        },
        // Magic-themed orb colors with special colors
        color: isSpecial ? 
            ['#ff1493', '#00ffff', '#7fff00', '#ff00ff'][Math.floor(Math.random() * 4)] : // Special orb colors
            ['#f39c12', '#f1c40f', '#e67e22', '#d35400'][Math.floor(Math.random() * 4)],  // Regular orb colors
        size: isSpecial ? 10 : 5,
        points: isSpecial ? 50 : 10,
        isSpecial: isSpecial
    };
    orbs.push(orb);
    return orb;
}

function removeOrb(index) {
    orbs.splice(index, 1);
}

// Add a custom orb to the game (for player fragments)
function addCustomOrb(orb) {
    orbs.push(orb);
}

// Update game state
function update() {
    // Update projectiles first
    if (require('./playerManager').updateProjectiles) {
        require('./playerManager').updateProjectiles();
    }
    
    checkCollisions();
    checkVictoryConditions();
    checkPlayerVsPlayer();
    
    // Ensure we always have ORB_COUNT orbs
    while (orbs.length < ORB_COUNT) {
        addOrb();
    }
    
    return {
        players: getPlayersForBroadcast(),
        orbs,
        projectiles: require('./playerManager').projectiles || [],
        mapWidth: MAP_WIDTH,
        mapHeight: MAP_HEIGHT
    };
}

// Check for collisions between players and orbs
function checkCollisions() {
    // Check player-orb collisions
    for (const playerId in players) {
        const player = players[playerId];
        
        for (let i = orbs.length - 1; i >= 0; i--) {
            const orb = orbs[i];
            const dx = player.position.x - orb.position.x;
            const dy = player.position.y - orb.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If player collides with orb
            if (distance < player.size + orb.size) {
                // Increase player size and score based on orb value
                increasePlayerScore(playerId, orb.points || ORB_POINTS);
                
                // Special orbs give bigger size boost and speed boost
                if (orb.isSpecial) {
                    player.size += 2;
                    
                    // Set a simpler speed boost without timeout
                    player.speedBoost = 2.0; // Double speed
                    
                    // Broadcast a notification to all players
                    if (player.name && player.ws) {
                        broadcastSystemMessage(`${player.name} got a speed boost!`);
                    }
                    
                } else {
                    // Regular orbs
                    player.size += 0.5;
                }
                
                // Remove the orb and add a new one
                removeOrb(i);
                addOrb();
                
                // Broadcast a special event for the frontend to show effects
                if (player.ws) {
                    player.ws.send(JSON.stringify({
                        type: 'collectOrb',
                        position: orb.position,
                        color: orb.color,
                        isSpecial: orb.isSpecial
                    }));
                }
            }
        }
    }
}

// Check player vs player collisions for absorption
function checkPlayerVsPlayer() {
    const playerIds = Object.keys(players);
    
    for (let i = 0; i < playerIds.length; i++) {
        const p1 = players[playerIds[i]];
        if (!p1) continue;
        
        for (let j = i + 1; j < playerIds.length; j++) {
            const p2 = players[playerIds[j]];
            if (!p2) continue;
            
            const dx = p1.position.x - p2.position.x;
            const dy = p1.position.y - p2.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If players collide and one is 30% larger than the other
            if (distance < Math.max(p1.size, p2.size)) {
                if (p1.size > p2.size * 1.3) {
                    // P1 absorbs P2
                    p1.size += p2.size * 0.5;
                    p1.score += Math.floor(p2.score * 0.5);
                    
                    // Notify p2 that they were absorbed
                    if (p2.ws) {
                        p2.ws.send(JSON.stringify({
                            type: 'absorbed',
                            by: p1.name || 'Another wizard'
                        }));
                    }
                    
                    // Remove absorbed player
                    removePlayer(playerIds[j]);
                    
                } else if (p2.size > p1.size * 1.3) {
                    // P2 absorbs P1
                    p2.size += p1.size * 0.5;
                    p2.score += Math.floor(p1.score * 0.5);
                    
                    // Notify p1 that they were absorbed
                    if (p1.ws) {
                        p1.ws.send(JSON.stringify({
                            type: 'absorbed',
                            by: p2.name || 'Another wizard'
                        }));
                    }
                    
                    // Remove absorbed player
                    removePlayer(playerIds[i]);
                    break; // Break since p1 no longer exists
                }
            }
        }
    }
}

// Check if any player has reached victory size
function checkVictoryConditions() {
    for (const playerId in players) {
        const player = players[playerId];
        
        if (player.size >= VICTORY_SIZE) {
            // Broadcast victory message
            broadcastSystemMessage(`${player.name || 'A wizard'} has won the battle!`);
            
            // Reset all players
            resetAllPlayers();
            
            // Give the winner a victory crown
            if (player.ws) {
                player.victorious = true;
                player.ws.send(JSON.stringify({
                    type: 'victory'
                }));
            }
            
            break;
        }
    }
}

// Reset all players after a victory
function resetAllPlayers() {
    for (const playerId in players) {
        const player = players[playerId];
        
        // Reset player size and score
        player.size = 10;
        player.score = 0;
        
        // Keep player name and color, but move to a random position
        player.position = {
            x: Math.random() * MAP_WIDTH,
            y: Math.random() * MAP_HEIGHT
        };
        
        // Notify client of reset
        if (player.ws) {
            player.ws.send(JSON.stringify({
                type: 'gameReset'
            }));
        }
    }
}

// Broadcast system message to all players
function broadcastSystemMessage(message) {
    for (const playerId in players) {
        const player = players[playerId];
        if (player.ws) {
            player.ws.send(JSON.stringify({
                type: 'systemMessage',
                message: message
            }));
        }
    }
}

module.exports = {
    initOrbs,
    update,
    addCustomOrb,
    MAP_WIDTH,
    MAP_HEIGHT,
    VICTORY_SIZE,
    broadcastSystemMessage
}; 
```

## File: WizardArena/server/orbManager.js

```
// Handles orb spawning and collision detection
const players = require('./playerManager').players;
const orbs = [];

function spawnOrbs() {
    if (orbs.length < 50) {
        const orb = {
            id: Date.now().toString() + Math.random(),
            position: { x: Math.random() * 800, y: Math.random() * 600 }
        };
        orbs.push(orb);
    }
}

function checkCollisions() {
    for (let id in players) {
        const player = players[id];
        for (let i = orbs.length - 1; i >= 0; i--) {
            const orb = orbs[i];
            const dx = player.position.x - orb.position.x;
            const dy = player.position.y - orb.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < player.size + 5) {
                player.size += 1; // Grow when collecting an orb
                orbs.splice(i, 1); // Remove collected orb
            }
        }
    }

    // Player vs Player collision (basic elimination)
    const playerIds = Object.keys(players);
    for (let i = 0; i < playerIds.length; i++) {
        for (let j = i + 1; j < playerIds.length; j++) {
            const p1 = players[playerIds[i]];
            const p2 = players[playerIds[j]];
            const dx = p1.position.x - p2.position.x;
            const dy = p1.position.y - p2.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < p1.size + p2.size) {
                if (p1.size > p2.size + 2) {
                    p1.size += p2.size / 2;
                    delete players[p2.id];
                } else if (p2.size > p1.size + 2) {
                    p2.size += p1.size / 2;
                    delete players[p1.id];
                }
            }
        }
    }
}

module.exports = { spawnOrbs, checkCollisions, orbs }; 
```

## File: WizardArena/server/playerManager.js

```
// Manages player lifecycle and input
const players = {};

// Vibrant predefined colors for wizards
const wizardColors = [
    '#3498db', // Blue
    '#2ecc71', // Green
    '#e74c3c', // Red
    '#9b59b6', // Purple
    '#f1c40f', // Yellow
    '#1abc9c', // Turquoise
    '#d35400', // Orange
    '#34495e', // Navy
    '#16a085', // Green-Blue
    '#c0392b', // Dark Red
    '#8e44ad', // Violet
    '#27ae60', // Emerald
    '#e67e22', // Carrot Orange
    '#2980b9'  // Blue-Purple
];

function addPlayer(ws) {
    const id = Date.now().toString();
    
    // Assign a random color from our predefined wizard colors
    const randomColor = wizardColors[Math.floor(Math.random() * wizardColors.length)];
    
    // Place player at a random position on the map
    const mapWidth = 5000;  // Should match gameManager.MAP_WIDTH
    const mapHeight = 5000; // Should match gameManager.MAP_HEIGHT
    
    players[id] = {
        id,
        name: null, // Will be set when they provide a name
        position: { 
            x: Math.random() * (mapWidth - 200) + 100, 
            y: Math.random() * (mapHeight - 200) + 100 
        },
        size: 10,
        color: randomColor,
        score: 0,
        speedBoost: 1.0, // Normal speed multiplier (1 = normal)
        createdAt: Date.now(),
        ws: ws // Store WebSocket connection
    };
    ws.send(JSON.stringify({ type: 'init', id }));
    return id;
}

function removePlayer(id) {
    delete players[id];
}

function handlePlayerInput(id, position) {
    if (players[id]) {
        players[id].position = position;
    }
}

// Handle directional input with speed
function handlePlayerDirection(id, dirX, dirY, speed) {
    if (players[id]) {
        const player = players[id];
        
        // Validate inputs
        if (typeof dirX !== 'number' || typeof dirY !== 'number') return;
        if (typeof speed !== 'number' || isNaN(speed)) speed = 2.0;
        
        // Initialize speedBoost if missing (default 1.0 = no boost)
        if (!player.speedBoost) player.speedBoost = 1.0;
        
        // Apply the player's speed boost from the server side
        const boostedSpeed = speed * player.speedBoost;
        
        // Calculate new position based on direction and speed
        const newX = player.position.x + dirX * boostedSpeed;
        const newY = player.position.y + dirY * boostedSpeed;
        
        // Update the position
        player.position = { x: newX, y: newY };
        
        // Ensure player stays within map bounds (using constants from gameManager)
        const mapWidth = 5000;  // Should match gameManager.MAP_WIDTH
        const mapHeight = 5000; // Should match gameManager.MAP_HEIGHT
        
        player.position.x = Math.max(player.size, Math.min(mapWidth - player.size, player.position.x));
        player.position.y = Math.max(player.size, Math.min(mapHeight - player.size, player.position.y));
    }
}

function updatePlayerName(id, name) {
    if (players[id]) {
        players[id].name = name;
    }
}

function increasePlayerScore(id, amount) {
    if (players[id]) {
        players[id].score = (players[id].score || 0) + amount;
    }
}

// Export a clean version of players for broadcasting (without WS connection)
function getPlayersForBroadcast() {
    const broadcastPlayers = {};
    
    for (const id in players) {
        // Clone the player object without the ws property
        const { ws, ...cleanPlayer } = players[id];
        broadcastPlayers[id] = cleanPlayer;
    }
    
    return broadcastPlayers;
}

// Store active projectiles
const projectiles = [];

// Handle player shooting projectiles
function handlePlayerShoot(id, dirX, dirY) {
    const player = players[id];
    if (!player) return;
    
    // Validate inputs
    if (typeof dirX !== 'number' || typeof dirY !== 'number') return;
    
    // Minimum size check - can't shoot if too small
    if (player.size < 15) return;
    
    // Calculate projectile size and speed
    const projectileSize = player.size / 5;  // 20% of player size
    const projectileSpeed = 12;  // Fast projectile
    
    // Reduce player size when shooting
    player.size -= projectileSize / 2;
    
    // Create projectile with unique ID
    const projectile = {
        id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        playerId: id,
        playerColor: player.color,
        size: projectileSize,
        position: {
            x: player.position.x + dirX * (player.size + projectileSize), // Start outside player
            y: player.position.y + dirY * (player.size + projectileSize)
        },
        velocity: {
            x: dirX * projectileSpeed,
            y: dirY * projectileSpeed
        },
        createdAt: Date.now(),
        damage: projectileSize * 2  // Damage is proportional to projectile size
    };
    
    // Add projectile to active projectiles
    projectiles.push(projectile);
    
    // Notify player of successful shot
    if (player.ws) {
        player.ws.send(JSON.stringify({
            type: 'projectileCreated',
            id: projectile.id
        }));
    }
}

// Update all projectiles (call this from game loop)
function updateProjectiles() {
    // Update projectile positions
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        
        // Move projectile
        projectile.position.x += projectile.velocity.x;
        projectile.position.y += projectile.velocity.y;
        
        // Check for collisions with players
        for (const targetId in players) {
            // Skip projectile owner
            if (targetId === projectile.playerId) continue;
            
            const target = players[targetId];
            if (!target) continue;
            
            // Calculate distance
            const dx = projectile.position.x - target.position.x;
            const dy = projectile.position.y - target.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Collision detected
            if (distance < target.size + projectile.size) {
                // Reduce target player's size
                const damageAmount = Math.min(projectile.damage, target.size - 5);
                target.size -= damageAmount;
                
                // Create orb from the damage (player who shot can collect it)
                const orb = {
                    id: `orb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    position: {
                        x: target.position.x + dx / distance * target.size,
                        y: target.position.y + dy / distance * target.size
                    },
                    color: target.color,
                    size: damageAmount / 2,
                    points: Math.floor(damageAmount * 10),
                    isPlayerFragment: true
                };
                
                // Notify the target player they were hit
                if (target.ws) {
                    target.ws.send(JSON.stringify({
                        type: 'hit',
                        projectileId: projectile.id,
                        damage: damageAmount,
                        shooterId: projectile.playerId
                    }));
                }
                
                // Notify the shooting player they hit someone
                const shooter = players[projectile.playerId];
                if (shooter && shooter.ws) {
                    shooter.ws.send(JSON.stringify({
                        type: 'hitConfirmed',
                        targetId: targetId,
                        damage: damageAmount
                    }));
                }
                
                // Add orb to game
                if (typeof gameManager !== 'undefined' && gameManager.addCustomOrb) {
                    gameManager.addCustomOrb(orb);
                }
                
                // Remove projectile
                projectiles.splice(i, 1);
                break;
            }
        }
        
        // Remove projectiles that go out of bounds or are too old
        const mapWidth = 5000;  // Should match gameManager.MAP_WIDTH
        const mapHeight = 5000; // Should match gameManager.MAP_HEIGHT
        const maxAge = 5000;    // 5 seconds
        
        if (
            projectile.position.x < 0 || 
            projectile.position.x > mapWidth ||
            projectile.position.y < 0 || 
            projectile.position.y > mapHeight ||
            Date.now() - projectile.createdAt > maxAge
        ) {
            projectiles.splice(i, 1);
        }
    }
}

module.exports = { 
    addPlayer, 
    removePlayer, 
    handlePlayerInput,
    handlePlayerDirection,
    handlePlayerShoot,
    updatePlayerName,
    increasePlayerScore,
    updateProjectiles,
    players,
    projectiles,
    getPlayersForBroadcast
}; 
```

## File: WizardArena/server/server.js

```
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const playerManager = require('./playerManager');
const chatManager = require('./chatManager');
const gameManager = require('./gameManager');
const errorLogger = require('./errorLogger');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// Initialize the game
gameManager.initOrbs();

// Admin dashboard route for viewing client errors
app.get('/admin/logs', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/admin.html'));
});

// API endpoints for logs
app.get('/api/logs/errors', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    res.json(errorLogger.getClientErrorLogs(limit));
});

app.get('/api/logs/console', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    res.json(errorLogger.getClientConsoleLogs(limit));
});

// WebSocket connection handling
wss.on('connection', (ws, req) => {
    // Get client IP
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Add player and get their ID
    const playerId = playerManager.addPlayer(ws);
    
    // Store client info with the websocket
    ws.clientInfo = {
        ip: ip,
        id: playerId,
        userAgent: req.headers['user-agent'] || 'Unknown',
        connectedAt: new Date().toISOString()
    };
    
    console.log(`Player ${playerId} connected from ${ip}`);
    
    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'setName':
                    playerManager.updatePlayerName(playerId, data.name);
                    // Store name in client info
                    ws.clientInfo.name = data.name;
                    // Send the existing chat history to the new player
                    chatManager.sendChatHistoryToPlayer(ws);
                    // Notify other players that someone joined
                    chatManager.handleNameSet(playerId, data.name);
                    break;
                
                case 'move':
                    playerManager.handlePlayerInput(playerId, data.position);
                    break;
                    
                case 'direction':
                    playerManager.handlePlayerDirection(playerId, data.dirX, data.dirY, data.speed);
                    break;
                    
                case 'shoot':
                    playerManager.handlePlayerShoot(playerId, data.dirX, data.dirY);
                    break;
                
                case 'chat':
                    chatManager.handleChatMessage(playerId, data.message);
                    break;
                    
                case 'client_error':
                    // Handle client error
                    errorLogger.handleClientError(data, ws.clientInfo);
                    break;
                    
                case 'client_log':
                    // Handle client console logs
                    errorLogger.handleClientLog(data, ws.clientInfo);
                    break;
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });
    
    // Handle disconnect
    ws.on('close', () => {
        console.log(`Player ${playerId} disconnected`);
        
        // Get the player's name before removing them
        const playerName = playerManager.players[playerId]?.name;
        
        // Remove the player
        playerManager.removePlayer(playerId);
        
        // Notify chat if they had a name
        if (playerName) {
            chatManager.broadcastSystemMessage(`${playerName} has left the arena`);
        }
    });
});

// Game loop
const FPS = 30;
const FRAME_TIME = 1000 / FPS;

setInterval(() => {
    // Update game state
    const state = gameManager.update();
    
    // Broadcast state to all clients
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ 
                type: 'update', 
                state 
            }));
        }
    });
}, FRAME_TIME);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Admin logs available at http://localhost:${PORT}/admin/logs`);
}); 
```
