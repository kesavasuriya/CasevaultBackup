import { LightningElement, track, api } from 'lwc';
import getSearchResult from '@salesforce/apex/InvestigationController.getCaseConnectSearchResults';
import UtilityBaseElement from 'c/utilityBaseLwc';

const caseConnectColumns = [
    { label: 'Service Case ID', fieldName: 'caseURL',
    type:'url', typeAttributes: {
        label: { 
            fieldName: 'caseName' 
        },
        target : '_self'
    }}, { label : 'HOH', fieldName : 'hohName', wrapText : 'true'}, 
    { label : 'Case Status', fieldName : 'caseStatus', wrapText : 'true'},
    {label : 'Date', fieldName : 'caseDate', wrapText : 'true'},
    { label : 'Worker', fieldName : 'worker', wrapText : 'true'},
    {label : 'Local Department', fieldName : 'localDpt', wrapText : 'true'}
];

export default class CaseConnectCmp extends UtilityBaseElement {

    caseConnectColumns = caseConnectColumns;
    @track caseConnectData = [];
    showSelect = true;
    @api selectedCaseConnect;
    @api recordId;

    connectedCallback() {
        this.doInit();
    }

    doInit() {

        this.handleCaseConnect();
    }

    handleInitCaseConnect() {

        this.caseConnectData = [];
        this.selectedCaseConnect = '';
        this.showSelect = true;
    }

    handleCaseConnect() {

        this.handleInitCaseConnect();
        getSearchResult({recordId: this.recordId})
        .then(result => {
            let response = JSON.parse(result);
            if(response) {
                this.caseConnectData = response;
                console.log('caseConnectData===',this.caseConnectData);
            }

        }).catch(error => {
                this.handleError(error);
        });
       
    }
    

    handleRowSelection(event) {

        this.selectedCaseConnect = event.detail.selectedRows[0].caseId;
        if(this.selectedCaseConnect) {
            this.showSelect = false;
        }
    }

    handleSC() {

        this.selectedCaseConnect = 'New';
    }


    handleError(error) {

        console.log('error:::',error);
        let errorMsg;
        this.title ="Error!";
        this.type ="error";
        if(error) {
            let errors = this.reduceErrors(error);
                errorMsg = errors.join('; ');
        } else {
            errorMsg = 'Unknown Error';
        }
        this.message = errorMsg;
        this.fireToastMsg();
    }
}