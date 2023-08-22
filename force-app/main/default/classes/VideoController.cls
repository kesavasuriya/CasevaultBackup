public class VideoController {
    
    @AuraEnabled
    public static String getContentDocumentDetail(String docName) {
        
        if(String.isNotBlank(docName)) {
            return [SELECT Id FROM ContentDocument WHERE Title = :docName LIMIT 1].Id;
        } else return null;
    }

}