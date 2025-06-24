import { Component, OnInit, OnDestroy, ElementRef, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit, OnDestroy {
  // ViewChild allows us to get a reference to a DOM element from our template
  // We're looking for the div with the class 'background-cards-container'
  @ViewChild('backgroundCardsContainer', { static: true }) backgroundCardsContainerRef!: ElementRef;

  private cardCreationInterval: any; // Stores the interval ID for creating new cards
  private activeCards: HTMLElement[] = []; // Keeps track of card elements currently in the DOM
  private maxCards: number = 10; // NEW: Define the maximum number of cards allowed on screen

  constructor(private renderer: Renderer2) { } // Inject Renderer2 for safe DOM manipulation

  ngOnInit(): void {
    // Start creating cards when the component initializes
    // We'll create a new card every 500 milliseconds (0.5 seconds)
    this.cardCreationInterval = setInterval(() => {
      this.createCard();
    }, 500);
  }

  // This method creates a single card element and adds it to the DOM
  private createCard(): void {
    // NEW: Check if we've reached the maximum number of active cards
    if (this.activeCards.length >= this.maxCards) {
      // console.log('Max cards reached. Not creating new card.'); // For debugging
      return; // Stop creating new cards if the limit is hit
    }

    // 1. Create the outer 'cardBox' div
    const cardBox = this.renderer.createElement('div');
    this.renderer.addClass(cardBox, 'cardBox');

    // 2. Create the inner 'cardOval' div
    const cardOval = this.renderer.createElement('div');
    this.renderer.addClass(cardOval, 'cardOval');
    
    // Append the oval to the box
    this.renderer.appendChild(cardBox, cardOval);

    // Set styles for the card BEFORE appending it to the DOM
    // This ensures the styles are applied immediately when the element is rendered
    
    // Randomize initial horizontal position (from left to right across the screen)
    const randomLeft = Math.random() * 100; // Value between 0 and 100
    this.renderer.setStyle(cardBox, 'left', `${randomLeft}vw`);

    // Randomize animation duration for variety in fall speed
    const randomDuration = 8 + Math.random() * 4; // Between 8 and 12 seconds
    this.renderer.setStyle(cardBox, 'animation-duration', `${randomDuration}s`);

    // 3. Append the completed cardBox to our container
    // It's good practice to check if the nativeElement exists before using it
    if (this.backgroundCardsContainerRef && this.backgroundCardsContainerRef.nativeElement) {
      this.renderer.appendChild(this.backgroundCardsContainerRef.nativeElement, cardBox);

      // Add the card to our active cards array
      this.activeCards.push(cardBox);
      
      // 4. Set up an event listener to remove the card once its animation finishes
      // This prevents memory leaks and keeps the DOM clean
      this.renderer.listen(cardBox, 'animationend', () => {
        this.removeCard(cardBox);
      });
    } else {
      console.error('Error: backgroundCardsContainerRef.nativeElement is not available. Check HTML template reference.');
    }
  }

  // This method removes a card from the DOM and our activeCards array
  private removeCard(card: HTMLElement): void {
    // Ensure the container and the card exist before attempting to remove
    if (this.backgroundCardsContainerRef && this.backgroundCardsContainerRef.nativeElement && 
        this.backgroundCardsContainerRef.nativeElement.contains(card)) {
      this.renderer.removeChild(this.backgroundCardsContainerRef.nativeElement, card);
    }
    // Remove the card from our tracking array
    this.activeCards = this.activeCards.filter(c => c !== card);
  }

  // Clean up when the component is destroyed
  ngOnDestroy(): void {
    // Clear the interval to stop creating new cards
    if (this.cardCreationInterval) {
      clearInterval(this.cardCreationInterval);
    }

    // Remove all active cards from the DOM to prevent memory leaks
    // Use a loop to remove each card safely
    this.activeCards.forEach(card => {
      if (this.backgroundCardsContainerRef && this.backgroundCardsContainerRef.nativeElement && 
          this.backgroundCardsContainerRef.nativeElement.contains(card)) {
        this.renderer.removeChild(this.backgroundCardsContainerRef.nativeElement, card);
      }
    });
    this.activeCards = []; // Clear the array after removing all elements
  }
}
