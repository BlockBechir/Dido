/* iOS zooms the page when a text field gains focus; on iOS only, stop that auto-zoom (pinch-zoom still works there) */
(function () { try {
  var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (ios) document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
} catch (e) {} })();
