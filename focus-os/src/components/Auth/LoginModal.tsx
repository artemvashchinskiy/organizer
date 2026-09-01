import { useState } from "react";


interface LoginModalProps {


    onLogin:(

        username:string,

        password:string

    )=>Promise<boolean>;



    onRegister:()=>void;


}



function LoginModal({

    onLogin,

    onRegister

}:LoginModalProps){



    const [username,setUsername] = useState("");

    const [password,setPassword] = useState("");



    const [error,setError] = useState("");

    const [loading,setLoading] = useState(false);








    async function handleLogin(){



        setError("");



        if(!username || !password){


            setError(
                "Enter username and password"
            );


            return;

        }





        setLoading(true);





        const success = await onLogin(

            username,

            password

        );





        setLoading(false);





        if(!success){


            setError(

                "Incorrect username or password"

            );


        }



    }








    return(


        <div className="auth-screen">



            <div className="auth-card">





                <h2>

                    Login

                </h2>





                <input


                    type="text"

                    placeholder="Username"


                    value={username}



                    onChange={(e)=>

                        setUsername(

                            e.target.value

                        )

                    }


                />







                <input


                    type="password"

                    placeholder="Password"



                    value={password}



                    onChange={(e)=>

                        setPassword(

                            e.target.value

                        )

                    }


                />







                {
                    error &&


                    <div className="auth-error">

                        {error}

                    </div>

                }








                <button


                    onClick={handleLogin}



                    disabled={loading}


                >

                    {
                        loading

                        ?

                        "Checking..."

                        :

                        "Login"

                    }


                </button>








                <div className="auth-footer">



                    No account?



                    <button


                        className="link-btn"


                        onClick={onRegister}


                    >

                        Register

                    </button>



                </div>






            </div>


        </div>


    )

}



export default LoginModal;