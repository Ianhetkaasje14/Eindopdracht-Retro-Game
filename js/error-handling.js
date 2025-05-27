
/**
 * Basic error handling for the game
 * These functions help detect issues with audio and asset loading
 */

/**
 * Check if the browser supports audio
 * @returns {boolean} True if audio is supported, false otherwise
 */
function checkAudioSupport() {
    try {
        // Try to create an audio element
        const audio = new Audio();
        // Check if the canPlayType function exists
        return (typeof audio.canPlayType === 'function');
    } catch (e) {
        return false;
    }
}

/**
 * Set up error handling for the game
 * This catches errors when loading images and audio
 */
function initErrorHandling() {
    // Add an error listener to catch failed asset loads
    window.addEventListener('error', function (e) {
        if (e.target.tagName === 'IMG' || e.target.tagName === 'AUDIO') {
            console.warn('Asset failed to load:', e.target.src);
            e.preventDefault();
        }
    }, true);

    // Check if audio is supported and warn if not
    const audioSupported = checkAudioSupport();
    if (!audioSupported) {
        console.warn('Audio is not supported in this browser. Sound will be disabled.');
    }
}
