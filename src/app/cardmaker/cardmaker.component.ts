import { Component, ElementRef, ViewChild, HostListener, OnDestroy, OnInit } from '@angular/core';
import { toPng } from 'html-to-image';

// NEW: Define an interface for a single primary monster type slot
interface PrimaryMonsterTypeSlot {
  id: number; // Unique ID for trackBy in ngFor
  selectedValue: string; // The value typed into the input or chosen from the dropdown
  // customInputValue: string; // No longer explicitly needed if selectedValue holds all input
}

@Component({
  selector: 'app-cardmaker',
  templateUrl: './cardmaker.component.html',
  styleUrls: ['./cardmaker.component.css', './fonts.css']
})
export class CardMakerComponent implements OnInit, OnDestroy {

  // --- Card Preview States ---
  template = 'Normal';
  pendulumTemplate = false;
  titleStyle = 'Rare';
  title = 'Bitron';
  attribute = 'Earth';
  level = 2;
  spellTrapType = 'Normal';

  // Monster Settings
  primaryMonsterTypeSlots: PrimaryMonsterTypeSlot[] = [];
  private nextPrimaryTypeId: number = 1; // For generating unique IDs for new slots

  coreMonsterType = '';
  // Removed isAbilityMonsterTypeCustom and customAbilityMonsterType as abilityMonsterType will hold the value directly
  abilityMonsterType = ''; // Binds to the ability input field

  lastMonsterType = '';
  attack = '200';
  defense = '2000';
  levelType = 'Level';
  linkRating = 3;

  // Card Text Settings
  effectText = "A new species found in electronic space. There's not much information on it.";
  pendulumScale = 4;
  pendulumEffectText = "Once per turn: You can target 1 face-up monster your opponent controls; halve its original ATK.";

  // --- New property to hold the currently selected level for UI styling ---
  selectedLevel: number | null = this.level;

  // --- Card Array data Holders ---
  coreTemplates = ['Ritual', 'Fusion', 'Synchro', 'Dark Synchro', 'Xyz', 'Link'];
  titleStyles = ['Common', 'Rare', 'SecretRare', 'UltraRare'];
  levelTypes = ['Level', 'Rank', 'Nlevel'];
  spellTypes = ['Normal', 'Continuous', 'Equip', 'Ritual', 'QuickPlay', 'Field'];
  trapTypes = ['Normal', 'Continuous', 'Counter'];
  divineBeasts = ['Slifer', 'Obelisk', 'Ra'];
  effectTypes: 'Lore' | 'Effect' = 'Lore';

  primaryMonsterTypes = ['Aqua', 'Beast', 'Beast-Warrior', 'Creator God', 'Cyberse', 'Dinosaur', 'Divine-Beast', 'Dragon',
    'Fairy', 'Fiend', 'Fish', 'Insect', 'Illusion', 'Machine', 'Plant', 'Psychic', 'Pyro', 'Reptile',
    'Rock', 'Sea Serpent', 'Spellcaster', 'Thunder', 'Warrior', 'Winged Beast', 'Wyrm', 'Zombie']; // 'Custom' removed, as typing directly handles it

  coreMonsterTypes = ['', 'Ritual', 'Fusion', 'Synchro', 'Dark Synchro', 'Xyz', 'Pendulum', 'Link'];

  // MODIFIED: abilityMonsterTypes, 'Custom' removed
  abilityMonsterTypes = ['Flip', 'Union', 'Spirit', 'Toon', 'Gemini', 'Tuner'];


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

  // --- Dropdown States for new combined input ---
  showMonsterTypeDropdown: boolean = false; // For the primary monster type
  showAdditionalMonsterTypeDropdown: boolean[] = []; // For dynamically added monster types (index-based)
  showAbilityDropdown: boolean = false; // For the ability dropdown
  showTemplateDropdown: boolean = false; // For the "Other" template dropdown

  // --- ViewChild references for DOM elements ---
  @ViewChild('cardPrintArea') cardPrintArea!: ElementRef;
  @ViewChild('displayContainer') displayContainer!: ElementRef;

  // For the "Other" template dropdown (if you still have it)
  @ViewChild('templateDropdownList') templateDropdownList!: ElementRef;
  @ViewChild('templateDropdownToggle') templateDropdownToggle!: ElementRef;

  // For the primary monster type dropdown
  @ViewChild('primaryMonsterTypeDropdownList') primaryMonsterTypeDropdownList!: ElementRef;
  @ViewChild('primaryMonsterTypeDropdownToggle') primaryMonsterTypeDropdownToggle!: ElementRef;

