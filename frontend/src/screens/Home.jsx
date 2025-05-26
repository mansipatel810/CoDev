import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../context/user.context'
import axios from "../config/axios"
import { useNavigate } from 'react-router-dom'

const svgBackground = `url("data:image/svg+xml,%3Csvg%20width='1512'%20height='6397'%20viewBox='0%200%201512%206397'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient%20id='grad1'%20x1='0'%20y1='0'%20x2='1'%20y2='1'%3E%3Cstop%20offset='0%25'%20stop-color='%23c084fc'/%3E%3Cstop%20offset='100%25'%20stop-color='%2360a5fa'/%3E%3C/linearGradient%3E%3Cfilter%20id='filter0_f_243_2'%20x='239.258'%20y='-551.062'%20width='1028.33'%20height='917.31'%20filterUnits='userSpaceOnUse'%20color-interpolation-filters='sRGB'%3E%3CfeFlood%20flood-opacity='0'%20result='BackgroundImageFix'/%3E%3CfeBlend%20mode='normal'%20in='SourceGraphic'%20in2='BackgroundImageFix'%20result='shape'/%3E%3CfeGaussianBlur%20stdDeviation='72'%20result='effect1_foregroundBlur_243_2'/%3E%3C/filter%3E%3Cfilter%20id='filter1_f_243_2'%20x='-774'%20y='2387'%20width='1578'%20height='1578'%20filterUnits='userSpaceOnUse'%20color-interpolation-filters='sRGB'%3E%3CfeFlood%20flood-opacity='0'%20result='BackgroundImageFix'/%3E%3CfeBlend%20mode='normal'%20in='SourceGraphic'%20in2='BackgroundImageFix'%20result='shape'/%3E%3CfeGaussianBlur%20stdDeviation='302'%20result='effect1_foregroundBlur_243_2'/%3E%3C/filter%3E%3Cfilter%20id='filter2_f_243_2'%20x='967'%20y='532'%20width='616'%20height='616'%20filterUnits='userSpaceOnUse'%20color-interpolation-filters='sRGB'%3E%3CfeFlood%20flood-opacity='0'%20result='BackgroundImageFix'/%3E%3CfeBlend%20mode='normal'%20in='SourceGraphic'%20in2='BackgroundImageFix'%20result='shape'/%3E%3CfeGaussianBlur%20stdDeviation='122'%20result='effect1_foregroundBlur_243_2'/%3E%3C/filter%3E%3CclipPath%20id='clip0_243_2'%3E%3Crect%20width='1512'%20height='6397'%20fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3Cg%20clip-path='url(%23clip0_243_2)'%3E%3Crect%20width='1512'%20height='6397'%20fill='%230c0c0c'/%3E%3Cg%20opacity='0.4'%20filter='url(%23filter0_f_243_2)'%3E%3Cpath%20d='M387.38%20137.553C355.297%20-107.774%20513.625%20-371.892%20752.935%20-403.188C992.246%20-434.485%201087.35%20-273.117%201119.44%20-27.7906C1151.52%20217.536%20993.208%20-36.6224%20796.88%20-10.947C557.569%2020.3495%20419.463%20382.88%20387.38%20137.553Z'%20fill='url(%23grad1)'/%3E%3C/g%3E%3Cg%20filter='url(%23filter1_f_243_2)'%3E%3Ccircle%20cx='15'%20cy='3176'%20r='185'%20fill='url(%23grad1)'/%3E%3C/g%3E%3Cg%20filter='url(%23filter2_f_243_2)'%3E%3Ccircle%20cx='1275'%20cy='840'%20r='64'%20fill='url(%23grad1)'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

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
                console.log("project",res.data.data);
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
        <main className="min-h-screen bg-[#0e0e10] text-white px-8 py-6 " 
        style={{
      backgroundImage: svgBackground,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
    //   backgroundPosition: 'center',
    }}
        >
            <header className="flex items-center justify-between ">
                <div className="flex items-center justify-center ">
                    <img src="/logo1_gradient.png" alt="CodevAi Logo" className="w-[10vh] h-[10vh]" />
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">CodevAi</h1>
                </div>
                <nav className="flex gap-4">
                    <button onClick={() => setActiveModal('about')} className="border-gradient  text-white font-medium transition hover:scale-105">About</button>
                    <button onClick={() => setActiveModal('connect')} className="border-gradient  text-white font-medium transition hover:scale-105">Connect With Us</button>
                    <button onClick={() => setActiveModal('how')} className="border-gradient  text-white font-medium transition hover:scale-105">How it Works</button>
                        <button onClick={handleLogout} className="border-gradient text-white font-medium transition hover:scale-105">Logout</button>

                </nav>
            </header>

            <div className='m-12 mt-30'>
                <section className="flex flex-col h-[50vh] md:flex-row items-center justify-between gap-10 ">
                    <div className="max-w-xl">
                        <h1 className="text-3xl md:text-5xl font-[Helvetica,Arial,sans-serif]  font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text mb-4">
                            Revolutionize the Way You Code, Together.
                        </h1>
                        <p className="text-gray-400 text-lg ">
                            CoDev AI combines the power of real-time collaboration with intelligent code assistance to help teams build faster, better, and smarter. Collaborate with your teammates, receive instant AI-powered code suggestions, and see your changes reflected live. It's more than coding — it’s a co-creation experience for modern developers.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-3  bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white font-semibold hover:scale-105 transition-transform mt-10"
                        >
                            + Create New Project
                        </button>
                    </div>

                    <div className='right flex flex-col h-full justify-start items-center gap-8'> 
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
