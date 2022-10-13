import axios from "axios";
import getStore from '../stores/appStore';

const getFileMetadata = async (fileId) => {
    const accessToken = getStore().state.googleAccessToken;
    const response = await axios.get(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.data;
};

const getFileDownloadUrl = (fileId) => {
    return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
};

const getExportFileDownloadUrl = (fileId) => {
    return `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf`;
};

export {
    getFileMetadata,
    getFileDownloadUrl,
    getExportFileDownloadUrl
};