  // For the ability dropdown
  @ViewChild('abilityDropdownList') abilityDropdownList!: ElementRef;
  @ViewChild('abilityDropdownToggle') abilityDropdownToggle!: ElementRef;


  // --- Private property for temporary canvas context ---
  private context!: CanvasRenderingContext2D;

  constructor() {
    const offscreenCanvas = document.createElement('canvas');
    this.context = offscreenCanvas.getContext('2d') as CanvasRenderingContext2D;
  }

  ngOnInit(): void {
    this.updateLevelType();
    // Initialize with one primary monster type slot and a default value
    this.addPrimaryMonsterTypeSlot('Cyberse');
    this.autoMonsterTypeAdjustment(); // Ensure initial adjustment
  }

  // Use @HostListener to listen for clicks anywhere on the document
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    // --- Logic for "Other" template dropdown (if applicable) ---
    if (this.showTemplateDropdown && this.templateDropdownList && this.templateDropdownToggle) {
      const clickedInsideList = this.templateDropdownList.nativeElement.contains(event.target);
      const clickedOnToggle = this.templateDropdownToggle.nativeElement.contains(event.target);
      if (!clickedInsideList && !clickedOnToggle) {
        this.showTemplateDropdown = false;
      }
    }

    // --- Logic for Primary Monster Type Dropdown ---
    if (this.showMonsterTypeDropdown && this.primaryMonsterTypeDropdownList && this.primaryMonsterTypeDropdownToggle) {
      const clickedInsideList = this.primaryMonsterTypeDropdownList.nativeElement.contains(event.target);
      const clickedOnToggle = this.primaryMonsterTypeDropdownToggle.nativeElement.contains(event.target);
      if (!clickedInsideList && !clickedOnToggle) {
        this.showMonsterTypeDropdown = false;
      }
    }

    // --- Logic for Additional Monster Type Dropdowns (more complex, might need more specific ViewChild references or a dynamic approach) ---
    // For simplicity, we'll close all additional dropdowns if a click occurs outside of any of them.
    // A more robust solution might involve distinct ViewChild queries or a custom directive.
    this.showAdditionalMonsterTypeDropdown = this.showAdditionalMonsterTypeDropdown.map(() => false);


    // --- Logic for Ability Dropdown ---
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


