import axios from "axios";
import {getAccessTokenHeader, getCurrentDomain, isCustomDomain} from "../utils";

const MAX_TIME_TRIES = 195;
const MAX_TIME_TRIES_PDF = 195;

const BASE_API_URL = process.env.VUE_APP_BASE_API_URL;

let isCurrentlyUpdating = false;
let updateQueueProcessor = null;
const updateQueue = [];

const delayFor = (delayMs) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, delayMs);
    });
};

const createMarkUpFromImages = async (files, isSuperHero) => {
    const maxFileSize = isSuperHero ? Number(process.env.VUE_APP_MAX_UPLOAD_SIZE) : Number(process.env.VUE_APP_DEFAULT_UPLOAD_SIZE);

    let formData = new FormData();
    for (let file of files) {
        if (file.size > maxFileSize) {
            throw {
                code: 'FileSizeExceededLimit'
            };
        }

        formData.append('Image', file);
    }

    const response = await axios.post(`${BASE_API_URL}/markUp/image`, formData, {
        withCredentials: true,
        headers: {
            'Content-Type': 'multipart/form-data',
            ...await getAccessTokenHeader()
        }
    });

    let markUpId = response.data.id;
    return markUpId;
};

const createMarkUpFromImageUrl = async (imageUrl, bearerToken) => {
    const response = await axios.post(`${BASE_API_URL}/markUp/imageUrl`, {
        imageUrl,
        bearerToken
    }, {
        withCredentials: true,
        headers: {
            ...await getAccessTokenHeader()
        }
    });

    let markUpId = response.data.id;
    return markUpId;
};

const createMarkUpFromPdf = async (pdfFile, isSuperHero) => {
    const maxFileSize = isSuperHero ? Number(process.env.VUE_APP_MAX_UPLOAD_SIZE) : Number(process.env.VUE_APP_DEFAULT_UPLOAD_SIZE);

    let formData = new FormData();
    if (pdfFile.size > maxFileSize)
    {
        throw {
            code: 'FileSizeExceededLimit'
        };
    }

    formData.append('Pdf', pdfFile);

    const response = await axios.post(`${BASE_API_URL}/markUp/pdf`, formData, {
        withCredentials: true,
        headers: {
            'Content-Type': 'multipart/form-data',
            ...await getAccessTokenHeader()
        }
    });

    let markUpId = response.data.id;
    return markUpId;
};

const createMarkUpFromPdfUrl = async (pdfUrl, bearerToken) => {
    const response = await axios.post(`${BASE_API_URL}/markUp/pdfUrl`, {
        pdfUrl,
        bearerToken
    }, {
        withCredentials: true,
        headers: {
            ...await getAccessTokenHeader()
        }
    });

    let markUpId = response.data.id;
    return markUpId;
};

const createMarkUpFromUrl = async (websiteUrl, isMobile) => {
    const response = await axios.post(`${BASE_API_URL}/markUp/url`, {
        websiteUrl: websiteUrl,
        isMobile: isMobile
    }, {
        withCredentials: true,
        headers: {
            ...await getAccessTokenHeader()
        }
    });

    let markUpId = response.data.id;
    return markUpId;
};

const createMarkUpPageAttachment = async (markUpId, pageId, file) => {
    let formData = new FormData();
    if (file.size > Number(process.env.VUE_APP_MAX_UPLOAD_SIZE)) {
        throw {
            code: 'FileSizeExceededLimit'
        };
    }

    formData.append('Image', file);

    const response = await axios.post(`${BASE_API_URL}/markUp/${markUpId}/page/${pageId}/attachment/image`, formData, {
        withCredentials: true,
        headers: {
            'Content-Type': 'multipart/form-data',
            ...await getAccessTokenHeader()
        }
    });

    return response.data;
}

