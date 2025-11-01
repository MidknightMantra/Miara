/**
 * Utility Helper Functions for Miara
 * Common functions used across Miara
 */

import crypto from 'crypto';
import axios from 'axios';

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Initial delay in ms
 */
export const retry = async (fn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await sleep(delay * Math.pow(2, i));
        }
    }
};

/**
 * Format file size to human readable
 * @param {number} bytes - Size in bytes
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format duration to human readable
 * @param {number} ms - Duration in milliseconds
 */
export const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
};

/**
 * Format phone number
 * @param {string} number - Phone number
 */
export const formatPhone = (number) => {
    // Remove all non-digits except +
    let formatted = number.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +
    if (!formatted.startsWith('+')) {
        formatted = '+' + formatted;
    }
    
    return formatted;
};

/**
 * Validate phone number
 * @param {string} number - Phone number to validate
 */
export const isValidPhone = (number) => {
    const regex = /^\+\d{7,15}$/;
    return regex.test(number);
};

/**
 * Generate random string
 * @param {number} length - Length of string
 */
export const randomString = (length = 10) => {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
};

/**
 * Generate random number in range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 */
export const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Size of chunks
 */
export const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

/**
 * Remove duplicates from array
 * @param {Array} array - Array with duplicates
 */
export const removeDuplicates = (array) => {
    return [...new Set(array)];
};

/**
 * Sanitize string (remove special characters)
 * @param {string} str - String to sanitize
 */
export const sanitize = (str) => {
    return str.replace(/[^a-zA-Z0-9 ]/g, '');
};

/**
 * Truncate string to length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 */
export const truncate = (str, length = 100) => {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
};

/**
 * Escape regex special characters
 * @param {string} str - String to escape
 */
export const escapeRegex = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Check if URL is valid
 * @param {string} url - URL to validate
 */
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Extract URLs from text
 * @param {string} text - Text containing URLs
 */
export const extractUrls = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
};

/**
 * Check if string is JSON
 * @param {string} str - String to check
 */
export const isJSON = (str) => {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 */
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Merge objects deeply
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 */
export const deepMerge = (target, source) => {
    const output = Object.assign({}, target);
    
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    output[key] = deepMerge(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    
    return output;
};

/**
 * Check if value is object
 * @param {*} item - Value to check
 */
const isObject = (item) => {
    return item && typeof item === 'object' && !Array.isArray(item);
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Parse command and arguments from text
 * @param {string} text - Command text
 * @param {string} prefix - Command prefix
 */
export const parseCommand = (text, prefix = '/') => {
    if (!text.startsWith(prefix)) return null;
    
    const parts = text.slice(prefix.length).trim().split(/\s+/);
    return {
        command: parts[0].toLowerCase(),
        args: parts.slice(1),
        fullText: parts.slice(1).join(' ')
    };
};

/**
 * Check if user has permission
 * @param {Object} user - User object
 * @param {string} permission - Permission to check
 */
export const hasPermission = (user, permission) => {
    const permissions = {
        'owner': ['all'],
        'admin': ['kick', 'promote', 'demote', 'group'],
        'moderator': ['kick', 'warn'],
        'member': []
    };
    
    const userPerms = permissions[user.role] || [];
    return userPerms.includes('all') || userPerms.includes(permission);
};

/**
 * Rate limit checker
 */
export class RateLimiter {
    constructor(maxRequests = 10, timeWindow = 60000) {
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow;
        this.requests = new Map();
    }

    check(userId) {
        const now = Date.now();
        const userRequests = this.requests.get(userId) || [];
        
        // Remove old requests outside time window
        const validRequests = userRequests.filter(time => now - time < this.timeWindow);
        
        if (validRequests.length >= this.maxRequests) {
            return false; // Rate limit exceeded
        }
        
        validRequests.push(now);
        this.requests.set(userId, validRequests);
        
        return true; // Request allowed
    }

    reset(userId) {
        this.requests.delete(userId);
    }

    clear() {
        this.requests.clear();
    }
}

/**
 * Simple cache implementation
 */
export class SimpleCache {
    constructor(ttl = 300000) { // 5 minutes default
        this.cache = new Map();
        this.ttl = ttl;
    }

    set(key, value, customTtl = null) {
        const expiresAt = Date.now() + (customTtl || this.ttl);
        this.cache.set(key, { value, expiresAt });
    }

    get(key) {
        const item = this.cache.get(key);
        
        if (!item) return null;
        
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    has(key) {
        return this.get(key) !== null;
    }

    delete(key) {
        return this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    size() {
        return this.cache.size;
    }

    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiresAt) {
                this.cache.delete(key);
            }
        }
    }
}

export default {
    sleep,
    retry,
    formatFileSize,
    formatDuration,
    formatPhone,
    isValidPhone,
    randomString,
    randomNumber,
    chunkArray,
    removeDuplicates,
    sanitize,
    truncate,
    escapeRegex,
    isValidUrl,
    extractUrls,
    isJSON,
    deepClone,
    deepMerge,
    debounce,
    throttle,
    parseCommand,
    hasPermission,
    RateLimiter,
    SimpleCache
};
