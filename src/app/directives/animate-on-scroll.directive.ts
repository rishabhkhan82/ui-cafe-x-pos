import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appAnimateOnScroll]',
  standalone: true
})
export class AnimateOnScrollDirective implements OnInit, OnDestroy {
  @Input() animationClass: string = 'animate-fade-in-up';
  @Input() threshold: number = 0.15;
  @Input() rootMargin: string = '0px 0px -60px 0px';
  @Input() delay: number = 0;

  private observer: IntersectionObserver | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private hasAnimated = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.renderer.addClass(this.el.nativeElement, 'opacity-0');
    this.renderer.addClass(this.el.nativeElement, 'animate-duration-750');

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.hasAnimated = true;
            if (this.delay > 0) {
              this.timeoutId = setTimeout(() => this.applyAnimation(), this.delay);
            } else {
              this.applyAnimation();
            }
            this.observer?.unobserve(this.el.nativeElement);
          }
        });
      },
      {
        threshold: this.threshold,
        rootMargin: this.rootMargin
      }
    );

    this.observer.observe(this.el.nativeElement);
  }

  private applyAnimation(): void {
    this.renderer.removeClass(this.el.nativeElement, 'opacity-0');
    this.renderer.addClass(this.el.nativeElement, 'animate__animated');
    this.renderer.addClass(this.el.nativeElement, 'animate__fadeInUp');
    if (this.animationClass) {
      this.renderer.addClass(this.el.nativeElement, this.animationClass);
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }
  }
}
