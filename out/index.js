/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./js/mathjax.js":
/*!***********************!*\
  !*** ./js/mathjax.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   typesetMathJax: () => (/* binding */ typesetMathJax)\n/* harmony export */ });\nfunction typesetMathJax(element) {\r\n    MathJax.typeset([element])\r\n}\n\n//# sourceURL=webpack://mind-graph/./js/mathjax.js?");

/***/ }),

/***/ "./ts/evtman.ts":
/*!**********************!*\
  !*** ./ts/evtman.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.EventManager = void 0;\nconst math_1 = __webpack_require__(/*! ./math */ \"./ts/math.ts\");\nclass EventManager {\n    constructor() {\n        this._clbks = {};\n        this._mousepos = (0, math_1.zeros)();\n        this._enabled = true;\n        this.shift = false;\n    }\n    setEnabled(on) {\n        this._enabled = on;\n    }\n    notify(evtnom, info) {\n        if (this._enabled) {\n            if (evtnom in this._clbks) {\n                const clbks = this._clbks[evtnom];\n                for (let clbk of clbks) {\n                    if (clbk) {\n                        clbk(info);\n                    }\n                }\n            }\n        }\n    }\n    subscribe(evtnom, clbkself) {\n        if (!(evtnom in this._clbks)) {\n            this._clbks[evtnom] = [];\n        }\n        for (var i = 0; i < this._clbks[evtnom].length; ++i) {\n            if (!this._clbks[evtnom][i]) {\n                this._clbks[evtnom][i] = clbkself.bound();\n                return i;\n            }\n        }\n        this._clbks[evtnom].push(clbkself.bound());\n        return this._clbks[evtnom].length - 1;\n    }\n    unsubscribe(evtnom, idx) {\n        if (!(evtnom in this._clbks)) {\n            this._clbks[evtnom] = [];\n        }\n        if (evtnom in this._clbks && this._clbks[evtnom].length > idx) {\n            delete this._clbks[evtnom][idx];\n        }\n    }\n    setMousePos(pt2d) {\n        this._mousepos = pt2d;\n    }\n    static get mousepos() {\n        return this._inst._mousepos;\n    }\n    static get inst() {\n        return this._inst || (this._inst = new this());\n    }\n}\nexports.EventManager = EventManager;\n\n\n//# sourceURL=webpack://mind-graph/./ts/evtman.ts?");

/***/ }),

/***/ "./ts/grid.ts":
/*!********************!*\
  !*** ./ts/grid.ts ***!
  \********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Grid = void 0;\nconst math_1 = __webpack_require__(/*! ./math */ \"./ts/math.ts\");\nconst types_1 = __webpack_require__(/*! ./types */ \"./ts/types.ts\");\nconst CROSS_R = 5;\nclass Grid {\n    constructor() {\n        this.side = 250.0;\n    }\n    drawCross(pos, side) {\n        const dc = types_1.DC.inst;\n        const gpos = dc.globalPt(pos);\n        const r = side;\n        dc.ctx.beginPath();\n        dc.ctx.moveTo(gpos.x, gpos.y - r);\n        dc.ctx.lineTo(gpos.x, gpos.y + r);\n        dc.ctx.stroke();\n        dc.ctx.beginPath();\n        dc.ctx.moveTo(gpos.x - r, gpos.y);\n        dc.ctx.lineTo(gpos.x + r, gpos.y);\n        dc.ctx.stroke();\n    }\n    drawDot(pos, side) {\n        const dc = types_1.DC.inst;\n        const gpos = dc.globalPt(pos);\n        dc.ctx.beginPath();\n        dc.ctx.moveTo(gpos.x - 0.1, gpos.y - 0.1);\n        dc.ctx.lineTo(gpos.x + 0.1, gpos.y + 0.1);\n        dc.ctx.stroke();\n    }\n    draw() {\n        const dc = types_1.DC.inst;\n        dc.ctx.fillStyle = dc.thm.bg;\n        dc.ctx.fillRect(0, 0, dc.cv.width, dc.cv.height);\n        dc.ctx.strokeStyle = dc.thm.alt;\n        const step = (10.0 ** Math.ceil(Math.log10(Math.min(dc.cv.width, dc.cv.height) / (dc.scale * 10.0))));\n        //const step = 100.0\n        const step2 = step / 10.0;\n        const stepSc = step * dc.scale;\n        const start = (0, math_1.pt)((0, math_1.leftVal)(dc.off.x / stepSc), (0, math_1.leftVal)(dc.off.y / stepSc)).coeff(-step);\n        for (var x = -1; x < Math.ceil(dc.cv.width / stepSc); ++x) {\n            for (var y = -1; y < Math.ceil(dc.cv.height / stepSc); ++y) {\n                this.drawCross((0, math_1.pt)(start.x + x * step, start.y + y * step), CROSS_R);\n                for (var xx = 0; xx < 10; ++xx)\n                    for (var yy = 0; yy < 10; ++yy)\n                        this.drawDot((0, math_1.pt)(start.x + x * step + xx * step2, start.y + y * step + yy * step2), CROSS_R * 0.1);\n            }\n        }\n    }\n}\nexports.Grid = Grid;\n\n\n//# sourceURL=webpack://mind-graph/./ts/grid.ts?");

