'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Linkedin, Recycle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-8 transition-colors duration-200 mt-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#062319] border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-md">
            <Recycle className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white text-xl tracking-tight">
            Trash<span className="text-emerald-500 dark:text-emerald-400">Tag</span>
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-xs hidden sm:inline">
            — Environmental Recovery Platform
          </span>
        </div>

        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center font-medium">
          Designed & Developed by{' '}
          <span className="text-slate-900 dark:text-white font-bold">Vivek Singh</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Vivek1035"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 transition-all shadow-sm flex items-center gap-2 text-xs font-semibold group"
            title="GitHub Profile"
          >
            <Github className="w-4 h-4 text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
            <span>GitHub</span>
          </a>
          <a
            href="https://www.linkedin.com/in/vivek-singh-087b46243/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 transition-all shadow-sm flex items-center gap-2 text-xs font-semibold group"
            title="LinkedIn Profile"
          >
            <Linkedin className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
            <span>LinkedIn</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

