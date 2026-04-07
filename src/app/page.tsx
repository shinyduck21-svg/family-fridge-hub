"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import FamilySetup from "@/components/FamilySetup";
import Dashboard from "@/components/Dashboard";
import LandingPage from "@/components/LandingPage"; // 랜딩 페이지 추가
import { Loader2 } from "lucide-react";

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

  // 3. 로그인 전: 마케팅 랜딩 페이지
  if (!user) {
    return <LandingPage onStart={signInWithGoogle} />;
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
