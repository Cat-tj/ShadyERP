"use client";

import { useEffect, useRef } from "react";
import type { ShowcaseDefinition } from "./types";

export function BusinessTabs({ items, activeKey, onChange }: { items: ShowcaseDefinition[]; activeKey: string; onChange: (key: ShowcaseDefinition["key"]) => void }) {
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const activeIndex = items.findIndex((item) => item.key === activeKey);

  useEffect(() => { refs.current.get(activeKey)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" }); }, [activeKey]);

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!items.length) return;
    let next = activeIndex;
    if (event.key === "ArrowRight") next = (activeIndex + 1) % items.length;
    else if (event.key === "ArrowLeft") next = (activeIndex - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else return;
    event.preventDefault();
    const item = items[next];
    onChange(item.key);
    refs.current.get(item.key)?.focus();
  }

  return <div className="bs-tabs-wrap"><div className="bs-tabs" role="tablist" aria-label="Pilih jenis bisnis">{items.map((item) => <button key={item.key} ref={(node) => { if (node) refs.current.set(item.key, node); }} id={`showcase-tab-${item.key}`} type="button" role="tab" aria-selected={item.key === activeKey} aria-controls={`showcase-panel-${item.key}`} tabIndex={item.key === activeKey ? 0 : -1} className={item.key === activeKey ? "is-active" : ""} onClick={() => onChange(item.key)} onKeyDown={onKeyDown}>{item.label}</button>)}</div></div>;
}
