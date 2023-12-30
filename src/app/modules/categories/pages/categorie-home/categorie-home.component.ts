import { Component, OnDestroy, OnInit } from '@angular/core';
import { CategoryService } from './../../../../services/category/category.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GetCategoryResponse } from 'src/app/models/interfaces/category/responses/GetCategoryResponse';
import { DeleteCategoryAction } from 'src/app/models/interfaces/category/event/DeleteCategory';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';
import { CategoryFormComponent } from './../../components/category-form/category-form.component';

@Component({
  selector: 'app-categorie-home',
  templateUrl: './categorie-home.component.html',
  styleUrls: []
})

export class CategorieHomeComponent implements OnInit, OnDestroy{
  private readonly destroy$: Subject<void> = new Subject()

  public categoriesDatas: Array<GetCategoryResponse> = []
  public ref!: DynamicDialogRef;

  constructor(
    private categoryService: CategoryService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.getAllCategories()
  }

  getAllCategories(){
    this.categoryService.getAllCategory().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) =>{
        if(response.length > 0){
          this.categoriesDatas = response
        }
      },
      error: (err) =>{
        console.log(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao buscar categorias',
          life: 3000
        })
        this.router.navigate(['/dashboard']);
      }
    })
  }

  handleDeleteCategoryAction(event: DeleteCategoryAction): void{
    if(event){
      this.confirmationService.confirm({
        message: `Confirma a exclusão da categoria: ${event.categoryName}`,
        header: "Confirma a exclusão",
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sim',
        rejectLabel: 'Não',
        accept: () => this.deleteCategory(event?.category_id)
      })
    }
  }

  deleteCategory(category_id: string): void {
    if (category_id) {
      this.categoryService
        .deleteAllCategory({ category_id })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.getAllCategories();
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Categoria removida com sucesso!',
              life: 3000,
            });
          },
          error: (err) => {
            console.log(err);
            this.getAllCategories();
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao remover categoria!',
              life: 3000,
            });
          },
        });

      this.getAllCategories();
    }
  }

  handleCategoryAction(event: EventAction): void{
    if(event){
      this.ref = this.dialogService.open(CategoryFormComponent, {
        header: event?.action,
        width: '70%',
        contentStyle: { overflow: 'auto' },
        baseZIndex: 10000,
        maximizable: true,
        data: {
          event: event
        }
      });

      this.ref.onClose.pipe(takeUntil(this.destroy$)).subscribe({
        next: () => this.getAllCategories()
      })
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
