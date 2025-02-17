import { Node, GrabPoint, TITLE_H, CORNER_R } from "./node"
import { EventManager } from "./evtman"
import { Point2d, pt, Rect, rect, rect_zeros, rectPt, zeros } from "./math"
import { DC } from "./dc"
import { getCurMillis } from "./util"
import { sign } from "crypto"

let lastDraw = 0
let lastUpdate = 0

let winSize : Point2d = zeros()

let lastMousePos = zeros()
let lastMouseDownPos = zeros()
let lastMouseDownTime = 0
let lastResize = 0
let movedThisMouseDownTime = false
let zoomedThisMouseDownTime = false
let mouseIsDown0 = false
let mouseIsDown2 = false
let panning = false

let targetPos : Point2d | null = null
let targetStartScale = 1.0
let targetScale = 1.0
let targetStartPos : Point2d = zeros()
let targetPosSetTime = 0
let targetPosTimout = 250

let lastRszFStitle = ""
let lastRszScale = 1.0
let lastRszPos = zeros()

let off = zeros()
let curOff = zeros()

let nodes = new Array<Node>()

let selectionTime = 0
let selectionFrame : HTMLDivElement | null = null
let selectionStartFrame : Rect | null = null
let selectionFrameRect : Rect = rect_zeros()
let selectionMoving = false

function insertAfter(referenceNode : any, newNode : any) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function init() {
    DC.inst.init()
    updateCanvas()
    winSize = pt(window.innerWidth, window.innerHeight)
    DC.inst.off = off = winSize.coeff(0.5)

    initDeviceStatus()
    initInputEvents()

    nodes.push(new Node('math', rect(-146, -81, 300, 379)))
    nodes.push(new Node('sets', rect(256, -159, 276, 105)))
    nodes.push(new Node('alg', rect(255, 93, 314, 263)))

    const container = document.getElementById('container')
    selectionFrame = document.createElement('div')
    selectionFrame.id = 'selectionFrame'
    selectionFrame.classList.add("node", 'selection')
    selectionFrame.style.visibility = 'false'
    insertAfter(container, selectionFrame)

    render()
}

