/***************************************
 * @author Kevin Chan
 * @date 23 DEC 2022
 * @description Controller class for inboundScreenPop LWC
 **/ 
public class InboundScreenPopController {
    private static final String SEARCH_KEYTYPE_PHONE = 'Phone';
    private static final String SEARCH_GROUP_PHONE = ' IN PHONE FIELDS ';
    private static final String SEARCH_GROUP_ALL = ' IN ALL FIELDS ';
    
    /**
     * @description Get Contact records matching search key
     * @param String searchKey
     * @param String searchKeyType
     * @return List<Contact> 
     */ 
    @AuraEnabled(cacheable=true)
    public static List<Contact> searchContacts(String searchKey, String searchKeyType) {
        List<Contact> listMatchingContacts = new List<Contact>();
        if (String.isBlank(searchKey)) return listMatchingContacts;
        String searchQueryContactReturn = ' RETURNING Contact(Id, Name, Email, Phone, MobilePhone ORDER BY Name)';
        String searchQueryGroup = (searchKeyType == SEARCH_KEYTYPE_PHONE) ? SEARCH_GROUP_PHONE : SEARCH_GROUP_ALL;
        String searchQuery = 'FIND :searchKey' + searchQueryGroup + searchQueryContactReturn;
        List<List<sObject>> contactSearchResults = search.query(searchQuery);
        listMatchingContacts = (List<Contact>) contactSearchResults[0];
        return listMatchingContacts;
    }
    
    /**
     * @description Get open Case records from search key
     * @param String searchKey
     * @return List<Case> 
     */ 
    @AuraEnabled(cacheable=true)
    public static List<Case> getOpenCases(String searchKey) {
        List<Case> listMatchingCases = new List<Case>();
        if (String.isBlank(searchKey)) return listMatchingCases;
        String searchQueryCaseReturn = 'RETURNING Case(' 
            + 'Id, CaseNumber, Contact.Name, Contact.Phone, Contact.MobilePhone, Subject, Description, CreatedDate, Status '
            + 'WHERE IsClosed = FALSE '
            + 'ORDER BY CreatedDate DESC)';
        String searchQueryGroup = SEARCH_GROUP_ALL;
        String searchQuery = 'FIND :searchKey' + searchQueryGroup + searchQueryCaseReturn;
        List<List<sObject>> caseSearchResults = search.query(searchQuery);
        listMatchingCases = (List<Case>) caseSearchResults[0];
        return listMatchingCases;
    }

}