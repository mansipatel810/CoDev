import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import { UserContext } from '../context/user.context'

const Register = () => {
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { setUser } = useContext(UserContext)
  const navigate = useNavigate()

  const submitHandler = function (e) {
    e.preventDefault()

    axios
      .post('/api/auth/register', {
        userName,
        email,
        password,
      })
      .then((res) => {
        console.log(res.data)
        localStorage.setItem('token', res.data.token)
        setUser(res.data.data)
        navigate('/')
      })
      .catch((err) => {
        console.error(err)
      })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a]">
      <div className="left bg-gradient-to-tr bg-black px-8 py-10 rounded-2xl shadow-2xl w-full max-w-md">
        <div>
          <div className='flex gap-1 items-center justify-center'>
            <img src="/newlogo.png" className='inline-block h-12' alt="" />
          <h2 className="text-3xl font-semibold text-[#24CFA6] ">Welcome to CoDev</h2>
          </div>
          <p className='text-gray-400 text-center mb-8 mt-2'>Innovation starts with your next line of code.</p>
        </div>
        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label htmlFor="userName" className="block text-gray-300 mb-2 font-medium">
              Username
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              placeholder="Enter your username"
              className="w-full p-3 rounded-lg bg-[#1a1a1a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#24CFA6] focus:ring-offset-1 focus:ring-offset-zinc-900 transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-300 mb-2 font-medium">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full p-3 rounded-lg bg-[#1a1a1a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#24CFA6] focus:ring-offset-1 focus:ring-offset-zinc-900 transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-300 mb-2 font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full p-3 rounded-lg bg-[#1a1a1a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#24CFA6] focus:ring-offset-1 focus:ring-offset-zinc-900 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 text-black rounded-full bg-gradient-to-r from-[#148e72] to-[#add3b1]  font-semibold text-lg hover:scale-105 transform transition"
          >
            Register
          </button>
        </form>

        <p className="text-gray-400 mt-6 text-center">
          Have an account?{' '}
          <Link to="/login" className="text-[#24CFA6] hover:text-[#E0F2E2] font-semibold underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
