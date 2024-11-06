import {ones, Point2d, pt, rect, Rect, rect_zeros, zeros} from "./math"
import { DC } from "./types"

import { typesetMathJax } from "../js/mathjax"

const CORNER_R = 10
const TITLE_H = 20
const MIN_SZ = 25

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
    public content? : HTMLDivElement
    public sizeCorner : GrabPoint = new GrabPoint(zeros(), CORNER_R, this, 'nwse-resize', 'nwse-resize')

    constructor(nom : string, rct : Rect, contentId : string = "") {
        this.nom = nom

        const dc = DC.inst

        const testText = 'Foo Foo Foo Foo Foo Foo FooFoo'
        const html = `
            <div class="node-head" style="background-color:${dc.thm.edge};border-radius:${CORNER_R}px ${CORNER_R}px 0px 0px">${nom}</div>
            <div class="node-body" style="background-color:${dc.thm.main};border-radius:0px 0px ${CORNER_R}px ${CORNER_R}px">
                <div id="content">
                    <span class="definition">Множество</span> — объект, <span class="defined">состоящий</span> из <span class="defined">принадлежащих ему</span> <span class="definition">элементов</span>:
                    <div class="formula">
                        [A = \\{a,b,c\\} \\;\\;\\; \\Rightarrow \\;\\;\\; a,b,c \\in A.]
                    </div>
                </div>
            </div>
            `
        
        var div = document.createElement('div')
        document.body.appendChild(div)              
        div.classList.add('node')
        div.classList.add('math')
        div.innerHTML = html
        div.style.borderRadius = CORNER_R + 'px'
        this.content = div
        typesetMathJax(div)

        this.updateRect(rct.xy, rct.wh)
    }

    checkHover() {
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
            return true
        }
        return false
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
            this.content.style.height = this.rct.wh.y + 'px'
            this.content.style.transform = 'scale(' + dc.scale + ')'
            this.content.style.transformOrigin = 'left top'
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
}