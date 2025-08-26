"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global { interface Window { kakao: any } }

export type KakaoPoi = { x: number; y: number; name?: string };

type Props = {
  center: { lat: number; lon: number };
  pois?: KakaoPoi[];
  className?: string;
  fitBounds?: boolean;
  cluster?: boolean;
};

export default function KakaoMap({
  center,
  pois = [],
  className = "w-full h-full",
  fitBounds = true,
  cluster = true,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    if (!mapRef.current) { console.warn("[KakaoMap] mapRef null"); return; }
    if (!window.kakao)   { console.warn("[KakaoMap] kakao not loaded"); return; }

    window.kakao.maps.load(() => {
      // 1) 지도 만들기
      const centerLL = new window.kakao.maps.LatLng(center.lat, center.lon);
      const map = new window.kakao.maps.Map(mapRef.current!, { center: centerLL, level: 4 });

      // 2) 마커
      const markers = (pois || []).map((p) => {
        const pos = new window.kakao.maps.LatLng(p.y, p.x); // 주의: y=위도, x=경도
        const m = new window.kakao.maps.Marker({ position: pos });
        m.setMap(map);
        return m;
      });

      // 3) 화면 맞추기
      if (fitBounds && markers.length) {
        const bounds = new window.kakao.maps.LatLngBounds();
        markers.forEach((m: any) => bounds.extend(m.getPosition()));
        map.setBounds(bounds);
      }

      // 4) 디버그
      console.log("[KakaoMap] center:", center, "markers:", markers.length);
    });
  }, [loaded, center.lat, center.lon, JSON.stringify(pois), fitBounds, cluster]);

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&autoload=false&libraries=services,clusterer`}
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
      />
      {/* min-h로 컨테이너 높이 보장 안 되면 지도 안 보임 */}
      <div ref={mapRef} className={`${className} min-h-[560px]`} />
    </>
  );
}
