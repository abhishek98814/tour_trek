import axios from "axios"
import { useEffect } from "react"

const ContentPage = ()=>{

    const hitAPI = async()=>{
        try{
            const data = await axios.get("http://localhost:8000/blog/blogs/") 
            console.log(data, 'tHIS IS Data')
        }catch(err){
            console.log(err)
        }
    }


    useEffect(()=>{
            hitAPI()
    }, [])

    return(
        <>
        <p>THIs is  adat</p>
        </>
    )
}

export default ContentPage;