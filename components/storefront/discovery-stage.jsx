'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Maximize2, Pause, Play } from 'lucide-react';
import { designSystemRuntimeContract } from '../../lib/design-system/runtime-contract.js';
import { EXCEPTION_STATES, ExceptionWidget } from './exception-widget.jsx';

/*
 * Screen 03 — Discovery, default video stage.
 *
 * "Central portrait runway view; compose the approved source at 4:5. Two approved clips play in
 * sequence: Fit & Silhouette, then Runway Motion. Muted autoplay plays the complete sequence twice,
 * then stops on the final frame with centred Play. Show Play/Pause, progress and the three position
 * dashes while playing. The third position stays unavailable until an approved asset exists."
 *
 * The clips this stage is given have already passed the media readiness gate, so it never has to
 * decide whether an asset is legitimate — only whether the browser could actually play it. A
 * playback error demotes the stage to the appendix "Video unavailable" widget, which the workbook
 * requires to leave product details and the gallery reachable.
 */
const COMPLETE_SEQUENCES = 2;

function formatTime(seconds) {
  const whole = Math.max(0, Math.floor(seconds || 0));
  return `${String(Math.floor(whole / 60)).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`;
}

export function DiscoveryVideoStage({
  caption = 'Model video',
  declaredClips = [],
  onOpenGallery,
  posterOnly = false,
  suspended = false,
}) {
  const videoRef = useRef(null);
  const stageRef = useRef(null);
  const playableClips = useMemo(() => declaredClips.filter(clip => clip.motionAllowed), [declaredClips]);
  const [activeSlotId, setActiveSlotId] = useState(playableClips[0]?.slotId || null);
  const [sequencesCompleted, setSequencesCompleted] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageActive, setPageActive] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackFailed, setPlaybackFailed] = useState(false);

  const activeClip = playableClips.find(clip => clip.slotId === activeSlotId) || playableClips[0] || null;
  const posterClip = activeClip || declaredClips.find(clip => clip.posterUrl) || null;
  const held = sequencesCompleted >= COMPLETE_SEQUENCES;
  const shouldPlay = Boolean(activeClip)
    && !posterOnly
    && !playbackFailed
    && !userPaused
    && !reducedMotion
    && inView
    && pageActive
    && !suspended
    && !held;

  useEffect(() => {
    const query = window.matchMedia(designSystemRuntimeContract.media.reducedMotion);
    const apply = event => setReducedMotion(event.matches);
    apply(query);
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const target = stageRef.current;
    if (!target) return undefined;
    const observer = new IntersectionObserver(
      entries => {
        const isVisible = Boolean(entries[0]?.isIntersecting);
        setInView(isVisible);
      },
      { threshold: [0, 0.1, 0.5] }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleVisibility = () => setPageActive(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    if (shouldPlay) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [shouldPlay, activeSlotId, activeClip?.sourceUrl]);

  const selectClip = useCallback(slotId => {
    setActiveSlotId(slotId);
    setSequencesCompleted(0);
    setElapsed(0);
    setUserPaused(false);
    setPlaybackFailed(false);
  }, []);

  /*
   * One complete sequence is every approved clip from first to last. After the second sequence, the
   * stage holds the last clip's final frame and the centred Play becomes a replay control.
   */
  const handleEnded = () => {
    const activeIndex = playableClips.findIndex(clip => clip.slotId === activeClip?.slotId);
    const nextClip = activeIndex >= 0 ? playableClips[activeIndex + 1] : null;

    if (nextClip) {
      setActiveSlotId(nextClip.slotId);
      setElapsed(0);
      return;
    }

    const completed = sequencesCompleted + 1;
    if (completed < COMPLETE_SEQUENCES && playableClips[0]) {
      setSequencesCompleted(completed);
      setActiveSlotId(playableClips[0].slotId);
      setElapsed(0);
      return;
    }

    videoRef.current?.pause();
    setSequencesCompleted(completed);
  };

  const toggleMotion = () => {
    const video = videoRef.current;
    if (held) {
      setActiveSlotId(playableClips[0]?.slotId || null);
      setSequencesCompleted(0);
      setElapsed(0);
      setUserPaused(false);
      return;
    }
    if (userPaused) {
      if (video) video.play().catch(() => {});
      setUserPaused(false);
    } else {
      if (video) video.pause();
      setUserPaused(true);
    }
  };

  /*
   * Appendix "Video unavailable". The 4:5 frame and its verified first-frame poster stay in place so
   * the page does not reflow, and the widget keeps the two recoveries the workbook names.
   */
  if (playbackFailed || (!activeClip && !posterClip)) {
    return (
      <div ref={stageRef} className="cp-stage" data-stage-state="unavailable">
        <div className="cp-stage-frame">
          {posterClip?.posterUrl && (
            <Image
              src={posterClip.posterUrl}
              alt={posterClip.alt}
              fill
              sizes={designSystemRuntimeContract.imageSizes.productStage}
              className="cp-stage-poster"
            />
          )}
          <div className="cp-stage-exception">
            <ExceptionWidget
              state={EXCEPTION_STATES.videoUnavailable}
              actions={[
                { label: 'Try again', emphasis: 'solid', onAction: () => selectClip(playableClips[0]?.slotId || null) },
                { label: 'View gallery', onAction: onOpenGallery },
              ]}
            />
          </div>
        </div>
      </div>
    );
  }

  const motionPlaying = shouldPlay && !held;
  const progressMax = duration > 0 ? duration : 1;

  return (
    <div
      ref={stageRef}
      className="cp-stage"
      data-stage-state={motionPlaying ? 'playing' : held ? 'held' : 'paused'}
      data-ready-clips={playableClips.length}
    >
      <div className="cp-stage-frame">
        {activeClip && !posterOnly ? (
          <video
            key={activeClip.slotId}
            ref={videoRef}
            src={activeClip.sourceUrl}
            poster={activeClip.posterUrl || undefined}
            autoPlay
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            aria-label={activeClip.alt}
            className="cp-stage-video"
            onCanPlay={event => {
              event.currentTarget.defaultMuted = true;
              event.currentTarget.muted = true;
              event.currentTarget.playsInline = true;
              if (shouldPlay) {
                event.currentTarget.play().catch(() => {});
              }
            }}
            onLoadedMetadata={event => {
              event.currentTarget.defaultMuted = true;
              event.currentTarget.muted = true;
              event.currentTarget.playsInline = true;
              setDuration(event.currentTarget.duration || 0);
              if (shouldPlay) {
                event.currentTarget.play().catch(() => {});
              }
            }}
            onTimeUpdate={event => setElapsed(event.currentTarget.currentTime || 0)}
            onEnded={handleEnded}
            onError={() => setPlaybackFailed(true)}
          />
        ) : posterClip?.posterUrl ? (
          <Image
            src={posterClip.posterUrl}
            alt={posterClip.alt}
            fill
            priority
            sizes={designSystemRuntimeContract.imageSizes.productStage}
            className="cp-stage-poster"
          />
        ) : null}

        {!activeClip?.sourceUrl && caption ? (
          <p className="cp-stage-caption">{caption}</p>
        ) : null}

        {held && activeClip && !posterOnly && (
          <button type="button" onClick={toggleMotion} className="cp-stage-resume" aria-label="Replay product video">
            <Play className="cp-icon cp-icon-medium" aria-hidden="true" />
          </button>
        )}

        <div className="cp-stage-controls">
          {activeClip && !posterOnly && (
            <>
              <button
                type="button"
                onClick={toggleMotion}
                className="cp-stage-control"
                aria-pressed={motionPlaying}
                aria-label={motionPlaying ? 'Pause product video' : held ? 'Replay product video' : 'Play product video'}
                data-motion-control="true"
              >
                {motionPlaying ? <Pause className="cp-icon cp-icon-small" /> : <Play className="cp-icon cp-icon-small" />}
              </button>
              <progress
                className="cp-stage-progress"
                max={progressMax}
                value={elapsed}
                aria-label="Playback position"
              />
              <button
                type="button"
                onClick={onOpenGallery}
                className="cp-stage-control"
                aria-label="Open product media overlay"
              >
                <Maximize2 className="cp-icon cp-icon-small" />
              </button>
              <span className="cp-stage-timestamp cp-visually-hidden" aria-live="polite">
                {formatTime(elapsed)} / {formatTime(duration)}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="cp-stage-dashes" role="tablist" aria-label="Discovery videos">
        {declaredClips.map(clip => (
          <button
            key={clip.slotId}
            type="button"
            role="tab"
            disabled={!clip.motionAllowed}
            aria-selected={clip.slotId === activeClip?.slotId}
            aria-label={clip.motionAllowed ? `Show ${clip.label}` : `${clip.label} is not yet available`}
            onClick={() => selectClip(clip.slotId)}
            className={clip.slotId === activeClip?.slotId ? 'cp-stage-dash cp-stage-dash-active' : 'cp-stage-dash'}
          />
        ))}
      </div>
    </div>
  );
}
