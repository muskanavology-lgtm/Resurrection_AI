import api from "./axios";

export const uploadProject =
async(formData)=>{

 const res =
 await api.post(
 "/upload",
 formData,
 {
   headers:{
     "Content-Type":
     "multipart/form-data"
   }
 });

 return res.data;
};