import React, { createContext, useContext, useState, useEffect } from 'react';

const TaskContext = createContext();

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('voiceAssistantTasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save tasks to localStorage
    localStorage.setItem('voiceAssistantTasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task) => {
    setTasks(prev => [...prev, task]);
    
    // Set up notification reminder
    if (task.time) {
      const now = new Date();
      const reminderTime = new Date(task.time);
      const timeDiff = reminderTime.getTime() - now.getTime();
      
      if (timeDiff > 0) {
        setTimeout(() => {
          // Show notification
          if (Notification.permission === 'granted') {
            new Notification('कार्य रिमाइंडर', {
              body: task.text,
              icon: '/vite.svg'
            });
          }
          
          // Speak reminder
          const utterance = new SpeechSynthesisUtterance(`रिमाइंडर: ${task.text}`);
          utterance.lang = 'hi-IN';
          speechSynthesis.speak(utterance);
        }, timeDiff);
      }
    }
  };

  const toggleTask = (taskId) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const value = {
    tasks,
    addTask,
    toggleTask,
    deleteTask
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};