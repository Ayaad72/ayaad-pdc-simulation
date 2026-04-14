"use client";

import { useState, useRef, useEffect } from "react";

// Types for Results History
interface SimulationResult {
  id: string;
  mode: "sequential" | "parallel" | "distributed";
  totalTime: number;
  processingTime: number;
  waitingTime: number;
  communicationDelay: number;
  timestamp: string;
}

export default function ParallelSimulation() {
  const [mode, setMode] = useState<
    "sequential" | "parallel" | "distributed" | null
  >(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<"simulation" | "history">(
    "simulation",
  );
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [metrics, setMetrics] = useState({
    totalTime: 0,
    processingTime: 0,
    communicationDelay: 0,
    waitingTime: 0,
  });
  const [animationState, setAnimationState] = useState<any>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load resulddddts from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem("simulationResults");
    if (stored) {
      try {
        setResults(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load results:", e);
      }
    }
  }, []);

  // Save result sssssto localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("simulationResults", JSON.stringify(results));
  }, [results]);

  // Save result after simulation completes
  const saveResult = (
    newMetrics: any,
    simulationMode: "sequential" | "parallel" | "distributed",
  ) => {
    const newResult: SimulationResult = {
      id: Date.now().toString(),
      mode: simulationMode,
      totalTime: newMetrics.totalTime,
      processingTime: newMetrics.processingTime,
      waitingTime: newMetrics.waitingTime,
      communicationDelay: newMetrics.communicationDelay,
      timestamp: new Date().toLocaleString(),
    };
    setResults([newResult, ...results]);
  };

  // Clear all history
  const clearHistory = () => {
    if (
      confirm(
        "Are you sure you want to clear all history? This cannot be undone.",
      )
    ) {
      setResults([]);
      localStorage.removeItem("simulationResults");
    }
  };

  const startSequential = async () => {
    setMode("sequential");
    setIsRunning(true);
    setMetrics({
      totalTime: 0,
      processingTime: 0,
      communicationDelay: 0,
      waitingTime: 0,
    });

    const numbers = Array.from({ length: 12 }, (_, i) => i + 1);
    const startTime = Date.now();
    let sum = 0;

    for (let i = 0; i < numbers.length; i++) {
      setAnimationState({
        activeNumber: numbers[i],
        processorActive: true,
        currentSum: sum,
        step: i + 1,
        totalSteps: 12,
      });
      sum += numbers[i];
      await sleep(800);
    }

    setAnimationState({
      activeNumber: null,
      processorActive: false,
      currentSum: sum,
      final: true,
    });

    const totalTime = Date.now() - startTime;
    const newMetrics = {
      totalTime,
      processingTime: totalTime,
      communicationDelay: 0,
      waitingTime: 0,
    };
    setMetrics(newMetrics);
    saveResult(newMetrics, "sequential");

    await sleep(1000);
    setIsRunning(false);
  };

  const startParallel = async () => {
    setMode("parallel");
    setIsRunning(true);
    setMetrics({
      totalTime: 0,
      processingTime: 0,
      communicationDelay: 0,
      waitingTime: 0,
    });

    const group1 = [1, 2, 3, 4, 5, 6];
    const group2 = [7, 8, 9, 10, 11, 12];
    const startTime = Date.now();

    let sum1 = 0,
      sum2 = 0;
    const maxSteps = Math.max(group1.length, group2.length);

    for (let step = 0; step < maxSteps; step++) {
      const promises: Promise<void>[] = [];

      if (step < group1.length) {
        promises.push(
          (async () => {
            sum1 += group1[step];
            setAnimationState((prev: any) => ({
              ...prev,
              processor1Active: true,
              processor1Number: group1[step],
              sum1,
            }));
            await sleep(800);
            setAnimationState((prev: any) => ({
              ...prev,
              processor1Active: false,
            }));
          })(),
        );
      }

      if (step < group2.length) {
        promises.push(
          (async () => {
            sum2 += group2[step];
            setAnimationState((prev: any) => ({
              ...prev,
              processor2Active: true,
              processor2Number: group2[step],
              sum2,
            }));
            await sleep(800);
            setAnimationState((prev: any) => ({
              ...prev,
              processor2Active: false,
            }));
          })(),
        );
      }

      await Promise.all(promises);
    }

    const processingTime = Date.now() - startTime;

    // Merge/synchronization step
    setAnimationState((prev: any) => ({
      ...prev,
      merging: true,
      sum1,
      sum2,
    }));
    await sleep(600);

    const finalSum = sum1 + sum2;
    setAnimationState((prev: any) => ({
      ...prev,
      merging: false,
      final: true,
      currentSum: finalSum,
    }));

    const totalTime = Date.now() - startTime;
    const newMetrics = {
      totalTime,
      processingTime,
      communicationDelay: 0,
      waitingTime: totalTime - processingTime,
    };
    setMetrics(newMetrics);
    saveResult(newMetrics, "parallel");

    await sleep(1000);
    setIsRunning(false);
  };

  const startDistributed = async () => {
    setMode("distributed");
    setIsRunning(true);
    setMetrics({
      totalTime: 0,
      processingTime: 0,
      communicationDelay: 0,
      waitingTime: 0,
    });

    const group1 = [1, 2, 3, 4, 5, 6];
    const group2 = [7, 8, 9, 10, 11, 12];
    const startTime = Date.now();

    let sum1 = 0,
      sum2 = 0;

    // Process in parallel
    const processingStart = Date.now();

    for (let step = 0; step < Math.max(group1.length, group2.length); step++) {
      const promises: Promise<void>[] = [];

      if (step < group1.length) {
        promises.push(
          (async () => {
            sum1 += group1[step];
            setAnimationState((prev: any) => ({
              ...prev,
              processor1Active: true,
              processor1Number: group1[step],
              sum1,
            }));
            await sleep(800);
            setAnimationState((prev: any) => ({
              ...prev,
              processor1Active: false,
            }));
          })(),
        );
      }

      if (step < group2.length) {
        promises.push(
          (async () => {
            sum2 += group2[step];
            setAnimationState((prev: any) => ({
              ...prev,
              processor2Active: true,
              processor2Number: group2[step],
              sum2,
            }));
            await sleep(800);
            setAnimationState((prev: any) => ({
              ...prev,
              processor2Active: false,
            }));
          })(),
        );
      }

      await Promise.all(promises);
    }

    const processingTime = Date.now() - processingStart;

    // Message passing with communication delay
    setAnimationState((prev: any) => ({
      ...prev,
      communicating: true,
      sum1,
      sum2,
    }));

    const commStart = Date.now();
    await sleep(1500); // Network delay simulation
    const communicationDelay = Date.now() - commStart;

    const finalSum = sum1 + sum2;
    setAnimationState((prev: any) => ({
      ...prev,
      communicating: false,
      final: true,
      currentSum: finalSum,
    }));

    const totalTime = Date.now() - startTime;
    const newMetrics = {
      totalTime,
      processingTime,
      communicationDelay,
      waitingTime: 0,
    };
    setMetrics(newMetrics);
    saveResult(newMetrics, "distributed");

    await sleep(1000);
    setIsRunning(false);
  };

  const reset = () => {
    setMode(null);
    setAnimationState({});
    setMetrics({
      totalTime: 0,
      processingTime: 0,
      communicationDelay: 0,
      waitingTime: 0,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="sticky top-2 md:top-4 z-50 px-2 md:px-4 mb-6 md:mb-10">
          <div className="max-w-7xl mx-auto bg-slate-900/70 backdrop-blur-2xl border border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl md:rounded-3xl px-4 md:px-8 py-4 md:py-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
              <div>
                <h1 className="text-2xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tight">
                  Parallel & Distributed Computing
                </h1>
                <p className="text-xs md:text-sm text-slate-400 mt-1.5 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Interactive Simulation: Sum of Numbers 1-12
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center flex-wrap">
                {/* Mode Selector */}
                {mode && (
                  <div className="flex gap-2 flex-wrap items-center bg-slate-950/50 p-1.5 rounded-xl border border-slate-800/80 shadow-inner">
                    <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold px-2">
                      Switch:
                    </span>
                    <button
                      onClick={() =>
                        !isRunning && (setMode(null), setAnimationState({}))
                      }
                      className={`px-3 py-1.5 rounded-lg font-bold transition text-xs md:text-sm ${"bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]"}`}
                      disabled={isRunning}
                    >
                      Seq
                    </button>
                    <button
                      onClick={() =>
                        !isRunning && (setMode(null), setAnimationState({}))
                      }
                      className={`px-3 py-1.5 rounded-lg font-bold transition text-xs md:text-sm ${"bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 shadow-[0_0_10px_rgba(147,51,234,0.1)]"}`}
                      disabled={isRunning}
                    >
                      Par
                    </button>
                    <button
                      onClick={() =>
                        !isRunning && (setMode(null), setAnimationState({}))
                      }
                      className={`px-3 py-1.5 rounded-lg font-bold transition text-xs md:text-sm ${"bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.1)]"}`}
                      disabled={isRunning}
                    >
                      Dist
                    </button>
                  </div>
                )}

                {/* Tab Navigation */}
                <div className="flex bg-slate-950/50 p-1.5 rounded-xl border border-slate-800/80 shadow-inner w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab("simulation")}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs md:text-sm flex-1 sm:flex-none ${
                      activeTab === "simulation"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-100"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 scale-95 hover:scale-100"
                    }`}
                  >
                    Simulation
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs md:text-sm flex-1 sm:flex-none flex items-center justify-center gap-2 ${
                      activeTab === "history"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-100"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 scale-95 hover:scale-100"
                    }`}
                  >
                    Results{" "}
                    <span className="bg-slate-900/50 text-xs px-2 py-0.5 rounded-full border border-white/10">
                      {results.length}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 md:p-8">
          {activeTab === "simulation" ? (
            <>
              {/* Hero Section */}
              {!mode && (
                <div className="mb-12">
                  <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                      Choose a Processing Mode
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                      Explore how different computing paradigms handle the same
                      task. Watch real-time animations showing sequential,
                      parallel, and distributed execution.
                    </p>
                  </div>

                  {/* Mode Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                    <ModeCard
                      title="Sequential Processing"
                      description="One processor handles all tasks one at a time sequentially."
                      color="from-blue-600 to-indigo-700"
                      icon="⚙️"
                      onClick={startSequential}
                      disabled={isRunning}
                    />
                    <ModeCard
                      title="Parallel Processing"
                      description="Two processors work simultaneously with shared memory."
                      color="from-purple-600 to-pink-700"
                      icon="⚡"
                      onClick={startParallel}
                      disabled={isRunning}
                    />
                    <ModeCard
                      title="Distributed Processing"
                      description="Two systems communicate via message passing over network."
                      color="from-orange-500 to-red-600"
                      icon="🌐"
                      onClick={startDistributed}
                      disabled={isRunning}
                    />
                  </div>
                </div>
              )}

              {/* Simulation Area */}
              {mode && (
                <>
                  <div className="bg-slate-800 rounded-xl p-6 md:p-8 mb-6 border border-slate-700">
                    {mode === "sequential" && (
                      <SequentialVisualization state={animationState} />
                    )}
                    {mode === "parallel" && (
                      <ParallelVisualization state={animationState} />
                    )}
                    {mode === "distributed" && (
                      <DistributedVisualization state={animationState} />
                    )}
                  </div>

                  {/* Metrics Display */}
                  <MetricsPanel metrics={metrics} mode={mode} />

                  {/* Reset Button */}
                  {!isRunning && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={reset}
                        className="px-6 md:px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition"
                      >
                        Try Another Mode
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            // Results History Tab
            <div>
              <div className="flex justify-between items-center mb-6 flex-col sm:flex-row gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    Results History
                  </h2>
                  <p className="text-slate-400 mt-1">
                    {results.length} simulation(s) recorded
                  </p>
                </div>
                {results.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition text-sm"
                  >
                    Clear All History
                  </button>
                )}
              </div>

              {results.length === 0 ? (
                <div className="bg-slate-800 rounded-xl p-8 md:p-12 border border-slate-700 text-center">
                  <p className="text-slate-400 text-lg">
                    No simulations recorded yet.
                  </p>
                  <p className="text-slate-500 mt-2">
                    Run a simulation to see results appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-slate-800 rounded-xl border border-slate-700">
                  <table className="w-full text-sm md:text-base">
                    <thead>
                      <tr className="border-b border-slate-700 bg-slate-900">
                        <th className="px-4 md:px-6 py-3 text-left font-semibold text-white">
                          Mode
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left font-semibold text-white">
                          Total Time
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left font-semibold text-white hidden sm:table-cell">
                          Processing Time
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left font-semibold text-white hidden md:table-cell">
                          Waiting/Comm Time
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left font-semibold text-white">
                          Date & Time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result) => (
                        <tr
                          key={result.id}
                          className="border-b border-slate-700 hover:bg-slate-750 transition"
                        >
                          <td className="px-4 md:px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-white text-xs md:text-sm font-medium ${
                                result.mode === "sequential"
                                  ? "bg-blue-900"
                                  : result.mode === "parallel"
                                    ? "bg-purple-900"
                                    : "bg-orange-900"
                              }`}
                            >
                              {result.mode.charAt(0).toUpperCase() +
                                result.mode.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 font-semibold text-green-400">
                            {result.totalTime}ms
                          </td>
                          <td className="px-4 md:px-6 py-4 text-slate-300 hidden sm:table-cell">
                            {result.processingTime}ms
                          </td>
                          <td className="px-4 md:px-6 py-4 text-slate-300 hidden md:table-cell">
                            {result.waitingTime > 0
                              ? `${result.waitingTime}ms`
                              : `${result.communicationDelay}ms`}
                          </td>
                          <td className="px-4 md:px-6 py-4 text-slate-400 text-xs md:text-sm">
                            {result.timestamp}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Comparison Section */}
              {results.length > 0 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ComparisonCard
                    label="Fastest Mode"
                    mode={
                      results.reduce((a, b) =>
                        a.totalTime < b.totalTime ? a : b,
                      ).mode
                    }
                    time={Math.min(...results.map((r) => r.totalTime))}
                  />
                  <ComparisonCard
                    label="Average Execution"
                    mode="average"
                    time={Math.round(
                      results.reduce((sum, r) => sum + r.totalTime, 0) /
                        results.length,
                    )}
                  />
                  <ComparisonCard
                    label="Total Runs"
                    mode="count"
                    time={results.length}
                    isCount
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ModeCard({
  title,
  description,
  color,
  icon,
  onClick,
  disabled,
}: {
  title: string;
  description: string;
  color: string;
  icon: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative group bg-gradient-to-br ${color} p-6 md:p-8 rounded-2xl md:rounded-3xl text-white shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-start text-left h-full border border-white/10`}
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>
      <div className="absolute bottom-0 right-0 p-6 opacity-10 group-hover:opacity-20 transform group-hover:scale-110 transition-all duration-500 pointer-events-none">
        <span className="text-8xl">{icon}</span>
      </div>
      <div className="text-4xl md:text-5xl mb-5 drop-shadow-lg p-3 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
        {icon}
      </div>
      <h2 className="text-xl md:text-2xl font-extrabold mb-3 tracking-tight">
        {title}
      </h2>
      <p className="text-sm opacity-90 font-medium leading-relaxed max-w-[85%]">
        {description}
      </p>
    </button>
  );
}

function SequentialVisualization({ state }: { state: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12">
      <div className="text-center mb-8">
        <p className="text-slate-300 mb-4 text-sm md:text-base">
          Executing sequentially: one number at a time
        </p>
        {state.step && (
          <div className="text-2xl md:text-3xl font-bold text-blue-400">
            Step {state.step}/12: Processing {state.activeNumber}
          </div>
        )}
      </div>

      {/* Number Queue */}
      <div className="flex gap-2 mb-8 md:mb-12 flex-wrap justify-center px-2">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
          <div
            key={num}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg font-bold transition text-xs md:text-sm ${
              state.activeNumber === num
                ? "bg-blue-500 text-white scale-125 animate-pulse"
                : state.currentSum >= (num * (num + 1)) / 2 - (12 - num)
                  ? "bg-green-500 text-white"
                  : "bg-slate-600 text-slate-300"
            }`}
          >
            {num}
          </div>
        ))}
      </div>

      {/* Processor */}
      <div
        className={`relative w-24 h-24 md:w-32 md:h-32 rounded-xl border-4 flex items-center justify-center font-bold text-xl md:text-2xl transition ${
          state.processorActive
            ? "border-blue-400 bg-blue-900 text-blue-300 animate-pulse"
            : "border-slate-500 bg-slate-700 text-slate-400"
        }`}
      >
        <div>CPU</div>
        {state.processorActive && (
          <div className="absolute inset-0 border-4 border-blue-400 rounded-xl animate-spin opacity-50" />
        )}
      </div>

      {/* Result */}
      {state.final && (
        <div className="mt-8 md:mt-12 text-center">
          <p className="text-slate-300 text-base md:text-lg mb-2">
            Sum of 1 to 12:
          </p>
          <div className="text-4xl md:text-5xl font-bold text-green-400">
            {state.currentSum}
          </div>
          <p className="text-slate-400 mt-2 text-sm md:text-base">
            Calculation complete!
          </p>
        </div>
      )}
    </div>
  );
}

function ParallelVisualization({ state }: { state: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12">
      <div className="text-center mb-8">
        <p className="text-slate-300 mb-4 text-sm md:text-base">
          Two processors work in parallel on shared memory
        </p>
      </div>

      {/* Processors Side by Side */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-16 mb-8 md:mb-12 w-full justify-center px-4">
        {/* Processor 1 */}
        <div className="flex flex-col items-center">
          <div className="text-slate-300 mb-4 text-xs md:text-sm">
            Processor 1
          </div>
          <div
            className={`relative w-24 h-24 md:w-28 md:h-28 rounded-lg border-4 flex items-center justify-center font-bold text-lg md:text-xl transition ${
              state.processor1Active
                ? "border-purple-400 bg-purple-900 text-purple-300 animate-pulse"
                : "border-slate-500 bg-slate-700 text-slate-400"
            }`}
          >
            <div>CPU</div>
            {state.processor1Active && (
              <div className="absolute inset-0 border-4 border-purple-400 rounded-lg animate-spin opacity-50" />
            )}
          </div>
          <div className="mt-4 text-center">
            <p className="text-slate-400 text-xs md:text-sm">Processing:</p>
            <p className="text-purple-400 font-bold text-lg">
              {state.processor1Number || "-"}
            </p>
            <p className="text-slate-400 text-xs md:text-sm mt-2">
              Sum: {state.sum1 || 0}
            </p>
          </div>
        </div>

        {/* Processor 2 */}
        <div className="flex flex-col items-center">
          <div className="text-slate-300 mb-4 text-xs md:text-sm">
            Processor 2
          </div>
          <div
            className={`relative w-24 h-24 md:w-28 md:h-28 rounded-lg border-4 flex items-center justify-center font-bold text-lg md:text-xl transition ${
              state.processor2Active
                ? "border-purple-400 bg-purple-900 text-purple-300 animate-pulse"
                : "border-slate-500 bg-slate-700 text-slate-400"
            }`}
          >
            <div>CPU</div>
            {state.processor2Active && (
              <div className="absolute inset-0 border-4 border-purple-400 rounded-lg animate-spin opacity-50" />
            )}
          </div>
          <div className="mt-4 text-center">
            <p className="text-slate-400 text-xs md:text-sm">Processing:</p>
            <p className="text-purple-400 font-bold text-lg">
              {state.processor2Number || "-"}
            </p>
            <p className="text-slate-400 text-xs md:text-sm mt-2">
              Sum: {state.sum2 || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Merge/Synchronization */}
      {state.merging && (
        <div className="mb-8 text-center">
          <div className="animate-bounce text-2xl text-purple-400 mb-2">↓</div>
          <p className="text-slate-300 font-semibold text-sm md:text-base">
            Synchronizing & Merging Results
          </p>
        </div>
      )}

      {/* Result */}
      {state.final && (
        <div className="mt-8 md:mt-12 text-center">
          <p className="text-slate-300 text-base md:text-lg mb-2">
            Final Sum (P1 + P2):
          </p>
          <div className="text-4xl md:text-5xl font-bold text-green-400">
            {state.currentSum}
          </div>
          <p className="text-slate-400 mt-2 text-sm md:text-base">
            Parallel execution complete!
          </p>
        </div>
      )}
    </div>
  );
}

function DistributedVisualization({ state }: { state: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12">
      <div className="text-center mb-8">
        <p className="text-slate-300 mb-4 text-sm md:text-base">
          Two distributed systems communicate via message passing
        </p>
      </div>

      {/* Processors Far Apart */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-16 lg:gap-32 mb-8 md:mb-12 relative w-full justify-center px-4">
        {/* Processor 1 */}
        <div className="flex flex-col items-center">
          <div className="text-slate-300 mb-4 text-xs md:text-sm">System A</div>
          <div
            className={`relative w-24 h-24 md:w-28 md:h-28 rounded-lg border-4 flex items-center justify-center font-bold text-lg md:text-xl transition ${
              state.processor1Active
                ? "border-orange-400 bg-orange-900 text-orange-300 animate-pulse"
                : "border-slate-500 bg-slate-700 text-slate-400"
            }`}
          >
            <div>CPU</div>
            {state.processor1Active && (
              <div className="absolute inset-0 border-4 border-orange-400 rounded-lg animate-spin opacity-50" />
            )}
          </div>
          <div className="mt-4 text-center">
            <p className="text-slate-400 text-xs md:text-sm">Processing:</p>
            <p className="text-orange-400 font-bold text-lg">
              {state.processor1Number || "-"}
            </p>
            <p className="text-slate-400 text-xs md:text-sm mt-2">
              Sum: {state.sum1 || 0}
            </p>
          </div>
        </div>

        {/* Processor 2 */}
        <div className="flex flex-col items-center">
          <div className="text-slate-300 mb-4 text-xs md:text-sm">System B</div>
          <div
            className={`relative w-24 h-24 md:w-28 md:h-28 rounded-lg border-4 flex items-center justify-center font-bold text-lg md:text-xl transition ${
              state.processor2Active
                ? "border-orange-400 bg-orange-900 text-orange-300 animate-pulse"
                : "border-slate-500 bg-slate-700 text-slate-400"
            }`}
          >
            <div>CPU</div>
            {state.processor2Active && (
              <div className="absolute inset-0 border-4 border-orange-400 rounded-lg animate-spin opacity-50" />
            )}
          </div>
          <div className="mt-4 text-center">
            <p className="text-slate-400 text-xs md:text-sm">Processing:</p>
            <p className="text-orange-400 font-bold text-lg">
              {state.processor2Number || "-"}
            </p>
            <p className="text-slate-400 text-xs md:text-sm mt-2">
              Sum: {state.sum2 || 0}
            </p>
          </div>
        </div>

        {/* Communication Link - Hidden on mobile */}
        {state.communicating && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 md:w-32 h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-pulse hidden md:block">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-orange-400 rounded-full animate-ping" />
          </div>
        )}
      </div>

      {/* Communication Status */}
      {state.communicating && (
        <div className="mb-8 text-center">
          <div className="animate-bounce text-2xl text-orange-400 mb-2">📡</div>
          <p className="text-slate-300 font-semibold text-sm md:text-base">
            Transmitting data via network...
          </p>
          <p className="text-slate-400 text-xs md:text-sm mt-2">
            (Simulating network delay)
          </p>
        </div>
      )}

      {/* Result */}
      {state.final && (
        <div className="mt-8 md:mt-12 text-center">
          <p className="text-slate-300 text-base md:text-lg mb-2">
            Final Sum (Received):
          </p>
          <div className="text-4xl md:text-5xl font-bold text-green-400">
            {state.currentSum}
          </div>
          <p className="text-slate-400 mt-2 text-sm md:text-base">
            Message passing complete!
          </p>
        </div>
      )}
    </div>
  );
}

function MetricsPanel({ metrics, mode }: { metrics: any; mode: string }) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-2xl rounded-2xl md:rounded-3xl p-5 md:p-8 border border-slate-700/50 shadow-[0_0_40px_rgba(0,0,0,0.3)] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 opacity-80" />
      <h3 className="text-xl md:text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
        <span className="text-2xl drop-shadow-md">📊</span> Performance
        Dashboard
      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6">
        <MetricCard label="Total Time" value={`${metrics.totalTime}ms`} />
        <MetricCard label="Processing" value={`${metrics.processingTime}ms`} />

        {mode === "parallel" && (
          <MetricCard label="Wait/Sync" value={`${metrics.waitingTime}ms`} />
        )}

        {mode === "distributed" && (
          <MetricCard
            label="Network Delay"
            value={`${metrics.communicationDelay}ms`}
          />
        )}

        <MetricCard
          label="Final Result"
          value={78}
          highlight={true}
          className={mode === "sequential" ? "col-span-2 lg:col-span-2" : ""}
        />
      </div>

      <div className="p-4 md:p-6 bg-slate-800/40 backdrop-blur-md rounded-xl md:rounded-2xl border border-slate-700/50 shadow-inner">
        <p className="text-slate-300 text-sm md:text-base leading-relaxed">
          {mode === "sequential" && (
            <>
              <strong className="text-blue-400">Sequential Processing:</strong>{" "}
              One processor executes all tasks one after another. No
              parallelism, pure sequential execution. All processing happens on
              a single CPU unit.
            </>
          )}
          {mode === "parallel" && (
            <>
              <strong className="text-purple-400">Parallel Processing:</strong>{" "}
              Two processors share memory and work on different data
              simultaneously. Both finish their tasks and synchronize before
              merging results. Watch how total time is roughly half of
              sequential!
            </>
          )}
          {mode === "distributed" && (
            <>
              <strong className="text-orange-400">
                Distributed Processing:
              </strong>{" "}
              Two independent systems process data in parallel, then communicate
              results via message passing. The network delay adds to total
              execution time. This simulates real-world distributed systems like
              microservices.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  highlight,
  className = "",
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`p-4 md:p-6 rounded-xl md:rounded-2xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-1 ${
        highlight
          ? "bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/30 hover:border-green-400/50 shadow-[0_0_15px_rgba(34,197,94,0.05)] hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] flex flex-col justify-center"
          : "bg-slate-800/40 border-slate-700/50 hover:border-slate-600/80 hover:bg-slate-800/60 shadow-lg"
      } ${className}`}
    >
      <p className="text-slate-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-1.5 md:mb-2">
        {label}
      </p>
      <p
        className={`text-xl md:text-3xl font-extrabold tracking-tight ${highlight ? "text-green-400 drop-shadow-sm" : "text-slate-100"}`}
      >
        {value}
      </p>
    </div>
  );
}

// New component for Results History comparison
function ComparisonCard({
  label,
  mode,
  time,
  isCount,
}: {
  label: string;
  mode: string;
  time: number;
  isCount?: boolean;
}) {
  const getColor = () => {
    if (isCount) return "from-slate-800 to-slate-900 border-slate-700/50";
    if (mode === "sequential")
      return "from-blue-900/40 to-blue-950/60 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]";
    if (mode === "parallel")
      return "from-purple-900/40 to-purple-950/60 border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.1)]";
    if (mode === "distributed")
      return "from-orange-900/40 to-orange-950/60 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]";
    return "from-slate-800 to-slate-900 border-slate-700/50";
  };

  const getModeLabel = () => {
    if (isCount) return "simulations";
    if (mode === "average") return "average";
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  return (
    <div
      className={`bg-gradient-to-br backdrop-blur-xl ${getColor()} rounded-2xl md:rounded-3xl p-6 border relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1`}
    >
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-3xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-sm tracking-tight">
        {isCount ? time : `${time}ms`}
      </p>
      <p className="text-slate-400/80 text-sm md:text-base font-medium">
        {getModeLabel()}
      </p>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
