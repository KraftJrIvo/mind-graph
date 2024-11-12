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