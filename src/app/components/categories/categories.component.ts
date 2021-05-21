import { AfterContentInit, AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { CategoriesService } from '../../services/categories.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, AfterViewChecked {
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>
  @Output() selectCategory = new EventEmitter<Category[]>();
  @Input() clearSelected: EventEmitter<boolean>;
  
  listCategoriesSelected: Category[] = [];
  listCategories: Category[];
  @Input() idChecked?: string;

  constructor(private categoriesService: CategoriesService) { }

  ngOnInit(): void {
    

    this.categoriesService.get().subscribe((result: Category[]) => {
      this.listCategories = result;
      const checkElement = document.getElementById(this.idChecked) as HTMLInputElement;

    });

    if(this.clearSelected){
      this.clearSelected.subscribe(clear => {
        this.listCategoriesSelected = [];
        this.checkboxes.forEach((element) => {
          element.nativeElement.checked = false;
        });
      });
    }

  }

  ngAfterViewChecked(): void {
    if (this.checkboxes['_results'].length > 0) {
      this.checkboxes.forEach((element) => {
        if (element.nativeElement.id === this.idChecked) {
          element.nativeElement.checked = true;
        }
      });
      return;
    }

  }

  select(category: Category) {
    const index = this.listCategoriesSelected.indexOf(category);
    if(index > -1){
      this.listCategoriesSelected.splice(index, 1);
      this.selectCategory.emit(this.listCategoriesSelected);

      return;
    }

    this.listCategoriesSelected.push(category);
    this.selectCategory.emit(this.listCategoriesSelected);
  } 
}
