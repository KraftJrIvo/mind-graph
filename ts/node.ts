import {ones, Point2d, pt, rect, Rect, rect_zeros, rectPt, zeros} from "./math"
import { clbkself } from "./types"
import { DC } from "./dc"

import { typesetMathJax } from "../js/mathjax"
import { EventManager } from "./evtman"

import { getHoveredImage, viewFullScreen } from "./util"

const CORNER_R = 10
const TITLE_H = 20
const MIN_SZ = 25
const MIN_SCALE = 0.4
const FADE_MS = 400

export class GrabPoint {
    public xy : Point2d = zeros()
    public r : number = 0
    public parent : any = null
    public grabCursor : string = 'grab'
    public hoverCursor : string = 'grabbed'

    constructor(pos : Point2d, radius : number, parent : any = null, hoverCursor: string = 'grab', grabCursor: string = 'grabbed') {
        this.xy = pos
        this.r = radius
        this.parent = parent
        this.hoverCursor = hoverCursor
        this.grabCursor = grabCursor
    }

    checkHover() {
        const dc = DC.inst
        const gpos = dc.globalPt(this.xy)
        const hover = gpos.subPt(dc.mouse).norm() < this.r * dc.scale
        if (hover) {
            dc.hoverObj = this
            dc.hoverOff = gpos.subPt(dc.mouse).coeff(1 / dc.scale)
            dc.grabbable = true
            dc.grabCursor = this.grabCursor
            dc.hoverCursor = this.hoverCursor
        }
        return hover
    }

    moveTo(to: Point2d) {
        this.xy = to
        this.parent.grabPointMoved(this)
    }
}

export class Node {
    public nom : string = ""
    public rct : Rect = rect_zeros()
    public inBounds : boolean = false
    public contentVisible : boolean = false
    public contentInProgress : boolean = false
    public contentLoading : boolean = false
    public contentLoaded : boolean = false
    public content : HTMLDivElement | null = null
    public sizeCorner : GrabPoint = new GrabPoint(zeros(), CORNER_R, this, 'nwse-resize', 'nwse-resize')

    private _evt_click_idx: number

    constructor(nom : string, rct : Rect, contentId : string = "") {
        this.nom = nom

        const dc = DC.inst

        this._evt_click_idx = EventManager.inst.subscribe("click", clbkself( this.clbk_click, this))

        this.updateRect(rct.xy, rct.wh)
    }

    checkHover(click = false) {
        if (this.sizeCorner.checkHover())
            return true
        const dc = DC.inst
        const titleHsc = TITLE_H * dc.scale
        const grect = dc.globalRect(this.rct)
        const trect = rect(grect.xy.x, grect.xy.y - titleHsc, grect.wh.x, titleHsc)
        const grectC = grect.contains(dc.mouse)
        const trectC = trect.contains(dc.mouse)
        if (grectC || trectC) {
            dc.hoverObj = this
            dc.hoverOff = grect.xy.subPt(dc.mouse).coeff(1 / dc.scale)
            dc.grabbable = trectC
            if (trectC) {
                dc.hoverCursor = 'grab'
                dc.grabCursor = 'grabbing'
            } else {
                dc.hoverCursor = ''
            }
            if (grectC && !trectC && this.content) {
                const img = getHoveredImage(this.content)
                if (img && img.classList.contains('viewable')) {
                    dc.hoverCursor = 'pointer'
                    if (click) {
                        console.log("!");
                        viewFullScreen(img.currentSrc)
                    }
                }
            }
            return true
        }
        return false
    }

    setContentFlags(elem : any, contentVisible : boolean) {
        this.contentInProgress = false
    }

