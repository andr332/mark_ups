import axios from "axios";
import {getAccessTokenHeader, getCurrentDomain, isCustomDomain} from "../utils";

const BASE_API_URL = process.env.VUE_APP_BASE_API_URL;

const getTeamDetails = async () => {
    const response = await axios.get(`${BASE_API_URL}/team`, {
        withCredentials: true,
        headers: await getAccessTokenHeader()
    });

    return response.data;
};

const inviteTeamMembers = async (emails) => {
    const response = await axios.post(`${BASE_API_URL}/team/inviteMembers`, emails, {
        withCredentials: true,
        headers: await getAccessTokenHeader()
    });

    return response.data;
};

const reinviteTeamMember = async (request) => {
    const response = await axios.post(`${BASE_API_URL}/team/reinviteMember`, request, {
        withCredentials: true,
        headers: await getAccessTokenHeader()
    });

    return response.data;
};

const removeInvite = async (request) => {
    const response = await axios.post(`${BASE_API_URL}/team/removeInvite`, request, {
        withCredentials: true,
        headers: await getAccessTokenHeader()
    });

    return response.data;
};

const removeMember = async (request) => {
    const response = await axios.post(`${BASE_API_URL}/team/removeMember`, request, {
        withCredentials: true,
        headers: await getAccessTokenHeader()
    });

    return response.data;
};

const acceptInvite = async (teamId, invitationId) => {
    try {
        const response = await axios.get(`${BASE_API_URL}/team/acceptInvite/${teamId}/${invitationId}`, {
            withCredentials: true,
            headers: await getAccessTokenHeader()
        });

        return response.data;
    } catch (err) {
        if (err.response.status === 400) {
            throw err.response.data;
        } else {
            throw err;
        }
    }
};

const updateTeamDetails = async (request) => {
    const response = await axios.patch(`${BASE_API_URL}/team/updateTeam`, request, {
        withCredentials: true,
        headers: await getAccessTokenHeader()
    });

    return response.data;
};

const uploadLogo = async (file) => {
    let formData = new FormData();
    formData.append('Logo', file);

    const response = await axios.post(`${BASE_API_URL}/team/uploadTeamLogo`, formData, {
        withCredentials: true,
        headers: {
            'Content-Type': 'multipart/form-data',
            ...await getAccessTokenHeader()
        }
    });

    return response.data;
};

const getTeamBrand = async () => {
    let customDomainParam = '';
    if (isCustomDomain()) customDomainParam = `?d=${encodeURIComponent(getCurrentDomain())}`;

    const response = await axios.get(`${BASE_API_URL}/team/brand${customDomainParam}`, {
        withCredentials: true,
        headers: {
            ...await getAccessTokenHeader()
        }
    });

    return response.data;
}

export {
    getTeamDetails,
    inviteTeamMembers,
    reinviteTeamMember,
    removeInvite,
    acceptInvite,
    removeMember,
    uploadLogo,
    updateTeamDetails,
    getTeamBrand
}