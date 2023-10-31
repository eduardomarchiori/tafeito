import './App.css';
import React, { ReactNode, useState } from 'react';
import AuthProvider from './provider/authProvider';
import Routes from './routes';
import { SnackbarProvider } from "notistack";
import { MyGlobalContext } from "./utils/global";
import { useStateWithRef } from './utils/hooks';

function App() {

  const [ isEditingTask, setIsEditingTask ] = useState<boolean>(false);
  const [ selectedTaskInput, setSelectedTaskInput ] = useState<string | null>(null);
  const [ refetchTaskStatus, setRefetchTaskStatus ] = useState<number>(0);
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ softDeletedTasks, setSoftDeletedTasks, softDeletedTasksRef] = useStateWithRef([]);

  return (
    <div className="App">
      <AuthProvider>
        <SnackbarProvider maxSnack={3}>
          {/* <MyGlobalContext.Provider value={{
            isEditingTask, setIsEditingTask, 
            selectedTaskInput, setSelectedTaskInput, 
            refetchTaskStatus, setRefetchTaskStatus, 
            isLoading, setIsLoading
            }}> */}
          <MyGlobalContext.Provider
            value={{
              isEditingTask,
              setIsEditingTask,
              selectedTaskInput,
              setSelectedTaskInput,
              refetchTaskStatus,
              setRefetchTaskStatus,
              isLoading,
              setIsLoading,
              softDeletedTasks,
              setSoftDeletedTasks,
              softDeletedTasksRef,
            }}
          >
            <Routes />
          </MyGlobalContext.Provider>
        </SnackbarProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