  /**
   * Capitalizes the first letter of a string.
   * @param value The string to capitalize.
   * @returns The string with its first letter capitalized.
   */
  capitalizeFirstLetter(value: string): string {
    if (!value) {
      return '';
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  // --- NEW: Methods for managing multiple primary monster type slots ---
  addPrimaryMonsterTypeSlot(defaultValue: string = '') { // Default to empty string for initial user input
    this.primaryMonsterTypeSlots.push({
      id: this.nextPrimaryTypeId++,
      selectedValue: defaultValue,
      // customInputValue is now merged into selectedValue
    });
    // Ensure the new slot's dropdown state is initialized
    this.showAdditionalMonsterTypeDropdown.push(false);
    this.autoMonsterTypeAdjustment(); // Update display immediately
  }

  removePrimaryMonsterTypeSlot(id: number) {
    const indexToRemove = this.primaryMonsterTypeSlots.findIndex(slot => slot.id === id);
    if (indexToRemove > -1) {
      this.primaryMonsterTypeSlots.splice(indexToRemove, 1);
      this.showAdditionalMonsterTypeDropdown.splice(indexToRemove, 1); // Remove corresponding dropdown state
    }

    if (this.primaryMonsterTypeSlots.length === 0) {
      // Ensure at least one slot always exists
      this.addPrimaryMonsterTypeSlot(''); // Add with empty default
    }
    this.autoMonsterTypeAdjustment(); // Update display immediately
  }

  // MODIFIED: This now handles input into the text field for a specific slot
  onPrimaryTypeInput(slot: PrimaryMonsterTypeSlot) {
    slot.selectedValue = this.capitalizeFirstLetter(slot.selectedValue);
    this.autoMonsterTypeAdjustment(); // Update display immediately
    // Optional: Add logic to filter dropdown options as user types
  }

  // Helper for trackBy function in ngFor
  trackById(index: number, slot: PrimaryMonsterTypeSlot): number {
    return slot.id;
  }

  // --- NEW: Dropdown Toggle/Selection for Primary Monster Type ---
  toggleMonsterTypeDropdown() {
    this.showMonsterTypeDropdown = !this.showMonsterTypeDropdown;
  }

  selectMonsterTypeFromDropdown(slot: PrimaryMonsterTypeSlot, value: string) {
    slot.selectedValue = value; // Assign the selected value to the text input
    this.showMonsterTypeDropdown = false; // Hide the dropdown
    this.autoMonsterTypeAdjustment(); // Trigger any auto-adjustment
  }

  // --- NEW: Dropdown Toggle/Selection for Additional Monster Types ---
  toggleAdditionalMonsterTypeDropdown(index: number) {
    this.showAdditionalMonsterTypeDropdown[index] = !this.showAdditionalMonsterTypeDropdown[index];
  }

  // This function is reused for additional slots.
  // selectMonsterTypeFromDropdown(slot: PrimaryMonsterTypeSlot, value: string) {...}

  // --- NEW: Dropdown Toggle/Selection for Ability ---
  onAbilityInput() {
    this.abilityMonsterType = this.capitalizeFirstLetter(this.abilityMonsterType);
    // Optional: Add logic to filter ability dropdown options as user types
    this.autoMonsterTypeAdjustment(); // Ensure text size adjusts
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
    this.autoMonsterTypeAdjustment(); // Ensure text size adjusts
  }

  // --- UI Update Logic ---
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
    // checkAbilityMonsterTypeCustom is no longer needed as the input directly holds the value
  }

  pendulumUpdate() {
    const pendulumSupportedTemplates = ['Normal', 'Effect', 'Fusion', 'Synchro', 'Ritual', 'Xyz'];
    if (!pendulumSupportedTemplates.includes(this.template)) {
      this.pendulumTemplate = false;
    }
  }

  updateTitleStyle() {
    this.titleStyle = this.template === 'Skill' ? 'Skill' :
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

  // MODIFIED: updatePrimaryMonsterType to affect the first slot
  updatePrimaryMonsterType() {
    if (this.primaryMonsterTypeSlots.length > 0) {
      if (this.template === 'Legendary Dragon') {
        this.primaryMonsterTypeSlots[0].selectedValue = 'Legendary Dragon';
      } else if (this.divineBeasts.includes(this.template)) {
        this.primaryMonsterTypeSlots[0].selectedValue = 'Divine-Beast';
      }
      this.autoMonsterTypeAdjustment(); // Update display
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
    }
    else {
      this.effectTypes = 'Effect';
    }
    this.updateLastMonsterType();
    this.autoMonsterTypeAdjustment();
  }

  updateLinkRating() {
    this.linkRating = Object.values(this.linkArrows).filter(Boolean).length;
  }

  resetSpellTrapType() {
    // Add logic here if you need to reset spell/trap type based on template changes
  }

  // checkAbilityMonsterTypeCustom is no longer needed as 'abilityMonsterType' holds the direct value.
  // You might want a different check if 'Custom' behavior is still needed based on typed value.
  // checkAbilityMonsterTypeCustom() {
  //   this.isAbilityMonsterTypeCustom = this.abilityMonsterType === 'Custom';
  //   if (!this.isAbilityMonsterTypeCustom) {
  //     this.customAbilityMonsterType = '';
  //   }
  //   this.autoMonsterTypeAdjustment();
  // }

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
    if (!cardTitleSize) return;

    const { fontSize, fontFamily } = window.getComputedStyle(cardTitleSize);
    this.context.font = `${fontSize} ${fontFamily}`;

    const textWidth = this.context.measureText(this.title).width;
    const textboxWidth = 306;

    this.scaleTitle = textWidth > textboxWidth ? textboxWidth / textWidth : 1;
  }

  // MODIFIED: autoMonsterTypeAdjustment to use array of primaryMonsterTypeSlots
  autoMonsterTypeAdjustment() {
    const monsterTypeElement = document.querySelector('.monsterType') as HTMLElement;
    if (!monsterTypeElement) return;

    const computedStyle = window.getComputedStyle(monsterTypeElement);
    this.context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    // Build the concatenated primary monster types string from selectedValue
    const combinedPrimaryTypes = this.primaryMonsterTypeSlots
      .map(slot => slot.selectedValue) // Directly use selectedValue
      .filter(type => type) // Filter out empty strings/nulls
      .join('/'); // Join with a slash


    let currentAbilityType = this.abilityMonsterType; // Directly use abilityMonsterType
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

  // Helper method to format primary monster types for display on the card (if needed by preview)
  getFormattedPrimaryMonsterTypes(): string {
    return this.primaryMonsterTypeSlots
      .map(slot => slot.selectedValue) // Directly use selectedValue
      .filter(type => type) // Remove any empty strings
      .join('/');
  }

  adjustEffectText() {
  }

  adjustPendulumEffectText() {
  }

  adjustSpellEffectText() {
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