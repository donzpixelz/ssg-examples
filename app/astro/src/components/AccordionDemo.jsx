import { useState } from "react";

export default function AccordionDemo(){
    const [open,setOpen] = useState(null);
    const items = [
        {q:"What is Astro?", a:"Astro is a content-first web framework."},
        {q:"What is React?", a:"React is a JavaScript library for building UIs."},
        {q:"What is Vite?", a:"Vite is a fast build tool and dev server."},
    ];
    return (
        <div className="acc">
            {items.map((it,i)=>(
                <div key={i} className="item">
                    <button className="q" onClick={()=>setOpen(o=>o===i?null:i)}>{it.q}</button>
                    {open===i && <div className="a">{it.a}</div>}
                </div>
            ))}
            <style>{`
        .item{ border-bottom:1px solid rgba(255,255,255,.3); }
        .q{
          display:block; width:100%; text-align:left; padding:.5rem; cursor:pointer;
          background:none; border:0; color:#fff; font-weight:600;
        }
        .a{ padding:.5rem; background:rgba(255,255,255,.1); }
      `}</style>
        </div>
    );
}
