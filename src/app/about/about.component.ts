import { Component, OnInit, OnDestroy, ElementRef, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit, OnDestroy {
  @ViewChild('backgroundCardsContainer', { static: true }) backgroundCardsContainerRef!: ElementRef;

  private cardCreationInterval: any;
  private activeCards: HTMLElement[] = [];
  private maxCards = 10; // Max number of cards allowed on screen

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    this.cardCreationInterval = setInterval(() => {
      this.createCard();
    }, 500);
  }

  private createCard(): void {
    if (this.activeCards.length >= this.maxCards) {
      return; // Stop creating new cards if the limit is hit
    }

    // 1. Create the 'cardBox' div (which will now have the image as its background)
    const cardBox = this.renderer.createElement('div');
    this.renderer.addClass(cardBox, 'cardBox');

    // Set styles for the card BEFORE appending it to the DOM
    const randomLeft = Math.random() * 100;
    this.renderer.setStyle(cardBox, 'left', `${randomLeft}vw`);

    const randomDuration = 8 + Math.random() * 4;
    this.renderer.setStyle(cardBox, 'animation-duration', `${randomDuration}s`);

    // 2. Append the completed cardBox to our container
    if (this.backgroundCardsContainerRef && this.backgroundCardsContainerRef.nativeElement) {
      this.renderer.appendChild(this.backgroundCardsContainerRef.nativeElement, cardBox);

      this.activeCards.push(cardBox);

      // 3. Set up an event listener to remove the card once its animation finishes
      this.renderer.listen(cardBox, 'animationend', () => {
        this.removeCard(cardBox);
      });
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