const getMarkUpById = async (markUpId, creatorKey, forScreenshot=true) => {
    let customDomainParam = '';
    if (isCustomDomain()) customDomainParam = `?d=${encodeURIComponent(getCurrentDomain())}`;

    let markUp;
    try {
        const url = creatorKey ? `${BASE_API_URL}/markUp/${markUpId}/${forScreenshot ? 'screenshot' : 'creator'}/${creatorKey}` : `${BASE_API_URL}/markUp/${markUpId}${customDomainParam}`;
        const markUpResponse = await axios.get(url, {
            withCredentials: true,
            headers: {
                ...await getAccessTokenHeader()
            }
        });
        markUp = markUpResponse.data;
    } catch (err) {
        if (!err.response || (err.response.status !== 404 && err.response.status !== 500)) {
            throw err;
        }
    }

    return markUp;
};

const getMarkUpAndAwaitUntilPresent = (markUpId, creatorKey, forScreenshot=true) => {
    return new Promise((resolve, reject) => {
        let callingApi = false;
        let startTime = (new Date()).getTime();
        const tid = setInterval(async () => {
            if (callingApi) {
                return;
            }

            if (startTime + (MAX_TIME_TRIES * 1000) < (new Date()).getTime()) {
                clearInterval(tid);
                reject('Exceeded total allowed time for getting markup');
                return;
            }

            try {
                callingApi = true;
                const markUp = await getMarkUpById(markUpId, creatorKey, forScreenshot);
                if (markUp) {
                    clearInterval(tid);
                    resolve(markUp);
                }
            } catch(err) {
                reject(err);
            } finally {
                callingApi = false;
            }
        }, 250);
    });
};

const updateMarkUpPage = async (markUpId, imageIdentifier, konvaData) => {
    updateQueue.push({
        markUpId,
        imageIdentifier,
        konvaData
    });
};

const duplicateMarkUp = async (markUpId) => {
    let markUp;
    try {
        const url = `${BASE_API_URL}/markUp/${markUpId}/duplicate`;
        const markUpResponse = await axios.get(url, {
            withCredentials: true,
            headers: {
                ...await getAccessTokenHeader()
            }
        });
        markUp = markUpResponse.data;
    } catch (err) {
        if (!err.response || err.response.status !== 404) {
            throw err;
        }
    }

    return markUp;
};

const getMarkUpDownloadUrl = (markUpId, imageIdentifier) => {
    return new Promise((resolve, reject) => {
        getAccessTokenHeader().then(accessTokenHeader => {
            let apiCallUrl = '';
            if (!imageIdentifier) {
                apiCallUrl = `${BASE_API_URL}/markUp/${markUpId}/downloadIdentifier`;
            } else {
                apiCallUrl = `${BASE_API_URL}/markUp/${markUpId}/${imageIdentifier}/downloadIdentifier`;
            }

            axios.get(apiCallUrl, {
                withCredentials: true,
                headers: {
                    ...accessTokenHeader
                }
            }).then(downloadIdResponse => {
                if (downloadIdResponse.status !== 200) {
                    return reject('Failed to generate download identifier');
                }

                const downloadId = downloadIdResponse.data.downloadIdentifier;

                let callingApi = false;
                let startTime = (new Date()).getTime();
                const tid = setInterval(async () => {
                    if (callingApi) {
                        return;
                    }

                    if (startTime + (MAX_TIME_TRIES * 1000) < (new Date()).getTime()) {
                        clearInterval(tid);
                        reject('Exceeded total allowed time for downloading markup');
                        return;
                    }

                    try {
                        callingApi = true;
                        await axios.get(`${BASE_API_URL}/markUp/checkDownload/${downloadId}`, {
                            withCredentials: true,
                            headers: {
                                ...accessTokenHeader
                            }
                        });

                        clearInterval(tid);
                        resolve(`${BASE_API_URL}/markUp/${markUpId}/${downloadId}/download`);
                    } catch(err) {
                        if (err.response.status !== 404) {
                            clearInterval(tid);
                            reject(err);
                        }
                    } finally {
                        callingApi = false;
                    }
                }, 250);
            }).catch(err => {
                reject(err);
            });
        }).catch(err => {
            reject(err);
        });
    });
};

const getMarkUpShareUrl = (details) => {
    if (details.isTeamMember && details.customDomain)
        return `${window.location.protocol}//${details.customDomain}${getMarkUpSharePath(details)}`;

    return `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':'+window.location.port : ''}${getMarkUpSharePath(details)}`;
};

