import { Component, OnInit, OnDestroy, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { toPng } from 'html-to-image';

@Component({
  selector: 'app-cardmaker',
  templateUrl: './cardmaker.component.html',
  styleUrls: ['./cardmaker.component.css'],
})
export class CardMakerComponent implements OnInit, OnDestroy { 
  // --- Background Card Animation Properties and References ---
  @ViewChild('backgroundCardsContainer', { static: true }) backgroundCardsContainerRef!: ElementRef;
  private cardCreationInterval: any;
  private activeCards: HTMLElement[] = [];
  private maxCards = 10;

  // --- Card Preview States  ---
  template = 'Normal';
  pendulumTemplate = false;
  titleStyle = 'Rare';
  title = 'Bitron';
  attribute = 'Earth';
  level = 2;
  spellTrapType = 'Normal';

  // Monster Settings
  primaryMonsterType = 'Cyberse';
  coreMonsterType = '';
  abilityMonsterType = '';
  lastMonsterType = '';
  attack = '200';
  defense = '2000';
  levelType = 'Level';
  linkRating = 3;

  // Card Text Settings
  effectText = "A new species found in electronic space. There's not much information on it.";
  pendulumScale = 4;
  pendulumEffectText = "Once per turn: You can target 1 face-up monster your opponent controls; halve its original ATK.";

  // --- Card Array data Holders (Your existing properties) ---
  templates = ['Normal', 'Effect', 'Ritual', 'Fusion', 'Synchro', 'Xyz', 'Link', 'Token', 'Spell', 'Trap',
    'Skill', 'Slifer', 'Obelisk', 'Ra', 'Dark Synchro', 'Legendary Dragon'];
  coreTemplates = ['Ritual', 'Fusion', 'Synchro', 'Dark Synchro', 'Xyz', 'Link'];
  titleStyles = ['Common', 'Rare', 'SecretRare', 'UltraRare', 'Skill'];
  attributes = ['Dark', 'Light', 'Earth', 'Wind', 'Fire', 'Water', 'Divine', 'Spell', 'Trap', 'No Attribute'];
  levelTypes = ['Level', 'Rank', 'Negative Level'];
  spellTrapTypes: { Spell: string[]; Trap: string[] } = {
    Spell: ['Normal', 'Continuous', 'Equip', 'Ritual', 'QuickPlay', 'Field'],
    Trap: ['Normal', 'Continuous', 'Counter']
  };
  divineBeasts = ['Slifer', 'Obelisk', 'Ra'];
  effectTypes: 'Lore' | 'Effect' = 'Lore';
  primaryMonsterTypes = ['Aqua', 'Beast', 'Beast-Warrior', 'Creator God', 'Cyberse', 'Dinosaur', 'Divine-Beast', 'Dragon',
    'Fairy', 'Fiend', 'Fish', 'Insect', 'Illusion', 'Machine', 'Plant', 'Psychic', 'Pyro', 'Reptile',
    'Rock', 'Sea Serpent', 'Spellcaster', 'Thunder', 'Warrior', 'Winged Beast', 'Wyrm', 'Zombie'];
  coreMonsterTypes = ['', 'Ritual', 'Fusion', 'Synchro', 'Dark Synchro', 'Xyz', 'Pendulum', 'Link'];
  pendulumMonsterTypes = 'Pendulum';
  abilityMonsterTypes = ['', 'Tuner', 'Spirit', 'Union', 'Gemini', 'Toon', 'Flip'];
  lastMonsterTypes = ['', 'Effect', 'Token', 'Skill'];
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

  // --- ViewChild references for DOM elements ---
  @ViewChild('cardPrintArea') cardPrintArea!: ElementRef;
  @ViewChild('displayContainer') displayContainer!: ElementRef;

  // --- Private property for temporary canvas context ---
  private context!: CanvasRenderingContext2D;

  // --- Properties to store original scale values for restoration ---
  private originalScaleTitle!: number;
  private originalScaleMonsterType!: number;
  private originalScaleEffect!: number;
  private originalScalePendulumEffect!: number;
  private originalSpellscaleEffect!: number;

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    const tempCanvas = document.createElement('canvas');
    this.context = tempCanvas.getContext('2d')!;

    // --- NEW: Start background card animation ---
    this.cardCreationInterval = setInterval(() => {
      this.createCard();
    }, 500); // Create a new card every 0.5 seconds
  }

  // --- NEW: Background Card Animation Methods ---
  private createCard(): void {
    if (this.activeCards.length >= this.maxCards) {
      return; // Stop creating new cards if the limit is hit
    }

    const cardBox = this.renderer.createElement('div');
    this.renderer.addClass(cardBox, 'cardBox');

    const randomLeft = Math.random() * 100;
    this.renderer.setStyle(cardBox, 'left', `${randomLeft}vw`);

    const randomDuration = 8 + Math.random() * 4;
    this.renderer.setStyle(cardBox, 'animation-duration', `${randomDuration}s`);

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
  // --- END NEW BACKGROUND CARD METHODS ---


  // --- UI Update Logic (Your existing methods) ---
  templateUpdate(event: Event) {
    this.template = (event.target as HTMLSelectElement).value;
    this.updateTitleStyle();
    this.updateAttribute();
    this.updateLevelType();
    this.updatePrimaryMonsterType();
    this.updateCoreMonsterType();
    this.updateLastMonsterType();
    this.resetSpellTrapType();
    this.pendulumUpdate();
    this.autoTitleTextAdjustment();
    this.autoMonsterTypeAdjustment();
    this.adjustEffectText();
    this.adjustPendulumEffectText();
    this.adjustSpellEffectText();
  }

  pendulumUpdate() {
    const pendulumCoverTemplates = ['Normal', 'Effect', 'Fusion', 'Synchro', 'Ritual', 'Xyz'];
    this.pendulumTemplate = pendulumCoverTemplates.includes(this.template);
  }

  updateTitleStyle() {
    this.titleStyle = this.template === 'Skill' ? 'Skill' :
      (['Spell', 'Trap', 'Xyz'].includes(this.template) ? 'Rare' : 'Common');
  }

  updateAttribute() {
    this.attribute =
      this.template === 'Spell' ? 'Spell' :
        this.template === 'Trap' ? 'Trap' :
          this.divineBeasts.includes(this.template) ? 'Divine' : 'Dark';
  }

  updateLevelType() {
    const noLevelTemplates = ['Spell', 'Trap', 'Skill', 'Link', 'Legendary Dragon'];

    this.levelType =
      this.template === 'Xyz' ? 'Rank' :
        this.template === 'Dark Synchro' ? 'Negative Level' :
          noLevelTemplates.includes(this.template) ? '' : 'Level';

    this.level = this.divineBeasts.includes(this.template) ? 10 : this.level;
  }

  updatePrimaryMonsterType() {
    this.primaryMonsterType = this.template === 'Legendary Dragon' ? 'Legendary Dragon' :
      (this.divineBeasts.includes(this.template) ? 'Divine-Beast' : this.primaryMonsterType);
  }

  updateCoreMonsterType() {
    this.coreMonsterType = this.coreTemplates.includes(this.template) ? this.template : '';
  }

  updateLastMonsterType() {
    const effectTemplates = ['Effect', 'Slifer', 'Obelisk', 'Ra', 'Skill'];

    this.lastMonsterType =
      this.template === 'Normal' ? '' :
        this.template === 'Token' ? 'Token' :
          this.template === 'Skill' ? 'Skill' :
            this.coreTemplates.includes(this.template) ? (this.effectTypes === 'Effect' ? 'Effect' : '') :
              (effectTemplates.includes(this.template) ? 'Effect' : this.lastMonsterType);

    this.effectTypes =
      this.template === 'Normal' || this.template === 'Token' ? 'Lore' :
        (effectTemplates.includes(this.template) ? 'Effect' : this.effectTypes);
  }

  setLoreOrEffect() {
    this.template = this.effectTypes === 'Effect' && this.template === 'Normal' ? 'Effect' :
      this.effectTypes === 'Lore' && this.template === 'Effect' ? 'Normal' :
        this.template;
    this.updateLastMonsterType();
    this.autoMonsterTypeAdjustment();
  }

  updateLinkRating() {
    this.linkRating = Object.values(this.linkArrows).filter(Boolean).length;
  }

  resetSpellTrapType() {
    if (['Spell', 'Trap'].includes(this.template)) {
      const validTypes = this.spellTrapTypes[this.template as 'Spell' | 'Trap'];
      if (!validTypes.includes(this.spellTrapType)) {
        this.spellTrapType = 'Normal';
      }
    } else {
      this.spellTrapType = 'Normal';
    }
  }

  // --- Image Upload ---
  imageUrl: string | null = null;
  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.imageUrl = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  // --- Dynamic Text Scaling Properties ---
  scaleTitle = 1;
  scaleMonsterType = 1;
  scaleEffect = 1;
  scalePendulumEffect = 1;
  SpellscaleEffect = 1;

  // --- Text Adjustment Functions ---
  autoTitleTextAdjustment() {
    const cardTitleElement = document.querySelector('.CardTitle') as HTMLElement;
    if (!cardTitleElement) return;

    if (!this.context) {
      console.warn('Canvas context not initialized for text measurement.');
      return;
    }

    const computedStyle = window.getComputedStyle(cardTitleElement);
    this.context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    const textWidth = this.context.measureText(this.title).width;
    const textboxWidth = 306;

    this.scaleTitle = textWidth > textboxWidth ? textboxWidth / textWidth : 1;
  }

  autoMonsterTypeAdjustment() {
    const monsterTypeElement = document.querySelector('.monsterType') as HTMLElement;
    if (!monsterTypeElement) return;

    if (!this.context) {
      console.warn('Canvas context not initialized for text measurement.');
      return;
    }

    const computedStyle = window.getComputedStyle(monsterTypeElement);
    this.context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    let monsterTypeText = '[' + this.primaryMonsterType +
      (this.coreMonsterType ? '/' + this.coreMonsterType : '') +
      (this.pendulumTemplate ? '/Pendulum' : '') +
      (this.abilityMonsterType ? '/' + this.abilityMonsterType : '') +
      (this.lastMonsterType ? '/' + this.lastMonsterType : '') + ']';

    const textWidth = this.context.measureText(monsterTypeText).width;
    const textboxWidth = 350;

    this.scaleMonsterType = textWidth > textboxWidth ? textboxWidth / textWidth : 1;
  }

  adjustEffectText() {
    const loreTextElement = document.querySelector('.loreText') as HTMLElement;
    if (!loreTextElement) return;

    if (!this.context) {
      console.warn('Canvas context not initialized for text measurement.');
      return;
    }

    const computedStyle = window.getComputedStyle(loreTextElement);
    this.context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    const actualWidth = this.context.measureText(this.effectText).width;
    const desiredWidth = 330;

    this.scaleEffect = Math.min(1, desiredWidth / actualWidth);
  }

  adjustPendulumEffectText() {
    const pendulumTextElement = document.querySelector('.PendulumText') as HTMLElement;
    if (!pendulumTextElement) return;

    if (!this.context) {
      console.warn('Canvas context not initialized for text measurement.');
      return;
    }

    const computedStyle = window.getComputedStyle(pendulumTextElement);
    this.context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    const actualWidth = this.context.measureText(this.pendulumEffectText).width;
    const desiredWidth = 270;

    this.scalePendulumEffect = actualWidth > desiredWidth ? desiredWidth / actualWidth : 1;
  }

  adjustSpellEffectText() {
    const spellTextElement = document.querySelector('.spellText') as HTMLElement;
    if (!spellTextElement) return;

    if (!this.context) {
      console.warn('Canvas context not initialized for text measurement.');
      return;
    }

    const computedStyle = window.getComputedStyle(spellTextElement);
    this.context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    const textWidth = this.context.measureText(this.effectText).width;
    const textboxWidth = 340;

    this.SpellscaleEffect = textWidth > textboxWidth ? textboxWidth / textWidth : 1;
  }

  // --- Image Generation Function ---
  async generateCardPng(): Promise<void> {
    const printElement = this.cardPrintArea.nativeElement;
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 100));
    try {
      const dataUrl = await toPng(printElement, {
        cacheBust: true,
        pixelRatio: 3,
      });
      const link = document.createElement('a');
      link.download = `${this.title || 'card'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    }
  }


  // --- NEW: ngOnDestroy for cleanup ---
  ngOnDestroy(): void {
    // Clear the interval to stop creating new cards
    if (this.cardCreationInterval) {
      clearInterval(this.cardCreationInterval);
    }

    // Remove all active cards from the DOM to prevent memory leaks
    this.activeCards.forEach(card => {
      if (this.backgroundCardsContainerRef && this.backgroundCardsContainerRef.nativeElement &&
        this.backgroundCardsContainerRef.nativeElement.contains(card)) {
        this.renderer.removeChild(this.backgroundCardsContainerRef.nativeElement, card);
      }
    });
    this.activeCards = []; // Clear the array after removing all elements
  }
}