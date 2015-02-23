window.GoogleAnalyticsObject = 'ga';
var ga = window.ga = window.ga || function() {
    (window.ga.q = window.ga.q || []).push(arguments)
};
ga.l = Date.now();

ga('create', 'UA-10717861-22', 'auto');
ga('set', 'forceSSL', true);
ga('set', 'checkProtocolTask', null);
ga('require', 'displayfeatures');
ga('send', 'pageview');

var counter = function() {
    "use strict";
    var gas = document.createElement('script');
    gas.async = 1;
    gas.src = 'https://www.google-analytics.com/analytics.js';
    var success = function() {
        var pos = document.getElementsByTagName('script')[0];
        pos.parentNode.insertBefore(gas, pos);
    };
    if (mono.isWebApp) {
        return success();
    }
    engine.ajax({
        type: 'HEAD',
        url: gas.src,
        success: success
    });
};