import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { getAllProductsResponse } from 'src/app/models/interfaces/products/response/getAllProductsResponse';
import { ProductsService } from 'src/app/services/products/products.service';
import { ProductsDataTransferService } from 'src/app/shared/service/products/products-data-transfer.service';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: [],
})

export class DashboardHomeComponent implements OnInit, OnDestroy {
  public productsList: Array<getAllProductsResponse> = [];
  public destroy$ = new Subject<void>();

  public productsChatData!: ChartData;
  public productsChatOptions!: ChartOptions;

  constructor(
    private productsService: ProductsService,
    private messageService: MessageService,
    private productsDtService: ProductsDataTransferService
  ) { }

  ngOnInit(): void {
    this.getProductsDatas()
  }

  getProductsDatas(): void {
    this.productsService.getAllProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.productsList = response
            this.productsDtService.setProductsData(this.productsList);
            this.setProductsChartConfig();
          }
        },
        error: (err) => {
          console.log(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao buscar produtos!',
            life: 3000,
          });
        },
      });
  }

  setProductsChartConfig(): void {
    if (this.productsList.length > 0) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color');
      const textColorSEcondary = documentStyle.getPropertyValue('--text-color-secondary');
      const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

      this.productsChatData = {
        labels: this.productsList.map((element) => element?.name),
        datasets: [
          {
            label: 'Quantidade',
            backgroundColor: documentStyle.getPropertyValue('--indigo-400'),
            borderColor: documentStyle.getPropertyValue('--indigo-400'),
            hoverBackgroundColor: documentStyle.getPropertyValue('--indigo-600'),
            data: this.productsList.map((elements) => elements?.amount)
          },
        ],
      };

      this.productsChatOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColorSEcondary,
              font: {
                weight: 500,
              },
            },
            grid: {
              color: surfaceBorder
            }
          },

          y: {
            ticks: {
              color: textColorSEcondary,
            },
            grid: {
              color: surfaceBorder
            }
          },
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
