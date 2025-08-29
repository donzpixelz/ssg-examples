import { useEffect, useMemo, useRef, useState } from "react";

const DATA = [
    "Astro", "React", "Svelte", "Vue", "Solid", "Next.js", "Nuxt", "Remix",
    "Tailwind", "Vite", "Bun", "Deno", "TypeScript", "Zod", "Prisma", "Postgres",
];

export default function FilterList(){
    const [q, setQ] = useState("");
    const [liveQ, setLiveQ] = useState("");
    const id = useRef(0);

    // Debounce: update q 250ms after typing stops
    useEffect(()=>{
        const my = ++id.current;
        const t = setTimeout(()=> { if(my===id.current) setQ(liveQ.trim()); }, 250);
        return ()=> clearTimeout(t);
    }, [liveQ]);

    const results = useMemo(()=>{
        if(!q) return DATA;
        const norm = q.toLowerCase();
        return DATA.filter(x => x.toLowerCase().includes(norm));
    }, [q]);

    return (
        <div className="fl">
            <input
                className="search"
                placeholder="Search frameworks…"
                value={liveQ}
                onChange={e=>setLiveQ(e.target.value)}
            />
            <ul className="list" role="listbox" aria-label="Results">
                {results.length === 0 ? (
                    <li className="empty">No matches for “{q}”.</li>
                ) : results.map((item) => (
                    <li key={item} className="row">
                        {highlight(item, q)}
                    </li>
                ))}
            </ul>

            <style>{`
        .fl{ display:grid; gap:.6rem; color:#fff; max-width:520px; margin-inline:auto }
        .search{
          border:1px solid rgba(255,255,255,.9); border-radius:10px; padding:.5rem .75rem;
          background:transparent; color:#fff; width:100%;
        }
        .list{ margin:0; padding:0; list-style:none; display:grid; gap:.25rem }
        .row{ padding:.4rem .6rem; border-radius:8px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.25) }
        .match{ background:#fff; color:#3466cb; border-radius:4px; padding:0 .2em }
        .empty{ opacity:.9; padding:.4rem .6rem }
      `}</style>
        </div>
    );
}

function highlight(text, query){
    if(!query) return text;
    const i = text.toLowerCase().indexOf(query.toLowerCase());
    if(i === -1) return text;
    const a = text.slice(0, i);
    const b = text.slice(i, i + query.length);
    const c = text.slice(i + query.length);
    return <>{a}<span className="match">{b}</span>{c}</>;
}
