import { Component, EventEmitter, Input, Output } from '@angular/core';
import { categoriesEvent } from 'src/app/models/enums/categoriesEvent';
import { DeleteCategoryAction } from 'src/app/models/interfaces/category/event/DeleteCategory';
import { EditCategoryAction } from 'src/app/models/interfaces/category/event/EditCategoryAction';
import { GetCategoryResponse } from 'src/app/models/interfaces/category/responses/GetCategoryResponse';

@Component({
  selector: 'app-categories-table',
  templateUrl: './categories-table.component.html',
  styleUrls: []
})

export class CategoriesTableComponent {
  @Input() public categories: Array<GetCategoryResponse> = [];
  @Output() public categoryEvent = new EventEmitter<EditCategoryAction>();
  @Output() public deleteCategoryEvent = new EventEmitter<DeleteCategoryAction>();

  public categorySelected!: GetCategoryResponse;
  public addCategoryAction = categoriesEvent.ADD_CATEGORY_EVENT;
  public editCategoryAction = categoriesEvent.EDIT_CATEGORY_EVENT;

  handleDeleteCategoryEvent(category_id:string, categoryName: string): void{
    if(category_id !== '' && categoryName !== ''){
      this.deleteCategoryEvent.emit({category_id, categoryName})
    }
  }

  handleCategoryEvent(action: string, id?: string, categoryName?: string): void{
    if(action && action !== ''){
      this.categoryEvent.emit({action, id, categoryName})
    }
  }
}
