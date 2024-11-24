import React, {useEffect, useRef, useState} from 'react';
import {Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField} from "@mui/material";
import {Circle, Layer, Stage} from 'react-konva';
import Konva from "konva";

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
            margin : 0
        },
        mainCanvas : {
            margin: '10px',
            width : 'calc(100% - 20px)',
            height: 'calc(100% - 100px)',
            borderStyle: 'solid',
            borderColor: 'black',
        }
    }
}

export const App = () => {
    const [algorithm, setAlgorithm] = useState('');
    const [dimensions, setDimensions] = useState({width: 0, height: 0})
    const canvasRef = useRef<HTMLDivElement>(null);
    const widthOffset = 25;
    const heightOffset = 105;
    const style = createStyleClasses();

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const resizeObserver = new ResizeObserver(() => {
            setDimensions({
                width: canvasRef.current?.offsetWidth || 0,
                height: canvasRef.current?.offsetHeight || 0
            })
            console.log("New dimensions " +  dimensions.width + " " + dimensions.height);
        })

        resizeObserver.observe(canvasRef.current);
        return () => resizeObserver.disconnect();
    }, [dimensions.height, dimensions.width])

    const handleChange = (event: SelectChangeEvent) => {
        setAlgorithm(event.target.value);
    }

    const handleClick = (event: Konva.KonvaEventObject<MouseEvent>) => {
        console.log(event.target.x() + ' ' + event.target.y());
    }

    return (
      <Box sx={style.mainContainer}>
          <Box sx={style.header}>
              <FormControl style={style.pointInput}>
                  <TextField label="Number of points" variant="outlined"></TextField>
              </FormControl>
              <FormControl style={style.algorithmSelector}>
                  <InputLabel>Algorithm</InputLabel>
                  <Select
                      value={algorithm}
                      label="Algorithm"
                      onChange={handleChange}
                  >
                      <MenuItem value="Local Search">Local Search</MenuItem>
                      <MenuItem value="Tabu Search">Tabu Search</MenuItem>
                      <MenuItem value="Simulated Annealing">Simulated Annealing</MenuItem>
                      <MenuItem value="Ant Colony">Ant Colony</MenuItem>
                      <MenuItem value="Particle Swarm">Particle Swarm</MenuItem>
                  </Select>
              </FormControl >
              <Button style={style.applyButton} variant="outlined">Solve</Button>
          </Box>
          <div style={style.mainCanvas} ref={canvasRef}>
              <Stage width={dimensions.width} height={dimensions.height}>
                  <Layer>
                      <Circle onClick={handleClick} x={2000} y={1000} radius={50} fill="green" />
                  </Layer>
              </Stage>
          </div>

      </Box>
  );
}
