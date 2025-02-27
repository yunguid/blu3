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