"use client";

import React from "react";
import Image from "next/image";
import { 
  Sparkles, 
  Camera, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight,
  RotateCcw,
  Zap
} from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-gray-800 selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. 네비게이션 바 */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
            <Zap size={20} fill="currentColor" />
          </div>
          <span className="text-xl font-black tracking-tight text-gray-900">Family Fridge Hub</span>
        </div>
        <button 
          onClick={onStart}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-blue-100 active:scale-95 text-sm"
        >
          시작하기
        </button>
      </nav>

      {/* 2. 히어로 섹션 */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black mb-6 animate-bounce">
            <Sparkles size={14} /> NEW: 스마트 영수증 인식 기능 출시
          </div>
          <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] mb-8 text-gray-900">
            우리 집 냉장고에 <br />
            <span className="text-blue-600">포근한 비서</span>를 <br />
            선물하세요.
          </h1>
          <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
            영수증 한 장으로 끝내는 재료 관리부터, <br />
            AI가 제안하는 완벽한 오늘 저녁 메뉴까지. <br />
            가족의 식탁이 더 즐거워집니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button 
              onClick={onStart}
              className="px-10 py-5 bg-blue-600 text-white rounded-3xl font-black text-xl shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              지금 무료로 시작하기 <ArrowRight size={24} />
            </button>
          </div>
          <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-green-500" /> 실시간 공유</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-green-500" /> AI 식단 추천</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-green-500" /> 카드 등록 없음</span>
          </div>
        </div>
        
        <div className="flex-1 relative w-full aspect-square max-w-[600px] group">
          <div className="absolute inset-0 bg-blue-200 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative overflow-hidden rounded-[2.5rem] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_60px_120px_-20px_rgba(0,0,0,0.15)] transition-all duration-700">
            <Image 
              src="/landing-hero.png" 
              alt="Warm Fridge Hub Illust" 
              width={800} 
              height={800} 
              className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700" 
            />
          </div>
        </div>
      </section>

      {/* 3. 핵심 기능 소개 */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">냉장고 관리의 혁신, Family Fridge Hub</h2>
            <p className="text-gray-500">우리가 가장 잘하는 세 가지를 소개합니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 기능 1 */}
            <div className="p-10 rounded-[2.5rem] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-8 border border-blue-50">
                <Camera size={28} />
              </div>
              <h3 className="text-2xl font-black mb-4">찰깍, 한 장으로 끝!</h3>
              <p className="text-gray-500 leading-relaxed">
                바코드 하나하나 찍으셨나요? 이제 영수증 사진 한 장이면 AI가 한꺼번에 재료들을 깔끔하게 정리해 줍니다.
              </p>
            </div>

            {/* 기능 2 */}
            <div className="p-10 rounded-[2.5rem] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-8 border border-orange-50">
                <Sparkles size={28} />
              </div>
              <h3 className="text-2xl font-black mb-4">천재적인 식재료 활용</h3>
              <p className="text-gray-500 leading-relaxed">
                유통기한이 임박한 재료부터 챙겨주는 기특한 비서. 더 이상 재료를 버릴 걱정이 없습니다.
              </p>
            </div>

            {/* 기능 3 */}
            <div className="p-10 rounded-[2.5rem] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-8 border border-green-50">
                <RotateCcw size={28} />
              </div>
              <h3 className="text-2xl font-black mb-4">실수해도 괜찮아요</h3>
              <p className="text-gray-500 leading-relaxed">
                잘못해서 '소비 완료'를 누르셨나요? 히스토리에서 언제든 다시 냉장고로 불러올 수 있습니다. 완벽한 재고 관리를 경험하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 푸터 & 강력한 유입 */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-blue-600 rounded-[3rem] p-12 lg:p-20 text-center text-white shadow-2xl shadow-blue-300 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-black mb-8 leading-tight">식생활의 스트레스,<br />이제 저희에게 맡기세요.</h2>
            <button 
              onClick={onStart}
              className="bg-white text-blue-600 px-12 py-5 rounded-3xl font-black text-xl shadow-xl hover:scale-105 transition-all active:scale-95"
            >
              오늘부터 1일 시작하기
            </button>
            <p className="mt-8 text-blue-100/60 text-sm font-medium">Family Fridge Hub © 2026. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
