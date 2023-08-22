import { LightningElement, api, track } from 'lwc';
import getPicklist from '@salesforce/apex/AssessmentController.getFamilyInitialRiskAssessmentStagePicklist';
import UtilityBaseElement from 'c/utilityBaseLwc';


export default class FamilyInitialRiskAssessmentDetailLwc extends UtilityBaseElement {

    @api recordId;
    @api objectApiName;
    showfamilyandHouseholdCompositionLwc = false;
    showNeglectAbuseIndex = false;
    showScoringOverrides = false;
    showSupplementalQuestion = false;
    showApproval = false;
    showActionCmp = false;
    assessmentId;
    tableAction = '';
    showActionStage = false;
    @track assessmentRec = {};
    @track currentStage = '1';
    @track stageList =[];
    currentOnStageValue = '';
    readOnly = false;
    currentActionStage = 'Action Taken';
    @track actionStageList = [{label : 'Action Taken', value: 'Action Taken'},{label:'Approval', value:'Approval'}];

    connectedCallback() {

        this.doInit();
    }

    doInit() {

        getPicklist({ objectName : this.objectApiName, recordId : this.recordId })
        .then(result =>{

            let res = JSON.parse(result);
            this.stageList = res.stages.splice(1);
            if(this.objectApiName != 'Assessment__c') {
                this.assessmentId = '';
                this.tableAction = 'new';
            } else {
                if(res.assessmentRec) {
                    this.assessmentRec = res.assessmentRec;
                }
            }
            this.initializeValues();
            this.loading = false;
            
        }).catch(error => {

            this.loading = false;
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
        })
        
    }
        

    initializeValues() {

        this.showfamilyandHouseholdCompositionLwc = false;
        this.showNeglectAbuseIndex = false;
        this.showScoringOverrides = false;
        this.showSupplementalQuestion = false;
        this.showApproval = false;
        this.showActionCmp = false;
        if(this.assessmentRec.Id) {
            this.assessmentId = this.assessmentRec.Id;
        }
        console.log('assessmentId===',this.assessmentId);
        this.currentStage = this.assessmentRec.FamilyInitialRiskAssessmentStage__c;
        if(this.assessmentRec.Department_is_unable_to_locate_child__c) {
            this.showActionStage = this.assessmentRec.Department_is_unable_to_locate_child__c;     
        }
        if(this.currentStage == null) {
            this.currentStage = '1';
        }
        if(this.showActionStage != true) {

            if(this.currentStage == '1') {
                this.showfamilyandHouseholdCompositionLwc = true;
            } else if(this.currentStage == '2') {
                this.showNeglectAbuseIndex = true;
            } else if(this.currentStage == '3') {
                this.showScoringOverrides = true;
            } else if(this.currentStage == '4') {
                this.showSupplementalQuestion = true;
            } else if(this.currentStage == '5') {
                this.showApproval = true;
            }
        } else if(this.showActionStage == true) {

            if(this.assessmentRec.Actions_Taken__c != null) {
                this.currentActionStage = 'Approval';
                this.showApproval = true;
            } else {
                this.currentActionStage = 'Action Taken';
                this.showActionCmp = true;
            }
        }
        
    }

    handleStage(event) {

        this.assessmentId = event.detail.assRecId;
        if(event.detail.stage != 'action') {
            this.currentOnStageValue = event.detail.stage;
            this.currentStage = this.currentOnStageValue;
            this.setStage();
        } else {
            this.currentActionStage = 'Approval';
            this.showActionCmp = false;
            this.showApproval = true;
        }
        if(event.detail.stage == '2' && this.assessmentId) {
            //this.handleDoInit();
            const stageEvent = new CustomEvent('save',{detail : 'new'});
            this.dispatchEvent(stageEvent);
        }
        
    }


    stageAction(event) {

        this.currentOnStageValue = event.target.value;
        this.setStage();
       
    }

