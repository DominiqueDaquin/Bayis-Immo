import { Provider } from "@/components/ui/provider"
import React from "react"
import ReactDOM from "react-dom/client"
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from "./App"

const googleId = import.meta.env.VITE_GOOGLE_CLIENT_ID

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleId}>
      <Provider>
        <App />
      </Provider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)