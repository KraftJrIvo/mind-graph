import {clamp, ones, Point2d, pt, rect, Rect, rect_zeros, rectPt, zeros} from "./math"
import { Callback, clbkself } from "./types"
import { DC } from "./dc"

import { typesetMathJax } from "../js/mathjax"
import { EventManager } from "./evtman"

import { getCurMillis, getHoveredImage, replaceAll, viewFullScreen } from "./util"

export const CORNER_R = 15
export const TITLE_H = 30
const MIN_SZ = 75
const MIN_W_RATIO = 0.1
const FADE_MS = 400

export class GrabPoint {
    public nom : string = ""
    public xy : Point2d = zeros()
    public r : number = 0
    public parent : any = null
    public grabCursor : string = 'grab'
    public hoverCursor : string = 'grabbed'
    public elem : HTMLElement | SVGElement | null = null

    constructor(nom : string, pos : Point2d, radius : number, parent : any = null, hoverCursor: string = 'grab', grabCursor: string = 'grabbed', elem : HTMLElement | null = null) {
        this.nom = nom
        this.xy = pos
        this.r = radius
        this.parent = parent
        this.hoverCursor = hoverCursor
        this.grabCursor = grabCursor
        this.elem = elem
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
            if (this.elem)
                this.elem.classList.add("node-head-icon-hover")
        } else if (this.elem) {
            this.elem.classList.remove("node-head-icon-hover")
        }
        return hover
    }

    destroy() {        
        this.elem?.classList.remove("node-head-icon-hover")
    }

    moveTo(to: Point2d) {
        this.xy = to
        this.parent.grabPointMoved(this)
    }
}

export class Node {
    public nom : string = ""
    public title : string = ""
    public body : string = ""
    public rct : Rect = rect_zeros()
    public selected : boolean = false
    public closed : boolean = false
    public inBounds : boolean = false
    public inBoundsFully : boolean = false
    public contentVisible : boolean = false
    public contentInProgress : boolean = false
    public contentLoading : boolean = false
    public contentLoaded : boolean = false
    public content : HTMLDivElement | null = null
    public sizeCorner : GrabPoint = new GrabPoint("sz", zeros(), CORNER_R, this, 'nwse-resize', 'nwse-resize')
    public pinButton : GrabPoint = new GrabPoint("pin", zeros(), CORNER_R + 2, this, 'pointer')
    public closeButton : GrabPoint = new GrabPoint("close", zeros(), CORNER_R + 2, this, 'pointer')
    private _evt_click_idx: number

    public targetRsz = false
    public targetRszRect : Rect = rect_zeros()
    public targetRszStartRect : Rect = rect_zeros()
    public lastRszFSrect : Rect = rect_zeros()
    public targetRszSetTime = 0
    public targetRszTimout = 250
    public targetRszCallback : Callback | null = null
    

    constructor(nom : string, rct : Rect, contentId : string = "") {
        this.nom = nom

        const dc = DC.inst

        this._evt_click_idx = EventManager.inst.subscribe("click", clbkself( this.clbk_click, this))

        this.updateRect(rct.xy, rct.wh)
        this.fillContent()
    }

