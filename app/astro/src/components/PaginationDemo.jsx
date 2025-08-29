import { useState } from "react";

export default function PaginationDemo(){
    const items = Array.from({length:42},(_,i)=>`Item ${i+1}`);
    const [page,setPage] = useState(1);
    const per=5;
    const total = Math.ceil(items.length/per);
    const slice = items.slice((page-1)*per, page*per);

    return (
        <div className="pg">
            <ul className="list">
                {slice.map(it=><li key={it}>{it}</li>)}
            </ul>
            <div className="nav">
                <button disabled={page===1} onClick={()=>setPage(p=>p-1)}>Prev</button>
                <span>Page {page}/{total}</span>
                <button disabled={page===total} onClick={()=>setPage(p=>p+1)}>Next</button>
            </div>

            <style>{`
        .list{ list-style:none; padding:0; margin:0 0 .6rem; color:#fff }
        .list li{ padding:.3rem 0; border-bottom:1px solid rgba(255,255,255,.3) }
        .nav{ display:flex; justify-content:space-between; align-items:center; }
        .nav button{
          padding:.3rem .7rem; border:0; border-radius:6px; background:#fff; color:#16a34a; font-weight:600;
        }
        .nav span{ color:#fff }
      `}</style>
        </div>
    );
}
