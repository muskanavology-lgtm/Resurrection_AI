import api from "./axios";

export const getHealth =
(id)=>
api.get(`/health/${id}`);

export const getGraph =
(id)=>
api.get(`/graph/${id}`);

export const getSecurity =
(id)=>
api.get(`/security/${id}`);

export const getReadme =
(id)=>
api.get(`/readme/${id}`);

export const getRecommendations =
(id)=>
api.get(`/recommendations/${id}`);

export const getCTOReport =
(id)=>
api.get(`/cto-report/${id}`);