import { Point2d, rect, Rect, rectPt, zeros } from "./math"
import { Theme } from "./theme"

export type Callback = (stuff: any) => void
export class ClbkSelf {
    clbk: Callback
    self: any

    constructor(clbk: Callback, self: any) {
        this.clbk = clbk
        this.self = self
    }

    bound(): Callback {
        return this.clbk.bind(this.self)
    }
}
export function clbkself(clbk: Callback, self: any) { return new ClbkSelf(clbk, self) }

export class DrawContext {
    public cvid = "cv"
    public cv = document.getElementById(this.cvid) as HTMLCanvasElement
    public ctx: CanvasRenderingContext2D = this.cv.getContext("2d")!!
    public thm: Theme = new Theme()
    public off: Point2d = zeros()
    public scale: number = 1.0
    public mobile: boolean = false
    public mouse: Point2d = zeros()
    public mouseDown: boolean = false
    public hoverObj: any = null
    public hoverOff: Point2d = zeros()
    public hoverCursor: string = 'grab'
    public grabCursor: string = 'grabbed'
    public grabbable: boolean = false
    public grabObj: any = null
    public grabOff: Point2d = zeros()
    public focusObj: any = null

    localPt(p : Point2d) {
        return p.subPt(this.off).coeff(1 / this.scale)
    }

    globalPt(p : Point2d) {
        return p.coeff(this.scale).addPt(this.off)
    }

    globalRect(r : Rect) {
        return rectPt(this.globalPt(r.xy), r.wh.coeff(this.scale))
    }
};

export class DC {
    public dc : DrawContext
    private static _inst: DC
    private constructor() {
        this.dc = new DrawContext()
    }
    public static get inst() {
        if (!this._inst)
            this._inst = new this()
        return this._inst.dc
    }
}