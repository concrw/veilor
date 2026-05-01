// src/components/chat/AnalysisReport.tsx
import React from 'react';
import { BarChart3, Brain, Target } from 'lucide-react';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    headerTitle: 'T모드 분석 결과',
    emotionDist: '감정 분포',
    coreConflict: '핵심 갈등',
    behaviorPattern: '행동 패턴',
    suggestedSolutions: '제안 해결책',
    disclaimer: '이 분석은 AI 기반 추정이며, 전문가 상담을 통해 더 정확한 분석을 받을 수 있습니다.',
  },
  en: {
    headerTitle: 'T-mode Analysis Result',
    emotionDist: 'Emotion Distribution',
    coreConflict: 'Core Conflict',
    behaviorPattern: 'Behavioral Pattern',
    suggestedSolutions: 'Suggested Solutions',
    disclaimer: 'This analysis is AI-based estimation. A professional consultation can provide more accurate insights.',
  },
};

interface AnalysisResult {
  emotion: { [key: string]: number };
  conflict: string;
  pattern: string;
  solutions: string[];
}

interface AnalysisReportProps {
  result: AnalysisResult;
}

const AnalysisReport: React.FC<AnalysisReportProps> = ({ result }) => {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  return (
    <div className="w-full border border-white border-opacity-10 p-6 backdrop-blur-sm space-y-6">

      {/* 헤더 */}
      <div className="flex items-center space-x-2 mb-4">
        <Brain size={16} className="text-blue-400" />
        <h3 className="text-sm font-light text-white opacity-90">{s.headerTitle}</h3>
      </div>

      {/* 감정 분석 */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <BarChart3 size={14} className="text-blue-300" />
          <h4 className="text-xs font-medium text-gray-300">{s.emotionDist}</h4>
        </div>
        <div className="space-y-2">
          {Object.entries(result.emotion).map(([emotion, percentage]) => (
            <div key={emotion} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">{emotion}</span>
                <span className="text-xs text-gray-400">{percentage}%</span>
              </div>
              <div className="w-full bg-white bg-opacity-10 rounded-full h-1">
                <div
                  className="bg-blue-400 h-1 rounded-full transition-all duration-1000"
                  style={{width: `${percentage}%`}}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 갈등 분석 */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-300">{s.coreConflict}</h4>
        <div className="bg-white bg-opacity-5 p-3 backdrop-blur-sm">
          <p className="text-xs text-gray-400 font-light">{result.conflict}</p>
        </div>
      </div>

      {/* 패턴 분석 */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-300">{s.behaviorPattern}</h4>
        <div className="bg-white bg-opacity-5 p-3 backdrop-blur-sm">
          <p className="text-xs text-gray-400 font-light">{result.pattern}</p>
        </div>
      </div>

      {/* 해결책 */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Target size={14} className="text-green-400" />
          <h4 className="text-xs font-medium text-gray-300">{s.suggestedSolutions}</h4>
        </div>
        <div className="space-y-2">
          {result.solutions.map((solution, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-xs text-green-400 mt-0.5">{index + 1}.</span>
              <p className="text-xs text-gray-400 font-light leading-relaxed">{solution}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 안내 */}
      <div className="pt-4 border-t border-white border-opacity-5">
        <p className="text-xs text-gray-500 text-center opacity-70">
          {s.disclaimer}
        </p>
      </div>
    </div>
  );
};

export default AnalysisReport;
