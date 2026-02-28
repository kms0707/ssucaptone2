/**
 * Logging utility for the NIDS application.
 * Provides structured logging with different severity levels.
 */

type LogLevel = "DEBUG" | "INFO" | "WARNING" | "ERROR";

/**
 * Logs a message with the specified severity level.
 * 
 * @param {LogLevel} level - The severity level of the log
 * @param {string} message - The log message
 * @param {unknown} data - Optional additional data to log
 * @returns {void}
 */
const log = (level: LogLevel, message: string, data?: unknown): void => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    switch (level) {
        case "DEBUG":
            // eslint-disable-next-line no-console
            console.debug(logMessage, data || "");
            break;
        case "INFO":
            // eslint-disable-next-line no-console
            console.info(logMessage, data || "");
            break;
        case "WARNING":
            // eslint-disable-next-line no-console
            console.warn(logMessage, data || "");
            break;
        case "ERROR":
            // eslint-disable-next-line no-console
            console.error(logMessage, data || "");
            break;
    }
};

/**
 * Logs a debug message.
 * 
 * @param {string} message - The debug message
 * @param {unknown} data - Optional additional data
 * @returns {void}
 */
export const debug = (message: string, data?: unknown): void => {
    log("DEBUG", message, data);
};

/**
 * Logs an info message.
 * 
 * @param {string} message - The info message
 * @param {unknown} data - Optional additional data
 * @returns {void}
 */
export const info = (message: string, data?: unknown): void => {
    log("INFO", message, data);
};

/**
 * Logs a warning message.
 * 
 * @param {string} message - The warning message
 * @param {unknown} data - Optional additional data
 * @returns {void}
 */
export const warning = (message: string, data?: unknown): void => {
    log("WARNING", message, data);
};

/**
 * Logs an error message.
 * 
 * @param {string} message - The error message
 * @param {unknown} data - Optional additional data
 * @returns {void}
 */
export const error = (message: string, data?: unknown): void => {
    log("ERROR", message, data);
};
