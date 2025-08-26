"use client";

import { useEffect, useRef, useState } from "react";

type SuggestItem = {
  type: "place" | "address";
  label: string;
  address?: string;
  x: number; // 경도
  y: number; // 위도
  category?: string;
};

type Props = {
  value: string;
  onChange: (v: string) => void;
  onPick: (item: SuggestItem) => void; // 선택 시 좌표 전달
  apiBase?: string;
};

export default function SearchAutocomplete({
  value, onChange, onPick, apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"
}: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SuggestItem[]>([]);
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!value.trim()) { setItems([]); setOpen(false); return; }
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`${apiBase}/kakao/suggest?q=${encodeURIComponent(value)}&size=8`);
        if (!res.ok) return;
        const json = await res.json();
        setItems(json.items || []);
        setOpen(true);
      } catch { /* noop */ }
    }, 250); // 디바운스 250ms
  }, [value, apiBase]);

  return (
    <div className="relative w-full">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => { if (items.length) setOpen(true); }}
        className="w-full border rounded px-3 py-2"
        placeholder="예: 은하수아파트, 서울역, 서울 강남구 테헤란로 231"
      />
      {open && items.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow">
          {items.map((it, i) => (
            <button
              key={i}
              className="w-full text-left px-3 py-2 hover:bg-gray-50"
              onClick={() => { onPick(it); setOpen(false); }}
            >
              <div className="text-sm font-medium">{it.label}</div>
              <div className="text-xs text-gray-500">{it.address || it.category}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
