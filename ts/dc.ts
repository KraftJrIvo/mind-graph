import { Point2d, pt, rect, Rect, rectPt, zeros } from "./math"
import { Theme } from "./theme"

import * as THREE from 'three'
import { strToRgb } from "./util"

export class DrawContext {
    public scn = new THREE.Scene()
    public cam = new THREE.Camera()
    public renderer = new THREE.WebGLRenderer()
    public startTime = Date.now();
    public ratio = 1.0

    private _gridUni : any
    private _gridMat : any

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

    init() {
        const container = document.getElementById('container')
        this.cam.position.z = 1;
        this._gridUni = {
            time: { type: "f", value: 1.0 },
            scale: { type: "f", value: 1.0 },
            res: { type: "v2", value: new THREE.Vector2() },
            off: { type: "v2", value: new THREE.Vector2() },
            bg: { type: "v3", value: new THREE.Vector3() },
            alt: { type: "v3", value: new THREE.Vector3() }
        }
        this._gridMat = new THREE.ShaderMaterial({
            uniforms: this._gridUni,
            vertexShader: `
                uniform float time;
                uniform vec2 resolution;
                void main()	{
                    gl_Position = vec4( position, 1.0 );
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float scale;
                uniform vec2 res;
                uniform vec2 off;
                uniform vec3 bg;
                uniform vec3 alt;

                float left(float val) {
                    if (val < 0.)
                        return -ceil(abs(val));
                    return floor(val);
                }

                float right(float val) {
                    if (val < 0.)
                        return -floor(abs(val));
                    return ceil(val);
                }

                vec2 left2(vec2 v) {
                    return vec2(left(v.x), left(v.y));
                }

                vec2 right2(vec2 v) {
                    return vec2(right(v.x), right(v.y));
                }

                vec2 lr2(vec2 v) {
                    return vec2(left(v.x), right(v.y));
                }

                vec2 rl2(vec2 v) {
                    return vec2(right(v.x), left(v.y));
                }

                void main()	{
                    float step = pow(10.0, ceil((1.0 / log(10.0)) * log(min(res.x, res.y) / (scale * 10.0))));
                    float step2 = step / 10.;
                    vec2 pos = (vec2(gl_FragCoord.x, res.y - gl_FragCoord.y) - off) / scale;
                    float dist11 = length(pos - (step * left2(pos / step)));
                    float dist12 = length(pos - (step * right2(pos / step)));
                    float dist13 = length(pos - (step * lr2(pos / step)));
                    float dist14 = length(pos - (step * rl2(pos / step)));
                    float dist1 = min(min(dist11, dist12), min(dist13, dist14));
                    float dist21 = length(pos - (step2 * left2(pos / step2)));
                    float dist22 = length(pos - (step2 * right2(pos / step2)));
                    float dist23 = length(pos - (step2 * lr2(pos / step2)));
                    float dist24 = length(pos - (step2 * rl2(pos / step2)));
                    float dist2 = min(min(dist21, dist22), min(dist23, dist24));
                    if ((dist1 < 2. / scale) || (dist2 < 1. / scale))
                        gl_FragColor = vec4(alt, 1.);
                    else
                        gl_FragColor = vec4(bg, 1.);
                }
            `
        });

        const bgRgb = strToRgb(this.thm.bg)
        if (bgRgb) {
            this._gridUni.bg.value.x = bgRgb.r / 255.0
            this._gridUni.bg.value.y = bgRgb.g / 255.0
            this._gridUni.bg.value.z = bgRgb.b / 255.0
        }
        const altRgb = strToRgb(this.thm.alt)
        if (altRgb) {
            this._gridUni.alt.value.x = altRgb.r / 255.0
            this._gridUni.alt.value.y = altRgb.g / 255.0
            this._gridUni.alt.value.z = altRgb.b / 255.0
        }

        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this._gridMat)
        this.scn.add(mesh)

        this.renderer = new THREE.WebGLRenderer()
        this.ratio = window.devicePixelRatio ? window.devicePixelRatio : 1
        this.renderer.setPixelRatio(this.ratio)
        container?.appendChild(this.renderer.domElement)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
    }

    setSize() {
        this._gridUni.res.value.x = window.innerWidth * this.ratio
        this._gridUni.res.value.y = window.innerHeight * this.ratio
        this.renderer.setSize(window.innerWidth, window.innerHeight)
    }

    render() {
        var elapsedMilliseconds = Date.now() - this.startTime
        var elapsedSeconds = elapsedMilliseconds / 1000.
        this._gridUni.time.value = 60. * elapsedSeconds
        this._gridUni.scale.value = this.scale
        this._gridUni.off.value.x = this.off.x * this.ratio
        this._gridUni.off.value.y = this.off.y * this.ratio
        this.renderer.render(this.scn, this.cam)
    }

    localPt(p : Point2d) {
        return p.subPt(this.off).coeff(1 / this.scale)
    }

    globalPt(p : Point2d) {
        return p.coeff(this.scale).addPt(this.off)
    }

    globalRect(r : Rect) : Rect {
        return rectPt(this.globalPt(r.xy), r.wh.coeff(this.scale))
    }

    visibleRect() : Rect {
        return rectPt(this.off.coeff(-1 / this.scale), pt(window.innerWidth, window.innerHeight).coeff(1 / this.scale))
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