/***/ }),

/***/ "./ts/main.ts":
/*!********************!*\
  !*** ./ts/main.ts ***!
  \********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst node_1 = __webpack_require__(/*! ./node */ \"./ts/node.ts\");\nconst evtman_1 = __webpack_require__(/*! ./evtman */ \"./ts/evtman.ts\");\nconst grid_1 = __webpack_require__(/*! ./grid */ \"./ts/grid.ts\");\nconst math_1 = __webpack_require__(/*! ./math */ \"./ts/math.ts\");\nconst types_1 = __webpack_require__(/*! ./types */ \"./ts/types.ts\");\nconst util_1 = __webpack_require__(/*! ./util */ \"./ts/util.ts\");\nlet lastDraw = 0;\nlet lastUpdate = 0;\nlet lastMousePos = (0, math_1.zeros)();\nlet lastMouseDownPos = (0, math_1.zeros)();\nlet lastMouseDownTime = 0;\nlet lastResize = 0;\nlet movedThisMouseDownTime = false;\nlet zoomedThisMouseDownTime = false;\nlet mouseIsDown = false;\nlet panning = false;\nlet off = (0, math_1.zeros)();\nlet curOff = (0, math_1.zeros)();\nlet grid = new grid_1.Grid();\nlet nodes = new Array();\nfunction init() {\n    updateCanvas();\n    types_1.DC.inst.off = off = (0, math_1.pt)(window.innerWidth, window.innerHeight).coeff(0.5);\n    initDeviceStatus();\n    initInputEvents();\n    nodes.push(new node_1.Node(\"haha test\", (0, math_1.rect)(-150, -50, 300, 100)));\n    nodes.push(new node_1.Node(\"haha test 2\", (0, math_1.rect)(200, -50, 100, 150)));\n    nodes.push(new node_1.Node(\"haha test 3\", (0, math_1.rect)(-150, 100, 200, 200)));\n    render();\n}\nfunction updateCanvas() {\n    const dc = types_1.DC.inst;\n    dc.cv.width = window.innerWidth;\n    dc.cv.height = window.innerHeight;\n}\nfunction initDeviceStatus() {\n    if (/(android|bb\\d+|meego).+mobile|avantgo|bada\\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)\n        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\\-(n|u)|c55\\/|capi|ccwa|cdm\\-|cell|chtm|cldc|cmd\\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\\-s|devi|dica|dmob|do(c|p)o|ds(12|\\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\\-|_)|g1 u|g560|gene|gf\\-5|g\\-mo|go(\\.w|od)|gr(ad|un)|haie|hcit|hd\\-(m|p|t)|hei\\-|hi(pt|ta)|hp( i|ip)|hs\\-c|ht(c(\\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\\-(20|go|ma)|i230|iac( |\\-|\\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\\/)|klon|kpt |kwc\\-|kyo(c|k)|le(no|xi)|lg( g|\\/(k|l|u)|50|54|\\-[a-w])|libw|lynx|m1\\-w|m3ga|m50\\/|ma(te|ui|xo)|mc(01|21|ca)|m\\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\\-2|po(ck|rt|se)|prox|psio|pt\\-g|qa\\-a|qc(07|12|21|32|60|\\-[2-7]|i\\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\\-|oo|p\\-)|sdk\\/|se(c(\\-|0|1)|47|mc|nd|ri)|sgh\\-|shar|sie(\\-|m)|sk\\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\\-|v\\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\\-|tdg\\-|tel(i|m)|tim\\-|t\\-mo|to(pl|sh)|ts(70|m\\-|m3|m5)|tx\\-9|up(\\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\\-|your|zeto|zte\\-/i.test(navigator.userAgent.substr(0, 4))) {\n        const dc = types_1.DC.inst;\n        dc.mobile = true;\n    }\n}\nfunction drag() {\n    const dc = types_1.DC.inst;\n    if (dc.grabObj) {\n        const to = dc.localPt(dc.mouse).addPt(dc.grabOff);\n        if (dc.grabObj instanceof node_1.Node)\n            dc.grabObj.updateRect(to);\n        else if (dc.grabObj instanceof node_1.GrabPoint)\n            dc.grabObj.moveTo(to);\n    }\n}\nfunction focusOnNode(e) {\n    const dc = types_1.DC.inst;\n    const idx = nodes.indexOf(e);\n    nodes.splice(idx, 1);\n    nodes.unshift(e);\n    dc.focusObj = e;\n    for (let i = 0; i < nodes.length; ++i) {\n        const n = nodes[i];\n        n.setClass('unselectable', true);\n        n.setZ(nodes.length - i);\n    }\n    dc.focusObj.setClass('unselectable', false);\n}\nfunction initInputEvents() {\n    const dc = types_1.DC.inst;\n    window.addEventListener('resize', function (e) {\n        updateCanvas();\n        lastResize = this.performance.now();\n        evtman_1.EventManager.inst.notify(\"cansz\", (0, math_1.pt)(types_1.DC.inst.cv.width, types_1.DC.inst.cv.height));\n    });\n    window.addEventListener('click', function (e) {\n        if (!movedThisMouseDownTime) {\n            evtman_1.EventManager.inst.notify(\"click\", (0, math_1.pt)(e.clientX, e.clientY));\n        }\n    });\n    if (dc.mobile) {\n    }\n    else {\n        window.addEventListener('contextmenu', function (e) {\n            e.preventDefault();\n            if (!movedThisMouseDownTime) {\n                evtman_1.EventManager.inst.notify(\"rclick\", (0, math_1.pt)(e.clientX, e.clientY));\n            }\n        }, false);\n        window.onkeydown = (e) => {\n            e = e || window.event;\n            if (e.keyCode == 38) {\n                evtman_1.EventManager.inst.notify(\"keypress\", \"up\");\n            }\n            else if (e.keyCode == 40) {\n                evtman_1.EventManager.inst.notify(\"keypress\", \"down\");\n            }\n            else if (e.keyCode == 37) {\n                evtman_1.EventManager.inst.notify(\"keypress\", \"left\");\n            }\n            else if (e.keyCode == 39) {\n                evtman_1.EventManager.inst.notify(\"keypress\", \"right\");\n            }\n            else if (e.keyCode == 16) {\n                evtman_1.EventManager.inst.shift = true;\n            }\n            else if (e.keyCode == 82) {\n                evtman_1.EventManager.inst.notify(\"keypress\", \"r\");\n            }\n        };\n        window.onkeyup = (e) => {\n            e = e || window.event;\n            if (e.keyCode == 16) {\n                evtman_1.EventManager.inst.shift = false;\n            }\n        };\n        window.addEventListener('mousedown', function (e) {\n            if (e.button == 1) {\n                e.preventDefault();\n                evtman_1.EventManager.inst.notify(\"wclick\", (0, math_1.pt)(e.clientX, e.clientY));\n            }\n            else {\n                lastMouseDownTime = (0, util_1.getCurMillis)();\n                const point = (0, math_1.pt)(e.clientX, e.clientY);\n                dc.mouse = point;\n                dc.mouseDown = true;\n                evtman_1.EventManager.inst.notify(\"mousedown\", point);\n                evtman_1.EventManager.inst.setMousePos(point);\n                mouseIsDown = true;\n                movedThisMouseDownTime = false;\n                if (dc.hoverObj) {\n                    if (dc.hoverObj instanceof node_1.Node)\n                        focusOnNode(dc.hoverObj);\n                    else if (dc.hoverObj instanceof node_1.GrabPoint)\n                        if (dc.hoverObj.parent && dc.hoverObj.parent instanceof node_1.Node)\n                            focusOnNode(dc.hoverObj.parent);\n                    if (dc.grabbable) {\n                        dc.grabObj = dc.hoverObj;\n                        dc.grabOff = dc.hoverOff;\n                    }\n                    panning = false;\n                }\n                else {\n                    lastMouseDownPos = point;\n                    panning = true;\n                }\n            }\n        });\n        window.addEventListener('mousemove', function (e) {\n            lastMousePos = (0, math_1.pt)(e.clientX, e.clientY);\n            dc.mouse = lastMousePos;\n            evtman_1.EventManager.inst.notify(\"mousemove\", lastMousePos);\n            evtman_1.EventManager.inst.setMousePos(lastMousePos);\n            movedThisMouseDownTime = lastMousePos.subPt(lastMouseDownPos).norm() > 10;\n            if (mouseIsDown) {\n                drag();\n                if (panning) {\n                    curOff = lastMousePos.subPt(lastMouseDownPos);\n                    dc.off = off.addPt(curOff);\n                    updateContent();\n                }\n            }\n        });\n        window.addEventListener('mouseup', function (e) {\n            evtman_1.EventManager.inst.notify(\"mouseup\", (0, math_1.pt)(e.clientX, e.clientY));\n            mouseIsDown = false;\n            dc.mouseDown = false;\n            if (dc.grabObj) {\n                dc.grabObj = null;\n            }\n            else {\n                off = off.addPt(curOff);\n            }\n            curOff = (0, math_1.zeros)();\n        });\n        window.addEventListener('wheel', function (e) {\n            lastMousePos = (0, math_1.pt)(e.clientX, e.clientY);\n            evtman_1.EventManager.inst.notify(\"wheel\", (0, math_1.pt)(e.deltaX, -e.deltaY));\n            const newScale = dc.scale - 0.01 * e.deltaY * dc.scale / 10.0;\n            if (newScale != dc.scale) {\n                off = off.subPt(((lastMousePos.subPt(off).subPt(curOff)).coeff(1.0 / dc.scale)).coeff(newScale - dc.scale));\n                dc.off = off.addPt(curOff.coeff(1 / (newScale - dc.scale)));\n                dc.scale = newScale;\n                drag();\n                updateContent();\n            }\n        });\n        jQuery(document).on(\"keydown\", function (e) {\n            if (e.ctrlKey && e.key == 'c') {\n                evtman_1.EventManager.inst.notify(\"copy\", null);\n            }\n            else if (e.ctrlKey && e.key == 'v') {\n                evtman_1.EventManager.inst.notify(\"paste\", null);\n            }\n            else if (e.ctrlKey && e.key == 'a') {\n                evtman_1.EventManager.inst.notify(\"selectall\", null);\n            }\n        });\n    }\n}\nfunction resetSelection() {\n    if (window.getSelection) {\n        const ws = window.getSelection();\n        if (ws) {\n            if (ws.empty)\n                ws.empty();\n            else if (ws.removeAllRanges)\n                ws.removeAllRanges();\n        }\n    }\n}\nfunction updateContent() {\n    nodes.forEach(e => {\n        e.updateContent();\n    });\n}\nfunction render() {\n    const dc = types_1.DC.inst;\n    dc.hoverObj = null;\n    dc.grabbable = false;\n    grid.draw();\n    nodes.forEach(e => {\n        if (!dc.hoverObj)\n            e.checkHover();\n    });\n    requestAnimationFrame(render);\n    if (dc.hoverObj || dc.grabObj)\n        $('body').css('cursor', dc.grabObj ? dc.grabCursor : dc.hoverCursor);\n    else\n        $('body').css('cursor', '');\n    if (dc.grabObj) {\n        resetSelection();\n        $('body').addClass('unselectable');\n    }\n    else {\n        $('body').removeClass('unselectable');\n    }\n}\n$(window).on('load', function () {\n    init();\n});\n\n\n//# sourceURL=webpack://mind-graph/./ts/main.ts?");

