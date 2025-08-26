"use client";

export default function RadiusSlider({
  value,
  onChange,
  min = 100,
  max = 1000,
  step = 50,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number; max?: number; step?: number;
}) {
  return (
    <div>
      <label className="text-sm text-gray-600">
        검색 반경: <b className="text-black">{value}m</b>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full mt-2 h-2 accent-black"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}m</span>
        <span>{(min+max)/2|0}m</span>
        <span>{max}m</span>
      </div>
    </div>
  );
}
