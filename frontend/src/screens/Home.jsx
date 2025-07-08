import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../context/user.context'
import axios from "../config/axios"
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom';

const svgBackground = `url("data:image/svg+xml,%3Csvg width='1512' height='6397' viewBox='0 0 1512 6397' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_243_2)'%3E%3Crect width='1512' height='6397' fill='%230c0c0c' /%3E%3Cg opacity='0.4' filter='url(%23filter0_f_243_2)'%3E%3Cpath d='M387.38 137.553C355.297 -107.774 513.625 -371.892 752.935 -403.188C992.246 -434.485 1087.35 -273.117 1119.44 -27.7906C1151.52 217.536 993.208 -36.6224 796.88 -10.947C557.569 20.3495 419.463 382.88 387.38 137.553Z' fill='%2324cfa7' /%3E%3C/g%3E%3Cg filter='url(%23filter1_f_243_2)'%3E%3Ccircle cx='15' cy='3176' r='185' fill='%2324cfa7' /%3E%3C/g%3E%3Cg filter='url(%23filter2_f_243_2)'%3E%3Ccircle cx='1275' cy='840' r='64' fill='%2324cfa7' /%3E%3C/g%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_f_243_2' x='239.258' y='-551.062' width='1028.33' height='917.31' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix' /%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape' /%3E%3CfeGaussianBlur stdDeviation='72' result='effect1_foregroundBlur_243_2' /%3E%3C/filter%3E%3Cfilter id='filter1_f_243_2' x='-774' y='2387' width='1578' height='1578' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix' /%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape' /%3E%3CfeGaussianBlur stdDeviation='302' result='effect1_foregroundBlur_243_2' /%3E%3C/filter%3E%3Cfilter id='filter2_f_243_2' x='967' y='532' width='616' height='616' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix' /%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape' /%3E%3CfeGaussianBlur stdDeviation='122' result='effect1_foregroundBlur_243_2' /%3E%3C/filter%3E%3CclipPath id='clip0_243_2'%3E%3Crect width='1512' height='6397' fill='white' /%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E")`;

