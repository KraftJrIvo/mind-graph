import {ones, Point2d, rect, Rect, rect_zeros, zeros} from "./math"
import { DC } from "./types"

const CORNER_R = 10
const TITLE_H = 20
const MIN_SZ = 25

export class GrabPoint {
    public xy : Point2d = zeros()
    public r : number = 0
    public parent : any = null

    constructor(pos : Point2d, radius : number, parent : any = null) {
        this.xy = pos
        this.r = radius
        this.parent = parent
    }

    checkHover() {
        const dc = DC.inst
        const gpos = dc.globalPt(this.xy)
        const hover = gpos.subPt(dc.mouse).norm() < this.r * dc.scale
        if (hover) {
            dc.hoverObj = this
            dc.grabbable = true
        }
        return hover
    }

    moveTo(to: Point2d) {
        this.xy = to
        this.parent.grabPointMoved(this)
    }
}

export class Entry {
    public nom : string = ""
    public rct : Rect = rect_zeros()
    public content? : HTMLIFrameElement
    public sizeCorner : GrabPoint = new GrabPoint(zeros(), CORNER_R, this)

    constructor(nom : string, rct : Rect, contentId : string = "") {
        this.nom = nom
        this.updateRect(rct.xy, rct.wh)
        if (contentId.length) {
            //...
        }
    }

    draw() {
        const dc = DC.inst
        const grect = dc.globalRect(this.rct)
        const cornerRsc = CORNER_R * dc.scale
        const titleHsc = TITLE_H * dc.scale
        dc.ctx.fillStyle = dc.thm.main;
        dc.ctx.beginPath();
        dc.ctx.roundRect(grect.xy.x, grect.xy.y, grect.wh.x, grect.wh.y, [cornerRsc]);
        dc.ctx.fill();
        dc.ctx.fillStyle = dc.thm.edge;
        dc.ctx.beginPath();
        dc.ctx.roundRect(grect.xy.x, grect.xy.y - titleHsc, grect.wh.x, titleHsc, [cornerRsc]);
        dc.ctx.fill();
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
            return true
        }
        return false
    }

    updateRect(xy: Point2d = this.rct.xy, wh: Point2d = this.rct.wh) {
        const dc = DC.inst
        this.rct.xy = xy
        this.rct.wh = wh
        this.sizeCorner.xy = this.rct.xy.addPt(this.rct.wh.subPt(ones().coeff(CORNER_R)))
    }

    grabPointMoved(gp : GrabPoint) {
        const dc = DC.inst
        if (gp == this.sizeCorner) {
            this.updateRect(this.rct.xy, gp.xy.subPt(this.rct.xy).max(ones().coeff(MIN_SZ)).addPt(ones().coeff(CORNER_R)))
        }
    }
}