import { LightningElement, api, track } from 'lwc';
import getPersons from '@salesforce/apex/InHomeChecklistController.getChildRecords';
import { NavigationMixin } from 'lightning/navigation';
import UtilityBaseElement from 'c/utilityBaseLwc';
import { subscribe, unsubscribe, onError } from 'lightning/empApi';

export default class InHomeChecklistLwc extends NavigationMixin(UtilityBaseElement) {

    @api recordId;
    @track safecRecord = {};
    @track riskAssessmentRecord = {};
    @track initialDate;
    @track riskAssessment = {};
    @track riskAssessmentInitialDueDate;
    @track safecNextDueDate;
    @track notesColorCode;
    @track safecColorCode;
    @track riskColorCode;
    @track notesOwner;
    @track contactDate
    @track notesRecord = {};
    @api objectApiName;
    @track subscription = {};
    channelName = '/event/Refresh_Checklist_Event__e';
   
    connectedCallback() {

        this.doInit();
        subscribe(this.channelName, -1, this.refreshValue).then(response => {
            this.subscription = response;
        });
    }

    refreshValue = (res) => {

        this.doInit();

    }

    doInit() {
        getPersons({ recordId: this.recordId, objectApiName : this.objectApiName })
            .then(result => {
                let res = JSON.parse(result);
                this.initialDate = res.initialDate;
                let d = new Date(this.initialDate);
                this.notesOwner = res.workerName;
                this.contactDate = res.completedDate;
                this.notesRecord = res.notesRecord;
                this.riskAssessmentInitialDueDate = res.riskAssessmentInitialDueDate;
                this.safecNextDueDate = d.setDate(d.getDate() + 180);
                console.log('res', res);
                //check notes for completed days
                if (res.workerName) {
                    this.notesColorCode = 'Green';
                } else if (this.initialDate > res.todayDate && this.notesOwner == null) {
                    this.notesColorCode = 'Yellow';
                } else {
                    this.notesColorCode = 'Red';
                }

                //for SAFE-C
                this.safecRecord.CreatedDate = res.safecAssessmentRecord.CreatedDate;
                this.safecRecord.Id = res.safecAssessmentRecord.Id;
                if (res.safecAssessmentRecord.Workers_Name__c) {
                    this.safecRecord.Workers_Name__c = res.safecAssessmentRecord.Workers_Name__c;
                }

                if (res.safecAssessmentRecord.Supervisor_Approver__c) {
                    this.safecRecord.approverName = res.safecAssessmentRecord.Supervisor_Approver__r.Name;
                }
                this.safecRecord.approvalDate = res.safecAssessmentRecord.Safety_Assessment_Approval_Date_Time__c;
                this.safecRecord.Submitted_Date__c = res.safecAssessmentRecord.Submitted_Date__c;

                if (this.safecRecord != null && this.safecRecord.approverName != null) {
                    this.safecColorCode = 'Green';
                } else if (this.initialDate > res.todayDate && this.safecRecord.approverName == null) {
                    this.safecColorCode = 'Yellow';
                } else {
                    this.safecColorCode = 'Red';
                }

                //for risk assessment
                if(res.riskAssessmentRecord !=null) {
                    this.riskAssessmentRecord.CreatedDate = res.riskAssessmentRecord.CreatedDate;
                    this.riskAssessmentRecord.Id = res.riskAssessmentRecord.Id;

                if (res.riskAssessmentRecord.Workers_Name__c) {
                    this.riskAssessmentRecord.Workers_Name__c = res.riskAssessmentRecord.Workers_Name__c;

                }


                if (res.riskAssessmentRecord.Supervisor_Approver__c) {
                    this.riskAssessmentRecord.approverName = res.riskAssessmentRecord.Supervisor_Approver__r.Name;
                }
                this.riskAssessmentRecord.approvalDate = res.riskAssessmentRecord.Safety_Assessment_Approval_Date_Time__c;
                this.riskAssessmentRecord.Submitted_Date__c = res.riskAssessmentRecord.Submitted_Date__c;
                }
                if (this.riskAssessmentRecord != null && this.riskAssessmentRecord.approverName != null) {
                    this.riskColorCode = 'Green';
                } else if (this.riskAssessmentInitialDueDate > res.todayDate) {
                    this.riskColorCode = 'Yellow';
                } else {
                    this.riskColorCode = 'Red';
                }
            })

    }
    
   

    handleNavigate(event) {

        let tabName = event.currentTarget.dataset.name;
            let cmpDef = {
                componentDef: tabName,
                attributes: {
                    recordId: this.recordId,
                    objectApiName: this.objectApiName,
                }
              };
          
              let encodedDef = btoa(JSON.stringify(cmpDef));
              this[NavigationMixin.Navigate]({
                type: "standard__webPage",
                attributes: {
                  url: "/one/one.app#" + encodedDef
                }
              });

    }
}