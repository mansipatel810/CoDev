import React from 'react'
import Approutes from './routes/Approutes'
import { UserProvider } from './context/user.context'


const App = () => {
  
  return (
    <UserProvider>
      <Approutes/>
    </UserProvider>
      
    
  )
}

export default App