    setStage() {

        if(this.currentOnStageValue == '1') {

            this.showfamilyandHouseholdCompositionLwc = true;
            this.showNeglectAbuseIndex = false;
            this.showScoringOverrides = false;
            this.showSupplementalQuestion = false;
            this.showApproval = false;
            this.showActionCmp = false;

        } else if(this.currentOnStageValue == '2') {

            if(this.currentStage >= this.currentOnStageValue) {

                this.showfamilyandHouseholdCompositionLwc = false;
                this.showNeglectAbuseIndex = true;
                this.showScoringOverrides = false;
                this.showSupplementalQuestion = false;
                this.showApproval = false;
                this.showActionCmp = false;

            } else {
                this.title = "Error!";
                this.type = "error";
                this.message = 'Save the Family and Household Composition';
                this.fireToastMsg();
            }

        } else if(this.currentOnStageValue == '3') {

            if(this.currentStage >= this.currentOnStageValue) {

                this.showfamilyandHouseholdCompositionLwc = false;
                this.showNeglectAbuseIndex = false;
                this.showScoringOverrides = true;
                this.showSupplementalQuestion = false;
                this.showApproval = false;
                this.showActionCmp = false;

            } else {
                this.title = "Error!";
                this.type = "error";
                this.message = 'Save the Neglect/Abuse Index';
                this.fireToastMsg();
            }


        } else if(this.currentOnStageValue == '4') {

            if(this.currentStage >= this.currentOnStageValue) {

                this.showfamilyandHouseholdCompositionLwc = false;
                this.showNeglectAbuseIndex = false;
                this.showScoringOverrides = false;
                this.showSupplementalQuestion = true;
                this.showApproval = false;
                this.showActionCmp = false;

            } else {
                this.title = "Error!";
                this.type = "error";
                this.message = 'Save the Scoring and Overrides';
                this.fireToastMsg();
            }

        } else if(this.currentOnStageValue == '5') {

            if(this.currentStage >= this.currentOnStageValue) {

                this.showfamilyandHouseholdCompositionLwc = false;
                this.showNeglectAbuseIndex = false;
                this.showScoringOverrides = false;
                this.showSupplementalQuestion = false;
                this.showApproval = true;
                this.showActionCmp = false;

            } else {
                this.title = "Error!";
                this.type = "error";
                this.message = 'Save the Supplemental Question';
                this.fireToastMsg();
            }
    
        } else if(this.currentOnStageValue == 'Action Taken') {

            this.showfamilyandHouseholdCompositionLwc = false;
            this.showNeglectAbuseIndex = false;
            this.showScoringOverrides = false;
            this.showSupplementalQuestion = false;
            this.showApproval = false;
            this.showActionCmp = true;

        } else if(this.currentOnStageValue == 'Approval') {

            if(this.assessmentRec.Actions_Taken__c != null) {
                this.showfamilyandHouseholdCompositionLwc = false;
                this.showNeglectAbuseIndex = false;
                this.showScoringOverrides = false;
                this.showSupplementalQuestion = false;
                this.showApproval = true;
                this.showActionCmp = false;
            } else {
                this.title = "Error!";
                this.type = "error";
                this.message = 'Save the Action Taken ';
                this.fireToastMsg();
            }
            
        }

    }

    handleChange(event) {

        this.showfamilyandHouseholdCompositionLwc = false;
        this.showNeglectAbuseIndex = false;
        this.showScoringOverrides = false;
        this.showSupplementalQuestion = false;
        this.showApproval = false;
        this.showActionCmp = false;

        this.showActionStage = event.target.checked;
        

        if(this.showActionStage == true) {

            if(this.assessmentRec.Actions_Taken__c != null) {
                this.currentActionStage = 'Approval';
                this.showApproval = true;
            } else {
                this.currentActionStage = 'Action Taken';
                this.showActionCmp = true;
            }
        } else if(this.showActionStage != true) {

            if(this.currentStage == '1') {
                this.showfamilyandHouseholdCompositionLwc = true;
            } else if(this.currentStage == '2') {
                this.showNeglectAbuseIndex = true;
            } else if(this.currentStage == '3') {
                this.showScoringOverrides = true;
            } else if(this.currentStage == '4') {
                this.showSupplementalQuestion = true;
            } else if(this.currentStage == '5') {
                this.showApproval = true;
            }
        }
        
    }

    handleDoInit(event) {
        
        console.log('Detail Event===');
        const stageEvent = new CustomEvent('save',{detail : event.detail});
        this.dispatchEvent(stageEvent);
    }
}