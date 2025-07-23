import { Component, ElementRef, ViewChild, HostListener, OnDestroy, OnInit, AfterViewInit  } from '@angular/core';
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
export class CardMakerComponent implements OnInit, OnDestroy, AfterViewInit  {

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
    'Rock', 'Sea Serpent', 'Spellcaster', 'Thunder', 'Light', 'Warrior', 'Winged Beast', 'Wyrm', 'Zombie'];

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
  @ViewChild('loreTextDisplay') loreTextContentElement!: ElementRef;
  @ViewChild('pendulumEffectTextDisplay') pendulumEffectTextDisplayElement!: ElementRef;
  @ViewChild('spellTrapEffectTextDisplay') spellTrapEffectTextDisplayElement!: ElementRef;


  private context!: CanvasRenderingContext2D;


  private readonly fixedOuterWidth = 336;
  private readonly fixedOuterHeight = 76; // This is the height of the outer container, which should fit 6 lines
  private readonly baseFontSize = 14;
  private readonly baseLineHeightRatio = 0.9;

  // New target height for 7 lines (approx. baseFontSize * baseLineHeightRatio * 7)
  // You might need to fine-tune this value based on your actual line height.
  private readonly fixedOuterHeightTier2 = 88;

  // Parameters for the iterative search
  private readonly SCALE_PRECISION = 0.00001; // Extremely high precision
  private readonly MIN_SCALE_X = 0.5; // Minimum allowable squish

  private readonly CALCULATED_LINE_HEIGHT = this.baseFontSize * this.baseLineHeightRatio;
  private readonly THEORETICAL_6_LINE_HEIGHT = this.CALCULATED_LINE_HEIGHT * 6;
  // private readonly TARGET_CONTENT_HEIGHT = this.fixedOuterHeight - 0.5; // This can be removed, it's dynamic now

  scaleTitle = 1;
  scaleMonsterType = 1;
  scaleEffect = 1;
  scalePendulumEffect = 1;
  SpellscaleEffect = 1;

  // New property to track the current font size being used for effect text
  currentEffectFontSize: number = this.baseFontSize;


  constructor() {
    const offscreenCanvas = document.createElement('canvas');
    this.context = offscreenCanvas.getContext('2d') as CanvasRenderingContext2D;
  }
  ngOnDestroy() {
  }

   ngAfterViewInit(): void {
    // Perform initial adjustments when the component loads
    // Ensure initial font size is base when adjusting on init
    this.currentEffectFontSize = this.baseFontSize;
    this.adjustLoreTextDisplay();
    this.adjustPendulumEffectText();
    this.adjustSpellEffectText();
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
    this.resetSpellTrapType();
    this.setLoreOrEffect();
    this.pendulumUpdate();
    this.autoTitleTextAdjustment();
    this.autoMonsterTypeAdjustment();
    // Reset font size to base when template changes, then defer adjustments
    this.currentEffectFontSize = this.baseFontSize;
    setTimeout(() => {
      this.adjustLoreTextDisplay();
      this.adjustPendulumEffectText();
      this.adjustSpellEffectText();
    });
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

  // Event handler for effectText changes - now resets font size and uses setTimeout
  onEffectTextChange(): void {
    this.currentEffectFontSize = this.baseFontSize; // Reset to default font size on every change
    setTimeout(() => {
      this.adjustLoreTextDisplay();
    });
  }

  // Event handler for pendulumEffectText changes - now using setTimeout
  onPendulumEffectTextChange(): void {
    setTimeout(() => {
      this.adjustPendulumEffectText();
    });
  }

  // Event handler for spellTrapType (if it uses effectText) or a dedicated spell/trap text field - now using setTimeout
  onSpellTrapEffectTextChange(): void {
    setTimeout(() => {
      this.adjustSpellEffectText();
    });
  }


  adjustLoreTextDisplay(): void {
    if (!this.loreTextContentElement || !this.loreTextContentElement.nativeElement) {
      console.warn('loreTextContentElement not found.');
      return;
    }

    const innerElement = this.loreTextContentElement.nativeElement as HTMLElement;
    const originalInnerOverflow = innerElement.style.overflow;

    let targetFontSize = this.baseFontSize; // Start with default font size
    let targetHeight = this.fixedOuterHeight; // Target height for 6 lines

    // --- First Pass: Try to fit with baseFontSize (14px) and scaleX ---
    // Reset inner element to base, unscaled state for accurate measurement
    innerElement.style.transform = 'scaleX(1)';
    innerElement.style.transformOrigin = 'left top';
    innerElement.style.width = `${this.fixedOuterWidth}px`;
    innerElement.style.fontSize = `${this.baseFontSize}px`;
    innerElement.style.lineHeight = `${this.baseLineHeightRatio}`;
    innerElement.style.whiteSpace = 'pre-wrap';
    innerElement.style.overflow = 'visible';

    let lowScale = this.MIN_SCALE_X;
    let highScale = 1.0;
    let currentBestScaleX = 1.0;
    let currentBestLogicalWidth = this.fixedOuterWidth;

    // Perform binary search for scaleX at baseFontSize
    while (highScale - lowScale > this.SCALE_PRECISION) {
        const testScaleX = (lowScale + highScale) / 2;
        const testLogicalWidth = this.fixedOuterWidth / testScaleX;

        innerElement.style.transform = `scaleX(${testScaleX})`;
        innerElement.style.width = `${testLogicalWidth}px`;

        const currentHeight = innerElement.scrollHeight;

        if (currentHeight <= targetHeight) {
            currentBestScaleX = testScaleX;
            currentBestLogicalWidth = testLogicalWidth;
            lowScale = testScaleX;
        } else {
            highScale = testScaleX;
        }
    }

    // Apply the result of the first pass (with baseFontSize)
    innerElement.style.transform = `scaleX(${currentBestScaleX})`;
    innerElement.style.width = `${currentBestLogicalWidth}px`;
    const measuredHeightAfterFirstPass = innerElement.scrollHeight;

    // --- Check if we need to switch to a smaller font size ---
    // If after trying to scale at baseFontSize, we are at minScaleX AND still overflow,
    // then switch to 13px font size.
    if (measuredHeightAfterFirstPass > targetHeight &&
        Math.abs(currentBestScaleX - this.MIN_SCALE_X) < this.SCALE_PRECISION) { // Check if we are effectively at MIN_SCALE_X
        
        console.log('Reached MIN_SCALE_X at base font size, switching to 13px.');
        targetFontSize = 13;
        targetHeight = this.fixedOuterHeightTier2; // New target height for 7 lines

        // Reset and re-measure with the new font size
        innerElement.style.transform = 'scaleX(1)'; // Reset transform
        innerElement.style.width = `${this.fixedOuterWidth}px`; // Reset width for fresh measurement
        innerElement.style.fontSize = `${targetFontSize}px`; // Apply new font size
        
        lowScale = this.MIN_SCALE_X; // Reset binary search range for the second pass
        highScale = 1.0;
        currentBestScaleX = 1.0; // Reset best scale
        currentBestLogicalWidth = this.fixedOuterWidth;

        // Perform binary search again for scaleX at 13px font size
        while (highScale - lowScale > this.SCALE_PRECISION) {
            const testScaleX = (lowScale + highScale) / 2;
            const testLogicalWidth = this.fixedOuterWidth / testScaleX;

            innerElement.style.transform = `scaleX(${testScaleX})`;
            innerElement.style.width = `${testLogicalWidth}px`;

            const currentHeight = innerElement.scrollHeight;

            if (currentHeight <= targetHeight) {
                currentBestScaleX = testScaleX;
                currentBestLogicalWidth = testLogicalWidth;
                lowScale = testScaleX;
            } else {
                highScale = testScaleX;
            }
        }
    }

    // --- Final Application of Styles ---
    // Nudge down a bit more if still slightly over after the final binary search
    innerElement.style.transform = `scaleX(${currentBestScaleX})`; // Apply current best
    innerElement.style.width = `${this.fixedOuterWidth / currentBestScaleX}px`; // Recalculate based on current best
    const finalMeasuredHeight = innerElement.scrollHeight;

    if (finalMeasuredHeight > targetHeight && currentBestScaleX > this.MIN_SCALE_X) {
        currentBestScaleX = Math.max(this.MIN_SCALE_X, currentBestScaleX - this.SCALE_PRECISION * 2);
        currentBestLogicalWidth = this.fixedOuterWidth / currentBestScaleX;
        console.log('Final nudge applied for minor overflow.');
    }

    innerElement.style.transform = `scaleX(${currentBestScaleX})`;
    innerElement.style.transformOrigin = 'left top';
    innerElement.style.width = `${currentBestLogicalWidth}px`;
    innerElement.style.fontSize = `${targetFontSize}px`; // Apply the chosen font size (14 or 13)

    this.scaleEffect = currentBestScaleX; // Update component property
    this.currentEffectFontSize = targetFontSize; // Store the final font size used

    innerElement.style.overflow = originalInnerOverflow; // Restore overflow

    console.log(`Final Adjustment: ScaleX: ${this.scaleEffect.toFixed(8)}, Logical Width: ${currentBestLogicalWidth.toFixed(4)}, Measured Height: ${innerElement.scrollHeight}, Font Size: ${this.currentEffectFontSize}`);
  }


  adjustPendulumEffectText(): void {
  }


  adjustSpellEffectText(): void {
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