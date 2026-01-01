import React from 'react';
import { motion } from 'framer-motion';
import Container from "@/components/layout/Container";

export default function Footer() {
  return (
    <footer className="py-12 border-t border-white/5">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center md:items-start"
          >
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              AI Lab
            </span>
            <span className="text-xs text-gray-600 tracking-widest uppercase">by Ambilio</span>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-6 text-sm text-gray-500"
          >
            <a href="#platform" className="hover:text-gray-300 transition-colors">Platform</a>
            <a href="#individuals" className="hover:text-gray-300 transition-colors">For Individuals</a>
            <a href="#enterprises" className="hover:text-gray-300 transition-colors">For Enterprises</a>
            <a href="#security" className="hover:text-gray-300 transition-colors">Security</a>
            <a href="#contact" className="hover:text-gray-300 transition-colors">Contact</a>
          </motion.div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm text-gray-600"
          >
            © 2026 Ambilio. All rights reserved.
          </motion.div>
        </div>
      </Container>
    </footer>
  );
}