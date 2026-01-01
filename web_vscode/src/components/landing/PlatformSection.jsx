import React from 'react';
import { motion } from 'framer-motion';
import { 
  Code2, Database, Bot, Boxes, Sparkles, 
  Terminal, Layers, Cpu, Workflow, Brain
} from 'lucide-react';

const toolCategories = [
  {
    icon: Terminal,
    title: 'Development Environments',
    tools: ['VS Code', 'Jupyter Lab', 'Terminal'],
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    icon: Database,
    title: 'Databases',
    tools: ['MySQL', 'PostgreSQL', 'MongoDB'],
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    icon: Workflow,
    title: 'Agentic Frameworks',
    tools: ['Langflow', 'CrewAI', 'AutoGen'],
    gradient: 'from-cyan-500 to-cyan-600',
  },
  {
    icon: Boxes,
    title: 'Vector Databases',
    tools: ['Pinecone', 'Weaviate', 'Chroma'],
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: Brain,
    title: 'LLMs & AI Services',
    tools: ['OpenAI', 'Claude', 'Gemini', 'Perplexity'],
    gradient: 'from-orange-500 to-orange-600',
  },
  {
    icon: Sparkles,
    title: 'Generative AI',
    tools: ['ElevenLabs', 'HeyGen', 'Midjourney API'],
    gradient: 'from-pink-500 to-pink-600',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function PlatformSection() {
  return (
    <section id="platform" className="py-32 relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-sm uppercase tracking-widest text-purple-400 mb-4 block">
            Everything You Need
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Pre-Integrated Tools
            </span>
            <br />
            <span className="text-white">Ready to Use</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything required for AI experiments and development is already set up. 
            No installations, no configurations—just start building.
          </p>
        </motion.div>

        {/* Tools Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {toolCategories.map((category, index) => (
            <motion.div
              key={category.title}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl -z-10"
                style={{
                  background: `linear-gradient(135deg, ${category.gradient.includes('purple') ? '#8B5CF6' : category.gradient.includes('blue') ? '#3B82F6' : category.gradient.includes('cyan') ? '#06B6D4' : category.gradient.includes('emerald') ? '#10B981' : category.gradient.includes('orange') ? '#F97316' : '#EC4899'}20, transparent)`,
                }}
              />
              <div className="h-full p-8 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-sm hover:border-white/10 transition-all duration-300">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${category.gradient} p-3 mb-6 shadow-lg`}>
                  <category.icon className="w-full h-full text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-4">
                  {category.title}
                </h3>

                {/* Tools list */}
                <div className="flex flex-wrap gap-2">
                  {category.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-3 py-1.5 text-sm text-gray-300 bg-white/5 rounded-lg border border-white/5"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-gray-500 text-lg">
            <span className="text-gray-300">And many more tools</span> — all in one place, ready when you are.
          </p>
        </motion.div>
      </div>
    </section>
  );
}