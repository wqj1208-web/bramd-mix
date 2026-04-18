/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  TrendingUp, 
  Map, 
  Search, 
  Users, 
  Target, 
  Cpu, 
  Zap, 
  ArrowRight, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  Terminal,
  ShieldAlert,
  Repeat,
  Image as ImageIcon,
  Radio,
  Share2,
  FileSearch,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI, Type } from "@google/genai";

// --- Gemini Config ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// --- Types ---
interface AnalysisResult {
  stage1: {
    userNeeds: {
      painPoints: { text: string; intensity: string }[];
      pseudoDemand: string[];
    };
    competitorAnalysis: {
      brand: string;
      visualConsistency: string;
      cognitiveGap: string;
    }[];
    emotionalHotspots: {
      topic: string;
      resonance: string;
      adaptability: string;
    }[];
  };
  stage2: {
    concepts: { title: string; details: string }[];
    visualIconDesc: string;
    collabProposal: {
      form: string;
      event: string;
      roiModel: string;
    };
  };
  stage3: {
    abTesting: {
      rational: { content: string; strategy: string };
      emotional: { content: string; strategy: string };
    };
    mediaMix: {
      days: string;
      tactic: string;
      hook: string;
    }[];
  };
  stage4: {
    compliance: {
      adLaw: string[];
      cultural: string[];
    };
  };
}

type Step = "INPUT" | "ANALYZING" | "RESULT";

// --- Components ---

