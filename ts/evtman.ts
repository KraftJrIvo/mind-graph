import { ClbkSelf } from "./types"
import { Point2d, zeros } from "./math"

type ClbkDict = {[evtnom: string]: Array<(stuff: any) => void>}

export class EventManager {

    private _clbks: ClbkDict = {}
    
    private _mousepos: Point2d = zeros() 
    public enabled = true

    public shift = false
    
    private static _inst: EventManager
    private constructor() { }

    setEnabled(on: boolean) {
        this.enabled = on
    }

    notify(evtnom: string, info: any) {
        if (this.enabled) {
            if (evtnom in this._clbks) {
                const clbks = this._clbks[evtnom]
                for (let clbk of clbks) {
                    if (clbk) {
                        clbk(info)
                    }
                }
            }
        }
    }

    subscribe(evtnom: string, clbkself: ClbkSelf): number {
        if (!(evtnom in this._clbks)) {
            this._clbks[evtnom] = []
        }
        for (var i = 0; i < this._clbks[evtnom].length; ++i) {
            if (!this._clbks[evtnom][i]) {
                this._clbks[evtnom][i] = clbkself.bound()
                return i
            }
        }
        this._clbks[evtnom].push(clbkself.bound())
        return this._clbks[evtnom].length - 1
    }

    unsubscribe(evtnom: string, idx: number) {
        if (!(evtnom in this._clbks)) {
            this._clbks[evtnom] = []
        }
        if (evtnom in this._clbks && this._clbks[evtnom].length > idx) {
            delete this._clbks[evtnom][idx]
        }
    }

    setMousePos(pt2d: Point2d) {
        this._mousepos = pt2d
    }

    public static get mousepos() {
        return this._inst._mousepos
    }

    public static get inst() {
        return this._inst || (this._inst = new this());
    }
}