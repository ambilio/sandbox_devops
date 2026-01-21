import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, ShieldCheck, Gauge, Users2, 
  FileCheck, Server, Palette, Zap, CheckCircle2
} from 'lucide-react';

const enterpriseBenefits = [
  {
    icon: Building2,
    title: 'Single Approved Environment',
    description: 'One platform for all AI experimentation—simplify procurement and governance.',
  },
  {
    icon: ShieldCheck,
    title: 'Reduced Vendor Dependency',
    description: 'No need to manage multiple tool subscriptions, licenses, or integrations.',
  },
  {
    icon: FileCheck,
    title: 'Simplified Approvals',
    description: 'Get one sign-off instead of dozens. Accelerate project kickoffs.',
  },
  {
    icon: Gauge,
    title: 'Minimal IT/InfoSec Overhead',
    description: 'Pre-vetted security controls reduce review cycles dramatically.',
  },
  {
    icon: Server,
    title: 'Flexible Deployment',
    description: 'Cloud-hosted, on-premise, or hybrid—deploy where your policies require.',
  },
  {
    icon: Palette,
    title: 'White-Label Ready',
    description: 'Brand AI Lab as your own internal platform for teams.',
  },
];

const complianceFeatures = [
  'SOC 2 Type II Ready',
  'GDPR Compliant',
  'Data Isolation',
  'SSO/SAML Support',
  'Audit Logging',
  'Role-Based Access',
];

export default function EnterprisesSection() {
  return (
    <section id="enterprises" className="py-32 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm uppercase tracking-widest text-blue-400 mb-4 block">
              For Enterprises
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Accelerate AI Innovation
              </span>
              <br />
              <span className="text-white">Without the Chaos</span>
            </h2>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed">
              Give your teams a secure, standardized environment for AI experimentation. 
              Reduce time-to-value while maintaining the controls your organization needs.
            </p>

            {/* Compliance badges */}
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-4">
                Compliance & Security
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {complianceFeatures.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right - Benefits cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {enterpriseBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 8 }}
                className="flex items-start gap-4 p-5 rounded-xl border border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent hover:border-blue-500/20 transition-all duration-300 cursor-default"
              >
                <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/20">
                  <benefit.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}