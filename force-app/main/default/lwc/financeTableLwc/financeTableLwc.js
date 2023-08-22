import { LightningElement, track } from 'lwc';
import getProvider from '@salesforce/apex/FinanceController.getAllProviders';
import getProvidersPayments from '@salesforce/apex/FinanceController.getProvidersPayments';
import getPayments from '@salesforce/apex/FinanceController.getPayments';
import TIME_ZONE from '@salesforce/i18n/timeZone';

import UtilityBaseElement from 'c/utilityBaseLwc';

const providerColumns = [
    { label: 'Provider Name', type: 'button', fieldName: 'Name' ,   typeAttributes: { label: { fieldName: 'Name' }, name: 'edit', variant: 'base' }, sortable : true },
    { label: 'Provider Type', fieldName: 'Type__c',  type: 'string', sortable : true  },
    { label: 'Provider Id', fieldName: 'Casevault_ProID__c',  type: 'string', sortable : true  }
];

const providerPaymentColumns = [
    { label: 'Payment Id', type: 'button',  typeAttributes: { label: { fieldName: 'Name' }, name: 'edit', variant: 'base' } },
    { label: 'Provider Name', fieldName: 'Provider_Name__c',  type: 'string' },
    { label: 'Start Date', fieldName: 'Start_Date__c', type: 'date',  typeAttributes: { day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" } },
    { label: 'End Date', fieldName: 'End_Date__c', type: 'date',  typeAttributes: { day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" } },
    { label: 'Payment Amount', fieldName: 'Payment_Amount__c',  type:'number',typeAttributes: { formatStyle:"decimal",minimumFractionDigits:"2"}, sortable: true },
    { label: 'CreatedDateTime', fieldName: 'CreatedDate', type: 'date',  typeAttributes: {
            day: "numeric",
            month: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: "true", timeZone: TIME_ZONE
        }},   
    { label: 'Provider Type', fieldName: 'Provider_Type__c',  type: 'string' },
];

const paymentColumns = [
    { label: 'Casevault PID', fieldName: 'Casevault_PID__c', type: 'string' },
    { label: 'Child', fieldName: 'Child__c',  type: 'string' },
    { label: 'Start Date', fieldName: 'Start_Date__c', type: 'date', typeAttributes: { day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" } },
    { label: 'End Date', fieldName: 'End_Date__c', type: 'date',  typeAttributes: { day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" } },
    { label: 'Days of Service', fieldName: 'Days_of_Service__c',  type: 'number' },
    { label: 'Per Diem Rate', fieldName: 'Per_Diem_Rate__c',  type:'number',typeAttributes: { formatStyle:"decimal",minimumFractionDigits:"2"}, sortable: true },
    { label: 'Payment Amount', fieldName: 'Payment_Amount__c',  type:'number',typeAttributes: { formatStyle:"decimal",minimumFractionDigits:"2"}, sortable: true },
    { label: 'Service Type', fieldName: 'Service_Type__c',  type: 'string' },
    { label: 'CreatedDateTime', fieldName: 'Generated_DateTime__c', type: 'date',  typeAttributes: {
            day: "numeric",
            month: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: "true", timeZone: TIME_ZONE
        }},
    { label: 'Payment Date', fieldName: 'Payment_Date__c', type: 'date',  typeAttributes: { day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" } },
];

const providerReceivableColumns = [
    { label: 'Receivable Id', type: 'button',  typeAttributes: { label: { fieldName: 'Name' }, name: 'edit', variant: 'base' } },
    { label: 'Provider Name', fieldName: 'Provider_Name__c',  type: 'string' },
    { label: 'Start Date', fieldName: 'Start_Date__c', type: 'date',  typeAttributes: { day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" } },
    { label: 'End Date', fieldName: 'End_Date__c', type: 'date',  typeAttributes: { day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" } },
    { label: 'Receivable Amount', fieldName: 'Payment_Amount__c	',  type: 'string' },
    { label: 'CreatedDateTime', fieldName: 'CreatedDate', type: 'date',  typeAttributes: {
            day: "numeric",
            month: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: "true", timeZone: TIME_ZONE
        }},   
    { label: 'Provider Type', fieldName: 'Provider_Type__c',  type: 'string' },
];

const receivablePaymentColumns = [
    { label: 'Casevault PID', fieldName: 'Casevault_PID__c', type: 'string' },
    { label: 'Child', fieldName: 'Child__c',  type: 'string' },
    { label: 'Start Date', fieldName: 'Start_Date__c', type: 'date', typeAttributes: { day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" } },
    { label: 'End Date', fieldName: 'End_Date__c', type: 'date',  typeAttributes: { day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" } },    { label: 'Per Diem Rate', fieldName: 'Per_Diem_Rate__c',  type: 'string' },
    { label: 'Receivable Amount', fieldName: 'Payment_Amount__c',  type: 'string' },
    { label: 'Service Type', fieldName: 'Service_Type__c',  type: 'string' },
    { label: 'CreatedDateTime', fieldName: 'Generated_DateTime__c', type: 'date',  typeAttributes: {
            day: "numeric",
            month: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: "true", timeZone: TIME_ZONE
        }},
    { label: 'Payment Date', fieldName: 'Payment_Date__c', type: 'date',  typeAttributes: { day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" } },
];

export default class FinanceTableLwc extends UtilityBaseElement {

    providerColumns = providerColumns;
    providerPaymentColumns = providerPaymentColumns;
    paymentColumns = paymentColumns;
    providerReceivableColumns = providerReceivableColumns;
    receivablePaymentColumns = receivablePaymentColumns;
    @track providers = [];
    @track providerPayments = [];
    @track receivablePayments = [];
    @track paymentRecords = [];
    @track receivableRecords = [];
    @track showPayment = false;
    @track loading = false;
    @track visibleProviders = [];
    showPage1 = false;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;


    connectedCallback() {
        this.loading = true;
        getProvider({})
            .then(result => {
                this.providers = JSON.parse(result);
                this.loading = false;
                this.showPage1 = true;
            })
    }

    handleProviderRowAction(event) {
        this.loading = true;
        const row = event.detail.row;
        getProvidersPayments({ providerId: row.Id })
            .then(result => {
                let res = JSON.parse(result);
                for(let i=0; i<res.length;i++) {
                    if(res[i].Type__c == 'Payment Summary') {
                        this.providerPayments.push(res[i]);
                    } else if(res[i].Type__c == 'Receivable Summary') {
                        this.receivablePayments.push(res[i]);
                    }
                }
                
                this.showPayment = true;
                this.loading = false;
            })

    }

    handleProviderPaymentRowAction(event) {
        this.loading = true;
        const row = event.detail.row;
        getPayments({ providerId: row.Provider__c, startDate: row.Start_Date__c, endDate: row.End_Date__c })
            .then(result => {
                let res = JSON.parse(result);
                let paymentrecords = [];
                let receivablerecords = [];
                for(let i=0; i<res.length;i++) {
                    if(res[i].Type__c == 'Payment Summary') {
                        paymentrecords.push(res[i]);
                    } else if(res[i].Type__c == 'Receivable Summary') {
                        receivablerecords.push(res[i]);
                    }
                }
                 
                this.paymentRecords = paymentrecords;
                this.receivableRecords = receivablerecords;
                this.loading = false;
            })
    }

    goBack() {
        this.showPayment = false;
        this.providerPayments = [];
        this.paymentRecords = [];

    }

    providerPaginationHandler(event) {
        this.visibleProviders = [...event.detail.records];     

    }

    sortBy(field, reverse, primer) {

        const key = primer
            ? function (x) {
                  return primer(x[field]);
              }
            : function (x) {
                  return x[field];
              };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };

    }

    onHandleSort(event) {

        console.log('detail====',event.detail);
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.providers];
        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.providers = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
        this.template.querySelector('c-pagination-l-w-c').refreshCmp(this.providers);
    }

}