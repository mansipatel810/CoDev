import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
import { Link, useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js';
import { getWebContainer } from '../config/webContainer'
import { useNavigate } from "react-router-dom";
import expressStaticTemplate from '../utils/expressStaticTemplate';
import { getFileIcon, getFolderIcon } from '../utils/functions';
import Editor from "@monaco-editor/react";


function SyntaxHighlightedCode(props) {
  const ref = useRef(null)

  React.useEffect(() => {
    const className = props.className || '';
    if (ref.current && className.includes('lang-')) {
      hljs.highlightElement(ref.current);
      ref.current.removeAttribute('data-highlighted');
    }
  }, [props.className, props.children])

  return <code {...props} ref={ref} />
}


const Project = () => {
  const location = useLocation()

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(new Set())
  const [project, setProject] = useState(location.state.project)
  const [message, setMessage] = useState('')
  const { user } = useContext(UserContext)
  const messageBox = React.createRef()
  const navigate = useNavigate();


  const [users, setUsers] = useState([])
  const [projectUsers, setProjectUsers] = useState([]);
  const [messages, setMessages] = useState([])
  const [fileTree, setFileTree] = useState({})

  const [currentFile, setCurrentFile] = useState(null)
  const [openFiles, setOpenFiles] = useState([])

  const [webContainer, setWebContainer] = useState(null)
  const [iframeUrl, setIframeUrl] = useState(null)

  const [runProcess, setRunProcess] = useState(null)

  const handleUserClick = (id) => {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId)
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id)
      } else {
        newSelectedUserId.add(id)
      }

      return newSelectedUserId
    })
  }

  function addCollaborators() {
    axios
      .put('/api/project/add-user', {
        projectId: location.state.project._id,
        users: Array.from(selectedUserId),
      })
      .then((res) => {
        // console.log(res.data)
        setIsModalOpen(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const send = () => {
    // console.log("sender hai ye", user)

    sendMessage('project-message', {
      message,
      sender: user
    })
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: user, message },
    ])
    // console.log({sender:user,message})
    setMessage('')
  }

  const deleteUserFromProject = (userId, projectId) => {
    const confirmed = window.confirm('Do you really want to delete this user?');
    // console.log(confirmed)
    // console.log(user)
    if (confirmed) {
      if (project.users.length == 1) {
        const secondConfirmation = window.confirm("project will be deleted");
        if (secondConfirmation) {
          axios
            .delete(`/api/project/delete-user/${userId}/${projectId}/${user._id}`)
            .then((res) => {
              // console.log("User deleted successfully:", res.data);
              // Update local stat
              setProjectUsers((prevUsers) =>
                prevUsers.filter((user) => user._id !== userId)
              );

              if (res.data.data.users.length === 0) {
                axios
                  .delete(`/api/project/delete-project/${projectId}`)
                  .then(() => {
                    // console.log("Project deleted as no users remain.");
                    setProject(null);
                    navigate('/');

                    if (window.socket) {
                      window.socket.emit('leave-project-room', projectId);
                    }
                  })
                  .catch((err) => {
                    console.error("Error deleting project:", err);
                  });
              }
            })
            .catch((err) => {
              alert("Only admin can delete the user");
              console.error("Error deleting user:", err);
            });
        }
      }
      else {
        axios
          .delete(`/api/project/delete-user/${userId}/${projectId}/${user._id}`)
          .then((res) => {
            // console.log("User deleted successfully:", res.data);

            // Update local stat
            setProjectUsers((prevUsers) =>
              prevUsers.filter((user) => user._id !== userId)
            );
          })
          .catch((err) => {
            alert("Only admin can delete the user");
            console.error("Error deleting user:", err);
          });
      }
    } else {
      // console.log("User cancelled delete");
    }
  };





  function WriteAiMessage(message) {

    const messageObject = JSON.parse(message)

    return (
      <div
        className='overflow-auto bg-slate-950 text-white rounded-sm p-2'
      >
        <Markdown
          children={messageObject.text}
          options={{
            overrides: {
              code: SyntaxHighlightedCode,
            },
          }}
        />
      </div>)
  }



  useEffect(() => {

    initializeSocket(project._id)

    if (!webContainer) {
      getWebContainer().then(container => {
        setWebContainer(container)
        console.log("container started")
      })
    }

    

    axios
      .get(`/api/messages/project/${location.state.project._id}`)
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data)) {
          setMessages(res.data.data.map(msg => ({
            sender: msg.sender,
            message: msg.message
          })));
        } else {
          console.error('Invalid response format:', res.data);
          setMessages([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching messages:', err);
        setMessages([]);
      });


    receiveMessage('project-message', data => {


      if (data.sender._id == 'ai') {

        // console.log(JSON.parse(data.message))
        const message = JSON.parse(data.message)

        webContainer?.mount(message.fileTree)

        if (message.fileTree) {
          setFileTree(message.fileTree || {})
          saveFileTree(message.fileTree)
        }
        setMessages(prevMessages => [...prevMessages, data])
      } else {
        console.log("data", data)
        setMessages(prevMessages => [...prevMessages, data])
      }
    })

    axios
      .get(`/api/project/get-project/${location.state.project._id}`)
      .then((res) => {

        const projectData = res.data.data;
        setProject(projectData);
        // console.log("project data",projectData)
        setProjectUsers(projectData.users)
        setFileTree(projectData.fileTree || {});
      })
      .catch((err) => {
        console.error('Error fetching project:', err);
      });

    axios
      .get('/api/auth/get-all-users')
      .then((res) => {
        // console.log("ye user hair",res.data.data)
        setUsers(res.data.data)
      })
      .catch((err) => {
        console.error('Error fetching users:', err);
      });
  }, []);


  function saveFileTree(ft) {
    axios.put('api/project/update-file-tree', {
      projectId: project._id,
      fileTree: ft
    }).then(res => {
      // console.log(res.data)
    }).catch(err => {
      console.log(err)
    })
  }

  const leaveProject = function (projectId) {
    const confirmed = window.confirm("Are you sure you want to leave the project?");
    if (!confirmed) return;

    axios
      .get(`/api/project/leave-project/${projectId}`)
      .then((res) => {
        const usersLeft = res.data.data.users.length;

        if (usersLeft === 0) {
          axios
            .delete(`/api/project/delete-project/${projectId}`)
            .then(() => {
              // console.log("Project deleted as no users remain.");
              setProject(null);
              navigate('/');

              if (window.socket) {
                window.socket.emit('leave-project-room', projectId);
              }
            })
            .catch((err) => {
              console.error("Error deleting project:", err);
            });
        } else {
          setProject(res.data.data);
          navigate('/');
        }
      })
      .catch((err) => {
        console.error("Can't leave the group", err);
        alert("Only valid project members can leave.");
      });
  };


  function FileTree({ tree, parentPath = "" }) {
    const [openFolders, setOpenFolders] = useState({});

    const toggleFolder = (folder) => {
      setOpenFolders((prev) => ({
        ...prev,
        [folder]: !prev[folder],
      }));
    };

    return (
      <div className="flex flex-col gap-[2px]">
        {Object.keys(tree).map((key, idx) => {
          const node = tree[key];
          if (!node) return null;
          const isFile = node?.file && typeof node.file.contents === "string";
          const isFolder = !isFile && typeof node === "object";
          const fullPath = parentPath ? `${parentPath}/${key}` : key;

          return (
            <div key={fullPath}>
              <div
                className=" tree-element cursor-pointer hover:scale-105 py-2 flex justify-between items-center gap-2 bg-[#0e0e10] border-2 border-zinc-400 rounded-xl w-[95%] mx-auto text-white"
                onClick={() => {
                  if (isFile) {
                    setCurrentFile(fullPath);
                    setOpenFiles((prev) => [...new Set([...prev, fullPath])]);
                  } else if (isFolder) {
                    toggleFolder(fullPath);
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ marginLeft: 8 }}>
                    {isFile ? (
                      getFileIcon(key)
                    ) : (
                      getFolderIcon(key, openFolders[fullPath])
                    )}
                  </span>
                  <p className="text-lg font-medium flex items-center">
                    {key}
                  </p>
                  {isFolder && (
                    <button
                      className="text-lg text-gray-400 hover:text-white overflow-scroll-hidden "

                      title="Add file"
                      onClick={e => {
                        e.stopPropagation();
                        const newFileName = prompt("Enter new file name:");
                        if (newFileName) {
                          if (node.hasOwnProperty(newFileName)) {
                            alert("File already exists!");
                            return prev;
                          }
                          setFileTree(prev => {
                            const parts = fullPath.split('/');
                            const newTree = { ...prev };
                            let node = newTree;
                            for (let i = 0; i < parts.length; i++) {
                              node[parts[i]] = { ...node[parts[i]] };
                              node = node[parts[i]];
                            }
                            node[newFileName] = { file: { contents: "" } };
                            saveFileTree(newTree);
                            return newTree;
                          });
                        }
                      }}
                    >
                      <i className="ri-file-add-line"></i>
                    </button>
                  )}
                </div>
                <i
                  className="ri-delete-bin-line text-red-700 mr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    const updatedTree = { ...tree };
                    delete updatedTree[key];
                    setFileTree((prev) => {
                      setOpenFiles((files) =>
                        files.filter((f) => !f.startsWith(fullPath))
                      );
                      if (currentFile && currentFile.startsWith(fullPath)) {
                        setCurrentFile(null);
                      }
                      const parts = fullPath.split('/');
                      const newTree = { ...prev };
                      let node = newTree;
                      for (let i = 0; i < parts.length - 1; i++) {
                        node[parts[i]] = { ...node[parts[i]] };
                        node = node[parts[i]];
                      }
                      delete node[parts[parts.length - 1]];
                      return newTree;
                    });
                    saveFileTree(updatedTree);
                  }}
                  style={{ cursor: "pointer" }}
                ></i>
              </div>
              {isFolder && openFolders[fullPath] && (
                <div className="ml-4">
                  <FileTree tree={node} parentPath={fullPath} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  function getFileByPath(tree, path) {
    if (!path) return null; // <-- Prevents error when currentFile is null/undefined
    const parts = path.split('/');
    let node = tree;
    for (let part of parts) {
      if (!node[part]) return null;
      node = node[part];
    }
    return node;
  }

  useEffect(() => {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight;
    }
  }, [messages]); // This will run whenever messages change




  return (
    <main className="h-screen w-screen flex bg-[#0e0e10]  md:flex-row flex-col relative">

      <section className="left relative flex flex-col h-screen min-w-96 bg-slate-300  ">
        <header className="flex justify-between items-center p-2 px-4 w-full bg-gradient-to-r from-[#24CFA6] to-[#E0F2E2] text-transparent bg-clip-text font-medium absolute z-10 top-0 bg-[#2B2B30]">
          <div className='flex items-center gap-1'>
            <Link to="/">
              <i className="ri-home-8-line text-3xl text-transparent bg-clip-text bg-gradient-to-r from-[#24CFA6] to-[#E0F2E2]"></i>
            </Link>
            <Link to={`/project`} state={{ project: project }} className="text-3xl capitalize text-transparent bg-clip-text bg-gradient-to-r from-[#24CFA6] to-[#E0F2E2]">
              {project.name}
            </Link>
          </div>
          <div className='flex justify-center items-center gap-4'>

            <button
              className="relative flex items-center group"
              onClick={() => setIsModalOpen(true)}
            >
              <i className="ri-add-fill cursor-pointer text-3xl text-transparent bg-clip-text bg-gradient-to-r from-[#24CFA6] to-[#E0F2E2]"></i>

              <span
                className="absolute  top-8  -translate-x-1/2 whitespace-nowrap
      rounded bg-black px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100
      pointer-events-none transition-opacity duration-300 select-none"
              >
                Add Collaborators
              </span>
            </button>

            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="relative group p-2"
            >
              <i className="ri-group-fill cursor-pointer text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#24CFA6] to-[#E0F2E2]"></i>

              <span
                className="absolute top-8 left-1/2  -translate-x-1/2 whitespace-nowrap
      rounded bg-black px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100
      pointer-events-none transition-opacity duration-300 select-none"
              >
                Collaborators
              </span>
            </button>

          </div>
        </header>

        <div className="conversation-area pt-14 pb-10 bg-[#0e0e10] flex-grow flex flex-col w-full h-full relative">
          <div
            className="relative w-[95%] h-[97%] mx-auto  rounded-xl"
            style={{
              backgroundImage: "url('/public/newlogo.png')",
              backgroundRepeat: 'no-repeat',
              backgroundSize: '50vh',
              backgroundPosition: 'center'
            }}
          >
            <div
              ref={messageBox}
              className="message-box flex-grow flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide
               bg-white/10 backdrop-blur-md border border-white/30 rounded-xl shadow-lg pt-2 m-4 w-full h-full mx-auto my-auto"
            >

              {messages.map((msg, index) => {
                // console.log(msg)
                // console.log(user)
                const senderId = msg.sender?.email;
                const currentUserId = user?.email;
                // console.log('Rendering message:', { senderId, currentUserId, message: msg.message });

                const isCurrentUser = senderId === currentUserId;

                return (
                  <div key={index} className={`${msg.sender._id === 'ai' ? 'max-w-80' : 'max-w-52'} ${msg.sender._id == user._id.toString() && 'ml-auto'}  message flex flex-col text-white p-2 bg-[#0e0e10] w-fit rounded-md`}>
                    <small className='opacity-65 text-xs'>{msg.sender.userName == user.userName ? <span></span> : <span>{msg.sender.userName}</span>}</small>
                    <div className='text-sm'>
                      {msg.sender._id === 'ai' ?
                        WriteAiMessage(msg.message)
                        : <p>{msg.message}</p>}
                    </div>
                  </div>
                );
              })}



            </div>
          </div>



          <div className="inputField w-full flex absolute bg-[#0e0e10] bottom-0 mb-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="p-2 px-4 text-white bg-[#2B2B30]  ml-4 mr-1 rounded-xl  outline-none flex-grow"
              type="text"
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder="Enter message"
            />
            <button
              onClick={send}
              className="px-4 mr-1 rounded-4xl h-[5vh] w-[5vh] flex justify-center items-center bg-gradient-to-r from-[#24CFA6] to-[#E0F2E2] text-black hover:scale-110"
            >
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>
        <div
          className={`sidePanel w-full h-full flex flex-col z-10000 gap-2 bg-[#0e0e10] text-white absolute transition-all ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'
            } top-0`}
        >
          <header className="flex justify-between items-center px-4 p-2 ">
            <h1 className="font-semibold text-2xl ">
              Collaborators
            </h1>

            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="p-2 cursor-pointer"
            >
              <i className="ri-close-fill text-3xl"></i>
            </button>
          </header>

          <div className='flex items-center ml-4 text-red-700 gap-2 '>
            <button onClick={() => {
              leaveProject(project._id)
            }} className='flex items-center ml-4 text-red-700 gap-2 cursor-pointer'>
              <i className="ri-picture-in-picture-exit-line"></i>
              <h1>leave the project</h1>
            </button>
          </div>

          <div className="users flex flex-col gap-2 ">
            {projectUsers &&
              projectUsers.map((user) => {
                return (
                  <div className="group p-[2px] rounded-md bg-transparent hover:bg-gradient-to-r from-[#24CFA6] to-[#E0F2E2] transition-all duration-300">
                    <div className="flex gap-2 items-center p-2 rounded-md bg-[#0e0e10]">
                      <div className="aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600">
                        <i className="ri-user-fill absolute"></i>
                      </div>
                      <div className="flex w-full justify-between items-center">
                        <div className='flex flex-col justify-center'>
                          <h1 className="font-semibold text-lg">{user.userName}</h1>
                          {project.admin === user._id && (
                            <h1 className="text-sm font-medium text-green-500">Leader</h1>
                          )}
                        </div>
                        <button onClick={() => deleteUserFromProject(user._id, project._id)}>
                          <i className="ri-delete-bin-line text-red-700 cursor-pointer"></i>
                        </button>

                      </div>
                    </div>
                  </div>

                )
              })}
          </div>

        </div>
      </section>

      <section className="right bg-#2B2B30 flex-grow h-full flex border-2 border-zinc-500 md:flex-row flex-col overflow-x-auto">
        <div className="explorer h-full max-w-64 min-w-52 bg-[#474B53] border-r-2 border-zinc-500 flex-shrink-0">
          <div className="flex items-center p-2 bg-[#0e0e10] ">
            <div className="flex items-center justify-between w-full">

              <h1 className="font-semibold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#24CFA6] to-[#E0F2E2]">Explorer</h1>

              <div className='  flex items-end gap-1 '>
                <button onClick={() => {
                  const newFileName = prompt("Enter new file name:");
                  if (newFileName) {
                    if (fileTree.hasOwnProperty(newFileName)) {
                      alert("File already exists!");
                      return;
                    }
                    let updatedFileTree = {
                      ...fileTree,
                      [newFileName]: {
                        file: {
                          contents: ""
                        }
                      }
                    };

                    if (newFileName.endsWith('.html')) {
                      updatedFileTree["server.js"] = {
                        file: {
                          contents: expressStaticTemplate(newFileName)
                        }
                      };
                      updatedFileTree["package.json"] = {
                        file: {
                          contents: JSON.stringify({
                            name: "my-app",
                            version: "1.0.0",
                            main: "server.js",
                            scripts: {
                              start: "node server.js"
                            },
                            dependencies: {
                              express: "^4.18.2"
                            }
                          }, null, 2)
                        }
                      };
                    } else if (!updatedFileTree["package.json"]) {
                      // fallback for non-html files
                      updatedFileTree["package.json"] = {
                        file: {
                          contents: JSON.stringify({
                            name: "my-app",
                            version: "1.0.0",
                            main: newFileName,
                            scripts: {
                              start: "node " + newFileName
                            },
                            dependencies: {
                              express: "^4.18.2"
                            }
                          }, null, 2)
                        }
                      };
                    }

                    setFileTree(updatedFileTree);
                    saveFileTree(updatedFileTree);
                  }
                }}
                  className="relative group">
                  <i className="ri-file-add-line cursor-pointer  hover:text-white text-transparent bg-clip-text bg-gradient-to-r from-[#24CFA6] to-[#E0F2E2] text-3xl "></i>
                  <span
                    className="absolute left-1/2  top-10 -translate-x-1/2 whitespace-nowrap
      rounded bg-zinc-900 px-2 py-1 text-sm text-white opacity-0 group-hover:opacity-100
      pointer-events-none transition-opacity duration-300 select-none z-50"
                  >
                    New File
                  </span>
                </button>

                <button onClick={() => {
                  const newFolderName = prompt("Enter new folder name:");
                  if (newFolderName) {
                    if (fileTree.hasOwnProperty(newFolderName)) {
                      alert("Folder already exists!");
                      return;
                    }
                    let updatedFileTree = {
                      ...fileTree,
                      [newFolderName]: {
                        file: null // Indicating it's a folder
                      }
                    };
                    setFileTree(updatedFileTree);
                    saveFileTree(updatedFileTree);
                  }
                }} className="relative group">
                  <i className="ri-folder-add-line cursor-pointer hover:text-white text-transparent bg-clip-text bg-gradient-to-r from-[#24CFA6] to-[#E0F2E2] text-3xl"></i>
                  <span
                    className="absolute left-1/2  top-10 -translate-x-1/2 whitespace-nowrap
      rounded bg-zinc-900 px-2 py-1 text-sm text-white opacity-0 group-hover:opacity-100
      pointer-events-none transition-opacity duration-300 select-none z-50"
                  >
                    New Folder
                  </span>
                </button>
              </div>


            </div>


          </div>
          <div className="file-tree w-full flex flex-col gap-[2px] mt-1">
            <FileTree tree={fileTree} />
          </div>
        </div>

        <div className="code-editor flex flex-col flex-grow h-full shrink-0 bg-[#0e0e10] border-r-2 border-zinc-500 min-w-[500px]">
          <div className="top flex justify-between w-full">
            <div className="files flex gap-[2px] m-1">
              {
                openFiles.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFile(file)}
                    className={`open-file cursor-pointer hover:bg-zinc-600 p-2 px-2 text-xl  flex items-center w-fit gap-2 text-white  border-[1px] border-zinc-600  rounded-[2px] ${currentFile === file ? ' bg-[#6e6f72]' : ''}`}>
                    <p
                      className='font-semibold text-lg'
                    >{file}</p>
                    <i
                      className="ri-close-line text-transparent bg-clip-text bg-gradient-to-r from-[#24CFA6] to-[#E0F2E2] text-xl"
                      onClick={e => {
                        e.stopPropagation();
                        setOpenFiles(prev => {
                          const updated = prev.filter(f => f !== file);
                          if (currentFile === file) {
                            setCurrentFile(updated.length > 0 ? updated[updated.length - 1] : null);
                          }
                          return updated;
                        });
                      }}
                      style={{ cursor: 'pointer' }}
                    ></i>
                  </button>
                ))
              }
            </div>

            <div className="actions flex gap-2">
              <button
                onClick={async () => {
                  await webContainer.mount(fileTree)


                  const installProcess = await webContainer.spawn("npm", ["install"])

                  installProcess.output.pipeTo(new WritableStream({
                    write(chunk) {
                      // console.log(chunk)
                    }
                  }))

                  if (runProcess) {
                    runProcess.kill()
                  }

                  let tempRunProcess = await webContainer.spawn("npm", ["start"]);

                  tempRunProcess.output.pipeTo(new WritableStream({
                    write(chunk) {
                      // console.log(chunk)
                    }
                  }))

                  setRunProcess(tempRunProcess)

                  webContainer.on('server-ready', (port, url) => {
                    console.log(port, url)
                    setIframeUrl(url)
                  })

                }}
                className='run p-2 px-4   hover:scale-110 bg-gradient-to-r from-[#24CFA6] to-[#E0F2E2] rounded-xl m-2 text-black font-semibold active:scale-95'
              >
                Run
              </button>



            </div>
          </div>


          <div className="bottom flex flex-grow max-w-full shrink  overflow-auto">
            {
              (() => {
                const fileNode = getFileByPath(fileTree, currentFile);
                return fileNode?.file?.contents !== undefined && (
                  <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50">
                    <div className="code-editor-area h-full flex-grow">
                      <Editor
                        height="100%"
                        defaultLanguage="javascript"
                        theme="vs-dark"
                        value={fileNode.file.contents}
                        onChange={(value) => {
                          const parts = currentFile.split('/');
                          const newTree = { ...fileTree };
                          let node = newTree;

                          for (let i = 0; i < parts.length - 1; i++) {
                            node[parts[i]] = { ...node[parts[i]] };
                            node = node[parts[i]];
                          }

                          node[parts[parts.length - 1]] = {
                            file: { contents: value || "" }
                          };

                          setFileTree(newTree);
                          saveFileTree(newTree);
                        }}
                        options={{
                          automaticLayout: true,
                          fontSize: 16,
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          wordWrap: 'on',
                          autoClosingBrackets: "always",
                          autoClosingQuotes: "always",
                          matchBrackets: "always",
                          formatOnType: true,
                          formatOnPaste: true,
                        }}
                      />
                    </div>

                  </div>
                );
              })()
            }
          </div>

        </div>

        {iframeUrl && webContainer &&
          (<div className="flex min-w-96 flex-col h-full bg-[#000000] flex-shrink-0">
            <div className="address-bar">
              <input type="text"
                onChange={(e) => setIframeUrl(e.target.value)}
                value={iframeUrl} className="w-full p-2 px-4 bg-[#515254] border-2 my-1 border-zinc-500" />
            </div>
            <iframe src={iframeUrl}  allow="camera; microphone" className="w-full h-full bg-zinc-200 text-red-white "></iframe>
          </div>)
        }

      </section>

      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 shadow-lg bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#1a1a1a] p-4 rounded-md w-96 max-w-full relative">
            <header className="flex justify-between  text-white items-center mb-4">
              <h2 className="text-xl font-semibold">
                Select User
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 cursor-pointer"
              >
                <i className="ri-close-fill text-3xl"></i>
              </button>
            </header>
            <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user._id)}
                  className="cursor-pointer"
                >
                  <div
                    className={`p-[2px] rounded-xl transition ${Array.from(selectedUserId).includes(user._id)
                      ? 'bg-gradient-to-r from-[#24CFA6] to-[#E0F2E2]'
                      : 'hover:bg-gradient-to-r from-[#24CFA6] to-[#E0F2E2]'
                      }`}
                  >
                    <div
                      className={`rounded-xl p-2 flex gap-2 items-center ${Array.from(selectedUserId).includes(user._id)
                        ? 'bg-[#1a1a1a]'
                        : 'bg-[#1a1a1a]'
                        }`}
                    >
                      <div className="aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600">
                        <i className="ri-user-fill absolute"></i>
                      </div>
                      <h1 className="font-semibold text-lg text-white">
                        {user.userName}
                      </h1>
                    </div>
                  </div>
                </div>
              ))}

            </div>
            <button
              onClick={addCollaborators}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gradient-to-r from-[#24CFA6] to-[#E0F2E2] text-black font-semibold rounded-md active:scale-95 hover:scale-105"
            >
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default Project
