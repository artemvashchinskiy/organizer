import { useState } from "react";


interface RegisterModalProps {


    onRegister:(

        username:string,

        password:string

    )=>Promise<boolean>;



    onLogin:()=>void;


}






function RegisterModal({

    onRegister,

    onLogin

}:RegisterModalProps){



    const [username,setUsername] = useState("");

    const [password,setPassword] = useState("");

    const [confirmPassword,setConfirmPassword] = useState("");



    const [error,setError] = useState("");

    const [loading,setLoading] = useState(false);








    async function handleRegister(){



        setError("");





        if(!username || !password){


            setError(

                "Enter username and password"

            );


            return;

        }






        if(password.length < 4){


            setError(

                "Password must contain at least 4 characters"

            );


            return;


        }






        if(password !== confirmPassword){


            setError(

                "Passwords do not match"

            );


            return;


        }








        setLoading(true);





        const success = await onRegister(

            username,

            password

        );





        setLoading(false);







        if(!success){


            setError(

                "Username already exists"

            );


        }


    }









    return(



        <div className="auth-screen">





            <div className="auth-card">





                <h2>

                    Create account

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









                <input


                    type="password"


                    placeholder="Repeat password"



                    value={confirmPassword}



                    onChange={(e)=>


                        setConfirmPassword(

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


                    onClick={handleRegister}



                    disabled={loading}


                >


                    {

                        loading

                        ?

                        "Creating..."

                        :

                        "Register"

                    }


                </button>









                <div className="auth-footer">



                    Already have account?




                    <button


                        className="link-btn"



                        onClick={onLogin}



                    >

                        Login

                    </button>




                </div>








            </div>




        </div>


    )

}



export default RegisterModal;