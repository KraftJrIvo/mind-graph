import { fract, leftVal, Point2d, pt, rightVal } from "./math"
import { DC } from "./types"

const CROSS_R = 5

export class Grid {
    public side : number = 250.0

    drawCross(pos : Point2d, side : number) {
        const dc = DC.inst
        const gpos = dc.globalPt(pos)
        const r = side
        dc.ctx.beginPath()
        dc.ctx.moveTo(gpos.x, gpos.y - r)
        dc.ctx.lineTo(gpos.x, gpos.y + r)
        dc.ctx.stroke()
        dc.ctx.beginPath()
        dc.ctx.moveTo(gpos.x - r, gpos.y)
        dc.ctx.lineTo(gpos.x + r, gpos.y)
        dc.ctx.stroke()
    }

    drawDot(pos : Point2d, side : number) {
        const dc = DC.inst
        const gpos = dc.globalPt(pos)
        dc.ctx.beginPath()
        dc.ctx.moveTo(gpos.x-0.1, gpos.y-0.1)
        dc.ctx.lineTo(gpos.x+0.1, gpos.y+0.1)
        dc.ctx.stroke()
    }

    draw() {
        const dc = DC.inst
        dc.ctx.fillStyle = dc.thm.bg
        dc.ctx.fillRect(0, 0, dc.cv.width, dc.cv.height)

        dc.ctx.strokeStyle = dc.thm.alt

        const step = (10.0 ** Math.ceil(Math.log10(Math.min(dc.cv.width, dc.cv.height) / (dc.scale * 10.0))))
        //const step = 100.0
        const step2 = step / 10.0
        const stepSc = step * dc.scale
        const start = pt(leftVal(dc.off.x / stepSc), leftVal(dc.off.y / stepSc)).coeff(-step)
        
        for (var x = -1; x < Math.ceil(dc.cv.width / stepSc); ++x) {
            for (var y = -1; y < Math.ceil(dc.cv.height / stepSc); ++y) {
                this.drawCross(pt(start.x + x * step, start.y + y * step), CROSS_R)
                for (var xx = 0; xx < 10; ++xx)
                    for (var yy = 0; yy < 10; ++yy)
                        this.drawDot(pt(start.x + x * step + xx * step2, start.y + y * step + yy * step2), CROSS_R * 0.1)        
            }
        }
    }
}