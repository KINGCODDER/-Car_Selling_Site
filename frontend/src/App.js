import { useContext, useEffect, lazy, Suspense } from "react";
import "./App.css";
import shopContext from "./Context/shopContext";
import "animate.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import io from "socket.io-client";

const NavBar = lazy(() => import("./Components/NavBar"));
const AppLoader = lazy(() => import("./Components/AppLoader"));
const Footer = lazy(() => import("./Components/Footer"));
const ChatSpace = lazy(() => import("./Components/Messages/ChatSpace"));
const Home = lazy(() => import("./Components/Home"));
const ProductPage = lazy(() => import("./Components/Product/ProductPage"));

let socket;

function App() {
  const location = useLocation();
  const context = useContext(shopContext);
  const {
    user,
    setSocket,
    setIsTyping,
    setSocketConnected,
    notification,
    setNotification,
    fetchAgain,
    setMessages,
    setFetchAgain,
    messages,
    selectedChat,
  } = context;

  useEffect(() => {
    socket = io(process.env.REACT_APP_SOCKET_URL);
    setSocket(socket);
    const userData = JSON.parse(localStorage.getItem("user"));
    socket.emit("setup", userData);

    socket.on("typing", () => {
      console.log("typing start");
      setIsTyping(true);
    });
    socket.on("stop-typing", () => setIsTyping(false));
    socket.on("connected", () => {
      console.log("socket connected");
      setSocketConnected(true);
    });
  }, []);

  useEffect(() => {
    socket.on("message-received", (newMessageReceived) => {
      if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
        setFetchAgain(!fetchAgain);
      } else {
        setFetchAgain(!fetchAgain);
        setMessages([...messages, newMessageReceived]);
      }
    });
  });

  return (
    <div className="App">
      <NavBar />
      <Suspense fallback={<AppLoader />}>
        <Routes>
          <Route element={<Home />} path="/"></Route>
          {user && <Route element={<ChatSpace />} path="/messages"></Route>}
          <Route path="/car-space" element={<ProductPage />} />
        </Routes>
        {location.pathname !== "/messages" && <Footer />}
        <Toaster position="bottom-right" reverseOrder={false} />
      </Suspense>
    </div>
  );
}

export default App;
