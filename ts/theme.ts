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
    public bg   : Color = "#000001"
    public main : Color = "#4A2545"
    public edge : Color = "#824C71"
    public text : Color = "#DCCCA3"
    public alt  : Color = "#90AA86"
}