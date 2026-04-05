"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import FamilySetup from "@/components/FamilySetup";
import Dashboard from "@/components/Dashboard";
import { Loader2, Refrigerator } from "lucide-react";

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();
  const [hasFamily, setHasFamily] = useState<boolean | null>(null);
  const [checkingFamily, setCheckingFamily] = useState(true);

  // 1. 로그인한 유저의 가족 유무 확인
  useEffect(() => {
    const checkUserFamily = async () => {
      if (!user) {
        setCheckingFamily(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const familyId = userSnap.data().familyId;
          setHasFamily(!!familyId);
        } else {
          setHasFamily(false);
        }
      } catch (err) {
        console.error(err);
        setHasFamily(false);
      } finally {
        setCheckingFamily(false);
      }
    };

    checkUserFamily();
  }, [user]);

  // 2. 로딩 상태 처리
  if (loading || (user && checkingFamily)) {
    return (
      <div className="flex h-screen items-center justify-center gap-2">
        <Loader2 className="animate-spin text-blue-500" />
        <span className="font-medium">불러오는 중...</span>
      </div>
    );
  }

  // 3. 로그인 전: 랜딩 페이지
  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-6 max-w-lg">
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-3xl shadow-xl">
              <Refrigerator size={64} className="text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Family Fridge Hub
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            우리 가족 냉장고 속 식재료, <br />
            이제 실시간으로 공유하고 AI로 식단 추천까지 받아보세요!
          </p>

          <div className="pt-8">
            <button
              onClick={signInWithGoogle}
              className="px-8 py-4 bg-white text-gray-800 font-bold rounded-2xl shadow-lg border border-gray-100 flex items-center gap-3 mx-auto hover:bg-gray-50 transition-all hover:scale-105"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
              Google로 시작하기
            </button>
          </div>
        </div>
      </main>
    );
  }

  // 4. 로그인 후 가족이 없는 경우: 가족 설정 로직
  if (!hasFamily) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <FamilySetup />
      </main>
    );
  }

  // 5. 로그인 후 가족이 있는 경우: 대시보드
  return <Dashboard />;
}
