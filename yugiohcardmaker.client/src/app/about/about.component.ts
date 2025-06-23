import { Component, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    this.createBackgroundCard();
    setInterval(() => this.createBackgroundCard(), 2000);
  }

  createBackgroundCard(): void {
    const maxCards = 15;
    const cardImagePath = '/assets/card.png';





  }
}
