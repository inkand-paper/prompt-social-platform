'use client';

import { useState } from 'react';
import { FiActivity, FiZap, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { PromptScoreResult } from '@/core/interfaces/IAIService';

interface PromptScoreFeedbackProps {
  promptText: string;
}

export function PromptScoreFeedback({ promptText }: PromptScoreFeedbackProps) {
  const [loading, setLoading] = useState(false);
  const [scoreData, setScoreData] = useState<PromptScoreResult | null>(null);
  const [error, setError] = useState('');

  const getScore = async () => {
    if (!promptText.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/test-version/ai/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText }),
      });
      
      const data = await res.json();
      if (data.success) {
        setScoreData({
          score: data.score,
          feedback: data.feedback,
          suggestions: data.suggestions,
        });
      } else {
        setError(data.error || 'Failed to score prompt');
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FiActivity className="text-purple-400" />
          AI Prompt Optimizer
        </h3>
        <button
          onClick={getScore}
          disabled={loading || !promptText.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <FiZap />
          )}
          {loading ? 'Analyzing...' : 'Get Feedback'}
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {scoreData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-6 pb-6 border-b border-gray-800">
            <div className="flex-shrink-0 text-center">
              <div className={`text-5xl font-bold ${getScoreColor(scoreData.score)}`}>
                {scoreData.score}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                Score
              </div>
            </div>
            <p className="text-gray-300 italic flex-1">
              &quot;{scoreData.feedback.overall}&quot;
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-950 p-4 rounded-lg border border-gray-800/50">
              <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Clarity</h4>
              <p className="text-sm text-gray-300">{scoreData.feedback.clarity}</p>
            </div>
            <div className="bg-gray-950 p-4 rounded-lg border border-gray-800/50">
              <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Specificity</h4>
              <p className="text-sm text-gray-300">{scoreData.feedback.specificity}</p>
            </div>
            <div className="bg-gray-950 p-4 rounded-lg border border-gray-800/50">
              <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Creativity</h4>
              <p className="text-sm text-gray-300">{scoreData.feedback.creativity}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <FiCheckCircle className="text-green-400" /> Actionable Suggestions
            </h4>
            <ul className="space-y-2">
              {scoreData.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <FiInfo className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
