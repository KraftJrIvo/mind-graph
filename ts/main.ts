import { Node, GrabPoint } from "./node"
import { EventManager } from "./evtman"
import { Grid } from "./grid"
import { pt, rect, zeros } from "./math"
import { clbkself, DC } from "./types"
import { getCurMillis } from "./util"

let lastDraw = 0
let lastUpdate = 0

let lastMousePos = zeros()
let lastMouseDownPos = zeros()
let lastMouseDownTime = 0
let lastResize = 0
let movedThisMouseDownTime = false
let zoomedThisMouseDownTime = false
let mouseIsDown = false
let panning = false

let off = zeros()
let curOff = zeros()

let grid = new Grid()
let nodes = new Array<Node>()

function init() {
    updateCanvas()
    DC.inst.off = off = pt(window.innerWidth, window.innerHeight).coeff(0.5)

    initDeviceStatus()
    initInputEvents()

    nodes.push(new Node("haha test", rect(-150, -50, 300, 100)))
    nodes.push(new Node("haha test 2", rect(200, -50, 100, 150)))
    nodes.push(new Node("haha test 3", rect(-150, 100, 200, 200)))

    render()
}

function updateCanvas() {
    const dc = DC.inst
    dc.cv.width = window.innerWidth
    dc.cv.height = window.innerHeight
}

function initDeviceStatus() {
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) 
    { 
        const dc = DC.inst
        dc.mobile = true
    }
}

function drag() {
    const dc = DC.inst
    if (dc.grabObj) {
        const to = dc.localPt(dc.mouse).addPt(dc.grabOff)
        if (dc.grabObj instanceof Node)
            (dc.grabObj as Node).updateRect(to)
        else if (dc.grabObj instanceof GrabPoint)
            (dc.grabObj as GrabPoint).moveTo(to)
    }
}

function focusOnNode(e: Node) {
    const dc = DC.inst
    const idx = nodes.indexOf(e)
    nodes.splice(idx, 1)
    nodes.unshift(e)
    dc.focusObj = e
    for (let i = 0; i < nodes.length; ++i) {
        const n = nodes[i]
        n.setClass('unselectable', true)
        n.setZ(nodes.length - i);
    }
    dc.focusObj.setClass('unselectable', false)
}

