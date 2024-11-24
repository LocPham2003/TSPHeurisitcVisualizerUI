export interface City {
    x : number;
    y : number;
}

export interface Graph {
    cities : City[],
    distances : number[][],
}