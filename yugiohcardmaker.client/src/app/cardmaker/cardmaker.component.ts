import { Component } from '@angular/core';
import html2canvas from 'html2canvas';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cardmaker',
  templateUrl: './cardmaker.component.html',
  styleUrls: ['./cardmaker.component.css'],
})

export class CardMakerComponent {
  Template = 'Normal';
  Templates = ['Normal', 'Effect', 'Ritual', 'Fusion', 'Synchro', 'Xyz', 'Link', 'Token', 'Spell', 'Trap',
    'Skill', 'Slifer', 'Obelisk', 'Ra', 'Dark Synchro', 'Legendary Dragon'];
  CoreTemplates = ['Ritual', 'Fusion', 'Synchro', 'Dark Synchro', 'Xyz', 'Link'];
  DivineBeasts = ['Slifer', 'Obelisk', 'Ra'];
  PendulumTemplate = false;

  Attribute = 'Dark';
  Attributes = ['Dark', 'Light', 'Earth', 'Wind', 'Fire', 'Water', 'Divine', 'Spell', 'Trap', 'No Attribute'];

  CardTitle = {
    Title: 'Dark Magician',
    TitleStyle: 'Common',
    TitleStyles: ['Common', 'Rare', 'SecretRare', 'UltraRare', 'Skill']
  };

  LevelType: 'Level' | 'Rank' | 'NLevel' = 'Level';
  Stats = {
    Attack: '2500',
    Defense: '2100',
    LevelValue: 7,
    LevelType: 'Level',
    LinkRating: 3,
    PendulumScale: 4
  };

  loreOrEffect: 'lore' | 'effect' = 'lore';
  text = {
    lore: 'The ultimate wizard in terms of attack and defense.',
    pendulum: 'Once per turn: You can target 1 face-up monster your opponent controls; halve its original ATK.'
  };

  MonsterTypes = {
    Primary: 'Spellcaster',
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
  SpellTrapTypes = {
    Spell: ['Normal', 'Continuous', 'Equip', 'Ritual', 'QuickPlay', 'Field'],
    Trap: ['Normal', 'Continuous', 'Counter']
  };

  private apiUrl = 'http://localhost:5000/api/deck/saveCard';

  private canvas = document.createElement('canvas');
  private context = this.canvas.getContext('2d')!;

  constructor(private http: HttpClient, private router: Router) { }

  
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
  }
  
  updateTitleStyle() {
    this.CardTitle.TitleStyle = this.Template === 'Skill' ? 'Skill' :
    this.CardTitle.TitleStyle =
      ['Spell', 'Trap', 'Xyz'].includes(this.Template) ? 'Rare' : 'Common';
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
      this.MonsterTypes.Primary = this.DivineBeasts.includes(this.Template) ? 'Divine-Beast' : this.MonsterTypes.Primary;
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
      this.CoreTemplates.includes(this.Template) ? this.loreOrEffect === 'effect' ? 'Effect' : '' :
      effectTemplates.includes(this.Template) ? 'Effect' : this.MonsterTypes.Last;

    this.loreOrEffect =
      this.Template === 'Normal' || this.Template === 'Token' ? 'lore' :
      effectTemplates.includes(this.Template) ? 'effect' : this.loreOrEffect;
  }
  
  setLoreOrEffect(option: 'lore' | 'effect') {
    this.Template = this.loreOrEffect === 'effect' ?
      this.Template === 'Normal' ? 'Effect' : this.Template :
      this.Template === 'Effect' ? 'Normal' : this.Template;

    this.MonsterTypes.Last = this.loreOrEffect === 'effect' ? 'Effect' :
      !this.MonsterTypes.Core ? 'Normal' : this.MonsterTypes.Last;

    this.updateLastMonsterType();
  }
  
  updateUnderline() {
    this.underLine = this.Template === 'Link' ? 'atkLink' : 'atkDef';
    this.Stats.Defense = this.Template === 'Link' ? '' : '2100';
  }

  updateLinkRating() {
    this.Stats.LinkRating = Object.values(this.linkArrows).filter(Boolean).length;
  }

  resetSpellTrapType() {
    (['Spell', 'Trap'].includes(this.Template)) ?
    (!this.SpellTrapTypes[this.Template as 'Spell' | 'Trap'].includes(this.SpellTrapType)) :
    this.SpellTrapType = 'Normal';
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
    // Generate the image of the card display
    const displayElement = document.querySelector('.Display') as HTMLElement;

    if (displayElement) {
      html2canvas(displayElement).then((canvas) => {
        const cardImage = canvas.toDataURL('image/png');

        // Download the image or save it to the server
        const link = document.createElement('a');
        link.href = cardImage;
        link.download = `${this.CardTitle.Title}.png`;
        link.click();

        this.http.post(this.apiUrl, cardImage).subscribe();
      });
    }
    console.log('good');
  }

    scaleTitle = 1;
    autoTitleTextAdjustment() {
      const computedStyle = window.getComputedStyle(document.querySelector('.CardTitle')!);
      this.context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

      const textWidth = this.context.measureText(this.CardTitle.Title).width;
      const textboxWidth = 630;

      this.scaleTitle = textWidth > textboxWidth ? textboxWidth / textWidth : 1;
    }

    scaleMonsterType = 1;
    autoMonsterTypeAdjustment() {
      const computedStyle = window.getComputedStyle(document.querySelector('.monsterType')!);
      this.context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

      let monsterTypeText = '[' + this.MonsterTypes.Primary +
        (this.MonsterTypes.Core ? '/' + this.MonsterTypes.Core : '') +
        (this.PendulumTemplate ? '/Pendulum' : '') +
        (this.MonsterTypes.Ability ? '/' + this.MonsterTypes.Ability : '') +
        (this.MonsterTypes.Last ? '/' + this.MonsterTypes.Last : '') + ']';

      const textWidth = this.context.measureText(monsterTypeText).width;
      const textboxWidth = 672;

      this.scaleMonsterType = textWidth > textboxWidth ? textboxWidth / textWidth : 1;
  }

    scaleEffect = 1;
    adjustEffectText() {
      const computedStyle = window.getComputedStyle(document.querySelector('.loreText')!);
      this.context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

      const actualWidth = this.context.measureText(this.text.lore).width;
      const desiredWidth = 3165;

      this.scaleEffect = Math.min(1, desiredWidth / actualWidth);

      (document.querySelector('.loreText') as HTMLElement).style.width = `${100 / this.scaleEffect}%`;
    }

    scalePendulumEffect = 1;
    adjustPendulumEffectText() {
      const computedStyle = window.getComputedStyle(document.querySelector('.PendulumText')!);
      this.context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

      const actualWidth = this.context.measureText(this.text.pendulum).width;
      const desiredWidth = 2250;

      if (actualWidth > desiredWidth) {
        this.scalePendulumEffect = desiredWidth / actualWidth;
        (document.querySelector('.PendulumText') as HTMLElement).style.width = `${100 * 1 / this.scalePendulumEffect}%`
      } else {
        this.scalePendulumEffect = 1;
        (document.querySelector('.PendulumText') as HTMLElement).style.width = `${100 * 1 / this.scalePendulumEffect}%`
      }
    }

    SpellscaleEffect = 1;
    adjustSpellEffectText() {
      const computedStyle = window.getComputedStyle(document.querySelector('.spellText')!);
      this.context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

      const textWidth = this.context.measureText(this.text.lore).width;
      const textboxWidth = 4400;

      this.SpellscaleEffect = textWidth > textboxWidth ? textboxWidth / textWidth : 1;
    }
  }