/***/ }),

/***/ "./ts/math.ts":
/*!********************!*\
  !*** ./ts/math.ts ***!
  \********************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Rect = exports.Point2d = void 0;\nexports.clamp = clamp;\nexports.fract = fract;\nexports.leftVal = leftVal;\nexports.rightVal = rightVal;\nexports.pt = pt;\nexports.zeros = zeros;\nexports.ones = ones;\nexports.sz = sz;\nexports.rect = rect;\nexports.rectPt = rectPt;\nexports.rect_zeros = rect_zeros;\nfunction clamp(val, min, max) {\n    return Math.max(Math.min(val, max), min);\n}\nfunction fract(val) {\n    return val - Math.floor(val);\n}\nfunction leftVal(val) {\n    if (val < 0)\n        return -(Math.ceil(Math.abs(val)));\n    return Math.floor(val);\n}\nfunction rightVal(val) {\n    if (val < 0)\n        return -(Math.floor(Math.abs(val)));\n    return Math.ceil(val);\n}\nclass Point2d {\n    constructor(x = 0, y = 0) {\n        this.x = x;\n        this.y = y;\n    }\n    equals(p) {\n        return p.x == this.x && p.y == this.y;\n    }\n    addPt(p) {\n        return new Point2d(this.x + p.x, this.y + p.y);\n    }\n    add(x, y) {\n        return new Point2d(this.x + x, this.y + y);\n    }\n    subPt(p) {\n        return new Point2d(this.x - p.x, this.y - p.y);\n    }\n    sub(x, y) {\n        return new Point2d(this.x - x, this.y - y);\n    }\n    mulPt(p) {\n        return new Point2d(this.x * p.x, this.y * p.y);\n    }\n    divPt(p) {\n        return new Point2d(this.x / p.x, this.y / p.y);\n    }\n    coeff(coeff) {\n        return new Point2d(this.x * coeff, this.y * coeff);\n    }\n    rotated(c, angle) {\n        const sin = Math.sin(angle);\n        const cos = Math.cos(angle);\n        const off = this.subPt(c);\n        const newx = off.x * cos - off.y * sin + c.x;\n        const newy = off.x * sin + off.y * cos + c.y;\n        return new Point2d(newx, newy);\n    }\n    clamp(min, max) {\n        return pt(clamp(this.x, min.x, max.x), clamp(this.y, min.y, max.y));\n    }\n    round() {\n        return pt(Math.round(this.x), Math.round(this.y));\n    }\n    floor() {\n        return pt(Math.floor(this.x), Math.floor(this.y));\n    }\n    min(p) {\n        return pt(Math.min(this.x, p.x), Math.min(this.y, p.y));\n    }\n    max(p) {\n        return pt(Math.max(this.x, p.x), Math.max(this.y, p.y));\n    }\n    even() {\n        const rx = Math.round(this.x);\n        const ry = Math.round(this.y);\n        return pt(rx - rx % 2, ry - ry % 2);\n    }\n    norm() {\n        return Math.hypot(this.x, this.y);\n    }\n}\nexports.Point2d = Point2d;\n;\nfunction pt(x, y) { return new Point2d(x, y); }\nfunction zeros() { return new Point2d(0, 0); }\nfunction ones() { return new Point2d(1, 1); }\nfunction sz(w, h) { return new Point2d(w, h); }\nclass Rect {\n    constructor(xy = zeros(), wh = ones()) {\n        this.xy = xy;\n        this.wh = wh;\n    }\n    center() {\n        return this.xy.addPt(this.wh.coeff(0.5));\n    }\n    coeff(coeff) {\n        return new Rect(this.xy.coeff(coeff), this.wh.coeff(coeff));\n    }\n    contains(p) {\n        return (p.x > this.xy.x && p.y > this.xy.y && p.x < this.xy.x + this.wh.x && p.y < this.xy.y + this.wh.y);\n    }\n    overlaps(rct) {\n        return (rct.xy.x + rct.wh.x > this.xy.x && rct.xy.x < this.xy.x + this.wh.x && rct.xy.y + rct.wh.y > this.xy.y && rct.xy.y < this.xy.y + this.wh.y);\n    }\n}\nexports.Rect = Rect;\nfunction rect(x, y, w, h) { return new Rect(pt(x, y), sz(w, h)); }\nfunction rectPt(xy, wh) { return new Rect(xy, wh); }\nfunction rect_zeros() { return new Rect(zeros(), zeros()); }\n\n\n//# sourceURL=webpack://mind-graph/./ts/math.ts?");

/***/ }),

