var _gaq = _gaq || [];
if (parseInt(mono.localStorage.get('google_analytics') || 0) === 0) {
    _gaq.push(['_setAccount', 'UA-10717861-22']);
    _gaq.push(['_trackPageview']);
    (function() {
        var ga = document.createElement('script');
        ga.type = 'text/javascript';
        ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(ga, s);
    })();
}