const GlowButton = ({ children, onClick, disabled, className = "" }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      relative group px-10 py-4 bg-primary text-bg font-black uppercase tracking-widest rounded-full 
      overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100
      ${className}
    `}
  >
    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
    <span className="relative z-10 flex items-center justify-center gap-2">
      {children}
    </span>
    <div className="absolute inset-0 shadow-[0_0_20px_rgba(6,182,212,0.5)] group-hover:shadow-[0_0_40px_rgba(6,182,212,0.8)] transition-all" />
  </button>
);

const PhaseHeader = ({ number, title, icon, colorClass = "text-primary" }: any) => (
  <div className="flex items-center gap-4 mb-8">
    <div className={`text-4xl font-black opacity-20 font-mono ${colorClass}`}>{number}</div>
    <div className={`p-3 rounded-xl bg-surface border border-border-theme ${colorClass} shadow-lg`}>
      {icon}
    </div>
    <h2 className="text-2xl font-black text-text-bold tracking-tighter uppercase font-mono">
      {title}
    </h2>
  </div>
);

const ModuleCard = ({ title, className = "", children }: any) => (
  <div className={`bg-surface/30 backdrop-blur-md border border-border-theme rounded-2xl p-6 relative group border-t-2 border-t-primary/20 ${className}`}>
    <h3 className="text-[10px] uppercase font-black text-primary/60 mb-4 tracking-[0.2em] flex items-center gap-2">
      <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
      {title}
    </h3>
    <div className="space-y-3 text-sm leading-relaxed text-text-base">
      {children}
    </div>
  </div>
);

export default function App() {
  const [step, setStep] = useState<Step>("INPUT");
  const [industry, setIndustry] = useState("");
  const [product, setProduct] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState("");

  const phases = [
    "解析目标人群需求图谱...",
    "扫描竞品全渠道视觉符号...",
    "计算社交平台情绪震荡指数...",
    "构建私域与公域分发矩阵...",
    "正在执行风险合规合规性审计..."
  ];

  useEffect(() => {
    if (step === "ANALYZING") {
      let i = 0;
      const interval = setInterval(() => {
        setLoadingPhase(phases[i % phases.length]);
        i++;
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleStartAnalysis = async () => {
    if (!industry || !product) return;
    setStep("ANALYZING");
    setError(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `针对行业「${industry}」中的产品「${product}」，生成全链路营销战略。

请严格遵循以下板块输出 JSON：

【阶段一：市场洞察】
1. 用户需求：高频痛点(含情绪强度)与伪需求过滤。
2. 竞品分析：拆解头部竞品的年度Campaign视觉符号复用率与认知偏差点。
3. 情绪热点：近30天内按社会共鸣值与商业适配度排序的热词。

【阶段二：核心创意孵化】
1. 概念生产：三组基于主题的超级符号设计。
2. 视觉符号：产品传播型 icon 创意。
3. 破圈联名：跨界方案(含产品形态、事件、ROI测算逻辑)。

【阶段三：传播 Roadmap】
1. AB测试策略：理性说服版 vs 感性渗透版，含投流策略。
2. 媒介组合：D1-D10的新品上市节奏。

【阶段四：执行风险控制】
1. 合规性排查：广告法禁忌词与文化禁忌点。`,
        config: {
          systemInstruction: "你是一个顶尖的品牌战略专家。请输出高度专业、具有极强实操性的 JSON 数据。数值需带有科学感（如 87%），建议需具体（如具体的热词或视觉建议）。",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              stage1: {
                type: Type.OBJECT,
                properties: {
                  userNeeds: {
                    type: Type.OBJECT,
                    properties: {
                      painPoints: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, intensity: { type: Type.STRING } } } },
                      pseudoDemand: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                  },
                  competitorAnalysis: {
                    type: Type.ARRAY,
                    items: { type: Type.OBJECT, properties: { brand: { type: Type.STRING }, visualConsistency: { type: Type.STRING }, cognitiveGap: { type: Type.STRING } } }
                  },
                  emotionalHotspots: {
                    type: Type.ARRAY,
                    items: { type: Type.OBJECT, properties: { topic: { type: Type.STRING }, resonance: { type: Type.STRING }, adaptability: { type: Type.STRING } } }
                  }
                }
              },
              stage2: {
                type: Type.OBJECT,
                properties: {
                  concepts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, details: { type: Type.STRING } } } },
                  visualIconDesc: { type: Type.STRING },
                  collabProposal: {
                    type: Type.OBJECT,
                    properties: { form: { type: Type.STRING }, event: { type: Type.STRING }, roiModel: { type: Type.STRING } }
                  }
                }
              },
              stage3: {
                type: Type.OBJECT,
                properties: {
                  abTesting: {
                    type: Type.OBJECT,
                    properties: {
                      rational: { type: Type.OBJECT, properties: { content: { type: Type.STRING }, strategy: { type: Type.STRING } } },
                      emotional: { type: Type.OBJECT, properties: { content: { type: Type.STRING }, strategy: { type: Type.STRING } } }
                    }
                  },
                  mediaMix: {
                    type: Type.ARRAY,
                    items: { type: Type.OBJECT, properties: { days: { type: Type.STRING }, tactic: { type: Type.STRING }, hook: { type: Type.STRING } } }
                  }
                }
              },
              stage4: {
                type: Type.OBJECT,
                properties: {
                  compliance: {
                    type: Type.OBJECT,
                    properties: { adLaw: { type: Type.ARRAY, items: { type: Type.STRING } }, cultural: { type: Type.ARRAY, items: { type: Type.STRING } } }
                  }
                }
              }
            },
            required: ["stage1", "stage2", "stage3", "stage4"]
          }
        }
      });

      const data = JSON.parse(response.text);
      setResult(data);
      setStep("RESULT");
    } catch (err) {
      console.error(err);
      setError("核心矩阵运算失败，请核对输入参数。");
      setStep("INPUT");
    }
  };

  return (
    <div className="relative min-h-screen selection:bg-primary/30 selection:text-primary-glow font-sans bg-bg overflow-x-hidden">
      {/* HUD GFX */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent z-50 overflow-hidden">
        <motion.div 
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-1/3 h-full bg-primary"
        />
      </div>

      {/* Grid Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:30px_30px]" />

      <main className="container mx-auto px-6 py-12 relative z-10 max-w-7xl">
        <AnimatePresence mode="wait">
          {step === "INPUT" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="min-h-[80vh] flex flex-col items-center justify-center"
            >
              <div className="text-center mb-16">
                <div className="inline-block relative mb-6">
                   <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                   <Cpu className="w-16 h-16 text-primary relative z-10" />
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-text-bold tracking-tighter mb-4 italic">
                  NEBULA <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">V3</span>
                </h1>
                <p className="text-sm font-mono tracking-[0.5em] text-text-dim uppercase">
                  Hybrid Strategy Matrix Deployment
                </p>
              </div>

              <div className="w-full max-w-xl space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                   <div className="bg-surface/50 border border-border-theme p-4 rounded-2xl focus-within:border-primary transition-colors">
                      <label className="block text-[10px] uppercase font-black text-primary/60 mb-1">Industry Sector</label>
                      <input 
                        type="text" 
                        value={industry}
                        onChange={e => setIndustry(e.target.value)}
                        placeholder="e.g. 咖啡新零售"
                        className="w-full bg-transparent border-none outline-none text-text-bold placeholder:text-text-dim/40 py-1"
                      />
                   </div>
                   <div className="bg-surface/50 border border-border-theme p-4 rounded-2xl focus-within:border-accent transition-colors">
                      <label className="block text-[10px] uppercase font-black text-accent/60 mb-1">Target Product</label>
                      <input 
                        type="text" 
                        value={product}
                        onChange={e => setProduct(e.target.value)}
                        placeholder="e.g. 0糖冷萃咖啡"
                        className="w-full bg-transparent border-none outline-none text-text-bold placeholder:text-text-dim/40 py-1"
                      />
                   </div>
                </div>
                <div className="flex justify-center pt-8">
                   <GlowButton onClick={handleStartAnalysis} disabled={!industry || !product}>
                     Generate Strategy <ArrowRight className="ml-2 w-5 h-5" />
                   </GlowButton>
                </div>
                {error && <p className="text-center text-red-500 font-mono text-xs mt-4 animate-bounce">{error}</p>}
              </div>
            </motion.div>
          )}

          {step === "ANALYZING" && (
            <motion.div
              key="analyzing"
              className="min-h-[80vh] flex flex-col items-center justify-center text-center"
            >
              <div className="w-48 h-48 rounded-full border border-primary/20 flex items-center justify-center relative mb-12">
                 <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin" />
                 <div className="absolute inset-4 border-b-2 border-accent rounded-full animate-spin-reverse" />
                 <Zap className="w-12 h-12 text-primary animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-text-bold font-mono tracking-widest uppercase mb-2">Matrix Analyzing</h2>
              <p className="text-primary font-mono text-xs animate-pulse opacity-80 h-4">
                {loadingPhase}
              </p>
            </motion.div>
          )}

          {step === "RESULT" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-24 pb-32"
            >
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-12 sticky top-0 bg-bg/80 backdrop-blur-md z-40">
                <div className="group cursor-pointer" onClick={() => setStep("INPUT")}>
                  <div className="flex items-center gap-2 text-primary text-[10px] font-black tracking-widest uppercase mb-2">
                    <Terminal className="w-3 h-3" /> Report ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-text-bold tracking-tight">
                    STRATEGY <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">OUTPUT</span>
                  </h1>
                </div>
                <div className="flex gap-4">
                   <button 
                    onClick={() => window.print()}
                    className="p-3 bg-surface border border-border-theme rounded-xl text-text-dim hover:text-primary transition-all hover:scale-110 active:scale-95"
                   >
                     <Share2 className="w-5 h-5" />
                   </button>
                   <button 
                    onClick={() => setStep("INPUT")}
                    className="px-6 py-3 bg-primary text-bg font-black rounded-xl text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-95"
                   >
                     Reset Engine
                   </button>
                </div>
              </header>

              {/* Stage 1: Market Insight */}
              <section>
                 <PhaseHeader number="01" title="阶段一：市场洞察" icon={<TrendingUp className="w-6 h-6" />} colorClass="text-primary" />
                 <div className="grid md:grid-cols-3 gap-6">
                    <ModuleCard title="用户需求洞察">
                       <div className="space-y-4">
                          <div>
                             <h4 className="text-[10px] font-bold text-primary mb-2">高频痛点 (Emotion Intensity)</h4>
                             <div className="space-y-3">
                                {result.stage1.userNeeds.painPoints.map((p, idx) => (
                                  <div key={idx}>
                                     <div className="flex justify-between text-xs mb-1">
                                        <span className="text-text-bold">{p.text}</span>
                                        <span className="text-primary font-mono">{p.intensity}</span>
                                     </div>
                                     <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: p.intensity }} className="h-full bg-primary" />
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                          <div>
                             <h4 className="text-[10px] font-bold text-red-500/80 mb-2">伪需求过滤清单</h4>
                             <div className="flex flex-wrap gap-2">
                                {result.stage1.userNeeds.pseudoDemand.map((p, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-red-500/5 text-red-400 border border-red-500/20 text-[10px] rounded italic">
                                     DELETE: {p}
                                  </span>
                                ))}
                             </div>
                          </div>
                       </div>
                    </ModuleCard>

                    <ModuleCard title="竞品策略拆解">
                       <div className="space-y-4">
                          {result.stage1.competitorAnalysis.map((c, idx) => (
                            <div key={idx} className="px-3 py-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                               <div className="text-xs font-black text-text-bold">{c.brand}</div>
                               <div className="text-[10px] text-text-base leading-relaxed">
                                  <span className="text-primary opacity-60">Visual:</span> {c.visualConsistency}<br/>
                                  <span className="text-accent opacity-60">Gap:</span> {c.cognitiveGap}
                               </div>
                            </div>
                          ))}
                       </div>
                    </ModuleCard>

                    <ModuleCard title="情绪热点捕捉">
                       <div className="overflow-hidden rounded-xl border border-white/5">
                          <table className="w-full text-left text-[11px]">
                             <thead className="bg-white/5 uppercase text-[9px] font-black text-text-dim">
                                <tr>
                                   <th className="px-3 py-2">Topic</th>
                                   <th className="px-3 py-2">Resonance</th>
                                   <th className="px-3 py-2">Adapt</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-white/5">
                                {result.stage1.emotionalHotspots.map((h, idx) => (
                                   <tr key={idx}>
                                      <td className="px-3 py-2 text-text-bold">#{h.topic}</td>
                                      <td className="px-3 py-2 font-mono text-primary">{h.resonance}</td>
                                      <td className="px-3 py-2 font-mono text-accent">{h.adaptability}</td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </ModuleCard>
                 </div>
              </section>

              {/* Stage 2: Creative */}
              <section>
                 <PhaseHeader number="02" title="阶段二：核心创意孵化" icon={<Sparkles className="w-6 h-6" />} colorClass="text-accent" />
                 <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ModuleCard title="概念/超级符号生产" className="lg:col-span-2">
                        <div className="grid md:grid-cols-3 gap-4">
                           {result.stage2.concepts.map((c, idx) => (
                             <div key={idx} className="p-4 rounded-2xl bg-gradient-to-br from-accent/5 to-transparent border border-accent/10">
                                <h4 className="font-bold text-accent text-sm mb-2">{c.title}</h4>
                                <p className="text-xs text-text-base leading-tight italic opacity-80">{c.details}</p>
                             </div>
                           ))}
                        </div>
                    </ModuleCard>
                    <ModuleCard title="视觉符号 Icon">
                       <div className="flex flex-col items-center justify-center min-h-[120px] text-center italic">
                          <ImageIcon className="w-12 h-12 text-accent mb-4 opacity-30" />
                          <p className="text-xs text-text-bold">"{result.stage2.visualIconDesc}"</p>
                       </div>
                    </ModuleCard>
                    <ModuleCard title="破圈联名提案">
                       <div className="space-y-3">
                          <div>
                             <h4 className="text-[10px] font-bold text-accent mb-1 uppercase tracking-wider">Form/Event</h4>
                             <p className="text-xs text-text-bold leading-tight">{result.stage2.collabProposal.form}<br/>{result.stage2.collabProposal.event}</p>
                          </div>
                          <div className="pt-2 border-t border-white/5">
                             <div className="text-[9px] uppercase font-black text-text-dim mb-1">ROI测算模型</div>
                             <p className="text-[10px] font-mono text-primary leading-tight">{result.stage2.collabProposal.roiModel}</p>
                          </div>
                       </div>
                    </ModuleCard>
                 </div>
              </section>

              {/* Stage 3: Roadmap */}
              <section>
                 <PhaseHeader number="03" title="阶段三：传播 Roadmap" icon={<Map className="w-6 h-6" />} colorClass="text-primary-glow" />
                 <div className="grid md:grid-cols-3 gap-6">
                    <ModuleCard title="AB 测试方案" className="md:col-span-1">
                       <div className="space-y-6">
                          <div className="relative pl-6 before:absolute before:left-0 before:top-0 before:w-1 before:h-full before:bg-primary">
                             <h4 className="text-[10px] font-black text-primary uppercase mb-2">A: 理性说服</h4>
                             <p className="text-xs text-text-base mb-2 italic">"{result.stage3.abTesting.rational.content}"</p>
                             <div className="text-[9px] text-text-dim">{result.stage3.abTesting.rational.strategy}</div>
                          </div>
                          <div className="relative pl-6 before:absolute before:left-0 before:top-0 before:w-1 before:h-full before:bg-accent">
                             <h4 className="text-[10px] font-black text-accent uppercase mb-2">B: 感性渗透</h4>
                             <p className="text-xs text-text-base mb-2 italic">"{result.stage3.abTesting.emotional.content}"</p>
                             <div className="text-[9px] text-text-dim">{result.stage3.abTesting.emotional.strategy}</div>
                          </div>
                       </div>
                    </ModuleCard>
                    <ModuleCard title="媒介组合公式" className="md:col-span-2">
                       <div className="relative overflow-hidden p-6 rounded-2xl bg-[#001219] border border-primary/20">
                          <div className="grid grid-cols-3 gap-4 relative z-10">
                             {result.stage3.mediaMix.map((m, idx) => (
                               <div key={idx} className="space-y-2 group/step">
                                  <div className="text-primary font-black text-[10px] uppercase tracking-widest">{m.days}</div>
                                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                     <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5 + (idx * 0.2) }} className="h-full bg-primary origin-left" />
                                  </div>
                                  <p className="text-xs text-text-bold leading-tight group-hover/step:text-primary transition-colors">{m.tactic}</p>
                                  <div className="text-[9px] py-1 px-2 rounded bg-primary/10 text-primary-glow font-mono border border-primary/20">
                                     HOOK: {m.hook}
                                  </div>
                                </div>
                             ))}
                          </div>
                          <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                             <div className="flex items-center gap-2 text-[10px] text-primary/60">
                                <FileSearch className="w-3 h-3" /> 点击导出达人一键选号表 (Talent List)
                             </div>
                             <div className="text-[10px] font-mono text-text-dim">EXPORT_READY: [SYSTEM_OK]</div>
                          </div>
                          {/* HUD Decor */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                       </div>
                    </ModuleCard>
                 </div>
              </section>

              {/* Stage 4: Risk Control */}
              <section>
                 <PhaseHeader number="04" title="阶段四：执行风险控制" icon={<ShieldAlert className="w-6 h-6" />} colorClass="text-red-500" />
                 <div className="grid md:grid-cols-2 gap-8">
                    <ModuleCard title="广告法及合规排查" className="border-t-destructive/50">
                       <div className="space-y-4">
                          <div className="flex items-start gap-4">
                             <AlertTriangle className="w-10 h-10 text-red-500 opacity-20 shrink-0" />
                             <div className="space-y-4">
                                <div>
                                   <h4 className="text-[10px] font-black text-red-500 uppercase mb-2 tracking-widest">Sensitive keywords</h4>
                                   <div className="flex flex-wrap gap-2">
                                      {result.stage4.compliance.adLaw.map((word, idx) => (
                                         <span key={idx} className="bg-red-500/10 text-red-400 px-3 py-1 rounded text-xs font-mono border border-red-500/20">{word}</span>
                                      ))}
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </ModuleCard>
                    <ModuleCard title="文化及舆情风险" className="border-t-red-500/50">
                       <ul className="space-y-4">
                          {result.stage4.compliance.cultural.map((item, idx) => (
                             <li key={idx} className="flex gap-3 text-xs leading-relaxed group/risk">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500/40 group-hover/risk:bg-red-500 transition-colors" />
                                <span className="text-text-base">{item}</span>
                             </li>
                          ))}
                       </ul>
                    </ModuleCard>
                 </div>
              </section>

              <footer className="text-center opacity-30 hover:opacity-100 transition-opacity">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-surface text-[10px] font-mono tracking-widest uppercase">
                    <CheckCircle2 className="w-3 h-3 text-primary" /> Matrix Encryption Protocol Established
                 </div>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FX Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        
        .animate-spin-reverse {
          animation: spin-reverse 8s linear infinite;
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @media print {
          body { background: white !important; color: black !important; }
          .bg-surface, .bg-bg { background: transparent !important; }
          .container { max-width: 100% !important; padding: 0 !important; }
          header { position: static !important; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
}
