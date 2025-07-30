import { Component, ElementRef, ViewChild, HostListener, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { toPng } from 'html-to-image';

interface PrimaryMonsterTypeSlot {
  id: number;
  selectedValue: string;
}

@Component({
  selector: 'app-cardmaker',
  templateUrl: './cardmaker.html',
  styleUrls: ['./css/cardmaker.css', './css/cardPreview.css', './css/fonts.css']
})
export class CardMakerComponent implements OnInit, OnDestroy, AfterViewInit {

  templateTypesRow1 = ['Normal', 'Effect', 'Ritual', 'Fusion', 'Synchro', 'Xyz', 'Link'];
  templateTypesRow2 = ['Spell', 'Trap', 'Token'];
  dropdownButtonTypes = ['Skill', 'Dark Synchro', 'Slifer', 'Obelisk', 'Ra', 'Legendary Dragon'];
  showTemplateDropdown = false;

  attributeTypes = ['Dark', 'Light', 'Earth', 'Wind', 'Fire', 'Water', 'Divine'];

  template = 'Normal';
  pendulumTemplate = false;
  titleStyle = 'Rare';
  title = 'Bitron';
  attribute = 'Earth';
  level = 2;

  primaryMonsterTypeSlots: PrimaryMonsterTypeSlot[] = [];
  private nextPrimaryTypeId: number = 1;

  coreMonsterType = '';
  abilityMonsterType = '';

  lastMonsterType = '';
  attack = '200';
  defense = '2000';
  levelType = 'Level';
  linkRating = 3;
  pendulumScale = 4;

  effectText = "A new species found in electronic space. There's not much information on it."; // For Monsters (Lore/Effect)
  pendulumEffectText = "Once per turn: You can target 1 face-up monster your opponent controls; halve its original ATK."; // For Pendulum Monsters
  spellTrapEffect = "Activate only when your opponent declares an attack. Negate the attack and end the Battle Phase."; // For Spells/Traps

  selectedLevel: number | null = this.level;

  coreTemplates = ['Ritual', 'Fusion', 'Synchro', 'Dark Synchro', 'Xyz', 'Link'];
  titleStyles = ['Common', 'Rare', 'SecretRare', 'UltraRare', 'Barian'];
  levelTypes = ['Level', 'Rank', 'Nlevel'];
  spellType = 'Normal';
  spellTypes = ['Normal', 'Continuous', 'Equip', 'Ritual', 'Quick-Play', 'Field'];
  trapType = 'Normal';
  trapTypes = ['Normal', 'Continuous', 'Counter'];
  divineBeasts = ['Slifer', 'Obelisk', 'Ra'];
  effectTypes: 'Lore' | 'Effect' = 'Lore';

  primaryMonsterTypes = ['Aqua', 'Beast', 'Beast-Warrior', 'Creator God', 'Cyberse', 'Dinosaur', 'Divine-Beast', 'Dragon',
    'Fairy', 'Fiend', 'Fish', 'Insect', 'Illusion', 'Machine', 'Plant', 'Psychic', 'Pyro', 'Reptile',
    'Rock', 'Sea Serpent', 'Spellcaster', 'Thunder', 'Light', 'Warrior', 'Winged Beast', 'Wyrm', 'Zombie'];

  coreMonsterTypes = ['', 'Ritual', 'Fusion', 'Synchro', 'Dark Synchro', 'Xyz', 'Pendulum', 'Link'];
  abilityMonsterTypes = ['Flip', 'Union', 'Spirit', 'Toon', 'Gemini', 'Tuner'];

  lastMonsterTypes = ['', 'Effect', 'Token', 'Skill', 'Legendary Dragon'];
  showCoreType = false;
  showAbilityType = false;
  linkArrows = {
    topLeft: false, top: true, topRight: false,
    left: false, right: false,
    bottomLeft: true, bottom: false, bottomRight: true
  };

  showMonsterTypeDropdown: boolean = false;
  showAdditionalMonsterTypeDropdown: boolean[] = [];
  showAbilityDropdown: boolean = false;

  @ViewChild('cardPrintArea') cardPrintArea!: ElementRef;
  @ViewChild('templateDropdownList') templateDropdownList!: ElementRef;
  @ViewChild('templateDropdownToggle') templateDropdownToggle!: ElementRef;
  @ViewChild('primaryMonsterTypeDropdownList') primaryMonsterTypeDropdownList!: ElementRef;
  @ViewChild('primaryMonsterTypeDropdownToggle') primaryMonsterTypeDropdownToggle!: ElementRef;
  @ViewChild('abilityDropdownList') abilityDropdownList!: ElementRef;
  @ViewChild('abilityDropdownToggle') abilityDropdownToggle!: ElementRef;
  @ViewChild('loreTextDisplay') loreTextDisplayElement!: ElementRef;
  @ViewChild('pendulumEffectTextDisplay') pendulumEffectTextDisplayElement!: ElementRef;
  @ViewChild('spellTrapEffectTextDisplay') spellTrapEffectTextDisplayElement!: ElementRef;

  private context!: CanvasRenderingContext2D;

  scaleTitle = 1;
  scaleMonsterType = 1;
  scalePendulumEffect = 1;
  SpellscaleEffect = 1;


  constructor() {
    const offscreenCanvas = document.createElement('canvas');
    this.context = offscreenCanvas.getContext('2d') as CanvasRenderingContext2D;
  }

  ngOnDestroy() {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.adjustLoreTextDisplay();
      this.adjustPendulumEffectText();
      this.adjustSpellEffectText();
    }, 0);
  }

  ngOnInit(): void {
    this.updateLevelType();
    this.addPrimaryMonsterTypeSlot('Cyberse');
    this.autoMonsterTypeAdjustment();
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (this.showTemplateDropdown && this.templateDropdownList && this.templateDropdownToggle) {
      const clickedInsideList = this.templateDropdownList.nativeElement.contains(event.target);
      const clickedOnToggle = this.templateDropdownToggle.nativeElement.contains(event.target);
      if (!clickedInsideList && !clickedOnToggle) {
        this.showTemplateDropdown = false;
      }
    }
    if (this.showMonsterTypeDropdown && this.primaryMonsterTypeDropdownList && this.primaryMonsterTypeDropdownToggle) {
      const clickedInsideList = this.primaryMonsterTypeDropdownList.nativeElement.contains(event.target);
      const clickedOnToggle = this.primaryMonsterTypeDropdownToggle.nativeElement.contains(event.target);
      if (!clickedInsideList && !clickedOnToggle) {
        this.showMonsterTypeDropdown = false;
      }
    }
    this.showAdditionalMonsterTypeDropdown = this.showAdditionalMonsterTypeDropdown.map(() => false);
    if (this.showAbilityDropdown && this.abilityDropdownList && this.abilityDropdownToggle) {
      const clickedInsideList = this.abilityDropdownList.nativeElement.contains(event.target);
      const clickedOnToggle = this.abilityDropdownToggle.nativeElement.contains(event.target);
      if (!clickedInsideList && !clickedOnToggle) {
        this.showAbilityDropdown = false;
      }
    }
  }

  capitalizeFirstLetter(value: string): string {
    if (!value) {
      return '';
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  addPrimaryMonsterTypeSlot(defaultValue: string = '') {
    this.primaryMonsterTypeSlots.push({ id: this.nextPrimaryTypeId++, selectedValue: defaultValue });
    this.showAdditionalMonsterTypeDropdown.push(false);
    this.autoMonsterTypeAdjustment();
  }

  removePrimaryMonsterTypeSlot(id: number) {
    const indexToRemove = this.primaryMonsterTypeSlots.findIndex(slot => slot.id === id);
    if (indexToRemove > -1) {
      this.primaryMonsterTypeSlots.splice(indexToRemove, 1);
      this.showAdditionalMonsterTypeDropdown.splice(indexToRemove, 1);
    }
    if (this.primaryMonsterTypeSlots.length === 0) {
      this.addPrimaryMonsterTypeSlot('');
    }
    this.autoMonsterTypeAdjustment();
  }

  onPrimaryTypeInput(slot: PrimaryMonsterTypeSlot) {
    slot.selectedValue = this.capitalizeFirstLetter(slot.selectedValue);
    this.autoMonsterTypeAdjustment();
  }

  trackById(index: number, slot: PrimaryMonsterTypeSlot): number {
    return slot.id;
  }

  toggleMonsterTypeDropdown() {
    this.showMonsterTypeDropdown = !this.showMonsterTypeDropdown;
  }

  selectMonsterTypeFromDropdown(slot: PrimaryMonsterTypeSlot, value: string) {
    slot.selectedValue = value;
    this.showMonsterTypeDropdown = false;
    this.autoMonsterTypeAdjustment();
  }

  toggleAdditionalMonsterTypeDropdown(index: number) {
    this.showAdditionalMonsterTypeDropdown[index] = !this.showAdditionalMonsterTypeDropdown[index];
  }

  onAbilityInput() {
    this.abilityMonsterType = this.capitalizeFirstLetter(this.abilityMonsterType);
    this.autoMonsterTypeAdjustment();
  }

  toggleAbilityDropdown() {
    this.showAbilityDropdown = !this.showAbilityDropdown;
  }

  toggleTemplateDropdown() {
    this.showTemplateDropdown = !this.showTemplateDropdown;
  }

  selectAbilityFromDropdown(value: string) {
    this.abilityMonsterType = value;
    this.showAbilityDropdown = false;
    this.autoMonsterTypeAdjustment();
  }

  templateUpdate(type: string) {
    this.template = (type);
    this.updateTitleStyle();
    this.updateLevelType();
    this.updatePrimaryMonsterType();
    this.updateCoreMonsterType();
    this.updateLastMonsterType();
    this.setLoreOrEffect();
    this.pendulumUpdate();
    this.autoTitleTextAdjustment();
    this.autoMonsterTypeAdjustment();

    setTimeout(() => {
      if (['Spell', 'Trap'].includes(this.template)) {
        this.adjustSpellEffectText();
      } else if (this.pendulumTemplate) {
        this.adjustPendulumEffectText();
        this.adjustLoreTextDisplay();
      } else {
        this.adjustLoreTextDisplay();
      }
    }, 50);
  }

  pendulumUpdate() {
    const pendulumSupportedTemplates = ['Normal', 'Effect', 'Fusion', 'Synchro', 'Ritual', 'Xyz'];
    if (!pendulumSupportedTemplates.includes(this.template)) {
      this.pendulumTemplate = false;
    }
  }

  updateTitleStyle() {
    this.titleStyle = this.template === 'Skill' ? 'skillFont' :
      (['Spell', 'Trap', 'Xyz'].includes(this.template) ? 'Rare' : 'Common');
  }

  updateAttribute(attribute: string) {
    this.attribute = (attribute);
  }

  updateSpellType(spellType: string) {
    this.spellType = (spellType);
  }

  updateTrapType(trapType: string) {
    this.trapType = (trapType);
  }

  updateLevelValue(level: number) {
    this.level = level;
    this.selectedLevel = level;
  }

  shouldApplyBackground(buttonLevel: number): boolean {
    return this.selectedLevel !== null && buttonLevel <= this.selectedLevel;
  }

  updateLevelType() {
    const noLevelTemplates = ['Spell', 'Trap', 'Skill', 'Link', 'Legendary Dragon'];
    this.levelType =
      this.template === 'Xyz' ? 'Rank' :
        this.template === 'Dark Synchro' ? 'Negative Level' :
          noLevelTemplates.includes(this.template) ? '' : 'Level';
    this.level = this.divineBeasts.includes(this.template) ? 10 : this.level;
    if (noLevelTemplates.includes(this.template)) {
      this.selectedLevel = null;
    } else {
      this.selectedLevel = this.level;
    }
  }

  updatePrimaryMonsterType() {
    if (this.primaryMonsterTypeSlots.length > 0) {
      if (this.template === 'Legendary Dragon') {
        this.primaryMonsterTypeSlots[0].selectedValue = 'Legendary Dragon';
      } else if (this.divineBeasts.includes(this.template)) {
        this.primaryMonsterTypeSlots[0].selectedValue = 'Divine-Beast';
      }
      this.autoMonsterTypeAdjustment();
    }
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
            this.template === 'Legendary Dragon' ? '' :
              this.coreTemplates.includes(this.template) ? (this.effectTypes === 'Effect' ? 'Effect' : '') :
                (effectTemplates.includes(this.template) ? 'Effect' : this.lastMonsterType);
    this.effectTypes =
      this.template === 'Normal' || this.template === 'Token' ? 'Lore' :
        (effectTemplates.includes(this.template) ? 'Effect' : this.effectTypes);
  }

  setLoreOrEffect() {
    if (this.template === 'Normal' || this.template === 'Token') {
      this.effectTypes = 'Lore';
    } else {
      this.effectTypes = 'Effect';
    }
    this.updateLastMonsterType();
    this.autoMonsterTypeAdjustment();
  }

  updateLinkRating() {
    this.linkRating = Object.values(this.linkArrows).filter(Boolean).length;
  }

  resetLinkRating() {
    this.linkArrows = {
      topLeft: false, top: false, topRight: false,
      left: false, right: false,
      bottomLeft: false, bottom: false, bottomRight: false
    };
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

  autoTitleTextAdjustment() {
    const cardTitleSize = document.querySelector('.CardTitle') as HTMLElement;
    if (!cardTitleSize) return;

    const { fontSize, fontFamily } = window.getComputedStyle(cardTitleSize);
    this.context.font = `${fontSize} ${fontFamily}`;

    const textWidth = this.context.measureText(this.title).width;
    const textboxWidth = 306;

    this.scaleTitle = textWidth > textboxWidth ? textboxWidth / textWidth : 1;
  }

  autoMonsterTypeAdjustment() {
    const monsterTypeElement = document.querySelector('.monsterType') as HTMLElement;
    if (!monsterTypeElement) return;

    const computedStyle = window.getComputedStyle(monsterTypeElement);
    this.context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    const combinedPrimaryTypes = this.primaryMonsterTypeSlots
      .map(slot => slot.selectedValue)
      .filter(type => type)
      .join('/');

    let currentAbilityType = this.abilityMonsterType;
    if (!currentAbilityType) currentAbilityType = '';

    let monsterTypeText = '[' + combinedPrimaryTypes +
      (this.coreMonsterType ? '/' + this.coreMonsterType : '') +
      (this.pendulumTemplate ? '/Pendulum' : '') +
      (currentAbilityType ? '/' + currentAbilityType : '') +
      (this.lastMonsterType ? '/' + this.lastMonsterType : '') + ']';

    const textWidth = this.context.measureText(monsterTypeText).width;
    const textboxWidth = 330;

    this.scaleMonsterType = textWidth > textboxWidth ? textboxWidth / textWidth : 1;
  }

  getFormattedPrimaryMonsterTypes(): string {
    return this.primaryMonsterTypeSlots
      .map(slot => slot.selectedValue)
      .filter(type => type)
      .join('/');
  }

  onEffectTextChange(): void {
    setTimeout(() => {
      this.adjustLoreTextDisplay();
    });
  }

  onPendulumEffectTextChange(): void {
    setTimeout(() => {
      this.adjustPendulumEffectText();
    });
  }

  onSpellTrapEffectTextChange(): void {
    setTimeout(() => {
      this.adjustSpellEffectText();
    });
  }

  private readonly fixedOuterWidth = 336;
  private readonly fixedOuterHeight = 77;
  private readonly fixedOuterHeight2 = 105;

  private readonly fixedOuterWidthP = 270;
  private readonly fixedOuterHeightP = 55;

  private readonly baseFontSize = 14;
  private readonly baseLineHeightRatio = 0.9;
  private readonly smallestFontSize = 12;
  private readonly smallestFontSize2 = 10;
  private readonly smallestFontSize3 = 9;

  private readonly SCALE_PRECISION = 0.001;
  private readonly MIN_SCALE_X = 0.01;
  private readonly SCALE_TRIGGER_THRESHOLD = 0.6;
  private readonly SCALE_TRIGGER_THRESHOLD2 = 0.6;
  private readonly SCALE_TRIGGER_THRESHOLD3 = 0.6;
  private readonly TRANSFORM_ORIGIN = 'left top';

  scaleEffect = 1;

  private calculateBestScaleX(
    element: HTMLElement,
    heightBudget: number,
    fontSize: number
  ): { scaleX: number, finalHeight: number } {

    element.style.transform = 'scaleX(1)';
    element.style.transformOrigin = this.TRANSFORM_ORIGIN;
    element.style.width = `${this.fixedOuterWidth}px`;
    element.style.fontSize = `${fontSize}px`;
    element.style.lineHeight = `${this.baseLineHeightRatio}`;
    element.style.whiteSpace = 'pre-wrap';
    element.style.overflow = 'visible';
    element.getBoundingClientRect();

    const initialContentHeight = element.scrollHeight;

    if (initialContentHeight <= heightBudget) {
      return { scaleX: 1.0, finalHeight: initialContentHeight };
    }

    let lowScale = this.MIN_SCALE_X;
    let highScale = 1.0;
    let bestFittingScaleX = 1.0;

    let iterations = 0;
    while (highScale - lowScale > this.SCALE_PRECISION && iterations < 100) {
      iterations++;
      const testScaleX = (lowScale + highScale) / 2;
      const testLogicalWidth = this.fixedOuterWidth / testScaleX;

      element.style.transform = `scaleX(${testScaleX})`;
      element.style.width = `${testLogicalWidth}px`;
      element.getBoundingClientRect();

      const currentTestHeight = element.scrollHeight;

      if (currentTestHeight <= heightBudget) {
        bestFittingScaleX = testScaleX;
        lowScale = testScaleX;
      } else {
        highScale = testScaleX;
      }
    }

    let finalDeterminedScaleX = bestFittingScaleX;
    let finalLogicalWidth = this.fixedOuterWidth / finalDeterminedScaleX;
    element.style.transform = `scaleX(${finalDeterminedScaleX})`;
    element.style.width = `${finalLogicalWidth}px`;
    element.getBoundingClientRect();

    if (element.scrollHeight > heightBudget && finalDeterminedScaleX > this.MIN_SCALE_X) {
      finalDeterminedScaleX = Math.max(this.MIN_SCALE_X, finalDeterminedScaleX - this.SCALE_PRECISION);
      finalLogicalWidth = this.fixedOuterWidth / finalDeterminedScaleX;
      element.style.transform = `scaleX(${finalDeterminedScaleX})`;
      element.style.width = `${finalLogicalWidth}px`;
      element.getBoundingClientRect();
    }

    return { scaleX: finalDeterminedScaleX, finalHeight: element.scrollHeight };
  }

  adjustLoreTextDisplay() {
    const innerElement = this.loreTextDisplayElement.nativeElement as HTMLElement;
    const originalInnerOverflow = innerElement.style.overflow;

    innerElement.style.transform = 'scaleX(1)';
    innerElement.style.width = `${this.fixedOuterWidth}px`;
    innerElement.style.overflow = 'visible';
    innerElement.style.whiteSpace = 'pre-wrap';
    innerElement.textContent = this.effectText;

    let finalFontSize = this.baseFontSize;
    let effectiveScaleX = 1.0;

    let result14px = this.calculateBestScaleX(innerElement, this.fixedOuterHeight, this.baseFontSize);
    effectiveScaleX = result14px.scaleX;

    if (effectiveScaleX < this.SCALE_TRIGGER_THRESHOLD) {
      finalFontSize = this.smallestFontSize;
      let result12px = this.calculateBestScaleX(innerElement, this.fixedOuterHeight, finalFontSize);
      effectiveScaleX = result12px.scaleX;

      if (effectiveScaleX < this.SCALE_TRIGGER_THRESHOLD2) {
        finalFontSize = this.smallestFontSize2;
        let result10px = this.calculateBestScaleX(innerElement, this.fixedOuterHeight, finalFontSize);
        effectiveScaleX = result10px.scaleX;

        if (effectiveScaleX < this.SCALE_TRIGGER_THRESHOLD3) {
          finalFontSize = this.smallestFontSize3;
          let result8px = this.calculateBestScaleX(innerElement, this.fixedOuterHeight, finalFontSize);
          effectiveScaleX = result8px.scaleX;
        }
      }
    }

    this.scaleEffect = effectiveScaleX;
    innerElement.style.fontSize = `${finalFontSize}px`;
    innerElement.style.transform = `scaleX(${effectiveScaleX})`;
    innerElement.style.width = `${this.fixedOuterWidth / effectiveScaleX}px`;
    innerElement.style.overflow = originalInnerOverflow;
  }

  adjustPendulumEffectText(): void {
    const innerElement = this.pendulumEffectTextDisplayElement.nativeElement as HTMLElement;
    const originalInnerOverflow = innerElement.style.overflow;

    innerElement.style.transform = 'scaleX(1)';
    innerElement.style.width = `${this.fixedOuterWidthP}px`;
    innerElement.style.overflow = 'visible';
    innerElement.style.whiteSpace = 'pre-wrap';
    innerElement.textContent = this.pendulumEffectText;

    let finalFontSize = this.baseFontSize;
    let effectiveScaleX = 1.0;

    let result14px = this.calculateBestScaleX(innerElement, this.fixedOuterHeightP, this.baseFontSize);
    effectiveScaleX = result14px.scaleX;

    if (effectiveScaleX < this.SCALE_TRIGGER_THRESHOLD) {
      finalFontSize = this.smallestFontSize;
      let result12px = this.calculateBestScaleX(innerElement, this.fixedOuterHeightP, finalFontSize);
      effectiveScaleX = result12px.scaleX;

      if (effectiveScaleX < this.SCALE_TRIGGER_THRESHOLD2) {
        finalFontSize = this.smallestFontSize2;
        let result10px = this.calculateBestScaleX(innerElement, this.fixedOuterHeightP, finalFontSize);
        effectiveScaleX = result10px.scaleX;

        if (effectiveScaleX < this.SCALE_TRIGGER_THRESHOLD3) {
          finalFontSize = this.smallestFontSize3;
          let result8px = this.calculateBestScaleX(innerElement, this.fixedOuterHeightP, finalFontSize);
          effectiveScaleX = result8px.scaleX;
        }
      }
    }

    this.scalePendulumEffect = effectiveScaleX;
    innerElement.style.fontSize = `${finalFontSize}px`;
    innerElement.style.transform = `scaleX(${effectiveScaleX})`;
    innerElement.style.width = `${this.fixedOuterWidthP / effectiveScaleX}px`;
    innerElement.style.overflow = originalInnerOverflow;
  }


  adjustSpellEffectText(): void {
    const innerElement = this.spellTrapEffectTextDisplayElement.nativeElement as HTMLElement;
    const originalInnerOverflow = innerElement.style.overflow;

    innerElement.style.transform = 'scaleX(1)';
    innerElement.style.transformOrigin = this.TRANSFORM_ORIGIN;
    innerElement.style.width = `${this.fixedOuterWidth}px`;
    innerElement.style.overflow = 'visible';
    innerElement.style.whiteSpace = 'pre-wrap';
    innerElement.textContent = this.spellTrapEffect;

    let finalFontSize = this.baseFontSize;
    let effectiveScaleX = 1.0;

    let result14px = this.calculateBestScaleX(innerElement, this.fixedOuterHeight2, this.baseFontSize);
    effectiveScaleX = result14px.scaleX;

    if (effectiveScaleX < this.SCALE_TRIGGER_THRESHOLD) {
      finalFontSize = this.smallestFontSize;
      let result12px = this.calculateBestScaleX(innerElement, this.fixedOuterHeight2, finalFontSize);
      effectiveScaleX = result12px.scaleX;

      if (effectiveScaleX < this.SCALE_TRIGGER_THRESHOLD2) {
        finalFontSize = this.smallestFontSize2;
        let result10px = this.calculateBestScaleX(innerElement, this.fixedOuterHeight2, finalFontSize);
        effectiveScaleX = result10px.scaleX;

        if (effectiveScaleX < this.SCALE_TRIGGER_THRESHOLD3) {
          finalFontSize = this.smallestFontSize3;
          let result8px = this.calculateBestScaleX(innerElement, this.fixedOuterHeight2, finalFontSize);
          effectiveScaleX = result8px.scaleX;
        }
      }
    }

    this.SpellscaleEffect = effectiveScaleX;
    innerElement.style.fontSize = `${finalFontSize}px`;
    innerElement.style.transform = `scaleX(${effectiveScaleX})`;
    innerElement.style.width = `${this.fixedOuterWidth / effectiveScaleX}px`;
    innerElement.style.overflow = originalInnerOverflow;
  }

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