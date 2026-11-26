
// import React, { useState } from "react";
// import "../styles/Login.css";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);

//   const handleLogin = (e) => {
//     e.preventDefault();

//     // We will connect PHP authentication later.
//     console.log("Email:", email);
//     console.log("Password:", password);
//     console.log("Remember Me:", rememberMe);

//     alert("Login form submitted successfully!");
//   };

//   return (
//     <div className="login-page">
//       <div className="login-container">

//         {/* Left Section */}
//         <div className="login-left">

//           <div className="logo">
//             <div className="logo-box">EMS</div>
//             <span>Employee Management System</span>
//           </div>

//           <div className="welcome-content">
//             <h1>Welcome to Employee Management System</h1>

//             <p>
//               Manage your workforce efficiently.
//               Track employee details, attendance,
//               leave requests and reports in one place.
//             </p>

//             <div className="features">
//               <p>✓ Employee Management</p>
//               <p>✓ Attendance Tracking</p>
//               <p>✓ Leave Management</p>
//               <p>✓ Reports & Analytics</p>
//             </div>
//           </div>

//           <div className="copyright">
//             © 2026 Employee Management System
//           </div>

//         </div>

//         {/* Right Section */}
//         <div className="login-right">

//           <div className="login-form">

//             <div className="login-heading">
//               <h2>Admin Login</h2>
//               <p>Welcome back! Please login to continue.</p>
//             </div>

//             <form onSubmit={handleLogin}>

//               {/* Email */}
//               <div className="form-group">
//                 <label>Email Address</label>

//                 <input
//                   type="email"
//                   placeholder="Enter your email address"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//               </div>

//               {/* Password */}
//               <div className="form-group">
//                 <label>Password</label>

//                 <div className="password-input">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Enter your password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                   />

//                   <button
//                     type="button"
//                     className="toggle-password"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? "Hide" : "Show"}
//                   </button>
//                 </div>
//               </div>

//               {/* Remember Me */}
//               <div className="form-options">

//                 <label className="remember-me">
//                   <input
//                     type="checkbox"
//                     checked={rememberMe}
//                     onChange={(e) =>
//                       setRememberMe(e.target.checked)
//                     }
//                   />
//                   Remember Me
//                 </label>

//                 <a href="#forgot-password">
//                   Forgot Password?
//                 </a>

//               </div>

//               {/* Login Button */}
//               <button type="submit" className="login-button">
//                 Login
//               </button>

//             </form>

//             <div className="login-footer">
//               <p>Authorized Administrator Access Only</p>
//             </div>

//           </div>

//         </div>

//       </div>
//     </div>
//   );
// }

// export default Login;



import React, { useState } from "react";
import "../styles/Login.css";

function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    // We will connect PHP authentication later.
    console.log("User ID:", userId);
    console.log("Password:", password);
    console.log("Remember Me:", rememberMe);

    alert("Login form submitted successfully!");
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/* Left Section */}
        <div className="login-left">

          <div className="logo">
            <div className="logo-box">EMS</div>
            <span>Employee Management System</span>
          </div>

          <div className="welcome-content">
            <h1>Welcome to Employee Management System</h1>

            <p>
              Manage your workforce efficiently.
              Track employee details, attendance,
              leave requests and reports in one place.
            </p>

            <div className="features">
              <p>✓ Employee Management</p>
              <p>✓ Attendance Tracking</p>
              <p>✓ Leave Management</p>
              <p>✓ Reports & Analytics</p>
            </div>
          </div>

          <div className="copyright">
            © 2026 Employee Management System
          </div>

        </div>

        {/* Right Section */}
        <div className="login-right">

          <div className="login-form">

            <div className="login-heading">
              <h2>Admin Login</h2>
              <p>Welcome back! Please login to continue.</p>
            </div>

            <form onSubmit={handleLogin}>

              {/* User ID */}
              <div className="form-group">
                <label>User ID</label>

                <input
                  type="text"
                  placeholder="Enter your user ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="form-group">
                <label>Password</label>

                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="form-options">

                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
                  />
                  Remember Me
                </label>

                <a href="#forgot-password">
                  Forgot Password?
                </a>

              </div>

              {/* Login Button */}
              <button type="submit" className="login-button">
                Login
              </button>

            </form>

            <div className="login-footer">
              <p>Authorized Administrator Access Only</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;

