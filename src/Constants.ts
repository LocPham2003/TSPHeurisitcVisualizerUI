import React from "react";
export const RADIUS = 5;
export const DEFAULT_ALGORITHM = 'ls'
export const ALGORITHMS = [
    {value : 'ls', label : 'Local Search'},
    {value : 'ts', label : 'Tabu Search'},
    {value : 'sa', label : 'Simulated Annealing'},
    {value : 'aco', label : 'Ant Colony'},
    {value : 'pso', label : 'Particle Swarm'}
]

export const ALGORITHM_PARAMETERS : {[algo : string] : {paramKey : string, paramName : string, paramRef : React.RefObject<any>}[]} =  {
    'ls' : [
        {paramKey : 'numIter', paramName : 'Number of iterations', paramRef : React.createRef()}
    ],
    'ts' : [
        {paramKey : 'numIter', paramName: 'Number of iterations', paramRef : React.createRef()}
    ],
    'sa' : [
        {paramKey : 'to', paramName: 'Initial temperature (To)', paramRef : React.createRef()},
        {paramKey : 'c', paramName: 'Cooling constant (c)', paramRef : React.createRef()}
    ],
    'aco' : [
        {paramKey : 'alpha', paramName: 'α', paramRef : React.createRef()},
        {paramKey : 'beta', paramName: 'β', paramRef : React.createRef()},
        {paramKey : 'p', paramName: 'algorithm memory (p)', paramRef : React.createRef()},
        {paramKey : 'q', paramName: 'Q', paramRef : React.createRef()},
    ],
    'pso' : [
        {paramKey : 'w', paramName: 'inertia (w);', paramRef : React.createRef()},
        {paramKey : 'c1', paramName: 'c1', paramRef : React.createRef()},
        {paramKey : 'c2', paramName: 'c2', paramRef : React.createRef()},
    ]
}