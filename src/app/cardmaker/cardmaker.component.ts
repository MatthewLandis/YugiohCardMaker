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
    // Perform initial adjustments when the component loads
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
    // Defer these calls to ensure the DOM has updated
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

  // Event handler for effectText changes - now using setTimeout
  onEffectTextChange(): void {
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

  // Event handler for spellTrapEffectText changes - now using setTimeout
  onSpellTrapEffectTextChange(): void {
    setTimeout(() => {
      this.adjustSpellEffectText();
    });
  }

  private readonly fixedOuterWidth = 336;
  private readonly fixedOuterHeight = 77; // This is the height of the outer container (should fit 6 lines @ 14px, 7 lines @ 12px)
  private readonly baseFontSize = 14;
  private readonly baseLineHeightRatio = 0.9;
  private readonly smallestFontSize = 12; // Font size for the alternative path

  // Parameters for the iterative search
  private readonly SCALE_PRECISION = 0.00001; // Extremely high precision - REQUIRED for binary search
  private readonly MIN_SCALE_X = 0.01; // CHANGED: Allows for very aggressive horizontal squishing to prevent overflow
  private readonly SCALE_TRIGGER_THRESHOLD = 0.6; // Trigger 12px font if 14px font scaleX is less than this
  private readonly TRANSFORM_ORIGIN = 'left top'; // Consistent transform origin

  scaleEffect = 1; // Public property to update the template

  /**
   * Adjusts the lore text display by dynamically scaling it horizontally or adjusting font size.
   * It prioritizes minimal horizontal squish at base font size, then switches to a smaller font
   * and scales it horizontally as needed, even if that means extreme compression.
   */
  adjustLoreTextDisplay() {
    console.log(`--- adjustLoreTextDisplay Start ---`);
    const innerElement = this.loreTextContentElement.nativeElement as HTMLElement;
    const originalInnerOverflow = innerElement.style.overflow; // Save original overflow style

    let currentScaleX = 1.0;
    let currentFontSize = this.baseFontSize; // Start with 14px

    // --- Pass 1: Attempt to fit with baseFontSize (14px) ---
    console.log(`adjustLoreTextDisplay: Pass 1 - Attempting with baseFontSize=${this.baseFontSize}px`);

    // Reset element to base state for accurate measurement with baseFontSize
    innerElement.style.transform = 'scaleX(1)';
    innerElement.style.transformOrigin = this.TRANSFORM_ORIGIN;
    innerElement.style.width = `${this.fixedOuterWidth}px`;
    innerElement.style.fontSize = `${this.baseFontSize}px`;
    innerElement.style.lineHeight = `${this.baseLineHeightRatio}`;
    innerElement.style.whiteSpace = 'pre-wrap';
    innerElement.style.overflow = 'visible'; // Ensure scrollHeight can be measured accurately

    const initialContentHeight = innerElement.scrollHeight;
    console.log(`adjustLoreTextDisplay: initialContentHeight (Pass 1)=${initialContentHeight}, fixedOuterHeight=${this.fixedOuterHeight}`);

    if (initialContentHeight <= this.fixedOuterHeight) {
      console.log(`adjustLoreTextDisplay: Pass 1: Fits at scaleX=1 with ${this.baseFontSize}px font. No further scaling needed.`);
      this.scaleEffect = 1.0;
      innerElement.style.overflow = originalInnerOverflow;
      return; // Exit early if it fits immediately
    }

    // Binary search for Pass 1 (14px font)
    console.log(`adjustLoreTextDisplay: Pass 1: Content overflows. Starting binary search for scale between ${this.MIN_SCALE_X} and 1.0`);
    let lowScale1 = this.MIN_SCALE_X;
    let highScale1 = 1.0;
    let bestFittingScaleX1 = 1.0;

    let iteration1 = 0;
    while (highScale1 - lowScale1 > this.SCALE_PRECISION) { // THIS CONDITION MUST REMAIN
      iteration1++;
      const testScaleX = (lowScale1 + highScale1) / 2;
      const testLogicalWidth = this.fixedOuterWidth / testScaleX;

      innerElement.style.transform = `scaleX(${testScaleX})`;
      innerElement.style.width = `${testLogicalWidth}px`;

      const currentTestHeight = innerElement.scrollHeight;

      if (currentTestHeight <= this.fixedOuterHeight) {
        bestFittingScaleX1 = testScaleX;
        lowScale1 = testScaleX;
      } else {
        highScale1 = testScaleX;
      }
    }
    console.log(`adjustLoreTextDisplay: Pass 1: Binary search finished in ${iteration1} iterations. Best fitting scale found (before nudge): ${bestFittingScaleX1.toFixed(6)}`);

    // Apply and nudge for Pass 1
    let finalDeterminedScaleX1 = bestFittingScaleX1;
    let finalLogicalWidth1 = this.fixedOuterWidth / finalDeterminedScaleX1;
    innerElement.style.transform = `scaleX(${finalDeterminedScaleX1})`;
    innerElement.style.width = `${finalLogicalWidth1}px`;

    const scrollHeightAfterApply1 = innerElement.scrollHeight;
    console.log(`adjustLoreTextDisplay: Pass 1: Nudge check: scrollHeight after apply=${scrollHeightAfterApply1}, outerHeight=${this.fixedOuterHeight}, finalDeterminedScaleX=${finalDeterminedScaleX1.toFixed(6)}`);

    // Nudge only if it still overflows AND we're not at the extreme minimum scale
    if (scrollHeightAfterApply1 > this.fixedOuterHeight && finalDeterminedScaleX1 > this.MIN_SCALE_X) {
      console.log(`adjustLoreTextDisplay: Pass 1: Nudging scale down...`);
      finalDeterminedScaleX1 = Math.max(this.MIN_SCALE_X, finalDeterminedScaleX1 - this.SCALE_PRECISION);
      finalLogicalWidth1 = this.fixedOuterWidth / finalDeterminedScaleX1;
      innerElement.style.transform = `scaleX(${finalDeterminedScaleX1})`;
      innerElement.style.width = `${finalLogicalWidth1}px`;
    }
    console.log(`adjustLoreTextDisplay: Pass 1 Result: finalScaleX=${finalDeterminedScaleX1.toFixed(6)}, finalFontSize=${this.baseFontSize}px`);

    currentScaleX = finalDeterminedScaleX1;
    currentFontSize = this.baseFontSize; // Still 14px here


    // --- Conditional Pass 2: If 14px font scaled below 0.6, try with 12px font and its own scaling ---
    const triggerSmallestFont = currentScaleX < this.SCALE_TRIGGER_THRESHOLD;
    console.log(`adjustLoreTextDisplay: Check for 12px font switch: triggerSmallestFont=${triggerSmallestFont} (currentScaleX=${currentScaleX.toFixed(6)}, threshold=${this.SCALE_TRIGGER_THRESHOLD})`);

    if (triggerSmallestFont) {
      console.log(`adjustLoreTextDisplay: Triggering Pass 2 - Switching to smallestFontSize=${this.smallestFontSize}px`);
      currentFontSize = this.smallestFontSize; // Set the new target font size to 12px

      // Reset element to base state for accurate measurement with smallestFontSize
      innerElement.style.transform = 'scaleX(1)';
      innerElement.style.transformOrigin = this.TRANSFORM_ORIGIN;
      innerElement.style.width = `${this.fixedOuterWidth}px`;
      innerElement.style.fontSize = `${this.smallestFontSize}px`; // Use the new font size
      innerElement.style.lineHeight = `${this.baseLineHeightRatio}`;
      innerElement.style.whiteSpace = 'pre-wrap';
      innerElement.style.overflow = 'visible';

      const initialContentHeight2 = innerElement.scrollHeight;
      console.log(`adjustLoreTextDisplay: initialContentHeight (Pass 2)=${initialContentHeight2}, fixedOuterHeight=${this.fixedOuterHeight}`);

      // Binary search for Pass 2 (12px font)
      console.log(`adjustLoreTextDisplay: Pass 2: Content (with 12px font) overflows or needs optimal scaling. Starting binary search for scale between ${this.MIN_SCALE_X} and 1.0`);
      let lowScale2 = this.MIN_SCALE_X; // Start from the very low MIN_SCALE_X
      let highScale2 = 1.0;
      let bestFittingScaleX2 = 1.0;

      let iteration2 = 0;
      while (highScale2 - lowScale2 > this.SCALE_PRECISION) { // THIS CONDITION MUST REMAIN
        iteration2++;
        const testScaleX = (lowScale2 + highScale2) / 2;
        const testLogicalWidth = this.fixedOuterWidth / testScaleX;

        innerElement.style.transform = `scaleX(${testScaleX})`;
        innerElement.style.width = `${testLogicalWidth}px`;

        const currentTestHeight = innerElement.scrollHeight;

        if (currentTestHeight <= this.fixedOuterHeight) {
          bestFittingScaleX2 = testScaleX;
          lowScale2 = testScaleX;
        } else {
          highScale2 = testScaleX;
        }
      }

      // Apply and nudge for Pass 2
      let finalDeterminedScaleX2 = bestFittingScaleX2;
      let finalLogicalWidth2 = this.fixedOuterWidth / finalDeterminedScaleX2;
      innerElement.style.transform = `scaleX(${finalDeterminedScaleX2})`;
      innerElement.style.width = `${finalLogicalWidth2}px`;

      const scrollHeightAfterApply2 = innerElement.scrollHeight;

      // Nudge only if it still overflows AND we're not at the extreme minimum scale
      if (scrollHeightAfterApply2 > this.fixedOuterHeight && finalDeterminedScaleX2 > this.MIN_SCALE_X) {
        console.log(`adjustLoreTextDisplay: Pass 2: Nudging scale down...`);
        finalDeterminedScaleX2 = Math.max(this.MIN_SCALE_X, finalDeterminedScaleX2 - this.SCALE_PRECISION);
        finalLogicalWidth2 = this.fixedOuterWidth / finalDeterminedScaleX2;
        innerElement.style.transform = `scaleX(${finalDeterminedScaleX2})`;
        innerElement.style.width = `${finalLogicalWidth2}px`;
      }
      currentScaleX = finalDeterminedScaleX2; // This is the ultimate final scale from Pass 2
    }

    // --- Finalize: Update the component's public property and restore overflow ---
    this.scaleEffect = currentScaleX; // Update the component's scale property for template binding

    // Restore original overflow
    innerElement.style.overflow = originalInnerOverflow;
  }


  adjustPendulumEffectText(): void {
    // If you want this method to have similar scaling logic,
    // you would duplicate the entire two-pass adjustment logic
    // from adjustLoreTextDisplay here, adapting it for this.pendulumEffectTextDisplayElement
    // and this.scalePendulumEffect.
  }


  adjustSpellEffectText(): void {
    // If you want this method to have similar scaling logic,
    // you would duplicate the entire two-pass adjustment logic
    // from adjustLoreTextDisplay here, adapting it for this.spellTrapEffectTextDisplayElement
    // and this.SpellscaleEffect.
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