import { Component, ElementRef, ViewChild, HostListener, OnDestroy, OnInit } from '@angular/core';
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
export class CardMakerComponent implements OnInit, OnDestroy {

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
  spellTrapType = 'Normal';

  primaryMonsterTypeSlots: PrimaryMonsterTypeSlot[] = [];
  private nextPrimaryTypeId: number = 1;

  coreMonsterType = '';
  abilityMonsterType = '';

  lastMonsterType = '';
  attack = '200';
  defense = '2000';
  levelType = 'Level';
  linkRating = 3;

  effectText = "A new species found in electronic space. There's not much information on it.";
  pendulumScale = 4;
  pendulumEffectText = "Once per turn: You can target 1 face-up monster your opponent controls; halve its original ATK.";

  selectedLevel: number | null = this.level;

  coreTemplates = ['Ritual', 'Fusion', 'Synchro', 'Dark Synchro', 'Xyz', 'Link'];
  titleStyles = ['Common', 'Rare', 'SecretRare', 'UltraRare', 'Barian'];
  levelTypes = ['Level', 'Rank', 'Nlevel'];
  spellTypes = ['Normal', 'Continuous', 'Equip', 'Ritual', 'QuickPlay', 'Field'];
  trapTypes = ['Normal', 'Continuous', 'Counter'];
  divineBeasts = ['Slifer', 'Obelisk', 'Ra'];
  effectTypes: 'Lore' | 'Effect' = 'Lore';

  primaryMonsterTypes = ['Aqua', 'Beast', 'Beast-Warrior', 'Creator God', 'Cyberse', 'Dinosaur', 'Divine-Beast', 'Dragon',
    'Fairy', 'Fiend', 'Fish', 'Insect', 'Illusion', 'Machine', 'Plant', 'Psychic', 'Pyro', 'Reptile',
    'Rock', 'Sea Serpent', 'Spellcaster', 'Thunder', 'Warrior', 'Winged Beast', 'Wyrm', 'Zombie'];

  coreMonsterTypes = ['', 'Ritual', 'Fusion', 'Synchro', 'Dark Synchro', 'Xyz', 'Pendulum', 'Link'];
  abilityMonsterTypes = ['Flip', 'Union', 'Spirit', 'Toon', 'Gemini', 'Tuner'];

  lastMonsterTypes = ['', 'Effect', 'Token', 'Skill'];
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
  @ViewChild('monsterEffectTextContainer') monsterEffectTextContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('monsterEffectTextElement') monsterEffectTextElement!: ElementRef<HTMLParagraphElement>;
  
  private context!: CanvasRenderingContext2D;

  scaleTitle = 1;
  scaleMonsterType = 1;
  scaleEffect = 1;
  scalePendulumEffect = 1;
  SpellscaleEffect = 1;

  effectTextTransformScaleX: number = 1;
 currentEffectFontSize: number = 14;
  private readonly defaultEffectFontSize: number = 14;
  private readonly minEffectFontSize: number = 8;

  constructor() {
    const offscreenCanvas = document.createElement('canvas');
    this.context = offscreenCanvas.getContext('2d') as CanvasRenderingContext2D;
  }

  ngOnInit(): void {
    this.updateLevelType();
    this.addPrimaryMonsterTypeSlot('Cyberse');
    this.autoMonsterTypeAdjustment();
    this.adjustEffectText();
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

  ngOnDestroy() {
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
    this.resetSpellTrapType();
    this.setLoreOrEffect();
    this.pendulumUpdate();
    this.autoTitleTextAdjustment();
    this.autoMonsterTypeAdjustment();
    this.adjustEffectText();
    this.adjustPendulumEffectText();
    this.adjustSpellEffectText();
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
            this.coreTemplates.includes(this.template) ? (this.effectTypes === 'Effect' ? 'Effect' : '') :
              (effectTemplates.includes(this.template) ? 'Effect' : this.lastMonsterType);
    this.effectTypes =
      this.template === 'Normal' || this.template === 'Token' ? 'Lore' :
        (effectTemplates.includes(this.template) ? 'Effect' : this.effectTypes);
  }

  setLoreOrEffect() {
    if (this.template === 'Normal') {
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

  resetSpellTrapType() { }

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

  adjustEffectText() {
  }

  adjustPendulumEffectText() {
  }

  adjustSpellEffectText() {
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