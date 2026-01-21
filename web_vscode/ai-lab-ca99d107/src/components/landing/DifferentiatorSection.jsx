import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, ClipboardCheck, Gauge, ArrowRight } from 'lucide-react';

const differentiators = [
  {
    icon: Zap,
    title: 'Faster Experimentation',
    description: 'Skip weeks of setup. Go from idea to working prototype in hours, not months.',
  },
  {
    icon: Users,
    title: 'Seamless Collaboration',
    description: 'Share environments, code, and results with your team instantly—no sync headaches.',
  },
  {
    icon: ClipboardCheck,
    title: 'Clear Evaluation',
    description: 'Assess AI feasibility with real data in controlled conditions before committing resources.',
  },
  {
    icon: Gauge,
    title: 'Reduced Friction',
    description: 'One approved environment eliminates tool sprawl, vendor dependencies, and approval delays.',
  },
];

export default function DifferentiatorSection() {
  return (
    <section id="how-it-works" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm uppercase tracking-widest text-cyan-400 mb-4 block">
              Why AI Lab
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Not Just Tools.
              </span>
              <br />
              <span className="text-white">A Complete Ecosystem.</span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              AI Lab isn't a generic development environment or a collection of disconnected tools. 
              It's a purpose-built platform designed to reduce friction in AI experimentation and 
              accelerate decision-making through controlled, secure, and reusable environments.
            </p>
            
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 text-cyan-400 cursor-pointer group"
              >
                <span className="font-medium">See it in action</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </div>
          </motion.div>

          {/* Right - Feature cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {differentiators.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent hover:border-cyan-500/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}