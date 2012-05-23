Work in progress!
------------
Energize is a work in progress, but it's functional.  Bug reports, pull requests, etc, highlighly appreciated as always!


How do I use it?
------------
Just include energize.js before any of your code that deals with click events (including any libraries and frameworks).  The reason is that energize.js fires simulated click events and also needs to suppress the "ghost click", the real click event that is fired later.  This is done via stopPropagation, which stops the the event from firing for other handlers listening for the click event.  Since handlers fire in the order they were added, energize.js needs to add its own click handler first.


Why use energize?
------------

Touch devices sometimes add an artificial delay to click events, just to make sure the user isn't double-tapping to zoom.

Why not just bind to ontouchend?
-------------

Because the user might touch an element in order to scroll, which results in ontouchend firing at the end of the scroll event.  Do you want a click event to fire when the user was intending to scroll?


Why fire simulated click events?  Why not just tie into something like <a href="http://code.google.com/mobile/articles/fast_buttons.html">Fast Button</a>?
-------------

Because you have to add click events to EVERYTHING you want to speed up.  This will mean there will be potentially be some fast UI and some slow UI on your pages.  Ok, that's not so bad if you're using some form of abstraction for all click events (i.e. not using addEventListener directly).

BUT interaction with native form elements such as buttons aren't sped up unless you manually add events to them.  Because of this, Energize takes the philosophy of listening for clicks bubbling up to the top and handles them appropriately so you don't have to worry about them.
