// energize.js: speed up click events on mobile devices
(function() {
  // don't add to non-touch devices
  if(!('ontouchstart' in window)) return;
  
  var isThresholdReached = function(startXY, xy) {
    /*
        Determine if the scroll threshold has been reached

        Examples:
        isThresholdReached([0,0], [5,5]);    // false
        isThresholdReached([0,0], [20,20]);  // true
    */
    return Math.abs(startXY[0] - xy[0]) > 10 || Math.abs(startXY[1] - xy[1]) > 10;
  };
  var touchstart = function(e) {
    // setup the initial values
    this.startXY = [e.touches[0].clientX, e.touches[0].clientY];
    this.treshold = false;
  };
  var touchmove = function(e) {
    // check if the user is scrolling past the threshold
    if(this.treshold) return false;  // noop if the threshold has already been reached
    this.threshold = isThresholdReached(this.startXY, [e.touches[0].clientX, e.touches[0].clientY]);
  };
  var touchend = function(e) {
    // don't fire a click if the user scrolled past the threshold
    if(this.treshold || isThresholdReached(this.startXY, [e.changedTouches[0].clientX, e.changedTouches[0].clientY])) {
      return;
    }
    
    // create and fire a click event on the target element
    // https://developer.mozilla.org/en/DOM/event.initMouseEvent
    var touch = e.changedTouches[0],
        evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('click', true, true, window, 0, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
    evt.simulated = true;   // distinguish this from a nonsimulated click
    e.target.dispatchEvent(evt);
  };
  var click = function(e) {
    /*
        Prevent ghost clicks by only allowing clicks we created
        in the click event we fired (look for e.simulated)
    */
    if(!e.simulated || (window.navigator.standalone && e.target.nodeName === 'A' && e.target.getAttribute("href"))) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    /* 
       Special logic for standalone web apps
       See http://stackoverflow.com/questions/2898740/iphone-safari-web-app-opens-links-in-new-window
    */
    if(window.navigator.standalone && e.target.nodeName === 'A' && e.target.getAttribute("href")) {
      window.location=e.target.getAttribute("href");
    }
  };

  /*
      All the events we care about bubble up to document,
      so we can handle them there instead of 
  */
  document.addEventListener('touchstart', touchstart, false);
  document.addEventListener('touchmove', touchmove, false);
  document.addEventListener('touchend', touchend, false);
  document.addEventListener('click', click, true);
  
})();