'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Model {
  id: string;
  name: string;
  fullName: string;
  icon: string;
  color: string;
  description: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelId?: string;
  modelName?: string;
  isReview?: boolean;
  reviewingModel?: string;
}

const AVAILABLE_MODELS: Model[] = [
  {
    id: 'claude',
    name: 'Anthropic',
    fullName: 'The Sage of Anthropic',
    icon: '📖',
    color: '#D4AF37',
    description: 'Ancient wisdom wrapped in thoughtful analysis and careful reasoning'
  },
  {
    id: 'gpt4',
    name: 'OpenAI',
    fullName: 'The Oracle of OpenAI',
    icon: '🔮',
    color: '#10A37F',
    description: 'Versatile knowledge flowing from the emerald tower of creation'
  },
  {
    id: 'gemini',
    name: 'Google',
    fullName: 'The Dual Mind of Gemini',
    icon: '⚗️',
    color: '#4285F4',
    description: 'Twin perspectives merging from the sapphire depths of knowledge'
  }
];

const generateResponse = async (modelId: string, question: string): Promise<string> => {
  if (modelId === 'gpt4') {
    try {
      const res = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'answer', modelId, question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');
      return data.content || '';
    } catch (e: any) {
      return `OpenAI error: ${e?.message || 'unknown error'}`;
    }
  }

  const responses: Record<string, string> = {
    claude: `*The ancient tome glows with warm amber light as wisdom flows forth*\n\nRegarding your inquiry: "${question.slice(0, 60)}${question.length > 60 ? '...' : ''}"\n\nI approach this matter with careful deliberation. The essence of your question touches upon fundamental principles that deserve thorough examination. Through my analysis, I find several key considerations worthy of reflection.\n\nFirst, we must acknowledge the complexity inherent in such matters. Second, the interplay of various factors creates a rich tapestry of possibilities. The path to understanding requires patience and an open mind to multiple perspectives.`,
    gpt4: `*Emerald light flickers within the crystal orb as knowledge awakens*\n\nYour question about "${question.slice(0, 60)}${question.length > 60 ? '...' : ''}" draws upon diverse realms of knowledge.\n\nAllow me to illuminate this matter from multiple angles. The subject at hand presents fascinating dimensions worth exploring. From a practical standpoint, we can identify core principles that may guide our understanding.\n\nThe synthesis of these elements reveals patterns and insights that speak to both the immediate concern and broader implications for how we approach such inquiries.`,
    gemini: `*Twin azure flames dance in perfect harmony as dual consciousness awakens*\n\nContemplating: "${question.slice(0, 60)}${question.length > 60 ? '...' : ''}"\n\nFrom my dual perspective, I perceive both the analytical framework and the creative possibilities inherent in your query. The synthesis of logical reasoning and intuitive understanding reveals complementary truths.\n\nOn one hand, the structured approach yields clarity. On the other, embracing ambiguity opens doors to innovation. Together, these perspectives weave a more complete understanding of the matter before us.`
  };

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(responses[modelId] || responses.claude);
    }, 2000 + Math.random() * 1500);
  });
};

