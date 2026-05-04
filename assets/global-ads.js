/**
 * Global AdSense Loader for FIX-KIT
 * Uses Publisher ID: pub-4267064071274874
 */

(function() {
    // 1. Inject the AdSense library into the <head>
    var script = document.createElement('script');
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4267064071274874";
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);

    // 2. Function to trigger ads once the page loads
    window.addEventListener('load', function() {
        // This looks for all 'ins' tags with the class 'adsbygoogle'
        var ads = document.querySelectorAll('.adsbygoogle');
        ads.forEach(function() {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.error("AdSense Error:", e);
            }
        });
    });
})();
