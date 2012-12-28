// energize.js: speed up click events on mobile devices (https://github.com/davidcalhoun/energize.js)
(function() {
  // don't add to non-touch devices or desktop Chrome (which now has touch events)
  if(!('ontouchstart' in window && !(/chrome/i).test(navigator.userAgent))) return;

  var lastClick = {};
  
  var isThresholdReached = function(startXY, xy) {
    return Math.abs(startXY[0] - xy[0]) > 5 || Math.abs(startXY[1] - xy[1]) > 5;
  };

  var touchstart = function(e) {
    // setup the initial values
    // TODO: touch and hold
    this.startXY = [e.touches[0].clientX, e.touches[0].clientY];
    this.threshold = false;
  };
  var touchmove = function(e) {
    // check if the user is scrolling past the threshold
    if(this.threshold) return false;  // noop if the threshold has already been reached
    this.threshold = isThresholdReached(this.startXY, [e.touches[0].clientX, e.touches[0].clientY]);
  };
  var touchend = function(e) {
    // don't fire a click if the user scrolled past the threshold
    if(this.threshold || isThresholdReached(this.startXY, [e.changedTouches[0].clientX, e.changedTouches[0].clientY])) {
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
    var time = Date.now(),
        timeDiff = time - lastClick.time,
        x = e.clientX,
        y = e.clientY,
        xyDiff = [Math.abs(lastClick.x - x), Math.abs(lastClick.y - y)],
        target = closest(e.target, 'A') || e.target,
        nodeName = target.nodeName,
        isLink = nodeName === 'A',
        standAlone = window.navigator.standalone && isLink && e.target.getAttribute("href");
    
    lastClick.time = time;
    lastClick.x = x;
    lastClick.y = y;

    //if((!e.simulated) || standAlone) {  // Android doesn't pick up all clicks with this
    /*
       Unfortunately Android sometimes fires click events without touch events (seen on Kindle Fire),
       so we have to add more logic to determine the time of the last click.  Not perfect...
    */
    if((!e.simulated && (timeDiff < 500 || (timeDiff < 1500 && xyDiff[0] < 50 && xyDiff[1] < 50))) || standAlone) {
      //window.$c && $c.log("energize.js: click suppressed; e.simulated: " + e.simulated + "; standAlone:" + standAlone + " timeDiff: " + timeDiff + "; xyDiff: [" + xyDiff[0] + ", " + xyDiff[1] + "]; screenXY: [" + e.screenX + ", " + e.screenY + "]");
      e.preventDefault();
      e.stopPropagation();
      if(!standAlone) return false;
    }

    //window.$c && $c.log && window.$c && $c.log("energize.js: unsupressed click event on " + target + " with class " + target.className + " timeDiff: " + timeDiff + "; xyDiff: [" + xyDiff[0] + ", " + xyDiff[1] + "]; screenXY: [" + e.screenX + ", " + e.screenY + "]");
    
    /* 
       Special logic for standalone web apps
       See http://stackoverflow.com/questions/2898740/iphone-safari-web-app-opens-links-in-new-window
    */
    if(standAlone) {
      window.location = target.getAttribute("href");
    }

    // add an energize-focus class to the targeted link (mimics :focus behavior)
    if(!target || !target.classList) return;
    target.classList.add("energize-focus");
    window.setTimeout(function(){
      target.classList.remove("energize-focus");
    }, 150);
  };

  var closest = function(node, nodeName){
    var curNode = node,
        tagName = nodeName.toUpperCase();

    while(curNode !== document.body) {  // go up the dom until we find the tag we're after
      if(!curNode || curNode.nodeName === tagName) { return curNode; } // found
      curNode = curNode.parentNode;     // not found, so keep going up
    }
    
    return null;  // not found
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
