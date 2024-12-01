import React, {useEffect, useRef, useState} from 'react';
import {
    Box,
    Button,
    FormControl,
    InputLabel, Menu,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
} from "@mui/material";
import {Graph, Solution} from "../types/utilTypes";
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
    const [isCitiesGenerated, setIsCitiesGenerated] = useState(false);
    const [graph, setGraph] = useState<Graph>({cities : []});
    const [solution, setSolution] = useState<Solution>({solution : []});
    const [dimensions, setDimensions] = useState({width: 0, height: 0})

    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const numPointsRef = useRef<HTMLInputElement>(null);

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

    const getSolution = async () : Promise<Solution> => {
        const solutionAttributes = {
            cities : graph.cities,
            algoType : algorithm
        }

        const response = await fetch('http://localhost:8080/solution/',
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body : JSON.stringify(solutionAttributes)
            });

        return await response.json();
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
                }
                ctx.stroke();
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
            setIsCitiesGenerated(true);
            getGraph(Number(numPointsRef.current?.value), [dimensions.width, dimensions.height]).then(res => {
                setGraph(res);
            })
        }
    }

    const solveHeuristic = () => {
        if (!isCitiesGenerated) {
            alert("You need to enter the number of points");
        } else {
            ALGORITHM_PARAMETERS[algorithm].forEach((params) => {console.log(params.paramRef.current?.value)});

            getSolution().then(res => {
                setSolution(res);
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
              <FormControl sx={style.paramsInputContainer}>
                  {ALGORITHM_PARAMETERS[algorithm].map((params) => (
                      <TextField key={`${params.paramName}-${algorithm}`} style={style.paramsInput} inputRef={params.paramRef} label={params.paramName} variant="outlined"></TextField>
                  ))}
              </FormControl>
              {!isCitiesGenerated ? <Button style={style.headerButton} variant="outlined" disabled>Solve</Button> :
                  <Button style={style.headerButton} variant="outlined" onClick={solveHeuristic}>Solve</Button>
              }
          </Box>
          <div style={style.canvasContainer} ref={canvasContainerRef}>
              <canvas width={dimensions.width} height={dimensions.height} ref={canvasRef}/>
          </div>


      </Box>
);
}
