import { useEffect, useRef, useState } from "react";

export default function ModalDemo(){
    const [open, setOpen] = useState(false);
    return (
        <div className="md">
            <button className="button tactile raised" onClick={()=>setOpen(true)}>Open Modal</button>
            {open && <Modal title="Example Modal" onClose={()=>setOpen(false)}>
                <p>This is a focus-trapped, accessible dialog. Press <kbd>Esc</kbd> to close.</p>
            </Modal>}
            <style>{`.md{ display:flex; justify-content:center }`}</style>
        </div>
    );
}

function Modal({ title, onClose, children }){
    const ref = useRef(null);

    // Close on ESC
    useEffect(()=>{
        const onKey = e => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    // Simple focus trap
    useEffect(()=>{
        const root = ref.current;
        if(!root) return;
        const focusables = root.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const first = focusables[0], last = focusables[focusables.length - 1];
        first?.focus();
        const handler = (e)=>{
            if(e.key !== "Tab") return;
            if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last?.focus(); }
            else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first?.focus(); }
        };
        root.addEventListener("keydown", handler);
        return ()=> root.removeEventListener("keydown", handler);
    }, []);

    return (
        <div className="backdrop" onClick={(e)=>{ if(e.target === e.currentTarget) onClose(); }}>
            <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="m-title" ref={ref}>
                <div className="dialog-head">
                    <h4 id="m-title">{title}</h4>
                    <button className="button tactile raised secondary" onClick={onClose}>Close</button>
                </div>
                <div className="dialog-body">{children}</div>
            </div>

            <style>{`
        .backdrop{
          position:fixed; inset:0; background:rgba(0,0,0,.45);
          display:flex; align-items:center; justify-content:center; z-index:50;
        }
        .dialog{
          width:min(520px, 92vw);
          background:var(--bg-soft); color:var(--text);
          border:1px solid var(--border); border-radius:14px; padding:1rem;
          box-shadow:0 25px 60px rgba(0,0,0,.45);
        }
        .dialog-head{ display:flex; align-items:center; justify-content:space-between; gap:.6rem; margin-bottom:.6rem }
        .dialog-body{ line-height:1.6 }
        kbd{
          font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          border:1px solid #ccc; border-bottom-width:2px; padding:.1rem .35rem; border-radius:.35rem; background:#fff;
        }
      `}</style>
        </div>
    );
}
