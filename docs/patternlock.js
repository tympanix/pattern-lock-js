(function (factory) {
    var global = Function('return this')() || (0, eval)('this');
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], function($) {
            return factory($, global)
        });
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('jquery'), global);
    } else {
        // Browser globals (global is window)
        global.PatternLock = factory(global.jQuery, global);
    }
}(function ($, window) {
    var svgns = 'http://www.w3.org/2000/svg'
    var moveevent = 'touchmove mousemove'

    var scrollKeys = {
        37: true, // left
        38: true, // up
        39: true, // right
        40: true, // down
        32: true, // spacebar
        38: true, // pageup
        34: true, // pagedown
        35: true, // end
        36: true, // home
    };

    function vibrate() {
        navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
        if (navigator.vibrate) {
            window.navigator.vibrate(25)
        }
    }

    function PatternLock(selector, options) {
        let svg = $(selector)
        let dots = svg.find('.lockdots circle')
        let lines = svg.find('.lines')
        let actives = svg.find('.actives')
        let code = []
        let track
        let lastdot
        let currenthandler

        svg.on('touchstart mousedown', (e) => {
            e.preventDefault()
            clear()
            disableScroll()
            svg.on(moveevent, discoverDot)
            let endEvent = e.type == 'touchstart' ? 'touchend' : 'mouseup';
            $(document).one(endEvent, (e) => {
                enableScroll()
                stopTrack(track)
                track && track.remove()
                svg.off(moveevent, discoverDot)
            })
        })

        function clear() {
            code = []
            track = undefined
            lastdot = undefined
            currenthandler = undefined
            lines.empty()
            actives.empty()
        }

        function preventDefault(e) {
            e = e || window.event;
            if (e.preventDefault)
                e.preventDefault();
            e.returnValue = false;
        }

        function preventDefaultForScrollKeys(e) {
            if (scrollKeys[e.keyCode]) {
                preventDefault(e);
                return false;
            }
        }

        function disableScroll() {
            console.log("Disable scroll")
            if (window.addEventListener) // older FF
                window.addEventListener('DOMMouseScroll', preventDefault, false);
            window.onwheel = preventDefault; // modern standard
            window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
            window.ontouchmove = preventDefault; // mobile
            document.onkeydown = preventDefaultForScrollKeys;
        }

        function enableScroll() {
            console.log("Enable scroll")
            if (window.removeEventListener)
                window.removeEventListener('DOMMouseScroll', preventDefault, false);
            window.onmousewheel = document.onmousewheel = null;
            window.onwheel = null;
            window.ontouchmove = null;
            document.onkeydown = null;
        }

        function isUsed(target) {
            for (let i = 0; i < code.length; i++) {
                if (code[i] === target) {
                    return true
                }
            }
            return false
        }

        function isAvailable(target) {
            for (let i = 0; i < dots.length; i++) {
                if (dots[i] === target) {
                    return true
                }
            }
            return false
        }

        function updateLine(line) {
            return function(e) {
                e.preventDefault()
                if (track !== line) return
                let pos = getMousePos(e)
                line.setAttribute('x2', pos.x)
                line.setAttribute('y2', pos.y)
                return false
            }
        }

        function discoverDot(e) {
            let x = e.clientX || e.originalEvent.touches[0].clientX
            let y = e.clientY || e.originalEvent.touches[0].clientY
            let target = document.elementFromPoint(x, y);
            let cx = target.getAttribute('cx')
            let cy = target.getAttribute('cy')
            if (isAvailable(target) && lastdot !== target && !isUsed(target)) {
                stopTrack(track, target)
                track = beginTrack(target)
            }
        }

        function stopTrack(track, target) {
            if (track === undefined) return
            if (currenthandler) {
                svg.off('touchmove mousemove', currenthandler)
            }
            if (!target) return
            let x = target.getAttribute('cx')
            let y = target.getAttribute('cy')
            track.setAttribute('x2', x)
            track.setAttribute('y2', y)
        }

        function beginTrack(target) {
            lastdot = target
            code.push(target)
            let x = target.getAttribute('cx')
            let y = target.getAttribute('cy')
            var track = createNewLine(x, y)
            var marker = createNewMarker(x, y)
            actives.append(marker)
            currenthandler = updateLine(track)
            svg.on('touchmove mousemove', currenthandler)
            lines.append(track);
            vibrate()
            return track
        }

        function createNewMarker(x, y) {
            var marker = document.createElementNS(svgns, "circle")
            marker.setAttribute('cx', x)
            marker.setAttribute('cy', y)
            return marker
        }

        function createNewLine(x1, y1, x2, y2) {
            var line = document.createElementNS(svgns, "line")
            line.setAttribute('x1', x1)
            line.setAttribute('y1', y1)
            if (x2 === undefined || y2 == undefined) {
                line.setAttribute('x2', x1)
                line.setAttribute('y2', y1)
            } else {
                line.setAttribute('x2', x2)
                line.setAttribute('y2', y2)
            }
            return line
        }

        function getMousePos(e) {
            let x = e.clientX || e.originalEvent.touches[0].clientX
            let y = e.clientY || e.originalEvent.touches[0].clientY
            let offset = svg.offset()
            let newX = (x - offset.left) / svg.width() * 100
            let newY = (y - offset.top) / svg.height() * 100
            return {x: newX, y: newY}
        }
    }

    PatternLock.prototype.getPattern = function () {

    };

    return PatternLock
}));