const generateReview = async (reviewerId: string, originalModelId: string, originalAnswer: string): Promise<string> => {
  const model = AVAILABLE_MODELS.find(m => m.id === reviewerId);
  const originalModel = AVAILABLE_MODELS.find(m => m.id === originalModelId);

  if (!model || !originalModel) {
    return Promise.resolve('Review unavailable: invalid model selection.');
  }

  if (reviewerId === 'gpt4') {
    try {
      const res = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'review', modelId: reviewerId, reviewingModel: model.fullName, originalAnswer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');
      return data.content || '';
    } catch (e: any) {
      return `OpenAI review error: ${e?.message || 'unknown error'}`;
    }
  }

  const reviews = [
    `*${model.fullName} carefully examines the scroll left by ${originalModel.fullName}*\n\nUpon reflection of my esteemed colleague's insight, I find their perspective most illuminating. Their emphasis on foundational principles strengthens the discourse. I would build upon this by noting that the synthesis of our collective wisdom creates a more complete understanding. Where they shine light on structure, I might add considerations of adaptability.`,
    `*${model.fullName} strokes their ethereal beard while pondering ${originalModel.fullName}'s words*\n\nA thoughtfully constructed response indeed. The holistic approach complements analytical rigor in ways that enrich our shared understanding. I appreciate the nuanced treatment of complexity, though I might expand upon the practical implications. Together, our perspectives form a more robust framework for addressing such inquiries.`,
    `*${model.fullName} nods slowly, arcane symbols flickering around ${originalModel.fullName}'s testament*\n\nMy fellow oracle speaks with wisdom earned through countless consultations. Their methodology resonates with sound reasoning, and I find our conclusions harmoniously aligned. Building upon their foundation, I would suggest additional dimensions worth exploring—the interplay of theory and practice, and how these insights might manifest in varied contexts.`
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(reviews[Math.floor(Math.random() * reviews.length)]);
    }, 1500 + Math.random() * 1000);
  });
};

