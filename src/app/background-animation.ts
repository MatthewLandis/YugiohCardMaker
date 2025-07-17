import { Component, OnInit, OnDestroy, ElementRef, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-background-animation',
  template: `<div #backgroundCardsContainer class="background-cards-container"></div>`,
  styles: [`
.background-cards-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -10;
}

.cardBox {
  position: absolute;
  width: 12rem;
  height: 17.5rem;
  background-image: url('/assets/backgroundCard.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  animation: fall-spin 5s linear infinite;
}

@keyframes fall-spin {
  0% {
    transform: translate(0, -20vh) rotateY(0deg);
  }

  100% {
    transform: translate(0, 100vh) rotateY(360deg);
  }
}
  `]
})
export class BackgroundAnimationComponent implements OnInit, OnDestroy {
  @ViewChild('backgroundCardsContainer', { static: true }) backgroundCardsContainerRef!: ElementRef;
  private cardCreationInterval: any;
  private activeCards: HTMLElement[] = [];
  private maxCards = 10;

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    this.cardCreationInterval = setInterval(() => {
      this.createCard();
    }, 500);
  }

  private createCard(): void {
    if (this.activeCards.length >= this.maxCards) {
      return; 
    }

    const cardBox = this.renderer.createElement('div');
    this.renderer.addClass(cardBox, 'cardBox');

    const randomLeft = Math.random() * 100;
    this.renderer.setStyle(cardBox, 'left', `${randomLeft}vw`);

    const randomDuration = 8 + Math.random() * 4;
    this.renderer.setStyle(cardBox, 'animation-duration', `${randomDuration}s`);

    this.renderer.setStyle(cardBox, '--duration', `${randomDuration}s`);

    if (this.backgroundCardsContainerRef && this.backgroundCardsContainerRef.nativeElement) {
      this.renderer.appendChild(this.backgroundCardsContainerRef.nativeElement, cardBox);
      this.activeCards.push(cardBox);

      this.renderer.listen(cardBox, 'animationend', () => {
        this.removeCard(cardBox);
      });
    } else {
      console.error('Error: backgroundCardsContainerRef.nativeElement is not available. Check HTML template reference.');
    }
  }

  private removeCard(card: HTMLElement): void {
    if (this.backgroundCardsContainerRef && this.backgroundCardsContainerRef.nativeElement &&
      this.backgroundCardsContainerRef.nativeElement.contains(card)) {
      this.renderer.removeChild(this.backgroundCardsContainerRef.nativeElement, card);
    }
    this.activeCards = this.activeCards.filter(c => c !== card);
  }

  ngOnDestroy(): void {
    if (this.cardCreationInterval) {
      clearInterval(this.cardCreationInterval);
    }

    this.activeCards.forEach(card => {
      if (this.backgroundCardsContainerRef && this.backgroundCardsContainerRef.nativeElement &&
        this.backgroundCardsContainerRef.nativeElement.contains(card)) {
        this.renderer.removeChild(this.backgroundCardsContainerRef.nativeElement, card);
      }
    });
    this.activeCards = [];
  }
}