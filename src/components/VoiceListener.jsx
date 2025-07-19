import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useVoice } from '../context/VoiceContext';
import { useTask } from '../context/TaskContext';
import { useItem } from '../context/ItemContext';

const { FiMic, FiMicOff, FiVolume2, FiVolumeX } = FiIcons;

const VoiceListener = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessedText, setLastProcessedText] = useState('');
  const recognitionRef = useRef(null);
  const { isMuted, setIsMuted } = useVoice();
  const { addTask } = useTask();
  const { addItem, findItem } = useItem();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'hi-IN';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          processVoiceInput(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const processVoiceInput = async (text) => {
    if (text === lastProcessedText) return;
    
    setIsProcessing(true);
    setLastProcessedText(text);

    try {
      // Task detection patterns
      const taskPatterns = [
        /(.+?)\s*(कल|tomorrow)\s*(करना|लेना|भेजना|जाना|खरीदना|है)/gi,
        /(.+?)\s*(आज|today)\s*(करना|लेना|भेजना|जाना|खरीदना|है)/gi,
        /(याद रखना|remember|reminder)\s*(.+)/gi,
        /(.+?)\s*(बजे|o'clock|AM|PM)\s*(करना|लेना|भेजना|जाना|है)/gi,
        /(दवाई|medicine|tablet|pill)\s*(लेना|take)/gi,
        /(बिल|bill|payment)\s*(जमा|pay|submit)/gi,
        /(प्रेजेंटेशन|presentation|report)\s*(भेजना|send|submit)/gi
      ];

      // Item storage patterns
      const itemPatterns = [
        /(मैंने|maine|I)\s*(.+?)\s*(रखा|rakha|kept|placed)\s*(.+?)\s*(में|me|in)/gi,
        /(.+?)\s*(अलमारी|almari|cupboard|drawer)\s*(में|me|in)\s*(रखा|rakha|kept)/gi
      ];

      // Item query patterns
      const queryPatterns = [
        /(.+?)\s*(कहाँ|kahan|where)\s*(है|hai|is)/gi,
        /(कहाँ|where)\s*(है|is)\s*(.+)/gi
      ];

      let taskDetected = false;
      let itemDetected = false;
      let queryDetected = false;

      // Check for task patterns
      for (const pattern of taskPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          const taskText = matches[0];
          const reminderTime = extractReminderTime(taskText);
          
          addTask({
            id: Date.now(),
            text: taskText,
            time: reminderTime,
            completed: false,
            createdAt: new Date()
          });
          
          taskDetected = true;
          speak(`कार्य जोड़ा गया: ${taskText}`);
          break;
        }
      }

      // Check for item storage patterns
      if (!taskDetected) {
        for (const pattern of itemPatterns) {
          const matches = text.match(pattern);
          if (matches) {
            const itemName = extractItemName(text);
            const location = extractLocation(text);
            
            if (itemName && location) {
              addItem({
                id: Date.now(),
                name: itemName,
                location: location,
                createdAt: new Date()
              });
              
              itemDetected = true;
              speak(`याद रखा गया: ${itemName} ${location} में है`);
              break;
            }
          }
        }
      }

      // Check for item query patterns
      if (!taskDetected && !itemDetected) {
        for (const pattern of queryPatterns) {
          const matches = text.match(pattern);
          if (matches) {
            const itemName = extractQueryItem(text);
            const foundItem = findItem(itemName);
            
            if (foundItem) {
              queryDetected = true;
              speak(`${foundItem.name} ${foundItem.location} में है`);
              break;
            }
          }
        }
      }

    } catch (error) {
      console.error('Error processing voice input:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const extractReminderTime = (text) => {
    const now = new Date();
    
    // Extract time patterns
    const timePatterns = [
      /(\d+)\s*(बजे|o'clock|AM|PM)/gi,
      /(शाम|evening|रात|night|सुबह|morning)/gi
    ];

    // Check for specific times
    for (const pattern of timePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        const timeStr = matches[0];
        if (timeStr.includes('बजे') || timeStr.includes('o'clock')) {
          const hour = parseInt(timeStr.match(/\d+/)[0]);
          const reminderTime = new Date(now);
          reminderTime.setHours(hour, 0, 0, 0);
          return reminderTime;
        }
      }
    }

    // Default time logic
    if (text.includes('कल') || text.includes('tomorrow')) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      return tomorrow;
    } else if (text.includes('आज') || text.includes('today')) {
      const today = new Date(now);
      today.setHours(19, 0, 0, 0);
      return today;
    } else {
      // Default: 1 hour from now
      const oneHourLater = new Date(now);
      oneHourLater.setHours(oneHourLater.getHours() + 1);
      return oneHourLater;
    }
  };

  const extractItemName = (text) => {
    const commonItems = ['चार्जर', 'charger', 'चाबी', 'keys', 'फोन', 'phone', 'पर्स', 'wallet', 'चश्मा', 'glasses'];
    
    for (const item of commonItems) {
      if (text.toLowerCase().includes(item.toLowerCase())) {
        return item;
      }
    }
    
    // Extract item between common words
    const match = text.match(/(मैंने|maine)\s*(.+?)\s*(रखा|rakha)/gi);
    if (match) {
      return match[0].replace(/(मैंने|maine|रखा|rakha)/gi, '').trim();
    }
    
    return null;
  };

  const extractLocation = (text) => {
    const locations = ['अलमारी', 'almari', 'cupboard', 'drawer', 'बैग', 'bag', 'टेबल', 'table'];
    
    for (const location of locations) {
      if (text.toLowerCase().includes(location.toLowerCase())) {
        return location;
      }
    }
    
    return 'कहीं'; // somewhere
  };

  const extractQueryItem = (text) => {
    const commonItems = ['चार्जर', 'charger', 'चाबी', 'keys', 'फोन', 'phone', 'पर्स', 'wallet', 'चश्मा', 'glasses'];
    
    for (const item of commonItems) {
      if (text.toLowerCase().includes(item.toLowerCase())) {
        return item;
      }
    }
    
    return text.replace(/(कहाँ|where|है|is)/gi, '').trim();
  };

  const speak = (text) => {
    if (isMuted) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.8;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center"
    >
      <div className="flex justify-center items-center space-x-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleListening}
          className={`p-4 rounded-full transition-all duration-300 ${
            isListening
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <SafeIcon 
            icon={isListening ? FiMic : FiMicOff} 
            className="text-3xl" 
          />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMute}
          className={`p-3 rounded-full transition-all duration-300 ${
            isMuted
              ? 'bg-gray-500 text-white'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <SafeIcon 
            icon={isMuted ? FiVolumeX : FiVolume2} 
            className="text-xl" 
          />
        </motion.button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isListening ? 'bg-red-400 animate-pulse' : 'bg-gray-400'
          }`} />
          <span className="text-white font-medium">
            {isListening ? 'सुन रहा हूं...' : 'सुनना बंद है'}
          </span>
        </div>

        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-blue-500/20 rounded-lg p-3"
            >
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="text-white text-sm ml-2">प्रोसेसिंग...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 rounded-lg p-4 text-left"
          >
            <p className="text-white text-sm leading-relaxed">{transcript}</p>
          </motion.div>
        )}
      </div>

      <div className="mt-6 text-blue-100 text-sm">
        <p>मैं आपकी बातें सुन रहा हूं और महत्वपूर्ण कार्यों को याद रख रहा हूं</p>
        <p className="mt-1">उदाहरण: "कल दवाई लेना है" या "मैंने चार्जर अलमारी में रखा"</p>
      </div>
    </motion.div>
  );
};

export default VoiceListener;