import { useEffect, useRef, useState, useCallback } from 'react';
import { AudioLinesIcon } from 'lucide-animated';
import { Play, Pause } from 'lucide-react';
import '../styles/music-player.css';

const UNLOCK_EVENTS = ['pointerdown', 'touchstart', 'click', 'keydown'];

function formatPlaylistOwner(restoName) {
  const raw = String(restoName || '').trim();
  if (!raw) return "Restaurant's";
  const titled = raw === raw.toUpperCase()
    ? raw.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : raw;
  return /[sS]$/.test(titled) ? titled + "'" : titled + "'s";
}

const BackgroundMusic = ({ urls, visible = true, restoName = '' }) => {
  const displayName = formatPlaylistOwner(restoName);
  const audioRef = useRef(null);
  const indexRef = useRef(0);
  const iconRef = useRef(null);
  const wantPlayingRef = useRef(false);
  const startedOnceRef = useRef(false);
  const unlockingRef = useRef(false);
  const removeUnlockRef = useRef(() => {});
  const [isPlaying, setIsPlaying] = useState(false);
  const urlsKey = (urls && urls.length) ? urls.join(',') : '';

  useEffect(() => {
    const list = urlsKey ? urlsKey.split(',') : [];
    if (list.length === 0) return undefined;

    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = 0.35;
    audio.playsInline = true;
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    audio.loop = list.length === 1;
    audio.src = list[0];
    audioRef.current = audio;
    indexRef.current = 0;
    wantPlayingRef.current = false;
    startedOnceRef.current = false;
    unlockingRef.current = false;
    setIsPlaying(false);

    const playCurrent = () => {
      const a = audioRef.current;
      if (!a) return Promise.resolve();
      return a.play().catch(() => {});
    };

    const playNext = () => {
      if (list.length <= 1) {
        if (wantPlayingRef.current) playCurrent();
        return;
      }
      indexRef.current = (indexRef.current + 1) % list.length;
      audio.src = list[indexRef.current];
      if (wantPlayingRef.current) playCurrent();
    };

    const removeUnlockListeners = () => {
      UNLOCK_EVENTS.forEach((event) => {
        window.removeEventListener(event, tryAutoStart, true);
      });
    };
    removeUnlockRef.current = removeUnlockListeners;

    const tryAutoStart = (event) => {
      if (startedOnceRef.current || unlockingRef.current) return;
      if (event?.target?.closest?.('.music-player-bar')) return;

      const a = audioRef.current;
      if (!a) return;

      unlockingRef.current = true;
      wantPlayingRef.current = true;
      a.play()
        .then(() => {
          startedOnceRef.current = true;
          unlockingRef.current = false;
          removeUnlockListeners();
        })
        .catch(() => {
          unlockingRef.current = false;
          wantPlayingRef.current = false;
        });
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    const onVisibilityChange = () => {
      if (document.hidden) {
        audio.pause();
      } else if (wantPlayingRef.current) {
        playCurrent();
      }
    };

    UNLOCK_EVENTS.forEach((event) => {
      window.addEventListener(event, tryAutoStart, { capture: true, passive: true });
    });
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', playNext);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      removeUnlockListeners();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', playNext);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      wantPlayingRef.current = false;
      startedOnceRef.current = false;
      unlockingRef.current = false;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
      setIsPlaying(false);
    };
  }, [urlsKey]);

  useEffect(() => {
    const icon = iconRef.current;
    if (!icon) return;
    if (isPlaying) {
      icon.startAnimation?.();
    } else {
      icon.stopAnimation?.();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!visible || !urlsKey) {
      document.body.classList.remove('has-music-player');
      return undefined;
    }
    document.body.classList.add('has-music-player');
    return () => document.body.classList.remove('has-music-player');
  }, [visible, urlsKey]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      wantPlayingRef.current = false;
      audio.pause();
      return;
    }

    wantPlayingRef.current = true;
    unlockingRef.current = true;
    audio.play()
      .then(() => {
        startedOnceRef.current = true;
        unlockingRef.current = false;
        removeUnlockRef.current?.();
      })
      .catch(() => {
        unlockingRef.current = false;
        wantPlayingRef.current = false;
        setIsPlaying(false);
      });
  }, []);

  if (!urlsKey || !visible) return null;

  const statusText = isPlaying
    ? 'Playing the ' + displayName + ' playlist'
    : 'Play the ' + displayName + ' playlist';

  return (
    <div className="music-player-bar" role="region" aria-label={displayName + ' playlist'}>
      <div className="music-player-left">
        <AudioLinesIcon
          ref={iconRef}
          size={30}
          animateOnHover={false}
          className="music-player-waves"
          style={{ color: '#ffffff' }}
        />
        <span className="music-player-text">
          {statusText}
        </span>
      </div>
      <button
        type="button"
        className="music-player-toggle"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause playlist' : 'Play playlist'}
      >
        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
      </button>
    </div>
  );
};

export default BackgroundMusic;
