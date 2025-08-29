import { useState } from "react";

export default function ContactForm(){
    const [values, set] = useState({ name:"", email:"", message:"" });
    const [touched, setTouched] = useState({});
    const [sent, setSent] = useState(false);

    const errors = {
        name: !values.name ? "Required" : values.name.length < 2 ? "Too short" : "",
        email: !values.email
            ? "Required"
            : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)
                ? "Invalid email"
                : "",
        message: !values.message ? "Required" : values.message.length < 10 ? "Min 10 chars" : "",
    };
    const hasErrors = Object.values(errors).some(Boolean);

    function onChange(e){
        const {name, value} = e.target;
        set(v => ({...v, [name]: value}));
    }
    function onBlur(e){
        setTouched(t => ({...t, [e.target.name]: true}));
    }
    function onSubmit(e){
        e.preventDefault();
        setTouched({name:true, email:true, message:true});
        if(hasErrors) return;
        // simulate submit
        setTimeout(()=> setSent(true), 400);
    }

    if(sent){
        return (
            <div className="cf-success">
                <p><strong>Thanks!</strong> Your message has been sent.</p>
                <button className="button tactile raised" onClick={()=>{ set({name:"",email:"",message:""}); setTouched({}); setSent(false); }}>
                    Send another
                </button>
                <style>{`.cf-success{ color:#fff; text-align:center; display:grid; gap:.8rem }`}</style>
            </div>
        );
    }

    return (
        <form className="cf" onSubmit={onSubmit} noValidate>
            <label>
                Name
                <input name="name" value={values.name} onChange={onChange} onBlur={onBlur} />
                {touched.name && errors.name && <span className="err">{errors.name}</span>}
            </label>
            <label>
                Email
                <input name="email" value={values.email} onChange={onChange} onBlur={onBlur} />
                {touched.email && errors.email && <span className="err">{errors.email}</span>}
            </label>
            <label>
                Message
                <textarea name="message" rows={4} value={values.message} onChange={onChange} onBlur={onBlur} />
                {touched.message && errors.message && <span className="err">{errors.message}</span>}
            </label>
            <div className="row">
                <button className="button tactile raised" type="submit" disabled={hasErrors}>Send</button>
                <button className="button tactile raised secondary" type="button" onClick={() => { set({name:"",email:"",message:""}); setTouched({}); }}>Reset</button>
            </div>

            <style>{`
        .cf{ color:#fff; display:grid; gap:.7rem; max-width:520px; margin-inline:auto }
        .cf label{ display:grid; gap:.35rem; font-weight:600 }
        .cf input, .cf textarea{
          border:1px solid rgba(255,255,255,.9); border-radius:10px; padding:.5rem .75rem;
          background:transparent; color:#fff; width:100%;
        }
        .row{ display:grid; grid-template-columns:1fr 1fr; gap:.6rem }
        .err{ color:#ffe1e1; font-size:.9rem }
        button[disabled]{ opacity:.6; cursor:not-allowed }
      `}</style>
        </form>
    );
}
