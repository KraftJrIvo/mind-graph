
const BASE_URL = 'https://kraftjrivo.github.io/mind-graph'

interface NodeJSON {
    "lang": string,
    "title": string,
    "content": string,
    "prefSize": Array<number>,
    "tags": Array<string>,
    "classes": Array<string>
}

interface GraphListJSON {
    "graphs": Array<string>
}

interface GraphJSON {
    "name": string,
    "nodes": Array<NodeJSON>
}

async function api<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}/${path}`)
    if (!response.ok)
      throw new Error(response.statusText)
    return await response.json() as T
}

async function getRemoteGraphList() {
  return await api<GraphListJSON>('graphlist.json');
}

async function getRemoteGraph(name: string) {
  name = name.length ? name : "base"
  return await api<GraphJSON>(`content/${name}.json`);
}

function setCookie(name: string, val: string) {
    const date = new Date();
    const value = val;    
    //date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000)); // expires in 7 days
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000)); // expires in a year
    document.cookie = name+"="+value+"; expires="+date.toUTCString()+"; path=/";
}

function getJSONcookie<T>(name: string): T | undefined {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length == 2)
        return parts.pop()?.split(";").shift() as T;
}

function deleteCookie(name: string) {
    const date = new Date();    
    date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000)); // expires in -1 days
    document.cookie = name+"=; expires="+date.toUTCString()+"; path=/";
}

async function getLocalGraph(name: string) {
    return getJSONcookie<GraphJSON>(`mind-graph.${name}`)
}

export class MindGraph {
    public nom : string = ""
    public remote : boolean = false

    constructor(nom : string) 
    {
        this.nom = nom

        getRemoteGraphList().then(remotenames => {
            this.remote = (remotenames.graphs.includes(nom))
        }).then(() => {
            if (this.remote)
                getRemoteGraph(this.nom).then(graph => this.init(graph))
            else
                getLocalGraph(this.nom).then(graph => this.init(graph))
        })
    }

    init(json : GraphJSON | undefined) 
    {
        
    }
}