/***/ "./ts/node.ts":
/*!********************!*\
  !*** ./ts/node.ts ***!
  \********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Node = exports.GrabPoint = void 0;\nconst math_1 = __webpack_require__(/*! ./math */ \"./ts/math.ts\");\nconst types_1 = __webpack_require__(/*! ./types */ \"./ts/types.ts\");\nconst mathjax_1 = __webpack_require__(/*! ../js/mathjax */ \"./js/mathjax.js\");\nconst CORNER_R = 10;\nconst TITLE_H = 20;\nconst MIN_SZ = 25;\nclass GrabPoint {\n    constructor(pos, radius, parent = null, hoverCursor = 'grab', grabCursor = 'grabbed') {\n        this.xy = (0, math_1.zeros)();\n        this.r = 0;\n        this.parent = null;\n        this.grabCursor = 'grab';\n        this.hoverCursor = 'grabbed';\n        this.xy = pos;\n        this.r = radius;\n        this.parent = parent;\n        this.hoverCursor = hoverCursor;\n        this.grabCursor = grabCursor;\n    }\n    checkHover() {\n        const dc = types_1.DC.inst;\n        const gpos = dc.globalPt(this.xy);\n        const hover = gpos.subPt(dc.mouse).norm() < this.r * dc.scale;\n        if (hover) {\n            dc.hoverObj = this;\n            dc.hoverOff = gpos.subPt(dc.mouse).coeff(1 / dc.scale);\n            dc.grabbable = true;\n            dc.grabCursor = this.grabCursor;\n            dc.hoverCursor = this.hoverCursor;\n        }\n        return hover;\n    }\n    moveTo(to) {\n        this.xy = to;\n        this.parent.grabPointMoved(this);\n    }\n}\nexports.GrabPoint = GrabPoint;\nclass Node {\n    constructor(nom, rct, contentId = \"\") {\n        this.nom = \"\";\n        this.rct = (0, math_1.rect_zeros)();\n        this.sizeCorner = new GrabPoint((0, math_1.zeros)(), CORNER_R, this, 'nwse-resize', 'nwse-resize');\n        this.nom = nom;\n        const dc = types_1.DC.inst;\n        const testText = 'Foo Foo Foo Foo Foo Foo FooFoo';\n        const html = `\r\n            <div class=\"node-head\" style=\"background-color:${dc.thm.edge};border-radius:${CORNER_R}px ${CORNER_R}px 0px 0px\">${nom}</div>\r\n            <div class=\"node-body\" style=\"background-color:${dc.thm.main};border-radius:0px 0px ${CORNER_R}px ${CORNER_R}px\">\r\n                <div id=\"content\">\r\n                    <span class=\"definition\">Множество</span> — объект, <span class=\"defined\">состоящий</span> из <span class=\"defined\">принадлежащих ему</span> <span class=\"definition\">элементов</span>:\r\n                    <div class=\"formula\">\r\n                        [A = \\\\{a,b,c\\\\} \\\\;\\\\;\\\\; \\\\Rightarrow \\\\;\\\\;\\\\; a,b,c \\\\in A.]\r\n                    </div>\r\n                </div>\r\n            </div>\r\n            `;\n        var div = document.createElement('div');\n        document.body.appendChild(div);\n        div.classList.add('node');\n        div.classList.add('math');\n        div.innerHTML = html;\n        div.style.borderRadius = CORNER_R + 'px';\n        this.content = div;\n        (0, mathjax_1.typesetMathJax)(div);\n        this.updateRect(rct.xy, rct.wh);\n    }\n    checkHover() {\n        if (this.sizeCorner.checkHover())\n            return true;\n        const dc = types_1.DC.inst;\n        const titleHsc = TITLE_H * dc.scale;\n        const grect = dc.globalRect(this.rct);\n        const trect = (0, math_1.rect)(grect.xy.x, grect.xy.y - titleHsc, grect.wh.x, titleHsc);\n        const grectC = grect.contains(dc.mouse);\n        const trectC = trect.contains(dc.mouse);\n        if (grectC || trectC) {\n            dc.hoverObj = this;\n            dc.hoverOff = grect.xy.subPt(dc.mouse).coeff(1 / dc.scale);\n            dc.grabbable = trectC;\n            if (trectC) {\n                dc.hoverCursor = 'grab';\n                dc.grabCursor = 'grabbing';\n            }\n            else {\n                dc.hoverCursor = '';\n            }\n            return true;\n        }\n        return false;\n    }\n    setZ(z) {\n        if (this.content) {\n            this.content.style.zIndex = '' + z;\n        }\n    }\n    updateContent() {\n        const dc = types_1.DC.inst;\n        if (this.content) {\n            const gxy = dc.globalPt(this.rct.xy.subPt((0, math_1.pt)(0, 1).coeff(TITLE_H)));\n            this.content.style.left = gxy.x + 'px';\n            this.content.style.top = gxy.y + 'px';\n            this.content.style.width = this.rct.wh.x + 'px';\n            this.content.style.height = this.rct.wh.y + 'px';\n            this.content.style.transform = 'scale(' + dc.scale + ')';\n            this.content.style.transformOrigin = 'left top';\n        }\n    }\n    updateRect(xy = this.rct.xy, wh = this.rct.wh) {\n        const dc = types_1.DC.inst;\n        this.rct.xy = xy;\n        this.rct.wh = wh;\n        this.sizeCorner.xy = this.rct.xy.addPt(this.rct.wh.subPt((0, math_1.ones)().coeff(CORNER_R)));\n        this.updateContent();\n    }\n    grabPointMoved(gp) {\n        const dc = types_1.DC.inst;\n        if (gp == this.sizeCorner) {\n            this.updateRect(this.rct.xy, gp.xy.subPt(this.rct.xy).max((0, math_1.ones)().coeff(MIN_SZ)).addPt((0, math_1.ones)().coeff(CORNER_R)));\n        }\n    }\n    setClass(name, on) {\n        if (this.content) {\n            if (on)\n                this.content.classList.add(name);\n            else\n                this.content.classList.remove(name);\n        }\n    }\n}\nexports.Node = Node;\n\n\n//# sourceURL=webpack://mind-graph/./ts/node.ts?");