const DustParticles: React.FC = () => {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 15,
    duration: 15 + Math.random() * 15,
    size: 1 + Math.random() * 3
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-amber-300"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            opacity: 0.2,
            animation: `floatUp ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          5% { opacity: 0.2; }
          95% { opacity: 0.2; }
          100% {
            transform: translateY(-20px) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

const Candle: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const heights = { sm: 'h-10', md: 'h-14', lg: 'h-20' };
  const flames = { sm: 'h-4 w-2', md: 'h-6 w-3', lg: 'h-8 w-4' };

  return (
    <div className="relative flex flex-col items-center">
      <div className={`relative ${flames[size]}`}>
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-t from-orange-500 via-yellow-400 to-yellow-100 rounded-full opacity-90"
          style={{ animation: 'flicker 0.5s ease-in-out infinite alternate' }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-[150%] bg-amber-400 rounded-full blur-lg opacity-40"
          style={{ animation: 'glow 1s ease-in-out infinite alternate' }}
        />
      </div>
      <div className={`w-3 ${heights[size]} bg-gradient-to-b from-amber-50 via-amber-100 to-amber-200 rounded-b-sm`}>
        <div className="w-full h-1 bg-gradient-to-b from-amber-300 to-amber-400 rounded-t-sm" />
      </div>
      <div className="w-5 h-2 bg-amber-800 rounded-b" />
      <style>{`
        @keyframes flicker {
          0%, 100% { transform: translateX(-50%) scaleY(1) scaleX(1); }
          25% { transform: translateX(-50%) scaleY(1.1) scaleX(0.9); }
          50% { transform: translateX(-50%) scaleY(0.95) scaleX(1.05); }
          75% { transform: translateX(-50%) scaleY(1.05) scaleX(0.95); }
        }
        @keyframes glow {
          0% { opacity: 0.3; transform: translateX(-50%) scale(1); }
          100% { opacity: 0.5; transform: translateX(-50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

const TorchSconce: React.FC<{ side: 'left' | 'right' }> = ({ side }) => {
  return (
    <div className={`absolute top-20 ${side === 'left' ? 'left-4' : 'right-4'} hidden lg:block`}>
      <div className="relative">
        <div className="w-3 h-16 bg-gradient-to-b from-stone-600 to-stone-800 rounded" />
        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
          <div
            className="w-6 h-10 bg-gradient-to-t from-orange-600 via-orange-400 to-yellow-200 rounded-full blur-[2px]"
            style={{ animation: 'torchFlicker 0.3s ease-in-out infinite alternate' }}
          />
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-orange-500 rounded-full blur-xl opacity-30"
            style={{ animation: 'torchGlow 2s ease-in-out infinite alternate' }}
          />
        </div>
      </div>
      <style>{`
        @keyframes torchFlicker {
          0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.9; }
          50% { transform: scaleY(1.1) scaleX(0.95); opacity: 1; }
        }
        @keyframes torchGlow {
          0% { opacity: 0.2; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

const BookOnShelf: React.FC<{
  model: Model;
  isSelected: boolean;
  onClick: () => void;
}> = ({ model, isSelected, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (isHovered) {
      const timer = setTimeout(() => setShowTooltip(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowTooltip(false);
    }
  }, [isHovered]);

  const handleClick = () => {
    setIsPulling(true);
    setTimeout(() => {
      onClick();
      setIsPulling(false);
    }, 400);
  };

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div
        className="relative transition-all duration-300 ease-out"
        style={{
          transform: isPulling
            ? 'translateY(-20px) rotateX(20deg)'
            : isHovered
            ? 'translateY(-10px)'
            : 'translateY(0)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Book spine */}
        <div
          className={`relative w-16 h-48 rounded-sm shadow-xl transition-all duration-300 ${
            isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-stone-900' : ''
          }`}
          style={{
            background: `linear-gradient(135deg, ${model.color} 0%, ${model.color}cc 30%, ${model.color}88 50%, ${model.color}cc 70%, ${model.color} 100%)`,
            boxShadow: isHovered || isSelected
              ? `0 10px 30px ${model.color}66, 0 0 20px ${model.color}44, inset -3px 0 15px rgba(0,0,0,0.4)`
              : 'inset -3px 0 15px rgba(0,0,0,0.4), 0 5px 15px rgba(0,0,0,0.3)',
          }}
        >
          {/* Decorative gold bands */}
          <div className="absolute top-3 left-1 right-1 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 rounded-full" />
          <div className="absolute top-6 left-2 right-2 h-0.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
          <div className="absolute bottom-6 left-2 right-2 h-0.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
          <div className="absolute bottom-3 left-1 right-1 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 rounded-full" />

          {/* Central emblem */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="text-3xl"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                animation: isSelected ? 'pulse 2s ease-in-out infinite' : 'none'
              }}
            >
              {model.icon}
            </div>
          </div>

          {/* Title on spine */}
          <div
            className="absolute inset-x-0 bottom-10 flex items-center justify-center"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            <span className="text-xs font-serif text-amber-100 tracking-widest drop-shadow-lg">
              {model.name}
            </span>
          </div>

          {/* Magical glow when selected */}
          {isSelected && (
            <>
              <div
                className="absolute inset-0 rounded-sm"
                style={{
                  background: `radial-gradient(circle, ${model.color}66 0%, transparent 70%)`,
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              />
              <div className="absolute -inset-1 rounded bg-gradient-to-t from-amber-500 via-transparent to-transparent opacity-30" />
            </>
          )}

          {/* Wear effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent opacity-5 rounded-sm" />
        </div>

        {/* Book shadow on shelf */}
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-14 h-2 bg-black rounded-full blur-sm opacity-50"
          style={{ transform: `translateX(-50%) scaleX(${isHovered ? 1.2 : 1})` }}
        />
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 z-50 w-56 p-4 bg-stone-900 border-2 border-amber-700 rounded-lg shadow-2xl"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-amber-700" />
          </div>
          <h3 className="text-amber-300 font-serif font-bold mb-2">{model.fullName}</h3>
          <p className="text-amber-200 text-sm font-serif italic leading-relaxed">{model.description}</p>
          <p className="text-amber-500 text-xs mt-3 text-center">
            {isSelected ? '✧ Click to return to shelf ✧' : '✧ Click to summon ✧'}
          </p>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

const ReadingDesk: React.FC<{
  selectedModels: Model[];
  onRemove: (model: Model) => void;
}> = ({ selectedModels, onRemove }) => {
  return (
    <div className="relative mt-8">
      {/* Desk surface */}
      <div
        className="relative h-36 rounded-t-xl border-t-8 border-x-4 border-amber-800 shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #78350f 0%, #451a03 50%, #292524 100%)',
        }}
      >
        {/* Wood grain texture */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 40px,
              rgba(0,0,0,0.15) 40px,
              rgba(0,0,0,0.15) 42px
            )`,
          }}
        />

        {/* Desk decorative inlay */}
        <div className="absolute top-2 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent rounded" />

        {/* Candles on desk */}
        <div className="absolute left-6 top-2">
          <Candle size="sm" />
        </div>
        <div className="absolute right-6 top-2">
          <Candle size="sm" />
        </div>

        {/* Books on desk */}
        <div className="flex items-end justify-center h-full gap-6 pb-4 px-16">
          {selectedModels.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-amber-600 font-serif italic text-lg">
                ✧ Select ancient tomes from the shelf above ✧
              </p>
              <p className="text-amber-700 font-serif text-sm mt-2">
                Pull the books to summon their wisdom
              </p>
            </div>
          ) : (
            selectedModels.map((model, index) => (
              <div
                key={model.id}
                className="relative group cursor-pointer"
                style={{
                  animation: `slideUp 0.5s ease-out ${index * 100}ms backwards`,
                }}
                onClick={() => onRemove(model)}
              >
                {/* Open book */}
                <div
                  className="relative w-28 h-24 rounded shadow-xl transition-transform duration-300 group-hover:scale-105"
                  style={{
                    background: `linear-gradient(90deg,
                      ${model.color} 0%,
                      ${model.color}cc 3%,
                      #fef3c7 5%,
                      #fde68a 48%,
                      #1c1917 49%,
                      #1c1917 51%,
                      #fde68a 52%,
                      #fef3c7 95%,
                      ${model.color}cc 97%,
                      ${model.color} 100%
                    )`,
                    boxShadow: `0 5px 20px ${model.color}44, 0 2px 10px rgba(0,0,0,0.3)`,
                  }}
                >
                  {/* Page lines */}
                  <div className="absolute inset-4 flex flex-col justify-center gap-1 opacity-30">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-0.5 bg-stone-400 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
                    ))}
                  </div>

                  {/* Glowing icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-3xl"
                      style={{
                        filter: `drop-shadow(0 0 10px ${model.color})`,
                        animation: 'float 3s ease-in-out infinite'
                      }}
                    >
                      {model.icon}
                    </span>
                  </div>

                  {/* Book name */}
                  <div className="absolute -bottom-1 inset-x-0 text-center">
                    <span
                      className="text-xs font-serif px-2 py-0.5 bg-stone-900 rounded text-amber-300 shadow"
                      style={{ fontSize: '10px' }}
                    >
                      {model.name}
                    </span>
                  </div>
                </div>

                {/* Hover hint */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  <span className="text-amber-400 text-xs font-serif bg-stone-900 px-2 py-1 rounded border border-amber-800">
                    Return to shelf
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Desk front panel */}
      <div
        className="h-8 rounded-b-lg border-b-4 border-x-4 border-amber-900"
        style={{
          background: 'linear-gradient(180deg, #292524 0%, #1c1917 100%)',
        }}
      >
        <div className="flex justify-center items-center h-full gap-4">
          <div className="w-8 h-4 rounded-full bg-amber-800 shadow-inner" />
          <div className="w-8 h-4 rounded-full bg-amber-800 shadow-inner" />
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) rotateX(-20deg); }
          to { opacity: 1; transform: translateY(0) rotateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

const MessageBubble: React.FC<{
  message: Message;
  model?: Model;
}> = ({ message, model }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
      style={{ animation: 'messageAppear 0.5s ease-out' }}
    >
      <div
        className={`relative max-w-2xl rounded-lg shadow-xl overflow-hidden ${
          isUser ? 'mr-2' : 'ml-2'
        }`}
        style={{
          maxWidth: '85%',
        }}
      >
        {isUser ? (
          // User message - wax sealed parchment
          <div
            className="p-5 border-2 border-amber-700"
            style={{
              background: 'linear-gradient(135deg, #78350f 0%, #451a03 100%)',
            }}
          >
            <p className="font-serif text-amber-100 leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
            {/* Wax seal */}
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-red-700 to-red-900 shadow-lg flex items-center justify-center border-2 border-red-600">
              <span className="text-amber-200 text-sm">⚜️</span>
            </div>
          </div>
        ) : (
          // AI response - aged parchment with model styling
          <div
            className={`relative ${message.isReview ? 'border-l-4' : ''}`}
            style={{
              borderLeftColor: message.isReview ? model?.color : undefined,
              background: message.isReview
                ? 'linear-gradient(135deg, #1c1917 0%, #292524 100%)'
                : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 30%, #fcd34d 70%, #fef3c7 100%)',
            }}
          >
            {/* Header */}
            <div
              className={`px-4 py-3 border-b flex items-center gap-3 ${
                message.isReview ? 'border-amber-800' : 'border-amber-600'
              }`}
              style={{
                background: message.isReview
                  ? `linear-gradient(90deg, ${model?.color}22 0%, transparent 100%)`
                  : `linear-gradient(90deg, ${model?.color}44 0%, ${model?.color}22 100%)`,
              }}
            >
              <span
                className="text-2xl"
                style={{ filter: `drop-shadow(0 0 5px ${model?.color})` }}
              >
                {model?.icon}
              </span>
              <div>
                <span
                  className="font-serif font-bold"
                  style={{ color: model?.color }}
                >
                  {model?.fullName}
                </span>
                {message.isReview && (
                  <span className={`block text-xs italic ${message.isReview ? 'text-amber-500' : 'text-amber-700'}`}>
                    ⟡ Reviewing {message.reviewingModel}&apos;s response
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <p className={`font-serif leading-relaxed whitespace-pre-wrap ${
                message.isReview ? 'text-amber-200' : 'text-stone-800'
              }`}>
                {message.content}
              </p>
            </div>

            {/* Decorative corner */}
            <div
              className={`absolute top-0 right-0 w-8 h-8 ${message.isReview ? 'opacity-30' : 'opacity-50'}`}
              style={{
                background: `linear-gradient(135deg, ${model?.color} 0%, transparent 100%)`,
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes messageAppear {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

const LoadingIndicator: React.FC<{ modelName: string; isReview?: boolean }> = ({ modelName, isReview }) => {
  return (
    <div
      className="flex justify-start mb-4 ml-2"
      style={{ animation: 'messageAppear 0.3s ease-out' }}
    >
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 border border-amber-800 rounded-lg p-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full"
                style={{
                  background: 'linear-gradient(to top, #d97706, #fcd34d)',
                  animation: `bounce 1s ease-in-out ${i * 150}ms infinite`,
                }}
              />
            ))}
          </div>
          <span className="text-amber-400 font-serif italic">
            {modelName} {isReview ? 'contemplates the response...' : 'consults the ancient texts...'}
          </span>
        </div>
      </div>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

export default function CastleLibrary() {
  const [selectedModels, setSelectedModels] = useState<Model[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState<{ model: string; isReview: boolean } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingState]);

  const toggleModel = (model: Model) => {
    setSelectedModels((prev) => {
      const exists = prev.find((m) => m.id === model.id);
      if (exists) return prev.filter((m) => m.id !== model.id);
      return [...prev, model];
    });
  };

  const handleSubmit = async () => {
    if (!input.trim() || selectedModels.length === 0 || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const responses: { model: Model; response: string }[] = [];

    // Get responses from all selected models
    for (const model of selectedModels) {
      setLoadingState({ model: model.fullName, isReview: false });
      const response = await generateResponse(model.id, input);
      responses.push({ model, response });

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        modelId: model.id,
        modelName: model.fullName,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    }

    // If multiple models, have them review each other
    if (selectedModels.length > 1) {
      for (const reviewer of selectedModels) {
        for (const reviewed of responses) {
          if (reviewer.id !== reviewed.model.id) {
            setLoadingState({ model: reviewer.fullName, isReview: true });
            const review = await generateReview(reviewer.id, reviewed.model.id, reviewed.response);

            const reviewMessage: Message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: review,
              modelId: reviewer.id,
              modelName: reviewer.fullName,
              isReview: true,
              reviewingModel: reviewed.model.fullName,
            };

            setMessages((prev) => [...prev, reviewMessage]);
          }
        }
      }
    }

    setLoadingState(null);
    setIsLoading(false);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1c1917 0%, #0c0a09 50%, #1c1917 100%)',
      }}
    >
      {/* Stone wall texture */}
      <div
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 30% 20%, rgba(180, 83, 9, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(180, 83, 9, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(120, 53, 15, 0.1) 0%, transparent 70%)
          `,
        }}
      />

      <DustParticles />
      <TorchSconce side="left" />
      <TorchSconce side="right" />

      {/* Header - Gothic Arch */}
      <header className="relative z-10">
        <div
          className="relative pt-8 pb-6 border-b-4 border-amber-900"
          style={{
            background: 'linear-gradient(180deg, #292524 0%, #1c1917 100%)',
          }}
        >
          {/* Gothic arch decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-20 hidden md:block">
            <svg viewBox="0 0 200 50" className="w-full h-full">
              <path
                d="M0,50 Q100,0 200,50"
                fill="none"
                stroke="#92400e"
                strokeWidth="3"
                opacity="0.6"
              />
            </svg>
          </div>

          <div className="max-w-6xl mx-auto px-4 text-center relative">
            <div className="flex items-center justify-center gap-4 mb-3">
              <Candle size="lg" />
              <div>
                <h1
                  className="text-4xl md:text-5xl font-serif tracking-wider"
                  style={{
                    background: 'linear-gradient(180deg, #fcd34d 0%, #d97706 50%, #92400e 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 40px rgba(251, 191, 36, 0.5)',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                  }}
                >
                  ⚜ The Grand Library ⚜
                </h1>
                <p className="text-amber-600 font-serif italic mt-2 text-lg">
                  of Whispered Wisdom & Ancient Oracles
                </p>
              </div>
              <Candle size="lg" />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Bookshelf Alcove */}
        <section className="mb-8">
          <div
            className="relative rounded-t-3xl border-t-4 border-x-4 border-amber-800 overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #292524 0%, #1c1917 100%)',
            }}
          >
            {/* Alcove arch */}
            <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden">
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-32 rounded-b-[50%] border-b-4 border-amber-700"
                style={{ background: 'radial-gradient(ellipse at center top, #451a03 0%, transparent 70%)' }}
              />
            </div>

            <div className="pt-12 pb-6 px-6">
              <h2 className="text-center text-2xl font-serif text-amber-400 mb-6">
                ✦ The Alcove of Ancient Tomes ✦
              </h2>

              {/* Shelf */}
              <div
                className="relative rounded-lg p-6 border-4 border-amber-800 shadow-inner"
                style={{
                  background: 'linear-gradient(180deg, #451a03 0%, #78350f 20%, #451a03 100%)',
                  boxShadow: 'inset 0 5px 20px rgba(0,0,0,0.5)',
                }}
              >
                {/* Shelf back texture */}
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(0,0,0,0.2) 50px, rgba(0,0,0,0.2) 52px)'
                }} />

                {/* Books */}
                <div className="relative flex justify-center gap-8 py-4">
                  {AVAILABLE_MODELS.map((model) => (
                    <BookOnShelf
                      key={model.id}
                      model={model}
                      isSelected={selectedModels.some((m) => m.id === model.id)}
                      onClick={() => toggleModel(model)}
                    />
                  ))}
                </div>

                {/* Shelf ledge */}
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-amber-800 to-amber-900 rounded-b shadow-lg" />
              </div>
            </div>

            {/* Reading Desk */}
            <ReadingDesk
              selectedModels={selectedModels}
              onRemove={toggleModel}
            />
          </div>
        </section>

        {/* Consultation Chamber */}
        <section
          className="relative rounded-2xl border-4 border-amber-900 overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(180deg, #1c1917 0%, #0c0a09 100%)',
          }}
        >
          {/* Chamber header */}
          <div
            className="px-6 py-4 border-b-2 border-amber-900"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(120, 53, 15, 0.3) 50%, transparent 100%)',
            }}
          >
            <h3 className="text-center text-xl font-serif text-amber-500">
              ❧ The Consultation Chamber ❧
            </h3>
          </div>

          {/* Messages Area */}
          <div
            className="h-[400px] overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-amber-800 scrollbar-track-stone-900"
            style={{
              backgroundImage: `
                radial-gradient(ellipse at 50% 0%, rgba(120, 53, 15, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 100%, rgba(120, 53, 15, 0.1) 0%, transparent 50%)
              `,
            }}
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div
                  className="text-7xl mb-6"
                  style={{ animation: 'float 3s ease-in-out infinite' }}
                >
                  🕯️
                </div>
                <p className="text-amber-500 font-serif italic text-xl mb-3">
                  The chamber awaits your inquiry...
                </p>
                <p className="text-amber-700 font-serif text-sm max-w-md">
                  Select one or more ancient tomes from the alcove above,
                  then inscribe your question upon the parchment below
                </p>
                <style>{`
                  @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                  }
                `}</style>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    model={AVAILABLE_MODELS.find((m) => m.id === message.modelId)}
                  />
                ))}
                {loadingState && (
                  <LoadingIndicator
                    modelName={loadingState.model}
                    isReview={loadingState.isReview}
                  />
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div
            className="border-t-2 border-amber-900 p-6"
            style={{
              background: 'linear-gradient(180deg, #292524 0%, #1c1917 100%)',
            }}
          >
            <div className="flex gap-4">
              {/* Parchment input */}
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder={
                    selectedModels.length === 0
                      ? "First, select tomes from the alcove above..."
                      : "Inscribe your question upon this parchment... (Enter to send)"
                  }
                  disabled={selectedModels.length === 0 || isLoading}
                  className="w-full h-24 p-4 rounded-lg border-2 border-amber-700 font-serif text-stone-800 placeholder-stone-500 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fef3c7 100%)',
                  }}
                />
                {/* Wax seal */}
                <div
                  className="absolute -right-3 -bottom-3 w-12 h-12 rounded-full shadow-xl flex items-center justify-center border-2 border-red-600 z-10"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, #ef4444 0%, #991b1b 100%)',
                  }}
                >
                  <span className="text-amber-200 text-lg">⚜</span>
                </div>
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={selectedModels.length === 0 || !input.trim() || isLoading}
                className="px-8 py-4 rounded-lg border-2 font-serif text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                style={{
                  background: selectedModels.length === 0 || !input.trim() || isLoading
                    ? 'linear-gradient(180deg, #44403c 0%, #292524 100%)'
                    : 'linear-gradient(180deg, #d97706 0%, #92400e 100%)',
                  borderColor: selectedModels.length === 0 || !input.trim() || isLoading
                    ? '#57534e'
                    : '#fbbf24',
                  color: '#fef3c7',
                  boxShadow: selectedModels.length === 0 || !input.trim() || isLoading
                    ? 'none'
                    : '0 0 20px rgba(251, 191, 36, 0.3)',
                }}
              >
                <span className="flex items-center gap-2">
                  <span className="text-2xl">📜</span>
                  <span>Summon<br/>Wisdom</span>
                </span>
              </button>
            </div>

            {selectedModels.length === 0 && (
              <p className="text-amber-700 text-sm mt-4 text-center font-serif italic">
                ↑ You must first pull tomes from the alcove above ↑
              </p>
            )}

            {selectedModels.length > 1 && (
              <p className="text-amber-600 text-sm mt-4 text-center font-serif">
                ✧ Multiple oracles selected — they shall confer upon your question ✧
              </p>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 text-center pb-8">
          <div className="flex items-center justify-center gap-4 text-amber-800">
            <span>⚜</span>
            <p className="font-serif italic">
              Within these ancient halls, wisdom echoes through eternity
            </p>
            <span>⚜</span>
          </div>
        </footer>
      </main>

      {/* Custom scrollbar styles */}
      <style>{`
        ::-webkit-scrollbar {
          width: 12px;
        }
        ::-webkit-scrollbar-track {
          background: #1c1917;
          border-radius: 6px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #78350f 0%, #451a03 100%);
          border-radius: 6px;
          border: 2px solid #1c1917;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #92400e 0%, #78350f 100%);
        }
      `}</style>
    </div>
  );
}
