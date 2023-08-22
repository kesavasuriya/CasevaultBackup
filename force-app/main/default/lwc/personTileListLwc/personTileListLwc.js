import { LightningElement, track, api } from 'lwc';
import getRecords from '@salesforce/apex/PersonTileViewController.getPersons';
import UNKNOWN_LOGO from '@salesforce/resourceUrl/unknownpersonImg';
import { NavigationMixin } from 'lightning/navigation';
import UtilityBaseElement from 'c/utilityBaseLwc';
import { subscribe, unsubscribe, onError } from 'lightning/empApi';
import { deleteRecord } from 'lightning/uiRecordApi';

export default class PersonTileListLwc extends NavigationMixin(UtilityBaseElement) {

    @track subscription = {};
    @track subscription1 = {};
    contactChannel = '/event/Refresh_Person__e';
    @api recordId;
    @api objectApiName;
    @api personType;
    @api borderSize;
    @api activeColor;
    @api inactiveColor;
    @track personList = [];
    @track addressList = [];
    @track placementList = [];
    @track courtHearingList = [];
    @track programAssignmentList = [];
    @track activePersonList = [];
    @track inActivePersonList = [];
    @track childRemovalList = [];
    @track visibleDataList = [];
    @track legalCustodyRecords = [];
    @track titleIveRecords = [];
    unknownImg = UNKNOWN_LOGO;
    @track isIntake = false;
    @track loading = false;
    @track jnAction;
    @track contactAction;
    @track res;
    @track warningObject = {};

    get showTielView() {
        if (this.visibleDataList.length != null && this.visibleDataList.length) {
            return true;
        } else {
            return false;
        }
    }

    get showDelete() {
        if (this.objectApiName == 'Case') {
            return true;
        } else {
            return false;
        }
    }
    connectedCallback() {


        subscribe(this.contactChannel, -1, this.refreshValue).then(response => {
            this.subscription1 = response;
        });
        onError(error => { });

        if (this.objectApiName == 'Case') {
            this.isIntake = true;
        }
        document.documentElement.style.setProperty('--border', this.borderSize);
        document.documentElement.style.setProperty('--activecolor', this.activeColor);
        document.documentElement.style.setProperty('--inactivecolor', this.inactiveColor);
        this.doInit();
    }

    refreshValue = (res) => {

        this.doInit();

    }

