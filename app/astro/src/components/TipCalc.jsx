import { useMemo, useState } from "react";

export default function TipCalc(){
    const [bill, setBill] = useState(42.00);
    const [pct, setPct] = useState(18);
    const [split, setSplit] = useState(2);

    const {tip,total,per} = useMemo(()=>{
        const t = +(bill * pct / 100).toFixed(2);
        const sum = +(bill + t).toFixed(2);
        const each = +(sum / Math.max(1,split)).toFixed(2);
        return {tip:t, total:sum, per:each};
    },[bill,pct,split]);

    return (
        <div className="tip">
            <div className="tip-grid">
                <label>Bill
                    <input inputMode="decimal" value={bill} onChange={e=>setBill(parseFloat(e.target.value||0))}/>
                </label>
                <label>Tip %
                    <input type="number" min="0" max="100" value={pct} onChange={e=>setPct(+e.target.value||0)}/>
                </label>
                <label>Split
                    <input type="number" min="1" max="20" value={split} onChange={e=>setSplit(+e.target.value||1)}/>
                </label>
            </div>

            <div className="tip-out">
                <div><strong>Tip:</strong> ${tip.toFixed(2)}</div>
                <div><strong>Total:</strong> ${total.toFixed(2)}</div>
                <div><strong>Per person:</strong> ${per.toFixed(2)}</div>
            </div>

            <style>{`
        .tip{ display:flex; flex-direction:column; gap:.7rem; color:#fff }
        .tip-grid{ display:grid; grid-template-columns:repeat(3, 1fr); gap:.6rem }
        .tip-grid label{ display:flex; flex-direction:column; gap:.25rem; font-weight:600 }
        .tip-grid input{
          border:1px solid rgba(255,255,255,.9); border-radius:10px; padding:.35rem .5rem;
          background:transparent; color:#fff; width:100%;
        }
        .tip-out{
          display:grid; grid-template-columns:repeat(3,1fr); gap:.6rem;
          background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.6); border-radius:10px; padding:.5rem .8rem;
        }
      `}</style>
        </div>
    );
}
