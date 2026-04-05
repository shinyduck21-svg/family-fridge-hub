"use client";

import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { 
  doc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Users, PlusCircle, LogIn } from "lucide-react";

export default function FamilySetup() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [error, setError] = useState("");

  // 가족 그룹 생성
  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !familyName) return;

    setLoading(true);
    setError("");

    try {
      const familyId = `fam_${Math.random().toString(36).substring(2, 9)}`;
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // 1. families 문서 생성
      await setDoc(doc(db, "families", familyId), {
        familyId,
        familyName,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        memberIds: [user.uid],
        inviteCode,
        inviteCodeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간 후 만료
      });

      // 2. users 문서 업데이트
      await updateDoc(doc(db, "users", user.uid), {
        familyId,
        role: "admin",
        onboardingCompleted: true
      });

      window.location.reload(); // 상태 반영을 위한 리로드
    } catch (err) {
      console.error(err);
      setError("가족 그룹 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 초대 코드로 합류
  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteCode) return;

    setLoading(true);
    setError("");

    try {
      const q = query(
        collection(db, "families"), 
        where("inviteCode", "==", inviteCode.toUpperCase())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("유효하지 않은 초대 코드입니다.");
        setLoading(false);
        return;
      }

      const familyDoc = querySnapshot.docs[0];
      const familyData = familyDoc.data();

      // 1. families 멤버 목록에 추가
      await updateDoc(doc(db, "families", familyData.familyId), {
        memberIds: arrayUnion(user.uid)
      });

      // 2. users 정보 업데이트
      await updateDoc(doc(db, "users", user.uid), {
        familyId: familyData.familyId,
        role: "member",
        onboardingCompleted: true
      });

      window.location.reload();
    } catch (err) {
      console.error(err);
      setError("가족 합류 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 space-y-8">
      <div className="text-center">
        <Users className="mx-auto h-12 w-12 text-blue-500" />
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900">우리 가족 시작하기</h2>
        <p className="mt-2 text-sm text-gray-600">
          새로운 가족 그룹을 만들거나 초대 코드로 합류하세요.
        </p>
      </div>

      <div className="space-y-6">
        {/* 새 가족 만들기 */}
        <form onSubmit={handleCreateFamily} className="p-4 border rounded-xl shadow-sm bg-white">
          <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
            <PlusCircle size={20} className="text-green-500" /> 새 가족 그룹 만들기
          </h3>
          <input
            type="text"
            placeholder="가족 이름 (예: 김씨네 냉장고)"
            className="w-full p-2 border rounded mb-3 outline-none focus:ring-2 focus:ring-blue-500"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : "가족 만들기"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-gray-50 px-2 text-gray-500">또는</span></div>
        </div>

        {/* 초대 코드로 합류 */}
        <form onSubmit={handleJoinFamily} className="p-4 border rounded-xl shadow-sm bg-white">
          <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
            <LogIn size={20} className="text-blue-500" /> 초대 코드로 합류하기
          </h3>
          <input
            type="text"
            placeholder="초대 코드 6자리"
            className="w-full p-2 border rounded mb-3 outline-none focus:ring-2 focus:ring-blue-500"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            maxLength={6}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-800 text-white p-2 rounded font-semibold hover:bg-gray-900 disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : "합류하기"}
          </button>
        </form>

        {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
      </div>
    </div>
  );
}
