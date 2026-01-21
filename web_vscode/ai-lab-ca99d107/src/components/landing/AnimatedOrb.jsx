import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedOrb() {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center">
      {/* Main glowing orb */}
      <motion.div
        className="absolute w-72 h-72 rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #8B5CF6, #3B82F6, #06B6D4)',
          filter: 'blur(60px)',
          opacity: 0.6,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Rotating rings */}
      <motion.div
        className="absolute w-80 h-80 rounded-full border border-purple-500/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute w-96 h-96 rounded-full border border-blue-500/20"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute w-[450px] h-[450px] rounded-full border border-cyan-500/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: i % 3 === 0 ? '#8B5CF6' : i % 3 === 1 ? '#3B82F6' : '#06B6D4',
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Central core */}
      <motion.div
        className="relative w-32 h-32 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #06B6D4 100%)',
          boxShadow: '0 0 60px rgba(139, 92, 246, 0.5), 0 0 100px rgba(59, 130, 246, 0.3)',
        }}
        animate={{
          boxShadow: [
            '0 0 60px rgba(139, 92, 246, 0.5), 0 0 100px rgba(59, 130, 246, 0.3)',
            '0 0 80px rgba(139, 92, 246, 0.7), 0 0 120px rgba(59, 130, 246, 0.5)',
            '0 0 60px rgba(139, 92, 246, 0.5), 0 0 100px rgba(59, 130, 246, 0.3)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <motion.div
          className="w-20 h-20 rounded-full bg-[#0A0A0F]/80 backdrop-blur-sm flex items-center justify-center"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        >
          <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </motion.div>
      
      {/* Orbiting dots */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`orbit-${i}`}
          className="absolute"
          style={{
            width: 200 + i * 60,
            height: 200 + i * 60,
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 8 + i * 4,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: i === 0 ? '#8B5CF6' : i === 1 ? '#3B82F6' : '#06B6D4',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              boxShadow: `0 0 20px ${i === 0 ? '#8B5CF6' : i === 1 ? '#3B82F6' : '#06B6D4'}`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}