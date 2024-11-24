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
import {Layer, Stage} from 'react-konva';
import {Graph} from "../types/graph";

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
        applyButton : {
            marginRight : '10px',
        },
        mainCanvas : {
            margin: '10px',
            width : 'calc(100% - 20px)',
            height: 'calc(100% - 100px)',
            borderStyle: 'solid',
            borderColor: 'black',
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
    const [selectedCoordinates, setSelectedCoordinates] = useState("None");
    const [dimensions, setDimensions] = useState({width: 0, height: 0})

    const canvasRef = useRef<HTMLDivElement>(null);
    const numPointsRef = useRef<HTMLInputElement>(null);

    const style = createStyleClasses();

    const getGraph = async (numCities : number, boundaries : number[]) : Promise<Graph> => {
        // TO FIX
        const graphAttributes = {
            numCities : numCities,
            boundaries : boundaries
        }
        const response = await fetch('http://localhost:8080/graph',
            {
                method: 'POST',
                headers: {
                    AccessControlAllowOrigin: "*",
                    AccessControlAllowMethods: "POST",
                    AccessControlAllowHeaders: "ContentType"
                },
                body : JSON.stringify(graphAttributes)
            });
        return await response.json();
    }

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const resizeObserver = new ResizeObserver(() => {
            setDimensions({
                width: canvasRef.current?.offsetWidth || 0,
                height: canvasRef.current?.offsetHeight || 0
            })
        })
        resizeObserver.observe(canvasRef.current);
        return () => resizeObserver.disconnect();
    }, [dimensions.height, dimensions.width])

    const handleAlgorithmSelect = (event: SelectChangeEvent) => {
        setAlgorithm(event.target.value);
    }

    // const handleClick = (event: Konva.KonvaEventObject<MouseEvent>) => {
    //     setSelectedCoordinates(`x: ${event.target.x()}, y: ${event.target.y()}`);
    // }

    const solveHeuristic = () => {
        if (numPointsRef.current?.value === "") {
            alert("You need to enter a number of points!");
        } else if (!Number.isInteger(Number(numPointsRef.current?.value)) || Number(numPointsRef.current?.value) <= 0)  {
            alert("Invalid number of points, must be an integer > 0");
        } else if (algorithm === "") {
            alert("You need to pick an algorithm");
        } else {
            console.log(getGraph(Number(numPointsRef.current?.value), [dimensions.width, dimensions.height]));
        }

    }

    return (
      <Box sx={style.mainContainer}>
          <Box sx={style.header}>
              <FormControl style={style.pointInput}>
                  <TextField inputRef={numPointsRef} label="Number of points" variant="outlined"></TextField>
              </FormControl>
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
              <Button style={style.applyButton} variant="outlined" onClick={solveHeuristic}>Solve</Button>
              <Box>
                  <Typography sx={style.selectedPoint}>Selected point: {selectedCoordinates}</Typography>
              </Box>
          </Box>
          <div style={style.mainCanvas} ref={canvasRef}>
              <Stage width={dimensions.width} height={dimensions.height}>
                  <Layer>
                  </Layer>
              </Stage>
          </div>

      </Box>
  );
}
