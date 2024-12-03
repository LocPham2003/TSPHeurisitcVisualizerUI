export interface City {
    x : number;
    y : number;
}

export interface Graph {
    cities : City[],
}

export interface Solution {
    solution : City[];
    cost : number;
}

export interface Parameter {
    name : string;
    value : number;
}

export interface SolutionAttributes {
    cities : City[];
    algoType : string,
    parameters : Parameter[],
}

