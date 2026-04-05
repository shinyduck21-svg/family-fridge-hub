"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, Camera, RefreshCw } from "lucide-react";

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScanSuccess, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // 1. 스캐너 초기화 (카메라 권한 대기)
    const scannerId = "barcode-reader";
    const formatsToSupport = [
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E,
      Html5QrcodeSupportedFormats.CODE_128,
    ];

    const config = { 
      fps: 10, 
      qrbox: { width: 250, height: 160 },
      aspectRatio: 1.0,
    };

    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode(scannerId, { formatsToSupport, verbose: false });
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" }, // 후면 카메라 우선
          config,
          (decodedText) => {
            // 성공 시 알림음 등을 낼 수 있음
            onScanSuccess(decodedText);
          },
          (errorMessage) => {
            // 스캔 과정 중 에러 (무시 가능 - 계속 스캔 시도 중)
          }
        );
        setIsInitializing(false);
      } catch (err) {
        console.error("카메라 시작 오류:", err);
        setError("카메라를 시작할 수 없습니다. 권한을 확인해 주세요.");
        setIsInitializing(false);
      }
    };

    startScanner();

    // Cleanup: 컴포넌트 언마운트 시 카메라 정지
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop()
          .then(() => scannerRef.current?.clear())
          .catch((err) => console.error("카메라 정지 오류:", err));
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative">
        {/* 헤더 */}
        <div className="p-4 bg-gray-50 flex justify-between items-center border-b font-bold text-gray-700">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-blue-500" />
            바코드 스캔
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* 카메라 영역 */}
        <div className="relative aspect-square bg-black flex items-center justify-center overflow-hidden">
          <div id="barcode-reader" className="w-full h-full"></div>
          
          {isInitializing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4 bg-black/50">
              <RefreshCw className="animate-spin text-blue-400" size={40} />
              <p>카메라를 불러오는 중...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white bg-red-900/80">
              <p className="mb-4">{error}</p>
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-white text-red-900 rounded-xl font-bold"
              >
                닫기
              </button>
            </div>
          )}

          {/* 스킨 가이드 선 */}
          <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
            <div className="w-full h-full border-2 border-dashed border-blue-400 opacity-60 rounded-xl relative">
                {/* 모서리 강조 */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
            </div>
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="p-6 text-center">
          <p className="text-gray-600 text-sm mb-1">제품의 바코드를 사각형 안에 비춰주세요.</p>
          <p className="text-gray-400 text-xs italic">초점이 잡힐 때까지 기다려 주세요 (EAN-13 지원)</p>
        </div>
      </div>
    </div>
  );
}
