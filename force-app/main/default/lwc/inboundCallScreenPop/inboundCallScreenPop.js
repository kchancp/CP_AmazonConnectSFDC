import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import searchContacts from '@salesforce/apex/InboundScreenPopController.searchContacts';
import getOpenCases from '@salesforce/apex/InboundScreenPopController.getOpenCases';

const CONTACT_COLUMNS = [
  { label: 'Name', fieldName: 'Name' },
  { label: 'Email', fieldName: 'Email', type: 'email' },
  { label: 'Phone', fieldName: 'Phone', type: 'phone' },
  { label: 'Mobile', fieldName: 'MobilePhone', type: 'phone' }
];

const CASE_COLUMNS = [
  { label: 'Case Number', fieldName: 'CaseNumber' },
  { label: 'Case Contact', fieldName: 'ContactName' },
  { label: 'Contact Phone', fieldName: 'ContactPhone', type: 'phone' },
  { label: 'Contact Mobile', fieldName: 'ContactMobilePhone', type: 'phone' },
  { label: 'Subject', fieldName: 'Subject' },
  { label: 'Description', fieldName: 'Description' },
  { label: 'Status', fieldName: 'Status' },
  { label: 'Opened Date', fieldName: 'CreatedDate' }
];

const ENTER_KEY_CODE = 13;

/**
 * An example LWC that acts as a screen pop page during an incoming call.
 * @alias InboundCallScreenPop
 * @extends LightningElement
 */
export default class InboundCallScreenPop extends LightningElement {
  callGuid;
  contactTableColumns = CONTACT_COLUMNS;
  caseTableColumns = CASE_COLUMNS;
  contacts;
  openCases;
  currentPageReference = null;
  contactError;
  caseError;
  phoneNumber;
  selectedContactId;
  selectedCaseId;
  valueContactSearch;

  @wire(CurrentPageReference)
  getCurrentUrlParameters(currentPageReference) {
    if (currentPageReference) {
      let state = currentPageReference.state;
      this.phoneNumber = state.c__phone;
      this.callGuid = state.c__guid;
      this.getContactList(this.phoneNumber, 'Phone');
      this.getOpenCasesList(this.phoneNumber);
    }
  }

  getContactList(searchKeyParam, searchKeyTypeParam) {
    searchContacts({
      searchKey: searchKeyParam,
      searchKeyType: searchKeyTypeParam
    })
      .then((result) => {
        if (result.length > 0) {
          console.log('CONTACT SEARCH RESULTS', result);
          this.contacts = result;
          this.getOpenCasesList(searchKeyParam);
        }
        this.contactError = undefined;
      })
      .catch((error) => {
        this.contactError = error;
        this.contacts = undefined;
        console.error('Retrieve Contacts Error', error);
      });
  }

  handleContactRowSelection(event) {
    this.selectedContactId = event.detail.config.value;
  }

  handleNewCase(event) {
    // TBD: HANDLE NEW CASE CREATION LOGIC
  }

  handleContactSearch(event) {
    if (event.keyCode !== ENTER_KEY_CODE) return;

    this.getContactList(this.valueContactSearch, 'All');
  }

  handleLinkCallToCase(event) {
    this.selectedCaseId = event.detail.config.value;

    // TBD: HANDLE LINK CALL TO CASE LOGIC
  }

  getOpenCasesList(searchKeyParam) {
    getOpenCases({
      searchKey: searchKeyParam
    })
      .then((result) => {
        if (result.length > 0) {
          let openCasesRecords = JSON.parse(JSON.stringify(result));
          openCasesRecords = openCasesRecords.map((row) => {
            return {
              ...row,
              ContactName: row.Contact.Name,
              ContactMobilePhone: row.Contact.MobilePhone
            };
          });
          this.openCases = openCasesRecords;
        }
        this.caseError = undefined;
      })
      .catch((error) => {
        this.caseError = error;
        this.openCases = undefined;
        console.error('Retrieve Cases Error', error);
      });
  }
}
