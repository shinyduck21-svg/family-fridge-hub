"use client";

import React, { useState } from "react";
import { getMealRecommendations, RecipeResult } from "@/lib/gemini";
import { Sparkles, Utensils, Clock, ChevronRight, X, Loader2, AlertCircle } from "lucide-react";

export default function MealRecommendation({ ingredients }: { ingredients: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecipeResult[] | null>(null);
  const [error, setError] = useState("");

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleGetRecommendation = async () => {
    if (!ingredients || ingredients.length === 0) {
      setError("냉장고에 재료가 없어서 추천이 어렵습니다. 재료를 먼저 등록해 주세요!");
      return;
    }

    setLoading(true);
    setError("");
    setRecommendations(null);
    setExpandedIndex(null); // 초기화
    try {
      const results = await getMealRecommendations(ingredients);
      setRecommendations(results);
    } catch (err) {
      console.error(err);
      setError("AI와 연결하는 중 문제가 발생했습니다. 조금 뒤에 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 mb-6">
      {!isOpen ? (
        <button
          onClick={() => {
            setIsOpen(true);
            handleGetRecommendation();
          }}
          className="w-full p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl border border-amber-100 flex items-center justify-between group hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="bg-amber-400 p-3 rounded-2xl text-white shadow-lg shadow-amber-200">
              <Sparkles size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-800 text-lg">오늘 뭐 해 먹지?</h3>
              <p className="text-sm text-gray-500">AI가 우리 냉장고 재료로 메뉴를 추천해드려요</p>
            </div>
          </div>
          <ChevronRight className="text-amber-400 group-hover:translate-x-1 transition-transform" />
        </button>
      ) : (
        <div className="bg-white rounded-3xl border border-amber-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-amber-400 p-4 flex justify-between items-center text-white">
            <h3 className="font-bold flex items-center gap-2">
              <Sparkles size={20} /> AI 추천 식단
            </h3>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="animate-spin text-amber-500" size={40} />
                <p className="text-gray-500 font-medium">재료를 분석해서 맛있는 메뉴를 고르는 중...</p>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-red-500 p-4 bg-red-50 rounded-2xl">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations?.map((recipe, index) => (
                  <div 
                    key={index} 
                    className="p-5 border border-gray-100 rounded-2xl hover:bg-amber-50/30 transition-all overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2 text-wrap">
                        <Utensils size={18} className="text-amber-500 shrink-0" /> {recipe.name}
                      </h4>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg uppercase whitespace-nowrap">
                        {recipe.difficulty} 난이도
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">{recipe.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {recipe.usedIngredients.map((ing, i) => (
                        <span key={i} className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                          #{ing}
                        </span>
                      ))}
                    </div>

                    {/* 조리법 토글 버튼 */}
                    <button 
                      onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                      className={`w-full py-2 mb-3 rounded-xl border border-dashed text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        expandedIndex === index 
                        ? 'bg-amber-100 border-amber-300 text-amber-700' 
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600'
                      }`}
                    >
                      {expandedIndex === index ? '🍳 조리법 닫기' : '🍳 자세한 조리법 보기'}
                    </button>

                    {/* 펼쳐지는 조리법 내용 */}
                    {expandedIndex === index && (
                      <div className="mb-4 bg-white/50 rounded-xl p-4 border border-amber-100/50 animate-in slide-in-from-top-2 duration-300">
                        <h5 className="text-xs font-bold text-amber-600 mb-2 uppercase tracking-tight">Step-by-Step Instructions</h5>
                        <ul className="space-y-2">
                          {recipe.instructions.map((step, i) => (
                            <li key={i} className="text-sm text-gray-700 leading-tight flex gap-2">
                              <span className="text-amber-500 font-bold shrink-0">{i + 1}.</span>
                              <span>{step.replace(/^\d+\.\s*/, '')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] font-medium border-t border-gray-50 pt-3">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock size={12} /> {recipe.cookingTime}
                      </div>
                      <div className="text-amber-600 italic">"{recipe.reason}"</div>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={handleGetRecommendation}
                  className="w-full mt-4 py-3 text-sm font-bold text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                >
                  다른 메뉴 더 추천받기
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
