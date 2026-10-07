import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import api from "../../api";
export default function Companies(){
 const [companies,setCompanies]=useState([]),[error,setError]=useState("");
 useEffect(()=>{api.get("/companies").then(r=>setCompanies(r.data)).catch(()=>setError("Could not load companies. Check that backend is running."));},[]);
 return <><h1>Explore companies</h1><p>Discover employers and their opportunities.</p>{error&&<p className="error">{error}</p>}<section className="cards">{companies.map(c=><article key={c.id}><h2>{c.name}</h2><p>{c.industry} · {c.location}</p><p>{c.description}</p><Link className="button" to={`/companies/${c.id}`}>View details</Link></article>)}</section>{companies.length===0&&!error&&<p>No companies added yet.</p>}</>;
}