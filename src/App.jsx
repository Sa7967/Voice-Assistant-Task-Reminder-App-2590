import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import VoiceListener from './components/VoiceListener';
import TaskManager from './components/TaskManager';
import ItemTracker from './components/ItemTracker';
import Navigation from './components/Navigation';
import { VoiceProvider } from './context/VoiceContext';
import { TaskProvider } from './context/TaskContext';
import { ItemProvider } from './context/ItemContext';
import './App.css';

function App() {
  const [isListening, setIsListening] = useState(false);

  return (
    <VoiceProvider>
      <TaskProvider>
        <ItemProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
              <div className="container mx-auto px-4 py-6">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-8"
                >
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Smart Voice Assistant
                  </h1>
                  <p className="text-blue-100 text-lg">
                    आपका व्यक्तिगत याददाश्त सहायक
                  </p>
                </motion.div>

                <Navigation />
                
                <Routes>
                  <Route path="/" element={
                    <div className="space-y-6">
                      <VoiceListener />
                      <TaskManager />
                    </div>
                  } />
                  <Route path="/tasks" element={<TaskManager />} />
                  <Route path="/items" element={<ItemTracker />} />
                </Routes>
              </div>
            </div>
          </Router>
        </ItemProvider>
      </TaskProvider>
    </VoiceProvider>
  );
}

export default App;