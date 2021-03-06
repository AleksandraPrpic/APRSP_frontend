import { CompanyService } from "./../../../services/company/company.service";
import { ClientService } from "./../../../services/client/client.service";
import { Component, OnInit, Input, ViewChild, Output } from "@angular/core";
import { Client } from "src/app/models/client";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
import { DialogComponent } from "../../dialog/dialog.component";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { MatSort } from "@angular/material/sort";

@Component({
  selector: "app-client-table",
  templateUrl: "./client_table.component.html",
  styleUrls: ["./client_table.component.css"],
})
export class ClientTableComponent implements OnInit {
  displayedColumns = [
    "clientId",
    "name",
    "client_reg_number",
    "address",
    "contact",
    "email",
    "account_number",
    "edit",
    "delete",
    "receipts",
  ];
  dataSource: MatTableDataSource<Client>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  clients: Client[];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  companyName: String;
  @Output() companyId: number;

  constructor(
    private clientService: ClientService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private companyService: CompanyService
  ) {}

  ngOnInit() {

this.route.params.subscribe((params: Params) => {
  this.companyId = +params["companyid"];
  this.companyService.getCompany(this.companyId).subscribe(c => {
    this.companyName = c.name;
  });
  this.initializeDataSource();

})
  }

  initializeDataSource() {
    console.log(this.companyId);
    this.clientService.getClientByCompany(this.companyId).subscribe(
      (clients) => {
        if (clients) {
          this.clients = clients;

        } else {
          this.clients = [];
        }
        this.dataSource = new MatTableDataSource<Client>(this.clients);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.dataSource.filterPredicate = function(data, filter: string): boolean {
          return data.name.toLowerCase().includes(filter) || data.client_reg_number.toLowerCase().includes(filter);
       };
      },
      (error) => {
        console.log(error);
      }
    );
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  editClient(clientid: number) {
    this.router.navigate([`${clientid}/edit`], { relativeTo: this.route });
  }

  deleteClient(id: number) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: "250px",
      data: { action: 'delete' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("result: " + result);
      if (!result) {
        return;
      }
      this.clientService.deleteClient(id).subscribe(
        (res) => {
          this.initializeDataSource();
        },
        (error) => {}
      );
    });
  }

  addNewClient() {
    this.router.navigate(["newClient"], { relativeTo: this.route });
  }

  backToCompany() {
    this.router.navigate(["../../../"], { relativeTo: this.route });
  }

}
