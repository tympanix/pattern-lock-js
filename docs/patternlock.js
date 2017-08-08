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
    var svgns = "http://www.w3.org/2000/svg"

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

        dots.on('touchstart mousedown', (e) => {
            e.preventDefault()
            track = beginTrack(e.target)
            let endEvent = e.type == 'touchstart' ? 'touchend' : 'mouseup';
            $(document).one(endEvent, (e) => {
                dots.off('mouseenter touchenter')
                code = []
            })
        })

        function isUsed(target) {
            for (let i = 0; i < code.length; i++) {
                if (code[i] === target) {
                    return true
                }
            }
            return false
        }

        function handle(line) {
            return function(e) {
                e.preventDefault()
                let pos = getMousePos(e)
                line.setAttribute('x2', pos.x)
                line.setAttribute('y2', pos.y)
                let x = e.clientX || e.originalEvent.touches[0].clientX
                let y = e.clientY || e.originalEvent.touches[0].clientY
                let target = document.elementFromPoint(x, y);
                let cx = target.getAttribute('cx')
                let cy = target.getAttribute('cy')
                if (target.tagName === 'circle' && lastdot !== target && !isUsed(target)) {
                    stopTrack(track, target)
                    track = beginTrack(target)
                }
                return false
            }
        }

        function stopTrack(track, target) {
            svg.off()
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
            var track = document.createElementNS(svgns, "line")
            track.setAttribute('x1', x)
            track.setAttribute('y1', y)
            track.setAttribute('x2', x)
            track.setAttribute('y2', y)
            var activedot = document.createElementNS(svgns, "circle")
            activedot.setAttribute('cx', x)
            activedot.setAttribute('cy', y)
            actives.append(activedot)
            svg.on('touchmove mousemove', handle(track))
            $(document).one('mouseup touchend', (e) => {
                track.remove()
                activedot.remove()
                svg.off()
            })
            lines.append(track);
            vibrate()
            return track
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

    return PatternLock
}));