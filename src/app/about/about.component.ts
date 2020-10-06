import { Component } from '@angular/core';
import {
  faUniversity,
  IconDefinition,
  faAtom,
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent {
  faUniversity: IconDefinition = faUniversity;
  faAtom: IconDefinition = faAtom;
  faGithub: IconDefinition = faGithub;
}
