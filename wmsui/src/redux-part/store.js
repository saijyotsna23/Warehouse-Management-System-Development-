import { configureStore } from '@reduxjs/toolkit'
import loginReducer from './reducers/loginReducer'


export default configureStore({
  reducer: {
    loginReducer
  },
})