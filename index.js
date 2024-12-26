const AWS = require('aws-sdk');
const got = require('got');

exports.handler= async (event) => {
    const SVID = event.queryStringParameters.svid;
    const fileName=event.queryStringParameters.filename;
    let base64data=JSON.parse(Buffer.from(event.body,'base64').toString('utf-8'));
    const file = base64data['file'];
    
    AWS.config.update({
        credentials: {
            accessKeyId: '',
            secretAccessKey: ''
        }
    });
    //IAM region 資訊
    AWS.config.update({
        region: ''
    });
    const workdocs = new AWS.WorkDocs();

    await start(workdocs, fileName, file,SVID);
    const response = {
        statusCode: 200,
        headers: {  
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify(`It's ok`),
    };
    return response;
};


const describeUser = async (workdocs) => {
    //取得 workdocs 上某位使用者的資訊
    const user = await workdocs.describeUsers({
        OrganizationId: '',
        Query: ''
    }).promise();

    return user;
}

const initUpload = async ({ workdocs, folderID, filename }) => {
    try {
        const contentType = "application/octet-stream";
        const initResult = await workdocs.initiateDocumentVersionUpload({
            ParentFolderId: folderID,
            Name: filename,
            ContentType: contentType,
            ContentCreatedTimestamp: new Date(),
            ContentModifiedTimestamp: new Date()
        }).promise();
        const documentId = initResult.Metadata.Id;
        const versionId = initResult.Metadata.LatestVersionMetadata.Id;
        const { UploadUrl, SignedHeaders } = initResult.UploadMetadata;
        console.log("initUpload complete");
        return {
            documentId,
            versionId,
            uploadUrl: UploadUrl,
            signedHeaders: SignedHeaders
        };
    } catch (e) {
        console.log('failed initUpload', e);
        throw e;
    }
}

const uploadFile = async ({ filename, stream, signedHeaders, uploadUrl }) => {
    try {
        const fileStream = stream;
        const extendParams = {
            headers: signedHeaders
        };
        const client = got.extend(extendParams);
        await client.put(uploadUrl, {
            body:Buffer.from(fileStream)
        });
    } catch (e) {
        console.log('failed uploadFile', e);
        throw e;
    }
}

const updateVersion = async ({ workdocs, documentId, versionId }) => {
    try {
        await workdocs.updateDocumentVersion({
            DocumentId: documentId,
            VersionId: versionId,
            VersionStatus: 'ACTIVE'
        }).promise();
    } catch (e) {
        console.log('failed updateversion', e);
        throw e;
    }
}

const checkFolderExist = async ({ folderName, rootFolderId,workdocs }) => {
    try {
        const folderContent = await workdocs.describeFolderContents({
            FolderId: rootFolderId,
        }).promise();

        const subFolders = folderContent.Folders;
        const result= subFolders.find(f=>f.Name===folderName);

        return result;
    } catch (e) {
        console.log('checkingFolderExist error', e);
        throw e;
    }
}

const start = async (workdocs, filename, stream,folderName) => {
    try {
        const user = await describeUser(workdocs);
        const rootFoldId = user.Users[0].RootFolderId;

        const folderExisted=await checkFolderExist({ folderName: folderName, rootFolderId: rootFoldId,workdocs:workdocs });

        let folderId='';

        if(folderExisted){
            folderId=folderExisted.Id;
        }else{
            const newFolder=await workdocs.createFolder({ParentFolderId:rootFoldId,Name:folderName}).promise();
            folderId=newFolder.Metadata.Id;
        }

        const {
            documentId,
            versionId,
            uploadUrl,
            signedHeaders
        } = await initUpload({ workdocs: workdocs, folderID: folderId, filename });
        await uploadFile({ filename, stream, signedHeaders, uploadUrl });
        await updateVersion({ workdocs, documentId, versionId });
    } catch (e) {
        console.error(e);
    }
}