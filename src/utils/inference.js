import * as ort from "onnxruntime-web/webgpu"

/**
 * Inference function using ONNX model
 * @param {String} model_path Yolo model path
 * @param {Number[]} input_shape array of input shape
 * @param {String} device device webgpu or cpu
 * @param {Number} warmUpFrequency warm up frequency
 * @param {Number} testFrequency test frequency
 * @param {HTMLCanvasElement} benchmarkChart benchmark benchmarkChart
 */
export async function inference(
    model_path,
    input_shape,
    device,
    warmUpFrequency,
    testFrequency,
    benchmarkChart,
    setWarmUpAvgTime,
    setTestAvgTime
) {
    let totalWarmTime = 0;
    let totalTestTime = 0; 

    // load model
    const onnxSession = await ort.InferenceSession.create(`${window.location.href}${model_path}`, 
        {executionProviders: [device]}
    );
    // if set wasm 
    // ort.env.wasm.numThreads = n; // set number of threads

    // Function to perform inference and measure execution time
    async function performInference() {
        const dummy_input_tensor = new ort.Tensor(
            "float32",
            new Float32Array(input_shape.reduce((a, b) => a * b)).map(() => Math.random()),
            input_shape
        );
        const startTime = performance.now();
        await onnxSession.run({ input: dummy_input_tensor }); // images
        const endTime = performance.now();
        return endTime - startTime;
    }

    // Function to update the benchmark chart
    function updateBenchmarkChart(iteration, executionTime) {
        benchmarkChart.data.labels.push(iteration);
        benchmarkChart.data.datasets[0].data.push(executionTime);
        benchmarkChart.update();
    }

    // Warm up
    for (let i = 0; i < warmUpFrequency; i++) {
        const eps = await performInference();
        totalWarmTime += eps;
        updateBenchmarkChart(i, eps);
        setWarmUpAvgTime((totalWarmTime / (i + 1)).toFixed(2));
    }

    // Test
    for (let i = warmUpFrequency; i < testFrequency + warmUpFrequency; i++) {
        const eps = await performInference();
        totalTestTime += eps;
        updateBenchmarkChart(i, eps);
        setTestAvgTime((totalTestTime / (i - warmUpFrequency + 1)).toFixed(2));
    }
}