import { useEffect, useRef, useState } from "react";

export default function Stopwatch(){
    const [running, setRunning] = useState(false);
    const [elapsed, setElapsed] = useState(0); // ms
    const [laps, setLaps] = useState([]);
    const startRef = useRef(0);
    useEffect(()=>{
        let id;
        if(running){
            startRef.current = performance.now() - elapsed;
            id = requestAnimationFrame(tick);
        }
        function tick(now){
            setElapsed(now - startRef.current);
            id = requestAnimationFrame(tick);
        }
        return ()=> id && cancelAnimationFrame(id);
    },[running]);

    const format = (ms)=>{
        const t = Math.max(0, Math.floor(ms/10)); // 1/100s
        const cs = t % 100;
        const s = Math.floor(t/100)%60;
        const m = Math.floor(t/6000);
        const pad = (n,w=2)=>String(n).padStart(w,'0');
        return `${pad(m)}:${pad(s)}.${pad(cs)}`;
    };

    return (
        <div className="sw">
            <div className="sw-time">{format(elapsed)}</div>
            <div className="sw-row">
                <button className="button tactile raised" onClick={()=>setRunning(v=>!v)}>
                    {running? "Pause" : "Start"}
                </button>
                <button className="button tactile raised" onClick={()=>{
                    if(!running && elapsed===0) return;
                    setLaps(l=>[elapsed, ...l].slice(0,5));
                }}>Lap</button>
                <button className="button tactile raised secondary" onClick={()=>{
                    setRunning(false); setElapsed(0); setLaps([]);
                }}>Reset</button>
            </div>
            {laps.length>0 && (
                <ol className="sw-laps">
                    {laps.map((t,i)=>(<li key={i}>#{laps.length-i}: {format(t)}</li>))}
                </ol>
            )}

            <style>{`
        .sw{ display:flex; flex-direction:column; align-items:center; gap:.6rem }
        .sw-time{
          font-weight:800; color:#fff; text-align:center;
          font-size: clamp(1.8rem, 4.6vw, 2.4rem);
          padding:.4rem .9rem; border:2px solid #fff; border-radius:12px;
          box-shadow: inset 0 0 0 3px rgba(255,255,255,.18), 0 6px 18px rgba(0,0,0,.18);
          min-width: 10ch;
        }
        .sw-row{ display:grid; grid-template-columns:repeat(3,1fr); gap:.6rem; width:100%; max-width:22rem }
        .sw-laps{ margin:.3rem 0 0; padding:0; list-style:none; color:#fff; opacity:.9; font-variant-numeric:tabular-nums }
        .sw-laps li{ padding:.15rem 0; border-bottom:1px dashed rgba(255,255,255,.35) }
        .sw-laps li:last-child{ border-bottom:0 }
      `}</style>
        </div>
    );
}
