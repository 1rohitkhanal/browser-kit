/**
 * FIX-KIT Global Ad Loader
 * This script injects the AdSense library and handles the 
 * "Ad Strategy" layout from Screenshot 2026-05-03 192422.png
 */

(function() {
    // 1. Inject the main AdSense library to the <head>
    var script = document.createElement('script');
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4267064071274874";
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);

    // 2. Function to push ads once the DOM is ready
    window.addEventListener('load', function() {
        var ads = document.querySelectorAll('.adsbygoogle');
        ads.forEach(function() {
            (adsbygoogle = window.adsbygoogle || []).push({});
        });
    });
})();