    checkContentState() {
        const dc = DC.inst

        const inBounds = this.rct.overlaps(dc.visibleRect())
        if (this.content && inBounds != this.inBounds) {
            $(this.content).stop().fadeTo(FADE_MS, inBounds ? 1 : 0)
            this.inBounds = inBounds
        }

        if (!this.contentInProgress) {
            const contVis = inBounds && (dc.scale >= MIN_SCALE)
            if (contVis != this.contentVisible) {
                if (contVis) {
                    if (this.content) {
                        const c = $(this.content).children().first()    
                        c.css('white-space', 'nowrap')                    
                        c.animate({'height': (TITLE_H + 'px'), 'font-size' : '16px'}, FADE_MS / 2, function() {
                            $(this).next().stop().fadeTo(FADE_MS / 2, 1) 
                        })
                        setTimeout(this.setContentFlags.bind(this), FADE_MS + 1)
                        this.contentVisible = contVis
                        this.contentInProgress = true
                    } else {
                        if (!this.contentLoading) {
                            this.contentLoading = true
                            let xhr = new XMLHttpRequest()
							xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, max-age=0')
							xhr.setRequestHeader('Expires', 'Thu, 1 Jan 1970 00:00:00 GMT')
							xhr.setRequestHeader('Pragma', 'no-cache')
                            xhr.open('GET', `https://kraftjrivo.github.io/mind-graph/content/${this.nom}.html`)
                            xhr.send()
                            xhr.onload = () => {
                                if (xhr.status == 200) {
                                    const str = (xhr.response as string)
                                    const titleEnd = str.indexOf('\n')
                                    const title = str.substring(0, titleEnd)
                                    const body = str.substring(titleEnd + 1, str.length)
                                    const html = `
                                        <div class="node-head">${title}</div>
                                        <div class="node-content">
                                            ${body}
                                        </div>
                                    `
                                    var div = document.createElement('div')
                                    document.body.appendChild(div)              
                                    div.classList.add('node')
                                    div.classList.add('math')
                                    div.innerHTML = html;
                                    (div.children[1] as HTMLDivElement).style.backgroundColor = dc.thm.main
                                    div.style.backgroundColor = dc.thm.edge
                                    div.style.color = dc.thm.text
                                    div.style.borderRadius = CORNER_R + 'px'
                                    div.style.opacity = '0'
                                    const c = div.children.item(1)
                                    if (c) (c as HTMLDivElement).style.opacity = '0';
                                    this.content = div
                                    this.contentLoaded = true
                                    this.contentLoading = false
                                    typesetMathJax(div)
                                    this.updateRect()
                                } else {
                                    alert(`error ${xhr.status}: ${xhr.statusText}`)
                                }
                            }
                        }
                    }
                } else {
                    if (this.content) {
                        const c = $(this.content).children().first().next()
                        c.stop().fadeTo(FADE_MS / 2, 0, function() {
                            $(this).prev().css('white-space', 'unset')
                            $(this).prev().animate({'height': '100%', 'font-size' : '48px'}, FADE_MS / 2)
                        })
                        setTimeout(this.setContentFlags.bind(this), FADE_MS + 1)
                        this.contentVisible = contVis
                        this.contentInProgress = true
                    }
                }
            }
        }
    }

    setZ(z: number) {
        if (this.content) {
            this.content.style.zIndex = ''+z
        }
    }

    updateContent() {
        const dc = DC.inst
        if (this.content) {
            const gxy = dc.globalPt(this.rct.xy.subPt(pt(0, 1).coeff(TITLE_H)))
            this.content.style.left = gxy.x + 'px'
            this.content.style.top = gxy.y + 'px'
            this.content.style.width = this.rct.wh.x + 'px'
            this.content.style.height = (this.rct.wh.y + TITLE_H) + 'px'
            this.content.style.transform = 'scale(' + dc.scale + ')'
            this.content.style.transformOrigin = 'left top'
            const cbody = this.content.children.item(1)
            if (cbody) {
                (cbody as HTMLDivElement).style.height = (((1 - (TITLE_H) / (this.rct.wh.y + TITLE_H))) - 1) + 'px'
            }
        }
    }

    updateRect(xy: Point2d = this.rct.xy, wh: Point2d = this.rct.wh) {
        const dc = DC.inst
        this.rct.xy = xy
        this.rct.wh = wh
        this.sizeCorner.xy = this.rct.xy.addPt(this.rct.wh.subPt(ones().coeff(CORNER_R)))

        this.updateContent()        
    }

    grabPointMoved(gp : GrabPoint) {
        const dc = DC.inst
        if (gp == this.sizeCorner) {
            this.updateRect(this.rct.xy, gp.xy.subPt(this.rct.xy).max(ones().coeff(MIN_SZ)).addPt(ones().coeff(CORNER_R)))
        }
    }

    setClass(name: string, on: boolean) {
        if (this.content) {
            if (on)
                this.content.classList.add(name)
            else 
                this.content.classList.remove(name)
        }
    }

    clbk_click(pos : Point2d) {
        this.checkHover(true)
    }
}