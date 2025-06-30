import { Component, OnInit } from '@angular/core';
import html2canvas from 'html2canvas';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { OnDestroy, ElementRef, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-cardmaker',
  templateUrl: './cardmaker.component.html',
  styleUrls: ['./cardmaker.component.css'],
})
export class CardMakerComponent implements OnInit, OnDestroy {

  @ViewChild('backgroundCardsContainer', { static: true }) backgroundCardsContainerRef!: ElementRef;
  private cardCreationInterval: any; // Stores the interval ID for creating new cards
  private activeCards: HTMLElement[] = []; // Keeps track of card elements currently in the DOM
  private maxCards: number = 20; // NEW: Define the maximum number of cards allowed on screen

  Template = 'Normal';
  Templates = ['Normal', 'Effect', 'Ritual', 'Fusion', 'Synchro', 'Xyz', 'Link', 'Token', 'Spell', 'Trap',
    'Skill', 'Slifer', 'Obelisk', 'Ra', 'DarkSynchro', 'LegendaryDragon'];
  CoreTemplates = ['Ritual', 'Fusion', 'Synchro', 'DarkSynchro', 'Xyz', 'Link'];
  DivineBeasts = ['Slifer', 'Obelisk', 'Ra'];
  PendulumTemplate = false;

  Attribute = 'Earth';
  Attributes = ['Dark', 'Light', 'Earth', 'Wind', 'Fire', 'Water', 'Divine', 'Spell', 'Trap', 'No Attribute'];

  CardTitle = {
    Title: 'Bitron',
    TitleStyle: 'Rare',
    TitleStyles: ['Common', 'Rare', 'SecretRare', 'UltraRare', 'Skill']
  };

  LevelType: 'Level' | 'Rank' | 'NLevel' | '' = 'Level'; // Added '' to LevelType for skill/link templates
  Stats = {
    Attack: '200',
    Defense: '2000',
    LevelValue: 2,
    LevelType: 'Level',
    LinkRating: 3,
    PendulumScale: 4
  };

  loreOrEffect: 'lore' | 'effect' = 'lore';
  text = {
    lore: "A new species found in electronic space. There's not much information on it.",
    pendulum: 'Once per turn: You can target 1 face-up monster your opponent controls; halve its original ATK.'
  };

  MonsterTypes = {
    Primary: 'Cyberse',
    Core: '',
    Ability: '',
    Last: 'Normal',
  };

  MonsterTypesList = {
    Primary: ['Aqua', 'Beast', 'Beast-Warrior', 'Creator God', 'Cyberse', 'Dinosaur', 'Divine-Beast', 'Dragon',
      'Fairy', 'Fiend', 'Fish', 'Insect', 'Illusion', 'Machine', 'Plant', 'Psychic', 'Pyro', 'Reptile',
      'Rock', 'Sea Serpent', 'Spellcaster', 'Thunder', 'Warrior', 'Winged Beast', 'Wyrm', 'Zombie'],
    Core: ['', 'Ritual', 'Fusion', 'Synchro', 'Dark Synchro', 'Xyz', 'Pendulum', 'Link'],
    Pendulum: 'Pendulum',
    Ability: ['', 'Tuner', 'Spirit', 'Union', 'Gemini', 'Toon', 'Flip'],
    Last: ['', 'Effect', 'Normal', 'Token', 'Skill']
  };
  showCoreType = false;
  showAbilityType = false;

  linkArrows = {
    topLeft: false,
    top: true,
    topRight: false,
    left: false,
    right: false,
    bottomLeft: true,
    bottom: false,
    bottomRight: true
  };

  underLine = 'atkDef';
  LevelRankScales = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

  SpellTrapType = 'Normal';
  SpellTrapTypes: { Spell: string[], Trap: string[] } = { // Explicitly type SpellTrapTypes
    Spell: ['Normal', 'Continuous', 'Equip', 'Ritual', 'QuickPlay', 'Field'],
    Trap: ['Normal', 'Continuous', 'Counter']
  };

