"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy 
} from "firebase/firestore";
import { LogOut, RefreshCcw, LayoutDashboard, Plus, Share2, Bell } from "lucide-react";
import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import MealRecommendation from "./MealRecommendation";
import { requestForToken } from "@/lib/fcm";

export default function Dashboard() {
  const { user, logOut } = useAuth();
  const [familyData, setFamilyData] = useState<any>(null);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); // 폼 표시 여부
  const [editingIngredient, setEditingIngredient] = useState<any>(null); // 수정 중인 재료

  // 푸시 알림 토큰 등록
  useEffect(() => {
    if (user) {
      requestForToken(user.uid);
    }
  }, [user]);

  useEffect(() => {
    let unsubscribeIngredients: () => void;

    const fetchFamilyAndSetupListener = async () => {
      if (!user) return;
      
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const familyId = userSnap.data().familyId;
          
          if (familyId) {
            const familyRef = doc(db, "families", familyId);
            const familySnap = await getDoc(familyRef);
            if (familySnap.exists()) {
              setFamilyData(familySnap.data());
            }

            const q = query(
              collection(db, "ingredients"),
              where("familyId", "==", familyId),
              where("isConsumed", "==", false),
              orderBy("expiryDate", "asc")
            );

            unsubscribeIngredients = onSnapshot(q, (snapshot) => {
              const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              setIngredients(items);
              setLoading(false);
            }, (error) => {
              console.error("재료 리스너 오류:", error);
              setLoading(false);
            });
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("데이터 로딩 오류:", err);
        setLoading(false);
      }
    };

    fetchFamilyAndSetupListener();

    return () => {
      if (unsubscribeIngredients) unsubscribeIngredients();
    };
  }, [user]);

  // 수정 폼 열기
  const handleEditIngredient = (ingredient: any) => {
    setEditingIngredient(ingredient);
    setShowForm(true);
  };

  // 폼 닫기
  const closeForm = () => {
    setShowForm(false);
    setEditingIngredient(null);
  };

  // 초대 코드 복사 기능
  const copyInviteCode = () => {
    if (familyData?.inviteCode) {
      navigator.clipboard.writeText(familyData.inviteCode);
      alert(`초대 코드가 복사되었습니다: ${familyData.inviteCode}`);
    }
  };

  if (loading && ingredients.length === 0) return (
    <div className="flex h-screen items-center justify-center">
      <RefreshCcw className="animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-32">
      {/* 상단 네비게이션 */}
      <header className="bg-white shadow px-4 py-3 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white font-bold">
            <LayoutDashboard size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">
            {familyData?.familyName || "가족 냉장고"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={copyInviteCode}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="초대 코드 공유"
          >
            <Share2 size={20} />
          </button>
          <button 
            onClick={logOut}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
            title="로그아웃"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="p-4 flex-1 max-w-2xl mx-auto w-full">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white mb-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold leading-snug">안녕하세요, <br />{user?.displayName}님! 👋</h2>
            <div className="mt-4 flex items-center gap-4 text-white/80">
              <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/20">
                초대코드: {familyData?.inviteCode}
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <img src="https://cdn-icons-png.flaticon.com/512/2921/2921820.png" className="w-56" alt="fridge-icon" />
          </div>
        </div>

        {/* AI 식단 추천 섹션 */}
        <MealRecommendation ingredients={ingredients} />

        {/* 재료 리스트 섹션 */}
        <div className="space-y-4">
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-lg font-bold text-gray-800">지금 냉장고에 있는 재료</h3>
            <span className="text-sm text-gray-400 font-medium">{ingredients.length}개 보관 중</span>
          </div>
          <IngredientList 
            ingredients={ingredients} 
            onEdit={handleEditIngredient} 
          />
        </div>
      </main>

      {/* 하단 유동 추가 버튼 */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white flex items-center gap-2 px-8 py-4 rounded-full shadow-2xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all text-lg font-bold"
        >
          <Plus size={24} />
          재료 추가
        </button>
      </div>

      {/* 재료 추가/수정 폼 모달 */}
      {showForm && (
        <IngredientForm 
          familyId={familyData?.familyId} 
          onClose={closeForm}
          initialData={editingIngredient}
        />
      )}
    </div>
  );
}
