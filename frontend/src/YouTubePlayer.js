import React, { useEffect, useRef, useState } from 'react';

let youTubeAPILoaded = false;
let youTubeAPILoading = false;
const playerCallbacks = [];

function loadYouTubeAPI() {
  if (youTubeAPILoaded) return Promise.resolve();
  if (youTubeAPILoading) {
    return new Promise(resolve => playerCallbacks.push(resolve));
  }
  youTubeAPILoading = true;
  return new Promise(resolve => {
    playerCallbacks.push(resolve);
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      youTubeAPILoaded = true;
      youTubeAPILoading = false;
      playerCallbacks.forEach(cb => cb());
      playerCallbacks.length = 0;
    };
  });
}

function YouTubePlayer({
  videoId,
  startSeconds = 0,
  volume = 20,
  playing = true,
  style = {}
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let destroyed = false;

    loadYouTubeAPI().then(() => {
      if (destroyed || !containerRef.current) return;

      const div = document.createElement('div');
      containerRef.current.appendChild(div);

      playerRef.current = new window.YT.Player(div, {
        videoId,
        playerVars: {
          autoplay: playing ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          start: Math.floor(startSeconds),
          mute: 0,
          playsinline: 1,
        },
        events: {
          onReady: (e) => {
            e.target.setVolume(volume);
            if (playing) e.target.playVideo();
            setReady(true);
          },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              e.target.seekTo(Math.floor(startSeconds));
              e.target.playVideo();
            }
          }
        }
      });
    });

    return () => {
      destroyed = true;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [videoId]);

  useEffect(() => {
    if (!playerRef.current || !ready) return;
    try {
      playerRef.current.setVolume(volume);
    } catch (e) {}
  }, [volume, ready]);

  useEffect(() => {
    if (!playerRef.current || !ready) return;
    try {
      if (playing) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (e) {}
  }, [playing, ready]);

  return (
    <div
      ref={containerRef}
      className="youtube-player-container"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        ...style
      }}
    >
      <style>{`
        .youtube-player-container iframe {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 177.78vh !important;
          height: 100vh !important;
          min-width: 100%;
          min-height: 56.25vw;
          border: none;
        }
      `}</style>
    </div>
  );
}

export default YouTubePlayer;