    doInit() {

        this.loading = true;
        this.personList = [];
        this.visibleDataList = [];
        this.activePersonList = [];
        this.inActivePersonList = [];
        getRecords({ recordId: this.recordId, objectApiName: this.objectApiName })
            .then(result => {
                this.personList = JSON.parse(result).personRecords;
                this.placementList = JSON.parse(result).placementRecords;
                this.programAssignmentList = JSON.parse(result).programAssignmentRecords;
                this.childRemovalList = JSON.parse(result).childRemovalRecords;
                this.legalCustodyRecords = JSON.parse(result).legalCustodyRecords;
                this.courtHearingList = JSON.parse(result).courtHearingRecords;
                this.titleIveRecords = JSON.parse(result).titleIVeRecords;
                this.addressList = JSON.parse(result).addressRecords;
                if (this.personList != null) {


                    let placementLst = [];
                    if (this.isIntake == false) {
                        for (let i = 0; i < this.placementList.length; i++) {
                            let placementRec = {};
                            let foundelement = this.personList.find(ele => ele.Person__c == this.placementList[i].Child__c);
                            if (foundelement) {
                                placementRec.placementName = this.placementList[i].Placement_Living_Arrangement_Type__c;
                                if (this.placementList[i].Placement_Living_Arrangement_Type__c == 'Placement') {
                                    placementRec.placementStartDate = this.placementList[i].Begin_Date__c;
                                    placementRec.Placement_Structure__c = this.placementList[i].Placement_Structure__c;
                                    if (foundelement.Provider__c != null && Provider__r.BillingAddress != null) {
                                        placementRec.BillingState = this.placementList[i].Provider__r.BillingState;
                                        placementRec.BillingCity = this.placementList[i].Provider__r.BillingCity;
                                        placementRec.BillingCountry = this.placementList[i].Provider__r.BillingCountry;
                                        placementRec.BillingStreet = this.placementList[i].Provider__r.BillingStreet;
                                        placementRec.BillingPostalCode = this.placementList[i].Provider__r.BillingPostalCode;
                                    }
                                } else {
                                    placementRec.placementStartDate = this.placementList[i].Start_Date__c;
                                    placementRec.Placement_Structure__c = this.placementList[i].Living_Arrangement_Type__c;
                                    placementRec.BillingState = this.placementList[i].State__c;
                                    placementRec.BillingCity = this.placementList[i].City__c;
                                    placementRec.BillingCountry = this.placementList[i].County__c;
                                    placementRec.BillingStreet = this.placementList[i].Address_Line_1__c;
                                    placementRec.BillingPostalCode = this.placementList[i].Zip_Code__c;

                                }
                                placementRec.placementId = this.placementList[i].Id;
                                //placementRec.caregiver = this.placementList[i].Child_Removal__r.Primary_Caregiver__r.Name
                                let index = this.personList.indexOf(foundelement);
                                if (this.personList[index].hasOwnProperty('placemenlist')) {

                                    this.personList[index].placemenlist.push(placementRec);
                                } else {
                                    this.personList[index].placemenlist = [];
                                    this.personList[index].placemenlist.push(placementRec);
                                }



                            }

                        }
                        this.personList = [...this.personList];
                    }

                    for (let i = 0; i < JSON.parse(result).personRecords.length; i++) {
                        if (this.personList[i].Person__r.Address_Line_1__c != null) {
                            this.personList[i].street = this.personList[i].Person__r.Address_Line_1__c;
                        }
                        if (this.personList[i].Person__r.Address_Line_2__c != null) {
                            this.personList[i].street += ' ' + this.personList[i].Person__r.Address_Line_2__c;
                        }
                        if (this.personList[i].Person__r.County__c != null) {
                            this.personList[i].street += ' ' + this.personList[i].Person__r.County__c;
                        }
                        if (this.personList[i].Person__r.Person_Image_URL__c != null) {
                            this.personList[i].showImg = true;
                        } else {
                            this.personList[i].showImg = false;
                        }
                        console.log('addressList===',this.addressList);
                        console.log('person===',this.personList[i].Person__c);
                        let adfoundelement = this.addressList.find(ele => ele.Contact__c == this.personList[i].Person__c);

                        if (this.isIntake == false) {
                            let pafoundelement = this.programAssignmentList.find(ele => ele.Contact__c == this.personList[i].Person__c);
                            let crfoundelement = this.childRemovalList.find(ele => ele.Child__c == this.personList[i].Person__c);
                            let lcfoundelement = this.legalCustodyRecords.find(ele => ele.Child_Name__c == this.personList[i].Person__c);
                            let chfoundelement = this.courtHearingList.find(ele => ele.Court__r.Petition_for_Child__c == this.personList[i].Person__c);
                            let Ivefoundelement = this.titleIveRecords.find(ele => ele.Child_Removal__r.Child__c == this.personList[i].Person__c);
                            if (chfoundelement) {
                                this.personList[i].courtDate = chfoundelement.Hearing_Date_and_Time__c;
                            }

                            if (lcfoundelement) {
                                this.personList[i].legalCustodytDate = lcfoundelement.Begin_Date__c;
                            }

                            if (Ivefoundelement) {
                                this.personList[i].titleIveStatus = Ivefoundelement.Status__c;
                            }
                            if (crfoundelement) {
                                this.personList[i].RemovalDate = crfoundelement.Removal_Date_of_DT_F__c;
                                this.personList[i].caregiver = crfoundelement.Primary_Caregiver__r.Name;
                                if (crfoundelement.Removal_End_Date_Time__c == null) {
                                    this.personList[i].removalbadge = 'slds-badge slds-theme_success';
                                    this.personList[i].removalStatus = 'Open';
                                    this.personList[i].border = 'slds-box activecolor';
                                    this.personList[i].RemovalEndDate = crfoundelement.Removal_End_Date_Time__c;

                                } else {
                                    this.personList[i].removalbadge = 'slds-badge slds-theme_error';
                                    this.personList[i].removalStatus = 'Closed';
                                    this.personList[i].border = 'slds-box inActivecolor';
                                }
                            } else {
                                this.personList[i].border = 'slds-box inActivecolor';
                            }
                            if (pafoundelement) {
                                this.activePersonList.push(this.personList[i]);
                            } else {
                                this.personList[i].border = 'slds-box inActivecolor';
                                this.inActivePersonList.push(this.personList[i]);
                            }
                            pafoundelement = {};
                            crfoundelement = {};
                        }
                        if (this.personList[i].Danger_to_worker__c == 'Yes' || this.personList[i].Danger_to_self__c == 'Yes' || this.personList[i].Current_or_Previous_Mental_Health_issue__c == 'Yes' || (adfoundelement != null && adfoundelement.Known_danger_at_address__c == 'Yes')) {
                            this.personList[i].showWarning = true;
                        }
                        if (adfoundelement != null && adfoundelement.Known_danger_at_address__c == 'Yes') {
                            this.personList[i].addressReason = adfoundelement.Comments__c;
                        }
                        if (this.isIntake == true) {
                            this.personList[i].border = 'slds-box inActivecolor';
                        }
                        if (this.personList[i].Person__r.Date_of_Death__c != null) {
                            this.personList[i].border = 'slds-box death';
                        }

                    }
                    if (this.personType == 'Inactive Persons' && this.isIntake == false) {
                        this.visibleDataList = this.inActivePersonList;
                    } else if (this.personType == 'Active Persons' && this.isIntake == false) {

                        console.log('Active personList', this.activePersonList);

                        this.visibleDataList = this.activePersonList;
                    } else {

                        this.visibleDataList = this.personList;
                    }
                }
                const uniqueSet = new Set(this.visibleDataList.map(JSON.stringify));
                this.visibleDataList = [];
                this.visibleDataList = Array.from(uniqueSet).map(JSON.parse);
                const countEvent = new CustomEvent("count", { detail: this.visibleDataList.length });
                this.dispatchEvent(countEvent);
                this.jnAction = '';
                this.contactAction = '';
                this.loading = false;
            })

    }

