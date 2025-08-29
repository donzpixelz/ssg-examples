import { useState } from "react";

export default function TabsDemo(){
    const [tab,setTab] = useState("one");
    return (
        <div className="tabs">
            <div className="tablist">
                {["one","two","three"].map(t=>(
                    <button key={t} className={tab===t?"active":""} onClick={()=>setTab(t)}>
                        Tab {t}
                    </button>
                ))}
            </div>
            <div className="panel">
                {tab==="one" && <p>This is content for Tab One.</p>}
                {tab==="two" && <p>This is content for Tab Two.</p>}
                {tab==="three" && <p>This is content for Tab Three.</p>}
            </div>

            <style>{`
        .tablist{ display:flex; gap:.5rem; margin-bottom:.6rem }
        .tablist button{
          flex:1; padding:.4rem .6rem; border:0; border-radius:6px;
          cursor:pointer; background:rgba(255,255,255,.15); color:#fff;
        }
        .tablist button.active{ background:#fff; color:#16a34a; font-weight:700 }
        .panel{ background:rgba(255,255,255,.1); border-radius:6px; padding:.8rem }
      `}</style>
        </div>
    );
}
