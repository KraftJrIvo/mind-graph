export function clamp(val: number, min: number, max: number): number { 
    return Math.max(Math.min(val, max), min)
}

export function fract(val: number): number { 
    return val - Math.floor(val)
}

export function leftVal(val: number): number {
    if (val < 0)
        return -(Math.ceil(Math.abs(val)))
    return Math.floor(val)
}

export function rightVal(val: number): number {
    if (val < 0)
        return -(Math.floor(Math.abs(val)))
    return Math.ceil(val)
}

export class Point2d {
    public x: number
    public y: number

    constructor(x: number = 0, y: number = 0) {
        this.x = x
        this.y = y
    }

    equals(p: Point2d) {
        return p.x == this.x && p.y == this.y
    }

    addPt(p: Point2d) {
        return new Point2d(this.x + p.x, this.y + p.y)
    }
    add(x: number, y: number) {
        return new Point2d(this.x + x, this.y + y)
    }

    subPt(p: Point2d) {
        return new Point2d(this.x - p.x, this.y - p.y)
    }
    sub(x: number, y: number) {
        return new Point2d(this.x - x, this.y - y)
    }

    mulPt(p: Point2d) {
        return new Point2d(this.x * p.x, this.y * p.y)
    }

    divPt(p: Point2d) {
        return new Point2d(this.x / p.x, this.y / p.y)
    }

    coeff(coeff: number) {
        return new Point2d(this.x * coeff, this.y * coeff)
    }

    rotated(c: Point2d, angle: number): Point2d {
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)
        const off = this.subPt(c)
        const newx = off.x * cos - off.y * sin + c.x
        const newy = off.x * sin + off.y * cos + c.y
        return new Point2d(newx, newy)
    }

    clamp(min: Point2d, max: Point2d) {
        return pt(clamp(this.x, min.x, max.x), clamp(this.y, min.y, max.y))
    }

    round() {
        return pt(Math.round(this.x), Math.round(this.y))
    }

    floor() {
        return pt(Math.floor(this.x), Math.floor(this.y))
    }

    min(p: Point2d) {
        return pt(Math.min(this.x, p.x), Math.min(this.y, p.y))
    }

    max(p: Point2d) {
        return pt(Math.max(this.x, p.x), Math.max(this.y, p.y))
    }

    even() {
        const rx = Math.round(this.x)
        const ry = Math.round(this.y)
        return pt(rx - rx % 2, ry - ry % 2)
    }

    norm() {
        return Math.hypot(this.x, this.y)
    }
};
export function pt(x: number, y: number): Point2d {return new Point2d(x, y)}
export function zeros(): Point2d {return new Point2d(0, 0)}
export function ones(): Point2d {return new Point2d(1, 1)}

export type Size2d = Point2d
export function sz(w: number, h: number): Size2d {return new Point2d(w, h)}

export class Rect {
    public xy: Point2d
    public wh: Size2d

    constructor(xy: Point2d = zeros(), wh: Size2d = ones()) {
        this.xy = xy
        this.wh = wh
    }

    center(): Point2d {
        return this.xy.addPt(this.wh.coeff(0.5))
    }

    coeff(coeff: number) {
        return new Rect(this.xy.coeff(coeff), this.wh.coeff(coeff))
    }

    contains(p: Point2d) {
        return (p.x > this.xy.x && p.y > this.xy.y && p.x < this.xy.x + this.wh.x && p.y < this.xy.y + this.wh.y)
    }

    overlaps(rct: Rect) {
        return (rct.xy.x + rct.wh.x > this.xy.x && rct.xy.x < this.xy.x + this.wh.x && rct.xy.y + rct.wh.y > this.xy.y && rct.xy.y < this.xy.y + this.wh.y)
    }
}
export function rect(x: number, y: number, w: number, h: number): Rect { return new Rect(pt(x, y), sz(w, h)) }
export function rectPt(xy: Point2d, wh: Point2d): Rect { return new Rect(xy, wh) }
export function rect_zeros(): Rect { return new Rect(zeros(), zeros()) }