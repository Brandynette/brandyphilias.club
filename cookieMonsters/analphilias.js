// Google Analytics 
// 100% data collected
//using organic collection methods [user imput]
// https://developers.google.com/analytics/devguides/collection/analyticsjs?hl=en

//Global site tag (gtag.js) - Google Analytics 


(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

// Set the user ID when creating the tracker.
ga('create', 'UA-97468528-2', );

ga('require', 'displayfeatures');
ga('send', 'pageview', {'sessionControl': 'start'});
ga('set', 'anonymizeIp', false);
ga('set', 'forceSSL', true);
ga('set', 'dataSource', 'crm');
ga('set', 'screenResolution', '1920x1080');


ga('send', 'event', 'click', 'download-me', {transport: 'beacon'});
ga('send', 'social', {
  'socialNetwork': 'facebook',
  'socialAction': 'like',
  'socialTarget': 'http://foo.com'
})

ga('create', 'UA-97468528-2', 'brandyphilias.club', 'firstTime', {
  userId: prompt(`Nick name for my cookie!`),
  clientId: Math.random(),
  sampleRate: 5,
  siteSpeedSampleRate: 10,
  alwaysSendReferrer: true,
  allowAnchor: true,
  cookieName: setupinit,
  cookieDomain: brandyphilias.club,
  cookieUpdate: true,
  allowLinker: true,
  storeGac: true,
  legacyHistoryImport: true
});

// Alternatively, you may set the user ID via the `set` method.
ga('set', 'userId', 'legalConcious');

// Alerts the linker parameter for the default tracker.
ga(function(tracker) {
  alert(tracker.get('linkerParam'));
});

gtag('config', 'GA_MEASUREMENT_ID', {
  'cookie_prefix': 'legalAgeWall',
  'cookie_domain': 'brandyphilias.club',
  'cookie_expires': 1 * 24 * 60 * 60  // 1 day, remakes cookie, userID check & verify legal age!
});

  
