import React, { useState ,useContext} from 'react'
import { Link , useNavigate} from 'react-router-dom'
import axios from '../config/axios'
import { UserContext } from '../context/user.context'

const Login = () => {
    
    
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();

    const {setUser}=useContext(UserContext)

    const navigate=useNavigate()

    const submitHandler=function(e){
        e.preventDefault();
        axios.post('/api/auth/login',{
            email,
            password
        }).then((res)=>{
            console.log(res.data)

            localStorage.setItem('token',res.data.token);
            setUser(res.data.data)

            navigate('/')
        }).catch((err)=>{
            console.log(err)
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-900">
            <div className="bg-zinc-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-6">Login</h2>
                <form onSubmit={submitHandler}>
                    <div className="mb-4">
                        <label className="block text-zinc-400 mb-2" htmlFor="email">Email</label>
                        <input
                        onChange={(e)=>
                            setEmail(e.target.value)
                        }
                            className="w-full p-3 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-zinc-400 mb-2" htmlFor="password">Password</label>
                        <input
                        onChange={(e)=>
                            setPassword(e.target.value)
                        }
                            type="password"
                            id="password"
                            className="w-full p-3 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full p-3 rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Login
                    </button>
                </form>
                <p className="text-zinc-400 mt-4">
                    Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Create one</Link>
                </p>
            </div>
        </div>
    )
}

export default Login
