import { LightningElement, api,track } from 'lwc';
import getPersons from '@salesforce/apex/OutOfHomeChecklistController.getChildRecords';
import getDetails from '@salesforce/apex/OutOfHomeChecklistController.getTableDetails'
import { NavigationMixin } from 'lightning/navigation';
import UtilityBaseElement from 'c/utilityBaseLwc';
import { subscribe, unsubscribe, onError } from 'lightning/empApi';

export default class OutofHomeChecklistLwc extends NavigationMixin(UtilityBaseElement) {

    @api recordId;
    @api objectApiName;
    @track personList = [];
    @track childRemovalRec = {};
    @track assessmentRecord = {};
    @track initialDueDate;
    @track nextDueDate;
    @track initialExam = {};
    @track finalExam = {};
    @track comprehensiveExam = {};
    @track notesRecord = {};
    @track safecohpColor;
    @track initialColor;
    @track cmpColor;
    @track annualColor;
    @track todayDate;
    @track notesColorCode;
    @track personId;
    @track subscription = {};
    channelName = '/event/Refresh_Checklist_Event__e';
    

    connectedCallback() {

        subscribe(this.channelName, -1, this.refreshValue).then(response => {
            this.subscription = response;
        });

        onError(error => { });
        getPersons({recordId : this.recordId})
        .then(result =>{
            let res = JSON.parse(result);
            this.personList = res.personRecords;
            this.todayDate = res.todayDate;
            if(this.personList.length) {
                this.getPersonDetails(this.personList[0].Id);
            }
        });
    }

    refreshValue = (res) => {

        if(this.personId) {

            this.getPersonDetails(this.personId);
        }


    }

    handleReload(event) {

        let childId = event.currentTarget.dataset.id;
        getPersonDetails(childId);
    }

    handleClick(event) {

        let childId = event.target.value;
        this.assessmentRecord = {};
        this.initialDueDate = {};
        this.nextDueDate = {};
        this.initialExam = {};
        this.finalExam = {};
        this.comprehensiveExam = {};
        this.notesRecord = {};
        this.getPersonDetails(childId);
    }

    getPersonDetails(childId) {
        
        this.personId = childId;
        getDetails({recordId : this.recordId,personId:childId})
        .then(result =>{
            let res = JSON.parse(result);
                
                this.initialDueDate = res.initialDueDate;
                this.nextDueDate = res.nextDueDate;

                //notes
                if(res.notesRecord) {
                    this.notesRecord = res.notesRecord;
                    this.notesRecord.ownerName = this.notesRecord.Notes__r.CreatedBy.Name;
                    this.notesRecord.Contact_Date__c = this.notesRecord.Notes__r.Contact_Date__c;

                    this.notesRecord.nextDueDate = res.lastDayOfMonth;
                }
                if(res.notesRecord) {
                    this.notesColorCode = 'Green';
                } else if(this.initialDueDate > this.todayDate && !res.notesRecord){
                    this.notesColorCode = 'Yellow';
                } else {
                    this.notesColorCode = 'Red';
                }
                //safe-C-OHP assessment
                if(res.assessmentRecord) {
                    this.assessmentRecord.Id = res.assessmentRecord.Id;
                    this.assessmentRecord.Workers_Name__c = res.assessmentRecord.Assessment__r.Workers_Name__c;
                    this.assessmentRecord.Submitted_Date__c = res.assessmentRecord.Assessment__r.Submitted_Date__c;
                    this.assessmentRecord.Safety_Assessment_Approval_Date_Time__c = res.assessmentRecord.Assessment__r.Safety_Assessment_Approval_Date_Time__c;
                    if(res.assessmentRecord.Assessment__r.Supervisor_Approver__c) {
                        this.assessmentRecord.approverName = res.assessmentRecord.Assessment__r.Supervisor_Approver__r.Name;
                    }
                    
                }
                console.log('ass',this.assessmentRecord);
                if(this.assessmentRecord != null && this.assessmentRecord.approverName != null) {
                    this.safecohpColor = 'Green';
                } else if(this.initialDueDate > this.todayDate){
                    this.safecohpColor = 'Yellow';
                } else {
                    this.safecohpColor = 'Red';
                }


                //initialexam
                if(res.initialExamRecord) {
                    this.initialExam = res.initialExamRecord;
                    this.initialExam.ownerName = this.initialExam.CreatedBy.Name;
                    this.initialColor = 'Green';
                } else if(this.initialDueDate > this.todayDate) {
                    this.initialColor = 'Yellow';
                } else {
                    this.initialColor = 'Red';
                }


                //comprehensiveExam
                if(res.comprehensiveExamRecord) {
                    this.comprehensiveExam = res.comprehensiveExamRecord;
                    this.comprehensiveExam.ownerName = this.comprehensiveExam.CreatedBy.Name;
                    this.cmpColor = 'Green';
                } else if(this.initialDueDate > this.todayDate) {
                    this.cmpColor = 'Yellow';
                } else {
                    this.cmpColor = 'Red';
                }


                //annualexam
                if(res.annualExamRecord) {
                    this.finalExam = res.annualExamRecord;
                    this.finalExam.ownerName = this.finalExam.CreatedBy.Name;
                    this.annualColor = 'Green';
                } else if(this.initialDueDate > this.todayDate) {
                    this.annualColor = 'Yellow';
                } else {
                    this.annualColor = 'Red';
                }

        })

    }

    handleExamClick(event) {

        this[NavigationMixin.Navigate]({
            type: 'standard__recordRelationshipPage',
            attributes: {
                recordId: this.personId,
                objectApiName: 'Examination__c',
                relationshipApiName: 'Examination__r',
                actionName: 'view'
            },
        });
    }

    handleServicePlanNavigation() {

        this[NavigationMixin.Navigate]({
            type: 'standard__recordRelationshipPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: 'Service_Plan__c',
                relationshipApiName: 'Service_Plans__r',
                actionName: 'view',
            },
        });
    }

    handleNavigation(event) {
            let cmpDef = {
                componentDef: event.currentTarget.dataset.name,
                attributes: {
                    recordId: this.recordId,
                    objectApiName: this.objectApiName,
                }
              };
          
              let encodedDef = btoa(JSON.stringify(cmpDef));
              this[NavigationMixin.Navigate]({
                type: "standard__webPage",
                attributes: {
                  url: "/one/one.app#" + encodedDef,
                }
              });
    }


}