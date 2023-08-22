public class AssessmentDocumentController {
    
    @InvocableMethod 
    public static void inertDocument(List<flowInputs> userDetails) {
        
        PageReference ref = Page.SafetyPlanPdf;
        ref.getParameters().put('id',userDetails.get(0).recordId);
        Blob b = ref.getContentAsPDF();
        
        ContentVersion ContVerFile = new ContentVersion();
        ContVerFile.VersionData = b;
        ContVerFile.Title = userDetails.get(0).fileName; 
        ContVerFile.PathOnClient = userDetails.get(0).fileName+'.pdf'; 
        ContVerFile.ContentLocation= 's';
        insert ContVerFile;
        
        Id conDoc = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =:ContVerFile.Id].ContentDocumentId;
        ContentDocumentLink cDe = new ContentDocumentLink();
        cDe.ContentDocumentId = conDoc;
        cDe.LinkedEntityId = userDetails.get(0).recordId;
        cDe.ShareType = 'I';
        cDe.Visibility = 'AllUsers';
        insert cDe;
        
    }
    
    public class flowInputs {
        @InvocableVariable
        public String recordId;
        @InvocableVariable
        public String fileName;
    }
}