    handlePersonNavigate(event) {

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.currentTarget.dataset.id,
                objectApiName: 'Contact',
                actionName: 'view',
            },
            state: {
                parentId: this.recordId,
            }
        });
    }

    handlePersonEditNavigate(event) {

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.currentTarget.dataset.id,
                objectApiName: 'Contact',
                actionName: 'edit',
            },
            state: {
                parentId: this.recordId,
            }
        });
    }


    handleChildRemovalNavigate(event) {

        this[NavigationMixin.Navigate]({
            type: 'standard__recordRelationshipPage',
            attributes: {
                recordId: event.currentTarget.dataset.id,
                objectApiName: 'Child_Removal__c',
                relationshipApiName: 'Child_Removals__r',
                actionName: 'view'
            },
        });
    }

    handleCourtNavigate(event) {

        this[NavigationMixin.Navigate]({
            type: 'standard__recordRelationshipPage',
            attributes: {
                recordId: event.currentTarget.dataset.id,
                objectApiName: 'Court__c',
                relationshipApiName: 'Petitions__r',
                actionName: 'view'
            },
        });
    }

    handlePlacementNavigate(event) {

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.currentTarget.dataset.id,
                objectApiName: 'Placement__c',
                actionName: 'view'
            },
        });
    }

    handleLegalCustodyNavigate(event) {

        this[NavigationMixin.Navigate]({
            type: 'standard__recordRelationshipPage',
            attributes: {
                recordId: event.currentTarget.dataset.id,
                objectApiName: 'Legal_Custody__c',
                relationshipApiName: 'Legal_Custodys__r',
                actionName: 'view'
            },
        });
    }

    handleProgramAreaNavigate(event) {

        this[NavigationMixin.Navigate]({
            type: 'standard__recordRelationshipPage',
            attributes: {
                recordId: event.currentTarget.dataset.id,
                objectApiName: 'Program_Assignment__c',
                relationshipApiName: 'Program_Assignments__r',
                actionName: 'view'
            },
        });
    }

    handleDelete(event) {

        deleteRecord(event.currentTarget.dataset.id)
            .then(() => {
                this.type = 'success';
                this.title = 'Success!';
                this.message = 'Record Deleted Successfully!';
                this.fireToastMsg();
                this.doInit();

            })
            .catch(error => {

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
    handleRoleEdit(event) {

        this.handleRoleNavigation(event.currentTarget.dataset.id);
    }

    handleRoleNavigation(recId) {

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recId,
                objectApiName: 'Person__c',
                actionName: 'edit'
            },
        });
    }

    handleAddress(event) {

        var compDefinition = {
            componentDef: "c:addressLwc",
            attributes: {
                recordId: event.currentTarget.dataset.id,
                parentId: this.recordId,
                parentObjectName: this.objectApiName
            }
        };
        var encodedCompDef = btoa(JSON.stringify(compDefinition));
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + encodedCompDef
            }
        });

    }

    handleWarning(event) {

        this.warningObject = {};
        let index = event.currentTarget.dataset.index;
        let personRecord = {};
        personRecord = this.visibleDataList[index];
        if (personRecord.Danger_to_worker__c == 'Yes') {
            this.warningObject.showWorker = true;
        }
        if (personRecord.Current_or_Previous_Mental_Health_issue__c == 'Yes') {
            this.warningObject.showHealth = true;
        }
        if (personRecord.Danger_to_self__c == 'Yes') {
            this.warningObject.showSelf = true;
        }
        let adfoundelement = this.addressList.find(ele => ele.Contact__c == personRecord.Person__c);
        if (adfoundelement && adfoundelement.Known_danger_at_address__c == 'Yes') {
            this.warningObject.showaddressDanger = true;
        }

    }

}