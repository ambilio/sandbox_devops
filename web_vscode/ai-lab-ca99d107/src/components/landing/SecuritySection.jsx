import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Lock, Server, Eye, 
  KeyRound, Database, Cloud, Building
} from 'lucide-react';

const securityFeatures = [
  {
    icon: Lock,
    title: 'Secure Access Controls',
    description: 'Fine-grained permissions with SSO, MFA, and role-based access ensure only authorized users access resources.',
  },
  {
    icon: Database,
    title: 'Data Isolation',
    description: 'Complete separation between users and organizations. Your data never mixes with others.',
  },
  {
    icon: Eye,
    title: 'Audit & Compliance',
    description: 'Comprehensive logging, activity tracking, and compliance reporting for regulatory requirements.',
  },
  {
    icon: KeyRound,
    title: 'Encryption Everywhere',
    description: 'End-to-end encryption for data at rest and in transit using industry-standard protocols.',
  },
];

const deploymentOptions = [
  {
    icon: Cloud,
    title: 'Cloud-Hosted',
    description: 'Fully managed on our secure infrastructure. Get started in minutes.',
    badge: 'Most Popular',
  },
  {
    icon: Building,
    title: 'On-Premise',
    description: 'Deploy within your own data center for maximum control and compliance.',
    badge: 'Enterprise',
  },
  {
    icon: Server,
    title: 'Hybrid',
    description: 'Combine cloud flexibility with on-premise security where needed.',
    badge: 'Custom',
  },
];

export default function SecuritySection() {
  return (
    <section id="security" className="py-32 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-900/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-sm uppercase tracking-widest text-emerald-400 mb-4 block">
            Security & Deployment
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Enterprise-Grade Security
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Built from the ground up with security in mind. Deploy with confidence knowing your 
            data and experiments are protected by industry-leading security measures.
          </p>
        </motion.div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent hover:border-emerald-500/20 transition-all duration-300"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                  <feature.icon className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Deployment Options */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-white text-center mb-10">
            Deployment Options
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {deploymentOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="relative p-8 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent text-center hover:border-emerald-500/20 transition-all duration-300"
              >
                {option.badge && (
                  <span className="absolute top-4 right-4 text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {option.badge}
                  </span>
                )}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                  <option.icon className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">
                  {option.title}
                </h4>
                <p className="text-gray-400">
                  {option.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}