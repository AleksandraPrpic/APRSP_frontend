import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { DialogComponent } from "../../dialog/dialog.component";
import { Payment } from "src/app/models/payment";
import { PaymentService } from "src/app/services/payment/payment.service";

@Component({
  selector: "app-payment-table",
  templateUrl: "./payment-table.component.html",
  styleUrls: ["./payment-table.component.css"],
})
export class PaymentTableComponent implements OnInit {
  displayedColumns = ["paymentId", "amount", "date_of_issue", "delete", "edit"];
  dataSource: MatTableDataSource<Payment>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  receiptId: number;
  companyId: number;
  clientId: number;

  private payments: Payment[];

  constructor(
    private paymentService: PaymentService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.parent.params.subscribe((params: Params) => {
      this.receiptId = +params["receiptid"];
      this.companyId = +params["companyid"];
      this.clientId = +params["clientid"];
      this.initializeDataSource();
    });
  }

  initializeDataSource() {
    console.log(this.receiptId);
    this.paymentService.getPaymentByReceipt(this.receiptId).subscribe(
      (payments) => {
        if (payments) {
          this.payments = payments;

        } else {
          this.payments = [];
        }

        this.dataSource = new MatTableDataSource<Payment>(this.payments);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

      },
      (error) => {}
    );
  }

  deletePayment(id: number) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: "250px",
      data: { action: 'delete' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("result: " + result);
      if (!result) {
        return;
      }
      this.paymentService.deletePayment(id).subscribe(
        (res) => {
          this.initializeDataSource();
        },
        (error) => {}
      );
    });
  }

  addNewPayment() {
    this.router.navigate(["newPayment"], { relativeTo: this.route });
  }

  editPayment(paymentid: number) {
    this.router.navigate([`${paymentid}/edit`], { relativeTo: this.route });
  }

  getTotalCost() {
    if (this.payments) {
      return this.payments
        .map((p) => p.amount)
        .reduce((acc, value) => acc + value, 0);
    }
  }

  backToReceipts() {
    this.router.navigate(["company/" + this.companyId + "/client/" + this.clientId + "/receipts"]);
  }

}
