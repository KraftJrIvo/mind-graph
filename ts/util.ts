import OpenSeadragon from "openseadragon";
import { EventManager } from "./evtman";
import { DC } from "./types";

export function getCurMillis(): number {
    return Date.now()
}

export function getHoveredImage(element : HTMLDivElement) : HTMLImageElement | null {
    var hoveredElements = $(element).find(':hover')
    var hoveredElement  = hoveredElements.last();

    if (hoveredElement)

    if (hoveredElement.prop("tagName") === 'IMG') {
        return hoveredElement.get(0) as HTMLImageElement;
    }
    return null
}

export function viewFullScreen(imgpth: string) {
    
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