  private canvas!: HTMLCanvasElement; // Declare canvas as HTMLCanvasElement
  private context!: CanvasRenderingContext2D; // Declare context as CanvasRenderingContext2D

  constructor(
    private renderer: Renderer2,
    private http: HttpClient,
    private router: Router
  ) { }




  currentScale: number =1.0;


ngOnInit(): void {
    // Start creating cards when the component initializes
    // We'll create a new card every 500 milliseconds (0.5 seconds)
    this.cardCreationInterval = setInterval(() => {
      this.createCard();
    }, 500);

    // Initialize canvas and context here
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;

    const cardPrintArea = document.getElementById('card-print-area') as HTMLElement | null;
    const magnifierSlider = document.getElementById('magnifier-scale') as HTMLInputElement | null;
    const currentScaleSpan = document.getElementById('current-scale') as HTMLSpanElement | null;

    if (cardPrintArea && magnifierSlider && currentScaleSpan) {
        this.currentScale = parseFloat(magnifierSlider.value);
        cardPrintArea.style.transform = `scale(${this.currentScale})`;
        currentScaleSpan.textContent = `${Math.round(this.currentScale * 100)}%`;

        magnifierSlider.addEventListener('input', (event: Event) => { // Using Event type for input event
            const target = event.target as HTMLInputElement; // Asserting target as HTMLInputElement
            this.currentScale = parseFloat(target.value);
            cardPrintArea.style.transform = `scale(${this.currentScale})`;
            currentScaleSpan.textContent = `${Math.round(this.currentScale * 100)}%`;
        });
    }

    // Call initial adjustment methods
    this.autoTitleTextAdjustment();
    this.autoMonsterTypeAdjustment();
    this.adjustEffectText();
    this.adjustPendulumEffectText(); // Will run even if PendulumTemplate is false
    this.adjustSpellEffectText();
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
  private removeCard(cardBox: HTMLElement): void {
    // Remove from DOM
    if (this.backgroundCardsContainerRef && this.backgroundCardsContainerRef.nativeElement) {
      this.renderer.removeChild(this.backgroundCardsContainerRef.nativeElement, cardBox);
    }
    // Remove from activeCards array
    const index = this.activeCards.indexOf(cardBox);
    if (index > -1) {
      this.activeCards.splice(index, 1);
    }
  }

  ngOnDestroy(): void {
    // Clean up the interval when the component is destroyed
    if (this.cardCreationInterval) {
      clearInterval(this.cardCreationInterval);
    }
  }

  templateUpdate(event: Event) {
    this.Template = (event.target as HTMLSelectElement).value;
    this.updateTitleStyle();
    this.updateAttribute();
    this.updateLevelType();
    this.updatePrimaryMonsterType();
    this.updateCoreMonsterType();
    this.updateLastMonsterType();
    this.updateUnderline();
    this.resetSpellTrapType();
    this.pendulumUpdate();
  }

  pendulumUpdate() {
    const pendulumCover = [ 'Effect', 'normal', 'fusion', 'synchro'];
    pendulumCover.includes(this.Template)
    this.PendulumTemplate = false;
  }

  updateTitleStyle() {
    this.CardTitle.TitleStyle = this.Template === 'Skill' ? 'Skill' :
    (['Spell', 'Trap', 'Xyz'].includes(this.Template) ? 'Rare' : 'Common'); // Corrected ternary assignment
  }

  updateAttribute() {
    this.Attribute =
      this.Template === 'Spell' ? 'Spell' :
      this.Template === 'Trap' ? 'Trap' :
      this.DivineBeasts.includes(this.Template) ? 'Divine' : 'Dark';
  }

  updateLevelType() {
    const noLevelTemplates = ['Spell', 'Trap', 'Skill', 'Link', 'Legendary Dragon'];

    this.Stats.LevelType =
      this.Template === 'Xyz' ? 'Rank' :
      this.Template === 'Dark Synchro' ? 'NLevel' :
      noLevelTemplates.includes(this.Template) ? '' : 'Level';

    this.Stats.LevelValue = this.DivineBeasts.includes(this.Template) ? 10 : this.Stats.LevelValue;
  }

  updatePrimaryMonsterType() {
    this.MonsterTypes.Primary = this.Template === 'Legendary Dragon' ? 'Legendary Dragon' :
      (this.DivineBeasts.includes(this.Template) ? 'Divine-Beast' : this.MonsterTypes.Primary); // Corrected ternary
  }

  updateCoreMonsterType() {
    this.MonsterTypes.Core = this.CoreTemplates.includes(this.Template) ? this.Template : '';
  }

  updateLastMonsterType() {
    const effectTemplates = ['Effect', 'Slifer', 'Obelisk', 'Ra', 'Skill'];

    this.MonsterTypes.Last =
      this.Template === 'Normal' ? 'Normal' :
      this.Template === 'Token' ? 'Token' :
      this.Template === 'Skill' ? 'Skill' :
      this.CoreTemplates.includes(this.Template) ? (this.loreOrEffect === 'effect' ? 'Effect' : '') :
      (effectTemplates.includes(this.Template) ? 'Effect' : this.MonsterTypes.Last); // Corrected ternary

    this.loreOrEffect =
      this.Template === 'Normal' || this.Template === 'Token' ? 'lore' :
      (effectTemplates.includes(this.Template) ? 'effect' : this.loreOrEffect); // Corrected ternary
  }

  setLoreOrEffect(option: 'lore' | 'effect') {
    this.loreOrEffect = option; // Set the loreOrEffect directly based on option
    // Re-evaluate Template and MonsterTypes.Last based on new loreOrEffect
    this.Template = this.loreOrEffect === 'effect' && this.Template === 'Normal' ? 'Effect' :
                    this.loreOrEffect === 'lore' && this.Template === 'Effect' ? 'Normal' :
                    this.Template;
    this.updateLastMonsterType(); // Re-run to update MonsterTypes.Last
    this.autoMonsterTypeAdjustment(); // Adjust monster type text scale after update
  }

  updateUnderline() {
    this.underLine = this.Template === 'Link' ? 'atkLink' : 'atkDef';
    this.Stats.Defense = this.Template === 'Link' ? '' : '2100';
  }

  updateLinkRating() {
    this.Stats.LinkRating = Object.values(this.linkArrows).filter(Boolean).length;
  }

  resetSpellTrapType() {
    // Check if current SpellTrapType is valid for the new Template
    if (['Spell', 'Trap'].includes(this.Template)) {
      const validTypes = this.SpellTrapTypes[this.Template as 'Spell' | 'Trap'];
      if (!validTypes.includes(this.SpellTrapType)) {
        this.SpellTrapType = 'Normal'; // Reset to 'Normal' if current type is invalid
      }
    } else {
      this.SpellTrapType = 'Normal'; // Reset for non-Spell/Trap templates
    }
  }

  imageUrl: string | null = null;
  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.imageUrl = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

   saveCard() {
    const displayElement = document.querySelector('.print') as HTMLElement;
    const magnifierSlider = document.getElementById('magnifier-scale') as HTMLInputElement | null;

    if (displayElement && magnifierSlider) {
      const originalTransform = displayElement.style.transform;
      // Set the transform to the maximum scale value for clarity in print
      displayElement.style.transform = `scale(${magnifierSlider.max})`;

      html2canvas(displayElement).then((canvas) => {
        const cardImage = canvas.toDataURL('image/png');

        // Restore original transform after capturing
        displayElement.style.transform = originalTransform;

        const link = document.createElement('a');
        link.href = cardImage;
        link.download = `${this.CardTitle.Title}.png`;
        link.click();
      }).catch(error => {
        console.error('Error generating card image:', error);
      });
    } else {
        console.error('Display element or magnifier slider not found.');
    }
    console.log('Generate Image button clicked!');
  }

  scaleTitle = 1;
  autoTitleTextAdjustment() {
    const cardTitleElement = document.querySelector('.CardTitle') as HTMLElement;
    if (!cardTitleElement) return;

    const computedStyle = window.getComputedStyle(cardTitleElement);
    this.context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    const textWidth = this.context.measureText(this.CardTitle.Title).width;
    const textboxWidth = 318; // Matches the fixed width in CSS TitleTextbox

    this.scaleTitle = textWidth > textboxWidth ? textboxWidth / textWidth : 1;
    // Update the style directly if not using Angular's [style.transform] binding for some reason
    // cardTitleElement.style.transform = `scaleX(${this.scaleTitle * 0.96})`; // Applied in HTML binding
  }

  scaleMonsterType = 1;
  autoMonsterTypeAdjustment() {
    const monsterTypeElement = document.querySelector('.monsterType') as HTMLElement;
    if (!monsterTypeElement) return;

    const computedStyle = window.getComputedStyle(monsterTypeElement);
    this.context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    let monsterTypeText = '[' + this.MonsterTypes.Primary +
      (this.MonsterTypes.Core ? '/' + this.MonsterTypes.Core : '') +
      (this.PendulumTemplate ? '/Pendulum' : '') +
      (this.MonsterTypes.Ability ? '/' + this.MonsterTypes.Ability : '') +
      (this.MonsterTypes.Last ? '/' + this.MonsterTypes.Last : '') + ']';

    const textWidth = this.context.measureText(monsterTypeText).width;
    const textboxWidth = 672; // Matches the fixed width in CSS

    this.scaleMonsterType = textWidth > textboxWidth ? textboxWidth / textWidth : 1;
    // monsterTypeElement.style.transform = `scaleX(${this.scaleMonsterType})`; // Applied in HTML binding
  }

  scaleEffect = 1;
  adjustEffectText() {
    const loreTextElement = document.querySelector('.loreText') as HTMLElement;
    if (!loreTextElement) return;

    const computedStyle = window.getComputedStyle(loreTextElement);
    this.context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    // Measure the text as if it were on a single line for scaling calculation
    const actualWidth = this.context.measureText(this.text.lore).width;
    const desiredWidth = 3165; // This seems like a very large pixel value, potentially for a high-res image

    this.scaleEffect = Math.min(1, desiredWidth / actualWidth);

    // If you apply scaleEffect using [style.transform] in HTML, you don't need this line.
    // loreTextElement.style.width = `${100 / this.scaleEffect}%`;
  }

  scalePendulumEffect = 1;
  adjustPendulumEffectText() {
    const pendulumTextElement = document.querySelector('.PendulumText') as HTMLElement;
    if (!pendulumTextElement) return;

    const computedStyle = window.getComputedStyle(pendulumTextElement);
    this.context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    const actualWidth = this.context.measureText(this.text.pendulum).width;
    const desiredWidth = 2250; // Similarly large value

    this.scalePendulumEffect = actualWidth > desiredWidth ? desiredWidth / actualWidth : 1;

    // If you apply scalePendulumEffect using [style.transform] in HTML, you don't need this line.
    // pendulumTextElement.style.width = `${100 * 1 / this.scalePendulumEffect}%`;
  }

  SpellscaleEffect = 1;
  adjustSpellEffectText() {
    const spellTextElement = document.querySelector('.spellText') as HTMLElement;
    if (!spellTextElement) return;

    const computedStyle = window.getComputedStyle(spellTextElement);
    this.context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    const textWidth = this.context.measureText(this.text.lore).width; // Assuming lore text is used for spell text
    const textboxWidth = 4400; // Similarly large value

    this.SpellscaleEffect = textWidth > textboxWidth ? textboxWidth / textWidth : 1;
  }
}