const getMarkUpSharePath = (details) => {
    const pageSuffix = !details.pageNumber || details.pageNumber === 1 ? '' : `/${details.pageNumber}`;
    const pathPrefix = details.isPrivate ? '/private' : '/share';
    return `${pathPrefix}/${details.markUpId}${pageSuffix}`;
}

const getMarkUpHistory = async (pageInfo) => {
    if (!pageInfo) {
        pageInfo = {
            size: 15,
            page: 1
        };
    }

    const markUpHistory = await axios.get(`${BASE_API_URL}/markUp/history?size=${pageInfo.size}&page=${pageInfo.page}`, {
        withCredentials: true,
        headers: {
            ...await getAccessTokenHeader()
        }
    });

    return markUpHistory.data;
};

const searchMarkUps = async (filters, pageInfo, cancelToken=null) => {
    if (!pageInfo) {
        pageInfo = {
            size: 12,
            page: 1
        };
    }

    if (filters === null || filters === undefined) filters = {};

    const markUpHistory = await axios.post(`${BASE_API_URL}/markUp/searchHistory?size=${pageInfo.size}&page=${pageInfo.page}`, filters, {
        withCredentials: true,
        headers: {
            ...await getAccessTokenHeader()
        },
        cancelToken
    });

    return markUpHistory.data;
};

const getViewedMarkUpHistory = async (pageInfo) => {
    if (!pageInfo) {
        pageInfo = {
            size: 15,
            page: 1
        };
    }

    const viewedMarkUpHistory = await axios.get(`${BASE_API_URL}/markUp/viewHistory?size=${pageInfo.size}&page=${pageInfo.page}`, {
        withCredentials: true,
        headers: {
            ...await getAccessTokenHeader()
        }
    });

    return viewedMarkUpHistory.data;
};

const startUpdateQueueProcessor = () => {
    if (updateQueueProcessor) {
        clearInterval(updateQueueProcessor);
    }

    updateQueueProcessor = setInterval(async () => {
        if (isCurrentlyUpdating) {
            return;
        }

        isCurrentlyUpdating = true;

        while (updateQueue.length > 0) {
            const update = updateQueue[0];
            const markUpId = update.markUpId;
            const imageIdentifier = update.imageIdentifier;
            const konvaData = update.konvaData;

            try {
                await axios.patch(`${BASE_API_URL}/markUp/${markUpId}`, {
                    konvaData,
                    imageIdentifier
                }, {
                    withCredentials: true,
                    headers: {
                        ...await getAccessTokenHeader()
                    }
                });
            } catch (err) {
                console.error(err);
            }

            updateQueue.splice(0, 1);
        }

        isCurrentlyUpdating = false;
    }, 150);
};

const stopUpdateQueueProcessor = async () => {
    while (updateQueue.length > 0) {
        await delayFor(100);
    }

    if (updateQueueProcessor) {
        clearInterval(updateQueueProcessor);
    }
};

const deleteMarkUp = async (markUpId) => {
    await axios.delete(`${BASE_API_URL}/markUp/${markUpId}`, {
        withCredentials: true,
        headers: {
            ...await getAccessTokenHeader()
        }
    });
}

const deleteMarkUpPage = async (markUpId, imageIdentifier) => {
    const response = await axios.delete(`${BASE_API_URL}/markUp/${markUpId}/page/${imageIdentifier}`, {
        withCredentials: true,
        headers: {
            ...await getAccessTokenHeader()
        }
    });

    return response.data;
}

const buildAttachmentDownloadUrl = (attachmentId, mimeType) => {
    return `${BASE_API_URL}/markUp/attachment/${attachmentId}?mimeType=${encodeURIComponent(mimeType || '')}`;
};

const changeMarkUpVisibility = async (markUpId, visibility) => {
    await axios.patch(`${BASE_API_URL}/markUp/visibility/${markUpId}`, { visibility }, {
        withCredentials: true,
        headers: {
            ...await getAccessTokenHeader()
        }
    });
};

