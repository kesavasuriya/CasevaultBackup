import { LightningElement,api,track } from 'lwc';
import getInitiInfo from '@salesforce/apex/AssessmentController.getSAFECOHPInitialInformation';
import UtilityBaseElement from 'c/utilityBaseLwc';
import { NavigationMixin } from 'lightning/navigation';

const columns = [
    { label: 'Assessment Name', type:  'button',typeAttributes: { 
        variant :'base', name : 'name',
                 label:   { 
            fieldName: 'Name' 
        } }},
    { label: 'Safety Assessment Completion Date Time', fieldName: 'OHP_Signature_Obtained_Date__c', type: 'date',typeAttributes:{day:"numeric",month:"numeric",year:"numeric",hour:"numeric",minute:"numeric",hour12:"true"} },
    { label: 'Approval Status', fieldName: 'Approval_Status__c', type: 'text', wrapText: true}
    
];

export default class SafecOHPRelatedListLwc extends NavigationMixin(UtilityBaseElement) {

    @api recordId;
    @api objectApiName;
    columns = columns;
    @track visibleData = [];
    showChild = false;
    assessmentOHPList = [];
    @track safecOHPRec = {};
    showOHPTable = false;
    showCmp = false;


    get safecohptitle() {
        if(this.assessmentOHPList) {
            return 'SAFE-C-OHP ('+this.assessmentOHPList.length+')';
        } else {
            return 'SAFE-C-OHP';
        }
    }

    connectedCallback() {

        let typeValue = 'SAFE-C-OHP';
        this.safecOHPRec['Assessment_Type__c'] = typeValue;
        this.doInitInfo();
    }

    doInitInfo() {

       
        this.safecOHPRec[this.objectApiName] = this.recordId;
        this.safecOHPRec['Type_c'] = 'SAFE-C-OHP';
        this.showChild = false;

        getInitiInfo({ recordId: this.recordId })
            .then(result => {
                this.assessmentOHPList = this.checkNamespaceApplicable(JSON.parse(result).assessmentOHPList, false);
                this.childList = JSON.parse(result).childInputWarpList;
                if (this.assessmentOHPList.length) {
                    this.showOHPTable = true;
                    this.showChild = true;
                }
            })
    }

    showNew() {

        this.safecOHPRec = {};
        this.showCmp = true;
    }

    paginationHandler(event) {

        this.visibleData = [...event.detail.records];     
    }

    handleRowAction(event) {

        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'name':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        objectApiName: 'Assessment__c',
                        actionName: 'view'
                    },
                });
            
        }

    }

    closeModal() {
        this.showCmp = false;
    }

    closeEventModal() {

        this.showCmp = false;
        this.doInitInfo();

    }


}