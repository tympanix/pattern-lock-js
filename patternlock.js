(function (factory) {
    let global = Function('return this')() || (0, eval)('this');
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
    let svgns = 'http://www.w3.org/2000/svg',
    moveEvent = 'touchmove mousemove',
    scrollKeys = {
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

    function PatternLock(element, options) {
        let svg = $(element),
        self = this,
        root = svg[0],
        dots = svg.find('.lock-dots circle'),
        lines = svg.find('.lock-lines'),
        actives = svg.find('.lock-actives'),
        pt = root.createSVGPoint(),
        code = [],
        currentline,
        currenthandler,
        i,
        dotsMap = []

        for(i=0; i<dots.length; i++){
            dotsMap[i+1] = {x: dots[i].cx.baseVal.value, y: dots[i].cy.baseVal.value};
        }

        options = Object.assign(PatternLock.defaults, options || {})

        svg.on('touchstart mousedown', (e) => {
            clear()
            e.preventDefault()
            disableScroll()
            svg.on(moveEvent, discoverDot)
            let endEvent = e.type == 'touchstart' ? 'touchend' : 'mouseup';
            $(document).one(endEvent, (e) => {
                end()
            })
        })

        // Exported methods
        Object.assign(this, {
            clear,
            success,
            error,
            getPattern,
            setPattern,
        })

        function success() {
            svg.removeClass('error')
            svg.addClass('success')
        }

        function error() {
            svg.removeClass('success')
            svg.addClass('error')
        }

        function getPattern() {
            return parseInt(code.map((i) => dots.index(i)+1).join(''))
        }

        function setPattern(arr){
            clear()
            if (arr === undefined) return
            let marker,line, dotActual, dotBefore = null
            for(i = 0; i < arr.length ; i++ ){
                if(dotsMap[arr[i]] !== undefined){
                    dotActual = dotsMap[arr[i]]
                    marker = createNewMarker(dotActual.x,dotActual.y)
                    actives.append(marker)
                    if(dotBefore != null){
                        line = createNewLine(dotBefore.x, dotBefore.y, dotActual.x, dotActual.y)
                        lines.append(line)
                    }
                    if (options.vibrate) vibrate()
                    dotBefore = dotActual
                }
            }
        }

        function end() {
            enableScroll()
            stopTrack(currentline)
            currentline && currentline.remove()
            svg.off(moveEvent, discoverDot)
            let val = options.onPattern.call(self, getPattern())
            if (val === true) {
                success()
            } else if (val === false) {
                error()
            }
        }

        function clear() {
            code = []
            currentline = undefined
            currenthandler = undefined
            svg.removeClass('success error')
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
            if (window.addEventListener) // older FF
                window.addEventListener('DOMMouseScroll', preventDefault, false);
            window.onwheel = preventDefault; // modern standard
            window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
            window.ontouchmove = preventDefault; // mobile
            document.onkeydown = preventDefaultForScrollKeys;
        }

        function enableScroll() {
            if (window.removeEventListener)
                window.removeEventListener('DOMMouseScroll', preventDefault, false);
            window.onmousewheel = document.onmousewheel = null;
            window.onwheel = null;
            window.ontouchmove = null;
            document.onkeydown = null;
        }

        function isUsed(target) {
            for (i = 0; i < code.length; i++) {
                if (code[i] === target) {
                    return true
                }
            }
            return false
        }

        function isAvailable(target) {
            for (i = 0; i < dots.length; i++) {
                if (dots[i] === target) {
                    return true
                }
            }
            return false
        }

        function updateLine(line) {
            return function(e) {
                e.preventDefault()
                if (currentline !== line) return
                let pos = svgPosition(e.target, e)
                line.setAttribute('x2', pos.x)
                line.setAttribute('y2', pos.y)
                return false
            }
        }

        function discoverDot(e, target) {
            if (!target) {
                let {x, y} = getMousePos(e)
                target = document.elementFromPoint(x, y);
            }
            let cx = target.getAttribute('cx'),
            cy = target.getAttribute('cy')
            if (isAvailable(target) && !isUsed(target)) {
                stopTrack(currentline, target)
                currentline = beginTrack(target)
            }
        }

        function stopTrack(line, target) {
            if (line === undefined) return
            if (currenthandler) {
                svg.off('touchmove mousemove', currenthandler)
            }
            if (target === undefined) return
            let x = target.getAttribute('cx'),
            y = target.getAttribute('cy')
            line.setAttribute('x2', x)
            line.setAttribute('y2', y)
        }

        function beginTrack(target) {
            code.push(target)
            let x = target.getAttribute('cx'),
            y = target.getAttribute('cy'),
            line = createNewLine(x, y),
            marker = createNewMarker(x, y)
            actives.append(marker)
            currenthandler = updateLine(line)
            svg.on('touchmove mousemove', currenthandler)
            lines.append(line);
            if(options.vibrate) vibrate()
            return line
        }

        function createNewMarker(x, y) {
            let marker = document.createElementNS(svgns, "circle")
            marker.setAttribute('cx', x)
            marker.setAttribute('cy', y)
            marker.setAttribute('r', 6)
            return marker
        }

        function createNewLine(x1, y1, x2, y2) {
            let line = document.createElementNS(svgns, "line")
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
            return {
                x: e.clientX || e.originalEvent.touches[0].clientX,
                y :e.clientY || e.originalEvent.touches[0].clientY
            }
        }

        function svgPosition(element, e) {
            let {x, y} = getMousePos(e)
            pt.x = x; pt.y = y;
            return pt.matrixTransform(element.getScreenCTM().inverse());
        }
    }

    PatternLock.defaults = {
        onPattern: () => {},
        vibrate: true,
    }

    return PatternLock
}));