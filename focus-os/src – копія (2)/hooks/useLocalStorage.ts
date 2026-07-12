import { useEffect, useState } from "react";


function useLocalStorage<T>(

    key:string,

    initialValue:T

){


    const [value,setValue] = useState<T>(()=>{


        try{


            const saved =
                localStorage.getItem(key);



            if(saved){

                return JSON.parse(saved);

            }


            return initialValue;


        }

        catch(error){

            console.error(
                "LocalStorage error:",
                error
            );


            return initialValue;

        }


    });





    useEffect(()=>{


        localStorage.setItem(

            key,

            JSON.stringify(value)

        );


    },[key,value]);





    return [

        value,

        setValue

    ] as const;


}



export default useLocalStorage;