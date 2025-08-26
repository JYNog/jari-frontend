"use client";
import Image from "next/image";
import { useState } from "react";
import SearchBar from "./components/SearchBar";
import CategoryMultiSelect, { type Cat } from "./components/CategoryMultiSelect";
import RadiusSlider from "./components/RadiusSlider";

const CATEGORIES: Cat[] = [
  { code: "MT1", name: "대형마트", emoji: "🛒" },
  { code: "CS2", name: "편의점", emoji: "🏪" },
  { code: "PS3", name: "어린이집·유치원", emoji: "🧒" },
  { code: "SC4", name: "학교", emoji: "🏫" },
  { code: "AC5", name: "학원", emoji: "🎒" },
  { code: "PK6", name: "주차장", emoji: "🅿️" },
  { code: "OL7", name: "주유·충전", emoji: "⛽" },
  { code: "SW8", name: "지하철역", emoji: "🚇" },
  { code: "BK9", name: "은행", emoji: "🏦" },
  { code: "CT1", name: "문화시설", emoji: "🏛️" },
  { code: "AG2", name: "중개업소", emoji: "🤝" },
  { code: "PO3", name: "공공기관", emoji: "🏢" },
  { code: "AT4", name: "관광명소", emoji: "📍" },
  { code: "AD5", name: "숙박", emoji: "🏨" },
  { code: "FD6", name: "음식점", emoji: "🍽️" },
  { code: "CE7", name: "카페", emoji: "☕" },
  { code: "HP8", name: "병원", emoji: "🏥" },
  { code: "PM9", name: "약국", emoji: "💊" },
];
type Poi = { name: string; x: number; y: number; distance?: number; code: string };
type SearchResp = {
  center: { lat: number; lon: number; label: string };
  pois: Poi[];
  total_all: number;
  bins?: Array<{ range: [number, number]; count: number; est?: number }>;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string[]>(["HP8"]);
  const [radius, setRadius] = useState(500);

  // 검색 이후 상태
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResp | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSearch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // 백엔드 FastAPI 프록시로 요청 (추후 연결)
      const base = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
      const res = await fetch(`${base}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: query, categories: picked, radius_m: radius
        }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data: SearchResp = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message ?? "검색 실패");
    } finally {
      setLoading(false);
    }
  };

  const hasData = !!result && result.pois?.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
        {/* 풀폭 컨테이너 */}
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/jari_logo.png" alt="JARI" width={100} height={100} className="rounded" />
            <span className="font-semibold text-lg">자리(JARI)</span>
          </div>

          <nav className="text-sm text-gray-600 hidden sm:flex items-center gap-6">
            <a className="hover:text-black" href="#">기능</a>
            <a className="hover:text-black" href="#">요금제</a>
            <a className="hover:text-black" href="#">문의</a>
          </nav>
        </div>
      </header>


      {/* 히어로 + 검색 UI */}
      <section className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
            부동산 <span className="text-gray-500">입지분석</span>을 더 간단하게
          </h1>
        </div>

        <div className="mt-8 w-full max-w-3xl">
          <SearchBar value={query} onChange={setQuery} onSubmit={onSearch} />
        </div>

        <div className="mt-6 w-full max-w-3xl">
          <CategoryMultiSelect items={CATEGORIES} value={picked} onChange={setPicked} />
        </div>

        <div className="mt-6 w-full max-w-3xl">
          <RadiusSlider value={radius} onChange={setRadius} />
        </div>

        {/* 상태 메시지 */}
        <div className="mt-4 w-full max-w-3xl min-h-6">
          {loading && <div className="text-sm text-gray-600">검색 중…</div>}
          {error && <div className="text-sm text-red-600">오류: {error}</div>}
        </div>

        {/* 검색 후에만 지도/통계 */}
        {hasData && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-6 w-full max-w-6xl">
            <div className="md:col-span-3">
              <div className="h-[420px] rounded-2xl border bg-[linear-gradient(45deg,#f8f8f8,#f1f1f1)] grid place-items-center text-gray-500">
                <span>지도 렌더링 예정 (center: {result!.center.label})</span>
              </div>
            </div>
            <div className="md:col-span-2 space-y-3">
              <div className="p-5 rounded-2xl border bg-white">
                <div className="text-sm text-gray-500">총 결과</div>
                <div className="text-3xl font-semibold">{result!.total_all.toLocaleString()}</div>
              </div>
              <div className="p-5 rounded-2xl border bg-white">
                <div className="text-sm text-gray-500">거리별 분포(예측)</div>
                <div className="text-gray-400 text-sm">
                  bins: {result!.bins?.length ?? 0}개
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

    </main>
  );
}