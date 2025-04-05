import React from 'react';
import TestMode from '../components/testing/TestMode';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <TestMode />
    </div>
  );
};

export default TestPage;