import { LightningElement, api, track } from 'lwc';
import getInitInfo from '@salesforce/apex/ServiceLogController.getInitInfo';
import getSearchList from '@salesforce/apex/ServiceLogController.getSearchList';
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';
import { NavigationMixin } from 'lightning/navigation';
import UtilityBaseElement from 'c/utilityBaseLwc';

const providercolumns = [
    { label: 'Provider ID', fieldName: 'providerId' },
    { label: 'Provider Name', fieldName: 'providerName' },
    { label: 'Tax ID', fieldName: 'taxID' },
    { label: 'Location Address', fieldName: 'address' },
    { label: 'County', fieldName: 'country' },
    { label: 'Services', fieldName: 'Structure_Service_Name__c' }
];

const vendorColumns = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'First Name', fieldName: 'First_Name__c' },
    { label: 'Last Name', fieldName: 'Last_Name__c' },
    { label: 'Business Name', fieldName: 'Business_Name__c' },
    { label: 'SSN', fieldName: 'SSN__c' },
    { label: 'FEIN', fieldName: 'FEIN__c' }
];

export default class ServiceLogLWC extends NavigationMixin(UtilityBaseElement) {

    @api recordId;
    @api serviceType;

    @track providers = [];
    @track servicePicklist = [];
    @track clientPicklist = [];
    @track vendors = [];
    @track providerSelectedRows = [];
    @track vendorSelectedRows = [];

    providercolumns = providercolumns;
    vendorColumns = vendorColumns;
    showModalAddNewService = false;
    showResultTable = false;
    providerId;
    service;
    vendorId; 
    clientId;

    get showSelect() {

         return (this.vendorId && this.vendorId.length > 0 && this.clientId && this.clientId.length > 0 && this.serviceType == 'Vendor Services')  ?  false : 
                (this.providerId && this.providerId.length > 0 && this.clientId && this.clientId.length > 0 && this.serviceType == 'Vendor Services') ? false : 
                (this.serviceType == 'Agency Provided Services' && this.clientId && this.clientId.length > 0) ? false : true;
    }

    get showSearch() {

        return this.service ? false : true;
       
    }

    get providerTitle() {

        return (this.providers && this.providers.length > 0) ? 'Providers('+this.providers.length+')' : 'Providers(0)';
    }

    get vendorTitle() {

        return (this.vendors && this.vendors.length > 0) ? 'Vendors('+this.vendors.length+')' : 'Vendors(0)';

    }

    get showVendor() {
         return this.serviceType == 'Vendor Services' ? true :  false;
    }

    connectedCallback() {

        this.doInit();
    }

    doInit() {

        getInitInfo({serviceCaseId : this.recordId})
        .then(result => {

            if(result != null) {
                let response = JSON.parse(result);
                this.servicePicklist = response.servicePicklists;
                let clientOptions = [{label : '--None--', value : ''}];
                if(response.contacts && response.contacts.length > 0) {
                    for(let i = 0; i < response.contacts.length; i++) {
                        clientOptions.push({label : response.contacts[i].Person__r.Name, value :response.contacts[i].Person__c});
                    }
                } 
                this.clientPicklist = clientOptions;
            } 

        }).catch(error => {
            this.handleError(error);
        })
    }

    handleChange(event) {

        this[event.target.name] = event.target.value;
    
    }

     showAddNewService() {

        this.handleRefresh();
        this.showModalAddNewService = true;
        
    }

    handleRefresh() {

        this.providerSelectedRows = [];
        this.vendorSelectedRows = [];
        this.providers = [];
        this.vendors = [];

    }


    handleSearch() {

        getSearchList({services : this.service})
        .then(result => {

            let response = JSON.parse(result);
            if(response.structureServices && response.structureServices.length) {
                this.providers = response.structureServices;
                for(let i = 0;i < this.providers.length;i++) {

                    this.providers[i].providerId = this.providers[i].Provider__r.Casevault_ProID__c;
                    this.providers[i].providerName = this.providers[i].Provider__r.Name;
                    this.providers[i].taxID = this.providers[i].Provider__r.Tax_ID__c;
                    this.providers[i].address = this.providers[i].Provider__r.BillingStreet;
                    this.providers[i].country = this.providers[i].Provider__r.BillingCountry;
                 }
            } else {
                this.providers = [];
            }

            this.vendors = (response.vendors && response.vendors.length) ?  response.vendors : [];
            this.showResultTable = true;
            
        }).catch(error => {
            this.handleError(error);
        });
      
    }

    handleProviderRowSelection(event) {

        var selectedRows = event.detail.selectedRows;
        let length = selectedRows.length - 1;
        this.providerId = selectedRows[length].Provider__c;
        this.service = selectedRows[length].Structure_Service_Name__c;
        this.vendorSelectedRows = [];
        this.vendorId = '';
    }

    handleVendorRowSelection(event) {

        var selectedRows = event.detail.selectedRows;
        let length = selectedRows.length - 1;
        this.vendorId = selectedRows[length].Id;
        this.providerSelectedRows = [];
        this.providerId = '';
    }

    handleSelect() {

        this.showModalAddNewService = false;
        if(this.serviceType == 'Vendor Services') {

            if(this.clientId && this.service &&  (this.providerId || this.vendorId) ) {
                let defaultValues;
                if(this.providerId) {
                    defaultValues = encodeDefaultFieldValues({
                        Provider__c : this.providerId,
                        Service_Case__c : this.recordId,
                        Type__c : this.serviceType,
                        Service__c : this.service,
                        Client__c : this.clientId
                    });
                } else if(this.vendorId) {
                        defaultValues = encodeDefaultFieldValues({
                        Vendor__c : this.vendorId,
                        Service_Case__c : this.recordId,
                        Type__c : this.serviceType,
                        Service__c : this.service,
                        Client__c : this.clientId
                    });
                }
                
                this[NavigationMixin.Navigate]({
                    type: 'standard__objectPage',
                    attributes: {
                    objectApiName: 'ServiceLog__c',
                    actionName: 'new',
                },state: {
                   defaultFieldValues: defaultValues
                }
               });
            } 

        } else if(this.serviceType == 'Agency Provided Services' && this.clientId) {

            this.defaultValues = encodeDefaultFieldValues({
                Service_Case__c : this.recordId,
                Type__c : this.serviceType,
                Client__c : this.clientId
            });
            this[NavigationMixin.Navigate]({
                type: 'standard__objectPage',
                attributes: {
                objectApiName: 'ServiceLog__c',
                actionName: 'new',
            },state: {
               defaultFieldValues: this.defaultValues
            }
           });
        }     
    
    }

    handleCancel() {

        this.showModalAddNewService = false;
    }

    handleError(error) {

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