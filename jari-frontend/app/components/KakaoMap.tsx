"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global { interface Window { kakao: any } }

export type KakaoPoi = {
  x: number; // 경도
  y: number; // 위도
  name?: string;
  address?: string;
  phone?: string;
  url?: string;
  distance?: number;
  code?: string; // 카테고리 코드 (예: "HP8")
};

type Props = {
  center: { lat: number; lon: number };
  addressLabel?: string;     // 중심 인포윈도우에 띄울 주소/지점명
  level?: number;            // 카카오 줌 레벨 (작을수록 확대)
  radiusM?: number;          // 반경 원 (m) — 없으면 원 안 그림
  pois?: KakaoPoi[];         // 마커 목록
  className?: string;
  fitBounds?: boolean;       // 마커 있으면 화면 맞춤
  cluster?: boolean;         // 마커 클러스터 사용
};

export default function KakaoMap({
  center,
  addressLabel = "",
  level = 4,
  radiusM,
  pois = [],
  className = "w-full min-h-[560px] rounded-xl border bg-[#f7f7f7]",
  fitBounds = true,
  cluster = true,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded || !mapRef.current || !window.kakao) return;

    window.kakao.maps.load(() => {
      const kakao = window.kakao;

      // 1) 지도 생성
      const centerLL = new kakao.maps.LatLng(center.lat, center.lon);
      const map = new kakao.maps.Map(mapRef.current!, { center: centerLL, level });

      // 2) 중심 마커 + 라벨
      const home = new kakao.maps.Marker({ position: centerLL, map });
      if (addressLabel) {
        const iw = new kakao.maps.InfoWindow({
          content: `<div style="padding:6px 8px;font-size:13px;">${escapeHtml(addressLabel)}</div>`,
        });
        iw.open(map, home);
      }

      // 3) 반경 원
      if (radiusM && radiusM > 0) {
        const circle = new kakao.maps.Circle({
          center: centerLL,
          radius: radiusM,
          strokeWeight: 2,
          strokeColor: "#0a84ff",
          strokeOpacity: 0.8,
          fillColor: "#0a84ff",
          fillOpacity: 0.08,
        });
        circle.setMap(map);
      }

      // 4) 마커 + 인포윈도우
      const markers: any[] = [];
      const sprite = makeMarkerImage(kakao); // 공통 마커 이미지 (카테고리별 색상 지원)

      for (const p of pois) {
        const pos = new kakao.maps.LatLng(p.y, p.x); // (y=위도, x=경도)
        const marker = new kakao.maps.Marker({
          position: pos,
          image: sprite(p.code),
        });
        marker.setMap(map);
        markers.push(marker);

        const html =
          `<div style="padding:6px 8px;max-width:260px;font-size:12px;line-height:1.45">` +
          `<b>${escapeHtml(p.name ?? "상호명 없음")}</b>` +
          `${p.code ? ` <span style="color:#666;">(${escapeHtml(p.code)})</span>` : ""}<br/>` +
          `${p.address ? `${escapeHtml(p.address)}<br/>` : ""}` +
          `${p.phone ? `☎ ${escapeHtml(p.phone)}<br/>` : ""}` +
          `${typeof p.distance === "number" ? `거리: ${p.distance}m<br/>` : ""}` +
          `${p.url ? `<a href="${encodeURI(p.url)}" target="_blank" rel="noreferrer">상세보기</a>` : ""}` +
          `</div>`;

        const iw = new kakao.maps.InfoWindow({ content: html });
        kakao.maps.event.addListener(marker, "click", () => iw.open(map, marker));
      }

      // 5) 클러스터
      if (cluster && markers.length > 10 && kakao.maps.MarkerClusterer) {
        const clusterer = new kakao.maps.MarkerClusterer({
          map, averageCenter: true, minLevel: 6,
        });
        clusterer.addMarkers(markers);
      }

      // 6) 화면 맞춤
      if (fitBounds && markers.length) {
        const bounds = new kakao.maps.LatLngBounds();
        markers.forEach((m: any) => bounds.extend(m.getPosition()));
        map.setBounds(bounds);
      }

      console.log("[KakaoMap] center:", center, "markers:", markers.length);
    });
  }, [loaded, center.lat, center.lon, level, radiusM, JSON.stringify(pois), fitBounds, cluster]);

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&libraries=services,clusterer&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
      />
      <div ref={mapRef} className={className} />
    </>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" } as any)[c]
  );
}

// 카테고리 코드에 따라 다른 색 마커 리턴
function makeMarkerImage(kakao: any) {
  const colorByCode = (code?: string) => {
    if (!code) return "#3b82f6"; // 기본 파랑
    if (code.startsWith("HP")) return "#ef4444"; // 의료계열 빨강
    if (code.startsWith("CE")) return "#22c55e"; // 카페 초록
    if (code.startsWith("FD")) return "#f59e0b"; // 음식점 주황
    if (code.startsWith("BK")) return "#8b5cf6"; // 은행 보라
    return "#3b82f6";
  };

  return (code?: string) => {
    const color = colorByCode(code);
    const svg =
      `data:image/svg+xml;utf8,` +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='34' viewBox='0 0 24 34'>
           <path d='M12 0c6.1 0 11 4.9 11 11 0 8.3-11 23-11 23S1 19.3 1 11C1 4.9 5.9 0 12 0z' fill='${color}'/>
           <circle cx='12' cy='11' r='4.5' fill='white'/>
         </svg>`
      );
    return new kakao.maps.MarkerImage(svg, new kakao.maps.Size(24, 34), {
      offset: new kakao.maps.Point(12, 34),
    });
  };
}
