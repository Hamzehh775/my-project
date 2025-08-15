import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, width = 720 }) {
  useEffect(() => {
    function onKey(e){ if(e.key==='Escape') onClose?.(); }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={{ ...styles.modal, maxWidth: width }} onClick={(e)=>e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button onClick={onClose} style={styles.close}>×</button>
        </div>
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: { position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, zIndex:50 },
  modal: { width:'100%', background:'#0b1220', color:'#e5e7eb', borderRadius:16, boxShadow:'0 10px 30px rgba(0,0,0,0.3)', border:'1px solid #1f2937' },
  header: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:'1px solid #1f2937' },
  title: { margin:0, fontSize:18, fontWeight:600 },
  close: { background:'transparent', border:'none', color:'#94a3b8', fontSize:22, cursor:'pointer' },
  body: { padding:18 }
};