/***/ }),

/***/ "./ts/theme.ts":
/*!*********************!*\
  !*** ./ts/theme.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Theme = void 0;\nexports.parseColor = parseColor;\nfunction parseColor(str) {\n    if (str.startsWith(\"#\")) {\n        return str;\n    }\n    else if (str.startsWith(\"rgba\")) {\n        return str;\n    }\n    else if (str.startsWith(\"rgb\")) {\n        return str;\n    }\n    else {\n        return str;\n    }\n    return \"magenta\";\n}\nclass Theme {\n    constructor() {\n        this.bg = \"#000001\";\n        this.main = \"#4A2545\";\n        this.edge = \"#824C71\";\n        this.text = \"#DCCCA3\";\n        this.alt = \"#90AA86\";\n    }\n}\nexports.Theme = Theme;\n\n\n//# sourceURL=webpack://mind-graph/./ts/theme.ts?");

/***/ }),

/***/ "./ts/types.ts":
/*!*********************!*\
  !*** ./ts/types.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.DC = exports.DrawContext = exports.ClbkSelf = void 0;\nexports.clbkself = clbkself;\nconst math_1 = __webpack_require__(/*! ./math */ \"./ts/math.ts\");\nconst theme_1 = __webpack_require__(/*! ./theme */ \"./ts/theme.ts\");\nclass ClbkSelf {\n    constructor(clbk, self) {\n        this.clbk = clbk;\n        this.self = self;\n    }\n    bound() {\n        return this.clbk.bind(this.self);\n    }\n}\nexports.ClbkSelf = ClbkSelf;\nfunction clbkself(clbk, self) { return new ClbkSelf(clbk, self); }\nclass DrawContext {\n    constructor() {\n        this.cvid = \"cv\";\n        this.cv = document.getElementById(this.cvid);\n        this.ctx = this.cv.getContext(\"2d\");\n        this.thm = new theme_1.Theme();\n        this.off = (0, math_1.zeros)();\n        this.scale = 1.0;\n        this.mobile = false;\n        this.mouse = (0, math_1.zeros)();\n        this.mouseDown = false;\n        this.hoverObj = null;\n        this.hoverOff = (0, math_1.zeros)();\n        this.hoverCursor = 'grab';\n        this.grabCursor = 'grabbed';\n        this.grabbable = false;\n        this.grabObj = null;\n        this.grabOff = (0, math_1.zeros)();\n        this.focusObj = null;\n    }\n    localPt(p) {\n        return p.subPt(this.off).coeff(1 / this.scale);\n    }\n    globalPt(p) {\n        return p.coeff(this.scale).addPt(this.off);\n    }\n    globalRect(r) {\n        return (0, math_1.rectPt)(this.globalPt(r.xy), r.wh.coeff(this.scale));\n    }\n}\nexports.DrawContext = DrawContext;\n;\nclass DC {\n    constructor() {\n        this.dc = new DrawContext();\n    }\n    static get inst() {\n        if (!this._inst)\n            this._inst = new this();\n        return this._inst.dc;\n    }\n}\nexports.DC = DC;\n\n\n//# sourceURL=webpack://mind-graph/./ts/types.ts?");

/***/ }),

/***/ "./ts/util.ts":
/*!********************!*\
  !*** ./ts/util.ts ***!
  \********************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.getCurMillis = getCurMillis;\nfunction getCurMillis() {\n    return Date.now();\n}\n\n\n//# sourceURL=webpack://mind-graph/./ts/util.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./ts/main.ts");
/******/ 	
/******/ })()
;