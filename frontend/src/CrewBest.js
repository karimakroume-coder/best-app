import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'https://web-production-a267.up.railway.app';
const GOLD = '#F0C040';
const BRONZE = '#CD7F32';
const CREAM = '#F5E6C8';
const BG = '#0A0A0A';

const btn = {
  border: 'none', borderRadius: 0, cursor: 'pointer',
  fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px', minHeight: '44px',
};
const input = {
  width: '100%', padding: '12px 14px', marginBottom: '10px',
  backgroundColor: '#1A1408', border: '1px solid #3A2E14',
  color: CREAM, fontSize: '14px', outline: 'none', boxSizing: 'border-box',
};

function CrewBest({ rankings, transitionPhase, setCurrentMap }) {
  const [view, setView] = useState('list');
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [groupVideos, setGroupVideos] = useState([]);
  const [members, setMembers] = useState([]);
  const [userId] = useState(() => localStorage.getItem('best_user_id') || 'a307cc62-3afd-47b0-9911-9300a934d788');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const fetchGroups = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/crew/groups/${userId}`);
      setGroups(res.data.groups || []);
    } catch { setGroups([]); }
  }, [userId]);

  const fetchGroup = useCallback(async (groupId) => {
    try {
      const [rankRes, memRes] = await Promise.all([
        axios.get(`${API_BASE}/crew/${groupId}/ranking`),
        axios.get(`${API_BASE}/crew/${groupId}/members`),
      ]);
      setGroupVideos(rankRes.data.videos || []);
      setMembers(memRes.data.members || []);
    } catch { setGroupVideos([]); setMembers([]); }
  }, []);

  useEffect(() => { if (view === 'list') fetchGroups(); }, [view, fetchGroups]);
  useEffect(() => { if (activeGroup) fetchGroup(activeGroup.id); }, [activeGroup, fetchGroup]);

  const createGroup = useCallback(async () => {
    if (!newName.trim()) { setError('Name required'); return; }
    setCreating(true); setError('');
    try {
      const res = await axios.post(`${API_BASE}/crew/create`, { name: newName.trim(), creator_id: userId });
      setNewName('');
      await fetchGroups();
      setView('list');
    } catch { setError('Failed to create'); }
    setCreating(false);
  }, [newName, userId, fetchGroups]);

  const joinGroup = useCallback(async () => {
    if (!joinCode.trim()) { setError('Invite code required'); return; }
    try {
      const res = await axios.post(`${API_BASE}/crew/join`, { invite_code: joinCode.trim(), user_id: userId });
      setJoinCode('');
      await fetchGroups();
      setView('list');
    } catch (e) { setError(e.response?.data?.detail || 'Failed to join'); }
  }, [joinCode, userId, fetchGroups]);

  const leaveGroup = useCallback(async (groupId) => {
    try {
      await axios.post(`${API_BASE}/crew/leave`, { group_id: groupId, user_id: userId });
      setActiveGroup(null);
      await fetchGroups();
    } catch { }
  }, [userId, fetchGroups]);

  const vote = useCallback(async (groupId, videoId, voteVal) => {
    try {
      await axios.post(`${API_BASE}/crew/vote`, { group_id: groupId, video_id: videoId, user_id: userId, vote: voteVal });
      fetchGroup({ id: groupId });
    } catch { }
  }, [userId, fetchGroup]);

  const addVideo = useCallback(async (groupId, videoId) => {
    try {
      await axios.post(`${API_BASE}/crew/add-video`, { group_id: groupId, video_id: videoId, user_id: userId });
      fetchGroup({ id: groupId });
    } catch { }
  }, [userId, fetchGroup]);

  const page = {
    width: '100vw', height: '100vh', backgroundColor: BG,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    overflowY: 'auto', WebkitOverflowScrolling: 'touch',
    animation: transitionPhase === 'enter' ? 'mapEnter 0.4s ease' : 'none',
    opacity: transitionPhase === 'exit' ? 0 : 1,
    transition: transitionPhase === 'exit' ? 'opacity 0.4s ease' : 'none',
  };

  // ── GROUP DETAIL VIEW ──
  if (activeGroup) {
    const sorted = [...groupVideos].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    return (
      <div style={page}>
        <style>{`@keyframes mapEnter { from { opacity:0; transform:scale(1.05); } to { opacity:1; transform:scale(1); } }`}</style>
        <div style={{ width: '100%', maxWidth: '480px', padding: '20px 16px' }}>
          <button onClick={() => setActiveGroup(null)}
            style={{ ...btn, fontSize: '11px', color: '#666', backgroundColor: 'transparent', marginBottom: '16px' }}>
            ← BACK
          </button>
          <div style={{ fontFamily: 'Pacifico, cursive', color: BRONZE, fontSize: '28px', marginBottom: '4px' }}>
            {activeGroup.name}
          </div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#555', fontSize: '11px', letterSpacing: '2px', marginBottom: '4px' }}>
            INVITE: {activeGroup.invite_code}
          </div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#555', fontSize: '11px', letterSpacing: '2px', marginBottom: '20px' }}>
            {members.length} MEMBER{members.length !== 1 ? 'S' : ''}
          </div>

          {/* ADD VIDEO */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <select id="crew-video-select" style={{ ...input, flex: 1, marginBottom: 0 }}>
              {(rankings || []).slice(0, 50).map(v => (
                <option key={v.video_id} value={v.video_id}>{v.title?.slice(0, 40) || v.video_id}</option>
              ))}
            </select>
            <button onClick={() => {
              const sel = document.getElementById('crew-video-select');
              if (sel?.value) addVideo(activeGroup.id, sel.value);
            }}
              style={{ ...btn, fontSize: '12px', color: BG, backgroundColor: BRONZE, padding: '10px 16px', flexShrink: 0 }}>
              ADD
            </button>
          </div>

          {/* VIDEO LIST */}
          {sorted.length === 0 ? (
            <div style={{ fontFamily: 'Pacifico, cursive', color: '#444', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>
              No videos yet. Add one above!
            </div>
          ) : sorted.map((v, i) => (
            <div key={v.video_id}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0',
                       borderBottom: '1px solid #1A1408' }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: i === 0 ? GOLD : '#555',
                            fontSize: '18px', width: '28px', textAlign: 'center' }}>
                {i + 1}
              </div>
              {v.thumbnail_url && (
                <img src={v.thumbnail_url} alt="" style={{ width: '60px', height: '34px', objectFit: 'cover', borderRadius: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: CREAM, fontSize: '13px',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {v.title || v.video_id}
                </div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#555', fontSize: '10px', letterSpacing: '1px' }}>
                  {v.channel_name || ''}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button onClick={() => vote(activeGroup.id, v.video_id, 1)}
                  style={{ ...btn, fontSize: '16px', backgroundColor: 'transparent', color: v.user_vote === 1 ? GOLD : '#444',
                           padding: '4px 8px', minHeight: 'auto' }}>
                  ▲
                </button>
                <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: CREAM, fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>
                  {v.votes || 0}
                </span>
                <button onClick={() => vote(activeGroup.id, v.video_id, -1)}
                  style={{ ...btn, fontSize: '16px', backgroundColor: 'transparent', color: v.user_vote === -1 ? '#C0392B' : '#444',
                           padding: '4px 8px', minHeight: 'auto' }}>
                  ▼
                </button>
              </div>
            </div>
          ))}

          <button onClick={() => leaveGroup(activeGroup.id)}
            style={{ ...btn, fontSize: '11px', color: '#C0392B', backgroundColor: 'transparent',
                     marginTop: '24px', width: '100%', border: '1px solid #3A2E14' }}>
            LEAVE CREW
          </button>
        </div>
      </div>
    );
  }

  // ── LIST / CREATE / JOIN VIEW ──
  return (
    <div style={page}>
      <style>{`@keyframes mapEnter { from { opacity:0; transform:scale(1.05); } to { opacity:1; transform:scale(1); } }`}</style>
      <div style={{ width: '100%', maxWidth: '480px', padding: '20px 16px' }}>
        <div style={{ fontFamily: 'Pacifico, cursive', color: BRONZE, fontSize: '32px', textAlign: 'center', marginBottom: '4px' }}>
          CREW BEST
        </div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#555', fontSize: '12px', letterSpacing: '3px', textAlign: 'center', marginBottom: '28px' }}>
          Vote with your crew on the best videos
        </div>

        {error && (
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#C0392B', fontSize: '11px',
                        letterSpacing: '2px', textAlign: 'center', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        {view === 'list' && (
          <>
            {/* MY GROUPS */}
            {groups.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: GOLD, fontSize: '13px',
                              letterSpacing: '3px', marginBottom: '12px' }}>
                  YOUR CREWS ({groups.length})
                </div>
                {groups.map(g => (
                  <div key={g.id}
                    onClick={() => setActiveGroup(g)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                             padding: '14px 16px', marginBottom: '8px',
                             border: `1px solid ${BRONZE}`, backgroundColor: 'rgba(205,127,50,0.05)',
                             cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontFamily: 'Pacifico, cursive', color: CREAM, fontSize: '16px' }}>{g.name}</div>
                      <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#555', fontSize: '10px',
                                    letterSpacing: '2px', marginTop: '2px' }}>
                        {g.member_count || '?'} MEMBER{g.member_count !== 1 ? 'S' : ''} · {g.video_count || 0} VIDEOS
                      </div>
                    </div>
                    <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: BRONZE, fontSize: '18px' }}>→</div>
                  </div>
                ))}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setView('create')}
                style={{ ...btn, flex: 1, fontSize: '13px', color: BG, backgroundColor: BRONZE, padding: '14px' }}>
                CREATE CREW
              </button>
              <button onClick={() => setView('join')}
                style={{ ...btn, flex: 1, fontSize: '13px', color: BRONZE, backgroundColor: 'transparent',
                         border: `1px solid ${BRONZE}`, padding: '14px' }}>
                JOIN CREW
              </button>
            </div>

            {groups.length === 0 && (
              <div style={{ fontFamily: 'Pacifico, cursive', color: '#444', fontSize: '13px',
                            textAlign: 'center', marginTop: '40px' }}>
                Create or join a crew to start voting together.
              </div>
            )}
          </>
        )}

        {view === 'create' && (
          <div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: BRONZE, fontSize: '16px',
                          letterSpacing: '3px', marginBottom: '16px' }}>
              CREATE A CREW
            </div>
            <input type="text" placeholder="Crew name" value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createGroup()}
              style={input} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setView('list'); setError(''); }}
                style={{ ...btn, flex: 1, fontSize: '12px', color: '#666', backgroundColor: 'transparent',
                         border: '1px solid #3A2E14', padding: '12px' }}>
                BACK
              </button>
              <button onClick={createGroup} disabled={creating}
                style={{ ...btn, flex: 2, fontSize: '13px', color: BG, backgroundColor: BRONZE, padding: '12px' }}>
                {creating ? 'CREATING...' : 'CREATE'}
              </button>
            </div>
          </div>
        )}

        {view === 'join' && (
          <div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: BRONZE, fontSize: '16px',
                          letterSpacing: '3px', marginBottom: '16px' }}>
              JOIN A CREW
            </div>
            <input type="text" placeholder="Invite code" value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && joinGroup()}
              style={{ ...input, textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center',
                       fontFamily: 'Bebas Neue, sans-serif', fontSize: '18px' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setView('list'); setError(''); }}
                style={{ ...btn, flex: 1, fontSize: '12px', color: '#666', backgroundColor: 'transparent',
                         border: '1px solid #3A2E14', padding: '12px' }}>
                BACK
              </button>
              <button onClick={joinGroup}
                style={{ ...btn, flex: 2, fontSize: '13px', color: BG, backgroundColor: BRONZE, padding: '12px' }}>
                JOIN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CrewBest;
