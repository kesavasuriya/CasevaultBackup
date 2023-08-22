import { LightningElement,track,api } from 'lwc';
import getInitiInfo from '@salesforce/apex/AssessmentController.getSAFECInitialInformation';
import UtilityBaseElement from 'c/utilityBaseLwc';
import { NavigationMixin } from 'lightning/navigation';

const columnlist = [
    { label: 'Assessment Name', type:  'button',typeAttributes: { 
        variant :'base', name : 'name',role : 'button',
                 label:   { 
            fieldName: 'name' 
        } }},
    { label: 'Safety Assessment Completion Date Time', fieldName: 'completionDate', type: 'string',wrapText: true },
    { label: 'Approval Status', fieldName: 'approvalStatus', type: 'string', wrapText: true}
    
];

export default class SafecRelatedListLwc extends NavigationMixin(UtilityBaseElement){

    @api recordId;
    @api objectApiName;
    columnlist = columnlist;
    @track visibleData = [];
    assessmentList = [];
    showChild = false;
    ShowAssessmentTable = false;
    showCmp = false;
    @track childList = [];
    isLoading = false;

    get safectitle() {
        if(this.assessmentList) {
            return 'SAFE-C ('+this.assessmentList.length+')';
        } else {
            return 'SAFE-C';
        }
    }


    connectedCallback() {
        
        this.isLoading = true;
        this.doInitInfo();
    }

    doInitInfo() {

        this.showChild = false;
        getInitiInfo({ recordId: this.recordId })

        .then(result => {
            let res = JSON.parse(result);
            this.assessmentList = this.checkNamespaceApplicable(res.assessmentList, false);
            this.childList = res.childInputWarpList;
            this.assessmentListLength = this.assessmentList.length;

            if (this.assessmentListLength) {
                this.ShowAssessmentTable = true;
            } 
            this.showChild = true;
            this.isLoading = false;
        }).catch(error => {

            this.isLoading = false;
            let errorMsg;
            this.title = "Error!";
            this.type = "error";
            if (error) {
                let errors = this.reduceErrors(error);
                errorMsg = errors.join('; ');
            } else {
                errorMsg = 'Unknown Error';
            }
            this.loading = false;
            this.message = errorMsg;
            this.fireToastMsg();
        })
    }

    showNew() {

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
                        recordId: row.id,
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