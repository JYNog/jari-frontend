"use client";
import { useState } from "react";

export default function SearchBar({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const [local, setLocal] = useState(value);
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-white shadow-sm px-4 py-3">
      <input
        className="flex-1 outline-none text-base md:text-lg py-2 px-2"
        placeholder="예: 강남, 서울시청, 판교, 여의도동"
        value={local}
        onChange={(e) => {
          setLocal(e.target.value);
          onChange(e.target.value);
        }}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
      />
      <button
        className="shrink-0 px-5 py-3 rounded-xl bg-black text-white text-sm md:text-base"
        onClick={onSubmit}
      >
        검색
      </button>
    </div>
  );
}
