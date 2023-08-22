import { LightningElement, api, track } from 'lwc';
import UtilityBaseElement from 'c/utilityBaseLwc';
import getCollaterals from '@salesforce/apex/CollateralController.getCollaterals';
import { NavigationMixin } from 'lightning/navigation';

const collateralColumn = [

    {
        label: 'Name', type: 'button', typeAttributes: {
            variant: 'base', name: 'name',
            label: {
                fieldName: 'Name'
            }
        }
    },
    { label: 'First Name', fieldName: 'First_Name__c', wrapText: true },
    { label: 'Middle Name', fieldName: 'Middle_Name__c', wrapText: true },
    { label: 'Last Name', fieldName: 'Last_Name__c', wrapText: true },

];

export default class CollateralLwc extends NavigationMixin(UtilityBaseElement) {

    @api recordId;
    @api objectApiName;
    @track collateralRecords = [];
    collateralColumn = collateralColumn;
    @track showModal = false;

    connectedCallback() {
       this.doInit();
    }

    doInit() {
        getCollaterals({ recordId: this.recordId })
        .then(result => {
            if (result) {
                this.collateralRecords = JSON.parse(result);
            }
        }).catch(error => {
            this.handleError(error);
        })
    }
    handleError(error) {

        let errorMsg;
        this.title = "Error!";
        this.type = "error";
        if (error) {
            let errors = this.reduceErrors(error);
            errorMsg = errors.join('; ');
        } else {
            errorMsg = 'Unknown Error';
        }
        this.message = errorMsg;
        this.fireToastMsg();
    }

    handleRowAction(event) {

        var rowId = event.detail.row.Id;
        this.navigateClick(rowId);
    }

    navigateClick(recordId) {

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'view'
            }
        });
    }

    handleNew() {
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    closeEventModal() {
        this.showModal = false;
        this.doInit();
    }
}