const Home = () => {
    const { user, setUser } = useContext(UserContext)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [projectName, setProjectName] = useState(null)
    const [project, setProject] = useState([])
    const [activeModal, setActiveModal] = useState(null)
    const [navOpen, setNavOpen] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        axios.get('/api/auth/current-user', { withCredentials: true })
            .then(res => {
                // console.log(res, "hello");
                setUser(res.data.data);
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
                // console.log("project", res.data.data);
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
        <main
            className="min-h-screen bg-[#0e0e10] text-white px-4 py-4 md:px-8 md:py-6"
            style={{
                backgroundImage: svgBackground,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundAttachment: 'fixed',
                
            }}
        >
            <header className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 relative">
                <Link  to="/" className="flex items-center justify-center w-full md:w-auto">
                    <img
                        src="/newlogo.png"
                        alt="CoDev Logo"
                        className="w-[8vh] h-[8vh] md:w-[10vh] md:h-[10vh]"
                    />
                    <h1 className="ml-2 text-3xl md:text-5xl font-bold bg-gradient-to-r from-[#24CFA6] to-[#E0F2E2] text-transparent bg-clip-text ">
                        CoDev
                    </h1>
                </Link>
                
                {/* Hamburger Icon for Mobile */}
                <button
                    className="md:hidden absolute right-0 top-2 p-2"
                    onClick={() => setNavOpen(!navOpen)}
                    aria-label="Open navigation menu"
                >
                    <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                {/* Desktop Nav */}
                <nav className="hidden md:flex flex-wrap gap-2 md:gap-4 mt-4 md:mt-0">
                    <button
                        onClick={() => setActiveModal('about')}
                        className="border-gradient text-white font-medium transition hover:scale-105"
                    >
                        About
                    </button>
                    <button
                        onClick={() => setActiveModal('connect')}
                        className="border-gradient text-white font-medium transition hover:scale-105"
                    >
                        Connect With Us
                    </button>
                    <button
                        onClick={() => setActiveModal('how')}
                        className="border-gradient text-white font-medium transition hover:scale-105"
                    >
                        How it Works
                    </button>
                    <button
                        onClick={handleLogout}
                        className="border-gradient text-white font-medium transition hover:scale-105"
                    >
                        Logout
                    </button>
                </nav>
                {/* Mobile Nav Dropdown */}
                {navOpen && (
                    <nav className="md:hidden absolute top-16 right-0 bg-[#18181b] border border-gray-700 rounded-lg shadow-lg flex flex-col gap-2 p-4 z-50 min-w-[180px]">
                        <button
                            onClick={() => { setActiveModal('about'); setNavOpen(false); }}
                            className="border-gradient text-white font-medium transition hover:scale-105 text-left"
                        >
                            About
                        </button>
                        <button
                            onClick={() => { setActiveModal('connect'); setNavOpen(false); }}
                            className="border-gradient text-white font-medium transition hover:scale-105 text-left"
                        >
                            Connect With Us
                        </button>
                        <button
                            onClick={() => { setActiveModal('how'); setNavOpen(false); }}
                            className="border-gradient text-white font-medium transition hover:scale-105 text-left"
                        >
                            How it Works
                        </button>
                        <button
                            onClick={() => { handleLogout(); setNavOpen(false); }}
                            className="border-gradient text-white font-medium transition hover:scale-105 text-left"
                        >
                            Logout
                        </button>
                    </nav>
                )}
            </header>

            <div className="m-4 md:m-12 mt-10">
                <section className="flex flex-col md:flex-row h-auto md:h-[50vh] items-center justify-between gap-8">
                    
                    <div className="max-w-xl w-full">
                            <h1 className="text-2xl md:text-5xl font-[Helvetica,Arial,sans-serif] font-bold bg-gradient-to-r from-[#24CFA6] to-[#E0F2E2] text-transparent bg-clip-text mb-4">
                            Revolutionize the Way You Code, Together.
                        </h1>
                        <p className="text-gray-400 text-base md:text-lg">
                            CoDev combines the power of real-time collaboration with intelligent code assistance to help teams build faster, better, and smarter. Collaborate with your teammates, receive instant AI-powered code suggestions, and see your changes reflected live. It's more than coding — it’s a co-creation experience for modern developers.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="border-gradient px-4 md:px-6 py-2 md:py-3  rounded-full text-white font-semibold hover:scale-105 transition-transform mt-6 md:mt-10 w-full md:w-auto"
                        >
                            + Create New Project
                        </button>
                    </div>

                    <div className="right flex flex-col h-full justify-start items-center gap-6 md:gap-8 w-full md:w-auto">
                        <button
                            className="border-gradient px-4 md:px-6 py-2 md:py-3  rounded-full text-white font-semibold hover:scale-105 transition-transform w-full md:w-auto"
                        >
                            Your Projects
                        </button>
                        <div className="flex flex-wrap gap-4 justify-center w-full">
                            {project.length > 0 ? (
                                project.map((project) => (
                                    <div
                                        key={project._id}
                                        onClick={() => navigate(`/project`, { state: { project } })}
                                        className="bg-[#132b25] rounded-xl p-4 md:p-5 w-full sm:w-64 shadow-md cursor-pointer hover:shadow-lg hover:bg-[#14473B] transition duration-200 capitalize"
                                    >
                                        <h2 className="text-lg md:text-xl font-semibold mb-2">{project.name}</h2>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <i className="ri-user-line"></i>
                                            <span>{project.users.length} Collaborators</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400">No projects found. Create your first project to get started!</p>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
                    <div className="max-h-[90vh] overflow-y-auto bg-white/10 border border-white/20 text-white p-4 md:p-8 rounded-xl w-[95%] sm:w-[90%] md:w-[600px] shadow-xl ring-1 ring-white/10">
                        <h2 className="text-xl md:text-2xl text-white mb-4">Create New Project</h2>
                        <form onSubmit={createProject}>
                            <label className="block text-gray-300 mb-2">Project Name</label>
                            <input
                                onChange={(e) => setProjectName(e.target.value)}
                                value={projectName}
                                type="text"
                                className="w-full px-4 py-2 mb-4 rounded-md bg-[#2b2b30] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#24CFA6]"
                                required
                            />
                            <div className="flex flex-col md:flex-row justify-end gap-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-600 rounded-full text-white hover:scale-110 active:scale-95"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="border-gradient px-4 py-2 bg-gradient-to-r text-white rounded-md"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
                    <div className="max-h-[90vh] overflow-y-auto bg-white/10 border border-white/20 text-white p-4 md:p-8 rounded-xl w-[95%] sm:w-[90%] md:w-[600px] shadow-xl ring-1 ring-white/10">
                        <h2 className="text-xl md:text-2xl font-bold mb-4">
                            {activeModal === 'about' && 'About CoDev'}
                            {activeModal === 'connect' && 'Connect With Us'}
                            {activeModal === 'how' && 'How CoDev Works'}
                        </h2>
                        <p className="text-gray-300 mb-4">
                            {activeModal === 'about' &&
                                'CoDev helps you collaborate in real-time with AI-powered code generation and team sync.'}
                            {activeModal === 'connect' && (
                                <>
                                    We’d love to hear your suggestions, feedback, or questions! Reach out anytime at{' '}
                                    <a
                                        href="mailto:mpmansipatel39@gmail.com"
                                        className="text-[#24CFA6] underline hover:text-[#E0F2E2]"
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
                                            <strong>Create a Project:</strong> Begin by creating a new project on CoDev, your collaborative coding workspace.
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
                            className="border-gradient mt-4 px-4 py-2 bg-gradient-to-r  rounded-full text-white font-semibold"
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
