import { _decorator, AudioClip, AudioSource, resources, error, clamp01 } from 'cc';

export class AudioService {
  private static _instance: AudioService | null = null;
  private audioSource: AudioSource | null = null;
  private bgmVolume = 0.5;
  private sfxVolume = 1.0;

  public static get instance(): AudioService {
    if (!this._instance) {
      this._instance = new AudioService();
    }
    return this._instance;
  }

  /**
   * Initialize with an AudioSource component (usually from AppRoot).
   * @param source Cocos AudioSource component
   */
  public init(source: AudioSource) {
    this.audioSource = source;
  }

  /**
   * Play a sound effect by name (loaded from resources/audio/sfx).
   * @param name Clip name
   */
  public playSFX(name: string) {
    if (!this.audioSource) return;

    // In a real implementation, we would load from bundle/resources.
    // For MVP/Code-only, we'll try to load or just log if missing.
    const path = `audio/sfx/${name}`;
    resources.load(path, AudioClip, (err, clip) => {
      if (err) {
        // console.warn(`[Audio] Missing SFX: ${name}`); // Suppressed for MVP noise
        return;
      }
      this.audioSource!.playOneShot(clip, this.sfxVolume);
    });
  }

  /**
   * Play background music.
   * @param name Clip name
   */
  public playBGM(name: string) {
    if (!this.audioSource) return;

    const path = `audio/bgm/${name}`;
    resources.load(path, AudioClip, (err, clip) => {
      if (err) {
        // console.warn(`[Audio] Missing BGM: ${name}`);
        return;
      }
      this.audioSource!.stop();
      this.audioSource!.clip = clip;
      this.audioSource!.loop = true;
      this.audioSource!.volume = this.bgmVolume;
      this.audioSource!.play();
    });
  }

  public setBGMVolume(vol: number) {
    this.bgmVolume = clamp01(vol);
    if (this.audioSource && this.audioSource.clip) {
      this.audioSource.volume = this.bgmVolume;
    }
  }

  public setSFXVolume(vol: number) {
    this.sfxVolume = clamp01(vol);
  }
}
