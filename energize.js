/* energize.js - a tiny JavaScript library to make links snappy in iOS */
var energize = (function(){
  var MIN_MS_DELAY = 0, // todo
      MAX_Y_PX = 10,
      energizedNodes = [];
 
  /* Only target Apple touch-based browsers */
  var energizable = ('ontouchstart' in window && navigator.vendor.match(/apple/i));
  
  /* convenience addEventListener for lazy people (me) */
  var on = function(elt, type, fn){
    elt.addEventListener(type, fn, false);
  };
  
  if(!energizable) {
    // short-circuit it!  ("Input... need more input!")
    return {
      clk: function(elt, fn){
        on(elt, 'click', fn);
      },
      
      delegateClk: function(elt, tag, fn){
        on(elt, 'click', function(e){
          if(e.target.nodeName !== tag.toUpperCase()) return;
          fn(e);
        });
      }
    }
  }
  
  var energize = function(elt){
    var focusedElt, startTime, startXY = [];
    
    // don't needlessly energize it twice
    if(energizedNodes.indexOf(elt) !== -1) return;
    
    // keep track of energized nodes
    energizedNodes.push(elt);
    
    // touchstart event
    on(elt, 'touchstart', function(e){
      var touch = e.touches[0];

      focusedElt = touch.target;
      startTime = Date.now();
      startXY = [touch.screenX, touch.screenY];
    });

    // touchend event
    on(elt, 'touchend', function(e){
      var evt,
          touch = e.changedTouches[0],
          shouldFireClick;
      
      // make sure the targets match up, the MAX_Y_PX is in an acceptable range, and MIN_MS_DELAY is in an acceptable range
      shouldFireClick = (focusedElt && touch.target === focusedElt && Math.abs(startXY[1]) - touch.screenY < MAX_Y_PX && Date.now() - startTime > MIN_MS_DELAY);
      
      // short-circuit
      if(!shouldFireClick) {
        focusedElt = null;
        return;
      }
      
      // create and fire a click event
      evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      evt.simulated = true;   // distinguish this from a nonsimulated click
      focusedElt.dispatchEvent(evt);
      focusedElt = null;
    });
  }
  
  /*
      click
      Speed up click events on the given elt.
      
      Example:
      energize.clk(document.getElementById('test'), function(e){
        // code here
      });
  */
  var click = function(elt, fn){
    
    
    // energize the element, attaching touchstart and touchend handlers
    energize(elt);
    
    // click
    on(elt, 'click', function(e){
      if(!e.simulated) return;  // don't run nonsimulated (nonenergized) clicks
      fn(e);
    });
  }
  
  /*
      delegateClick
      Speed up click events on all descendants of elt of the given tag type.
      
      Example:
      energize.delegateClick(document.getElementById('container'), 'a', function(e){
        // code here
      });
  */
  var delegateClick = function(elt, tag, fn){
    energize(elt);
    
    on(elt, 'click', function(e){
      // don't fire on nonsimulated events and nonmatching elements
      if(!e.simulated || e.target.nodeName !== tag.toUpperCase()) return;
      
      fn(e);
    });
  }
  
  return {
    clk: click,
    delegateClk: delegateClick
  };
})();