function updateCanvas() {
    DC.inst.setSize()
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

function scrollToFit(n: Node) {
    const dc = DC.inst
    const vrct = dc.visibleRect()
    targetStartPos = dc.off
    targetStartScale = dc.scale
    targetScale = targetStartScale
    targetPos = pt((n.rct.xy.x < vrct.xy.x) ? 
            (-dc.scale * n.rct.xy.x + 10) : (
                (n.rct.xy.x + n.rct.wh.x > vrct.xy.x + vrct.wh.x) ? 
                (-targetScale * (n.rct.xy.x + n.rct.wh.x - vrct.wh.x) - 10) : 
                dc.off.x
            ), (n.rct.xy.y < vrct.xy.y) ? 
            (-dc.scale * (n.rct.xy.y - TITLE_H) + 10) : (
                (n.rct.xy.y + n.rct.wh.y > vrct.xy.y + vrct.wh.y) ? 
                (-targetScale * (n.rct.xy.y + n.rct.wh.y - vrct.wh.y) - 10) : 
                dc.off.y
            )
        )
    targetPosSetTime = getCurMillis()
    EventManager.inst.setEnabled(false)
}

function scrollToCenter(n: Node, resetScale = false) {
    const dc = DC.inst
    targetStartPos = dc.off
    targetStartScale = dc.scale
    targetScale = resetScale ? 1.0 : dc.scale
    targetPos = n.rct.center().sub(innerWidth * 0.5/targetScale, innerHeight * 0.5/targetScale).coeff(-targetScale)
    targetPosSetTime = getCurMillis()
    EventManager.inst.setEnabled(false)
}

function focusOnNode(n: Node, moveIfFits = true, snap = true) {
    const dc = DC.inst

    if (dc.focusObj == n)
        return

    if (dc.focusObj && selectionFrame) {
        selectionTime = getCurMillis()
        selectionStartFrame = selectionFrameRect.clone()
        selectionMoving = true
        EventManager.inst.setEnabled(false)
    }

    const idx = nodes.indexOf(n)
    nodes[idx].selected = true
    nodes.splice(idx, 1)
    nodes.unshift(n)
    dc.focusObj = n
    for (let i = 0; i < nodes.length; ++i) {
        const n = nodes[i]
        n.setClass('unselectable', true)
        n.setZ(nodes.length - i)
        n.selected = false
    }
    dc.focusObj.setClass('unselectable', false)
    resetSelection()

    if (selectionFrame && selectionMoving) {
        const sf = $(selectionFrame)
        if ((sf.css('display') == 'none') || snap) {
            EventManager.inst.setEnabled(true)
            selectionTime = getCurMillis() - 250
            selectionStartFrame = rectPt(dc.focusObj.rct.xy.subPt(pt(0, 1).coeff(TITLE_H)), dc.focusObj.rct.wh)
            sf.show()
            selectionMoving = false
        }
    }

    if (moveIfFits && !dc.focusObj.inBoundsFully)
        scrollToFit(dc.focusObj)
}

function moveFocus(from: Point2d, dir: Point2d, frustum : boolean, final = false) {
    const dc = DC.inst
    let minscore = Infinity
    let minscoreObj = null
    for (let i = 0; i < nodes.length; ++i) {
        const n = nodes[i]
        if (n == dc.focusObj)
            continue
        const center = n.rct.center()
        const xsignok = (dir.x == 0 || Math.sign(center.x - from.x) == Math.sign(dir.x))
        if (!xsignok) 
            continue
        const ysignok = (dir.y == 0 || Math.sign(center.y - from.y) == Math.sign(dir.y))
        if (!ysignok) 
            continue
        const diff = ((dir.x != 0) ? Math.abs(center.x - from.x) : Math.abs(center.y - from.y)) / 3
        const score = diff + (frustum ? (((dir.x == 0) ? Math.abs(center.x - from.x) : (Math.abs(center.y - from.y)))) : 0)        
        const frustok = !frustum || ((dir.x != 0) ? (Math.abs(center.y - from.y) < diff * 3) : (Math.abs(center.x - from.x) < diff * 3))
        if (!frustok) 
            continue   
        if (score < minscore) {
            minscore = score
            minscoreObj = n
        }
    }
    if (minscoreObj)
        focusOnNode(minscoreObj, true, !dc.focusObj)
    else if (!final) {
        const vrct = DC.inst.visibleRect()
        moveFocus(
            pt((dir.x != 0) ? ((dir.x > 0) ? -1e6 : 1e6) : from.x, (dir.y != 0) ? ((dir.y > 0) ? -1e6 : 1e6) : from.y), 
            dir, false, true
        )
    }
}

function deselectNodes() {
    DC.inst.focusObj = null
    for (let i = 0; i < nodes.length; ++i) {
        const n = nodes[i]
        n.setClass('unselectable', true)
        n.selected = false
    }
    resetSelection()

    if (selectionFrame) $(selectionFrame).hide()
}

function removeNode(node: Node) {
    const dc = DC.inst
    const idx = nodes.indexOf(node)
    nodes[idx].destroy()
    nodes.splice(idx, 1)
    if (dc.grabObj == node)
        dc.grabObj = null
    if (dc.hoverObj == node)
        dc.hoverObj = null
    if (dc.focusObj == node)
        dc.focusObj = null
    dc.justClosed = true
}

function zoom(delta: number, towards: Point2d) {
    const dc = DC.inst
    const coeff = 100 / Math.abs(delta)
    const newScale = (delta == 0) ? (1.0) : (dc.scale - 0.01 * delta * coeff * dc.scale / 10.0);
    if (newScale != dc.scale) {
        off = off.subPt(((towards.subPt(off).subPt(curOff)).coeff(1.0 / dc.scale)).coeff(newScale - dc.scale))
        dc.off = off.addPt(curOff.coeff(1 / (newScale - dc.scale)))
        dc.scale = newScale
        drag()
        if (dc.fsNode) {
            dc.fsNode.rct = dc.visibleRect()
            dc.fsNode.updateContent()
        } else {
            updateContent()
        }
    }
}

function updateTargetPose() {
    const dc = DC.inst
    if (!targetPos)
        return
    const diff = targetPos.subPt(targetStartPos)
    const ms = getCurMillis() - targetPosSetTime
    const t = (ms / targetPosTimout)
    const et = ((t * t) / (2. * (t * t - t) + 1.0));    
    dc.scale = targetStartScale + (targetScale - targetStartScale) * et
    off = dc.off = targetStartPos.addPt(diff.coeff(et))
    if (ms > targetPosTimout) {
        targetPos = null
        EventManager.inst.setEnabled(true)
    }
    updateContent()
}

function updateSelectionFrame() {
    const dc = DC.inst
    if (!selectionFrame || !selectionStartFrame || !dc.focusObj)
        return
    const ms = getCurMillis() - selectionTime
    const t = (ms / 250)
    let et = ((t * t) / (2. * (t * t - t) + 1.0));
    if (ms > targetPosTimout) {
        et = 1.0
        EventManager.inst.setEnabled(true)
        selectionMoving = false
    }
    const tgxy = dc.globalPt(dc.focusObj.rct.xy.subPt(pt(0, 1).coeff(TITLE_H)))
    const tgwh = dc.focusObj.rct.wh
    const sgxy = dc.globalPt(selectionStartFrame.xy)
    const sgwh = selectionStartFrame.wh
    const gxy = sgxy.addPt(tgxy.subPt(sgxy).coeff(et))
    const gwh = sgwh.addPt(tgwh.subPt(sgwh).coeff(et))
   
    selectionFrameRect = rectPt(dc.localPt(gxy), gwh)
    selectionFrame.style.left = gxy?.x + 'px'
    selectionFrame.style.top = gxy?.y + 'px'
    selectionFrame.style.width = gwh.x + 'px'
    selectionFrame.style.height = (gwh.y + TITLE_H) + 'px'
    selectionFrame.style.transform = 'scale(' + dc.scale + ')'
    selectionFrame.style.transformOrigin = 'left top'
    selectionFrame.style.outlineWidth = (2 / dc.scale) + 'px'
    selectionFrame.style.outlineColor = dc.thm.text
    selectionFrame.style.borderRadius = CORNER_R + 'px'
    selectionFrame.style.zIndex = nodes.length + ''
}

function toggleNodeFullscreen(n: Node) {
    focusOnNode(n, false)
    const dc = DC.inst    
    n.targetRszStartRect = n.rct
    n.targetRszSetTime = getCurMillis()
    n.targetRszTimout = 250
    targetStartPos = dc.off
    targetStartScale = dc.scale
    targetPosSetTime = getCurMillis()
    if (dc.fsNode) {
        targetPos = lastRszPos
        targetScale = lastRszScale
        n.targetRszRect = n.lastRszFSrect
        n.targetRszCallback = (node)=>{
            dc.fsNode?.setClass("fullscreen", false)
            dc.fsNode = null
            if (selectionFrame) $(selectionFrame).show()
            EventManager.inst.setEnabled(true)            
        }
        document.title = lastRszFStitle
    } else {
        targetScale = 1.0
        const vr = dc.visibleRect(targetScale)
        const rc = n.rct.center()
        const vr2 = rectPt(rc.subPt(vr.wh.coeff(0.5)), vr.wh)
        targetPos = vr2.xy.coeff(-1)
        n.lastRszFSrect = rectPt(n.rct.xy, n.rct.wh)
        n.targetRszRect = vr2
        lastRszFStitle = document.title
        lastRszScale = dc.scale
        lastRszPos = dc.off
        n.targetRszCallback = (node)=>{
            dc.fsNode = node
            document.title = node.title
            node.setClass("fullscreen", true)
            if (selectionFrame) $(selectionFrame).hide()
            EventManager.inst.setEnabled(true)
        }        
    }
    EventManager.inst.setEnabled(false)
    n.targetRsz = true;
}

function initInputEvents() {
    const dc = DC.inst

    window.addEventListener('resize', function(e){
        updateCanvas()        
        lastResize = this.performance.now()
        const newWinSize = pt(this.window.innerWidth, this.window.innerHeight)
        EventManager.inst.notify("cansz", newWinSize)  
        off = dc.off = dc.off.addPt(newWinSize.subPt(winSize).coeff(0.5))
        if (dc.fsNode) {
            dc.fsNode.rct = dc.visibleRect()
            dc.fsNode.updateContent()
        } else {
            updateContent()
        }
        winSize = pt(this.window.innerWidth, this.window.innerHeight)
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
                const point = pt(e.clientX, e.clientY)
                EventManager.inst.notify("mousedown", point)
                EventManager.inst.setMousePos(point)
                
                if (EventManager.inst.enabled && !dc.fsNode) {
                    lastMouseDownPos = point
                    if (e.button == 2) {
                        mouseIsDown2 = true
                        dc.mouse = point
                        dc.mouseDown = true
                        panning = true             
                    } else if (e.button == 0) {
                        mouseIsDown0 = true
                        lastMouseDownTime = getCurMillis()
                        movedThisMouseDownTime = false
                        if (dc.hoverObj) {
                            if (dc.hoverObj instanceof Node)
                                focusOnNode(dc.hoverObj, false);
                            else if (dc.hoverObj instanceof GrabPoint)
                                if (dc.hoverObj.nom == "close")
                                    dc.hoverObj.parent.closed = true
                                else if (dc.hoverObj.nom == "pin")
                                    dc.hoverObj.parent.debug()
                                else if (dc.hoverObj.parent && dc.hoverObj.parent instanceof Node)
                                    focusOnNode(dc.hoverObj.parent, false);
                            
                            if (dc.grabbable) {
                                dc.grabObj = dc.hoverObj
                                dc.grabOff = dc.hoverOff
                            }
                            panning = false
                        }
                    }
                }
            }
        })
        window.addEventListener('mousemove', function(e) {
            lastMousePos = pt(e.clientX, e.clientY)
            EventManager.inst.notify("mousemove", lastMousePos)
            EventManager.inst.setMousePos(lastMousePos)
            
            if (EventManager.inst.enabled && !dc.fsNode) {
                dc.mouse = lastMousePos
                movedThisMouseDownTime = lastMousePos.subPt(lastMouseDownPos).norm() > 10
                if (mouseIsDown0) {
                    drag()
                }                
                if (mouseIsDown2 && panning) {
                    curOff = lastMousePos.subPt(lastMouseDownPos)
                    dc.off = off.addPt(curOff)
                    updateContent()
                }
            }
        })
        window.addEventListener('mouseup', function(e) {
            EventManager.inst.notify("mouseup", pt(e.clientX, e.clientY))

            if (EventManager.inst.enabled && !dc.fsNode) {
                dc.mouseDown = false            
                if (e.button == 0 && dc.grabObj) {
                    dc.grabObj = null
                } else if (e.button == 2) {
                    off = off.addPt(curOff);
                    curOff = zeros()
                    panning = false
                }
                if (e.button == 0 && !dc.hoverObj && !dc.grabObj && !dc.justClosed && !movedThisMouseDownTime) {
                    deselectNodes()
                }
                dc.justClosed = false
                if (e.button == 0)
                    mouseIsDown0 = false
                if (e.button == 2)
                    mouseIsDown2 = false
            }
        })
        window.addEventListener('wheel', function(e) {
            if (e.ctrlKey) {
                e.preventDefault()
            }
            EventManager.inst.notify("wheel", pt(e.deltaX, -e.deltaY))
            
            if (EventManager.inst.enabled && !dc.fsNode) {
                lastMousePos = pt(e.clientX, e.clientY)
                zoom(e.deltaY, lastMousePos)
            }
        }, { passive: false })
        window.ondragstart = function() {return false}
        jQuery(document).on("keydown", function(e) {
            if (EventManager.inst.enabled) {
                const vrct = dc.visibleRect()
                if (!mouseIsDown0 && !mouseIsDown2) {
                    if (!dc.fsNode) {
                        switch(e.which) {
                            case 37:
                            EventManager.inst.notify("keypress", "left")
                            moveFocus(dc.focusObj ? dc.focusObj.rct.center() : pt(vrct.xy.x + vrct.wh.x, vrct.xy.y + vrct.wh.y * 0.5), pt(-1, 0), dc.focusObj);
                            break;
                        case 38:
                            EventManager.inst.notify("keypress", "up")
                            moveFocus(dc.focusObj ? dc.focusObj.rct.center() : pt(vrct.xy.x + vrct.wh.x * 0.5, vrct.xy.y + vrct.wh.y), pt(0, -1), dc.focusObj);
                            break;
                        case 39:
                            EventManager.inst.notify("keypress", "right")
                            moveFocus(dc.focusObj ? dc.focusObj.rct.center() : pt(vrct.xy.x, vrct.xy.y + vrct.wh.y * 0.5), pt(1, 0), dc.focusObj);
                            break;
                        case 40: // down
                            EventManager.inst.notify("keypress", "down")
                            moveFocus(dc.focusObj ? dc.focusObj.rct.center() : pt(vrct.xy.x + vrct.wh.x * 0.5, vrct.xy.y), pt(0, 1), dc.focusObj);
                            break;
                        default: break;
                        }
                    }
                    if (e.ctrlKey && e.key == 'c') {
                        EventManager.inst.notify("copy", null)
                    } else if (e.ctrlKey && e.key == 'v') {
                        EventManager.inst.notify("paste", null)
                    } else if (e.ctrlKey && e.key == 'a') {
                        EventManager.inst.notify("selectall", null)
                    } else if (e.which == 13) {
                        if (dc.focusObj && !dc.fsNode)
                            scrollToCenter(dc.focusObj, true)
                    } else if (dc.focusObj && dc.focusObj instanceof Node && e.key == 'f') {
                        toggleNodeFullscreen(dc.focusObj as Node)
                    }
                    if (e.ctrlKey && (e.which == 61 || e.which == 107 || e.which == 173 || e.which == 109  || e.which == 187  || e.which == 189 || e.which == 48 ) ) {
                        e.preventDefault();
                        if (e.which == 109 || e.which == 173 || e.which == 189)
                            zoom(100, pt(window.innerWidth, window.innerHeight).coeff(0.5))
                        else if (e.which == 107 || e.which == 61 || e.which == 187)
                            zoom(-100, pt(window.innerWidth, window.innerHeight).coeff(0.5))
                        else if (e.which == 48)
                            zoom(0, pt(window.innerWidth, window.innerHeight).coeff(0.5))
                    }
                }
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
    nodes.forEach(n => {
        n.updateContent()
    });
}

function render() {
    const dc = DC.inst
    dc.hoverObj = null
    dc.grabbable = false

    if (targetPos)
        updateTargetPose()
    
    updateSelectionFrame()

    if (dc.fsNode) {
        dc.fsNode.checkContentState()
    } else {
        const toRm : Array<Node> = []
        nodes.forEach(n => {
            if (n.closed) {
                toRm.push(n)
            } else {
                if (!dc.hoverObj)
                    n.checkHover()
                n.checkContentState()
            }
        });
        toRm.forEach(n => {
            removeNode(n)
        })
    }
    requestAnimationFrame(render)
    
    if (dc.hoverObj || dc.grabObj || panning)
        $('body').css('cursor', panning ? 'grabbing' : (dc.grabObj ? dc.grabCursor : dc.hoverCursor))
    else
        $('body').css('cursor', '')

    if (dc.grabObj) {
        $('body').addClass('unselectable')
    } else {
        $('body').removeClass('unselectable')
    }

    dc.render()
}

$(window).on('load', function () {
    init()
})

//TODO:
//scroll
//image view transition
//refactor
//ctrl arrows move ctrl+shift arrows resize\
//wasd and shift+wasd pan

//focus history, alt arrows navig
//links
//Ctrl links
//enter arrows links navig

