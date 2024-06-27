import './assets/App.css'
import { useRef, useState } from 'react'
import { inference } from './utils/inference'

function App() {
  const deviceRef = useRef(null);
  const modelRef = useRef(null);
  const warmUpFrequencyRef = useRef(null);
  const testFrequencyRef = useRef(null);
  const chartRef = useRef(null);
  const startBenchmarkRef = useRef(null);
  const benchmarkRef = useRef(null);
  const [warmUpAvgTime, setWarmUpAvgTime] = useState('0');
  const [testAvgTime, setTestAvgTime] = useState('0');

  // setup chart
  window.onload = () => {
    const ctx = chartRef.current.getContext('2d');
    benchmarkRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Inference Time (ms)',
          data: [],
          borderColor: 'lightblue',
          tension: 0.1
        }]
      },

      // theme setting
      options: {
        plugins: {
          legend: {
            labels: {
              font: {
                size: 16
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              font: {
                size: 14
              }
            }
          },
          y: {
            ticks: {
              font: {
                size: 14
              }
            }
          }
        }
      },

    });
  }

  // start benchmark button click
  const startBenchmark = async () => {
    startBenchmarkRef.current.disabled = true;
    
    // Reset chart data and labels and Reset Avg time
    benchmarkRef.current.data.labels = [];
    benchmarkRef.current.data.datasets[0].data = [];
    setWarmUpAvgTime('0');
    setTestAvgTime('0');

    // config
    const input_shape = [1, 3, 640, 640];
    const model_path = `/${modelRef.current.value}.onnx`

    await inference(
      model_path, 
      input_shape, 
      deviceRef.current.value,
      Number(warmUpFrequencyRef.current.value),
      Number(testFrequencyRef.current.value),
      benchmarkRef.current,
      setWarmUpAvgTime,
      setTestAvgTime
    );

    startBenchmarkRef.current.disabled = false;
  }

  return (
    <>
      <h1>Model Benchmark - onnxruntime Web</h1>

      <div id='setting-container'>
          <div>
            <label htmlFor="device-selector">Backend:</label>
            <select name="device-selector" ref={deviceRef}>
              <option value="webgpu">webGPU</option>
              <option value="wasm">Wasm(cpu)</option>
            </select>
          </div>
          <div>
            <label htmlFor="model-selector">Model:</label>
            <select name="model-selector" ref={modelRef}>
              <option value="yolov9-t-converted-simplify">yolov9-t</option>
              <option value="yolov9-s-converted-simplify">yolov9-s</option>
              <option value="gelan-s2-simplify">gelan-s2</option>
              <option value="yolov10n">yolov10-n</option>
              <option value="yolov10s">yolov10-s</option>
            </select>
            <p>Yolov10 only support wasm</p>
          </div>

          <div>
            <label htmlFor="warmUpFrequency-input">Warm up frequency:</label>
            <input type="number" id='warmUpFrequency-input' defaultValue={1} min={0} ref={warmUpFrequencyRef}/>
          </div>
          <div>
            <label htmlFor="testFrequency-input">Testing frequency:</label>
            <input type="number" id='testFrequency-input' defaultValue={100} min={0} ref={testFrequencyRef}/>
          </div>
      </div>

      <button onClick={startBenchmark} ref={startBenchmarkRef}>Start benchmark</button>

      <div id='info-container'>
        <p>
          Warm up Average Time: <span className='info-ms'>{warmUpAvgTime}ms</span>
        </p>
        <p>
          Inference Average Time: <span className='info-ms'>{testAvgTime}ms</span>
        </p> 
      </div>
      <canvas ref={chartRef}></canvas>
    </>
  )
}

export default App
