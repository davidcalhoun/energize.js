(function(){
  /* Energize.js - a tiny JavaScript snippet to make links snappy in iOS
     
     If you add a click event, be sure to prevent the default behavior for
     nonsimulated clicks.  If you don't, click events will fire twice!!
     
     Example usage:
     
     document.addEventListener('click', function(e) {
       if(!e.simulated) {    // not simulated, so suppress it
         e.preventDefault();
       } else {              // do your stuff here
       }
     }, false);
  */
  
  var focusedElt, listener;
  
  /* Reusable event listener */
  listener = function(elt, type, fn) {
    elt.addEventListener(type, fn, false);
  };
  
  listener(document, 'DOMContentLoaded', function() {
    /* Only target Apple touch-based browsers */
    /* Yeah, it involves some sniffing, but I don't know of a better way :P */
    if('ontouchstart' in window && navigator.vendor.match(/apple/i)) {      
      listener(document, 'touchstart', function(e) {
        focusedElt = e.touches[0].target;
      });
      
      listener(document, 'touchend', function(e) {
        if(focusedElt && e.changedTouches[0].target === focusedElt) {
          var evt = document.createEvent("MouseEvents");
          evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
          evt.simulated = true;
          focusedElt.dispatchEvent(evt);
        }
        focusedElt = null;
      });
    };
  });
})();