'use client';

import { useEffect, useRef, useState } from 'react';

const TOP_ZONE = 0.42;    
const BOTTOM_ZONE = 0.58;  
const MAX_SPEED = 60;      
const FULL_SPEED_AT = 0.15; 

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

// One landmarker for the whole page, never closed.
let landmarkerPromise: Promise<any> | null = null;

function getLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
      const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
      return HandLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
        runningMode: 'VIDEO',
        numHands: 1,
      });
    })().catch((err) => {
      landmarkerPromise = null;
      throw err;
    });
  }
  return landmarkerPromise;
}




function scrollFromY(y: number): string {
  if (y < TOP_ZONE) {
    const power = Math.min(1, (TOP_ZONE - y) / FULL_SPEED_AT);
    window.scrollBy(0, -(8 + power * MAX_SPEED));
    return 'Hand up: scrolling up ↑';
  }
  if (y > BOTTOM_ZONE) {
    const power = Math.min(1, (y - BOTTOM_ZONE) / FULL_SPEED_AT);
    window.scrollBy(0, 8 + power * MAX_SPEED);
    return 'Hand down: scrolling down ↓';
  }
  return 'Hand in the middle (paused)';
}

export default function HandScroll() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);
  const [status, setStatus] = useState('');
  const [mode, setMode] = useState<'ai' | 'motion'>('ai');

  useEffect(() => {
    if (!on) return;

    // hide MediaPipe's harmless log lines so the Next.js overlay stays quiet
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      const first = typeof args[0] === 'string' ? args[0] : '';
      if (/^(INFO|WARNING|[IWE]\d{4}|===)/.test(first)) return;
      originalError(...args);
    };

    let cancelled = false;
    let raf = 0;
    let stream: MediaStream | null = null;

    (async () => {
      try {
        // 1) camera first, so the permission popup shows immediately
        setStatus('Allow camera access…');
        const s = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
        });
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = s;
        await video.play();

        // 2) try the AI model, fall back to motion mode if WebGL is missing
        let landmarker: any = null;
        let useMotion = false;
        setStatus('Loading hand tracking…');
        try {
          landmarker = await getLandmarker();
          setMode('ai');
        } catch (err) {
          console.warn('MediaPipe unavailable, using motion mode:', err);
          useMotion = true;
          setMode('motion');
        }
        if (cancelled) return;
        setStatus('Show your hand to the camera');

        // motion mode helpers
        const W = 64, H = 48;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        let bg: Float32Array | null = null;
        let smoothY = 0.5;

        let lastVideoTime = -1;
        let lastStamp = 0;
        let failures = 0;

        const loop = () => {
          if (cancelled) return;

          if (video.readyState >= 2 && video.videoWidth > 0 && video.currentTime !== lastVideoTime) {
            lastVideoTime = video.currentTime;

            if (!useMotion) {
              const stamp = Math.max(performance.now(), lastStamp + 1);
              lastStamp = stamp;
              try {
                const result = landmarker.detectForVideo(video, stamp);
                if (result.landmarks?.length) {
                  setStatus(scrollFromY(result.landmarks[0][9].y));
                } else {
                  setStatus('Show your hand to the camera');
                }
                failures = 0;
              } catch (err) {
                // WebGL is broken: switch to motion mode after a few failures
                if (++failures >= 3) {
                  console.warn('Detection failed, using motion mode:', err);
                  useMotion = true;
                  setMode('motion');
                }
              }
            } else {
              // motion mode: compare each frame with a slowly updating background
              ctx.drawImage(video, 0, 0, W, H);
              const px = ctx.getImageData(0, 0, W, H).data;
              if (!bg) {
                bg = new Float32Array(W * H);
                for (let i = 0; i < W * H; i++) bg[i] = px[i * 4 + 1];
              }
              let count = 0;
              let sumY = 0;
              for (let i = 0; i < W * H; i++) {
                const g = px[i * 4 + 1];
                if (Math.abs(g - bg[i]) > 35) {
                  count++;
                  sumY += Math.floor(i / W);
                }
                bg[i] += (g - bg[i]) * 0.004; // background slowly absorbs still objects
              }
              if (count > 60) {
                const y = sumY / count / H;
                smoothY = smoothY * 0.7 + y * 0.3;
                setStatus(scrollFromY(smoothY));
              } else {
                setStatus('Move your hand in front of the camera');
              }
            }
          }
          raf = requestAnimationFrame(loop);
        };
        loop();
      } catch (err: any) {
        console.warn('HAND SCROLL ERROR:', err);
        setStatus(
          err?.name === 'NotAllowedError'
            ? 'Camera blocked. Click the camera icon in the address bar, choose Allow, then try again.'
            : 'Could not start the camera.'
        );
        setOn(false);
      }
    })();

    return () => {
      console.error = originalError;
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [on]);

  return (
    <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 50, width: 200 }}>
      {on && (
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <video
            ref={videoRef}
            muted
            playsInline
            style={{ width: '100%', borderRadius: 8, transform: 'scaleX(-1)', background: '#000' }}
          />
          <div style={{ position: 'absolute', left: 0, right: 0, top: `${TOP_ZONE * 100}%`, borderTop: '1px dashed #fff' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: `${BOTTOM_ZONE * 100}%`, borderTop: '1px dashed #fff' }} />
        </div>
      )}

      {status && (
        <p style={{ fontSize: 12, background: '#fff', color: '#222', borderRadius: 6, padding: '4px 8px', marginBottom: 8 }}>
          {status}
          {on && mode === 'motion' ? ' (motion mode)' : ''}
        </p>
      )}

      <button
        onClick={() => { setOn((v) => !v); setStatus(''); }}
        style={{
          width: '100%', padding: '8px 12px', borderRadius: 999, border: 'none',
          background: on ? '#dc2626' : '#0f3d57', color: '#fff', fontWeight: 600, cursor: 'pointer',
        }}
      >
        {on ? 'Stop hand scroll' : '✋ Hand scroll'}
      </button>
    </div>
  );
}