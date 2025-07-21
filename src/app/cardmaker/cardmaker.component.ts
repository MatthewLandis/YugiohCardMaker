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

  // NEW ViewChild references for text adjustment
  @ViewChild('monsterEffectTextContainer') monsterEffectTextContainer!: ElementRef;
  @ViewChild('monsterEffectTextElement') monsterEffectTextElement!: ElementRef;

  private context!: CanvasRenderingContext2D;

  // --- Dynamic Text Scaling Properties ---
  scaleTitle = 1;
  scaleMonsterType = 1;
  // This will now handle the uniform scaling for the effect text
  scaleEffect = 1;
  scalePendulumEffect = 1;
  SpellscaleEffect = 1;

  // Font size for the effect text (used as a fallback if scaling is too extreme)
  currentEffectFontSize: string = '14px';
  private readonly defaultEffectFontSize: number = 14;
  private readonly minEffectFontSize: number = 8; // Adjust this minimum as needed

  constructor() {
    const offscreenCanvas = document.createElement('canvas');
    this.context = offscreenCanvas.getContext('2d') as CanvasRenderingContext2D;
  }

  ngOnInit(): void {
    this.updateLevelType();
    this.addPrimaryMonsterTypeSlot('Cyberse');
    this.autoMonsterTypeAdjustment();
    this.adjustEffectText(); // Call on init for initial text
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

  ngOnDestroy(): void {
    // Any other cleanup if necessary
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

  // MODIFIED: adjustEffectText to continuously shrink
  adjustEffectText() {
    if (!this.monsterEffectTextElement || !this.monsterEffectTextContainer) {
      return;
    }

    const textElement = this.monsterEffectTextElement.nativeElement;
    const containerElement = this.monsterEffectTextContainer.nativeElement;

    // Reset to default for initial measurement
    this.currentEffectFontSize = `${this.defaultEffectFontSize}px`;
    this.scaleEffect = 1;

    // Use a function to repeatedly check and adjust
    const checkAndAdjust = () => {
      // Apply current styles to the element before measuring
      textElement.style.fontSize = this.currentEffectFontSize;
      textElement.style.transform = `scale(${this.scaleEffect})`;

      // Schedule next check after the browser has rendered the current styles
      requestAnimationFrame(() => {
        const currentTextWidth = textElement.scrollWidth;
        const currentTextHeight = textElement.scrollHeight;
        const containerWidth = containerElement.clientWidth;
        const containerHeight = containerElement.clientHeight;

        let changed = false;

        // Prioritize horizontal fit
        if (currentTextWidth > containerWidth + 1) { // Add a small buffer
          // If still too wide, reduce scale
          this.scaleEffect = Math.max(0.01, this.scaleEffect * (containerWidth / currentTextWidth) - 0.01); // Shrink slightly more than exactly needed
          changed = true;
        } else if (currentTextHeight > containerHeight + 1) { // If vertical overflow, reduce font size slightly
          const currentFontSizeNum = parseFloat(this.currentEffectFontSize);
          if (currentFontSizeNum > this.minEffectFontSize) {
              this.currentEffectFontSize = `${Math.max(this.minEffectFontSize, currentFontSizeNum - 1)}px`; // Decrease by 1px
              changed = true;
          } else {
              // If font size is at min and still overflows vertically, try to scale down (uniform scale)
              // This handles cases where lines are too many even at min font size
              this.scaleEffect = Math.max(0.01, this.scaleEffect * (containerHeight / currentTextHeight) - 0.01);
              changed = true;
          }
        } else if (this.scaleEffect < 1 || parseFloat(this.currentEffectFontSize) < this.defaultEffectFontSize) {
          // If it fits and is scaled/smaller than default, try to revert
          const currentFontSizeNum = parseFloat(this.currentEffectFontSize);
          let reverted = false;

          if (currentFontSizeNum < this.defaultEffectFontSize) {
            // Try to increase font size
            const nextFontSize = Math.min(this.defaultEffectFontSize, currentFontSizeNum + 1);
            textElement.style.fontSize = `${nextFontSize}px`; // Temporarily apply for measurement
            requestAnimationFrame(() => {
              if (textElement.scrollWidth <= containerWidth && textElement.scrollHeight <= containerHeight) {
                this.currentEffectFontSize = `${nextFontSize}px`;
                reverted = true;
                changed = true; // Mark as changed to re-evaluate
                checkAndAdjust(); // Recurse to see if more can be reverted
              } else {
                // Cannot increase font size without overflowing, so revert and keep current setting
                textElement.style.fontSize = this.currentEffectFontSize;
              }
            });
          }

          if (!reverted && this.scaleEffect < 1) {
            // Try to increase scale if font size is maxed or not overflowed
            const nextScale = Math.min(1, this.scaleEffect + 0.01); // Increase scale slightly
            textElement.style.transform = `scale(${nextScale})`; // Temporarily apply for measurement
            requestAnimationFrame(() => {
                if (textElement.scrollWidth <= containerWidth && textElement.scrollHeight <= containerHeight) {
                    this.scaleEffect = nextScale;
                    changed = true; // Mark as changed to re-evaluate
                    checkAndAdjust(); // Recurse to see if more can be reverted
                } else {
                    textElement.style.transform = `scale(${this.scaleEffect})`; // Revert if causes overflow
                }
            });
          }
        }

        if (changed) {
          checkAndAdjust(); // Continue adjusting if a change was made
        }
      });
    };

    checkAndAdjust(); // Start the adjustment process
  }


  adjustPendulumEffectText() {
    // Implement similar continuous shrinking logic for pendulum text
  }

  adjustSpellEffectText() {
    // Implement similar continuous shrinking logic for spell text
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