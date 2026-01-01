import React from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, Rocket, Clock, Wallet, 
  GraduationCap, Puzzle, RefreshCw, Shield
} from 'lucide-react';

const benefits = [
  {
    icon: GraduationCap,
    title: 'Learn Without Limits',
    description: 'Access cutting-edge AI tools and frameworks to build real skills.',
  },
  {
    icon: Puzzle,
    title: 'Experiment Freely',
    description: 'Test ideas without worrying about setup or compatibility issues.',
  },
  {
    icon: Rocket,
    title: 'Build Real Projects',
    description: 'Create production-ready AI applications, not just tutorials.',
  },
  {
    icon: RefreshCw,
    title: 'Resume Anytime',
    description: 'Your work saves automatically. Return exactly where you left off.',
  },
  {
    icon: Wallet,
    title: 'One Subscription',
    description: 'No juggling multiple tool costs or managing separate accounts.',
  },
  {
    icon: Shield,
    title: 'Zero Maintenance',
    description: 'We handle updates, security patches, and infrastructure.',
  },
];

export default function IndividualsSection() {
  return (
    <section id="individuals" className="py-32 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] -translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-sm uppercase tracking-widest text-purple-400 mb-4 block">
            For Individuals
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Personal AI Playground
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Whether you're learning, experimenting, or building your next big idea—AI Lab gives you 
            the tools and flexibility to move fast without the usual headaches.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20 group-hover:border-purple-500/40 transition-colors">
                  <benefit.icon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quote/Testimonial area */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-8 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-pink-500/5"
        >
          <div className="flex items-center gap-6">
            <Lightbulb className="w-16 h-16 text-purple-400 flex-shrink-0" />
            <div>
              <p className="text-xl text-gray-300 italic mb-2">
                "Stop spending time on setup and start spending time on ideas."
              </p>
              <p className="text-gray-500">
                Focus on what matters—learning, creating, and innovating.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}