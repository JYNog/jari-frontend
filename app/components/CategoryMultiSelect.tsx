"use client";
import { useEffect, useRef, useState } from "react";

export type Cat = { code: string; name: string; emoji: string };

export default function CategoryMultiSelect({
  items,
  value,
  onChange,
  placeholder = "카테고리 선택",
}: {
  items: Cat[];
  value: string[];
  onChange: (codes: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const filtered = items.filter(
    (it) =>
      it.name.toLowerCase().includes(q.toLowerCase()) ||
      it.code.toLowerCase().includes(q.toLowerCase())
  );

  const toggle = (code: string) =>
    value.includes(code)
      ? onChange(value.filter((c) => c !== code))
      : onChange([...value, code]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="w-full flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-left shadow-sm hover:bg-gray-50"
        aria-expanded={open}
      >
        <div className="flex flex-wrap gap-2">
          {value.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            <>
              <span className="text-sm text-gray-600">
                선택됨: <b>{value.length}</b>
              </span>
              <div className="hidden md:flex gap-2">
                {value.slice(0, 3).map((code) => {
                  const it = items.find((i) => i.code === code)!;
                  return (
                    <span
                      key={code}
                      className="px-2 py-1 rounded-full border text-xs bg-white"
                      title={`${it.name} (${it.code})`}
                    >
                      {it.emoji} {it.name}
                    </span>
                  );
                })}
                {value.length > 3 && (
                  <span className="px-2 py-1 rounded-full border text-xs bg-white">
                    +{value.length - 3}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
        <span className="ml-4 text-gray-500">▾</span>
      </button>

      {open && (
        <div
          className="absolute z-20 mt-2 w-[min(36rem,90vw)] rounded-xl border bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-3 border-b">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="검색(이름/코드)"
              className="w-full rounded-lg border px-3 py-2 outline-none"
            />
          </div>
          <div className="max-h-72 overflow-auto p-2">
            {filtered.length === 0 && (
              <div className="py-6 text-center text-sm text-gray-500">검색 결과 없음</div>
            )}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {filtered.map((it) => {
                const checked = value.includes(it.code);
                return (
                  <li key={it.code}>
                    <button
                      onClick={() => toggle(it.code)}
                      className={[
                        "w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-left",
                        checked ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50",
                      ].join(" ")}
                    >
                      <span className="text-lg">{it.emoji}</span>
                      <div className="flex-1">
                        <div className="text-sm">{it.name}</div>
                        <div className="text-[11px] text-gray-500">{it.code}</div>
                      </div>
                      <input
                        type="checkbox"
                        readOnly
                        checked={checked}
                        className="accent-black"
                        aria-label={`${it.name} 선택`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex items-center justify-between p-2 border-t bg-gray-50 rounded-b-xl">
            <button
              onClick={() => onChange([])}
              className="text-sm text-gray-600 hover:text-black px-3 py-1.5"
            >
              전체 해제
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg bg-black px-4 py-2 text-white text-sm"
            >
              완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
