import {useEffect,useState} from "react";
import api from "../../api";
export default function Opportunities(){
 const [jobs,setJobs]=useState([]),[email,setEmail]=useState(""),[message,setMessage]=useState("");
 useEffect(()=>{api.get("/opportunities").then(r=>setJobs(r.data)).catch(()=>setMessage("Could not load opportunities. Check the backend."));},[]);
 async function apply(id){if(!email.trim()){setMessage("Enter your student email before applying.");return;}try{await api.post(`/applications/${id}`,{studentEmail:email});setMessage("Application submitted successfully.");}catch(e){setMessage("Application failed. You may already have applied.");}}
 return <><h1>Job opportunities</h1><label>Student email <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="student@example.com"/></label>{message&&<p>{message}</p>}<section className="cards">{jobs.map(j=><article key={j.id}><h2>{j.title}</h2><p>{j.company?.name} · {j.type} · {j.location}</p><p>{j.description}</p><p>Skills: {j.skills||"Not specified"}</p><p>Salary/stipend: {j.stipendOrSalary??"Not specified"}</p><button onClick={()=>apply(j.id)}>Apply now</button></article>)}</section>{jobs.length===0&&!message&&<p>No opportunities posted yet.</p>}</>;
}