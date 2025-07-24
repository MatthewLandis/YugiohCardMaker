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
  @ViewChild('loreTextDisplay') loreTextContentElement!: ElementRef; // This is the container for all lore text
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
            this.template === 'Legendary Dragon' ? '' :
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

  resetLinkRating() {
     this.linkArrows = {
    topLeft: false, top: false, topRight: false,
    left: false, right: false,
    bottomLeft: false, bottom: false, bottomRight: false
  };
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
  private readonly fixedOuterHeight = 77; // This is the height of the outer container (should fit 6 lines @ 14px, 7 lines @ 12px, 8 lines @ 10px, approx 9 lines @ 8px)
  private readonly baseFontSize = 14;
  private readonly baseLineHeightRatio = 0.9;
  private readonly smallestFontSize = 12; // Font size for 7-line support
  private readonly smallestFontSize2 = 10; // Font size for 8-line support
  private readonly smallestFontSize3 = 9; // NEW: Font size for 9-line support

  // Parameters for the iterative search
  private readonly SCALE_PRECISION = 0.00001; // Extremely high precision - REQUIRED for binary search
  private readonly MIN_SCALE_X = 0.01; // Allows for very aggressive horizontal squishing to prevent overflow
  private readonly SCALE_TRIGGER_THRESHOLD = 0.6; // Trigger 12px font if 14px font scaleX is less than this
  private readonly SCALE_TRIGGER_THRESHOLD2 = 0.6; // Trigger 10px font if 12px font scaleX is less than this
  private readonly SCALE_TRIGGER_THRESHOLD3 = 0.6; // NEW: Trigger 8px font if 10px font scaleX is less than this
  private readonly TRANSFORM_ORIGIN = 'left top';

  scaleEffect = 1; // Public property to update the template

  /**
   * Helper function to calculate the best scaleX for a given element and height budget.
   * Resets element styles for accurate measurement before calculation.
   */
  private calculateBestScaleX(
    element: HTMLElement,
    heightBudget: number,
    fontSize: number // Passed font size for consistent measurement
  ): { scaleX: number, finalHeight: number } {
    console.log(`  calculateBestScaleX called for element with text length: ${element.textContent?.length}, font: ${fontSize}px, budget: ${heightBudget}px`);

    // Reset element to a clean state for accurate measurement
    element.style.transform = 'scaleX(1)';
    element.style.transformOrigin = this.TRANSFORM_ORIGIN;
    element.style.width = `${this.fixedOuterWidth}px`;
    element.style.fontSize = `${fontSize}px`; // Use the passed font size
    element.style.lineHeight = `${this.baseLineHeightRatio}`;
    element.style.whiteSpace = 'pre-wrap';
    element.style.overflow = 'visible'; // Ensure scrollHeight can be measured accurately
    // Force a reflow to get accurate initial scrollHeight
    element.getBoundingClientRect();

    const initialContentHeight = element.scrollHeight;
    console.log(`  Initial content height (scaleX=1, font=${fontSize}px): ${initialContentHeight}px`);


    if (initialContentHeight <= heightBudget) {
      console.log(`  Content fits at scaleX=1.0. Returning 1.0.`);
      return { scaleX: 1.0, finalHeight: initialContentHeight };
    }

    // Binary search to find the optimal scaleX
    let lowScale = this.MIN_SCALE_X;
    let highScale = 1.0;
    let bestFittingScaleX = 1.0; // Default to 1.0, will be updated if a better fit is found

    let iterations = 0;
    while (highScale - lowScale > this.SCALE_PRECISION && iterations < 100) { // Added iteration limit to prevent infinite loops
      iterations++;
      const testScaleX = (lowScale + highScale) / 2;
      const testLogicalWidth = this.fixedOuterWidth / testScaleX;

      // Apply test styles
      element.style.transform = `scaleX(${testScaleX})`;
      element.style.width = `${testLogicalWidth}px`;
      // Force a reflow to get accurate scrollHeight for the test scale
      element.getBoundingClientRect();

      const currentTestHeight = element.scrollHeight;
      // console.log(`  Iteration ${iterations}: testScaleX=${testScaleX.toFixed(6)}, testLogicalWidth=${testLogicalWidth.toFixed(2)}, currentTestHeight=${currentTestHeight}px`);

      if (currentTestHeight <= heightBudget) {
        bestFittingScaleX = testScaleX; // This scale fits, try for a larger one
        lowScale = testScaleX;
      } else {
        highScale = testScaleX; // This scale doesn't fit, need a smaller one
      }
    }
    console.log(`  Binary search finished in ${iterations} iterations. bestFittingScaleX: ${bestFittingScaleX.toFixed(6)}`);


    // Apply the best fitting scale and check for slight overflow, nudging if necessary
    let finalDeterminedScaleX = bestFittingScaleX;
    let finalLogicalWidth = this.fixedOuterWidth / finalDeterminedScaleX;
    element.style.transform = `scaleX(${finalDeterminedScaleX})`;
    element.style.width = `${finalLogicalWidth}px`;
    element.getBoundingClientRect(); // Force reflow after final application
    console.log(`  After binary search, initial application: scrollHeight=${element.scrollHeight}px`);


    // Nudge down if still overflowing after the binary search
    if (element.scrollHeight > heightBudget && finalDeterminedScaleX > this.MIN_SCALE_X) {
      console.log(`  Nudging down. Current scrollHeight (${element.scrollHeight}px) > heightBudget (${heightBudget}px)`);
      finalDeterminedScaleX = Math.max(this.MIN_SCALE_X, finalDeterminedScaleX - this.SCALE_PRECISION);
      finalLogicalWidth = this.fixedOuterWidth / finalDeterminedScaleX;
      element.style.transform = `scaleX(${finalDeterminedScaleX})`;
      element.style.width = `${finalLogicalWidth}px`;
      element.getBoundingClientRect(); // One last reflow
      console.log(`  After nudging: finalDeterminedScaleX=${finalDeterminedScaleX.toFixed(6)}, scrollHeight=${element.scrollHeight}px`);
    }
    console.log(`  calculateBestScaleX returning scale: ${finalDeterminedScaleX.toFixed(6)}, finalHeight: ${element.scrollHeight}px`);

    return { scaleX: finalDeterminedScaleX, finalHeight: element.scrollHeight };
  }


  /**
   * Adjusts the lore text display by dynamically scaling it horizontally or adjusting font size.
   * It prioritizes minimal horizontal squish at base font size, then switches to a smaller font
   * and scales it horizontally as needed, even if that means extreme compression.
   *
   * Now includes 14px, 12px, 10px, and 8px font size support.
   */
  adjustLoreTextDisplay() {
    console.log(`--- adjustLoreTextDisplay Start (${this.template}, ${this.title}) ---`);
    const innerElement = this.loreTextContentElement.nativeElement as HTMLElement;
    const originalInnerOverflow = innerElement.style.overflow; // Save original overflow style

    // IMPORTANT: Clear previous transform/width before initial measurements for correct scrollHeight
    // Also ensure overflow is visible during measurement phases
    innerElement.style.transform = 'scaleX(1)';
    innerElement.style.width = `${this.fixedOuterWidth}px`;
    innerElement.style.overflow = 'visible';
    innerElement.style.whiteSpace = 'pre-wrap'; // Ensure wrapping behavior
    innerElement.textContent = this.effectText; // Ensure the element has the current text content for measurement

    let finalFontSize = this.baseFontSize; // Start with 14px
    let effectiveScaleX = 1.0;

    // --- Pass 1: Test with baseFontSize (14px) ---
    console.log(`adjustLoreTextDisplay: Pass 1 - Testing with ${this.baseFontSize}px font.`);
    let result14px = this.calculateBestScaleX(
      innerElement,
      this.fixedOuterHeight,
      this.baseFontSize
    );
    effectiveScaleX = result14px.scaleX;
    console.log(`adjustLoreTextDisplay: Pass 1 result scaleX: ${effectiveScaleX.toFixed(6)}`);


    // --- Conditional Pass 2: Check if 12px font is needed ---
    if (effectiveScaleX < this.SCALE_TRIGGER_THRESHOLD) {
      finalFontSize = this.smallestFontSize; // Set to 12px
      console.log(`adjustLoreTextDisplay: Pass 2 - 14px scale (${effectiveScaleX.toFixed(6)}) < threshold (${this.SCALE_TRIGGER_THRESHOLD}). Retesting with ${finalFontSize}px font.`);

      let result12px = this.calculateBestScaleX(
        innerElement,
        this.fixedOuterHeight,
        finalFontSize
      );
      effectiveScaleX = result12px.scaleX;
      console.log(`adjustLoreTextDisplay: Pass 2 result scaleX: ${effectiveScaleX.toFixed(6)}`);


      // --- Conditional Pass 3: Check if 10px font is needed ---
      if (effectiveScaleX < this.SCALE_TRIGGER_THRESHOLD2) {
        finalFontSize = this.smallestFontSize2; // Set to 10px
        console.log(`adjustLoreTextDisplay: Pass 3 - 12px scale (${effectiveScaleX.toFixed(6)}) < threshold (${this.SCALE_TRIGGER_THRESHOLD2}). Retesting with ${finalFontSize}px font.`);

        let result10px = this.calculateBestScaleX(
          innerElement,
          this.fixedOuterHeight,
          finalFontSize
        );
        effectiveScaleX = result10px.scaleX;
        console.log(`adjustLoreTextDisplay: Pass 3 result scaleX: ${effectiveScaleX.toFixed(6)}`);

        // --- NEW Conditional Pass 4: Check if 8px font is needed ---
        if (effectiveScaleX < this.SCALE_TRIGGER_THRESHOLD3) {
          finalFontSize = this.smallestFontSize3; // Set to 8px
          console.log(`adjustLoreTextDisplay: Pass 4 - 10px scale (${effectiveScaleX.toFixed(6)}) < threshold (${this.SCALE_TRIGGER_THRESHOLD3}). Retesting with ${finalFontSize}px font.`);

          let result8px = this.calculateBestScaleX(
            innerElement,
            this.fixedOuterHeight,
            finalFontSize
          );
          effectiveScaleX = result8px.scaleX;
          console.log(`adjustLoreTextDisplay: Pass 4 result scaleX: ${effectiveScaleX.toFixed(6)}`);
        }
      }
    }

    // --- Final application of determined font size and scale ---
    this.scaleEffect = effectiveScaleX;
    innerElement.style.fontSize = `${finalFontSize}px`;
    innerElement.style.transform = `scaleX(${effectiveScaleX})`;
    innerElement.style.width = `${this.fixedOuterWidth / effectiveScaleX}px`; // Adjust logical width
    innerElement.style.overflow = originalInnerOverflow; // Restore original overflow style

    console.log(`adjustLoreTextDisplay: Final: Font Size: ${finalFontSize}px, ScaleX: ${this.scaleEffect.toFixed(6)}`);
    console.log(`--- adjustLoreTextDisplay End ---`);
  }


  adjustPendulumEffectText(): void {
    if (!this.pendulumEffectTextDisplayElement) {
      console.warn('pendulumEffectTextDisplayElement is not available.');
      return;
    }
    const element = this.pendulumEffectTextDisplayElement.nativeElement as HTMLElement;
    element.textContent = this.pendulumEffectText; // Ensure text content is set
    const heightBudget = 30; // Example height for pendulum effect - you might want to make this dynamic as well
    const scaleResult = this.calculateBestScaleX(element, heightBudget, this.baseFontSize); // Using baseFontSize for now
    this.scalePendulumEffect = scaleResult.scaleX;
    element.style.transform = `scaleX(${this.scalePendulumEffect})`;
    element.style.width = `${this.fixedOuterWidth / this.scalePendulumEffect}px`; // Apply adjusted width
    element.style.fontSize = `${this.baseFontSize}px`; // Ensure font size is set
    element.style.overflow = 'hidden'; // Restore overflow as calculateBestScaleX sets it to visible
    console.log(`Pendulum Effect Scale: ${this.scalePendulumEffect.toFixed(6)}, Font Size: ${element.style.fontSize}`);
  }


  adjustSpellEffectText(): void {
    if (!this.spellTrapEffectTextDisplayElement) {
      console.warn('spellTrapEffectTextDisplayElement is not available.');
      return;
    }
    const element = this.spellTrapEffectTextDisplayElement.nativeElement as HTMLElement;
    element.textContent = this.effectText; // Or `this.spellTrapEffectText` if you add a separate property
    const heightBudget = 76; // Example height for spell/trap effect - you might want to make this dynamic as well
    const scaleResult = this.calculateBestScaleX(element, heightBudget, this.baseFontSize); // Using baseFontSize for now
    this.SpellscaleEffect = scaleResult.scaleX;
    element.style.transform = `scaleX(${this.SpellscaleEffect})`;
    element.style.width = `${this.fixedOuterWidth / this.SpellscaleEffect}px`; // Apply adjusted width
    element.style.fontSize = `${this.baseFontSize}px`; // Ensure font size is set
    element.style.overflow = 'hidden'; // Restore overflow as calculateBestScaleX sets it to visible
    console.log(`Spell/Trap Effect Scale: ${this.SpellscaleEffect.toFixed(6)}, Font Size: ${element.style.fontSize}`);
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