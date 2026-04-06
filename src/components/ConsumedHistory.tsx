"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from "firebase/firestore";
import { X, RotateCcw, Trash2, Calendar, ShoppingBag, Clock, History } from "lucide-react";

interface ConsumedHistoryProps {
  familyId: string;
  onClose: () => void;
}

export default function ConsumedHistory({ familyId, onClose }: ConsumedHistoryProps) {
  const [consumedItems, setConsumedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. 소비된(isConsumed: true) 아이템 실시간 리스닝
  useEffect(() => {
    if (!familyId) return;

    const q = query(
      collection(db, "ingredients"),
      where("familyId", "==", familyId),
      where("isConsumed", "==", true),
      orderBy("consumedAt", "desc") // 최근 소비한 순서대로
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConsumedItems(items);
      setLoading(false);
    }, (error) => {
      console.error("히스토리 리스너 오류:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [familyId]);

  // 2. 재료 복구 (냉장고로 다시 넣기)
  const restoreItem = async (id: string) => {
    try {
      const docRef = doc(db, "ingredients", id);
      await updateDoc(docRef, {
        isConsumed: false,
        consumedAt: null, // 소비 날짜 제거
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("복구 중 오류:", err);
      alert("복구에 실패했습니다.");
    }
  };

  // 3. 영구 삭제 (히스토리에서도 지우기)
  const deletePermanently = async (id: string) => {
    if (!confirm("이 재료의 기록을 영원히 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, "ingredients", id));
    } catch (err) {
      console.error("영구 삭제 오류:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* 헤더 */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <History className="text-orange-500" /> 소비 기록 (히스토리)
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* 바디 영역 */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <Clock className="animate-spin text-orange-400" size={32} />
            </div>
          ) : consumedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <ShoppingBag size={48} className="mb-4 opacity-20" />
              <p>아직 소비된 기록이 없네요!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-400 mb-2">최근에 다 먹은 순서대로 보여집니다.</p>
              {consumedItems.map((item) => (
                <div key={item.id} className="group bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-orange-200 hover:bg-orange-50/10 transition-all flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 truncate">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-400 uppercase">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <Calendar size={10} />
                        {item.consumedAt?.toDate()?.toLocaleDateString()} 소비
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => restoreItem(item.id)}
                      className="p-2.5 text-blue-500 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                      title="냉장고로 복구"
                    >
                      <RotateCcw size={18} />
                    </button>
                    <button 
                      onClick={() => deletePermanently(item.id)}
                      className="p-2.5 text-gray-300 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                      title="영구 삭제"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-4 bg-gray-50 border-t text-center">
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Family Fridge Hub History</p>
        </div>
      </div>
    </div>
  );
}
