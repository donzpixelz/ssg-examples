import { useMemo, useState } from "react";

const rows = [
    { name: "Astro",     type: "SSG",     stars: 40_000 },
    { name: "Next.js",   type: "SSR/SSG", stars: 120_000 },
    { name: "SvelteKit", type: "SSR/SSG", stars: 20_000 },
    { name: "Remix",     type: "SSR",     stars: 25_000 },
    { name: "Nuxt",      type: "SSR/SSG", stars: 50_000 },
];

export default function SortableTableDemo(){
    const [sort, setSort] = useState({ key: "name", dir: "asc" }); // dir: asc|desc

    const onSort = (key) => {
        setSort(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
    };

    const data = useMemo(()=>{
        const copy = rows.slice();
        const {key, dir} = sort;
        copy.sort((a,b)=>{
            const va = a[key], vb = b[key];
            if(va === vb) return 0;
            const res = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb));
            return dir === "asc" ? res : -res;
        });
        return copy;
    }, [sort]);

    return (
        <div className="tbl-wrap">
            <table className="tbl">
                <thead>
                <tr>
                    <Th label="Name"   sortKey="name"  sort={sort} onSort={onSort} />
                    <Th label="Type"   sortKey="type"  sort={sort} onSort={onSort} />
                    <Th label="Stars"  sortKey="stars" sort={sort} onSort={onSort} align="right" />
                </tr>
                </thead>
                <tbody>
                {data.map(r=>(
                    <tr key={r.name}>
                        <td>{r.name}</td>
                        <td>{r.type}</td>
                        <td className="num">{r.stars.toLocaleString()}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <style>{`
        .tbl-wrap{ max-width:620px; margin-inline:auto; width:100% }
        .tbl{ width:100%; border-collapse:collapse; color:#fff }
        thead th{
          text-align:left; font-weight:700; padding:.5rem .6rem; cursor:pointer;
          border-bottom:2px solid rgba(255,255,255,.4); user-select:none;
        }
        thead th.right{ text-align:right }
        tbody td{ padding:.5rem .6rem; border-bottom:1px solid rgba(255,255,255,.22) }
        tbody td.num{ text-align:right; font-variant-numeric:tabular-nums }
        thead th .arrow{ margin-left:.3rem; opacity:.9 }
        tr:hover td{ background:rgba(255,255,255,.06) }
      `}</style>
        </div>
    );
}

function Th({ label, sortKey, sort, onSort, align }){
    const active = sort.key === sortKey;
    const arrow = active ? (sort.dir === "asc" ? "▲" : "▼") : "▵";
    return (
        <th onClick={()=>onSort(sortKey)} className={align === "right" ? "right" : undefined}>
            {label} <span className="arrow" aria-hidden="true">{arrow}</span>
            {active && <span className="sr-only"> (sorted {sort.dir})</span>}
        </th>
    );
}