function initInputEvents() {
    const dc = DC.inst

    window.addEventListener('resize', function(e){
        updateCanvas()        
        lastResize = this.performance.now()
        EventManager.inst.notify("cansz", pt(DC.inst.cv.width, DC.inst.cv.height))
    })
    window.addEventListener('click', function(e) {
        if (!movedThisMouseDownTime) {
            EventManager.inst.notify("click", pt(e.clientX, e.clientY))
        }
    })

    if (dc.mobile) {
        
    } else {
        window.addEventListener('contextmenu', function(e) {
            e.preventDefault()
            if (!movedThisMouseDownTime) {
                EventManager.inst.notify("rclick", pt(e.clientX, e.clientY))
            }
        }, false)
        window.onkeydown = (e) => {
            e = e || window.event
            if (e.keyCode == 38) {
                EventManager.inst.notify("keypress", "up")
            } else if (e.keyCode == 40) {
                EventManager.inst.notify("keypress", "down")
            } else if (e.keyCode == 37) {
                EventManager.inst.notify("keypress", "left")
            } else if (e.keyCode == 39) {
                EventManager.inst.notify("keypress", "right")
            } else if (e.keyCode == 16) {
                EventManager.inst.shift = true
            } else if (e.keyCode == 82) {
                EventManager.inst.notify("keypress", "r")
            }
        }
        window.onkeyup = (e) => {
            e = e || window.event
            if (e.keyCode == 16) {
                EventManager.inst.shift = false
            }
        }
        window.addEventListener('mousedown', function(e) { 
            if (e.button == 1) {
                e.preventDefault()
                EventManager.inst.notify("wclick", pt(e.clientX, e.clientY))
            } else {
                lastMouseDownTime = getCurMillis()
                const point = pt(e.clientX, e.clientY)
                dc.mouse = point
                dc.mouseDown = true
                EventManager.inst.notify("mousedown", point)
                EventManager.inst.setMousePos(point)
                mouseIsDown = true
                movedThisMouseDownTime = false
                if (dc.hoverObj) {
                    if (dc.hoverObj instanceof Node)
                        focusOnNode(dc.hoverObj);
                    else if (dc.hoverObj instanceof GrabPoint)
                        if (dc.hoverObj.parent && dc.hoverObj.parent instanceof Node)
                            focusOnNode(dc.hoverObj.parent);
                    
                    if (dc.grabbable) {
                        dc.grabObj = dc.hoverObj
                        dc.grabOff = dc.hoverOff
                    }
                    panning = false
                } else {
                    lastMouseDownPos = point
                    panning = true
                }
            }
        })
        window.addEventListener('mousemove', function(e) {
            lastMousePos = pt(e.clientX, e.clientY)
            dc.mouse = lastMousePos
            EventManager.inst.notify("mousemove", lastMousePos)
            EventManager.inst.setMousePos(lastMousePos)
            movedThisMouseDownTime = lastMousePos.subPt(lastMouseDownPos).norm() > 10

            if (mouseIsDown) {
                drag()                
                if (panning) {
                    curOff = lastMousePos.subPt(lastMouseDownPos)
                    dc.off = off.addPt(curOff)
                    updateContent()
                }
            }
        })
        window.addEventListener('mouseup', function(e) {
            EventManager.inst.notify("mouseup", pt(e.clientX, e.clientY))
            mouseIsDown = false
            dc.mouseDown = false
            
            if (dc.grabObj) {
                dc.grabObj = null
            } else {
                off = off.addPt(curOff);
            }
            curOff = zeros()

        })
        window.addEventListener('wheel', function(e) {
            lastMousePos = pt(e.clientX, e.clientY)
            EventManager.inst.notify("wheel", pt(e.deltaX, -e.deltaY))

            const newScale = dc.scale - 0.01 * e.deltaY * dc.scale / 10.0;
            if (newScale != dc.scale) {
                off = off.subPt(((lastMousePos.subPt(off).subPt(curOff)).coeff(1.0 / dc.scale)).coeff(newScale - dc.scale))
                dc.off = off.addPt(curOff.coeff(1 / (newScale - dc.scale)))
                dc.scale = newScale
                drag()
                updateContent()
            }
        })
        jQuery(document).on("keydown", function(e) {
            if (e.ctrlKey && e.key == 'c') {
                EventManager.inst.notify("copy", null)
            } else if (e.ctrlKey && e.key == 'v') {
                EventManager.inst.notify("paste", null)
            } else if (e.ctrlKey && e.key == 'a') {
                EventManager.inst.notify("selectall", null)
            }
        })
    }
}

function resetSelection() {
    if (window.getSelection) {
        const ws = window.getSelection()
        if (ws) {
            if (ws.empty)
                ws.empty()
            else if (ws.removeAllRanges)
                ws.removeAllRanges()
        }
    }
}

function updateContent() {
    nodes.forEach(e => {
        e.updateContent()
    });
}

function render() {
    const dc = DC.inst
    dc.hoverObj = null
    dc.grabbable = false

    grid.draw()    
    nodes.forEach(e => {
        if (!dc.hoverObj)
            e.checkHover()
    });
    requestAnimationFrame(render)
    
    if (dc.hoverObj || dc.grabObj)
        $('body').css('cursor', dc.grabObj ? dc.grabCursor : dc.hoverCursor)
    else
        $('body').css('cursor', '')

    if (dc.grabObj) {
        resetSelection()
        $('body').addClass('unselectable')
    } else {
        $('body').removeClass('unselectable')
    }
}

$(window).on('load', function () {
    init()
})