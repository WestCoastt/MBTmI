/* eslint no-restricted-globals: ["off"] */
import React, { useState, useEffect, useRef } from "react";
import { Button, Navbar, Container, Dropdown } from "react-bootstrap";
import { Route, Link } from "react-router-dom";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import "./App.css";
import Post from "./Post";
import Edit from "./Edit";
import CreateList from "./CreateList";
import Comments from "./Comments";
import Search from "./Search";
import Profile from "./Profile";
import UserInfo from "./UserInfo";
import Register from "./Register";
import { db } from "./index.js";
import {
  getAuth,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import ReactLoading from "react-loading";
import GoogleButton from "react-google-button";
import { FiSearch, FiMoreHorizontal } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { BsPencilSquare } from "react-icons/bs";

function App() {
  const uid = window.localStorage.getItem("uid");
  const [nickname, setNickname] = useState("");
  const history = useHistory();
  const [post, setPost] = useState([]);
  // const [signUp, setSignUP] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;
  const provider = new GoogleAuthProvider();
  // const getClose = (send) => {
  //   setSignUP(send);
  // };

  const [create, setCreate] = useState(false);

  const [lastVisible, setLastVisible] = useState(null);

  useEffect(() => {
    db.collection("post")
      .orderBy("timeStamp", "desc")
      .limit(20)
      .onSnapshot((snapshot) => {
        const postArr = snapshot.docs.map((doc) => ({
          data: doc.data(),
        }));
        setPost(postArr);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      });
  }, []);

  const [target, setTarget] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onIntersect = async ([entry], observer) => {
    if (entry.isIntersecting && !isLoading && post.length % 10 == 0) {
      observer.unobserve(entry.target);
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await db
        .collection("post")
        .orderBy("timeStamp", "desc")
        .startAfter(lastVisible)
        .limit(10)
        .onSnapshot((snapshot) => {
          const addArr = snapshot.docs.map((doc) => ({
            data: doc.data(),
          }));
          // console.log([...post, ...addArr]);
          setPost([...post, ...addArr]);
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        });
      setIsLoading(false);
      observer.observe(entry.target);
    }
  };

  useEffect(() => {
    let observer;
    if (target) {
      observer = new IntersectionObserver(onIntersect, {
        threshold: 0.7,
        rootMargin: "10px 0px",
      });
      observer.observe(target);
    }
    return () => observer && observer.disconnect();
  }, [lastVisible, target]);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.localStorage.setItem("uid", user.uid);
      // setSignUP(false);
      setCreate(true);
      db.collection("user-info")
        .doc(user.uid)
        .get()
        .then((result) => {
          setNickname(result.data().nickname);
          window.localStorage.setItem("nickname", result.data().nickname);
          window.localStorage.setItem("MBTI", result.data().MBTI);
        })
        .catch(() => {
          setNickname(null);
        });
    } else {
      setCreate(false);
      localStorage.clear();
    }
  });

  const LogOut = () => {
    signOut(auth)
      .then(() => {
        console.log("로그아웃됨");
        history.push("/");
        location.reload();
      })
      .catch(() => {
        console.log("로그아웃 실패");
      });
  };

  const LogIn = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  };

  return (
    <>
      <Route path="/register">
        <Register></Register>
      </Route>
      <div className="main">
        {/* {signUp && <SignUp getClose={getClose}></SignUp>} */}

        <Navbar
          style={{ minWidth: "360px" }}
          className="py-0"
          fixed="top"
          bg="dark"
          expand="lg"
        >
          <Container fluid className="px-2" style={{ width: "768px" }}>
            <Navbar.Brand className="text-light mx-0">
              <Link
                to="/"
                style={{ textDecoration: "none", color: "white" }}
                // onClick={() => {
                //   setCategory("전체글");
                // }}
              >
                MBT(m)I
              </Link>
            </Navbar.Brand>

            <div
              style={{ minWidth: "108px", display: "flex", margin: "8px 0" }}
            >
              {/* <div
              style={{
                margin: "auto",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "white",
                cursor: "pointer",
                lineHeight: "36px",
                textAlign: "center",
              }}
              onClick={() => {
                history.push("/search");
              }}
            >
              <FiSearch size="22"></FiSearch>
            </div> */}

              <Link
                style={{
                  margin: "auto",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "white",
                  color: "rgb(33, 37, 41)",
                  lineHeight: "36px",
                  textAlign: "center",
                }}
                to="/search"
              >
                <FiSearch size="22"></FiSearch>
              </Link>

              {uid != null ? (
                <Dropdown>
                  <Dropdown.Toggle
                    size="sm"
                    variant="light"
                    style={{ lineHeight: "20px" }}
                    className="shadow-none rounded-pill px-1 mx-1"
                  >
                    <FiMoreHorizontal size="28"></FiMoreHorizontal>
                  </Dropdown.Toggle>

                  <Dropdown.Menu align="end" variant="light">
                    {nickname == "" ? (
                      <div
                        style={{
                          height: "30px",
                          marginBottom: "8px",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <ReactLoading
                          type="spin"
                          color="#0d6efd"
                          width="24px"
                        ></ReactLoading>
                      </div>
                    ) : (
                      <Dropdown.Item
                        as={Link}
                        to={
                          nickname != null ? `${nickname}` : `/user?uid=${uid}`
                        }
                        style={{
                          display: "flex",
                        }}
                      >
                        <FaUserCircle size="44" color="#a0aec0"></FaUserCircle>
                        <div
                          style={{
                            fontSize: "16px",
                            display: "flex",
                            margin: "0 15px",
                            flexDirection: "column",
                          }}
                        >
                          <span>{nickname != null && nickname}</span>
                          {nickname != null ? (
                            <span style={{ color: "#777777" }}>
                              프로필 보기
                            </span>
                          ) : (
                            <span style={{ color: "#777777" }}>
                              프로필 설정하기
                            </span>
                          )}
                        </div>
                      </Dropdown.Item>
                    )}

                    <Dropdown.Item
                      onClick={() => {
                        LogOut();
                      }}
                    >
                      로그아웃
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <div style={{ padding: "2px 0", lineHeight: "32px" }}>
                  <Button
                    className="rounded-pill mx-1"
                    variant="light"
                    size="sm"
                    onClick={() => {
                      LogIn();
                    }}
                  >
                    로그인
                  </Button>
                  <Button
                    className="rounded-pill mx-1"
                    variant="outline-light"
                    size="sm"
                    onClick={() => {
                      // setSignUP(true);
                      history.push("/register");
                    }}
                  >
                    가입하기
                  </Button>
                </div>
              )}
            </div>
          </Container>
        </Navbar>

        {post.length == 0 ? (
          <div
            style={{
              marginTop: "80px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <ReactLoading
              type="spin"
              color="#0d6efd"
              width="32px"
            ></ReactLoading>
          </div>
        ) : (
          <div className="board">
            <Route exact path="/">
              {create && (
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-circle"
                  style={{
                    bottom: "15px",
                    marginRight: "15px",
                    width: "50px",
                    height: "50px",
                    position: "fixed",
                    zIndex: "10",
                    lineHeight: "18px",
                  }}
                  onClick={() => {
                    history.push("/post");
                  }}
                >
                  <BsPencilSquare size="20"></BsPencilSquare>
                </Button>
              )}

              {post.map((a, i) => (
                <CreateList
                  // key={i}
                  key={a.data.docId}
                  // post={post}
                  category={a.data.category}
                  title={a.data.title}
                  content={a.data.content}
                  uid={a.data.uid}
                  docId={a.data.docId}
                  nickname={a.data.nickname}
                  timestamp={a.data.timeStamp.seconds}
                  mbti={a.data.mbti}
                ></CreateList>
              ))}
              {isLoading && (
                <div
                  style={{
                    width: "100%",
                    height: "100px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ReactLoading
                    type="spin"
                    color="#0d6efd"
                    width="36px"
                  ></ReactLoading>
                </div>
              )}

              <div ref={setTarget}></div>
            </Route>
            <Route path="/post">
              <Post></Post>
            </Route>
            <Route path="/edit">
              <Edit></Edit>
            </Route>

            <Route path="/search">
              <Search create={create}></Search>
            </Route>
            {user && (
              <Route path="/user">
                <UserInfo></UserInfo>
              </Route>
            )}
            {nickname && (
              <Route path={`/${nickname}/`}>
                <Profile></Profile>
              </Route>
            )}
            <Route path="/comments">
              <Comments></Comments>
            </Route>

            {/* <Route path="*">
          <div>페이지를 찾을 수 없습니다.(수정)</div>
        </Route> */}
          </div>
        )}
      </div>
    </>
  );
}

// const SignUp = (props) => {
//   const history = useHistory();
//   const auth = getAuth();
//   const user = auth.currentUser;
//   const provider = new GoogleAuthProvider();
//   const sendClose = () => {
//     props.getClose();
//   };

//   return (
//     <div
//       style={{
//         position: "fixed",
//         width: "100%",
//         height: "100%",
//         maxWidth: "768px",
//         maxHeight: "1000px",
//         zIndex: "9",
//         backgroundColor: "rgba(0,0,0, .4)",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//       }}
//     >
//       <div
//         style={{
//           position: "relative",
//           width: "384px",
//           height: "500px",
//           backgroundColor: "white",
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           justifyContent: "center",
//           borderRadius: "8px",
//         }}
//       >
//         <Button
//           style={{ position: "absolute", right: "10px", top: "10px" }}
//           variant="outline-dark"
//           size="sm"
//           onClick={() => {
//             sendClose(false);
//           }}
//         >
//           X
//         </Button>
//         <GoogleButton
//           onClick={() => {
//             signInWithPopup(auth, provider)
//               .then((result) => {
//                 // This gives you a Google Access Token. You can use it to access the Google API.
//                 const credential = GoogleAuthProvider.credentialFromResult(
//                   result
//                 );
//                 const token = credential.accessToken;
//                 // The signed-in user info.
//                 const user = result.user;
//                 // ...
//                 {
//                   props.nickname != null &&
//                     // history.push("/user?uid=" + user.uid);
//                     (window.location.href = `/user?uid=${user.uid}`);
//                 }
//               })
//               .catch((error) => {
//                 // Handle Errors here.
//                 const errorCode = error.code;
//                 const errorMessage = error.message;
//                 // The email of the user's account used.
//                 const email = error.email;
//                 // The AuthCredential type that was used.
//                 const credential = GoogleAuthProvider.credentialFromError(
//                   error
//                 );
//                 // ...
//               });
//           }}
//         >
//           GOOGLE로 계속하기
//         </GoogleButton>
//       </div>
//     </div>
//   );
// };

export default App;
