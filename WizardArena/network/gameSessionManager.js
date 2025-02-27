/**
 * Game Session Manager
 * 
 * Handles the creation, management, and cleanup of game sessions.
 * This implementation uses in-memory storage, but could be extended 
 * to use a database for production use.
 */

// Store game sessions in memory
const gameSessions = new Map();

/**
 * Create a new game session
 * 
 * @param {string} id - Unique ID for the game session
 * @param {Object} data - Initial game session data
 * @returns {Object} The created game session
 */
function createGameSession(id, data) {
    // Ensure the ID is a string
    const sessionId = String(id);
    
    // Make sure the session doesn't already exist
    if (gameSessions.has(sessionId)) {
        throw new Error(`Game session with ID ${sessionId} already exists`);
    }
    
    // Create the session with the provided data
    const session = {
        id: sessionId,
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Store the session
    gameSessions.set(sessionId, session);
    
    return session;
}

/**
 * Get a game session by ID
 * 
 * @param {string} id - ID of the game session to retrieve
 * @returns {Object|null} The game session, or null if not found
 */
function getGameSession(id) {
    // Ensure the ID is a string
    const sessionId = String(id);
    
    // Return the session or null if not found
    return gameSessions.get(sessionId) || null;
}

/**
 * Update a game session
 * 
 * @param {string} id - ID of the game session to update
 * @param {Object} updates - Data to update in the session
 * @returns {Object|null} The updated game session, or null if not found
 */
function updateGameSession(id, updates) {
    // Ensure the ID is a string
    const sessionId = String(id);
    
    // Get the existing session
    const session = gameSessions.get(sessionId);
    if (!session) {
        return null;
    }
    
    // Update the session data
    const updatedSession = {
        ...session,
        ...updates,
        updatedAt: new Date().toISOString()
    };
    
    // Store the updated session
    gameSessions.set(sessionId, updatedSession);
    
    return updatedSession;
}

/**
 * Delete a game session
 * 
 * @param {string} id - ID of the game session to delete
 * @returns {boolean} True if the session was deleted, false if it wasn't found
 */
function deleteGameSession(id) {
    // Ensure the ID is a string
    const sessionId = String(id);
    
    // Delete the session
    return gameSessions.delete(sessionId);
}

/**
 * Get all game sessions
 * 
 * @returns {Object} Object containing all game sessions, keyed by ID
 */
function getAllGameSessions() {
    // Convert Map to a regular object
    const sessions = {};
    gameSessions.forEach((session, id) => {
        sessions[id] = session;
    });
    
    return sessions;
}

/**
 * Count active game sessions
 * 
 * @returns {number} The number of active game sessions
 */
function countGameSessions() {
    return gameSessions.size;
}

// Export the functions
module.exports = {
    createGameSession,
    getGameSession,
    updateGameSession,
    deleteGameSession,
    getAllGameSessions,
    countGameSessions
};