import {ones, Point2d, pt, rect, Rect, rect_zeros, zeros} from "./math"
import { clbkself, DC } from "./types"

import { typesetMathJax } from "../js/mathjax"
import { EventManager } from "./evtman"

import OpenSeadragon from "openseadragon"

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

function getHoveredImage() : HTMLImageElement | null {
    var hoveredElements = $(':hover'),
        // the last element is the event source
        hoveredElement  = hoveredElements.last();

    if (hoveredElement.prop("tagName") === 'IMG') {
        return hoveredElement.get(0) as HTMLImageElement;
    }
    return null
}

function viewFullScreen(imgpth: string) {
    
    jQuery('<div>', {
        id: 'openseadragon1',
        style: 'width:' + DC.inst.cv.width + 'px;height:' + DC.inst.cv.height + 'px'
    }).appendTo('body');

    let viewer = OpenSeadragon({
        id: "openseadragon1",
        prefixUrl: 'res/',
        showZoomControl: false,
        showHomeControl: false,
        showFullPageControl: false
    });
    viewer.setMouseNavEnabled(false)
    
    viewer.addHandler('open', () => {
        viewer.clearControls()
        let clsBtn = new OpenSeadragon.Button({
          tooltip: 'Close',
          srcRest: "res/x.png",
          srcGroup: "res/x.png",
          srcHover: "res/x.png",
          srcDown: "res/x.png",
          onClick: async () => {
            viewer.setFullPage(false)
          }
        });
        let dwldBtn = new OpenSeadragon.Button({
            tooltip: 'Download',
            srcRest: "res/download.png",
            srcGroup: "res/download.png",
            srcHover: "res/download.png",
            srcDown: "res/download.png",
            onClick: async () => {
              let imageURL = imgpth
              const image = await fetch(imageURL)
              const imageBlog = await image.blob()
              imageURL = URL.createObjectURL(imageBlog)
             jQuery('<a>', {
                  id: 'download_img',
                  href: imageURL,
                  download: imgpth
              }).appendTo('body');
              document.getElementById('download_img')?.click()
              jQuery('#download_img').remove()
            }
          });
          viewer.addControl(clsBtn.element, { anchor: OpenSeadragon.ControlAnchor.TOP_LEFT });
          viewer.addControl(dwldBtn.element, { anchor: OpenSeadragon.ControlAnchor.TOP_LEFT });
    });

    viewer.open({
        type: "image",
        url:  imgpth,
    })
    viewer.setMouseNavEnabled(true)
    viewer.viewport.goHome(true)
    viewer.viewport.applyConstraints(true)
    viewer.viewport.zoomTo(1.0, undefined, true)
    viewer.setFullPage(true)        
    EventManager.inst.setEnabled(false)
    jQuery("body").removeClass()
    viewer.addOnceHandler("full-page", ()=>{
        viewer.setMouseNavEnabled(false)
        jQuery('#openseadragon1').remove()
        setTimeout(() => {
            EventManager.inst.setEnabled(true)
        }, 100)    
    })
}

export class Node {
    public nom : string = ""
    public rct : Rect = rect_zeros()
    public content? : HTMLDivElement
    public sizeCorner : GrabPoint = new GrabPoint(zeros(), CORNER_R, this, 'nwse-resize', 'nwse-resize')

    private _evt_click_idx: number

    constructor(nom : string, rct : Rect, contentId : string = "") {
        this.nom = nom

        const dc = DC.inst

        const htmlMath = `
            <div class="node-head" style="background-color:${dc.thm.edge};border-radius:${CORNER_R}px ${CORNER_R}px 0px 0px">Математика</div>
            <div class="node-body" style="background-color:${dc.thm.main};border-radius:0px 0px ${CORNER_R}px ${CORNER_R}px">
                <div id="content">
                    Конспекты:<br/>
                    <div align="center"><span class="defined">Теория множеств</span></div>
                    <div align="center"><span class="defined">Алгебра</span></div>
                    <br/>
                    <img class="viewable" src="https://kraftjrivo.github.io/mind-graph/res/img/numbers.png"/>
                </div>
            </div>
            `

        const htmlSets = `
        <div class="node-head" style="background-color:${dc.thm.edge};border-radius:${CORNER_R}px ${CORNER_R}px 0px 0px">Теория множеств</div>
        <div class="node-body" style="background-color:${dc.thm.main};border-radius:0px 0px ${CORNER_R}px ${CORNER_R}px">
            <div id="content">
                <span class="definition">Множество</span> — объект, <span class="defined">состоящий</span> из <span class="defined">принадлежащих ему</span> <span class="definition">элементов</span>:
                <div class="formula">
                    [A = \\{a,b,c\\} \\;\\;\\; \\Rightarrow \\;\\;\\; a,b,c \\in A.]
                </div>
            </div>
        </div>
        `

        const htmlAlg = `
        <div class="node-head" style="background-color:${dc.thm.edge};border-radius:${CORNER_R}px ${CORNER_R}px 0px 0px">Алгебра</div>
        <div class="node-body" style="background-color:${dc.thm.main};border-radius:0px 0px ${CORNER_R}px ${CORNER_R}px">
            <div id="content">
                <p><span class="definition">Алгебраической системой (или структурой)</span> называют непустое <span class="defined">множество</span>, на котором заданы некоторые <span class="defined">операции</span> и <span class="defined">отношения</span></p>
                <p><span class="defined">Операция "?"</span>, заданная на множестве [S], называется <span class="definition">бинарной</span>, если она ставит в соответсвие <span class="stressed">двум</span> эл-там мн-ва [S] один эл-т оттуда же:</p>
                <div class="formula">
                    [(S;?) : \\; S×S→S]
                </div>
            </div>
        </div>
        `
        
        var div = document.createElement('div')
        document.body.appendChild(div)              
        div.classList.add('node')
        div.classList.add('math')
        div.innerHTML = nom == 'math' ? htmlMath : nom == 'sets' ? htmlSets : htmlAlg
        div.style.borderRadius = CORNER_R + 'px'
        this.content = div
        typesetMathJax(div)

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
            if (grectC && !trectC) {
                const img = getHoveredImage()
                if (img && img.classList.contains('viewable')) {
                    dc.hoverCursor = 'pointer'
                    if (click) {
                        viewFullScreen(img.currentSrc)
                    }
                }
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

    clbk_click(pos : Point2d) {
        this.checkHover(true)
    }
}