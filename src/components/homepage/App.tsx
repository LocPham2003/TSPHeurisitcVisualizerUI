import React, { useEffect, useRef, useState } from 'react';
import { Client, Message } from '@stomp/stompjs'
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField, Typography,
} from "@mui/material";
import {Graph, Parameter, Solution, SolutionAttributes} from "../types/utilTypes";
import {ALGORITHM_PARAMETERS, ALGORITHMS, DEFAULT_ALGORITHM, RADIUS} from "../../Constants";

const createStyleClasses = () => {
    return {
        mainContainer : {
            position: 'fixed',
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
        },
        header : {
            display: 'flex',
            margin: '10px',
        },
        pointInput : {
            marginRight : '10px',
            height: '100%'
        },
        algorithmSelector : {
            width : '200px',
            height: '100%',
            marginRight : '10px',
        },
        paramsInputContainer : {
            display: 'flex',
            flexDirection: 'row',
            height: '100%',
        },
        paramsInput : {
            height: '100%',
            marginRight : '10px',
        },
        headerButton : {
            marginRight : '10px',
        },
        solutionCost : {
            marginRight : '10px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        canvasContainer : {
            margin: '10px',
            width : 'calc(100% - 20px)',
            height: 'calc(100% - 100px)',
            borderStyle: 'solid',
            borderColor: 'black',
        },
        mainCanvas : {
            width: '100%',
            height: '100%',
        },
        selectedPoint : {
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }
    }
}

export const App = () => {
    const [algorithm, setAlgorithm] = useState(DEFAULT_ALGORITHM);
    const [graph, setGraph] = useState<Graph>({cities : []});
    const [solution, setSolution] = useState<Solution>({solution : [], cost : 0});
    const [dimensions, setDimensions] = useState({width: 0, height: 0})

    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const numPointsRef = useRef<HTMLInputElement>(null);

    const client = new Client({
        brokerURL : 'ws://localhost:8080/visualizer',
        debug: (str)=> {
            console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
        console.log("Connected ", frame);
        client.subscribe('/topic/solution', (solution) => {
            console.log(JSON.parse(solution.body).content);
        })
    };

    client.onWebSocketError = (frame) => {
        console.log("WebSocket Error", frame)
    };

    client.onStompError = (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
    };

    const style = createStyleClasses();

    const getGraph = async (numCities : number, boundaries : number[]) : Promise<Graph> => {
        const graphAttributes = {
            numCities : numCities,
            boundaries : boundaries
        }

        const response = await fetch('http://localhost:8080/graph/',
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body : JSON.stringify(graphAttributes)
            });

        return await response.json();
    }

    const clearGraph = () => {
        setGraph({cities : []});
        setSolution({solution : [], cost : 0});
    }

    const getSolution = (solutionAttributes : SolutionAttributes) => {
        client.publish({
            destination : "cities",
            body : JSON.stringify(solutionAttributes)
        });
    }

    useEffect(() => {
        if (!canvasContainerRef.current) {
            return;
        }
        const resizeObserver = new ResizeObserver(() => {
            setDimensions({
                width: canvasContainerRef.current?.offsetWidth || 0,
                height: canvasContainerRef.current?.offsetHeight || 0
            })
        })
        resizeObserver.observe(canvasContainerRef.current);
        return () => resizeObserver.disconnect();
    }, [dimensions.width, dimensions.height])

    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                for (let i = 0; i < graph.cities.length; i++) {
                    ctx.beginPath();
                    ctx.moveTo(graph.cities[i].x + RADIUS, graph.cities[i].y);
                    ctx.arc(graph.cities[i].x, graph.cities[i].y, RADIUS, 0, Math.PI * 2);
                    if (solution.solution.length > 0) {
                        if (graph.cities[i].x === solution.solution[0].x && graph.cities[i].y === solution.solution[0].y) {
                            ctx.fillStyle = "green";
                        } else if (graph.cities[i].x === solution.solution[solution.solution.length - 1].x
                            && graph.cities[i].y === solution.solution[solution.solution.length - 1].y) {
                            ctx.fillStyle = "red";
                        } else {
                            ctx.fillStyle = "blue";
                        }
                    } else {
                        ctx.fillStyle = "blue";
                    }
                    ctx.fill();
                    ctx.stroke();
                    ctx.closePath();
                }

                for (let i = 0; i < solution.solution.length - 1; i++) {
                    ctx.moveTo(solution.solution[i].x, solution.solution[i].y);
                    ctx.lineTo(solution.solution[i + 1].x, solution.solution[i + 1].y);
                    ctx.stroke();
                }
            }

        }
    }, [graph, solution])

    const handleAlgorithmSelect = (event: SelectChangeEvent) => {
        setAlgorithm(event.target.value);
    }

    const generateCities = () => {
        if (numPointsRef.current?.value === "") {
            alert("You need to enter a number of points!");
        } else if (!Number.isInteger(Number(numPointsRef.current?.value)) || Number(numPointsRef.current?.value) <= 0)  {
            alert("Invalid number of points, must be an integer > 0");
        } else {
            clearGraph();
            getGraph(Number(numPointsRef.current?.value), [dimensions.width, dimensions.height]).then(res => {
                setGraph(res);
                client.activate();
            })
        }
    }

    const solveHeuristic = () => {
        if (numPointsRef.current?.value === "") {
            alert("You need to enter the number of points");
        } else {
            const params : Parameter[] = ALGORITHM_PARAMETERS[algorithm].map(params => {
                return {
                    name : params.paramKey,
                    value : params.paramRef.current.value || 0,
                }
            })

            getSolution({
                cities : graph.cities,
                algoType : algorithm,
                parameters : params
            })
        }
    }

    return (
      <Box sx={style.mainContainer}>
          <Box sx={style.header}>
              <FormControl style={style.pointInput}>
                  <TextField inputRef={numPointsRef} label="Number of points" variant="outlined"></TextField>
              </FormControl>
              <Button style={style.headerButton} variant="outlined" onClick={generateCities}>Generate Cities</Button>
              <FormControl style={style.algorithmSelector}>
                  <InputLabel>Algorithm</InputLabel>
                  <Select
                      value={algorithm}
                      label="Algorithm"
                      onChange={handleAlgorithmSelect}
                  >
                      {ALGORITHMS.map((algorithm) => (
                          <MenuItem key={algorithm.value} value={algorithm.value}>{algorithm.label}</MenuItem>
                      ))}
                  </Select>
              </FormControl>
              <FormControl>
                  {ALGORITHM_PARAMETERS[algorithm].map((params) => (
                      <TextField key={params.paramKey} style={style.paramsInput} inputRef={params.paramRef} label={params.paramName} variant="outlined"></TextField>
                  ))}
              </FormControl>
              {graph.cities.length === 0 ? <Button style={style.headerButton} variant="outlined" disabled>Solve</Button> :
                  <Button style={style.headerButton} variant="outlined" onClick={solveHeuristic}>Solve</Button>
              }
              {graph.cities.length === 0 ? <Button style={style.headerButton} variant="outlined" disabled>Clear</Button> :
                  <Button style={style.headerButton} variant="outlined" onClick={clearGraph}>Clear</Button>
              }
              <FormControl>
                  {solution.cost !== 0 ? <Typography style={style.solutionCost} variant="h5">Solution cost: {solution.cost}</Typography> : null}
              </FormControl>
          </Box>
          <div style={style.canvasContainer} ref={canvasContainerRef}>
              <canvas width={dimensions.width} height={dimensions.height} ref={canvasRef}/>
          </div>


      </Box>
);
}
