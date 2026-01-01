import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Target, TrendingUp, CheckCircle2,
  ArrowRight, Lightbulb, Cog, BarChart3
} from 'lucide-react';

const journeySteps = [
  {
    icon: Lightbulb,
    title: 'Curiosity',
    description: 'Explore AI possibilities without commitment',
  },
  {
    icon: Cog,
    title: 'Validation',
    description: 'Test workflows and assess feasibility',
  },
  {
    icon: BarChart3,
    title: 'Readiness',
    description: 'Evaluate before large-scale deployment',
  },
  {
    icon: Target,
    title: 'Execution',
    description: 'Move confidently to production',
  },
];

export default function ValueAddSection() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-blue-900/10 to-cyan-900/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-[150px]" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Journey visualization */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="space-y-6">
              {journeySteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="flex items-center gap-6"
                >
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
                      index === journeySteps.length - 1 
                        ? 'bg-gradient-to-r from-purple-500 to-cyan-500 border-transparent' 
                        : 'bg-white/5 border-white/10'
                    }`}>
                      <step.icon className={`w-7 h-7 ${
                        index === journeySteps.length - 1 ? 'text-white' : 'text-gray-400'
                      }`} />
                    </div>
                    {index < journeySteps.length - 1 && (
                      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-px h-6 bg-gradient-to-b from-white/20 to-transparent" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-lg font-semibold ${
                      index === journeySteps.length - 1 
                        ? 'bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent' 
                        : 'text-white'
                    }`}>
                      {step.title}
                    </h4>
                    <p className="text-gray-400">{step.description}</p>
                  </div>
                  {index < journeySteps.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-gray-600 hidden lg:block" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm uppercase tracking-widest text-cyan-400 mb-4 block">
              The Bridge to Production
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="text-white">From Curiosity to</span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Confident Execution
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              AI Lab provides the structured space your organization needs to validate ideas, 
              test workflows, and assess readiness—before committing to large-scale deployment.
            </p>

            <div className="space-y-4">
              {[
                'Validate AI concepts with real data in days, not months',
                'Identify technical and business risks before they become costly',
                'Build team confidence and expertise through hands-on experimentation',
                'Create a clear path from prototype to production',
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}