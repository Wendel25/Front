import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CategoryService } from './../../../../services/category/category.service';
import { categoriesEvent } from 'src/app/models/enums/categoriesEvent';
import { EditCategoryAction } from 'src/app/models/interfaces/category/event/EditCategoryAction';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: []
})

export class CategoryFormComponent implements OnInit, OnDestroy{
  private readonly destroy$: Subject<void> = new Subject
  private addCategory = categoriesEvent.ADD_CATEGORY_EVENT;
  private editCategory = categoriesEvent.EDIT_CATEGORY_EVENT;

  public categoryAction!: {event: EditCategoryAction};

  public categoryForm = this.formBuilder.group({
    name: ['', Validators.required]
  })

  constructor(
    public ref: DynamicDialogConfig,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private categoryService: CategoryService,
    private refClosed: DynamicDialogRef
  ){}

  ngOnInit(): void {

  }

  handleSubmitAddCategory(): void{
    if(this.categoryForm?.value && this.categoryForm?.valid){
      const requestCreatCategory: { name: string } = {
        name: this.categoryForm.value.name as string
      };

      this.categoryService.createNewCategory(requestCreatCategory).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          if(response){
            this.categoryForm.reset();

            this.messageService.add({
              severity: 'success',
              summary: "Sucesso",
              detail: 'Categoria criada com sucesso!',
              life: 3000
            })

            this.refClosed.close();
          }
        },
        error: (err) =>{
          console.log(err);

          this.messageService.add({
            severity: 'error',
            summary: "Erro",
            detail: 'Erro ao tentar criar categoria!',
            life: 3000
          })
        }
      })
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
