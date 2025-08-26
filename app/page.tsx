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

export default function Home() {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string[]>(["HP8", "CE7", "FD6"]);
  const [radius, setRadius] = useState(500);

  const onSearch = () => {
    alert(`검색어: ${query}\n카테고리: ${picked.join(", ")}\n반경: ${radius}m`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Top */}
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/jari_logo.png" alt="JARI" width={100} height={100} className="rounded" />
            <span className="font-semibold text-lg">자리(JARI)</span>
          </div>
          <nav className="text-sm text-gray-600 hidden sm:flex items-center gap-4">
            <a className="hover:text-black" href="#">기능</a>
            <a className="hover:text-black" href="#">요금제</a>
            <a className="hover:text-black" href="#">문의</a>
          </nav>
        </div>
      </header>

      {/* Hero & Search */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
            부동산 <span className="text-gray-500">입지분석</span>을 더 간단하게
          </h1>
        </div>

        {/* Search bar */}
        <div className="mt-8 mx-auto max-w-3xl">
          <SearchBar value={query} onChange={setQuery} onSubmit={onSearch} />
        </div>

        {/* Category dropdown */}
        <div className="mt-6 mx-auto max-w-3xl">
          <CategoryMultiSelect items={CATEGORIES} value={picked} onChange={setPicked} />
        </div>

        {/* Radius slider */}
        <div className="mt-6 mx-auto max-w-3xl">
          <RadiusSlider value={radius} onChange={setRadius} />
        </div>

        {/* Placeholder: map & stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3">
            <div className="h-[420px] rounded-2xl border bg-[linear-gradient(45deg,#f8f8f8,#f1f1f1)] grid place-items-center text-gray-500">
              <span>여기에 카카오 지도가 들어갑니다</span>
            </div>
          </div>
          <div className="md:col-span-2 space-y-3">
            <div className="p-5 rounded-2xl border bg-white">
              <div className="text-sm text-gray-500">총 결과</div>
              <div className="text-3xl font-semibold">—</div>
            </div>
            <div className="p-5 rounded-2xl border bg-white">
              <div className="text-sm text-gray-500">거리별 분포(예측)</div>
              <div className="text-gray-400 text-sm">그래프 영역</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
