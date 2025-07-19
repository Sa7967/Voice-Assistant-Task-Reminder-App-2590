import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useTask } from '../context/TaskContext';
import { useVoice } from '../context/VoiceContext';
import { format } from 'date-fns';

const { FiCheckSquare, FiSquare, FiClock, FiTrash2, FiVolume2, FiFilter } = FiIcons;

const TaskManager = () => {
  const { tasks, toggleTask, deleteTask } = useTask();
  const { isMuted } = useVoice();
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const speak = (text) => {
    if (isMuted) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.8;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  };

  const handleTaskToggle = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      toggleTask(taskId);
      if (!task.completed) {
        speak(`कार्य पूरा हुआ: ${task.text}`);
      }
    }
  };

  const handleTaskDelete = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      deleteTask(taskId);
      speak('कार्य हटाया गया');
    }
  };

  const playTaskText = (text) => {
    speak(text);
  };

  const formatTime = (date) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">कार्य सूची</h2>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
              {activeTasks.length} सक्रिय
            </span>
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
              {completedTasks.length} पूर्ण
            </span>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'सभी' },
            { key: 'active', label: 'सक्रिय' },
            { key: 'completed', label: 'पूर्ण' }
          ].map(({ key, label }) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                filter === key
                  ? 'bg-white text-blue-600 font-medium'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center"
            >
              <SafeIcon icon={FiCheckSquare} className="text-4xl text-white/50 mx-auto mb-4" />
              <p className="text-white/70 text-lg">
                {filter === 'all' ? 'कोई कार्य नहीं मिला' : 
                 filter === 'active' ? 'कोई सक्रिय कार्य नहीं' : 
                 'कोई पूर्ण कार्य नहीं'}
              </p>
            </motion.div>
          ) : (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className={`bg-white/10 backdrop-blur-md rounded-xl p-4 ${
                  task.completed ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleTaskToggle(task.id)}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      task.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <SafeIcon 
                      icon={task.completed ? FiCheckSquare : FiSquare} 
                      className="text-xl" 
                    />
                  </motion.button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-lg font-medium ${
                      task.completed ? 'text-white/60 line-through' : 'text-white'
                    }`}>
                      {task.text}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1 text-blue-200 text-sm">
                        <SafeIcon icon={FiClock} className="text-sm" />
                        <span>{formatTime(task.time)}</span>
                      </div>
                      
                      {task.createdAt && (
                        <span className="text-white/50 text-xs">
                          बनाया: {formatTime(task.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => playTaskText(task.text)}
                      className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all duration-300"
                    >
                      <SafeIcon icon={FiVolume2} className="text-lg" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleTaskDelete(task.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all duration-300"
                    >
                      <SafeIcon icon={FiTrash2} className="text-lg" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Quick Stats */}
      {tasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-4"
        >
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{activeTasks.length}</div>
              <div className="text-blue-200 text-sm">बकाया कार्य</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{completedTasks.length}</div>
              <div className="text-green-200 text-sm">पूर्ण कार्य</div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TaskManager;