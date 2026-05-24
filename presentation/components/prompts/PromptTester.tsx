'use client';

import { useState, useMemo } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { FiPlay, FiSettings, FiCheck, FiCopy } from 'react-icons/fi';

interface PromptTesterProps {
  promptText: string;
}

export function PromptTester({ promptText }: PromptTesterProps) {
  const [model, setModel] = useState('llama3-8b-8192');
  const [copied, setCopied] = useState(false);

  // Extract variables [var] or {{var}}
  const variables = useMemo(() => {
    const regex = /\[([^\]]+)\]|\{\{([^}]+)\}\}/g;
    const matches = Array.from(promptText.matchAll(regex));
    const uniqueVars = Array.from(new Set(matches.map(m => m[1] || m[2])));
    return uniqueVars;
  }, [promptText]);

  const [varInputs, setVarInputs] = useState<Record<string, string>>({});

  const handleVarChange = (name: string, value: string) => {
    setVarInputs(prev => ({ ...prev, [name]: value }));
  };

  const { completion, complete, isLoading, stop } = useCompletion({
    api: '/api/test-version/ai/execute',
  });

  const handleRun = async () => {
    if (!promptText.trim()) return;
    
    await complete('', {
      body: {
        promptText,
        variables: varInputs,
        model,
      }
    });
  };

  const handleCopy = async () => {
    if (!completion) return;
    await navigator.clipboard.writeText(completion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FiPlay className="text-purple-400" />
          Test Prompt
        </h3>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-950 px-3 py-1.5 rounded-lg border border-gray-800">
            <FiSettings className="text-gray-400 text-sm" />
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-transparent text-sm text-gray-300 outline-none cursor-pointer"
            >
              <option value="llama3-8b-8192">LLaMA 3 8B</option>
              <option value="llama-3.3-70b-versatile">LLaMA 3.3 70B</option>
              <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
              <option value="gemma2-9b-it">Gemma 2 9B</option>
            </select>
          </div>
          
          <button
            onClick={isLoading ? stop : handleRun}
            disabled={!promptText.trim()}
            className={`flex items-center gap-2 px-6 py-2 text-white text-sm font-medium rounded-lg transition ${
              isLoading 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                : 'bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Stop' : 'Run'}
          </button>
        </div>
      </div>

      {variables.length > 0 && (
        <div className="mb-6 p-4 bg-gray-950 rounded-lg border border-gray-800/50">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Detected Variables</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {variables.map(v => (
              <div key={v}>
                <label className="block text-xs text-gray-500 mb-1">{v}</label>
                <input
                  type="text"
                  value={varInputs[v] || ''}
                  onChange={(e) => handleVarChange(v, e.target.value)}
                  placeholder={`Value for ${v}`}
                  className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:border-purple-500 outline-none transition"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {(completion || isLoading) && (
        <div className="bg-gray-950 rounded-lg border border-gray-800 overflow-hidden relative">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Output
            </span>
            {completion && !isLoading && (
              <button 
                onClick={handleCopy}
                className="text-gray-400 hover:text-white transition flex items-center gap-1.5 text-xs"
              >
                {copied ? <FiCheck className="text-green-400" /> : <FiCopy />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
          <div className="p-4 min-h-[150px] max-h-[400px] overflow-y-auto">
             <div className="prose prose-invert max-w-none text-sm whitespace-pre-wrap text-gray-300 font-sans leading-relaxed">
               {completion}
               {isLoading && (
                 <span className="inline-block w-1.5 h-4 ml-1 bg-purple-500 animate-pulse align-middle" />
               )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
