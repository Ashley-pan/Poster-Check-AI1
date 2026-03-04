import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scan, 
  LayoutDashboard, 
  Lightbulb, 
  History, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Eye,
  EyeOff,
  Wand2,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { ImageUpload } from './components/ImageUpload';
import { HeatmapOverlay } from './components/HeatmapOverlay';
import { RedlineOverlay } from './components/RedlineOverlay';
import { getAI, ANALYSIS_SCHEMA } from './services/ai';
import { AnalysisResult, HistoryItem } from './types';

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showRedlines, setShowRedlines] = useState(true);
  const [optimizedImage, setOptimizedImage] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const handleUpload = async (base64: string) => {
    setImage(base64);
    setAnalysis(null);
    setOptimizedImage(null);
    analyzeImage(base64);
  };

  const analyzeImage = async (base64: string) => {
    setIsAnalyzing(true);
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            parts: [
              { text: "请基于功能性（对比度、层级、版权）、品牌契合度和视觉和谐度分析这张海报。提供评分、带有坐标的具体问题（x, y, width, height 为百分比）、热力图焦点以及可操作的建议。请使用中文回答。返回 JSON 格式。" },
              { inlineData: { mimeType: "image/png", data: base64.split(',')[1] } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: ANALYSIS_SCHEMA as any
        }
      });

      const result = JSON.parse(response.text || '{}') as AnalysisResult;
      setAnalysis(result);

      // Save to history
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: base64, analysis: result })
      });
      fetchHistory();
    } catch (err) {
      console.error('Analysis failed', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateOptimization = async () => {
    if (!analysis || !image) return;
    setIsOptimizing(true);
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: image.split(',')[1], mimeType: 'image/png' } },
              { text: `基于这张海报和以下优化建议，生成一个遵循这些规则的新版本：${analysis.optimizationPrompt}。请确保生成的海报视觉效果专业且符合建议。` }
          ]
        },
        config: {
          imageConfig: { aspectRatio: "3:4" }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setOptimizedImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err) {
      console.error('Optimization failed', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pass': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case '通过': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'Needs Improvement': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case '待改进': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'Fail': return <XCircle className="w-5 h-5 text-red-500" />;
      case '不通过': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Scan className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">海报评审 AI</h1>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">自动化评审系统</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors">控制台</a>
            <a href="#" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors">评审标准</a>
            <a href="#" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors">历史记录</a>
          </nav>
          <button className="bg-zinc-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-all shadow-sm">
            升级专业版
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Preview */}
        <div className="lg:col-span-7 space-y-6">
          {!image ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <ImageUpload onUpload={handleUpload} />
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => { setImage(null); setAnalysis(null); setOptimizedImage(null); }}
                  className="text-sm font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" /> 更换图片
                </button>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`p-2 rounded-lg transition-all ${showHeatmap ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-zinc-500 border border-zinc-200'}`}
                    title="热力图模式"
                  >
                    {showHeatmap ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => setShowRedlines(!showRedlines)}
                    className={`p-2 rounded-lg transition-all ${showRedlines ? 'bg-red-100 text-red-600' : 'bg-white text-zinc-500 border border-zinc-200'}`}
                    title="红线检查"
                  >
                    <Scan className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-200 aspect-[3/4] flex items-center justify-center">
                <img src={image} alt="海报" className="max-h-full w-auto object-contain" />
                {analysis && (
                  <>
                    <HeatmapOverlay points={analysis.heatmapPoints} visible={showHeatmap} />
                    <RedlineOverlay issues={analysis.metrics.functionality.issues || []} visible={showRedlines} />
                  </>
                )}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    <p className="text-indigo-900 font-semibold animate-pulse">AI 正在扫描海报...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Optimized Reference */}
          {optimizedImage && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="bg-indigo-900 rounded-2xl p-6 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-indigo-300" />
                  <h3 className="font-bold">AI 优化参考图</h3>
                </div>
                <span className="text-xs bg-indigo-800 px-2 py-1 rounded uppercase tracking-widest font-bold">概念设计</span>
              </div>
              <div className="aspect-[3/4] bg-indigo-950 rounded-xl overflow-hidden border border-indigo-700">
                <img src={optimizedImage} alt="优化图" className="w-full h-full object-cover" />
              </div>
              <p className="mt-4 text-sm text-indigo-200 italic">“此参考图展示了基于 AI 分析改进后的对比度和视觉层级。”</p>
            </motion.div>
          )}
        </div>

        {/* Right Column: Analysis & Metrics */}
        <div className="lg:col-span-5 space-y-6">
          <AnimatePresence mode="wait">
            {analysis ? (
              <motion.div 
                key="analysis"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Score Dashboard */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                      评分面板
                    </h2>
                    <div className="flex items-center gap-2 px-3 py-1 bg-zinc-50 rounded-full border border-zinc-100">
                      {getStatusIcon(analysis.status)}
                      <span className="text-sm font-bold">{analysis.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { label: '功能性', score: analysis.metrics.functionality.score, detail: analysis.metrics.functionality.details },
                      { label: '品牌契合度', score: analysis.metrics.alignment.score, detail: analysis.metrics.alignment.details },
                      { label: '视觉和谐度', score: analysis.metrics.harmony.score, detail: analysis.metrics.harmony.details },
                    ].map((m, i) => (
                      <div key={i} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-zinc-600">{m.label}</span>
                          <span className={`text-lg font-bold ${getScoreColor(m.score)}`}>{m.score}%</span>
                        </div>
                        <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${m.score}%` }}
                            className={`h-full rounded-full ${m.score >= 80 ? 'bg-emerald-500' : m.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                          />
                        </div>
                        <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{m.detail}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-zinc-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-400 uppercase font-bold tracking-widest">综合评分</p>
                      <p className={`text-4xl font-black ${getScoreColor(analysis.overallScore)}`}>{analysis.overallScore}</p>
                    </div>
                    <button 
                      onClick={generateOptimization}
                      disabled={isOptimizing}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                    >
                      {isOptimizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                      一键优化
                    </button>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200">
                  <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    修改建议
                  </h2>
                  <div className="space-y-4">
                    {analysis.suggestions.map((s, i) => (
                      <div key={i} className="group relative pl-6 border-l-2 border-zinc-100 hover:border-indigo-500 transition-colors">
                        <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-zinc-200 group-hover:bg-indigo-500 transition-colors" />
                        <h4 className="font-bold text-sm text-zinc-900">{s.title}</h4>
                        <p className="text-sm text-zinc-500 mt-1">{s.description}</p>
                        <div className="mt-2 text-xs font-mono bg-indigo-50 text-indigo-700 p-2 rounded border border-indigo-100">
                          <span className="font-bold uppercase mr-2">执行指令:</span> {s.actionable}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-12 shadow-sm border border-zinc-200 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
                  <Scan className="w-8 h-8 text-zinc-300" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">暂无分析数据</h3>
                  <p className="text-zinc-500 text-sm mt-1">上传一张海报以开始 AI 诊断流程。</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
              <History className="w-5 h-5 text-zinc-400" />
              最近历史
            </h2>
            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-zinc-400 italic">暂无历史记录。</p>
              ) : (
                history.slice(0, 5).map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      setImage(item.image_url);
                      setAnalysis(item.analysis);
                      setOptimizedImage(null);
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 transition-colors text-left group"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-100 flex-shrink-0">
                      <img src={item.image_url} alt="历史记录" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold truncate">扫描 #{item.id}</p>
                        <span className={`text-xs font-bold ${getScoreColor(item.analysis.overallScore)}`}>{item.analysis.overallScore}%</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-indigo-600 transition-colors" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-zinc-200 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Scan className="w-5 h-5" />
            <span className="text-sm font-bold">海报评审 AI</span>
          </div>
          <p className="text-sm text-zinc-400">© 2024 海报评审 AI. 专业设计评审工具。</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest">隐私政策</a>
            <a href="#" className="text-xs font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest">服务条款</a>
            <a href="#" className="text-xs font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest">联系我们</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
