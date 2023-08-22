import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import UtilityBaseElement from 'c/utilityBaseLwc';
import getRecords from '@salesforce/apex/AFCARSController.getPersons';
import { subscribe, unsubscribe, onError } from 'lightning/empApi';

export default class AfcarsLwc extends NavigationMixin(UtilityBaseElement) {

    @api recordId;
    @track personList = [];
    @track subscription = {};
    contactChannel = '/event/Refresh_Person__e';
    isLoading = false;

    get showRecords() {
        
        if(this.personList.length) {
            return true;
        } else {
            return false;
        }

    }


    connectedCallback() {

        subscribe(this.contactChannel, -1, this.refreshValue).then(response => {
            this.subscription = response;
        });
        this.doInit();
    }

    refreshValue = (res) => {

        this.doInit();

    }

    doInit() {
        this.isLoading = true;
        getRecords({ recordId: this.recordId })
            .then(result => {
                let res = JSON.parse(result);
                this.personList = res;
                let expression;
                for (let i = 0; i < this.personList.length; i++) {
                    expression = '';
                    const url = '/lightning/r/Contact/' + this.personList[i].Person__c + '/view';
                    if (!this.personList[i].Person__r.Date_of_Birth__c) {
                        expression = '<p class="slds-p-around_xx-small" ><b><a href=' + url + '>Date of Birth</a></b></p>';
                    }
                    if (!this.personList[i].Person__r.Gender__c) {
                        expression += '<p class="slds-p-around_xx-small"><b><a href=' + url + '>Gender</a></b></p>';
                    }
                    if (!this.personList[i].Person__r.Race__c) {
                        expression += '<p class="slds-p-around_xx-small "><b><a href=' + url + '>Race</a></b></p>';
                    }
                    if (!this.personList[i].Person__r.Hispanic_Latino_Origin__c) {
                        expression += '<p class="slds-p-around_xx-small "><b><a href=' + url + '>Hispanic or Latino Origin</a></b></p>';
                    }
                    if (!this.personList[i].Person__r.Child_a_member_in_federal_Tribe__c) {
                        expression += '<p class="slds-p-around_xx-small "><b><a href=' + url + '>Child’s Tribal Memberships</a></b></p>';
                    }

                    if (expression) {
                        this.personList[i].body = expression;

                    } else {
                        this.personList[i].body = '<h6 class="slds-text-align_center" style="padding-top:54px;font-size:large;"><b>No elements found!</b></h6>'
                    }


                }
                const uniqueSet = new Set(this.personList.map(JSON.stringify));
                this.personList = [];
                this.personList = Array.from(uniqueSet).map(JSON.parse);
                this.isLoading = false;
            })
            .catch(error => {

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
                this.message = errorMsg;
                this.fireToastMsg();
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

}