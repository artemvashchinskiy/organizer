import { useEffect, useState } from "react";


function useLocalStorage<T>(

    key:string,

    initialValue:T

){


    const [value,setValue] = useState<T>(

        ()=>{


            const saved =
                localStorage.getItem(key);



            if(saved){

                return JSON.parse(saved);

            }



            return initialValue;


        }

    );






    // reload when key changes

    useEffect(()=>{


        const saved =
            localStorage.getItem(key);



        if(saved){


            setValue(

                JSON.parse(saved)

            );


        }

        else{


            setValue(

                initialValue

            );


        }



    },[key]);







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