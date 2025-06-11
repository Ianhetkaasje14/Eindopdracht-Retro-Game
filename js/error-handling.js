
function checkAudioSupport() {
    try {
        const audio = new Audio();
        return (typeof audio.canPlayType === 'function');
    } catch (e) {
        return false;
    }
}

function initErrorHandling() {
    window.addEventListener('error', function (e) {
        if (e.target.tagName === 'IMG' || e.target.tagName === 'AUDIO') {
            console.warn('Asset failed to load:', e.target.src);
            e.preventDefault();
        }
    }, true);

    const audioSupported = checkAudioSupport();
    if (!audioSupported) {
        console.warn('Audio is not supported in this browser. Sound will be disabled.');
    }
}
