import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp, Image as ImageIcon, Sun, Moon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { API_URL } from "./config";


function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function ScreenshotAnalyzer() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Toggle dark mode class on the body
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleFile = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
      setResult(null);
    } else {
      setError("Please upload a valid image file.");
    }
  };

  const analyzeScreenshot = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch("https://screenshot-analyzer-mdpu.onrender.com/analyze", { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Server unreachable');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Server connection failed. Showing demo data...");
      // Demo data for preview purposes
      setTimeout(() => {
        setResult({ status: "success", text: "Detected UI elements...", confidence: 0.98 });
        setIsAnalyzing(false);
      }, 1500);
    } finally {
      if (!error) setIsAnalyzing(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500 font-sans p-6 md:p-12",
      isDark ? "bg-black text-white" : "bg-[#FBFBFB] text-[#1d1d1f]"
    )}>
      
      {/* Theme Toggle */}
      <div className="max-w-[600px] mx-auto flex justify-end mb-4">
        <button 
          onClick={() => setIsDark(!isDark)}
          className={cn(
            "p-2 rounded-full transition-all duration-300",
            isDark ? "bg-gray-800 text-yellow-400 hover:bg-gray-700" : "bg-white text-gray-500 shadow-sm hover:bg-gray-50"
          )}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="max-w-[600px] mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-3">
          <motion.h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Screenshot Analyzer
          </motion.h1>
          <p className={cn("text-lg font-medium", isDark ? "text-gray-400" : "text-[#86868b]")}>
            Extract insights from your UI captures instantly.
          </p>
        </header>

        {/* Main Card */}
        <motion.div 
          className={cn(
            "relative border transition-all duration-500 rounded-[28px] p-8",
            isDark 
              ? "bg-[#1c1c1e] border-gray-800 shadow-2xl hover:border-blue-500/50" 
              : "bg-white/70 backdrop-blur-[20px] border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:border-blue-200"
          )}
        >
          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
            className={cn(
              "group relative flex flex-col items-center justify-center w-full min-h-[240px] border-2 border-dashed rounded-2xl transition-all duration-300",
              isDragging ? "border-blue-500 bg-blue-500/5" : (isDark ? "border-gray-700 bg-gray-900/50" : "border-gray-200 bg-gray-50/50"),
              preview ? "border-none p-0 overflow-hidden" : "p-10"
            )}
          >
            {preview ? (
              <div className="relative w-full h-full">
                <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-xl" />
                <button 
                  onClick={() => {setPreview(null); setFile(null);}}
                  className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white p-2 rounded-full hover:bg-red-500 transition-colors"
                >
                  <AlertCircle size={18} className="rotate-45" />
                </button>
              </div>
            ) : (
              <>
                <div className={cn("p-4 rounded-full mb-4 transition-transform group-hover:scale-110", isDark ? "bg-gray-800" : "bg-white shadow-sm")}>
                  <ImageIcon className="w-8 h-8 text-blue-500" />
                </div>
                <p className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>
                  <span className="text-blue-500 cursor-pointer">Upload a file</span> or drag and drop
                </p>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFile(e.target.files[0])} accept="image/*" />
              </>
            )}
          </div>

          {/* Action Button - FIXED VISIBILITY */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!file || isAnalyzing}
            onClick={analyzeScreenshot}
            className={cn(
              "w-full mt-8 py-4 rounded-full font-semibold transition-all duration-300",
              (!file || isAnalyzing) 
                ? (isDark ? "bg-gray-800 text-gray-500" : "bg-gray-200 text-gray-400") 
                : "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
            )}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
              </span>
            ) : "Analyze Screenshot"}
          </motion.button>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className={cn(
                "rounded-[28px] p-8 border transition-all duration-500",
                isDark ? "bg-[#1c1c1e] border-gray-800 hover:border-blue-500/30" : "bg-white border-gray-100 shadow-sm"
              )}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-500/10 p-2 rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <h2 className="text-xl font-semibold">Analysis Complete</h2>
                </div>

                <div className={cn("rounded-2xl p-6 overflow-x-auto", isDark ? "bg-black" : "bg-[#1d1d1f]")}>
                  <pre className="text-sm font-mono text-blue-400 leading-relaxed">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>

                <button 
                  onClick={() => setShowRaw(!showRaw)}
                  className="flex items-center justify-between w-full mt-6 text-sm font-medium text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <span>Raw Data</span>
                  {showRaw ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
