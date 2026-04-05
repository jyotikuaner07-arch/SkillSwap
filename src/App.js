/**
 * SkillSwap - Student Skill Exchange Platform
 * ─────────────────────────────────────────────
 * Frontend  → React JS (Components, State, Props, JSX, Hooks)
 * Styling   → Bootstrap 5 + Custom CSS3
 * Logic     → JavaScript ES6+
 * Backend   → Node.js + Express  (http://localhost:5000)
 * Database  → MongoDB + Mongoose (via backend API calls)
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ════════════════════════════════════════════════════════════
//  API SERVICE LAYER
//  All fetch() calls to Node.js backend → MongoDB
//  Replace localStorage with real HTTP requests
// ════════════════════════════════════════════════════════════
const API_BASE = "http://localhost:5000/api";

// Helper: get JWT token saved after login
const getToken = () => localStorage.getItem("ss_token");

// Helper: standard headers for all API requests
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── API Object: mirrors Express routes in server.js ──
const API = {

  // POST /api/auth/signup → Node.js → MongoDB User.create()
  signup: async (name, email, department, password) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, department, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data; // returns user + token
  },

  // POST /api/auth/login → Node.js → MongoDB User.findOne() + bcrypt
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data; // returns user + token
  },

  // GET /api/users → Node.js → MongoDB User.find()
  getAllUsers: async () => {
    const res = await fetch(`${API_BASE}/users`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  // GET /api/users/me → Node.js → MongoDB User.findById() (JWT protected)
  getMe: async () => {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  // PUT /api/users/skills → Node.js → MongoDB $addToSet / $pull
  updateSkill: async (type, skill, action) => {
    const res = await fetch(`${API_BASE}/users/skills`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ type, skill, action }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data; // returns updated user from MongoDB
  },

  // GET /api/users/matches → Node.js → MongoDB + matching algorithm
  getMatches: async () => {
    const res = await fetch(`${API_BASE}/users/matches`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },
};

// ── Token storage helpers ──
const saveSession  = (token) => localStorage.setItem("ss_token", token);
const clearSession = () => localStorage.removeItem("ss_token");

// ── Utility ──
const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
};
const getInitials = (name) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2);


// ════════════════════════════════════════════════════════════
//  GLOBAL CSS STYLES
// ════════════════════════════════════════════════════════════
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');
    :root {
      --primary:#4f46e5; --primary-dark:#3730a3; --primary-light:#818cf8;
      --accent:#f59e0b; --green:#10b981; --red:#ef4444;
      --bg:#f8f7ff; --bg-alt:#eef2ff; --card:#ffffff;
      --text:#1e1b4b; --muted:#6b7280; --border:#e0e7ff;
      --shadow:0 4px 24px rgba(79,70,229,0.10);
      --shadow-lg:0 8px 40px rgba(79,70,229,0.18);
      --radius:16px; --radius-sm:10px;
      --font-head:'Syne',sans-serif; --font-body:'DM Sans',sans-serif;
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html{scroll-behavior:smooth;}
    body{font-family:var(--font-body);background:var(--bg);color:var(--text);overflow-x:hidden;}
    h1,h2,h3,h4,h5,h6{font-family:var(--font-head);}
    .brand{font-family:var(--font-head);font-size:1.5rem;font-weight:800;color:var(--primary);letter-spacing:-0.5px;}
    .brand-chip{background:var(--primary);color:#fff;border-radius:8px;padding:2px 8px;margin-right:4px;font-size:.95rem;}
    .navbar-ss{background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:999;}
    .nav-link-ss{color:var(--text)!important;font-weight:500;text-decoration:none;padding:6px 4px;border-bottom:2px solid transparent;transition:all .2s;cursor:pointer;}
    .nav-link-ss:hover,.nav-link-ss.active{color:var(--primary)!important;border-bottom-color:var(--primary);}
    .hero-section{background:linear-gradient(135deg,#f8f7ff 0%,#eef2ff 60%,#e0e7ff 100%);padding:70px 0 90px;position:relative;overflow:hidden;}
    .hero-section::before{content:'';position:absolute;top:-80px;right:-80px;width:420px;height:420px;background:radial-gradient(circle,rgba(79,70,229,.12) 0%,transparent 70%);border-radius:50%;pointer-events:none;}
    .hero-title{font-size:clamp(2.2rem,5vw,3.5rem);font-weight:800;line-height:1.15;}
    .highlight{color:var(--primary);position:relative;}
    .highlight::after{content:'';position:absolute;bottom:2px;left:0;width:100%;height:4px;background:var(--accent);border-radius:4px;opacity:.6;}
    .section-title{font-size:clamp(1.7rem,3vw,2.4rem);font-weight:800;}
    .section-alt{background:var(--bg-alt);}
    .badge-pill{display:inline-block;background:var(--primary);color:#fff;padding:6px 16px;border-radius:30px;font-size:.82rem;font-weight:600;margin-bottom:16px;}
    .hero-stats strong{font-family:var(--font-head);font-size:1.6rem;font-weight:800;color:var(--primary);display:block;}
    .hero-stats span{font-size:.78rem;color:var(--muted);font-weight:500;}
    .float-card{background:#fff;border-radius:var(--radius);padding:14px 18px;display:flex;align-items:center;gap:12px;box-shadow:var(--shadow-lg);border:1px solid var(--border);position:absolute;}
    .skill-name{font-family:var(--font-head);font-weight:700;font-size:1rem;}
    .skill-type{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;}
    .teach-type{color:var(--green);} .learn-type{color:var(--accent);}
    .swap-orb{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:52px;height:52px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:800;box-shadow:0 4px 20px rgba(79,70,229,.4);z-index:10;animation:pulse 2s ease-in-out infinite;}
    .step-card{background:var(--card);border-radius:var(--radius);padding:36px 28px;border:1px solid var(--border);box-shadow:var(--shadow);transition:transform .25s,box-shadow .25s;height:100%;text-align:center;}
    .step-card:hover{transform:translateY(-6px);box-shadow:var(--shadow-lg);}
    .step-card.featured{background:var(--primary);color:#fff;}
    .step-card.featured p{color:rgba(255,255,255,.8);}
    .step-num{font-size:3rem;font-weight:800;color:var(--primary-light);line-height:1;margin-bottom:8px;font-family:var(--font-head);}
    .step-card.featured .step-num{color:rgba(255,255,255,.25);}
    .skill-form-card{background:var(--card);border-radius:var(--radius);padding:28px;box-shadow:var(--shadow);border-top:4px solid;height:100%;}
    .teach-card{border-top-color:var(--green);} .learn-card{border-top-color:var(--accent);}
    .skill-tag{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;font-size:.82rem;font-weight:600;margin:3px;}
    .teach-tag{background:rgba(16,185,129,.12);color:#059669;border:1px solid rgba(16,185,129,.3);}
    .learn-tag{background:rgba(245,158,11,.12);color:#d97706;border:1px solid rgba(245,158,11,.3);}
    .tag-x{cursor:pointer;opacity:.6;margin-left:2px;} .tag-x:hover{opacity:1;color:var(--red);}
    .browse-card{background:var(--card);border-radius:var(--radius);padding:20px;border:1px solid var(--border);box-shadow:var(--shadow);transition:transform .2s,box-shadow .2s;height:100%;}
    .browse-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg);}
    .avatar{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-head);font-weight:700;font-size:1rem;color:#fff;flex-shrink:0;}
    .browse-badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:.75rem;font-weight:600;margin:2px;}
    .badge-teach{background:rgba(16,185,129,.12);color:#059669;border:1px solid rgba(16,185,129,.25);}
    .badge-learn{background:rgba(245,158,11,.12);color:#d97706;border:1px solid rgba(245,158,11,.25);}
    .badge-type-label{font-size:.68rem;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);font-weight:700;margin-bottom:3px;}
    .match-card{background:var(--card);border-radius:var(--radius);padding:22px;border:2px solid var(--primary-light);box-shadow:0 4px 20px rgba(79,70,229,.1);display:flex;align-items:flex-start;gap:16px;transition:transform .2s;}
    .match-card:hover{transform:translateY(-3px);}
    .match-score{font-family:var(--font-head);font-size:1.5rem;font-weight:800;color:var(--primary);line-height:1;text-align:center;min-width:44px;}
    .match-score small{font-size:.6rem;font-family:var(--font-body);color:var(--muted);display:block;font-weight:600;}
    .input-ss{width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font-body);font-size:.95rem;color:var(--text);background:#fff;outline:none;transition:border-color .2s,box-shadow .2s;}
    .input-ss:focus{border-color:var(--primary-light);box-shadow:0 0 0 3px rgba(79,70,229,.1);}
    .input-ss::placeholder{color:#c4c4d4;}
    select.input-ss{cursor:pointer;}
    .modal-overlay{position:fixed;inset:0;background:rgba(15,12,41,.55);backdrop-filter:blur(4px);z-index:2000;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn .2s ease;}
    .modal-box{background:#fff;border-radius:var(--radius);padding:32px;width:100%;max-width:460px;box-shadow:var(--shadow-lg);animation:slideUp .25s ease;max-height:90vh;overflow-y:auto;}
    .modal-title-ss{font-family:var(--font-head);font-size:1.35rem;font-weight:700;margin-bottom:20px;}
    .modal-close{position:absolute;top:20px;right:20px;background:none;border:none;font-size:1.2rem;cursor:pointer;color:var(--muted);}
    .modal-close:hover{color:var(--red);}
    .input-group-ss{margin-bottom:16px;}
    .input-group-ss label{font-size:.85rem;font-weight:600;color:var(--text);display:block;margin-bottom:6px;}
    .err-msg{background:rgba(239,68,68,.1);color:var(--red);padding:10px 14px;border-radius:var(--radius-sm);font-size:.85rem;margin-bottom:14px;border:1px solid rgba(239,68,68,.2);}
    .chat-box{background:#f3f4f9;border-radius:var(--radius-sm);height:320px;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;}
    .chat-row-mine{display:flex;flex-direction:column;align-items:flex-end;}
    .chat-row-theirs{display:flex;flex-direction:column;align-items:flex-start;}
    .bubble{max-width:78%;padding:10px 14px;border-radius:18px;font-size:.88rem;line-height:1.55;word-break:break-word;}
    .bubble-mine{background:var(--primary);color:#fff;border-bottom-right-radius:4px;}
    .bubble-theirs{background:#fff;color:var(--text);border:1px solid var(--border);border-bottom-left-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.05);}
    .chat-time{font-size:.65rem;color:#9ca3af;margin-top:2px;padding:0 4px;}
    .typing-dot{width:7px;height:7px;border-radius:50%;background:#9ca3af;display:inline-block;animation:bounce 1s ease-in-out infinite;}
    .typing-dot:nth-child(2){animation-delay:.15s;} .typing-dot:nth-child(3){animation-delay:.3s;}
    .chat-input-wrap{display:flex;gap:8px;margin-top:10px;align-items:center;}
    .chat-input-field{flex:1;padding:10px 18px;border:1.5px solid var(--border);border-radius:24px;font-family:var(--font-body);outline:none;transition:border-color .2s;}
    .chat-input-field:focus{border-color:var(--primary-light);}
    .btn-ss-primary{background:var(--primary);color:#fff;border:none;border-radius:var(--radius-sm);padding:10px 24px;font-family:var(--font-head);font-weight:600;font-size:.95rem;cursor:pointer;transition:all .2s;}
    .btn-ss-primary:hover{background:var(--primary-dark);transform:translateY(-1px);box-shadow:0 4px 12px rgba(79,70,229,.3);}
    .btn-ss-outline{background:transparent;color:var(--primary);border:1.5px solid var(--primary);border-radius:var(--radius-sm);padding:9px 22px;font-family:var(--font-head);font-weight:600;cursor:pointer;transition:all .2s;}
    .btn-ss-outline:hover{background:var(--primary);color:#fff;}
    .btn-ss-sm{padding:6px 14px;font-size:.82rem;}
    .btn-ss-danger{background:var(--red);color:#fff;border:none;border-radius:var(--radius-sm);padding:6px 14px;font-size:.82rem;cursor:pointer;}
    .btn-ss-danger:hover{background:#dc2626;}
    .btn-ss-green{background:var(--green);color:#fff;border:none;border-radius:var(--radius-sm);padding:10px 20px;font-weight:600;cursor:pointer;}
    .btn-icon{width:40px;height:40px;border-radius:50%;background:var(--primary);color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
    .btn-icon:hover{background:var(--primary-dark);}
    .empty-state{text-align:center;padding:48px 20px;}
    .empty-icon{font-size:3.5rem;margin-bottom:14px;}
    .toast-ss{position:fixed;bottom:24px;right:24px;background:var(--primary);color:#fff;padding:14px 22px;border-radius:var(--radius-sm);font-size:.9rem;font-weight:500;z-index:9999;box-shadow:var(--shadow-lg);animation:slideUp .3s ease;max-width:320px;}
    .toast-ss.toast-green{background:var(--green);} .toast-ss.toast-red{background:var(--red);}
    .footer-ss{background:#1e1b4b;color:rgba(255,255,255,.7);padding:36px 0;text-align:center;}
    .footer-brand{font-family:var(--font-head);font-size:1.5rem;font-weight:800;color:#fff;}
    .loading-spin{display:inline-block;width:20px;height:20px;border:3px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;}
    @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes slideUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
    @keyframes pulse{0%,100%{box-shadow:0 4px 16px rgba(79,70,229,.35);}50%{box-shadow:0 4px 28px rgba(79,70,229,.65);}}
    @keyframes bounce{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-6px);}}
    @keyframes fadeInUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
    @keyframes spin{to{transform:rotate(360deg);}}
    .anim-fadeup{animation:fadeInUp .6s ease both;}
    .anim-delay1{animation-delay:.1s;} .anim-delay2{animation-delay:.2s;} .anim-delay3{animation-delay:.35s;}
    @media(max-width:768px){.float-stack{display:none!important;}}
  `}</style>
);


// ════════════════════════════════════════════════════════════
//  REUSABLE COMPONENTS
// ════════════════════════════════════════════════════════════

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [msg]);
  return <div className={`toast-ss ${type==="green"?"toast-green":type==="red"?"toast-red":""}`}>{msg}</div>;
}

function Modal({ children, onClose, size }) {
  useEffect(() => { document.body.style.overflow="hidden"; return ()=>{ document.body.style.overflow=""; }; }, []);
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={`modal-box ${size==="lg"?"modal-box-lg":""}`} style={{position:"relative"}}>
        <button className="modal-close" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}

// ── Login Modal — calls POST /api/auth/login (Node.js → MongoDB) ──
function LoginModal({ onClose, onLogin, onSwitchSignup }) {
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErr(""); setLoading(true);
    try {
      // ── Real API Call → Node.js → MongoDB ──
      const data = await API.login(email, password);
      saveSession(data.token);   // save JWT to localStorage
      onLogin(data);
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  // fix: use pass not password
  const handleLoginFixed = async () => {
    setErr(""); setLoading(true);
    try {
      const data = await API.login(email, pass);
      saveSession(data.token);
      onLogin(data);
      onClose();
    } catch (e) { setErr(e.message); } finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose}>
      <h5 className="modal-title-ss">Welcome Back 👋</h5>
      {err && <div className="err-msg">{err}</div>}
      <div className="input-group-ss">
        <label>Email</label>
        <input className="input-ss" type="email" placeholder="student@college.edu"
          value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLoginFixed()} />
      </div>
      <div className="input-group-ss">
        <label>Password</label>
        <input className="input-ss" type="password" placeholder="••••••••"
          value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLoginFixed()} />
      </div>
      <button className="btn-ss-primary" style={{width:"100%",marginTop:8}} onClick={handleLoginFixed} disabled={loading}>
        {loading ? <span className="loading-spin"/> : "Login"}
      </button>
      <p style={{textAlign:"center",marginTop:14,fontSize:".85rem",color:"var(--muted)"}}>
        No account? <span style={{color:"var(--primary)",cursor:"pointer",fontWeight:600}} onClick={onSwitchSignup}>Sign Up</span>
      </p>
      <div style={{marginTop:16,padding:"12px",background:"var(--bg-alt)",borderRadius:"var(--radius-sm)",fontSize:".78rem",color:"var(--muted)"}}>
        <strong>⚡ Make sure backend is running:</strong><br/>
        <code>cd backend → npm install → npm run dev</code>
      </div>
    </Modal>
  );
}

// ── Signup Modal — calls POST /api/auth/signup (Node.js → MongoDB) ──
function SignupModal({ onClose, onLogin, onSwitchLogin }) {
  const [form, setForm]     = useState({name:"",email:"",department:"",password:""});
  const [err, setErr]       = useState("");
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const handleSignup = async () => {
    setErr(""); setLoading(true);
    const {name, email, department, password} = form;
    if (!name||!email||!department||!password) { setErr("Please fill in all fields."); setLoading(false); return; }
    if (password.length < 6) { setErr("Password must be at least 6 characters."); setLoading(false); return; }
    try {
      // ── Real API Call → POST /api/auth/signup → Node.js → MongoDB ──
      const data = await API.signup(name, email, department, password);
      saveSession(data.token);   // save JWT token
      onLogin(data);
      onClose();
    } catch (e) { setErr(e.message); } finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose}>
      <h5 className="modal-title-ss">Create Account 🎓</h5>
      {err && <div className="err-msg">{err}</div>}
      {[
        {k:"name",       label:"Full Name",   type:"text",     ph:"Your full name"},
        {k:"email",      label:"Email",       type:"email",    ph:"student@college.edu"},
        {k:"department", label:"Department",  type:"text",     ph:"e.g. Computer Science"},
        {k:"password",   label:"Password",    type:"password", ph:"Min 6 characters"},
      ].map(({k,label,type,ph}) => (
        <div className="input-group-ss" key={k}>
          <label>{label}</label>
          <input className="input-ss" type={type} placeholder={ph}
            value={form[k]} onChange={set(k)} onKeyDown={e=>e.key==="Enter"&&handleSignup()} />
        </div>
      ))}
      <button className="btn-ss-primary" style={{width:"100%",marginTop:8}} onClick={handleSignup} disabled={loading}>
        {loading ? <span className="loading-spin"/> : "Sign Up"}
      </button>
      <p style={{textAlign:"center",marginTop:14,fontSize:".85rem",color:"var(--muted)"}}>
        Have account? <span style={{color:"var(--primary)",cursor:"pointer",fontWeight:600}} onClick={onSwitchLogin}>Login</span>
      </p>
    </Modal>
  );
}

// ── Chat Modal — AI-powered, context-aware ──
function ChatModal({ targetUser, currentUser, onClose }) {
  const [messages, setMessages] = useState([
    { from:"them", text:`Hi! I'm ${targetUser.name} from ${targetUser.department||targetUser.dept}. I can teach: ${targetUser.teachSkills?.join(", ")||"various skills"}. How can I help? 😊`, time:nowTime() }
  ]);
  const [input, setInput]   = useState("");
  const [typing, setTyping] = useState(false);
  const [apiErr, setApiErr] = useState("");
  const boxRef = useRef(null);

  useEffect(() => { if(boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; }, [messages, typing]);

  const send = useCallback(async () => {
    const msg = input.trim();
    if (!msg) return;
    const updated = [...messages, {from:"me", text:msg, time:nowTime()}];
    setMessages(updated); setInput(""); setTyping(true); setApiErr("");

    const systemPrompt = `You are ${targetUser.name}, a ${targetUser.department||targetUser.dept} student on SkillSwap.
Your skills you CAN TEACH: ${targetUser.teachSkills?.join(", ")||"various things"}.
Skills YOU WANT TO LEARN: ${targetUser.learnSkills?.join(", ")||"various things"}.
Chatting with ${currentUser?.name||"a student"} who teaches: ${currentUser?.teachSkills?.join(", ")||"various skills"}.
RULES: Always reply as ${targetUser.name}. Give genuine helpful answers. If asked about a skill you teach, actually explain something useful. Keep it 2-4 sentences, casual, friendly. NEVER give generic unrelated replies.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514", max_tokens:1000, system:systemPrompt,
          messages:updated.map(m=>({role:m.from==="me"?"user":"assistant",content:m.text}))
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply = data?.content?.[0]?.text;
      if (!reply) throw new Error("Empty response");
      setTyping(false);
      setMessages(prev=>[...prev,{from:"them",text:reply,time:nowTime()}]);
    } catch(e) {
      setTyping(false); setApiErr(e.message);
      const m = msg.toLowerCase();
      let fb = `Got it! Let me help you with that. What specifically about ${targetUser.teachSkills?.[0]||"this topic"} would you like to know?`;
      if (m.includes("hi")||m.includes("hello")) fb = `Hey ${currentUser?.name?.split(" ")[0]||"there"}! Great to connect 👋 What would you like to learn?`;
      else if (m.includes("free")||m.includes("meet")||m.includes("when")) fb = "I'm usually free on weekends! When works for you?";
      setMessages(prev=>[...prev,{from:"them",text:fb,time:nowTime()}]);
    }
  }, [input, messages, targetUser, currentUser]);

  return (
    <Modal onClose={onClose}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,paddingBottom:14,borderBottom:"1px solid var(--border)"}}>
        <div className="avatar" style={{background:targetUser.color,width:40,height:40,fontSize:".88rem"}}>{targetUser.initials}</div>
        <div>
          <div style={{fontFamily:"var(--font-head)",fontWeight:700,fontSize:"1rem"}}>{targetUser.name}</div>
          <div style={{fontSize:".72rem",color:"var(--muted)"}}>{targetUser.department||targetUser.dept} · <span style={{color:"var(--green)"}}>● Online</span></div>
        </div>
        <div style={{marginLeft:"auto",fontSize:".68rem",background:"rgba(79,70,229,.08)",padding:"4px 10px",borderRadius:20,color:"var(--primary)",fontWeight:600}}>✦ AI Replies</div>
      </div>
      {apiErr && <div style={{fontSize:".72rem",color:"#d97706",background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",borderRadius:8,padding:"6px 12px",marginBottom:10}}>⚠️ AI fallback active</div>}
      <div className="chat-box" ref={boxRef}>
        {messages.map((m,i)=>(
          <div key={i} className={m.from==="me"?"chat-row-mine":"chat-row-theirs"}>
            <div className={`bubble ${m.from==="me"?"bubble-mine":"bubble-theirs"}`}>{m.text}</div>
            <div className="chat-time">{m.time}</div>
          </div>
        ))}
        {typing && <div className="chat-row-theirs"><div className="bubble bubble-theirs" style={{display:"flex",gap:5,padding:"12px 16px"}}><span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/></div></div>}
      </div>
      <div className="chat-input-wrap">
        <input className="chat-input-field" placeholder="Type a message…" value={input}
          onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} disabled={typing}/>
        <button className="btn-icon" onClick={send} disabled={typing}>➤</button>
      </div>
      <div style={{fontSize:".68rem",color:"var(--muted)",textAlign:"center",marginTop:8}}>✦ AI replies based on {targetUser.name.split(" ")[0]}'s actual skills</div>
    </Modal>
  );
}

// ── Navbar ──
function Navbar({ currentUser, onLogout, onOpenLogin, onOpenSignup, activeTab, setActiveTab }) {
  const tabs = ["Home","Browse","Matches"];
  return (
    <nav className="navbar-ss">
      <div className="container py-2">
        <div className="d-flex justify-content-between align-items-center">
          <div className="brand" onClick={()=>setActiveTab("Home")} style={{cursor:"pointer"}}>
            <span className="brand-chip">⇄</span>SkillSwap
          </div>
          <div className="d-none d-md-flex align-items-center gap-3">
            {tabs.map(t=><span key={t} className={`nav-link-ss ${activeTab===t?"active":""}`} onClick={()=>setActiveTab(t)}>{t}</span>)}
          </div>
          <div className="d-flex align-items-center gap-2">
            {currentUser ? (
              <>
                <div className="avatar" style={{background:currentUser.color,width:34,height:34,fontSize:".8rem"}}>{currentUser.initials}</div>
                <span style={{fontSize:".85rem",fontWeight:600,color:"var(--primary)"}}>{currentUser.name.split(" ")[0]}</span>
                <button className="btn-ss-danger btn-ss-sm" onClick={onLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="btn-ss-outline btn-ss-sm" onClick={onOpenLogin}>Login</button>
                <button className="btn-ss-primary btn-ss-sm" onClick={onOpenSignup}>Sign Up</button>
              </>
            )}
          </div>
        </div>
        <div className="d-flex d-md-none gap-3 mt-2" style={{overflowX:"auto",paddingBottom:4}}>
          {tabs.map(t=><span key={t} className={`nav-link-ss ${activeTab===t?"active":""}`} style={{whiteSpace:"nowrap"}} onClick={()=>setActiveTab(t)}>{t}</span>)}
        </div>
      </div>
    </nav>
  );
}

// ── Hero Section ──
function HeroSection({ onOpenSignup, userCount, skillCount, currentUser }) {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="row align-items-center" style={{minHeight:"68vh"}}>
          <div className="col-lg-6">
            <div className="badge-pill anim-fadeup">🎓 Student Community Platform</div>
            <h1 className="hero-title anim-fadeup anim-delay1">
              Teach What You <span className="highlight">Know.</span><br/>
              Learn What You <span className="highlight">Love.</span>
            </h1>
            <p className="anim-fadeup anim-delay2" style={{fontSize:"1.05rem",color:"var(--muted)",maxWidth:480,lineHeight:1.75,margin:"16px 0 24px"}}>
              SkillSwap connects students who want to teach with students who want to learn. No money. Just knowledge exchange.
            </p>
            {!currentUser ? (
              <div className="anim-fadeup anim-delay2">
                <button className="btn-ss-primary" style={{fontSize:"1rem",padding:"12px 28px"}} onClick={onOpenSignup}>Get Started Free</button>
              </div>
            ) : (
              <div className="anim-fadeup anim-delay2" style={{display:"inline-flex",alignItems:"center",gap:10,background:"rgba(79,70,229,.1)",border:"1px solid rgba(79,70,229,.2)",borderRadius:"var(--radius-sm)",padding:"10px 18px"}}>
                <div className="avatar" style={{background:currentUser.color,width:32,height:32,fontSize:".78rem"}}>{currentUser.initials}</div>
                <span style={{fontWeight:600,color:"var(--primary)",fontSize:".95rem"}}>Welcome back, {currentUser.name.split(" ")[0]}! 👋</span>
              </div>
            )}
            <div className="hero-stats d-flex gap-4 mt-4 anim-fadeup anim-delay3">
              <div><strong>{userCount+120}</strong><span>Students</span></div>
              <div><strong>{skillCount+280}</strong><span>Skills Listed</span></div>
              <div><strong>87</strong><span>Matches Made</span></div>
            </div>
          </div>
          <div className="col-lg-6 d-none d-lg-flex justify-content-center float-stack">
            <div style={{position:"relative",width:320,height:340}}>
              {[
                {style:{top:0,left:0,animation:"float 4s ease-in-out infinite"},emoji:"🎸",type:"Can Teach",typeClass:"teach-type",skill:"Guitar"},
                {style:{top:20,right:0,animation:"float 4s ease-in-out 1s infinite"},emoji:"🐍",type:"Wants to Learn",typeClass:"learn-type",skill:"Python"},
                {style:{bottom:50,left:10,animation:"float 4s ease-in-out .5s infinite"},emoji:"🎨",type:"Can Teach",typeClass:"teach-type",skill:"Canva"},
                {style:{bottom:20,right:10,animation:"float 4s ease-in-out 1.5s infinite"},emoji:"📊",type:"Wants to Learn",typeClass:"learn-type",skill:"Excel"},
              ].map((c,i)=>(
                <div key={i} className="float-card" style={c.style}>
                  <span style={{fontSize:"2rem"}}>{c.emoji}</span>
                  <div><div className={`skill-type ${c.typeClass}`}>{c.type}</div><div className="skill-name">{c.skill}</div></div>
                </div>
              ))}
              <div className="swap-orb">⇄</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──
function HowItWorks() {
  return (
    <section className="section-alt py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="section-title">How It Works</h2>
          <p style={{color:"var(--muted)",marginTop:8}}>Three simple steps to start swapping skills</p>
        </div>
        <div className="row g-4">
          {[
            {num:"01",icon:"📝",title:"Sign Up",desc:"Create your free student profile with your name and department.",featured:false},
            {num:"02",icon:"🔁",title:"List Your Skills",desc:"Add skills you can teach and skills you want to learn. As many as you like!",featured:true},
            {num:"03",icon:"🤝",title:"Match & Connect",desc:"We find students whose teach-skills match your learn-skills. Chat and start learning!",featured:false},
          ].map(s=>(
            <div key={s.num} className="col-md-4">
              <div className={`step-card ${s.featured?"featured":""}`}>
                <div className="step-num">{s.num}</div>
                <div style={{fontSize:"2.5rem",margin:"8px 0"}}>{s.icon}</div>
                <h4 style={{marginBottom:10}}>{s.title}</h4>
                <p style={{lineHeight:1.65,fontSize:".92rem"}}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── My Skills — calls PUT /api/users/skills (Node.js → MongoDB $addToSet/$pull) ──
function MySkillsSection({ currentUser, onUpdate, onToast }) {
  const [teachInput, setTeachInput] = useState("");
  const [learnInput, setLearnInput] = useState("");
  const [loading, setLoading] = useState("");

  const addSkill = async (type) => {
    const val = (type==="teach" ? teachInput : learnInput).trim();
    if (!val) return;
    const skills = type==="teach" ? currentUser.teachSkills : currentUser.learnSkills;
    if (skills.map(s=>s.toLowerCase()).includes(val.toLowerCase())) { onToast(`"${val}" already added!`,"red"); return; }
    setLoading(type);
    try {
      // ── Real API Call → PUT /api/users/skills → Node.js → MongoDB $addToSet ──
      const updated = await API.updateSkill(type, val, "add");
      if (type==="teach") setTeachInput(""); else setLearnInput("");
      onUpdate(updated);
      onToast(`"${val}" added!`, "green");
    } catch(e) { onToast(e.message, "red"); }
    finally { setLoading(""); }
  };

  const removeSkill = async (type, skill) => {
    setLoading(`${type}-${skill}`);
    try {
      // ── Real API Call → PUT /api/users/skills → Node.js → MongoDB $pull ──
      const updated = await API.updateSkill(type, skill, "remove");
      onUpdate(updated);
      onToast(`"${skill}" removed`, "");
    } catch(e) { onToast(e.message,"red"); }
    finally { setLoading(""); }
  };

  return (
    <section className="py-5">
      <div className="container">
        <div className="text-center mb-4">
          <h2 className="section-title">My Skills</h2>
          <p style={{color:"var(--muted)",marginTop:8}}>Manage what you teach and what you want to learn</p>
        </div>
        <div className="row g-4">
          {[
            {type:"teach",label:"Skills I Can Teach",icon:"🎓",cls:"teach-card",val:teachInput,set:setTeachInput,ph:"e.g. Python, Guitar, Canva…",tagCls:"teach-tag"},
            {type:"learn",label:"Skills I Want to Learn",icon:"📚",cls:"learn-card",val:learnInput,set:setLearnInput,ph:"e.g. Excel, Photoshop, Hindi…",tagCls:"learn-tag"},
          ].map(({type,label,icon,cls,val,set,ph,tagCls})=>(
            <div key={type} className="col-md-6">
              <div className={`skill-form-card ${cls}`}>
                <h5 style={{fontSize:"1.05rem",marginBottom:14}}>{icon} {label}</h5>
                <div style={{display:"flex",gap:8}}>
                  <input className="input-ss" style={{flex:1}} placeholder={ph} value={val}
                    onChange={e=>set(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSkill(type)}/>
                  <button className="btn-ss-primary btn-ss-sm" onClick={()=>addSkill(type)} disabled={loading===type}>
                    {loading===type ? "…" : "+ Add"}
                  </button>
                </div>
                <div style={{marginTop:14,display:"flex",flexWrap:"wrap"}}>
                  {(type==="teach" ? currentUser.teachSkills : currentUser.learnSkills).length===0
                    ? <span style={{fontSize:".82rem",color:"var(--muted)"}}>No skills added yet.</span>
                    : (type==="teach" ? currentUser.teachSkills : currentUser.learnSkills).map(s=>(
                        <span key={s} className={`skill-tag ${tagCls}`}>
                          {s} <span className="tag-x" onClick={()=>removeSkill(type,s)}>✕</span>
                        </span>
                      ))
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Browse — calls GET /api/users (Node.js → MongoDB User.find()) ──
function BrowseSection({ currentUser, onOpenLogin, onToast }) {
  const [users, setUsers]       = useState([]);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");
  const [chatTarget, setChatTarget] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    // ── Real API Call → GET /api/users → Node.js → MongoDB User.find() ──
    API.getAllUsers()
      .then(setUsers)
      .catch(e => onToast("Could not load users: "+e.message, "red"))
      .finally(() => setLoading(false));
  }, []);

  let filtered = users;
  if (search) filtered = filtered.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.department?.toLowerCase().includes(search.toLowerCase()) ||
    u.teachSkills.some(s=>s.toLowerCase().includes(search.toLowerCase())) ||
    u.learnSkills.some(s=>s.toLowerCase().includes(search.toLowerCase()))
  );
  if (filter==="teach") filtered = filtered.filter(u=>u.teachSkills.length>0);
  if (filter==="learn") filtered = filtered.filter(u=>u.learnSkills.length>0);

  const handleContact = (user) => {
    if (!currentUser) { onToast("Please login to contact students!", "red"); return; }
    setChatTarget(user);
  };

  if (loading) return (
    <section className="section-alt py-5">
      <div className="container text-center py-5">
        <div className="loading-spin" style={{width:40,height:40,borderWidth:4,margin:"0 auto"}}/>
        <p style={{marginTop:16,color:"var(--muted)"}}>Loading students from MongoDB…</p>
      </div>
    </section>
  );

  return (
    <section className="section-alt py-5">
      <div className="container">
        <div className="text-center mb-4">
          <h2 className="section-title">Browse All Skills</h2>
          <p style={{color:"var(--muted)",marginTop:8}}>See what students are teaching and learning right now</p>
        </div>
        <div className="row justify-content-center mb-4 g-2">
          <div className="col-md-6">
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"var(--muted)"}}>🔍</span>
              <input className="input-ss" style={{paddingLeft:40}} placeholder="Search a skill or student name…"
                value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
          </div>
          <div className="col-md-3">
            <select className="input-ss" value={filter} onChange={e=>setFilter(e.target.value)}>
              <option value="all">All Students</option>
              <option value="teach">Has Skills to Teach</option>
              <option value="learn">Has Skills to Learn</option>
            </select>
          </div>
        </div>
        {filtered.length===0
          ? <div className="empty-state"><div className="empty-icon">🔍</div><h5>No students found</h5></div>
          : <div className="row g-3">
              {filtered.map(user=>(
                <div key={user._id} className="col-sm-6 col-lg-4">
                  <div className="browse-card">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="avatar" style={{background:user.color,width:48,height:48,fontSize:"1rem"}}>{user.initials}</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:"1rem",fontFamily:"var(--font-head)"}}>{user.name}</div>
                        <div style={{fontSize:".75rem",color:"var(--muted)"}}>{user.department}</div>
                      </div>
                    </div>
                    {user.teachSkills.length>0 && (
                      <div style={{marginBottom:10}}>
                        <div className="badge-type-label">📚 Can Teach</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>
                          {user.teachSkills.map(s=><span key={s} className="browse-badge badge-teach">{s}</span>)}
                        </div>
                      </div>
                    )}
                    {user.learnSkills.length>0 && (
                      <div style={{marginBottom:14}}>
                        <div className="badge-type-label">🎯 Wants to Learn</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>
                          {user.learnSkills.map(s=><span key={s} className="browse-badge badge-learn">{s}</span>)}
                        </div>
                      </div>
                    )}
                    <button className="btn-ss-outline btn-ss-sm" style={{width:"100%"}} onClick={()=>handleContact(user)}>
                      💬 Contact {user.name.split(" ")[0]}
                    </button>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
      {chatTarget && <ChatModal targetUser={chatTarget} currentUser={currentUser} onClose={()=>setChatTarget(null)}/>}
    </section>
  );
}

// ── Matches — calls GET /api/users/matches (Node.js → MongoDB + algorithm) ──
function MatchesSection({ currentUser, onOpenLogin }) {
  const [matches, setMatches]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [chatTarget, setChatTarget] = useState(null);

  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }
    // ── Real API Call → GET /api/users/matches → Node.js → MongoDB ──
    API.getMatches()
      .then(setMatches)
      .catch(console.error)
      .finally(()=>setLoading(false));
  }, [currentUser]);

  if (!currentUser) return (
    <section className="py-5">
      <div className="container">
        <div className="text-center mb-4"><h2 className="section-title">Your Matches</h2></div>
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h5>Login to see your matches</h5>
          <p style={{color:"var(--muted)"}}>Sign up and add your skills to get matched.</p>
          <button className="btn-ss-primary" style={{marginTop:14}} onClick={onOpenLogin}>Login Now</button>
        </div>
      </div>
    </section>
  );

  if (loading) return (
    <section className="py-5">
      <div className="container text-center py-5">
        <div className="loading-spin" style={{width:40,height:40,borderWidth:4,margin:"0 auto"}}/>
        <p style={{marginTop:16,color:"var(--muted)"}}>Finding your matches from MongoDB…</p>
      </div>
    </section>
  );

  return (
    <section className="py-5">
      <div className="container">
        <div className="text-center mb-4">
          <h2 className="section-title">Your Matches</h2>
          <p style={{color:"var(--muted)",marginTop:8}}>Students who match your skill interests</p>
        </div>
        {matches.length===0
          ? <div className="empty-state"><div className="empty-icon">🤝</div><h5>No matches yet</h5><p style={{color:"var(--muted)"}}>Add more skills to get matched!</p></div>
          : <div className="row g-3">
              {matches.map((m,i)=>(
                <div key={i} className="col-md-6">
                  <div className="match-card">
                    <div className="avatar" style={{background:m.user.color,width:50,height:50}}>{m.user.initials}</div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"var(--font-head)",fontWeight:700,fontSize:"1rem"}}>{m.user.name}</div>
                      <div style={{fontSize:".75rem",color:"var(--muted)",marginBottom:8}}>{m.user.department}</div>
                      {m.theyCanTeachMe?.length>0 && <div style={{marginBottom:6}}>
                        <div className="badge-type-label">They can teach you:</div>
                        {m.theyCanTeachMe.map(s=><span key={s} className="browse-badge badge-teach">{s}</span>)}
                      </div>}
                      {m.iCanTeachThem?.length>0 && <div style={{marginBottom:10}}>
                        <div className="badge-type-label">You can teach them:</div>
                        {m.iCanTeachThem.map(s=><span key={s} className="browse-badge badge-learn">{s}</span>)}
                      </div>}
                      <button className="btn-ss-primary btn-ss-sm" onClick={()=>setChatTarget(m.user)}>💬 Chat</button>
                    </div>
                    <div className="match-score">{m.score}<small>match{m.score>1?"es":""}</small></div>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
      {chatTarget && <ChatModal targetUser={chatTarget} currentUser={currentUser} onClose={()=>setChatTarget(null)}/>}
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer-ss">
      <div className="container">
        <div className="footer-brand mb-2"><span className="brand-chip">⇄</span>SkillSwap</div>
        <p style={{margin:"6px 0"}}>A class project · PP Savani University</p>
        <p style={{fontSize:".78rem"}}>React JS · Bootstrap 5 · CSS3 · JavaScript · Node.js · MongoDB</p>
      </div>
    </footer>
  );
}


// ════════════════════════════════════════════════════════════
//  ROOT APP COMPONENT
// ════════════════════════════════════════════════════════════
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab,   setActiveTab]   = useState("Home");
  const [modal,       setModal]       = useState(null);
  const [toast,       setToast]       = useState(null);
  const [userCount,   setUserCount]   = useState(6);
  const [skillCount,  setSkillCount]  = useState(30);

  // On mount: restore session from JWT + fetch user from MongoDB
  useEffect(() => {
    const token = getToken();
    if (token) {
      API.getMe()
        .then(user => setCurrentUser(user))
        .catch(() => clearSession()); // token expired or invalid
    }
    // Fetch user count for hero stats from MongoDB
    API.getAllUsers()
      .then(users => {
        setUserCount(users.length);
        setSkillCount(users.reduce((a,u)=>a+u.teachSkills.length+u.learnSkills.length, 0));
      })
      .catch(() => {}); // silently fail if backend not running
  }, []);

  const handleLogin  = (data) => { setCurrentUser(data); showToast(`Welcome, ${data.name.split(" ")[0]}! 🎉`,"green"); };
  const handleLogout = () => { clearSession(); setCurrentUser(null); showToast("Logged out.",""); };
  const handleUpdate = (user) => setCurrentUser({...user});
  const showToast    = (msg, type) => setToast({msg, type});
  const closeModal   = () => setModal(null);

  return (
    <>
      <GlobalStyles />
      <Navbar currentUser={currentUser} onLogout={handleLogout}
        onOpenLogin={()=>setModal("login")} onOpenSignup={()=>setModal("signup")}
        activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab==="Home" && <>
        <HeroSection onOpenSignup={()=>setModal("signup")} userCount={userCount} skillCount={skillCount} currentUser={currentUser}/>
        <HowItWorks/>
        {currentUser && <MySkillsSection currentUser={currentUser} onUpdate={handleUpdate} onToast={showToast}/>}
      </>}
      {activeTab==="Browse"  && <BrowseSection currentUser={currentUser} onOpenLogin={()=>setModal("login")} onToast={showToast}/>}
      {activeTab==="Matches" && <MatchesSection currentUser={currentUser} onOpenLogin={()=>setModal("login")}/>}

      <Footer/>

      {modal==="login"  && <LoginModal  onClose={closeModal} onLogin={handleLogin} onSwitchSignup={()=>setModal("signup")}/>}
      {modal==="signup" && <SignupModal onClose={closeModal} onLogin={handleLogin} onSwitchLogin={()=>setModal("login")}/>}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </>
  );
}