import { useEffect, useRef } from 'react';

const UNLOCK_EVENTS = ['pointerdown', 'touchstart', 'click', 'keydown'];

const BackgroundMusic = ({ urls }) => {
  const audioRef = useRef(null);
  const indexRef = useRef(0);
  const unlockedRef = useRef(false);
  const unlockingRef = useRef(false);
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
    unlockedRef.current = false;
    unlockingRef.current = false;

    const removeUnlockListeners = () => {
      UNLOCK_EVENTS.forEach((event) => {
        window.removeEventListener(event, unlock, true);
      });
    };

    const playCurrent = () => {
      const a = audioRef.current;
      if (!a || !unlockedRef.current) return Promise.resolve();
      return a.play().catch(() => {});
    };

    const playNext = () => {
      if (list.length <= 1) {
        playCurrent();
        return;
      }
      indexRef.current = (indexRef.current + 1) % list.length;
      audio.src = list[indexRef.current];
      playCurrent();
    };

    const unlock = () => {
      if (unlockedRef.current || unlockingRef.current) return;
      const a = audioRef.current;
      if (!a) return;

      unlockingRef.current = true;
      a.play()
        .then(() => {
          unlockedRef.current = true;
          unlockingRef.current = false;
          removeUnlockListeners();
        })
        .catch(() => {
          unlockingRef.current = false;
        });
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        audio.pause();
      } else if (unlockedRef.current) {
        playCurrent();
      }
    };

    UNLOCK_EVENTS.forEach((event) => {
      window.addEventListener(event, unlock, { capture: true, passive: true });
    });
    audio.addEventListener('ended', playNext);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      removeUnlockListeners();
      audio.removeEventListener('ended', playNext);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
    };
  }, [urlsKey]);

  return null;
};

export default BackgroundMusic;
