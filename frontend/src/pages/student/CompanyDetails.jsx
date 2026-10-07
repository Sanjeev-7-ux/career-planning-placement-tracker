import {useEffect,useState} from "react";
import {Link,useParams} from "react-router-dom";
import api from "../../api";
export default function CompanyDetails(){
 const {id}=useParams();const [company,setCompany]=useState(null),[jobs,setJobs]=useState([]),[error,setError]=useState("");
 useEffect(()=>{Promise.all([api.get(`/companies/${id}`),api.get(`/opportunities/company/${id}`)]).then(([c,j])=>{setCompany(c.data);setJobs(j.data)}).catch(()=>setError("Unable to load company details."));},[id]);
 if(error)return <p className="error">{error}</p>;if(!company)return <p>Loading...</p>;
 return <><Link to="/companies">← Companies</Link><h1>{company.name}</h1><p>{company.industry} · {company.location}</p><p>{company.description}</p>{company.website&&<p><a href={company.website} target="_blank" rel="noreferrer">Company website</a></p>}<h2>Open opportunities</h2>{jobs.map(j=><article key={j.id}><h3>{j.title}</h3><p>{j.type} · {j.location}</p><Link to="/opportunities">Explore opportunities</Link></article>)}</>;
}