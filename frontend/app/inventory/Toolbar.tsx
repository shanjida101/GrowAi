"use client";
import FancySelect from "@/components/ui/Select";
import { useState } from "react";
import { Search } from "lucide-react";

export type InvFilters = { q:string; category:string; stock:string; sort:string };

export default function InventoryToolbar({ categories, onChange }:{
  categories:string[]; onChange:(f:InvFilters)=>void;
}) {
  const [f,setF]=useState<InvFilters>({q:"",category:"all",stock:"all",sort:"name"});
  function update(p:Partial<InvFilters>){
    const next={...f,...p}; setF(next); onChange(next);
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-base-mute"/>
        <input value={f.q} onChange={e=>update({q:e.target.value})}
          placeholder="Search SKU or name…" 
          className="h-10 w-64 rounded-xl bg-white/6 pl-9 pr-3 text-sm border border-base-border outline-none focus:ring-2 focus:ring-white/10"/>
      </div>
      <FancySelect value={f.category} onChange={v=>update({category:v})}
        options={[{value:"all",label:"All categories"}, ...categories.map(c=>({value:c,label:c}))]} />
      <FancySelect value={f.stock} onChange={v=>update({stock:v})}
        options={[{value:"all",label:"Any stock"},{value:"low",label:"Low stock"},{value:"ok",label:"Sufficient"}]} />
      <FancySelect value={f.sort} onChange={v=>update({sort:v})}
        options={[{value:"name",label:"Sort: Name"},{value:"stock",label:"Sort: Stock"},{value:"price",label:"Sort: Price"}]} />
    </div>
  );
}
