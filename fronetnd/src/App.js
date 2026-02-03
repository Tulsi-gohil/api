
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import GoogleSearch from "./GoogleSearch";
import ApiAccount from "./ApiAccount";
import StudentDetils from "./StudentDetils";
import Domin from "./Domin";
function App() {
  return(
    <>
    <Router>
      <Routes>
        <Route path="/GoogleSearch" element={<GoogleSearch />}/>
        <Route path="/ApiAccount" element={<ApiAccount />}/>
        <Route path="/StudentDetils" element={<StudentDetils />}/>
        <Route path="/" element={<Domin/>}/>
      </Routes>
    </Router>
    </>
  )
}
export default App;
