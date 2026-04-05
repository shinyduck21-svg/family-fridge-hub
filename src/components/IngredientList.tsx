"use client";

import React from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Trash2, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface IngredientListProps {
  ingredients: any[];
  onEdit: (ingredient: any) => void; // 수정 클릭 핸들러 추가
}

export default function IngredientList({ ingredients, onEdit }: IngredientListProps) {
  
  // 소비 완료 처리
  const markAsConsumed = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // 카드 클릭 이벤트와 겹치지 않게 방지
    if (!id) return;
    try {
      const docRef = doc(db, "ingredients", id);
      await updateDoc(docRef, {
        isConsumed: true,
        consumedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("소비 완료 처리 중 오류:", err);
    }
  };

  // 유효기간 상태 계산 (남은 일수)
  const getExpiryStatus = (expiryDate: any) => {
    if (!expiryDate) return { label: "기한 없음", color: "text-gray-400", bg: "bg-gray-50" };
    
    const now = new Date();
    const expiry = new Date(expiryDate.seconds * 1000);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: `만료 (${Math.abs(diffDays)}일 경과)`, color: "text-red-600", bg: "bg-red-50", urgent: true };
    if (diffDays <= 3) return { label: `${diffDays}일 남음`, color: "text-orange-600", bg: "bg-orange-50", urgent: true };
    return { label: `${diffDays}일 남음`, color: "text-blue-600", bg: "bg-blue-50", urgent: false };
  };

  if (ingredients.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <p className="text-gray-400">냉장고가 비어있네요! 재료를 추가해 보세요. 🥬</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {ingredients.map((item) => {
        const status = getExpiryStatus(item.expiryDate);
        return (
          <div 
            key={item.id} 
            onClick={() => onEdit(item)}
            className="group relative bg-white border border-gray-100 p-5 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color} flex items-center gap-1`}>
                {status.urgent ? <AlertCircle size={12} /> : <Clock size={12} />}
                {status.label}
              </span>
              <button 
                onClick={(e) => markAsConsumed(e, item.id)}
                className="p-2 text-gray-300 hover:text-green-500 hover:bg-green-50 rounded-full transition-all"
                title="소비 완료"
              >
                <CheckCircle2 size={22} />
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                {item.name}
              </h3>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                {item.location === "fridge" ? "냉장 보관" : item.location === "freezer" ? "냉동 보관" : "실온 보관"}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
              <span className="text-sm font-medium text-gray-500">
                남은 수량: <span className="text-gray-800 font-bold">{item.quantity}{item.unit}</span>
              </span>
              <span className="text-[10px] text-gray-300 font-mono">
                {item.addedByName}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