    checkHover(click = false) {
        if (this.closeButton.checkHover())
            return true
        if (this.pinButton.checkHover())
            return true
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
            dc.grabbable = trectC || !this.contentVisible
            if (dc.grabbable) {
                dc.hoverCursor = 'grab'
                dc.grabCursor = 'grabbing'
            } else {
                dc.hoverCursor = ''
            }
            if (grectC && !dc.grabbable && this.content) {
                const img = getHoveredImage(this.content)
                if (img && img.classList.contains('viewable')) {
                    dc.hoverCursor = 'pointer'
                    if (click)
                        viewFullScreen(img.currentSrc)
                }
            }
            return true
        }
        return false
    }

    finishMovingContent() {
        this.contentInProgress = false
        this.updateRect()
    }

    addSVGicon(el : HTMLDivElement, toEnd : boolean, src : string, classes : string[], point : GrabPoint | null = null) {
        const dc = DC.inst
        fetch(src)
            .then(res => res.text())
            .then(data => {
                const parser = new DOMParser()
                let svg = parser.parseFromString(replaceAll(data, "#ffffff", dc.thm.text), 'image/svg+xml').querySelector('svg')
                if (svg) {
                    for (var i = 0; i < classes.length; ++i)
                        svg.classList.add(classes[i]);
                    svg.style.borderRadius = CORNER_R + 'px'
                    svg.style.width = TITLE_H + 'px'
                    svg.style.height = TITLE_H + 'px'
                    svg.style.minWidth = TITLE_H + 'px'
                    if (toEnd)
                        el.appendChild(svg)
                    else
                        el.insertBefore(svg, el.firstChild)
                    if (point)
                        point.elem = svg
                }
        })
    }

    prepareContent() {
        if (this.content) {
            typesetMathJax(this.content)
            $(this.content).find('img.viewable').css('border-radius', CORNER_R + 'px')
        }
    }

    fillContent(str?: string) {
        const dc = DC.inst

        if (str) {
            const titleEnd = str.indexOf('\n')
            this.title = str.substring(0, titleEnd)
            this.body = str.substring(titleEnd + 1, str.length)
        } else {
            this.title = '...'
            this.body = ''
        }
        let div = this.content;
        if (!div) {
            div = document.createElement('div')
            document.getElementById('container')?.appendChild(div)              
        }
        div.classList.add('node')
        //div.classList.add('math')
        if (str) {
            $(div).find('.node-title').html(this.title)
            $(div).find('.node-content-inner').html(this.body)
        } else {
            const html = `
                <div class="node-head"><span class="node-title">${this.title}</span></div>
                <div class="node-content">
                    <div class="node-content-inner">
                    </div>
                </div>
            `
            div.innerHTML = html;
            (div.children[1] as HTMLDivElement).style.backgroundColor = dc.thm.main
            div.style.backgroundColor = dc.thm.edge
            div.style.color = dc.thm.text
            div.style.borderRadius = CORNER_R + 'px'
            div.style.opacity = '0'
            const c = div.children.item(1)
            if (c) (c as HTMLDivElement).style.opacity = '0';
            const c2 = div.children[0] as HTMLDivElement
            this.addSVGicon(c2, false, "res/svg/copy.svg", ["node-head-icon"], this.pinButton)
            this.addSVGicon(c2, true, "res/svg/close.svg", ["node-head-icon"], this.closeButton)
        }
        this.content = div
        if (str) {
            this.prepareContent()
            this.contentLoaded = true
            this.contentLoading = false    
        }
        this.updateRect()
    }

    destroy() {
        if (this.content) {
            this.pinButton.destroy()
            this.closeButton.destroy()
            $(this.content).stop().fadeTo(FADE_MS, 0, () => {this.content?.remove()})
        }
    }

    debug() {
        if (this.content) {
            //...
        }
    }

    checkContentState() {
        const dc = DC.inst

        const rpt = rectPt(this.rct.xy.sub(0, TITLE_H), this.rct.wh.add(0, TITLE_H))
        this.inBoundsFully = dc.visibleRect().fits(rpt)

        const inBounds = rpt.overlaps(dc.visibleRect())
        
        if (this.content) {
        
            if (inBounds != this.inBounds) {
                $(this.content).stop().fadeTo(FADE_MS, inBounds ? 1 : 0)
                this.inBounds = inBounds
            }

            if (!this.contentInProgress) {
                const contEl = $(this.content).children()[1] as HTMLDivElement
                const noFSobstruc = (!dc.fsNode || dc.fsNode == this)
                const contVis = noFSobstruc && inBounds && (contEl.clientWidth * dc.scale > MIN_W_RATIO * window.innerHeight)
                if (contVis != this.contentVisible) {
                    if (contVis && this.contentLoaded && this.content) {
                        const c = $(this.content).children().first()    
                        const headEl = $(this.content).children()[0] as HTMLDivElement
                        headEl.style.justifyContent = 'space-between'
                        c.css('white-space', 'nowrap')      
                        c.css('font-size', 'unset')              
                        const fontSize = Number(window?.getComputedStyle(headEl)?.getPropertyValue('font-size')?.match(/\d+/)?.at(0))
                        c.animate({'height': (TITLE_H + 'px'), 'font-size' : fontSize + 'px'}, FADE_MS / 2, function() {
                            $(this).find('.node-head-icon').fadeTo(FADE_MS / 2, 1)
                            $(this).next().stop().fadeTo(FADE_MS / 2, 1) 
                        })
                        setTimeout(this.finishMovingContent.bind(this), FADE_MS / 2)
                        this.contentVisible = true
                        this.contentInProgress = true
                    } else {
                        if (contVis && !this.contentLoading) {
                            this.contentLoading = true
                            let xhr = new XMLHttpRequest()
                            xhr.open('GET', `content/${this.nom}.html`)
                            xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, max-age=0')
                            xhr.setRequestHeader('Expires', 'Thu, 1 Jan 1970 00:00:00 GMT')
                            xhr.setRequestHeader('Pragma', 'no-cache')
                            xhr.send()
                            xhr.onload = () => {
                                if (xhr.status == 200) {
                                    const str = (xhr.response as string)
                                    this.fillContent(str)
                                } else {
                                    alert(`error ${xhr.status}: ${xhr.statusText}`)
                                }
                            }
                        } else if (this.content) {
                            const c = $(this.content).children().first()
                            const tms = this.contentLoaded ? FADE_MS : 0
                            const headEl = $(this.content).children()[0] as HTMLDivElement
                            headEl.style.justifyContent = 'center'            
                            c.find('.node-head-icon').fadeTo(tms / 2, 0)
                            const fontSize = Number(window?.getComputedStyle(headEl)?.getPropertyValue('font-size')?.match(/\d+/)?.at(0))
                            c.next().stop().fadeTo(tms / 2, 0, function() {
                                $(this).prev().css('white-space', 'unset')
                                $(this).prev().animate({'height': '100%', 'font-size' : (fontSize * 3) + 'px'}, tms / 2)
                            })
                            setTimeout(this.finishMovingContent.bind(this), tms)
                            this.contentVisible = false
                            this.contentInProgress = true
                        }
                    }
                }
            }
        }

        if (this.targetRsz)
            this.updateTargetRsz()
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
            this.content.style.outlineWidth = (2 / dc.scale) + 'px'
            this.content.style.outlineColor = dc.thm.text
            const cbody = this.content.children.item(1)
            if (cbody) {
                (cbody as HTMLDivElement).style.height = (((1 - (TITLE_H) / (this.rct.wh.y + TITLE_H))) - 1) + 'px'
            }
            if (this.contentVisible) {
                const contEl = $(this.content).find('.node-content').first()[0] as HTMLDivElement
                const firstContEl = $(this.content).find('.node-content-inner').children().first()[0] as HTMLDivElement
                const lastContEl = $(this.content).find('.node-content-inner').children().last()[0] as HTMLDivElement
                if (lastContEl) {
                    const cr = contEl.getBoundingClientRect()
                    const fcer = firstContEl.getBoundingClientRect()
                    const lcer = lastContEl.getBoundingClientRect()
                    const h = lcer.bottom - fcer.top
                    const hdiff = Math.max(0, (cr.height - h) * 0.5 - TITLE_H * dc.scale)
                    const topmarg = hdiff / dc.scale
                    const overflow = (lcer.bottom - hdiff) - (cr.bottom - TITLE_H * dc.scale)
                    let isContentOverflowing = overflow > 0
                    const contInEl = $(this.content).find('.node-content-inner').first()
                    if (isContentOverflowing) {
                        const fade = clamp(overflow, 0, 25);
                        contInEl.css('mask-image', `linear-gradient(0deg, transparent 16px, #000 ${16 + fade}px)`)
                    } else {
                        contInEl.css('mask-image', '')                        
                    }
                    contInEl.css('margin-top', topmarg + 'px')
                }
            }
        }
    }
    
    public updateTargetRsz() {
        const ms = getCurMillis() - this.targetRszSetTime
        const t = (ms / this.targetRszTimout)
        const et = ((t * t) / (2. * (t * t - t) + 1.0));
        const diffxy = this.targetRszRect.xy.subPt(this.targetRszStartRect.xy)
        const diffwh = this.targetRszRect.wh.subPt(this.targetRszStartRect.wh)
        this.rct.xy = this.targetRszStartRect.xy.addPt(diffxy.coeff(et))
        this.rct.wh = this.targetRszStartRect.wh.addPt(diffwh.coeff(et))
        if (ms > this.targetRszTimout) {
            this.targetRsz = false
            if (this.targetRszCallback)
                this.targetRszCallback(this)
        }
        this.updateContent()
    }

    getShortTitle() {
        let result = "";
        let v = true;
        for (let i = 0; i < this.title.length; i++) {
            if (this.title[i] == ' ')
                v = true;
            else if (this.title[i] != ' ' && v == true) {
                result += (this.title[i]);
                v = false;
            }
        }
        return result ? result.toUpperCase() : '...';
    }

    updateRect(xy: Point2d = this.rct.xy, wh: Point2d = this.rct.wh) {
        this.rct.xy = xy
        this.rct.wh = wh
        this.sizeCorner.xy = this.rct.xy.addPt(this.rct.wh.subPt(ones().coeff(CORNER_R)))
        this.pinButton.xy = this.rct.xy.addPt(pt(CORNER_R, -TITLE_H/2))
        this.closeButton.xy = this.rct.xy.addPt(pt(this.rct.wh.x - CORNER_R, -TITLE_H/2))

        this.updateContent()
        
        if (this.content) {
            const headEl =  $(this.content).children().first()[0] as HTMLDivElement
            const titleEl = $(this.content).find('.node-title').first()
            titleEl.html(this.title)

            let isTitleOverflowing = headEl.clientWidth < headEl.scrollWidth
            if (isTitleOverflowing) {
                titleEl.html(this.getShortTitle())
            } else {
                titleEl.html(this.title)
            }
        }
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
        if (!this.closed)
            this.checkHover(true)
    }
}