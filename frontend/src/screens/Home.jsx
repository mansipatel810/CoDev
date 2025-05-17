import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../context/user.context'
import axios from "../config/axios"
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const { user,setUser } = useContext(UserContext)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [projectName, setProjectName] = useState(null)
    const [project, setProject] = useState([])
    const [activeModal, setActiveModal] = useState(null)

    const navigate = useNavigate()

    useEffect(() => {
    axios.get('/api/auth/current-user', { withCredentials: true })
        .then(res => {
            console.log(res, "hello");
            setUser(res.data.data); // or res.data.user if your backend sends that
        })
        .catch(() => {
            navigate('/login');
        });
}, []);


    function createProject(e) {
        e.preventDefault()
        axios.post('/api/project/create-project', {
            name: projectName,
        })
            .then((res) => {
                setIsModalOpen(false)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    useEffect(() => {
        axios.get('/api/project/get-all-projects')
            .then((res) => {
                setProject(res.data.data)
            }).catch(err => {
                console.log(err)
            })
    }, [])

   if (user === null) {
    return <div className="text-white text-center mt-20">Checking authentication...</div>;
}

    function handleLogout() {
    axios.get('/api/auth/logout', { withCredentials: true })
        .then(() => {
            setUser(null)
            navigate('/login')
        })
        .catch((error) => {
            console.error("Logout failed:", error)
        })
}


    return (
        <main className="min-h-screen bg-[#0e0e10] text-white px-8 py-12">
            <header className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="CodevAi Logo" className="w-8 h-8" />
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">CodevAi</h1>
                </div>
                <nav className="flex gap-4">
                    <button onClick={() => setActiveModal('about')} className="border-gradient  text-white font-medium transition hover:scale-105">About</button>
                    <button onClick={() => setActiveModal('connect')} className="border-gradient  text-white font-medium transition hover:scale-105">Connect With Us</button>
                    <button onClick={() => setActiveModal('how')} className="border-gradient  text-white font-medium transition hover:scale-105">How it Works</button>
                        <button onClick={handleLogout} className="border-gradient text-white font-medium transition hover:scale-105">Logout</button>

                </nav>
            </header>

            <div className='m-12 mt-30'>
                <section className="flex flex-col md:flex-row items-center justify-between gap-10 ">
                    <div className="max-w-xl">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text mb-4">
                            Revolutionize the Way You Code, Together.
                        </h1>
                        <p className="text-gray-400 text-lg mb-6">
                            CoDev AI combines the power of real-time collaboration with intelligent code assistance to help teams build faster, better, and smarter. Collaborate with your teammates, receive instant AI-powered code suggestions, and see your changes reflected live. It's more than coding — it’s a co-creation experience for modern developers.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white font-semibold hover:scale-105 transition-transform mt-10"
                        >
                            + Create New Project
                        </button>
                    </div>

                    <div className='right flex flex-col justify-center items-center gap-8'> 
                        <button
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white font-semibold hover:scale-105 transition-transform "
                        >
                            Your Projects
                        </button>
                    <div className="flex  flex-wrap gap-4 justify-center">
                        
                        {
                            project.length > 0 ? (
                                project.map((project) => (
                                    <div key={project._id}
                                        onClick={() => navigate(`/project`, { state: { project } })}
                                        className="bg-[#1e1e22] rounded-xl p-5 w-64 shadow-md cursor-pointer hover:shadow-lg hover:bg-[#2b2b30] transition duration-200 capitalize">
                                        <h2 className='text-xl font-semibold mb-2'>{project.name}</h2>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <i className="ri-user-line"></i>
                                            <span>{project.users.length} Collaborators</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400">No projects found. Create your first project to get started!</p>
                            )
                        }
                    </div>
                    </div>
                </section>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
                    <div className="h-[30%]  bg-white/10 border border-white/20 text-white p-8 rounded-xl w-[90%] md:w-[600px] shadow-xl ring-1 ring-white/10">
                        <h2 className="text-2xl text-white mb-4">Create New Project</h2>
                        <form onSubmit={createProject}>
                            <label className="block text-gray-300 mb-2">Project Name</label>
                            <input
                                onChange={(e) => setProjectName(e.target.value)}
                                value={projectName}
                                type="text"
                                className="w-full px-4 py-2 mb-4 rounded-md bg-[#2b2b30] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" className="px-4 py-2 bg-gray-600 rounded-md text-white" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
    <div className=" bg-white/10 border border-white/20 text-white p-8 rounded-xl w-[90%] md:w-[600px] shadow-xl ring-1 ring-white/10">
      <h2 className="text-2xl font-bold mb-4">
        {activeModal === 'about' && 'About CodevAI'}
        {activeModal === 'connect' && 'Connect With Us'}
        {activeModal === 'how' && 'How CodevAI Works'}
      </h2>
      <p className="text-gray-300 mb-4">
        {activeModal === 'about' && 'CodevAI helps you collaborate in real-time with AI-powered code generation and team sync.'}
        {activeModal === 'connect' && (
  <>
    We’d love to hear your suggestions, feedback, or questions! Reach out anytime at{' '}
    <a
      href="mailto:mpmansipatel39@gmail.com"
      className="text-blue-400 underline hover:text-blue-600"
    >
      mpmansipatel39@gmail.com
    </a>
    — your input helps us improve!
  </>
)}
        {activeModal === 'how' && (
  <div className="text-white">
    <ol className="list-decimal list-inside space-y-3 text-gray-300">
      <li>
        <strong>Create a Project:</strong> Begin by creating a new project on CodevAI, your collaborative coding workspace.
      </li>
      <li>
        <strong>Add Collaborators:</strong> Invite your team members to join the project so you can code together seamlessly.
      </li>
      <li>
        <strong>Use the <code>@ai</code> Chat Command:</strong> Within the project chat, simply type <code>@ai</code> followed by your request or coding question. The AI instantly generates relevant code snippets, suggestions, or solutions directly in the chat — helping you code faster and smarter.
      </li>
      <li>
        <strong>Real-Time Collaboration:</strong> All collaborators see chat messages and code suggestions live, making teamwork smooth and efficient.
      </li>
      <li>
        <strong>Edit and Integrate AI-Generated Code:</strong> You can easily edit or integrate the AI-generated code snippets into your project files, enhancing productivity.
      </li>
      <li>
        <strong>Track Changes and Manage Versions:</strong> Monitor project changes and maintain version control to keep your work organized.
      </li>
    </ol>
  </div>
)}

      </p>
      <button
        onClick={() => setActiveModal(null)}
        className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white font-semibold"
      >
        Close
      </button>
    </div>
  </div>
)}

        </main>
    )
}

export default Home