const changeAllMarkUpsVisibility = async (visibility) => {
    await axios.patch(`${BASE_API_URL}/markUp/visibility`, { visibility }, {
        withCredentials: true,
        headers: {
            ...await getAccessTokenHeader()
        }
    });
};

const addMarkUpTag = async (markUpId, tag) => {
    const result = await axios.post(`${BASE_API_URL}/markUp/${markUpId}/addTag`, { tag }, {
        withCredentials: true,
        headers: {
            ...await getAccessTokenHeader()
        }
    });

    return result.data;
};

const deleteMarkUpTag = async (markUpId, tag) => {
    const result = await axios.post(`${BASE_API_URL}/markUp/${markUpId}/deleteTag`, { tag }, {
        withCredentials: true,
        headers: {
            ...await getAccessTokenHeader()
        }
    });

    return result.data;
};

const getJobStatus = async (jobIds) => {
    let jobIdsStr = '';
    for (let i = 0; i < jobIds.length; i++) {
        jobIdsStr += jobIds[i];
        if (i + 1 < jobIds.length) jobIdsStr += ',';
    }

    const result = await axios.get(`${BASE_API_URL}/markUp/jobStatus?jobIds=${jobIdsStr}`, {
        withCredentials: true,
        headers: {
            ...await getAccessTokenHeader()
        }
    });

    return result.data;
};

const waitUntilJobsCompleted = (jobIds) => {
    return new Promise((resolve, reject) => {
        let startTime = (new Date()).getTime();
        let callingApi = false;

        const tid = setInterval(async () => {
            if (callingApi) return;

            callingApi = true;
            const jobStatus = await getJobStatus(jobIds);
            if (jobStatus.isCompleted) return resolve(true);

            if (startTime + (MAX_TIME_TRIES * 1000) < (new Date()).getTime()) {
                clearInterval(tid);
                return reject('Exceeded total allowed time for job completion');
            }
            callingApi = false;
        }, 250);
    });
}

const addMarkUpPageFromImages = async (markUpId, files, isSuperHero) => {
    const maxFileSize = isSuperHero ? Number(process.env.VUE_APP_MAX_UPLOAD_SIZE) : Number(process.env.VUE_APP_DEFAULT_UPLOAD_SIZE);

    let formData = new FormData();
    for (let file of files) {
        if (file.size > maxFileSize) {
            throw {
                code: 'FileSizeExceededLimit'
            };
        }

        formData.append('Image', file);
    }

    const response = await axios.post(`${BASE_API_URL}/markUp/${markUpId}/addPage/image`, formData, {
        withCredentials: true,
        headers: {
            'Content-Type': 'multipart/form-data',
            ...await getAccessTokenHeader()
        }
    });

    let jobIds = response.data.jobIds;
    return jobIds;
};

const addMarkUpPageFromPdf = async (markUpId, pdfFile, isSuperHero) => {
    const maxFileSize = isSuperHero ? Number(process.env.VUE_APP_MAX_UPLOAD_SIZE) : Number(process.env.VUE_APP_DEFAULT_UPLOAD_SIZE);

    let formData = new FormData();
    if (pdfFile.size > maxFileSize)
    {
        throw {
            code: 'FileSizeExceededLimit'
        };
    }

    formData.append('Pdf', pdfFile);

    const response = await axios.post(`${BASE_API_URL}/markUp/${markUpId}/addPage/pdf`, formData, {
        withCredentials: true,
        headers: {
            'Content-Type': 'multipart/form-data',
            ...await getAccessTokenHeader()
        }
    });

    let jobIds = response.data.jobIds;
    return jobIds;
};

const addMarkUpPageFromUrl = async (markUpId, websiteUrl, isMobile) => {
    const response = await axios.post(`${BASE_API_URL}/markUp/${markUpId}/addPage/url`, {
        websiteUrl,
        isMobile
    }, {
        withCredentials: true,
        headers: {
            ...await getAccessTokenHeader()
        }
    });

    let jobIds = response.data.jobIds;
    return jobIds;
};

