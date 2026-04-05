"use client";

import React from "react";
import { db } from "@/lib/firebase";
import { 
  doc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { CheckCircle2, MapPin, Tag } from "lucide-react";

interface Ingredient {
  id: string;
  name: string;
  category: string;
  expiryDate: any;
  location: string;
  quantity: number;
  unit: string;
  isConsumed: boolean;
}

export default function IngredientList({ ingredients, loading }: { ingredients: Ingredient[], loading: boolean }) {
  // 재료 삭제 (소비 완료)
  const handleConsume = async (id: string) => {
    try {
      await updateDoc(doc(db, "ingredients", id), {
        isConsumed: true,
        consumedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("재료 소비 중 오류:", err);
    }
  };

  if (loading) return (
    <div className="p-8 text-center text-gray-500">재료 목록을 불러오는 중...</div>
  );

  if (ingredients.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200 mt-6">
        <p className="text-gray-400">냉장고가 비어있습니다. <br />첫 번째 재료를 추가해 보세요!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 mt-6">
      {ingredients.map((item) => {
        const expiryDate = item.expiryDate?.toDate();
        const diffInDays = expiryDate ? 
          Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 
          null;
        
        let statusColor = "bg-gray-100 text-gray-600";
        if (diffInDays !== null) {
          if (diffInDays <= 0) statusColor = "bg-red-50 text-red-600 border-red-100";
          else if (diffInDays <= 3) statusColor = "bg-orange-50 text-orange-600 border-orange-100";
          else statusColor = "bg-green-50 text-green-600 border-green-100";
        }

        return (
          <div 
            key={item.id}
            className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between group transition-all hover:shadow-md border border-transparent hover:border-blue-100"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${statusColor} border font-bold text-center min-w-[58px]`}>
                <span className="text-[10px] block opacity-70 uppercase tracking-tighter">
                  {diffInDays !== null && diffInDays <= 0 ? "EXPIRED" : "D-Day"}
                </span>
                <span className="text-lg">
                  {diffInDays !== null ? (diffInDays <= 0 ? "!!" : diffInDays) : "?"}
                </span>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-800 text-lg leading-none mb-1">{item.name}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1 font-medium text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                    {item.quantity}{item.unit}
                  </span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {item.location === "fridge" ? "냉장" : item.location === "freezer" ? "냉동" : "실온"}</span>
                  <span className="flex items-center gap-1"><Tag size={12} /> {item.category}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleConsume(item.id)}
                className="p-3 text-green-500 hover:bg-green-50 rounded-full transition-colors flex items-center gap-1"
                title="소비 완료"
              >
                <CheckCircle2 size={24} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
