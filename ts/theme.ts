export type RGB = `rgb(${number}, ${number}, ${number})`
export type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`
export type HEX = `#${string}`
export type Color = RGB | RGBA | HEX | string
export function parseColor(str: string): Color {
    if (str.startsWith("#")) {
        return str as HEX
    } else if (str.startsWith("rgba")) {
        return str as RGBA
    } else if (str.startsWith("rgb")) {
        return str as RGB
    } else {
        return str
    }
    return "magenta"
}

export class Theme {
    public bg   : Color = "#0D1321"
    public main : Color = "#1D2D44"
    public edge : Color = "#3E5C76"
    public text : Color = "#F0EBD8"
    public alt  : Color = "#748CAB"
}