const signalMarkUpPageEditDone = async (markUpId, imageIdentifier, force = false) => {
    await axios.get(`${BASE_API_URL}/markUp/${markUpId}/${imageIdentifier}/editDone?force=${force ? 'true' : 'false'}`, {
        withCredentials: true,
        headers: {
            ...await getAccessTokenHeader()
        }
    });
};

const applyBlurToMarkUpPage = async (markUpId, imageIdentifier, blurRequest) => {
    const response = await axios.post(`${BASE_API_URL}/markUp/${markUpId}/${imageIdentifier}/applyBlur`, blurRequest, {
        withCredentials: true,
        headers: {
            ...await getAccessTokenHeader()
        }
    });

    let jobIds = response.data.jobIds;
    return jobIds;
};

const exportMarkUpAsPdf = (markUpId) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        const response = await axios.get(`${BASE_API_URL}/markUp/${markUpId}/pdfDownloadIdentifier`, {
            withCredentials: true,
            headers: {
                ...await getAccessTokenHeader()
            }
        });

        let downloadIdentifier = response.data.downloadIdentifier;

        let callingApi = false;
        let startTime = (new Date()).getTime();
        const tid = setInterval(async () => {
            if (callingApi) {
                return;
            }

            if (startTime + (MAX_TIME_TRIES_PDF * 1000) < (new Date()).getTime()) {
                clearInterval(tid);
                reject('Exceeded total allowed time for downloading markup');
                return;
            }

            try {
                callingApi = true;
                await axios.get(`${BASE_API_URL}/markUp/checkDownload/${downloadIdentifier}`, {
                    withCredentials: true,
                    headers: {
                        ...await getAccessTokenHeader()
                    }
                });

                clearInterval(tid);
                resolve(`${BASE_API_URL}/markUp/${markUpId}/${downloadIdentifier}/downloadPdf`);
            } catch(err) {
                if (err.response.status !== 404) {
                    clearInterval(tid);
                    reject(err);
                }
            } finally {
                callingApi = false;
            }
        }, 250);
    });
};

const changeMarkUpTitle = async (markUpId, title) => {
    await axios.patch(`${BASE_API_URL}/markUp/${markUpId}/title`, { title }, {
        withCredentials: true,
        headers: {
            ...await getAccessTokenHeader()
        }
    });
};

const renameTag = async (oldTag, newTag) => {
    const response = await axios.patch(`${BASE_API_URL}/markUp/tag`, { oldTag, newTag }, {
        withCredentials: true,
        headers: {
            ...await getAccessTokenHeader()
        }
    });

    let jobIds = response.data.jobIds;
    return jobIds;
}

const deleteTag = async (tag) => {
    const response = await axios.post(`${BASE_API_URL}/markUp/deleteTag`, { tag }, {
        withCredentials: true,
        headers: {
            ...await getAccessTokenHeader()
        }
    });

    let jobIds = response.data.jobIds;
    return jobIds;
};

export {
    createMarkUpFromImages,
    createMarkUpFromImageUrl,
    createMarkUpFromPdf,
    createMarkUpFromPdfUrl,
    createMarkUpFromUrl,
    createMarkUpPageAttachment,
    getMarkUpById,
    duplicateMarkUp,
    getMarkUpAndAwaitUntilPresent,
    updateMarkUpPage,
    getMarkUpDownloadUrl,
    getMarkUpShareUrl,
    getMarkUpSharePath,
    getMarkUpHistory,
    searchMarkUps,
    getViewedMarkUpHistory,
    startUpdateQueueProcessor,
    stopUpdateQueueProcessor,
    deleteMarkUp,
    deleteMarkUpPage,
    buildAttachmentDownloadUrl,
    changeMarkUpVisibility,
    changeAllMarkUpsVisibility,
    addMarkUpTag,
    deleteMarkUpTag,
    getJobStatus,
    waitUntilJobsCompleted,
    addMarkUpPageFromImages,
    addMarkUpPageFromPdf,
    addMarkUpPageFromUrl,
    signalMarkUpPageEditDone,
    applyBlurToMarkUpPage,
    exportMarkUpAsPdf,
    changeMarkUpTitle,
    renameTag,
    deleteTag
};