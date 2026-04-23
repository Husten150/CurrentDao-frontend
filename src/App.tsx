import React from 'react';
import { EnergyAdvisor } from './components/ai/EnergyAdvisor';
import { UsageOptimization } from './components/ai/UsageOptimization';
import { CostSavings } from './components/ai/CostSavings';
import { CarbonTracker } from './components/ai/CarbonTracker';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">CurrentDao</h1>
              <span className="ml-3 px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                AI Energy Advisor
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Personalized Energy Optimization</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <EnergyAdvisor />
          <UsageOptimization />
          <CostSavings />
          <CarbonTracker />
        </div>
      </main>
    </div>
  );
}

export default App;
