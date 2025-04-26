import React, { useState } from 'react';
import CodeComplexityMeter from '../components/CodeComplexityMeter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FileText, InfoIcon, GitBranch, Code } from 'lucide-react';
import { analyzeCodeComplexity } from '../services/analysis/codeComplexityService';

// Sample code examples to showcase the meter
const codeExamples = {
  simple: `// Simple function to calculate the sum of two numbers
function add(a, b) {
  return a + b;
}

// Calculate the sum
const result = add(5, 3);
console.log("The sum is:", result);`,

  moderate: `/**
 * Returns a greeting message based on time of day
 * @param name Person's name
 * @param hour Current hour (0-23)
 * @returns Greeting message
 */
function getGreeting(name, hour) {
  let greeting = '';
  
  if (hour < 12) {
    greeting = 'Good morning';
  } else if (hour < 18) {
    greeting = 'Good afternoon';
  } else {
    greeting = 'Good evening';
  }
  
  return \`\${greeting}, \${name}!\`;
}

// Get current hour
const now = new Date();
const currentHour = now.getHours();

// Get greeting for different people
const janeGreeting = getGreeting('Jane', currentHour);
const johnGreeting = getGreeting('John', currentHour);

console.log(janeGreeting);
console.log(johnGreeting);`,

  complex: `/**
 * Binary search tree implementation
 */
class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }
  
  insert(value) {
    const newNode = new TreeNode(value);
    
    if (!this.root) {
      this.root = newNode;
      return this;
    }
    
    let current = this.root;
    
    while (true) {
      if (value === current.value) return this;
      
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          return this;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          return this;
        }
        current = current.right;
      }
    }
  }
  
  find(value) {
    if (!this.root) return false;
    
    let current = this.root;
    let found = false;
    
    while (current && !found) {
      if (value < current.value) {
        current = current.left;
      } else if (value > current.value) {
        current = current.right;
      } else {
        found = true;
      }
    }
    
    if (!found) return false;
    return current;
  }
  
  // Depth-first search - in-order traversal
  dfsInOrder() {
    const data = [];
    
    function traverse(node) {
      if (node.left) traverse(node.left);
      data.push(node.value);
      if (node.right) traverse(node.right);
    }
    
    if (this.root) traverse(this.root);
    return data;
  }
}

// Usage
const bst = new BinarySearchTree();
bst.insert(10);
bst.insert(5);
bst.insert(15);
bst.insert(2);
bst.insert(7);
bst.insert(1);

console.log(bst.dfsInOrder());
console.log(bst.find(7));
console.log(bst.find(99));`,

  nightmare: `/**
 * Over-engineered and overly complex example
 * with multiple nested callbacks, poor structure,
 * and excessive complexity
 */
function processData(data, options, callback) {
  let results = [];
  let errors = [];
  let processed = 0;
  
  // Configuration with defaults
  const config = {
    retryCount: options?.retryCount || 3,
    timeout: options?.timeout || 1000,
    batchSize: options?.batchSize || 10,
    validateResults: options?.validateResults || false,
    transformData: options?.transformData || ((x) => x),
    errorHandling: options?.errorHandling || 'continue',
    ...options
  };
  
  // Process data in batches
  for (let i = 0; i < data.length; i += config.batchSize) {
    const batch = data.slice(i, i + config.batchSize);
    
    processBatch(batch, (batchResults, batchErrors) => {
      processed += batch.length;
      
      if (batchResults) {
        results = [...results, ...batchResults];
      }
      
      if (batchErrors && batchErrors.length > 0) {
        if (config.errorHandling === 'fail') {
          callback(null, batchErrors);
          return;
        } else {
          errors = [...errors, ...batchErrors];
        }
      }
      
      if (processed >= data.length) {
        if (config.validateResults) {
          validateResults(results, (valid, validationErrors) => {
            if (valid) {
              callback(results, errors.length > 0 ? errors : null);
            } else {
              callback(null, [...errors, ...validationErrors]);
            }
          });
        } else {
          callback(results, errors.length > 0 ? errors : null);
        }
      }
    });
  }
  
  function processBatch(batch, batchCallback) {
    const batchResults = [];
    const batchErrors = [];
    let processedInBatch = 0;
    
    batch.forEach((item, index) => {
      let retries = 0;
      
      const processWithRetry = () => {
        try {
          if (typeof item !== 'object') {
            throw new Error('Item is not an object');
          }
          
          if (!item.id) {
            throw new Error('Item has no ID');
          }
          
          setTimeout(() => {
            try {
              const processed = config.transformData(item);
              
              if (processed.value && processed.value < 0) {
                throw new Error('Negative value not allowed');
              }
              
              batchResults.push(processed);
              checkBatchComplete();
            } catch (error) {
              handleItemError(error);
            }
          }, Math.random() * config.timeout);
          
        } catch (error) {
          handleItemError(error);
        }
      };
      
      const handleItemError = (error) => {
        retries++;
        if (retries <= config.retryCount) {
          console.log(\`Retrying item \${item.id}, attempt \${retries}\`);
          processWithRetry();
        } else {
          batchErrors.push({ item, error: error.message });
          checkBatchComplete();
        }
      };
      
      const checkBatchComplete = () => {
        processedInBatch++;
        if (processedInBatch >= batch.length) {
          batchCallback(batchResults, batchErrors);
        }
      };
      
      processWithRetry();
    });
  }
  
  function validateResults(results, validationCallback) {
    // Complex validation logic
    const validationErrors = [];
    
    let uniqueIds = new Set();
    results.forEach(result => {
      if (uniqueIds.has(result.id)) {
        validationErrors.push({ item: result, error: 'Duplicate ID detected' });
      } else {
        uniqueIds.add(result.id);
      }
      
      if (result.dependencies) {
        result.dependencies.forEach(depId => {
          if (!results.some(r => r.id === depId)) {
            validationErrors.push({ 
              item: result, 
              error: \`Missing dependency: \${depId}\` 
            });
          }
        });
      }
    });
    
    const complexityScore = results.reduce((score, item) => {
      return score + (item.complexity || 0);
    }, 0) / results.length;
    
    if (complexityScore > 5) {
      validationErrors.push({
        error: \`Average complexity too high: \${complexityScore.toFixed(2)}\`
      });
    }
    
    validationCallback(validationErrors.length === 0, validationErrors);
  }
}

// Example usage
const sampleData = [
  { id: 1, value: 10, dependencies: [2, 3] },
  { id: 2, value: 20, dependencies: [] },
  { id: 3, value: 30, dependencies: [4] },
  // Missing dependency 4
];

processData(sampleData, {
  retryCount: 2,
  validateResults: true,
  transformData: (item) => {
    return {
      ...item,
      complexity: item.dependencies ? item.dependencies.length * 2 : 0,
      processed: true
    };
  }
}, (results, errors) => {
  console.log('Results:', results);
  console.log('Errors:', errors);
});`
};

const CodeMoodMeterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('simple');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResult(result);
  };

  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Code Complexity Mood Meter</h1>
          <Button variant="outline" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Branch: clean_fixes_20250410_163230
          </Button>
        </div>

        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>One-click complexity analysis</AlertTitle>
          <AlertDescription>
            This tool analyzes your code to determine its complexity level and provides a "mood" representation
            that helps you understand the maintainability of your code at a glance.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Sample Code Examples
            </CardTitle>
            <CardDescription>
              Try these examples to see how the complexity meter works with different types of code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="simple">Simple</TabsTrigger>
                <TabsTrigger value="moderate">Moderate</TabsTrigger>
                <TabsTrigger value="complex">Complex</TabsTrigger>
                <TabsTrigger value="nightmare">Nightmare</TabsTrigger>
              </TabsList>
              
              <TabsContent value="simple" className="mt-0">
                <CodeComplexityMeter 
                  initialCodeText={codeExamples.simple}
                  onAnalysisComplete={handleAnalysisComplete}
                />
              </TabsContent>
              
              <TabsContent value="moderate" className="mt-0">
                <CodeComplexityMeter 
                  initialCodeText={codeExamples.moderate}
                  onAnalysisComplete={handleAnalysisComplete}
                />
              </TabsContent>
              
              <TabsContent value="complex" className="mt-0">
                <CodeComplexityMeter 
                  initialCodeText={codeExamples.complex}
                  onAnalysisComplete={handleAnalysisComplete}
                />
              </TabsContent>
              
              <TabsContent value="nightmare" className="mt-0">
                <CodeComplexityMeter 
                  initialCodeText={codeExamples.nightmare}
                  onAnalysisComplete={handleAnalysisComplete}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {analysisResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Detailed Analysis Results
              </CardTitle>
              <CardDescription>
                In-depth metrics from the code complexity analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Primary Metrics</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span>Lines of Code:</span>
                      <span className="font-medium">{analysisResult.linesOfCode}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Cyclomatic Complexity:</span>
                      <span className="font-medium">{analysisResult.cyclomaticComplexity}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Dependencies:</span>
                      <span className="font-medium">{analysisResult.dependencyCount}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Overall Score:</span>
                      <span className="font-medium">{analysisResult.score?.toFixed(1)} / 100</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Interpretation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {analysisResult.score < 30 && "This code is clean, readable, and highly maintainable. It follows good programming practices and should be easy to understand and modify."}
                    {analysisResult.score >= 30 && analysisResult.score < 60 && "This code has a moderate level of complexity. While still manageable, there are areas that could be simplified to improve maintainability."}
                    {analysisResult.score >= 60 && analysisResult.score < 85 && "This code is quite complex and may be difficult to maintain. Consider refactoring to improve readability and reduce complexity."}
                    {analysisResult.score >= 85 && "This code has reached a very high complexity level. It's likely to be fragile and difficult to maintain. Refactoring is strongly recommended."}
                  </p>
                  <div className="mt-4">
                    <h4 className="font-medium mb-1">Recommendations:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {analysisResult.cyclomaticComplexity > 10 && (
                        <li>Reduce nested conditions and break down complex functions</li>
                      )}
                      {analysisResult.linesOfCode > 100 && (
                        <li>Split large functions into smaller, more focused ones</li>
                      )}
                      {analysisResult.dependencyCount > 5 && (
                        <li>Consider reducing external dependencies</li>
                      )}
                      <li>Add appropriate comments to clarify complex logic</li>
                      <li>Consider writing unit tests to verify behavior</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CodeMoodMeterPage;