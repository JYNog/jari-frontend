"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import SearchAutocomplete from "./components/SearchAutocomplete";
import CategoryMultiSelect, { type Cat } from "./components/CategoryMultiSelect";
import RadiusSlider from "./components/RadiusSlider";
import KakaoMap, { type KakaoPoi } from "./components/KakaoMap";

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

type Poi = { name: string; x: number; y: number; distance?: number; code?: string; address?: string; phone?: string; url?: string };
type SearchResp = {
  center: { lat: number; lon: number; label: string };
  pois: Poi[];
  total_all: number;
  bins?: Array<{ range: [number, number]; count: number; est?: number }>;
};
type Center = { lat: number; lon: number };

export default function Home() {
  // 단계: idle(처음) / results(검색 후)
  const [stage, setStage] = useState<"idle" | "results">("idle");

  // 검색/위치
  const [query, setQuery] = useState("");
  const [center, setCenter] = useState<Center | null>(null);

  // 필터
  const [picked, setPicked] = useState<string[]>(["HP8"]);
  const [radius, setRadius] = useState(500);

  // 서버 응답
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResp | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 사이드 패널 토글(검색 후)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 자동완성 강제 닫기 토큰
  const [forceCloseToken, setForceCloseToken] = useState(0);

  const onPickSuggest = (it: { x: number; y: number; label: string }) => {
    setCenter({ lat: it.y, lon: it.x }); // kakao: x=경도, y=위도
    setQuery(it.label);
    setForceCloseToken((t) => t + 1); // 선택 시 자동완성 닫기
  };

  const runSearch = async (c: Center, q: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
      const res = await fetch(`${base}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: q.trim(),
          categories: picked,
          radius_m: Number(radius),
          center_lat: c.lat,
          center_lon: c.lon,
        }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data: SearchResp = await res.json();
      setResult(data);
      setStage("results");
      setSidebarOpen(false);
      setForceCloseToken((t) => t + 1); // 검색 직후 자동완성 닫기
    } catch (e: any) {
      setError(e.message ?? "검색 실패");
    } finally {
      setLoading(false);
    }
  };

  const onSearch = () => {
    if (!query.trim()) { setError("검색어를 입력하세요"); return; }
    if (!center) { setError("자동완성 목록에서 위치를 먼저 선택하세요"); return; }
    runSearch(center, query);
  };

  // 지도 중심
  const mapCenter = useMemo<Center>(() => {
    if (result?.center) return { lat: result.center.lat, lon: result.center.lon };
    if (center) return center;
    return { lat: 37.5665, lon: 126.9780 }; // fallback: 서울시청
  }, [result, center]);

  // 백엔드 결과
  const poisRaw = (result?.pois ?? []) as KakaoPoi[];

  // 프론트에서 카테고리 필터 한 번 더 (백엔드가 code 안 주면 일단 표시)
  const poisFiltered = useMemo(
    () => poisRaw.filter((p: any) => !p.code || picked.includes(p.code)),
    [poisRaw, picked]
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
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

      {/* 1) 처음 화면 */}
      {stage === "idle" && (
        <section className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-center">
            부동산 <span className="text-gray-500">입지분석</span>을 더 간단하게
          </h1>

          <div className="mt-8 w-full max-w-3xl flex gap-2">
            <SearchAutocomplete
              value={query}
              onChange={setQuery}
              onPick={(it) => onPickSuggest({ x: it.x, y: it.y, label: it.label })}
              forceCloseToken={forceCloseToken}
            />
            <button
              onClick={onSearch}
              disabled={!query.trim() || !center || loading}
              className="border px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            >
              검색
            </button>
          </div>

          <div className="mt-6 w-full max-w-3xl">
            <CategoryMultiSelect items={CATEGORIES} value={picked} onChange={setPicked} />
          </div>
          <div className="mt-6 w-full max-w-3xl">
            <RadiusSlider value={radius} onChange={setRadius} />
          </div>

          <div className="mt-4 h-6">
            {loading && <div className="text-sm text-gray-600">검색 중…</div>}
            {error && <div className="text-sm text-red-600">오류: {error}</div>}
          </div>
        </section>
      )}

      {/* 2) 결과 화면 */}
      {stage === "results" && (
        <section className="px-0 md:px-4 py-3">
          <div className="mb-3 flex items-center gap-2 px-4">
            <button
              className="border px-3 py-1 rounded"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="검색 패널 토글"
            >
              {sidebarOpen ? "검색 패널 숨기기" : "검색 패널 열기"}
            </button>
            <div className="text-sm text-gray-500">
              총 {(result?.total_all ?? 0).toLocaleString()}건
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            {/* 좌: 검색 패널 (토글) */}
            {sidebarOpen && (
              <aside className="col-span-12 md:col-span-4 lg:col-span-3 border rounded-xl p-4 space-y-6 bg-white">
                <div>
                  <div className="text-xs text-gray-500 mb-1">검색 위치</div>
                  <SearchAutocomplete
                    value={query}
                    onChange={setQuery}
                    onPick={(it) => onPickSuggest({ x: it.x, y: it.y, label: it.label })}
                    forceCloseToken={forceCloseToken}
                  />
                  <button
                    onClick={onSearch}
                    disabled={!query.trim() || !center || loading}
                    className="mt-2 w-full border px-4 py-2 rounded bg-black text-white disabled:opacity-50"
                  >
                    다시 검색
                  </button>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">카테고리</div>
                  <CategoryMultiSelect items={CATEGORIES} value={picked} onChange={setPicked} />
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">검색 반경: {radius}m</div>
                  <RadiusSlider value={radius} onChange={setRadius} />
                </div>
              </aside>
            )}

            {/* 우: 지도 + 차트 (1:1) */}
            <div className={sidebarOpen ? "col-span-12 md:col-span-8 lg:col-span-9" : "col-span-12"}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl border bg-white overflow-hidden">
                  <KakaoMap
                    center={mapCenter}
                    addressLabel={result?.center?.label ?? query}
                    level={4}
                    radiusM={Number(radius)}
                    pois={poisFiltered as KakaoPoi[]}
                    className="w-full min-h-[560px] rounded-xl"
                    fitBounds
                    cluster
                  />
                </div>
                <div className="rounded-xl border bg-white p-4">
                  <div className="text-sm text-gray-500 mb-2">요약</div>
                  <div className="text-3xl font-semibold">
                    {(result?.total_all ?? poisFiltered.length).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    (차트 영역 예정)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 에러/로딩 */}
          <div className="mt-3 h-5 px-1">
            {loading && <div className="text-sm text-gray-600">검색 중…</div>}
            {error && <div className="text-sm text-red-600">오류: {error}</div>}
          </div>
        </section>
      )}
    </main>
  );
}
