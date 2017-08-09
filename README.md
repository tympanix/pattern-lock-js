# pattern-lock-js
A passcode mechanism built with scalable vector graphics (SVG) and javascript for modern web application with mobile and tablet support

## [Demo](https://tympanix.github.io/pattern-lock-js/)

## Getting started
Import dependecies:
```html
<script src="jquery.js" charset="utf-8"></script>
```
Import the module:
```html
<link rel="stylesheet" href="patternlock.min.css">
<script src="patternlock.min.js" charset="utf-8"></script>
```

Design your desired svg pattern (or use the default one below). Your svg graphics must as a minimum have the `patternlock` class and three groups `<g>` with the classes `actives`, `lines` and `lockdots`
```html
<svg class="patternlock" id="lock" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="actives"></g>
    <g class="lines"></g>
    <g class="lockdots">
        <circle cx="20" cy="20" class="lockdot" r="2"/>
        <circle cx="50" cy="20" class="lockdot" r="2"/>
        <circle cx="80" cy="20" class="lockdot" r="2"/>

        <circle cx="20" cy="50" class="lockdot" r="2"/>
        <circle cx="50" cy="50" class="lockdot" r="2"/>
        <circle cx="80" cy="50" class="lockdot" r="2"/>

        <circle cx="20" cy="80" class="lockdot" r="2"/>
        <circle cx="50" cy="80" class="lockdot" r="2"/>
        <circle cx="80" cy="80" class="lockdot" r="2"/>
    </g>
<svg>
```
Initialise the component
```javascript
var lock = new PatternLock("#lock", {
  onPattern: function(pattern) {
    console.log(pattern)
   }
});
```

## Options
The returned object from `new PatternLock(...)` has the following utility functions:
* **`clear()`** Clears the current pattern
* **`success()`** Validates the pattern as correct
* **`error()`** Validates the pattern as incorrect
* **`getPattern()`** Returnes the currently active pattern or `NaN`

The pattern lock constructor accepts a second argument - an object literal with a callback function:

* **`onPattern: function`** Called when a pattern is drawn with the pattern as argument. Returning true/false validates/invalidates the pattern - the same as calling `success()` and `error()`
```javascript

