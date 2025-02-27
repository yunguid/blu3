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