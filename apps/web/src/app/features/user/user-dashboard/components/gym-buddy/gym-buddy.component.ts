import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, effect, inject, input,
  signal, untracked, viewChild
} from '@angular/core';
import { BuddyFacts } from '../../../../../core/models/user-dashboard.model';
import { BuddyLine, buddyLines } from './buddy-lines';
import type { BuddyScene } from './buddy-scene';

/** How long each speech bubble stays up. */
const BUBBLE_MS = 3800;
const WARMING_UP: BuddyLine = { text: 'Warming up...', icon: 'fa-person-running' };

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** WebGL is available and the member hasn't asked for reduced motion. */
function canRender3d(): boolean {
  if (typeof window === 'undefined' || prefersReducedMotion()) return false;
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

/**
 * "Forgie", the dashboard's gym buddy: a 3D chibi coach that pops up, waves hello and chats about
 * the member's day. Falls back to a flat SVG buddy without WebGL or with reduced motion.
 */
@Component({
  selector: 'app-gym-buddy',
  standalone: true,
  templateUrl: './gym-buddy.component.html',
  styleUrl: './gym-buddy.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GymBuddyComponent {
  readonly facts = input<BuddyFacts | null>(null);

  readonly use3d = signal(canRender3d());
  readonly bubbleOpen = signal(false);
  readonly hopping = signal(false);
  private readonly lineIndex = signal(0);

  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly lines = computed(() => {
    const f = this.facts();
    return f ? buddyLines(f) : [WARMING_UP];
  });
  readonly line = computed(() => this.lines()[this.lineIndex() % this.lines().length]);
  readonly state = computed(() => this.facts()?.state ?? null);

  private scene: BuddyScene | null = null;
  private introPlayed = false;
  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    afterNextRender(() => this.start3d());

    effect(() => {
      const state = this.state();
      this.scene?.setMood(state);
      // Once today's workout is known, say hello and then what's on for today.
      if (state && !this.introPlayed) {
        this.introPlayed = true;
        untracked(() => this.intro());
      }
    });

    inject(DestroyRef).onDestroy(() => {
      this.clearTimers();
      this.scene?.dispose();
    });
  }

  private async start3d(): Promise<void> {
    const canvas = this.canvas()?.nativeElement;
    if (!this.use3d() || !canvas) return;
    try {
      const { createBuddyScene } = await import('./buddy-scene');
      this.scene = createBuddyScene(canvas);
      this.scene.setMood(this.state());
    } catch {
      this.use3d.set(false);
    }
  }

  private intro(): void {
    this.clearTimers();
    this.later(() => this.show(0), 450);
    this.later(() => this.show(1), 450 + BUBBLE_MS);
    this.later(() => this.bubbleOpen.set(false), 450 + BUBBLE_MS * 2);
  }

  /** Tap: hop, wave and say the next thing it knows. */
  poke(): void {
    this.clearTimers();
    this.scene?.cheer();
    this.hopping.set(false);
    requestAnimationFrame(() => this.hopping.set(true));
    this.later(() => this.hopping.set(false), 600);

    const next = this.bubbleOpen() || this.introPlayed ? this.lineIndex() + 1 : 0;
    this.introPlayed = true;
    this.show(next);
    this.later(() => this.bubbleOpen.set(false), BUBBLE_MS);
  }

  private show(index: number): void {
    this.lineIndex.set(index);
    this.bubbleOpen.set(true);
    if (index === 0) this.scene?.wave();
  }

  private later(fn: () => void, ms: number): void {
    this.timers.push(setTimeout(fn, ms));
  }

  private clearTimers(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }
}
