import { useEffect, useState } from "react";

export default function ToastDemo(){
    const [toasts,setToasts] = useState([]);
    function addToast(msg){
        const id = Date.now();
        setToasts([...toasts,{id,msg}]);
        setTimeout(()=> setToasts(t=>t.filter(x=>x.id!==id)),3000);
    }
    return (
        <div className="toast-demo">
            <button className="button tactile raised" onClick={()=>addToast("Saved successfully!")}>
                Show Toast
            </button>
            <div className="toast-stack">
                {toasts.map(t=><div key={t.id} className="toast">{t.msg}</div>)}
            </div>

            <style>{`
        .toast-stack{
          position:fixed; bottom:1rem; right:1rem;
          display:grid; gap:.5rem; z-index:100;
        }
        .toast{
          background:#fff; color:#16a34a; font-weight:600;
          padding:.6rem 1rem; border-radius:8px;
          box-shadow:0 4px 12px rgba(0,0,0,.25);
        }
      `}</style>
        </div>
    );
}
