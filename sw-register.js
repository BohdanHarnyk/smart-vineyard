        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(function (err) {
                    console.warn('[PWA] Не вдалося зареєструвати service worker:', err);
                });
            });
        }
    
