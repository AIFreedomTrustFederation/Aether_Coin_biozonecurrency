// BraintrustEvaluator.tsx
import React, { useState } from 'react';
import { braintrustService, EvaluationData } from '../../shared/services/BraintrustService';

interface BraintrustEvaluatorProps {
  name: string;
  initialDataset?: EvaluationData[];
  taskFn: (input: any) => Promise<any>;
  onEvaluationComplete?: (result: any) => void;
}

const BraintrustEvaluator: React.FC<BraintrustEvaluatorProps> = ({
  name,
  initialDataset = [],
  taskFn,
  onEvaluationComplete
}) => {
  const [dataset, setDataset] = useState<EvaluationData[]>(initialDataset);
  const [newInput, setNewInput] = useState('');
  const [newExpected, setNewExpected] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const addDataPoint = () => {
    if (newInput && newExpected) {
      setDataset([...dataset, { input: newInput, expected: newExpected }]);
      setNewInput('');
      setNewExpected('');
    }
  };

  const removeDataPoint = (index: number) => {
    const newDataset = [...dataset];
    newDataset.splice(index, 1);
    setDataset(newDataset);
  };

  const runEvaluation = async () => {
    if (dataset.length === 0) {
      setError('Please add at least one data point');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const evaluationResult = await braintrustService.runEvaluation({
        name,
        dataset,
        taskFn
      });
      
      setResult(evaluationResult);
      
      if (onEvaluationComplete) {
        onEvaluationComplete(evaluationResult);
      }
    } catch (err) {
      setError(`Evaluation failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Braintrust Evaluator: {name}</h2>
      
      {/* Dataset Management */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Evaluation Dataset</h3>
        
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newInput}
              onChange={(e) => setNewInput(e.target.value)}
              placeholder="Input"
              className="flex-1 p-2 border rounded"
            />
            <input
              type="text"
              value={newExpected}
              onChange={(e) => setNewExpected(e.target.value)}
              placeholder="Expected Output"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={addDataPoint}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        </div>
        
        {dataset.length > 0 ? (
          <div className="border rounded overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Input</th>
                  <th className="p-2 text-left">Expected Output</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dataset.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2">{JSON.stringify(item.input)}</td>
                    <td className="p-2">{JSON.stringify(item.expected)}</td>
                    <td className="p-2">
                      <button
                        onClick={() => removeDataPoint(index)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic">No data points added yet</p>
        )}
      </div>
      
      {/* Run Evaluation */}
      <div className="mb-6">
        <button
          onClick={runEvaluation}
          disabled={isLoading || dataset.length === 0}
          className={`px-4 py-2 rounded ${
            isLoading || dataset.length === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isLoading ? 'Running...' : 'Run Evaluation'}
        </button>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* Results Display */}
      {result && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Evaluation Results</h3>
          <div className="p-3 bg-gray-50 border rounded">
            <p className="mb-2">
              <strong>View detailed results:</strong>{' '}
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {result.url}
              </a>
            </p>
            <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-60">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default BraintrustEvaluator;