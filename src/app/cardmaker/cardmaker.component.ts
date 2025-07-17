import { Component, ElementRef, ViewChild } from '@angular/core';
import { toPng } from 'html-to-image';

@Component({
  selector: 'app-cardmaker',
  templateUrl: './cardmaker.component.html',
  styleUrls: ['./cardmaker.component.css'],
})
export class CardMakerComponent {
  // --- Card Preview States  ---
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
  coreTemplates = ['Ritual', 'Fusion', 'Synchro', 'Dark Synchro', 'Xyz', 'Link'];
  titleStyles = ['Common', 'Rare', 'SecretRare', 'UltraRare', 'Skill'];
  levelTypes = ['Level', 'Rank', 'Nlevel'];
  spellTypes = ['Normal', 'Continuous', 'Equip', 'Ritual', 'QuickPlay', 'Field'];
  trapTypes = ['Normal', 'Continuous', 'Counter'];
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

  // --- UI Update Logic (Your existing methods) ---
  templateUpdate(type: string) {
    this.template = (type);
    this.updateTitleStyle();
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
    const pendulumSupported = ['Normal', 'Effect', 'Fusion', 'Synchro', 'Ritual', 'Xyz'];
    this.pendulumTemplate = pendulumSupported.includes!(this.template);
    this.pendulumTemplate = false;
  }

  updateTitleStyle() {
    this.titleStyle = this.template === 'Skill' ? 'Skill' :
      (['Spell', 'Trap', 'Xyz'].includes(this.template) ? 'Rare' : 'Common');
  }

  updateAttribute(attribute:string) {
    this.attribute = (attribute);
  }

  updateLevelValue(level: number) {
    this.level = (level);
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
    const cardTitleSize = document.querySelector('.CardTitle') as HTMLElement;

    const { fontSize, fontFamily } = window.getComputedStyle(cardTitleSize);
    this.context.font = `${fontSize} ${fontFamily}`;

    const textWidth = this.context.measureText(this.title).width;
    const textboxWidth = 306;

    this.scaleTitle = textWidth > textboxWidth ? textboxWidth / textWidth : 1;
  }

  autoMonsterTypeAdjustment() {
    const monsterTypeElement = document.querySelector('.monsterType') as HTMLElement;

    const computedStyle = window.getComputedStyle(monsterTypeElement);
    this.context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    let monsterTypeText = '[' + this.primaryMonsterType +
      (this.coreMonsterType ? '/' + this.coreMonsterType : '') +
      (this.pendulumTemplate ? '/Pendulum' : '') +
      (this.abilityMonsterType ? '/' + this.abilityMonsterType : '') +
      (this.lastMonsterType ? '/' + this.lastMonsterType : '') + ']';

    const textWidth = this.context.measureText(monsterTypeText).width;
    const textboxWidth = 330;

    this.scaleMonsterType = textWidth > textboxWidth ? textboxWidth / textWidth : 1;
  }

  adjustEffectText() {
    const loreTextElement = document.querySelector('.loreText') as HTMLElement;

    const computedStyle = window.getComputedStyle(loreTextElement);
    this.context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    const actualWidth = this.context.measureText(this.effectText).width;
    const desiredWidth = 330;

    this.scaleEffect = Math.min(1, desiredWidth / actualWidth);
  }

  adjustPendulumEffectText() {
    const pendulumTextElement = document.querySelector('.PendulumText') as HTMLElement;

    const computedStyle = window.getComputedStyle(pendulumTextElement);
    this.context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    const actualWidth = this.context.measureText(this.pendulumEffectText).width;
    const desiredWidth = 270;

    this.scalePendulumEffect = actualWidth > desiredWidth ? desiredWidth / actualWidth : 1;
  }

  adjustSpellEffectText() {
    const spellTextElement = document.querySelector('.spellText') as HTMLElement;

    const computedStyle = window.getComputedStyle(spellTextElement);
    this.context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    const textWidth = this.context.measureText(this.effectText).width;
    const textboxWidth = 340;

    this.SpellscaleEffect = textWidth > textboxWidth ? textboxWidth / textWidth : 1;
  }

  // --- Image Generation Function ---
  async generateCardPng(): Promise<void> {
    const printElement = this.cardPrintArea.nativeElement;
    const dataUrl = await toPng(printElement, {
      cacheBust: true,
      pixelRatio: 3,
    });
    const link = document.createElement('a');
    link.download = `${this.title}.png`;
    link.href = dataUrl;
    link.click();
  }
}