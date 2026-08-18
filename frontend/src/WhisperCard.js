import React, { useState, useEffect, useRef } from 'react';

const WHISPERS = {
  ar: ["أعطها", "هذا المكان ينتظرك"],
  pt: ["alimente isso", "este lugar é seu"],
  ko: ["채워줘", "여기 무언가 살아야 해"],
  fr: ["nourris-le", "cet endroit t'attend"],
  default: ["feed it", "this place is waiting", "something should live here"],
};

function getWhisperPhrases() {
  const lang = (navigator.language || 'en').slice(0, 2);
  return WHISPERS[lang] || WHISPERS.default;
}

const WHISPER_VISIT_LIMIT = 5;

function WhisperCard({ coordKey }) {
  const [visits, setVisits] = useState(0);
  const [showWhisper, setShowWhisper] = useState(false);
  const phraseRef = useRef(null);
  if (phraseRef.current === null) {
    const phrases = getWhisperPhrases();
    phraseRef.current = phrases[Math.floor(Math.random() * phrases.length)];
  }

  useEffect(() => {
    const key = `best_whisper_visits_${coordKey}`;
    const prev = parseInt(localStorage.getItem(key) || '0', 10);
    const next = prev + 1;
    localStorage.setItem(key, String(next));
    setVisits(next);
    setShowWhisper(false);
  }, [coordKey]);

  useEffect(() => {
    if (visits >= WHISPER_VISIT_LIMIT) return;
    const t = setTimeout(() => setShowWhisper(true), 2000);
    return () => clearTimeout(t);
  }, [visits]);

  const silent = visits >= WHISPER_VISIT_LIMIT;

  return (
    <div style={{ position:'relative', width:'100%', height:'100%',
                  backgroundColor:'#000000', display:'flex',
                  alignItems:'center', justifyContent:'center',
                  animation: silent ? 'none' : 'cardBreathe 4s ease-in-out infinite' }}>
      {silent ? (
        <div style={{ width:'8px', height:'8px', borderRadius:'50%',
                      backgroundColor:'#F0C040', boxShadow:'0 0 12px #F0C040' }} />
      ) : showWhisper ? (
        <div style={{ color:'#3A3A3A', fontSize:'10px', letterSpacing:'1px',
                      textAlign:'center', padding:'0 8px',
                      animation:'whisperFadeIn 1.5s ease' }}>
          {phraseRef.current}
        </div>
      ) : null}
    </div>
  );
}

export default WhisperCard;
