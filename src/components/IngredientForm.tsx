"use client";

import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Plus, X, Calendar, Tag, MapPin, ScanBarcode, Loader2 } from "lucide-react";
import BarcodeScanner from "./BarcodeScanner";

export default function IngredientForm({ familyId, onClose }: { familyId: string, onClose: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "etc",
    expiryDate: "",
    location: "fridge",
    quantity: 1,
    unit: "개",
    memo: ""
  });

  // 바코드 번호로 제품 정보 조회 (Open Food Facts API)
  const fetchProductInfo = async (barcode: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,product_name_ko,categories,nutriments`);
      const data = await response.json();
      
      if (data.status === 1) {
        const product = data.product;
        // 한국어 이름 우선, 없으면 영어 이름
        const name = product.product_name_ko || product.product_name || "알 수 없는 제품";
        
        // 카테고리 유추 (간단한 키워드 매칭)
        let category = "etc";
        const catStr = (product.categories || "").toLowerCase();
        if (catStr.includes("vegetable")) category = "vegetable";
        else if (catStr.includes("fruit")) category = "fruit";
        else if (catStr.includes("meat")) category = "meat";
        else if (catStr.includes("seafood") || catStr.includes("fish")) category = "seafood";
        else if (catStr.includes("dairy") || catStr.includes("milk") || catStr.includes("cheese")) category = "dairy";
        else if (catStr.includes("beverage") || catStr.includes("drink")) category = "dairy"; // 유제품/음료 통합
        else if (catStr.includes("sauce") || catStr.includes("condiment")) category = "condiment";
        
        setFormData(prev => ({
          ...prev,
          name: name,
          category: category
        }));
      } else {
        alert("제품 정보를 찾을 수 없습니다. 직접 입력해 주세요.");
      }
    } catch (err) {
      console.error("제품 조회 오류:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    setShowScanner(false);
    fetchProductInfo(decodedText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !familyId) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "ingredients"), {
        ...formData,
        familyId,
        addedBy: user.uid,
        addedByName: user.displayName,
        expiryDate: formData.expiryDate ? Timestamp.fromDate(new Date(formData.expiryDate)) : null,
        purchasedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isConsumed: false
      });
      onClose();
    } catch (err) {
      console.error("재료 추가 중 오류:", err);
      alert("재료 추가에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-10 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Plus className="text-blue-600" /> 재료 추가하기
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* 바코드 스캔 버튼 */}
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="w-full mb-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors border border-dashed border-gray-300"
        >
          <ScanBarcode size={20} className="text-blue-500" />
          바코드 스캔으로 자동 입력
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">재료 이름</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder={isSearching ? "제품 정보 찾는 중..." : "예: 유기농 우유, 달걀 1판"}
                disabled={isSearching}
                className="w-full p-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {isSearching && (
                <div className="absolute right-3 top-3">
                  <Loader2 className="animate-spin text-blue-500" size={20} />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Tag size={14} /> 카테고리
              </label>
              <select
                className="w-full p-3 bg-gray-50 border-none rounded-2xl outline-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="vegetable">야채/채소</option>
                <option value="fruit">과일</option>
                <option value="meat">육류</option>
                <option value="seafood">해산물</option>
                <option value="dairy">유제품/음료</option>
                <option value="grain">곡류</option>
                <option value="condiment">양념/소스</option>
                <option value="etc">기타</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Calendar size={14} /> 유효기간
              </label>
              <input
                type="date"
                required
                className="w-full p-3 bg-gray-50 border-none rounded-2xl outline-none"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <MapPin size={14} /> 보관 장소
              </label>
              <select
                className="w-full p-3 bg-gray-50 border-none rounded-2xl outline-none"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              >
                <option value="fridge">냉장</option>
                <option value="freezer">냉동</option>
                <option value="pantry">실온</option>
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">수량</label>
                <input
                  type="number"
                  className="w-full p-3 bg-gray-50 border-none rounded-2xl outline-none"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                />
              </div>
              <div className="w-20">
                <label className="block text-sm font-medium text-gray-700 mb-1">단위</label>
                <input
                  type="text"
                  className="w-full p-3 bg-gray-50 border-none rounded-2xl outline-none text-center"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isSearching}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all mt-4"
          >
            {loading ? "등록 중..." : "냉장고에 넣기"}
          </button>
        </form>
      </div>

      {/* 바코드 스캐너 모달 */}
      {showScanner && (
        <BarcodeScanner 
          onScanSuccess={handleScanSuccess} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </div>
  );
}
