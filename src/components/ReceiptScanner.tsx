"use client";

import React, { useState, useRef } from "react";
import { Camera, X, Check, Loader2, Plus, Trash2, Edit2, ShoppingBag } from "lucide-react";
import { analyzeReceipt } from "@/lib/gemini";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

interface ReceiptScannerProps {
  familyId: string;
  onClose: () => void;
}

export default function ReceiptScanner({ familyId, onClose }: ReceiptScannerProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedItems, setAnalyzedItems] = useState<any[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  // 1. 이미지 선택 및 분석 시작
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const items = await analyzeReceipt(file);
      // 각 아이템에 고유 ID(로컬용) 부여
      setAnalyzedItems(items.map((item: any, idx: number) => ({ ...item, id: Date.now() + idx })));
    } catch (err) {
      console.error("영수증 분석 오류:", err);
      alert("영수증을 분석하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 2. 항목 삭제
  const removeItem = (id: number) => {
    setAnalyzedItems(prev => prev.filter(item => item.id !== id));
  };

  // 3. 항목 수정 (간단히 이름만 수정 예시)
  const updateItemName = (id: number, newName: string) => {
    setAnalyzedItems(prev => prev.map(item => item.id === id ? { ...item, name: newName } : item));
  };

  // 4. 모든 항목 Firestore에 일괄 등록
  const saveAllItems = async () => {
    if (!user || !familyId) return;
    setIsAnalyzing(true);
    
    try {
      // 1주일 뒤를 기본 유효기간으로 설정 (수동 수정 가능하게 유도)
      const defaultExpiry = new Date();
      defaultExpiry.setDate(defaultExpiry.getDate() + 7);

      for (const item of analyzedItems) {
        await addDoc(collection(db, "ingredients"), {
          name: item.name,
          category: item.category || "etc",
          quantity: item.quantity || 1,
          unit: item.unit || "개",
          familyId,
          addedBy: user.uid,
          addedByName: user.displayName,
          location: "fridge",
          isConsumed: false,
          expiryDate: Timestamp.fromDate(defaultExpiry), // 기본 1주일 뒤
          purchasedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setIsSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error("일괄 등록 오류:", err);
      alert("등록 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* 헤더 */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <Camera className="text-blue-600" /> 영수증으로 한 번에 넣기
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* 메인 영역 */}
        <div className="flex-1 overflow-y-auto p-6">
          {analyzedItems.length === 0 && !isAnalyzing ? (
            // [초기 상태: 업로드 유도]
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 animate-bounce">
                <ShoppingBag size={40} />
              </div>
              <p className="text-gray-600 font-bold mb-2 text-lg">영수증 사진을 보여주세요!</p>
              <p className="text-gray-400 text-sm mb-6 text-center">AI가 품목과 수량을 자동으로 정리해 드립니다.</p>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Camera size={20} /> 사진 찍기 또는 업로드
              </button>
            </div>
          ) : isAnalyzing ? (
            // [분석 중 로딩]
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
              <p className="text-gray-600 font-bold text-lg">마법 같은 분석 중...</p>
              <p className="text-gray-400">Gemini가 영수증 정보를 정리하고 있습니다.</p>
            </div>
          ) : isSuccess ? (
            // [성공 메시지]
            <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                <Check size={40} />
              </div>
              <p className="text-gray-800 font-bold text-xl">냉장고 등록 완료!</p>
              <p className="text-gray-400 mt-2">입력이 편해졌죠? 대시보드로 돌아갑니다.</p>
            </div>
          ) : (
            // [분석 결과 리뷰 리스트]
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                <span>총 {analyzedItems.length}개의 품목을 찾았습니다.</span>
                <span className="italic">*잘못된 부분은 수정하거나 삭제해 주세요.</span>
              </div>
              {analyzedItems.map((item) => (
                <div key={item.id} className="group bg-blue-50/50 p-4 rounded-2xl flex items-center gap-3 border border-blue-100 hover:border-blue-300 transition-all">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 border shadow-sm">
                    <Plus size={20} />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={item.name} 
                      onChange={(e) => updateItemName(item.id, e.target.value)}
                      className="bg-transparent border-none p-0 font-bold text-gray-800 w-full focus:ring-0"
                    />
                    <div className="text-xs text-gray-400 mt-1 uppercase">
                      {item.category} • {item.quantity}{item.unit}
                    </div>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 text-sm text-gray-400 flex items-center justify-center gap-1 border-2 border-dashed rounded-2xl hover:bg-gray-50"
              >
                <Plus size={14} /> 한 장 더 찍기
              </button>
            </div>
          )}
        </div>

        {/* 하단 버튼 (결과가 있을 때만 표시) */}
        {analyzedItems.length > 0 && !isAnalyzing && !isSuccess && (
          <div className="p-6 border-t bg-gray-50 flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-white text-gray-600 font-bold rounded-2xl border hover:bg-gray-100 transition-all"
            >
              취소
            </button>
            <button 
              onClick={saveAllItems}
              className="flex-[2] py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
            >
              <Check size={20} /> 냉장고에 한꺼번에 넣기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
