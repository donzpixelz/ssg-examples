import { useEffect, useRef, useState } from "react";

export default function Pomodoro(){
    const [work, setWork] = useState(25);
    const [breakMins, setBreak] = useState(5);
    const [phase, setPhase] = useState("work"); // work|break|idle
    const [seconds, setSeconds] = useState(work*60);
    const [running, setRunning] = useState(false);
    const timerRef = useRef(null);

    useEffect(()=>{ if(phase==="work") setSeconds(work*60); },[work, phase]);
    useEffect(()=>{ if(phase==="break") setSeconds(breakMins*60); },[breakMins, phase]);

    useEffect(()=>{
        if(!running) return;
        timerRef.current = setInterval(()=> setSeconds(s=>{
            if(s>1) return s-1;
            // phase complete
            const next = phase==="work" ? "break" : "work";
            setPhase(next);
            return next==="work" ? work*60 : breakMins*60;
        }),1000);
        return ()=> clearInterval(timerRef.current);
    },[running, phase, work, breakMins]);

    const mm = String(Math.floor(seconds/60)).padStart(2,"0");
    const ss = String(seconds%60).padStart(2,"0");

    return (
        <div className="pomo">
            <div className="pomo-time" data-phase={phase}>{mm}:{ss}</div>

            <div className="pomo-rows">
                <label>Work
                    <input type="number" min="1" max="60" value={work} onChange={e=>setWork(+e.target.value||1)} />
                    min
                </label>
                <label>Break
                    <input type="number" min="1" max="30" value={breakMins} onChange={e=>setBreak(+e.target.value||1)} />
                    min
                </label>
            </div>

            <div className="pomo-actions">
                <button className="button tactile raised" onClick={()=>setRunning(r=>!r)}>{running?"Pause":"Start"}</button>
                <button className="button tactile raised secondary" onClick={()=>{
                    setRunning(false); setPhase("idle"); setSeconds(work*60);
                }}>Reset</button>
            </div>

            <style>{`
        .pomo{ display:flex; flex-direction:column; align-items:center; gap:.6rem }
        .pomo-time{
          font-weight:800; color:#fff; text-align:center; font-variant-numeric:tabular-nums;
          font-size: clamp(2rem, 5vw, 2.6rem);
          padding:.5rem 1rem; border:2px solid #fff; border-radius:12px;
          box-shadow: inset 0 0 0 3px rgba(255,255,255,.18), 0 6px 18px rgba(0,0,0,.18);
          min-width: 8ch;
        }
        .pomo-time[data-phase="work"]{ box-shadow: inset 0 0 0 3px rgba(255,255,255,.18), 0 0 0 3px rgba(255,255,255,.15), 0 8px 18px rgba(0,0,0,.18) }
        .pomo-rows{ display:flex; gap:.8rem; color:#fff; opacity:.95 }
        .pomo-rows label{ display:flex; align-items:center; gap:.35rem }
        .pomo-rows input{ width:4rem; padding:.25rem .4rem; border-radius:8px; border:1px solid rgba(255,255,255,.9); background:transparent; color:#fff }
        .pomo-actions{ display:grid; grid-template-columns:1fr 1fr; gap:.6rem; width:100%; max-width:22rem }
      `}</style>
        </div>
    );
}
