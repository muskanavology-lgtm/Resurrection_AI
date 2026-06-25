import api from "./axios";

export const projectChat =
(data)=>
api.post(
"/chat/project-chat",
data
);

export const contextChat =
(id,data)=>
api.post(
`/context-chat/${id}`,
data
);

export const copilotChat =
(data)=>
api.post(
"/copilot",
data
);