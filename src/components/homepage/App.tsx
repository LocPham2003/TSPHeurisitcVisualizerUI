import React, {useEffect, useRef, useState} from 'react';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Typography
} from "@mui/material";
import {Graph} from "../types/graph";
import {RADIUS} from "../../Constants";

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
    const [algorithm, setAlgorithm] = useState('');
    const [isCitiesGenerated, setIsCitiesGenerated] = useState(false);
    const [graph, setGraph] = useState<Graph>({cities : [], distances : []});
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
        console.log(graph.cities);
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                ctx.beginPath();
                graph.cities.forEach(city => {
                    ctx.moveTo(city.x + RADIUS, city.y);
                    ctx.arc(city.x, city.y, RADIUS, 0, Math.PI * 2);
                    ctx.fillStyle = "red";
                });
                ctx.fill();
                ctx.stroke();
            }
        }
    }, [graph])

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
        } else if (algorithm === "") {
            alert("You need to pick an algorithm");
        } else {
            getGraph(Number(numPointsRef.current?.value), [dimensions.width, dimensions.height]).then(res => {
                setGraph(res);
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
                      <MenuItem value="Local Search">Local Search</MenuItem>
                      <MenuItem value="Tabu Search">Tabu Search</MenuItem>
                      <MenuItem value="Simulated Annealing">Simulated Annealing</MenuItem>
                      <MenuItem value="Ant Colony">Ant Colony</MenuItem>
                      <MenuItem value="Particle Swarm">Particle Swarm</MenuItem>
                  </Select>
              </FormControl >
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
